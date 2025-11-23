import { BillCard } from './BillCard';

export function BillsPool({ bills, availableAmount, creditRemaining }) {
    return (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex items-center gap-6">
                <span className="text-gray-700">Available Bills:</span>

                <div className="flex gap-4">
                    {bills
                        .filter((b) => b.type === 'cash')
                        .map((bill) => (
                            <BillCard
                                key={bill.id}
                                bill={bill}
                                disabled={availableAmount < bill.value}
                            />
                        ))}

                    <div className="ml-4 pl-4 border-l border-blue-300">
                        {bills
                            .filter((b) => b.type === 'credit')
                            .map((bill) => (
                                <BillCard
                                    key={bill.id}
                                    bill={bill}
                                    disabled={(creditRemaining ?? 0) <= 0}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
