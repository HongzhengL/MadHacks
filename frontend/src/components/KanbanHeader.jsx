import { DollarSign } from 'lucide-react';
import { Button } from './ui/button';

export function KanbanHeader({ currentWeek, availableAmount, onAdvanceWeek }) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-blue-600">Finance Kanban</h1>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-600">Week</span>
                        <span>{currentWeek}</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                        <DollarSign className="size-4 text-green-600" />
                        <span>{availableAmount}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={onAdvanceWeek} className="bg-green-600 hover:bg-green-700">
                        Next Round
                    </Button>
                    <Button variant="secondary">Help</Button>
                    <Button variant="destructive">Exit</Button>
                </div>
            </div>
        </div>
    );
}
