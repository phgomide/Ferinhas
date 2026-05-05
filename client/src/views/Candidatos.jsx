import { useState, useEffect } from 'react';
import { getInitials, getImageUrl } from '../utils/helpers';
import CandidateModal from '../components/CandidateModal';
import ApplyModal from '../components/ApplyModal';
import AlertModal from '../components/AlertModal';

export default function Candidatos({ session }) {
  const [candidates, setCandidates] = useState([]);

  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [applyTarget, setApplyTarget] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchCandidates();
  }, [session]);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) setCandidates(await res.json());
    } catch (err) {
      console.error('Failed to fetch candidates');
    }
  };

  const handleOpenDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const handleToggleLike = async (padrinhoId) => {
    if (!session) {
      setAlertConfig({ isOpen: true, title: 'Ops!', message: 'Faça login para curtir o perfil.' });
      return;
    }
    try {
      const res = await fetch(`/api/profile/${padrinhoId}/like`, { method: 'POST' });
      if (res.ok) {
        const { liked } = await res.json();
        setCandidates(prev => prev.map(c =>
          c.user_id === padrinhoId ? { ...c, is_liked: liked, likes_count: c.likes_count + (liked ? 1 : -1) } : c
        ));
        if (selectedCandidate?.user_id === padrinhoId) {
          setSelectedCandidate(prev => ({ ...prev, is_liked: liked, likes_count: prev.likes_count + (liked ? 1 : -1) }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenApply = (padrinhoName = null) => {
    if (!session) {
      setAlertConfig({ isOpen: true, title: 'Ops!', message: 'Você precisa fazer login para enviar sua candidatura.' });
      return;
    }
    setApplyTarget(padrinhoName);
    setIsApplyOpen(true);
  };

  return (
    <div className="view active">
      <main>
        <div className="grid-header">
          <span className="grid-label">// Candidatos ao Apadrinhamento</span>
          <div className="grid-header-line"></div>
          <span className="grid-count">{String(candidates.length).padStart(3, '0')}</span>
        </div>

        <div className="grid">
          {candidates.map((p, i) => (
            <article
              key={p.user_id}
              className="card"
              tabIndex="0"
              role="button"
              onClick={() => handleOpenDetails(p)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenDetails(p); }}
              style={{ animationDelay: `${(i % 6) * 0.05}s` }}
            >
              {p.img ? (
                <div className="card-img-wrap">
                  <img className="card-img" src={getImageUrl(p.img)} alt={p.name} loading="lazy" />
                  <div className="card-img-overlay"></div>
                </div>
              ) : (
                <div className="card-img-placeholder">{getInitials(p.name)}</div>
              )}

              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <p className="card-id">PADRINHO_{String(p.user_id).padStart(4, '0')}</p>
                  <span className={`like-btn ${p.is_liked ? 'liked' : ''}`} style={{ fontSize: '0.65rem' }}>
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    {p.likes_count}
                  </span>
                </div>

                <p className="card-name">{p.name}</p>

                <div className="card-tags">
                  {p.friend_group === 'Undergrounds' && <span className="tag tag-undergrounds">Undergrounds</span>}
                  {p.friend_group === 'Girlgroup' && <span className="tag tag-girlgroup">Girlgroup</span>}
                  {p.labs?.map((l, idx) => <span key={`lab-${idx}`} className="tag tag-lab">{l}</span>)}
                  {p.interests?.slice(0, 2).map((t, idx) => <span key={`int-${idx}`} className="tag tag-int">{t}</span>)}
                </div>
              </div>

              <button className="btn-choose" onClick={(e) => { e.stopPropagation(); handleOpenApply(p.name); }}>
                Escolho você
              </button>
            </article>
          ))}
        </div>
      </main>

      <div className="tanto-faz-wrap">
        <button className="btn-tanto-faz" onClick={() => handleOpenApply(null)}>
          Tanto faz papai
        </button>
      </div>

      <CandidateModal
        session={session}
        candidate={selectedCandidate}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApply={handleOpenApply}
        onToggleLike={handleToggleLike}
      />

      <ApplyModal targetPadrinho={applyTarget} isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />

      <AlertModal isOpen={alertConfig.isOpen} title={alertConfig.title} message={alertConfig.message} onClose={() => setAlertConfig({ isOpen: false, title: '', message: '' })} />
    </div>
  );
}