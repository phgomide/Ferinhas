import { people } from './data.js';
import { renderGrid } from './grid.js';
import { initModal } from './modal.js';
import { initApplyForm, openApplyForm } from './apply.js';

// Boot
renderGrid(people);
initModal();
initApplyForm();

// "Tanto faz papai" button
document.getElementById('btnTantoFaz').addEventListener('click', () => {
  openApplyForm(null); // null = random / tanto faz
});
