import { useState, useEffect } from 'react';

export default function ApplyModal({ targetPadrinho, isOpen, onClose }) {
    const [nome, setNome] = useState('');
    const [sobre, setSobre] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNome('');
            setSobre('');
            setFeedback({ msg: '', type: '' });
            setIsSubmitting(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!nome.trim()) {
            setFeedback({ msg: 'Por favor, informe seu nome.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ msg: 'Enviando...', type: '' });

        try {
            const res = await fetch('/api/candidaturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, sobre, padrinho: targetPadrinho })
            });

            if (!res.ok) throw new Error();

            setFeedback({ msg: 'Candidatura enviada com sucesso!', type: 'success' });
            setTimeout(() => onClose(), 2000);
        } catch (err) {
            setFeedback({ msg: 'Erro ao enviar. Tente novamente.', type: 'error' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`apply-overlay ${isOpen ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('apply-overlay') && onClose()}>
            <div className="apply-card">
                <button className="apply-card-close" onClick={onClose} aria-label="Fechar">✕</button>
                <p className="apply-title">Fale mais sobre você</p>
                <p className="apply-subtitle">// Candidatura ao Apadrinhamento</p>

                <div className="apply-target">
                    {targetPadrinho ? (
                        <>Enviando candidatura para <span>{targetPadrinho}</span></>
                    ) : (
                        <>Seleção aleatória — <span>Tanto faz papai</span></>
                    )}
                </div>

                <div className="apply-field">
                    <label className="apply-label">Meu nome</label>
                    <input className="apply-input" type="text" value={nome} onChange={e => setNome(e.target.value)} disabled={isSubmitting} />
                </div>

                <div className="apply-field">
                    <label className="apply-label">Sobre mim</label>
                    <textarea className="apply-textarea" value={sobre} onChange={e => setSobre(e.target.value)} disabled={isSubmitting}></textarea>
                </div>

                <button className="btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                    Enviar candidatura
                </button>

                {feedback.msg && <p className={`apply-feedback ${feedback.type}`}>{feedback.msg}</p>}
            </div>
        </div>
    );
}