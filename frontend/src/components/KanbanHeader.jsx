import { DollarSign, CreditCard } from 'lucide-react';
import { Button } from './ui/button';

export function KanbanHeader({
    currentWeek,
    availableAmount,
    creditRemaining,
    creditLimit,
    onAdvanceWeek,
}) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-blue-600">The Badger Budget</h1>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-600">Week</span>
                        <span>{currentWeek}</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                        <DollarSign className="size-4 text-green-600" />
                        <span>Balance: ${availableAmount}</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                        <CreditCard className="size-4 text-purple-600" />
                        <span>
                            Credit Limit: ${creditRemaining ?? 0}/
                            {creditLimit ?? creditRemaining ?? 0}
                        </span>
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
