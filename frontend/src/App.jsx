import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FinanceKanban } from './components/FinanceKanban';
import { defaultFinanceConfig } from './config/financeConfig';
import { WelcomeModal } from './components/WelcomeModal';

export default function App() {
    const [showWelcome, setShowWelcome] = useState(true);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50">
                <WelcomeModal isOpen={showWelcome} onStart={() => setShowWelcome(false)} />
                <div className={showWelcome ? 'filter blur-sm' : ''}>
                    <FinanceKanban config={defaultFinanceConfig} />
                </div>
            </div>
        </DndProvider>
    );
}
