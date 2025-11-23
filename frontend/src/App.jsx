import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FinanceKanban } from './components/FinanceKanban';
import { ScenarioSetupModal } from './components/ScenarioSetupModal';
import { WelcomeModal } from './components/WelcomeModal';
import { buildScenarioConfig } from './config/scenarioConfig';

export default function App() {
    const [stage, setStage] = useState('welcome'); // welcome -> setup -> ready
    const [scenarioState, setScenarioState] = useState(() => buildScenarioConfig());
    const [boardRunId, setBoardRunId] = useState(0);

    const handleScenarioConfirm = ({ difficultyKey, housingKey }) => {
        const next = buildScenarioConfig({ difficultyKey, housingKey });
        setScenarioState(next);
        setBoardRunId((prev) => prev + 1);
        setStage('ready');
    };

    const isBlurred = stage !== 'ready';

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50">
                <WelcomeModal isOpen={stage === 'welcome'} onStart={() => setStage('setup')} />

                <ScenarioSetupModal
                    isOpen={stage === 'setup'}
                    onConfirm={handleScenarioConfirm}
                    onCancel={() => setStage('ready')}
                    initialSelection={{
                        difficultyKey: scenarioState.summary.difficultyKey,
                        housingKey: scenarioState.summary.housingKey,
                    }}
                />

                <div className={isBlurred ? 'filter blur-sm' : ''}>
                    <FinanceKanban
                        key={`${boardRunId}-${scenarioState.summary.difficultyKey}-${scenarioState.summary.housingKey}`}
                        config={scenarioState.financeConfig}
                        summary={scenarioState.summary}
                    />
                </div>
            </div>
        </DndProvider>
    );
}
