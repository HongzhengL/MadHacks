import { useMemo, useState } from 'react';
import { Check, Home, PiggyBank, ShieldQuestion } from 'lucide-react';
import { Modal } from './ui/Modal';
import { buildScenarioConfig, difficultyOptions, housingOptions } from '../config/scenarioConfig';

function Pill({ label, value }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm">
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
}

function OptionCard({ option, selected, onSelect, children }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
                selected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">
                        {option.narrative ?? option.description}
                    </div>
                </div>
                {selected ? <Check className="size-5 text-blue-600" /> : null}
            </div>

            {children ? <div className="mt-2 text-sm text-gray-700">{children}</div> : null}
        </button>
    );
}

export function GameSetupModal({
    isOpen,
    onConfirm,
    defaultDifficulty = 'medium',
    defaultHousing = 'sharedApartment',
}) {
    const [selectedDifficulty, setSelectedDifficulty] = useState(defaultDifficulty);
    const [selectedHousing, setSelectedHousing] = useState(defaultHousing);

    const { summary } = useMemo(
        () =>
            buildScenarioConfig({
                difficultyKey: selectedDifficulty,
                housingKey: selectedHousing,
            }),
        [selectedDifficulty, selectedHousing]
    );

    const handleStart = () => {
        if (!onConfirm) return;
        onConfirm(selectedDifficulty, selectedHousing);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleStart}
            title="Choose Your Starting Situation"
            maxWidth={980}
            paddingTop={24}
            headerColor="#2563eb"
            headerBorderColor="#1d4ed8"
        >
            <div className="space-y-6">
                <div className="text-gray-800">
                    Pick a salary difficulty and housing choice. We’ll prefill your paycheck, rent,
                    credit limit, and QoL baseline so the board reflects your situation.
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <PiggyBank className="size-5 text-amber-600" />
                        <span>Difficulty (Salary)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.values(difficultyOptions).map((option) => (
                            <OptionCard
                                key={option.key}
                                option={option}
                                selected={selectedDifficulty === option.key}
                                onSelect={() => setSelectedDifficulty(option.key)}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="text-gray-800 font-semibold">
                                        ${option.paycheck.toLocaleString()} per paycheck
                                    </div>
                                    <div className="text-gray-600">
                                        ${option.monthlyTakeHome.toLocaleString()} monthly take-home
                                    </div>
                                    <div className="text-gray-600">
                                        Credit limit: ${option.creditLimit.toLocaleString()}
                                    </div>
                                </div>
                            </OptionCard>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Home className="size-5 text-emerald-600" />
                        <span>Housing (Rent)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {Object.values(housingOptions).map((option) => (
                            <OptionCard
                                key={option.key}
                                option={option}
                                selected={selectedHousing === option.key}
                                onSelect={() => setSelectedHousing(option.key)}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="text-gray-800 font-semibold">
                                        ${option.rent.toLocaleString()} rent
                                    </div>
                                    <div className="text-gray-600">{option.description}</div>
                                </div>
                            </OptionCard>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                            <ShieldQuestion className="size-5 text-indigo-600" />
                            <span>Starting Snapshot</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Pill label="Difficulty" value={summary.difficultyLabel} />
                            <Pill label="Housing" value={summary.housingLabel} />
                            <Pill
                                label="Paycheck"
                                value={`$${summary.paycheckAmount.toLocaleString()}`}
                            />
                            <Pill
                                label="Rent"
                                value={`$${summary.rentAmount} (${summary.rentPercentage}% income)`}
                            />
                            <Pill
                                label="Monthly Take-home"
                                value={`$${summary.monthlyTakeHome.toLocaleString()}`}
                            />
                            <Pill label="QoL Baseline" value={summary.qolBaseline} />
                            <Pill label="Credit Score" value={summary.creditScore} />
                            <Pill
                                label="Credit Limit"
                                value={`$${summary.creditLimit.toLocaleString()}`}
                            />
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed">
                            Rent is {summary.rentPercentage}% of your income. QoL starts at{' '}
                            {summary.qolBaseline} and shifts with housing comfort. Credit and debt
                            levels set your risk floor—use this as a reference when you enter Round
                            1.
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 leading-relaxed">
                        <div className="font-semibold mb-2 text-blue-900">
                            Tradeoff Tips for Madison
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Hard + Luxury is a “challenge run” with 70%+ rent burden.</li>
                            <li>Easy + Shared Room frees cash for goals but dampens QoL.</li>
                            <li>Medium + 1B1B balances comfort with room for emergencies.</li>
                            <li>Watch the rent-to-income % to avoid credit spiral pressure.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleStart}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    Start Simulation
                </button>
            </div>
        </Modal>
    );
}
