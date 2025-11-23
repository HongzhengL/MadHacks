import { DollarSign, CreditCard, Wallet, Home, Heart } from 'lucide-react';
import { Button } from './ui/button';

export function KanbanHeader({
    currentWeek,
    availableAmount,
    creditRemaining,
    creditLimit,
    scenarioSummary,
    onAdvanceWeek,
}) {
    const difficultyLabel = scenarioSummary?.difficultyLabel;
    const housingLabel = scenarioSummary?.housingLabel;
    const paycheckAmount = scenarioSummary?.paycheckAmount;
    const rentAmount = scenarioSummary?.rentAmount;
    const rentPercentage = scenarioSummary?.rentPercentage;
    const qolBaseline = scenarioSummary?.qolBaseline;
    const monthlyTakeHome = scenarioSummary?.monthlyTakeHome;

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
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

                {scenarioSummary ? (
                    <>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
                                <Wallet className="size-4" />
                                <span className="font-semibold">{difficultyLabel}</span>
                                <span className="text-gray-500">/ {housingLabel}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-green-800">
                                <DollarSign className="size-4" />
                                <span>${paycheckAmount} per paycheck</span>
                                {monthlyTakeHome ? (
                                    <span className="text-gray-600">(${monthlyTakeHome} / mo)</span>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-orange-800">
                                <Home className="size-4" />
                                <span>
                                    Rent: ${rentAmount} ({rentPercentage}%)
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-pink-50 border border-pink-200 text-pink-800">
                                <Heart className="size-4" />
                                <span>QoL baseline: {qolBaseline}</span>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
