import { useDrag } from 'react-dnd';
import { CreditCard, DollarSign } from 'lucide-react';

export function BillCard({ bill, onRemove, disabled = false }) {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'bill',
            item: { billValue: bill.value, billType: bill.type },
            canDrag: !disabled,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [disabled, bill.value, bill.type]
    );

    const getBillColor = () => {
        if (disabled) return 'bg-gray-300 border-gray-400 opacity-50 cursor-not-allowed';
        if (bill.type === 'credit') return 'bg-purple-500 border-purple-600';
        switch (bill.value) {
            case 100:
                return 'bg-green-500 border-green-600';
            case 50:
                return 'bg-blue-500 border-blue-600';
            case 10:
                return 'bg-yellow-500 border-yellow-600';
            case 1:
                return 'bg-gray-400 border-gray-500';
            default:
                return 'bg-gray-300 border-gray-400';
        }
    };

    return (
        <div
            ref={!disabled ? drag : null}
            className={`
        relative px-3 py-2 rounded border-2 text-white
        ${disabled ? 'cursor-not-allowed' : 'cursor-move'}
        ${getBillColor()}
        ${isDragging ? 'opacity-50' : ''}
        transition-opacity
      `}
            onClick={onRemove}
        >
            <div className="flex items-center gap-1">
                {bill.type === 'credit' ? (
                    <>
                        <CreditCard className="size-4" />
                        <span>Credit</span>
                    </>
                ) : (
                    <>
                        <DollarSign className="size-4" />
                        <span>{bill.value}</span>
                    </>
                )}
            </div>
        </div>
    );
}
