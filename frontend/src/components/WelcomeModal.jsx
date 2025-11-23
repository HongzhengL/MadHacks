import { useState } from 'react';
import { Modal } from './ui/Modal';

const welcomeStyles = {
    lead: {
        fontWeight: 600,
    },
    list: {
        paddingLeft: '18px',
        marginTop: '12px',
        marginBottom: '12px',
    },
    listItem: {
        marginBottom: '10px',
    },
    italic: {
        fontWeight: 700,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: '#337ab7',
        border: '1px solid #2e6da4',
        color: '#ffffff',
        padding: '10px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export function WelcomeModal({ isOpen, onStart }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onStart}
            title="Welcome"
            footer={
                <button style={welcomeStyles.button} onClick={onStart}>
                    Close
                </button>
            }
        >
            <p style={welcomeStyles.lead}>
                You have now entered the <strong>Money Moves: Madison Edition</strong> simulation.
            </p>

            <p>
                You've got a paycheck, bills, and dreams. Can you survive a year in the city without
                crashing your finances?
            </p>

            <p>Here is what you need to know:</p>

            <ul style={welcomeStyles.list}>
                <li style={welcomeStyles.listItem}>
                    <strong>Manage Income:</strong> Choose your path and handle your paycheck
                    responsibly.
                </li>
                <li style={welcomeStyles.listItem}>
                    <strong>Housing &amp; Bills:</strong> You will need to juggle rent, groceries,
                    and surprise costs every month.
                </li>
                <li style={welcomeStyles.listItem}>
                    <strong>Grow Wealth:</strong> Try to finish the year with money in the bank.
                </li>
                <li style={welcomeStyles.listItem}>
                    <strong>Quality of Life:</strong> Don't just survive - make sure you enjoy it
                    along the way.
                </li>
            </ul>

            <p style={welcomeStyles.italic}>Good Luck!</p>
        </Modal>
    );
}

// Default export used for standalone preview scenarios.
export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">Simulation Dashboard</h1>
                <p className="text-gray-600">
                    The modal will appear automatically. Click below to reopen it.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow"
                >
                    Reopen Welcome Modal
                </button>
            </div>

            <WelcomeModal isOpen={isModalOpen} onStart={() => setIsModalOpen(false)} />
        </div>
    );
}
