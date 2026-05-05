import { useEffect } from 'react';
import { getInitials } from '../utils/helpers';

export default function CandidateModal({ candidate, isOpen, onClose, onApply }) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!candidate) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('overlay')) onClose();
    };

    return (
        <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick} role="dialog" aria-modal="true">
            <div className="modal-overlay-wrapper">
                <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
                <div className="modal">
                    <div className="modal-img-col">
                        {candidate.img ? (
                            <img className="modal-img" src={candidate.img} alt={candidate.name} />
                        ) : (
                            <div className="modal-img-placeholder">{getInitials(candidate.name)}</div>
                        )}
                    </div>
                    <div className="modal-content">
                        <div className="modal-meta">
                            <div className="modal-meta-dot"></div>
                            <span>PADRINHO_{String(candidate.user_id).padStart(4, '0')}</span>
                        </div>

                        <h2 className="modal-name">{candidate.name}</h2>

                        {(candidate.github || candidate.linkedin || candidate.email) && (
                            <div className="social-links">
                                {candidate.github && (
                                    <a className="social-link" href={candidate.github} target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                        Github
                                    </a>
                                )}
                                {candidate.linkedin && (
                                    <a className="social-link" href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                        LinkedIn
                                    </a>
                                )}
                                {candidate.email && (
                                    <a className="social-link" href={`mailto:${candidate.email}`}>
                                        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        Email
                                    </a>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: '1rem' }}>
                            <p className="section-label">Projetos & Laboratórios</p>
                            <div className="modal-tags">
                                {candidate.labs?.map((l, i) => <span key={i} className="tag tag-lab">{l}</span>)}
                            </div>
                        </div>

                        <div>
                            <p className="section-label">Interesses</p>
                            <div className="modal-tags">
                                {candidate.interests?.map((t, i) => <span key={i} className="tag tag-int">{t}</span>)}
                            </div>
                        </div>

                        <div>
                            <p className="section-label">Sobre mim</p>
                            {(candidate.bio || '').split('\n\n').map((para, i) => (
                                <p key={i} className="modal-bio">{para}</p>
                            ))}
                        </div>

                        <div className="modal-question">
                            <p className="section-label">O que o apadrinhamento representa para você?</p>
                            <p>{candidate.question || ''}</p>
                        </div>

                        <button
                            className="btn-submit"
                            onClick={() => { onClose(); onApply(candidate.name); }}
                            style={{ marginTop: '.5rem' }}
                        >
                            Escolho você
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}