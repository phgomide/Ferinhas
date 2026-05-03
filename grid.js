import { initials } from './utils.js';
import { openModal } from './modal.js';
import { openApplyForm } from './apply.js';

export function renderGrid(people) {
  const grid       = document.getElementById('grid');
  const countLabel = document.getElementById('count-label');
  countLabel.textContent = String(people.length).padStart(3, '0');

  people.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Ver perfil de ${p.name}`);

    const imgHtml = p.img
      ? `<div class="card-img-wrap"><img class="card-img" src="${p.img}" alt="${p.name}" loading="lazy" /><div class="card-img-overlay"></div></div>`
      : `<div class="card-img-placeholder">${initials(p.name)}</div>`;

    const labTags = p.labs.map(l => `<span class="tag tag-lab">${l}</span>`).join('');
    const intTags = p.interests.slice(0, 2).map(t => `<span class="tag tag-int">${t}</span>`).join('');

    card.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <p class="card-id">USER_${String(i + 1).padStart(4, '0')}</p>
        <p class="card-name">${p.name}</p>
        <div class="card-tags">${labTags}${intTags}</div>
      </div>
      <button class="btn-choose" data-index="${i}">Escolho você</button>
    `;

    // Click card body → open profile modal
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-choose')) return;
      openModal(people, i);
    });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.btn-choose')) openModal(people, i);
    });

    // Click "Escolho você" → open apply form
    card.querySelector('.btn-choose').addEventListener('click', e => {
      e.stopPropagation();
      openApplyForm(p.name);
    });

    grid.appendChild(card);
  });
}
