import { useState, useEffect } from 'react';
import { getInitials } from '../utils/helpers';
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
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) {
        setCandidates(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch candidates');
    }
  };

  const handleOpenDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const handleOpenApply = (padrinhoName = null) => {
    if (!session) {
      setAlertConfig({
        isOpen: true,
        title: 'Ops!',
        message: 'Você precisa fazer login para enviar sua candidatura.'
      });
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
                  <img className="card-img" src={p.img} alt={p.name} loading="lazy" />
                  <div className="card-img-overlay"></div>
                </div>
              ) : (
                <div className="card-img-placeholder">{getInitials(p.name)}</div>
              )}

              <div className="card-body">
                <p className="card-id">PADRINHO_{String(p.user_id).padStart(4, '0')}</p>
                <p className="card-name">{p.name}</p>
                <div className="card-tags">
                  {p.labs?.map((l, idx) => <span key={`lab-${idx}`} className="tag tag-lab">{l}</span>)}
                  {p.interests?.slice(0, 2).map((t, idx) => <span key={`int-${idx}`} className="tag tag-int">{t}</span>)}
                </div>
              </div>

              <button
                className="btn-choose"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenApply(p.name);
                }}
              >
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
        candidate={selectedCandidate}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApply={handleOpenApply}
      />

      <ApplyModal
        targetPadrinho={applyTarget}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ isOpen: false, title: '', message: '' })}
      />
    </div>
  );
}