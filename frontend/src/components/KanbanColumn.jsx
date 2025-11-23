import { useDrop } from 'react-dnd';
import { TaskCard } from './TaskCard';

export function KanbanColumn({
    column,
    tasks,
    onMoveTask,
    onAssignBill,
    onRemoveBill,
    onChangeHousing,
    housingChangeFee,
}) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'task',
        drop: (item) => {
            onMoveTask(item.taskId, column.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const getHeaderColor = () => {
        switch (column.color) {
            case 'blue':
                return 'bg-blue-100 border-blue-300';
            case 'orange':
                return 'bg-orange-100 border-orange-300';
            case 'green':
                return 'bg-green-100 border-green-300';
            case 'purple':
                return 'bg-purple-100 border-purple-300';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <div className="flex flex-col" style={{ minWidth: 0 }}>
            <div className={`px-4 py-3 rounded-t-lg border-2 ${getHeaderColor()}`}>
                <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    <span className="text-gray-600">({tasks.length})</span>
                </div>
            </div>

            <div
                ref={drop}
                className={`
          flex-1 bg-white border-2 border-t-0 rounded-b-lg p-3 min-h-96
          ${isOver ? 'bg-blue-50' : ''}
        `}
            >
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onAssignBill={onAssignBill}
                            onRemoveBill={onRemoveBill}
                            onChangeHousing={onChangeHousing}
                            housingChangeFee={housingChangeFee}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
