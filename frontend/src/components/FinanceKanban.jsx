import { useState } from 'react';
import { KanbanHeader } from './KanbanHeader';
import { BillsPool } from './BillsPool';
import { KanbanBoard } from './KanbanBoard';
import { HousingChangeModal } from './HousingChangeModal';
import { defaultFinanceConfig } from '../config/financeConfig';
import { housingOptions, difficultyOptions } from '../config/scenarioConfig';

const HOUSING_CHANGE_FEE = 200;

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

    const [financeState, setFinanceState] = useState(() => {
        const normalizedTasks = initialTasks.map((task) => ({
            ...task,
            assignedBills: task.assignedBills ? [...task.assignedBills] : [],
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
        };
    });
    const [scenarioSummary, setScenarioSummary] = useState(summary);
    const [showHousingModal, setShowHousingModal] = useState(false);
    const [rentSurcharge, setRentSurcharge] = useState(0);

    const {
        currentWeek,
        availableAmount,
        tasks,
        creditRemaining,
        creditLimit: creditCap,
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
            if (!targetTask) {
                return prev;
            }

            if (billType === 'cash') {
                if (prev.availableAmount < billValue) {
                    return prev;
                }

                const cashBill = {
                    id: `${taskId}-cash-${Date.now()}-${Math.random()}`,
                    value: billValue,
                    type: 'cash',
                };

                const updatedTasks = prev.tasks.map((task) =>
                    task.id === taskId
                        ? { ...task, assignedBills: [...task.assignedBills, cashBill] }
                        : task
                );

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

            const updatedTasks = prev.tasks.map((task) =>
                task.id === taskId
                    ? { ...task, assignedBills: [...task.assignedBills, creditBill] }
                    : task
            );

            return {
                ...prev,
                tasks: updatedTasks,
                creditRemaining: creditRemaining - appliedValue,
            };
        });
    };

    const removeBillFromTask = (billId, taskId) => {
        setFinanceState((prev) => {
            let refundCash = 0;
            let refundCredit = 0;
            let billRemoved = false;

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

                return { ...task, assignedBills: filteredBills };
            });

            if (!billRemoved) {
                return prev;
            }

            const creditCap = prev.creditLimit ?? Number.POSITIVE_INFINITY;
            const nextCreditRemaining = Math.min(
                creditCap,
                (prev.creditRemaining ?? 0) + refundCredit
            );

            return {
                ...prev,
                tasks: updatedTasks,
                availableAmount: prev.availableAmount + refundCash,
                creditRemaining: nextCreditRemaining,
            };
        });
    };

    const openHousingModal = () => setShowHousingModal(true);
    const closeHousingModal = () => setShowHousingModal(false);

    const applyHousingChange = (newHousingKey) => {
        const housing = housingOptions[newHousingKey];
        if (!housing) {
            closeHousingModal();
            return;
        }

        const nextSurcharge = rentSurcharge + HOUSING_CHANGE_FEE;

        setRentSurcharge(nextSurcharge);

        setFinanceState((prev) => {
            const updatedTasks = prev.tasks.map((task) => {
                const isRentTask = task.category === 'rent' || task.id === 'T1';
                if (!isRentTask) return task;
                return {
                    ...task,
                    amount: housing.rent + nextSurcharge,
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
            const prevPeriod = Math.floor((prev.roundIndex ?? 0) / 2);
            const nextPeriod = Math.floor(nextRoundIndex / 2);

            let updatedTasks = prev.tasks;

            if (nextPeriod !== prevPeriod) {
                const baseRent =
                    scenarioSummary?.rentAmount ??
                    updatedTasks.find((task) => task.category === 'rent' || task.id === 'T1')
                        ?.amount ??
                    0;

                setRentSurcharge(0);

                updatedTasks = prev.tasks.map((task) => {
                    const isRentTask = task.category === 'rent' || task.id === 'T1';
                    if (!isRentTask) return task;
                    return {
                        ...task,
                        amount: baseRent,
                    };
                });
            }

            return {
                ...prev,
                currentWeek: prev.currentWeek + 2,
                availableAmount: prev.availableAmount + paycheckAmount,
                roundIndex: nextRoundIndex,
                tasks: updatedTasks,
            };
        });
    };

    const safeCreditRemaining = Math.max(creditRemaining ?? 0, 0);
    const billsForDisplay = availableBills.map((bill) =>
        bill.type === 'credit' ? { ...bill, value: safeCreditRemaining } : bill
    );

    return (
        <div className="h-screen flex flex-col">
            <KanbanHeader
                currentWeek={currentWeek}
                availableAmount={availableAmount}
                creditRemaining={creditRemaining}
                creditLimit={creditCap}
                scenarioSummary={scenarioSummary}
                onAdvanceWeek={advanceWeek}
            />

            <BillsPool
                bills={billsForDisplay}
                availableAmount={availableAmount}
                creditRemaining={creditRemaining}
            />

            <KanbanBoard
                tasks={tasks}
                onMoveTask={moveTask}
                onAssignBill={assignBillToTask}
                onRemoveBill={removeBillFromTask}
                onChangeHousing={openHousingModal}
                housingChangeFee={HOUSING_CHANGE_FEE}
            />

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
