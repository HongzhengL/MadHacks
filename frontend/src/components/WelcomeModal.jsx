import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '40px',
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        overflowY: 'auto',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    modal: {
        width: '100%',
        maxWidth: '820px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        boxShadow: '0 18px 36px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '14px 18px',
        backgroundColor: '#5cb85c',
        borderBottom: '1px solid #4cae4c',
    },
    headerTitle: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '18px',
        letterSpacing: '0.25px',
    },
    closeIconButton: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.85)',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
    },
    body: {
        padding: '26px',
        color: '#333333',
        fontSize: '15px',
        lineHeight: 1.7,
    },
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
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5e5',
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
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} role="dialog" aria-modal="true" onClick={onStart}>
            {/* Modal Container */}
            <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div style={styles.header}>
                    <span style={styles.headerTitle}>Welcome</span>
                    <button style={styles.closeIconButton} aria-label="Close" onClick={onStart}>
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <div style={styles.body}>
                    <p style={styles.lead}>
                        You have now entered the <strong>Money Moves: Madison Edition</strong> simulation.
                    </p>

                    <p>
                        You've got a paycheck, bills, and dreams. Can you survive a year in the city without crashing
                        your finances?
                    </p>

                    <p>Here is what you need to know:</p>

                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <strong>Manage Income:</strong> Choose your path and handle your paycheck responsibly.
                        </li>
                        <li style={styles.listItem}>
                            <strong>Housing &amp; Bills:</strong> You will need to juggle rent, groceries, and surprise
                            costs every month.
                        </li>
                        <li style={styles.listItem}>
                            <strong>Grow Wealth:</strong> Try to finish the year with money in the bank.
                        </li>
                        <li style={styles.listItem}>
                            <strong>Quality of Life:</strong> Don't just survive - make sure you enjoy it along the way.
                        </li>
                    </ul>

                    <p style={styles.italic}>Good Luck!</p>
                </div>

                <div style={styles.footer}>
                    <button style={styles.button} onClick={onStart}>
                        Close
                    </button>
                </div>
            </div>
        </div>
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
