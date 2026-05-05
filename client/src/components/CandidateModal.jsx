import { useState, useEffect } from 'react';
import { getInitials, formatDate, getImageUrl, parseMarkdown } from '../utils/helpers';

export default function CandidateModal({ session, candidate, isOpen, onClose, onApply, onToggleLike }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            if (candidate) fetchComments(candidate.user_id);
        } else {
            document.body.style.overflow = '';
            setNewComment('');
            setEmailCopied(false);
        }
        return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
    }, [isOpen, candidate, onClose]);

    const fetchComments = async (id) => {
        try {
            const res = await fetch(`/api/profile/${id}/comments`);
            if (res.ok) setComments(await res.json());
        } catch (err) { }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !session) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/profile/${candidate.user_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment })
            });
            if (res.ok) {
                const added = await res.json();
                setComments([added, ...comments]);
                setNewComment('');
            }
        } catch (err) { }
        setIsSubmitting(false);
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await fetch(`/api/profile/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) setComments(comments.filter(c => c.id !== commentId));
        } catch (err) { }
    };

    const handleCopyEmail = (email) => {
        if (!email) return;
        navigator.clipboard.writeText(email);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    };

    if (!candidate) return null;

    return (
        <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('overlay') && onClose()} role="dialog" aria-modal="true">
            <div className="modal-overlay-wrapper">
                <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
                <div className="modal">
                    <div className="modal-img-col">
                        {candidate.img ? (
                            <img className="modal-img" src={getImageUrl(candidate.img)} alt={candidate.name} />
                        ) : (
                            <div className="modal-img-placeholder">{getInitials(candidate.name)}</div>
                        )}
                    </div>
                    <div className="modal-content">

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '3rem' }}>
                            <div className="modal-meta">
                                <div className="modal-meta-dot"></div>
                                <span>PADRINHO_{String(candidate.user_id).padStart(4, '0')}</span>
                            </div>
                            <button className={`like-btn ${candidate.is_liked ? 'liked' : ''}`} onClick={() => onToggleLike(candidate.user_id)}>
                                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                {candidate.likes_count} Toleram
                            </button>
                        </div>

                        <h2 className="modal-name">{candidate.name}</h2>

                        {(candidate.github || candidate.linkedin || candidate.email) && (
                            <div className="social-links">
                                {candidate.github && (
                                    <a className="social-link" href={candidate.github} target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> Github
                                    </a>
                                )}
                                {candidate.linkedin && (
                                    <a className="social-link" href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
                                    </a>
                                )}
                                {candidate.email && (
                                    <button
                                        className="social-link"
                                        onClick={() => handleCopyEmail(candidate.email)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                                    >
                                        <svg viewBox="0 0 24 24">
                                            {emailCopied ? (
                                                <path d="M20 6L9 17l-5-5" stroke="var(--green)" />
                                            ) : (
                                                <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></>
                                            )}
                                        </svg>
                                        <span style={{ color: emailCopied ? 'var(--green)' : 'inherit' }}>
                                            {emailCopied ? 'Copiado!' : 'Email'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: '1rem' }}>
                            <p className="section-label">Tags & Projetos</p>
                            <div className="modal-tags">
                                {candidate.friend_group === 'Undergrounds' && <span className="tag tag-undergrounds">Undergrounds</span>}
                                {candidate.friend_group === 'Girlgroup' && <span className="tag tag-girlgroup">Girlgroup</span>}
                                {candidate.labs?.map((l, i) => <span key={i} className="tag tag-lab">{l}</span>)}
                                {candidate.interests?.map((t, i) => <span key={i} className="tag tag-int">{t}</span>)}
                            </div>
                        </div>

                        <div>
                            <p className="section-label">Sobre mim</p>
                            {/* Renderização com Markdown e preservação de quebras de linha */}
                            <div
                                className="modal-bio"
                                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={parseMarkdown(candidate.bio)}
                            />
                        </div>

                        <div className="modal-question">
                            <p className="section-label">O que o apadrinhamento representa para você?</p>
                            <div
                                style={{ whiteSpace: 'pre-wrap', fontFamily: "'Space Mono', monospace", fontSize: '.88rem', fontStyle: 'italic', lineHeight: '1.9', color: 'var(--text)' }}
                                dangerouslySetInnerHTML={parseMarkdown(candidate.question)}
                            />
                        </div>

                        <button className="btn-submit" onClick={() => { onClose(); onApply(candidate.name); }} style={{ marginTop: '.5rem' }}>
                            Escolho você
                        </button>

                        {/* Comments Section */}
                        <div className="comments-section">
                            <p className="section-label" style={{ marginBottom: '1rem' }}>Comentários ({comments.length})</p>

                            {session ? (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <textarea
                                        className="apply-textarea"
                                        placeholder="Registre sua resenha..."
                                        style={{ minHeight: '60px' }}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <button className="btn-submit" style={{ alignSelf: 'flex-end', width: 'auto', padding: '0.5rem 1rem' }} onClick={handlePostComment} disabled={isSubmitting}>
                                        Comentar
                                    </button>
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Faça login para comentar.</p>
                            )}

                            {comments.map(c => (
                                <div key={c.id} className="comment-item">
                                    <div className="comment-header">
                                        <span><span className="comment-author">@{c.username}</span> • {formatDate(c.created_at)}</span>
                                        {session && (session.role === 'admin' || session.userId === c.user_id) && (
                                            <button className="comment-del" onClick={() => handleDeleteComment(c.id)}>Excluir</button>
                                        )}
                                    </div>
                                    <p className="comment-text">{c.comment}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}