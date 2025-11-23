import { useState } from 'react';
import { KanbanHeader } from './KanbanHeader';
import { BillsPool } from './BillsPool';
import { KanbanBoard } from './KanbanBoard';

const PAYCHECK_AMOUNT = 500; // TODO: Should be configurable

export function FinanceKanban() {
    const [financeState, setFinanceState] = useState({
        currentWeek: 1,
        availableAmount: PAYCHECK_AMOUNT,
        tasks: [
            {
                id: 'T1',
                title: 'Rent Payment',
                amount: 100,
                dueWeek: 3,
                assignedBills: [],
                status: 'fixed',
            },
            {
                id: 'T2',
                title: 'Utilities',
                amount: 50,
                dueWeek: 2,
                assignedBills: [],
                status: 'fixed',
            },
            {
                id: 'T3',
                title: 'Groceries',
                amount: 80,
                dueWeek: 1,
                assignedBills: [],
                status: 'variable',
            },
            {
                id: 'T4',
                title: 'Internet Bill',
                amount: 60,
                dueWeek: 2,
                assignedBills: [],
                status: 'fixed',
            },
            {
                id: 'T5',
                title: 'Phone Bill',
                amount: 40,
                dueWeek: 1,
                assignedBills: [],
                status: 'fixed',
            },
        ],
    });

    const { currentWeek, availableAmount, tasks } = financeState;

    const [availableBills] = useState([
        { id: 'b1', value: 100, type: 'cash' },
        { id: 'b2', value: 50, type: 'cash' },
        { id: 'b3', value: 10, type: 'cash' },
        { id: 'b4', value: 1, type: 'cash' },
        { id: 'cc1', value: 500, type: 'credit' },
    ]);

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
            if (billType === 'cash' && prev.availableAmount < billValue) {
                return prev;
            }

            let taskFound = false;
            const newBill = {
                id: `${taskId}-${Date.now()}-${Math.random()}`,
                value: billValue,
                type: billType,
            };

            const updatedTasks = prev.tasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                taskFound = true;
                return { ...task, assignedBills: [...task.assignedBills, newBill] };
            });

            if (!taskFound) {
                return prev;
            }

            const nextAvailable =
                billType === 'cash' ? prev.availableAmount - billValue : prev.availableAmount;

            return {
                ...prev,
                tasks: updatedTasks,
                availableAmount: nextAvailable,
            };
        });
    };

    const removeBillFromTask = (billId, taskId) => {
        setFinanceState((prev) => {
            let refund = 0;
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
                        refund += bill.value;
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

            return {
                ...prev,
                tasks: updatedTasks,
                availableAmount: prev.availableAmount + refund,
            };
        });
    };

    const advanceWeek = () => {
        setFinanceState((prev) => ({
            ...prev,
            currentWeek: prev.currentWeek + 2,
            availableAmount: prev.availableAmount + PAYCHECK_AMOUNT,
        }));
    };

    return (
        <div className="h-screen flex flex-col">
            <KanbanHeader
                currentWeek={currentWeek}
                availableAmount={availableAmount}
                onAdvanceWeek={advanceWeek}
            />

            <BillsPool bills={availableBills} availableAmount={availableAmount} />

            <KanbanBoard
                tasks={tasks}
                onMoveTask={moveTask}
                onAssignBill={assignBillToTask}
                onRemoveBill={removeBillFromTask}
            />
        </div>
    );
}
