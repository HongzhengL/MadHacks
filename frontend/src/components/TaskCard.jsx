import { useDrag, useDrop } from 'react-dnd';
import { BillCard } from './BillCard';
import { Calendar, DollarSign } from 'lucide-react';

export function TaskCard({ task, onAssignBill, onRemoveBill }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'task',
        item: { taskId: task.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

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

    return (
        <div
            ref={drag}
            className={`
        bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        transition-opacity
      `}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="text-gray-800">{task.id}</div>
                    <div className="text-gray-600">{task.title}</div>
                </div>
                <div className="flex items-center gap-1 text-gray-800">
                    <DollarSign className="size-4" />
                    <span>{task.amount}</span>
                </div>
            </div>

            <div className="flex items-center gap-1 text-gray-600 mb-3">
                <Calendar className="size-4" />
                <span>Due Week {task.dueWeek}</span>
            </div>

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

            {task.assignedBills.length > 0 && (
                <div
                    className={`mt-2 text-center ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}
                >
                    ${totalAssigned} / ${task.amount}
                </div>
            )}
        </div>
    );
}
