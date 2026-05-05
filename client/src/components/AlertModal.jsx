export default function AlertModal({ isOpen, title, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="overlay open" style={{ zIndex: 1000 }} onClick={(e) => e.target.classList.contains('overlay') && onClose()}>
            <div className="apply-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
                <p className="apply-title" style={{ color: 'var(--cyan)', marginBottom: '.5rem' }}>{title}</p>
                <p className="apply-subtitle" style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: '2rem', textTransform: 'none', fontSize: '.85rem', letterSpacing: 'normal', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {message}
                </p>
                <button className="btn-submit" onClick={onClose}>OK</button>
            </div>
        </div>
    );
}