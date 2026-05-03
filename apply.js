import { submitCandidatura } from './supabase.js';

const applyOverlay = document.getElementById('applyOverlay');
const applyClose   = document.getElementById('applyClose');
const applyForm    = document.getElementById('applyForm');
const applyTarget  = document.getElementById('applyTarget');
const applyNome    = document.getElementById('applyNome');
const applySobre   = document.getElementById('applySobre');
const applyBtn     = document.getElementById('applyBtn');
const applyFeedback= document.getElementById('applyFeedback');

let currentPadrinho = null;

export function openApplyForm(padrinhoName) {
  currentPadrinho = padrinhoName ?? null;

  applyTarget.innerHTML = padrinhoName
    ? `Enviando candidatura para <span>${padrinhoName}</span>`
    : `Seleção aleatória — <span>Tanto faz papai</span>`;

  applyNome.value = '';
  applySobre.value = '';
  applyFeedback.textContent = '';
  applyFeedback.className = 'apply-feedback';
  applyBtn.disabled = false;

  applyOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  applyNome.focus();
}

export function closeApplyForm() {
  applyOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

export function initApplyForm() {
  applyClose.addEventListener('click', closeApplyForm);
  applyOverlay.addEventListener('click', e => { if (e.target === applyOverlay) closeApplyForm(); });

  applyBtn.addEventListener('click', async () => {
    const nome  = applyNome.value.trim();
    const sobre = applySobre.value.trim();

    if (!nome) {
      applyFeedback.textContent = '// Por favor, informe seu nome.';
      applyFeedback.className = 'apply-feedback error';
      applyNome.focus();
      return;
    }

    applyBtn.disabled = true;
    applyFeedback.textContent = '// Enviando...';
    applyFeedback.className = 'apply-feedback';

    try {
      await submitCandidatura(nome, sobre, currentPadrinho);
      applyFeedback.textContent = '// Candidatura enviada com sucesso!';
      applyFeedback.className = 'apply-feedback success';
      setTimeout(closeApplyForm, 2000);
    } catch (err) {
      console.error(err);
      applyFeedback.textContent = '// Erro ao enviar. Tente novamente.';
      applyFeedback.className = 'apply-feedback error';
      applyBtn.disabled = false;
    }
  });
}
