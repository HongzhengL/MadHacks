import { useEffect } from 'react';
import { X } from 'lucide-react';

const baseStyles = {
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
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5e5',
    },
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 820,
    paddingTop = 40,
    showCloseButton = true,
    closeOnOverlay = true,
    headerColor = '#5cb85c',
    headerBorderColor = '#4cae4c',
    headerTextColor = '#ffffff',
    modalStyle,
    overlayStyle,
    bodyStyle,
    footerStyle,
}) {
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

    const overlayCombined = {
        ...baseStyles.overlay,
        paddingTop: `${paddingTop}px`,
        ...overlayStyle,
    };

    const modalCombined = {
        ...baseStyles.modal,
        maxWidth: `${maxWidth}px`,
        ...modalStyle,
    };

    const headerCombined = {
        ...baseStyles.header,
        backgroundColor: headerColor,
        borderBottom: `1px solid ${headerBorderColor}`,
    };

    const headerTitleCombined = {
        ...baseStyles.headerTitle,
        color: headerTextColor,
    };

    return (
        <div
            style={overlayCombined}
            role="dialog"
            aria-modal="true"
            onClick={closeOnOverlay && onClose ? onClose : undefined}
        >
            <div style={modalCombined} onClick={(event) => event.stopPropagation()}>
                {(title || showCloseButton) && (
                    <div style={headerCombined}>
                        {title ? <span style={headerTitleCombined}>{title}</span> : <span />}

                        {showCloseButton ? (
                            <button
                                style={baseStyles.closeIconButton}
                                aria-label="Close"
                                onClick={onClose}
                                type="button"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        ) : null}
                    </div>
                )}

                <div style={{ ...baseStyles.body, ...bodyStyle }}>{children}</div>

                {footer ? (
                    <div style={{ ...baseStyles.footer, ...footerStyle }}>{footer}</div>
                ) : null}
            </div>
        </div>
    );
}
