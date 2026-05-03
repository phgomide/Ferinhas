import { initials } from './utils.js';
import { openApplyForm } from './apply.js';

const overlay  = document.getElementById('overlay');
const modal    = document.getElementById('modal');
const closeBtn = document.getElementById('modalClose');

export function openModal(people, i) {
  const p = people[i];

  const imgHtml = p.img
    ? `<img class="modal-img" src="${p.img}" alt="${p.name}" />`
    : `<div class="modal-img-placeholder">${initials(p.name)}</div>`;

  const labTags = p.labs.map(l => `<span class="tag tag-lab">${l}</span>`).join('');
  const intTags = p.interests.map(t => `<span class="tag tag-int">${t}</span>`).join('');
  const bioHtml = p.bio.split('\n\n').map(para => `<p class="modal-bio">${para}</p>`).join('');

  modal.innerHTML = `
    <div class="modal-img-col">${imgHtml}</div>
    <div class="modal-content">
      <div class="modal-meta">
        <div class="modal-meta-dot"></div>
        <span>USER_${String(i + 1).padStart(4, '0')}</span>
        <span style="color: var(--border2);">·</span>
        <span>PADRINHO</span>
      </div>
      <h2 class="modal-name">${p.name}</h2>
      <div>
        <p class="section-label">Projetos &amp; Laboratórios</p>
        <div class="modal-tags">${labTags}</div>
      </div>
      <div>
        <p class="section-label">Interesses</p>
        <div class="modal-tags">${intTags}</div>
      </div>
      <div>
        <p class="section-label">Sobre mim</p>
        ${bioHtml}
      </div>
      <div class="modal-question">
        <p class="section-label">O que o apadrinhamento representa para você?</p>
        <p>${p.question}</p>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

export function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

export function initModal() {
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
