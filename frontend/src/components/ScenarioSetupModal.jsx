import { useMemo, useState } from 'react';
import { Wallet, Home, Heart, CreditCard } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { buildScenarioConfig, difficultyOptions, housingOptions } from '../config/scenarioConfig';

function OptionCard({ option, selected, onSelect, children }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`
                w-full text-left border rounded-lg p-3 transition
                ${selected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white'}
            `}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-gray-800">{option.label}</div>
                {selected ? (
                    <span className="text-blue-600 text-sm font-medium">Selected</span>
                ) : null}
            </div>
            <div className="text-sm text-gray-600 mt-1">
                {option.narrative || option.description}
            </div>
            {children ? <div className="mt-2 text-sm text-gray-800">{children}</div> : null}
        </button>
    );
}

function SummaryStat({ icon, label, value, accent }) {
    const Icon = icon;
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded border bg-white shadow-sm">
            <Icon className={`size-4 ${accent}`} />
            <div className="text-sm">
                <div className="text-gray-600">{label}</div>
                <div className="font-semibold text-gray-900">{value}</div>
            </div>
        </div>
    );
}

export function ScenarioSetupModal({ isOpen, onConfirm, onCancel, initialSelection }) {
    const [difficultyKey, setDifficultyKey] = useState(initialSelection?.difficultyKey ?? 'medium');
    const [housingKey, setHousingKey] = useState(initialSelection?.housingKey ?? 'sharedApartment');

    const { summary } = useMemo(
        () => buildScenarioConfig({ difficultyKey, housingKey }),
        [difficultyKey, housingKey]
    );

    const handleConfirm = () => {
        onConfirm?.({ difficultyKey, housingKey, summary });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel ?? handleConfirm}
            title="Choose Your Starting Scenario"
            maxWidth={960}
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Pick your salary level and housing. We will show rent as a % of take-home pay so
                    you see the tradeoff before you start.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-gray-800 font-semibold flex items-center gap-2">
                            <Wallet className="size-4 text-blue-600" />
                            Salary & Difficulty
                        </h3>
                        {Object.values(difficultyOptions).map((option) => (
                            <OptionCard
                                key={option.key}
                                option={option}
                                selected={option.key === difficultyKey}
                                onSelect={() => setDifficultyKey(option.key)}
                            >
                                <div className="flex items-center gap-4 text-gray-800">
                                    <span>${option.paycheck} per paycheck</span>
                                    <span className="text-gray-500">
                                        / ${option.monthlyTakeHome} mo
                                    </span>
                                </div>
                            </OptionCard>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-gray-800 font-semibold flex items-center gap-2">
                            <Home className="size-4 text-green-600" />
                            Housing
                        </h3>
                        {Object.values(housingOptions).map((option) => (
                            <OptionCard
                                key={option.key}
                                option={option}
                                selected={option.key === housingKey}
                                onSelect={() => setHousingKey(option.key)}
                            >
                                <div className="flex items-center gap-4 text-gray-800">
                                    <span>Rent: ${option.rent}/mo</span>
                                    <span
                                        className={`text-sm ${
                                            option.qolDelta > 0
                                                ? 'text-green-600'
                                                : option.qolDelta < 0
                                                  ? 'text-red-600'
                                                  : 'text-gray-600'
                                        }`}
                                    >
                                        QoL {option.qolDelta >= 0 ? '+' : ''}
                                        {option.qolDelta}
                                    </span>
                                </div>
                            </OptionCard>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap gap-3">
                        <SummaryStat
                            icon={Wallet}
                            label="Paycheck (biweekly)"
                            value={`$${summary.paycheckAmount}`}
                            accent="text-blue-600"
                        />
                        <SummaryStat
                            icon={Home}
                            label="Rent & % of take-home"
                            value={`$${summary.rentAmount} • ${summary.rentPercentage}%`}
                            accent="text-green-600"
                        />
                        <SummaryStat
                            icon={Heart}
                            label="QoL baseline"
                            value={summary.qolBaseline}
                            accent="text-pink-600"
                        />
                        <SummaryStat
                            icon={CreditCard}
                            label="Credit score / limit"
                            value={`${summary.creditScore} • $${summary.creditLimit}`}
                            accent="text-purple-600"
                        />
                    </div>
                    <div className="text-gray-700 text-sm">
                        {summary.difficultyLabel} · {summary.housingLabel} — {summary.narrative}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                {onCancel ? (
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : null}
                <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                    Start with this setup
                </Button>
            </div>
        </Modal>
    );
}
