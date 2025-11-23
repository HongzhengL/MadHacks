import { KanbanColumn } from './KanbanColumn';

const columns = [
    { id: 'fixed', title: 'Fixed expense', color: 'gray' },
    { id: 'variable', title: 'Variable expense', color: 'blue' },
    { id: 'goal', title: 'Goal', color: 'orange' },
    { id: 'event', title: 'Event', color: 'green' },
    { id: 'opportunity', title: 'Opportunity', color: 'purple' },
];

export function KanbanBoard({ tasks, onMoveTask, onAssignBill, onRemoveBill }) {
    return (
        <div className="flex-1 overflow-x-auto bg-gray-50">
            <div className="h-full flex gap-4 p-6 min-w-max">
                {columns.map((column) => {
                    const columnTasks = tasks.filter((task) => task.status === column.id);
                    return (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={columnTasks}
                            onMoveTask={onMoveTask}
                            onAssignBill={onAssignBill}
                            onRemoveBill={onRemoveBill}
                        />
                    );
                })}
            </div>
        </div>
    );
}
