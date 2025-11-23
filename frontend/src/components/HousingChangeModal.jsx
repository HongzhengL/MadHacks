import { useMemo, useState } from 'react';
import { Home, DollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { housingOptions } from '../config/scenarioConfig';

const CHANGE_FEE = 200;

export function HousingChangeModal({
    isOpen,
    currentHousingKey,
    monthlyTakeHome,
    onConfirm,
    onClose,
}) {
    const [selectedKey, setSelectedKey] = useState(currentHousingKey ?? 'sharedApartment');

    const selection = useMemo(() => housingOptions[selectedKey], [selectedKey]);

    const isSameChoice = selectedKey === currentHousingKey;

    const handleConfirm = () => {
        if (!selection || isSameChoice) return;
        onConfirm?.(selectedKey);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Housing"
            maxWidth={720}
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                        <DollarSign className="size-4 text-amber-600" />
                        <span>Change fee: ${CHANGE_FEE} (added to next rent bill)</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isSameChoice}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Confirm change
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Switching homes updates your monthly rent and QoL baseline. Each move costs $
                    {CHANGE_FEE}, which is added to the upcoming rent bill (billed every 2 rounds).
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                    {Object.values(housingOptions).map((option) => {
                        const optionRentPercent = monthlyTakeHome
                            ? Math.round((option.rent / monthlyTakeHome) * 100)
                            : null;
                        const selected = option.key === selectedKey;
                        return (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setSelectedKey(option.key)}
                                className={`
                                    text-left border rounded-lg p-3 transition h-full
                                    ${
                                        selected
                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 bg-white'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Home className="size-4 text-green-600" />
                                        <span className="font-semibold text-gray-900">
                                            {option.label}
                                        </span>
                                    </div>
                                    {selected ? (
                                        <span className="text-blue-600 text-xs font-medium">
                                            Selected
                                        </span>
                                    ) : null}
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                    Rent: ${option.rent}/mo
                                    {optionRentPercent !== null
                                        ? ` • ${optionRentPercent}% income`
                                        : ''}
                                </div>
                                <div
                                    className={`text-sm mt-1 ${
                                        option.qolDelta > 0
                                            ? 'text-green-700'
                                            : option.qolDelta < 0
                                              ? 'text-red-700'
                                              : 'text-gray-600'
                                    }`}
                                >
                                    QoL {option.qolDelta >= 0 ? '+' : ''}
                                    {option.qolDelta}
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                    {option.description}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {isSameChoice ? (
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-2">
                        <Home className="size-4" />
                        <span>You are already in this housing.</span>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
}
