import { useState } from 'react';
import { KanbanHeader } from './KanbanHeader';
import { BillsPool } from './BillsPool';
import { KanbanBoard } from './KanbanBoard';

const PAYCHECK_AMOUNT = 500; // TODO: Should be configurable

export function FinanceKanban() {
    const [currentWeek, setCurrentWeek] = useState(1);
    const [availableAmount, setAvailableAmount] = useState(PAYCHECK_AMOUNT);

    const [tasks, setTasks] = useState([
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
    ]);

    const [availableBills] = useState([
        { id: 'b1', value: 100, type: 'cash' },
        { id: 'b2', value: 50, type: 'cash' },
        { id: 'b3', value: 10, type: 'cash' },
        { id: 'b4', value: 1, type: 'cash' },
        { id: 'cc1', value: 500, type: 'credit' },
    ]);

    const moveTask = (taskId, newStatus) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
        );
    };

    const assignBillToTask = (billValue, billType, taskId) => {
        const newBill = {
            id: `${taskId}-${Date.now()}-${Math.random()}`,
            value: billValue,
            type: billType,
        };

        if (billType === 'cash') {
            let hasFunds = false;

            setAvailableAmount((prevAmount) => {
                if (prevAmount < billValue) {
                    return prevAmount;
                }

                hasFunds = true;
                return prevAmount - billValue;
            });

            if (!hasFunds) {
                return;
            }
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId
                    ? { ...task, assignedBills: [...task.assignedBills, newBill] }
                    : task
            )
        );
    };

    const removeBillFromTask = (billId, taskId) => {
        let refundAmount = 0;

        setTasks((prevTasks) => {
            let billFound = false;

            const updatedTasks = prevTasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                let removed = false;
                const filteredBills = task.assignedBills.filter((bill) => {
                    if (bill.id !== billId) {
                        return true;
                    }

                    removed = true;
                    billFound = true;
                    refundAmount = bill.type === 'cash' ? bill.value : 0;
                    return false;
                });

                if (!removed) {
                    return task;
                }

                return { ...task, assignedBills: filteredBills };
            });

            return billFound ? updatedTasks : prevTasks;
        });

        if (refundAmount > 0) {
            setAvailableAmount((prevAmount) => prevAmount + refundAmount);
        }
    };

    const advanceWeek = () => {
        setCurrentWeek((prevWeek) => prevWeek + 2);
        setAvailableAmount((prevAmount) => prevAmount + PAYCHECK_AMOUNT);
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
