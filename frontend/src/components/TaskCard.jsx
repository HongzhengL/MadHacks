import { useDrag, useDrop } from 'react-dnd';
import { BillCard } from './BillCard';
import { Calendar, DollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useState } from 'react';

export function TaskCard({
    task,
    onAssignBill,
    onRemoveBill,
    onChangeHousing,
    rentSurcharge = 0,
    baseRent,
    onWithdrawSavings,
    onBorrowDebt,
}) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'task',
        item: { taskId: task.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    const [withdrawInput, setWithdrawInput] = useState('');

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'bill',
        drop: (item) => {
            onAssignBill(item.billValue, item.billType, task.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const totalAssigned = task.assignedBills.reduce((sum, bill) => sum + bill.value, 0);
    const isFullyPaid = totalAssigned >= task.amount;
    const isRentTask = task.category === 'rent' || task.id === 'T1';
    const rentBaseAmount =
        baseRent ?? (rentSurcharge > 0 ? Math.max(task.amount - rentSurcharge, 0) : task.amount);
    const displayAmount =
        isRentTask && rentSurcharge > 0
            ? `$${rentBaseAmount} + ${rentSurcharge}`
            : task.category === 'savings'
              ? `${Math.round(task.accountBalance ?? 0)}`
              : task.category === 'debt'
                ? `${-Math.round(task.accountBalance ?? 0)}`
                : task.amount;

    const handleContextMenu = (event) => {
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setMenuOpen(true);
    };

    // Build menu options based on task type
    const getMenuOptions = () => {
        const options = [];

        if (isRentTask && onChangeHousing) {
            options.push({
                label: 'Switch Housing',
                action: () => {
                    setMenuOpen(false);
                    onChangeHousing();
                },
            });
        }

        if (task.category === 'savings' && onWithdrawSavings) {
            options.push({
                label: 'Withdraw Money',
                action: () => {
                    setMenuOpen(false);
                    setWithdrawInput('');
                    setWithdrawModalOpen(true);
                },
            });
        }

        if (task.category === 'debt' && onBorrowDebt) {
            options.push({
                label: 'Borrow Money',
                action: () => {
                    setMenuOpen(false);
                    setBorrowModalOpen(true);
                },
            });
        }

        return options;
    };

    const menuOptions = getMenuOptions();

    return (
        <div
            ref={drag}
            onContextMenu={handleContextMenu}
            className={`
        bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-opacity
      `}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="text-gray-800 font-semibold">{task.title}</div>
                <div className="flex items-center gap-1 text-gray-800">
                    <DollarSign className="size-4" />
                    <span>{displayAmount}</span>
                </div>
            </div>

            {task.dueWeek && task.category !== 'savings' && task.category !== 'debt' ? (
                <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <Calendar className="size-4" />
                    <span>Due Week {task.dueWeek}</span>
                </div>
            ) : null}

            <div
                ref={drop}
                className={`
          border-2 border-dashed rounded p-2 min-h-16
          ${isOver ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}
        `}
            >
                {task.assignedBills.length === 0 ? (
                    <div className="text-gray-400 text-center py-2">Drop bills here</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {task.assignedBills.map((bill) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                onRemove={() => onRemoveBill(bill.id, task.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {task.assignedBills.length > 0 &&
                task.category !== 'savings' &&
                task.category !== 'debt' && (
                    <div
                        className={`mt-2 text-center ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}
                    >
                        ${totalAssigned} / ${task.amount}
                    </div>
                )}

            {/* Context Menu */}
            {menuOpen && menuOptions.length > 0 && (
                <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setMenuOpen(false);
                        }}
                    />

                    {/* Floating context menu */}
                    <div
                        className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-48"
                        style={{
                            left: `${menuPosition.x}px`,
                            top: `${menuPosition.y}px`,
                        }}
                    >
                        {menuOptions.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                                onClick={option.action}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Withdraw Money Modal */}
            <Modal
                isOpen={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
                title="Withdraw Money"
                maxWidth={400}
                headerColor="#10b981"
                headerBorderColor="#059669"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            onClick={() => setWithdrawModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                            onClick={() => {
                                const amt = Math.round(Number(withdrawInput) || 0);
                                if (amt > 0 && amt <= Math.round(task.accountBalance ?? 0)) {
                                    onWithdrawSavings?.(task.id, amt);
                                    setWithdrawModalOpen(false);
                                }
                            }}
                        >
                            Withdraw
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Available balance:{' '}
                        <span className="font-semibold">
                            ${Math.round(task.accountBalance ?? 0)}
                        </span>
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to withdraw
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={Math.round(task.accountBalance ?? 0)}
                            value={withdrawInput}
                            onChange={(e) => setWithdrawInput(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter amount"
                            autoFocus
                        />
                    </div>
                </div>
            </Modal>

            {/* Borrow Money Modal */}
            <Modal
                isOpen={borrowModalOpen}
                onClose={() => setBorrowModalOpen(false)}
                title="Borrow Money"
                maxWidth={400}
                headerColor="#3b82f6"
                headerBorderColor="#2563eb"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            onClick={() => setBorrowModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            onClick={() => {
                                onBorrowDebt?.(task.id);
                                setBorrowModalOpen(false);
                            }}
                        >
                            Borrow $200
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                        Borrowing $200 will add it to your available cash and increase your debt
                        balance.
                    </p>
                    <p className="text-sm text-gray-600">
                        Current debt:{' '}
                        <span className="font-semibold text-red-600">
                            ${Math.abs(Math.round(task.accountBalance ?? 0))}
                        </span>
                    </p>
                </div>
            </Modal>
        </div>
    );
}
