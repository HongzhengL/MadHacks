import { KanbanColumn } from './KanbanColumn';

const columns = [
    { id: 'fixed', title: 'Fixed expense', color: 'gray' },
    { id: 'variable', title: 'Variable expense', color: 'blue' },
    { id: 'goal', title: 'Goal', color: 'orange' },
    { id: 'event', title: 'Event', color: 'green' },
    { id: 'opportunity', title: 'Opportunity', color: 'purple' },
];

export function KanbanBoard({
    tasks,
    onMoveTask,
    onAssignBill,
    onRemoveBill,
    onChangeHousing,
    rentSurcharge,
    baseRent,
}) {
    return (
        <div className="flex-1 overflow-auto bg-gray-50">
            <div
                className="h-full gap-4 p-6"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))`,
                    alignItems: 'start',
                }}
            >
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
                            onChangeHousing={onChangeHousing}
                            rentSurcharge={rentSurcharge}
                            baseRent={baseRent}
                        />
                    );
                })}
            </div>
        </div>
    );
}
