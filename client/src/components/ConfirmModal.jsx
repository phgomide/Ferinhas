export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="overlay open" style={{ zIndex: 1000 }} onClick={(e) => e.target.classList.contains('overlay') && onCancel()}>
            <div className="apply-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
                <p className="apply-title" style={{ color: 'var(--accent)', marginBottom: '.5rem' }}>{title}</p>
                <p className="apply-subtitle" style={{ color: 'var(--text)', lineHeight: 1.5, marginBottom: '2rem', textTransform: 'none', fontSize: '.85rem', letterSpacing: 'normal' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ marginTop: 0 }} onClick={onCancel}>Cancelar</button>
                    <button className="btn-submit" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
}