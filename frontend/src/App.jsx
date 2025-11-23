import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FinanceKanban } from './components/FinanceKanban';

export default function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50">
                <FinanceKanban />
            </div>
        </DndProvider>
    );
}
