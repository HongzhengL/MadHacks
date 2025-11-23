import { difficultyOptions, housingOptions } from '../config/scenarioConfig';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';

const optionCardBase =
    'w-full text-left border rounded-lg p-3 transition-shadow hover:shadow-md cursor-pointer';

const activeCard = 'border-blue-500 ring-2 ring-blue-200 bg-blue-50';
const inactiveCard = 'border-gray-200 bg-white';

function formatMoney(value) {
    return `$${value.toLocaleString()}`;
}

function DifficultyOption({ option, selected, onSelect }) {
    return (
        <button
            type="button"
            className={`${optionCardBase} ${selected ? activeCard : inactiveCard}`}
            onClick={() => onSelect(option.key)}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{option.label}</span>
                <span className="text-sm text-gray-600">{option.narrative}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-gray-700">
                <div>
                    <div className="text-gray-500">Paycheck</div>
                    <div className="font-semibold">{formatMoney(option.paycheck)}</div>
                </div>
                <div>
                    <div className="text-gray-500">Monthly Net</div>
                    <div className="font-semibold">{formatMoney(option.monthlyTakeHome)}</div>
                </div>
                <div>
                    <div className="text-gray-500">Starting QoL</div>
                    <div className="font-semibold">{option.qualityOfLife}</div>
                </div>
            </div>
        </button>
    );
}

function HousingOption({ option, selected, onSelect, rentPercent, paycheck }) {
    return (
        <button
            type="button"
            className={`${optionCardBase} ${selected ? activeCard : inactiveCard}`}
            onClick={() => onSelect(option.key)}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{option.label}</span>
                <span className="text-sm text-gray-600">{option.description}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-gray-700">
                <div>
                    <div className="text-gray-500">Rent / month</div>
                    <div className="font-semibold">{formatMoney(option.rent)}</div>
                </div>
                <div>
                    <div className="text-gray-500">% of income</div>
                    <div className="font-semibold">{rentPercent}%</div>
                </div>
                <div>
                    <div className="text-gray-500">QoL impact</div>
                    <div className="font-semibold">
                        {option.qolDelta >= 0 ? `+${option.qolDelta}` : option.qolDelta} baseline
                    </div>
                </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                Paycheck left after rent: {formatMoney(Math.max(paycheck * 2 - option.rent, 0))}
            </div>
        </button>
    );
}

export function SetupModal({
    isOpen,
    onClose,
    selection,
    summary,
    onSelectDifficulty,
    onSelectHousing,
    onStart,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Choose your starting scenario"
            maxWidth={960}
            paddingTop={24}
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-gray-600">
                        Paycheck: {formatMoney(summary.paycheckAmount)} | Rent:{' '}
                        {formatMoney(summary.rentAmount)} ({summary.rentPercentage}% of income) |
                        QoL baseline: {summary.qolBaseline}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onStart} className="bg-blue-600 hover:bg-blue-700">
                            Start run
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-gray-800 font-semibold mb-2">Difficulty (Salary)</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                        {Object.values(difficultyOptions).map((option) => (
                            <DifficultyOption
                                key={option.key}
                                option={option}
                                selected={selection.difficultyKey === option.key}
                                onSelect={onSelectDifficulty}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-gray-800 font-semibold mb-2">Housing</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                        {Object.values(housingOptions).map((option) => (
                            <HousingOption
                                key={option.key}
                                option={option}
                                selected={selection.housingKey === option.key}
                                onSelect={onSelectHousing}
                                rentPercent={
                                    Math.round(
                                        (option.rent /
                                            (difficultyOptions[selection.difficultyKey]
                                                ?.monthlyTakeHome ?? summary.monthlyTakeHome)) *
                                            100
                                    ) || summary.rentPercentage
                                }
                                paycheck={
                                    difficultyOptions[selection.difficultyKey]?.paycheck ??
                                    summary.paycheckAmount
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-700">
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="text-gray-500 mb-1">Credit Limit</div>
                        <div className="font-semibold">{formatMoney(summary.creditLimit)}</div>
                        <div className="text-gray-500 mt-2">Credit Score</div>
                        <div className="font-semibold">{summary.creditScore}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="text-gray-500 mb-1">Starting Debt</div>
                        <div className="font-semibold">{formatMoney(summary.startingDebt)}</div>
                        <div className="text-gray-500 mt-2">Narrative</div>
                        <div className="font-semibold text-gray-800">{summary.narrative}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="text-gray-500 mb-1">Housing</div>
                        <div className="font-semibold">{summary.housingLabel}</div>
                        <div className="text-gray-500 mt-2">Rent share</div>
                        <div className="font-semibold">
                            {formatMoney(summary.rentAmount)} ({summary.rentPercentage}%)
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
