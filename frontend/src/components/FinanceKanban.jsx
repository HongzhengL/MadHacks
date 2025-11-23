import { useState } from 'react';
import { KanbanHeader } from './KanbanHeader';
import { BillsPool } from './BillsPool';
import { KanbanBoard } from './KanbanBoard';
import { HousingChangeModal } from './HousingChangeModal';
import { defaultFinanceConfig } from '../config/financeConfig';
import { housingOptions, difficultyOptions } from '../config/scenarioConfig';
import { randomTaskRules, randomTaskState } from '../config/randomEvents';

const HOUSING_CHANGE_FEE = 200;
const CREDIT_INTEREST_RATE = 0.02;
const LATE_FEE = 25;
const MAX_CREDIT_SCORE = 850;
const MIN_CREDIT_SCORE = 300;
const SAVINGS_INTEREST_RATE = 0.003; // 0.3% per round
const INVESTMENT_MIN_RETURN = -0.05;
const INVESTMENT_MAX_RETURN = 0.08;
const DEBT_WITHDRAW_CHUNK = 200;

export function FinanceKanban({ config, summary }) {
    const resolvedConfig = config ?? defaultFinanceConfig;
    const {
        initialWeek = 1,
        paycheckAmount = 500,
        startingBalance,
        creditLimit,
        tasks: initialTasks = [],
        bills: initialBills = [],
    } = resolvedConfig;

    const derivedCreditLimit =
        creditLimit ?? initialBills.find((bill) => bill.type === 'credit')?.value ?? 0;

    const getIsActiveForPeriod = (task, period) => {
        if (task.category === 'savings' || task.category === 'debt') {
            return true;
        }

        if (task.frequency === 2) {
            return period % 2 === 0;
        }

        if (task.frequency === -1) {
            const rule = randomTaskRules[task.id] ?? randomTaskRules.default;
            const probability = rule?.probability ?? 0.5;
            const maxPerYear = rule?.maxPerYear;

            if (maxPerYear && randomTaskState.counts[task.id] >= maxPerYear) {
                return false;
            }

            const isActive = Math.random() < probability;
            if (isActive) {
                randomTaskState.counts[task.id] = (randomTaskState.counts[task.id] ?? 0) + 1;
            }
            return isActive;
        }

        return true;
    };

    const [financeState, setFinanceState] = useState(() => {
        const initialPeriod = 0;
        const normalizedTasks = initialTasks.map((task) => ({
            ...task,
            assignedBills: task.assignedBills ? [...task.assignedBills] : [],
            isActive: getIsActiveForPeriod(task, initialPeriod),
            accountBalance: task.accountBalance ?? 0,
        }));

        const initialCreditUsed = normalizedTasks.reduce((sum, task) => {
            const taskCredit = task.assignedBills
                .filter((bill) => bill.type === 'credit')
                .reduce((subSum, bill) => subSum + bill.value, 0);
            return sum + taskCredit;
        }, 0);

        const startingCreditRemaining = Math.max(derivedCreditLimit - initialCreditUsed, 0);

        return {
            currentWeek: initialWeek,
            availableAmount: startingBalance ?? paycheckAmount,
            creditLimit: derivedCreditLimit,
            creditRemaining: startingCreditRemaining,
            tasks: normalizedTasks,
            roundIndex: 0,
            savingsBalance:
                normalizedTasks.find((t) => t.category === 'savings')?.accountBalance ?? 0,
            investmentBalance: 0,
        };
    });
    const [scenarioSummary, setScenarioSummary] = useState(summary);
    const [showHousingModal, setShowHousingModal] = useState(false);
    const [rentSurcharge, setRentSurcharge] = useState(0);
    const [periodBaseHousingKey, setPeriodBaseHousingKey] = useState(summary?.housingKey);
    const [qualityOfLife, setQualityOfLife] = useState(summary?.qolBaseline ?? 60);
    const [debt, setDebt] = useState(summary?.startingDebt ?? 0);
    const [creditScore, setCreditScore] = useState(summary?.creditScore ?? 680);
    const [lastRoundSummary, setLastRoundSummary] = useState(null);

    const {
        currentWeek,
        availableAmount,
        tasks,
        creditRemaining,
        creditLimit: creditCap,
        savingsBalance,
        investmentBalance,
    } = financeState;

    const [availableBills] = useState(() =>
        initialBills.map((bill) =>
            bill.type === 'credit' ? { ...bill, value: derivedCreditLimit } : { ...bill }
        )
    );

    const moveTask = (taskId, newStatus) => {
        setFinanceState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ),
        }));
    };

    const assignBillToTask = (billValue, billType, taskId) => {
        setFinanceState((prev) => {
            const targetTask = prev.tasks.find((task) => task.id === taskId);
            if (!targetTask || targetTask.isActive === false) {
                return prev;
            }
            const currentPeriod = prev.roundIndex ?? 0;

            if (billType === 'cash') {
                if (prev.availableAmount < billValue) {
                    return prev;
                }

                const cashBill = {
                    id: `${taskId}-cash-${Date.now()}-${Math.random()}`,
                    value: billValue,
                    type: 'cash',
                };

                const updatedTasks = prev.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    const nextAssigned = [...task.assignedBills, cashBill];
                    const total = nextAssigned.reduce((sum, bill) => sum + bill.value, 0);
                    const paid = total >= task.amount;
                    return {
                        ...task,
                        assignedBills: nextAssigned,
                        lastPaidPeriod: paid ? currentPeriod : undefined,
                    };
                });

                return {
                    ...prev,
                    tasks: updatedTasks,
                    availableAmount: prev.availableAmount - billValue,
                };
            }

            if (targetTask.category === 'savings') {
                const updatedTasks = prev.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    const nextAssigned = [
                        ...task.assignedBills,
                        {
                            id: `${taskId}-save-${Date.now()}-${Math.random()}`,
                            value: billValue,
                            type: 'cash',
                        },
                    ];
                    const nextBalance = (task.accountBalance ?? 0) + billValue;
                    return {
                        ...task,
                        assignedBills: nextAssigned,
                        accountBalance: nextBalance,
                    };
                });

                return {
                    ...prev,
                    tasks: updatedTasks,
                    availableAmount: prev.availableAmount - billValue,
                    savingsBalance: prev.savingsBalance + billValue,
                };
            }

            if (targetTask.category === 'debt') {
                const payAmount = Math.min(billValue, debt);
                setDebt((d) => Math.max(0, d - payAmount));

                const updatedTasks = prev.tasks.map((task) => {
                    if (task.id !== taskId) return task;
                    const nextAssigned = [
                        ...task.assignedBills,
                        {
                            id: `${taskId}-debt-${Date.now()}-${Math.random()}`,
                            value: billValue,
                            type: 'cash',
                        },
                    ];
                    return {
                        ...task,
                        assignedBills: nextAssigned,
                    };
                });

                return {
                    ...prev,
                    tasks: updatedTasks,
                    availableAmount: prev.availableAmount - billValue,
                };
            }

            const creditRemaining = prev.creditRemaining ?? 0;
            const hasCreditAlready = targetTask.assignedBills.some(
                (bill) => bill.type === 'credit'
            );
            if (hasCreditAlready || creditRemaining <= 0) {
                return prev;
            }

            const alreadyPaid = targetTask.assignedBills.reduce((sum, bill) => sum + bill.value, 0);
            const remainingNeed = Math.max(targetTask.amount - alreadyPaid, 0);
            if (remainingNeed <= 0) {
                return prev;
            }

            const appliedValue = Math.min(creditRemaining, remainingNeed);
            if (appliedValue <= 0) {
                return prev;
            }

            const creditBill = {
                id: `${taskId}-credit-${Date.now()}-${Math.random()}`,
                value: appliedValue,
                type: 'credit',
            };

            const updatedTasks = prev.tasks.map((task) => {
                if (task.id !== taskId) return task;
                const nextAssigned = [...task.assignedBills, creditBill];
                const total = nextAssigned.reduce((sum, bill) => sum + bill.value, 0);
                const paid = total >= task.amount;
                return {
                    ...task,
                    assignedBills: nextAssigned,
                    lastPaidPeriod: paid ? currentPeriod : undefined,
                };
            });

            return {
                ...prev,
                tasks: updatedTasks,
                creditRemaining: creditRemaining - appliedValue,
                availableAmount: prev.availableAmount - appliedValue,
            };
        });
    };

    const removeBillFromTask = (billId, taskId) => {
        setFinanceState((prev) => {
            let refundCash = 0;
            let refundCredit = 0;
            let billRemoved = false;

            const currentPeriod = prev.roundIndex ?? 0;

            const updatedTasks = prev.tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                const filteredBills = task.assignedBills.filter((bill) => {
                    if (bill.id !== billId) {
                        return true;
                    }

                    billRemoved = true;
                    if (bill.type === 'cash') {
                        refundCash += bill.value;
                    }
                    if (bill.type === 'credit') {
                        refundCredit += bill.value;
                    }
                    return false;
                });

                if (!billRemoved) {
                    return task;
                }

                const total = filteredBills.reduce((sum, bill) => sum + bill.value, 0);
                const paid = total >= task.amount;

                return {
                    ...task,
                    assignedBills: filteredBills,
                    lastPaidPeriod: paid ? currentPeriod : undefined,
                    accountBalance: task.category === 'savings' ? total : task.accountBalance,
                };
            });

            if (!billRemoved) {
                return prev;
            }

            const creditCap = prev.creditLimit ?? Number.POSITIVE_INFINITY;
            const nextCreditRemaining = Math.min(
                creditCap,
                (prev.creditRemaining ?? 0) + refundCredit
            );

            const updatedSavingsTask = updatedTasks.find(
                (task) => task.id === taskId && task.category === 'savings'
            );
            const nextSavingsBalance =
                updatedSavingsTask && updatedSavingsTask.accountBalance !== undefined
                    ? Math.round(updatedSavingsTask.accountBalance)
                    : prev.savingsBalance;

            return {
                ...prev,
                tasks: updatedTasks,
                availableAmount: prev.availableAmount + refundCash,
                creditRemaining: nextCreditRemaining,
                savingsBalance: nextSavingsBalance,
            };
        });
    };

    const openHousingModal = () => setShowHousingModal(true);
    const closeHousingModal = () => setShowHousingModal(false);
    const withdrawFromSavings = (taskId) => {
        setFinanceState((prev) => {
            const target = prev.tasks.find((task) => task.id === taskId);
            const balance = target?.accountBalance ?? 0;
            if (!target || balance <= 0) {
                return prev;
            }

            const updatedTasks = prev.tasks.map((task) =>
                task.id === taskId ? { ...task, accountBalance: 0, assignedBills: [] } : task
            );

            return {
                ...prev,
                tasks: updatedTasks,
                availableAmount: prev.availableAmount + balance,
                savingsBalance: 0,
            };
        });
    };

    const borrowFromDebt = () => {
        setDebt((d) => d + DEBT_WITHDRAW_CHUNK);
        setFinanceState((prev) => ({
            ...prev,
            availableAmount: prev.availableAmount + DEBT_WITHDRAW_CHUNK,
        }));
    };

    const applyHousingChange = (newHousingKey) => {
        const housing = housingOptions[newHousingKey];
        if (!housing) {
            closeHousingModal();
            return;
        }

        const revertingToPeriodBase = newHousingKey === periodBaseHousingKey;
        const appliedSurcharge = revertingToPeriodBase ? 0 : HOUSING_CHANGE_FEE;

        setRentSurcharge(appliedSurcharge);

        setFinanceState((prev) => {
            const updatedTasks = prev.tasks.map((task) => {
                const isRentTask = task.category === 'rent' || task.id === 'T1';
                if (!isRentTask) return task;
                return {
                    ...task,
                    amount: housing.rent + appliedSurcharge,
                    title: `Rent (${housing.label})`,
                };
            });

            return {
                ...prev,
                tasks: updatedTasks,
            };
        });

        setScenarioSummary((prevSummary) => {
            const difficultyKey = prevSummary?.difficultyKey ?? summary?.difficultyKey ?? 'medium';
            const difficulty = difficultyOptions[difficultyKey] ?? difficultyOptions.medium;
            const monthlyTakeHome =
                prevSummary?.monthlyTakeHome ??
                summary?.monthlyTakeHome ??
                difficulty.monthlyTakeHome;
            const rentPercentage = Math.round((housing.rent / monthlyTakeHome) * 100);

            return {
                ...(prevSummary ?? {}),
                difficultyKey,
                housingKey: housing.key,
                housingLabel: housing.label,
                rentAmount: housing.rent,
                rentPercentage,
                qolBaseline: difficulty.qualityOfLife + housing.qolDelta,
                housingDescription: housing.description,
            };
        });

        closeHousingModal();
    };

    const advanceWeek = () => {
        setFinanceState((prev) => {
            const nextRoundIndex = (prev.roundIndex ?? 0) + 1;
            const nextPeriod = nextRoundIndex;

            // Settlement: evaluate tasks before reset
            const settlement = prev.tasks.reduce(
                (acc, task) => {
                    if (task.category === 'savings' || task.category === 'debt') {
                        return acc;
                    }
                    const totalPaid = task.assignedBills.reduce((sum, bill) => sum + bill.value, 0);
                    const isPaid = totalPaid >= task.amount;
                    const isFixed = task.status === 'fixed';
                    const isVariable = task.status === 'variable';
                    const isGoal = task.status === 'goal';
                    const isOpportunity = task.status === 'opportunity';

                    if (isPaid) {
                        if (isFixed) acc.paidFixed += 1;
                        if (isVariable) acc.paidVariable += 1;
                        if (isGoal || isOpportunity) acc.paidGoals += 1;
                    } else {
                        if (isFixed) acc.unpaidFixed += 1;
                        if (isVariable) acc.unpaidVariable += 1;
                    }
                    acc.spent += totalPaid;
                    return acc;
                },
                {
                    paidFixed: 0,
                    unpaidFixed: 0,
                    paidVariable: 0,
                    unpaidVariable: 0,
                    paidGoals: 0,
                    spent: 0,
                }
            );

            // QoL changes
            const qolDelta =
                settlement.paidGoals * 2 +
                settlement.paidVariable * 1 -
                settlement.unpaidFixed * 5 -
                settlement.unpaidVariable * 3;

            // Debt / credit score changes
            const outstandingCredit = (prev.creditLimit ?? 0) - (prev.creditRemaining ?? 0);
            const debtDelta =
                outstandingCredit * CREDIT_INTEREST_RATE + settlement.unpaidFixed * LATE_FEE;
            const nextDebt = Math.max(0, debt + debtDelta);
            const nextCreditScore = Math.min(
                MAX_CREDIT_SCORE,
                Math.max(
                    MIN_CREDIT_SCORE,
                    creditScore -
                        settlement.unpaidFixed * 10 -
                        settlement.unpaidVariable * 5 +
                        (settlement.unpaidFixed === 0 && settlement.unpaidVariable === 0 ? 2 : 0)
                )
            );

            const nextQuality = Math.max(0, qualityOfLife + qolDelta);

            // Savings/Investments growth
            const savingsInterest = prev.savingsBalance * SAVINGS_INTEREST_RATE;
            const investmentReturnRate =
                Math.random() * (INVESTMENT_MAX_RETURN - INVESTMENT_MIN_RETURN) +
                INVESTMENT_MIN_RETURN;
            const investmentDelta = prev.investmentBalance * investmentReturnRate;
            const leftoverToSavings = Math.max(prev.availableAmount, 0);
            const nextSavingsBalance = prev.savingsBalance + savingsInterest + leftoverToSavings;
            const nextInvestmentBalance = prev.investmentBalance + investmentDelta;

            const rentTask = prev.tasks.find(
                (task) => task.category === 'rent' || task.id === 'T1'
            );
            const baseRent =
                scenarioSummary?.rentAmount ??
                (rentTask ? Math.max(rentTask.amount - rentSurcharge, 0) : 0);

            setRentSurcharge(0);
            setPeriodBaseHousingKey(scenarioSummary?.housingKey ?? periodBaseHousingKey);
            setQualityOfLife(nextQuality);
            setDebt(nextDebt);
            setCreditScore(nextCreditScore);
            setLastRoundSummary({
                paidFixed: settlement.paidFixed,
                unpaidFixed: settlement.unpaidFixed,
                paidVariable: settlement.paidVariable,
                unpaidVariable: settlement.unpaidVariable,
                paidGoals: settlement.paidGoals,
                qolDelta,
                debtDelta: Math.round(debtDelta),
                creditScoreAfter: nextCreditScore,
                savingsInterest: Math.round(savingsInterest),
                investmentDelta: Math.round(investmentDelta),
                status:
                    nextQuality <= 0
                        ? 'Defeat: QoL collapsed'
                        : nextDebt >= (scenarioSummary?.monthlyTakeHome ?? 0) * 12
                          ? 'Defeat: Debt exceeded annual salary'
                          : null,
            });

            let updatedTasks = prev.tasks.map((task) => {
                const isRentTask = task.category === 'rent' || task.id === 'T1';
                const nextIsActive = getIsActiveForPeriod(task, nextPeriod);

                if (task.category === 'savings') {
                    return {
                        ...task,
                        isActive: true,
                        accountBalance: nextSavingsBalance,
                        assignedBills: [],
                        lastPaidPeriod: undefined,
                    };
                }

                if (task.category === 'debt') {
                    return {
                        ...task,
                        isActive: true,
                        assignedBills: [],
                        lastPaidPeriod: undefined,
                    };
                }

                const baseUpdate = {
                    ...task,
                    isActive: nextIsActive,
                    assignedBills: [],
                    lastPaidPeriod: undefined,
                };

                if (isRentTask) {
                    return {
                        ...baseUpdate,
                        amount: baseRent,
                    };
                }

                return baseUpdate;
            });

            return {
                ...prev,
                currentWeek: prev.currentWeek + 2,
                availableAmount: paycheckAmount,
                roundIndex: nextRoundIndex,
                tasks: updatedTasks,
                savingsBalance: Math.round(nextSavingsBalance),
                investmentBalance: nextInvestmentBalance,
            };
        });
    };

    const safeCreditRemaining = Math.max(creditRemaining ?? 0, 0);
    const billsForDisplay = availableBills.map((bill) =>
        bill.type === 'credit' ? { ...bill, value: safeCreditRemaining } : bill
    );
    const activeTasks = tasks.filter((task) => task.isActive !== false);

    return (
        <div className="h-screen flex flex-col">
            <KanbanHeader
                currentWeek={currentWeek}
                availableAmount={availableAmount}
                creditRemaining={creditRemaining}
                creditLimit={creditCap}
                scenarioSummary={scenarioSummary}
                qualityOfLife={qualityOfLife}
                debt={debt}
                creditScore={creditScore}
                savingsBalance={savingsBalance}
                investmentBalance={investmentBalance}
                onAdvanceWeek={advanceWeek}
            />

            <BillsPool
                bills={billsForDisplay}
                availableAmount={availableAmount}
                creditRemaining={creditRemaining}
            />

            <KanbanBoard
                tasks={activeTasks}
                onMoveTask={moveTask}
                onAssignBill={assignBillToTask}
                onRemoveBill={removeBillFromTask}
                onChangeHousing={openHousingModal}
                rentSurcharge={rentSurcharge}
                baseRent={scenarioSummary?.rentAmount}
                onWithdrawSavings={withdrawFromSavings}
                onBorrowDebt={borrowFromDebt}
            />

            {lastRoundSummary ? (
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-800">
                        <div className="font-semibold text-gray-900">Last Round Summary</div>
                        <div>Paid fixed: {lastRoundSummary.paidFixed}</div>
                        <div>Missed fixed: {lastRoundSummary.unpaidFixed}</div>
                        <div>Paid variable: {lastRoundSummary.paidVariable}</div>
                        <div>Missed variable: {lastRoundSummary.unpaidVariable}</div>
                        <div>QoL Δ: {lastRoundSummary.qolDelta}</div>
                        <div>Debt Δ: ${lastRoundSummary.debtDelta}</div>
                        <div>Credit score: {lastRoundSummary.creditScoreAfter}</div>
                        <div>Savings interest: ${lastRoundSummary.savingsInterest}</div>
                        <div>Investment return: ${lastRoundSummary.investmentDelta}</div>
                    </div>
                    {lastRoundSummary.status ? (
                        <div className="mt-2 text-sm text-red-600 font-semibold">
                            {lastRoundSummary.status}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {showHousingModal ? (
                <HousingChangeModal
                    isOpen
                    currentHousingKey={scenarioSummary?.housingKey}
                    monthlyTakeHome={scenarioSummary?.monthlyTakeHome}
                    onConfirm={applyHousingChange}
                    onClose={closeHousingModal}
                />
            ) : null}
        </div>
    );
}
