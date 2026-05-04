let people = [];
let session = null;
let adminData = [];
let adminUsersData = [];
let editingUserId = null;

function customConfirm(title, message) {
  return new Promise(resolve => {
    const overlay = document.getElementById('customConfirmOverlay');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const btnOk = document.getElementById('confirmOkBtn');
    const btnCancel = document.getElementById('confirmCancelBtn');

    const cleanup = () => {
      overlay.classList.remove('open');
      btnOk.onclick = null;
      btnCancel.onclick = null;
    };

    btnOk.onclick = () => { cleanup(); resolve(true); };
    btnCancel.onclick = () => { cleanup(); resolve(false); };

    overlay.classList.add('open');
  });
}

function customAlert(title, message) {
  return new Promise(resolve => {
    const overlay = document.getElementById('customAlertOverlay');
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;

    const btnOk = document.getElementById('alertOkBtn');
    const cleanup = () => {
      overlay.classList.remove('open');
      btnOk.onclick = null;
    };
    btnOk.onclick = () => { cleanup(); resolve(); };
    overlay.classList.add('open');
  });
}

async function fetchCandidates() {
  try {
    const res = await fetch('/api/candidates');
    if (res.ok) {
      people = await res.json();
      renderGrid();
    }
  } catch (err) { }
}

async function checkSession() {
  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      session = await res.json();
      updateUIAfterLogin();
    }
  } catch (err) { }
}

function updateUIAfterLogin() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('registerOverlay').style.display = 'none';
  document.getElementById('headerNav').style.display = 'flex';
  document.getElementById('userBadge').textContent = `@${session.username}`;

  if (session.role === 'admin' || session.role === 'padrinho') {
    document.getElementById('navPerfil').style.display = '';
  } else {
    document.getElementById('navPerfil').style.display = 'none';
  }

  if (session.role === 'admin') {
    document.getElementById('navAdmin').style.display = '';
  } else {
    document.getElementById('navAdmin').style.display = 'none';
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  session = null;
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('headerNav').style.display = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  switchView('candidatos');
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));

  if (view === 'admin') {
    if (!session || session.role !== 'admin') return;
    document.getElementById('viewAdmin').classList.add('active');
    document.getElementById('navAdmin').classList.add('active');
    loadAdminData();
  } else if (view === 'perfil') {
    if (!session || (session.role !== 'admin' && session.role !== 'padrinho')) return;
    document.getElementById('viewPerfil').classList.add('active');
    document.getElementById('navPerfil').classList.add('active');
    if (!editingUserId) editingUserId = session.userId;
    document.getElementById('perfilTitle').textContent = (editingUserId === session.userId) ? 'Meu Perfil' : `Editando Perfil #${editingUserId}`;
    loadProfile(editingUserId);
  } else if (view === 'contato') {
    document.getElementById('viewContato').classList.add('active');
    document.getElementById('navContato').classList.add('active');
  } else {
    document.getElementById('viewCandidatos').classList.add('active');
    document.getElementById('navCandidatos').classList.add('active');
    fetchCandidates();
  }
}

function switchAdminTab(tab) {
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('adminRespostasWrap').style.display = 'none';
  document.getElementById('adminUsuariosWrap').style.display = 'none';

  if (tab === 'respostas') {
    document.querySelectorAll('.btn-tab')[0].classList.add('active');
    document.getElementById('adminRespostasWrap').style.display = 'block';
  } else {
    document.querySelectorAll('.btn-tab')[1].classList.add('active');
    document.getElementById('adminUsuariosWrap').style.display = 'block';
  }
}

function initials(name) {
  return name ? name.split(' ').slice(0, 2).map(w => w[0]).join('') : '?';
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const countLabel = document.getElementById('count-label');
  countLabel.textContent = String(people.length).padStart(3, '0');
  grid.innerHTML = '';

  people.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    const imgHtml = p.img
      ? `<div class="card-img-wrap"><img class="card-img" src="${p.img}" alt="${p.name}" loading="lazy"/><div class="card-img-overlay"></div></div>`
      : `<div class="card-img-placeholder">${initials(p.name)}</div>`;

    const labTags = p.labs.map(l => `<span class="tag tag-lab">${l}</span>`).join('');
    const intTags = p.interests.slice(0, 2).map(t => `<span class="tag tag-int">${t}</span>`).join('');

    card.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <p class="card-id">PADRINHO_${String(p.user_id).padStart(4, '0')}</p>
        <p class="card-name">${p.name}</p>
        <div class="card-tags">${labTags}${intTags}</div>
      </div>
      <button class="btn-choose" data-index="${i}">Escolho você</button>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.btn-choose')) return;
      openModal(i);
    });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.btn-choose')) openModal(i);
    });
    card.querySelector('.btn-choose').addEventListener('click', e => {
      e.stopPropagation();
      openApplyForm(p.name);
    });

    grid.appendChild(card);
  });
}

const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('modalClose');

function openModal(i) {
  const p = people[i];
  const imgHtml = p.img
    ? `<img class="modal-img" src="${p.img}" alt="${p.name}"/>`
    : `<div class="modal-img-placeholder">${initials(p.name)}</div>`;
  const labTags = p.labs.map(l => `<span class="tag tag-lab">${l}</span>`).join('');
  const intTags = p.interests.map(t => `<span class="tag tag-int">${t}</span>`).join('');
  const bioHtml = (p.bio || '').split('\n\n').map(para => `<p class="modal-bio">${para}</p>`).join('');

  let socialHtml = '';
  if (p.github || p.linkedin || p.email) {
    socialHtml += `<div class="social-links">`;
    if (p.github) socialHtml += `<a class="social-link" href="${p.github}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> Github</a>`;
    if (p.linkedin) socialHtml += `<a class="social-link" href="${p.linkedin}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn</a>`;
    if (p.email) socialHtml += `<a class="social-link" href="mailto:${p.email}"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email</a>`;
    socialHtml += `</div>`;
  }

  modal.innerHTML = `
    <div class="modal-img-col">${imgHtml}</div>
    <div class="modal-content">
      <div class="modal-meta">
        <div class="modal-meta-dot"></div>
        <span>PADRINHO_${String(p.user_id).padStart(4, '0')}</span>
      </div>
      <h2 class="modal-name">${p.name}</h2>
      ${socialHtml}
      <div style="margin-top:1rem">
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
        <p>${p.question || ''}</p>
      </div>
      <button class="btn-submit" onclick="openApplyForm('${p.name.replace(/'/g, "\\'")}');closeModal()" style="margin-top:.5rem">Escolho você</button>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeApplyForm(); closeAdminRead(); } });

let currentPadrinho = null;
const applyOverlay = document.getElementById('applyOverlay');
const applyFeedback = document.getElementById('applyFeedback');
const applyBtn = document.getElementById('applyBtn');
const applyNome = document.getElementById('applyNome');
const applySobre = document.getElementById('applySobre');
const applyTarget = document.getElementById('applyTarget');

function openApplyForm(padrinhoName) {
  if (!session) {
    customAlert('Ops!', 'Você precisa fazer login para enviar sua candidatura.');
    return;
  }
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

function closeApplyForm() {
  applyOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('applyClose').addEventListener('click', closeApplyForm);
applyOverlay.addEventListener('click', e => { if (e.target === applyOverlay) closeApplyForm(); });

applyBtn.addEventListener('click', async () => {
  if (!session) return;
  const nome = applyNome.value.trim();
  const sobre = applySobre.value.trim();
  if (!nome) {
    applyFeedback.textContent = 'Por favor, informe seu nome.';
    applyFeedback.className = 'apply-feedback error';
    applyNome.focus();
    return;
  }
  applyBtn.disabled = true;
  applyFeedback.textContent = 'Enviando...';
  applyFeedback.className = 'apply-feedback';

  try {
    const res = await fetch('/api/candidaturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, sobre, padrinho: currentPadrinho })
    });
    if (!res.ok) throw new Error();
    applyFeedback.textContent = 'Candidatura enviada com sucesso!';
    applyFeedback.className = 'apply-feedback success';
    setTimeout(closeApplyForm, 2000);
  } catch (err) {
    applyFeedback.textContent = 'Erro ao enviar. Tente novamente.';
    applyFeedback.className = 'apply-feedback error';
    applyBtn.disabled = false;
  }
});

document.getElementById('profImgFile').addEventListener('change', function () {
  const file = this.files[0];
  const preview = document.getElementById('profImgPreview');
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = 'none';
  }
});

async function loadProfile(uid) {
  try {
    const res = await fetch(`/api/profile/${uid}`);
    const data = res.ok ? await res.json() : {};
    document.getElementById('profName').value = data.name || '';
    document.getElementById('profLabs').value = data.labs || '';
    document.getElementById('profInterests').value = data.interests || '';
    document.getElementById('profGithub').value = data.github || '';
    document.getElementById('profLinkedin').value = data.linkedin || '';
    document.getElementById('profEmail').value = data.email || '';
    document.getElementById('profBio').value = data.bio || '';
    document.getElementById('profQuestion').value = data.question || '';

    document.getElementById('profImgFile').value = '';
    const imgPreview = document.getElementById('profImgPreview');
    if (data.img) {
      imgPreview.src = data.img;
      imgPreview.style.display = 'block';
      document.getElementById('existingImg').value = data.img;
    } else {
      imgPreview.style.display = 'none';
      document.getElementById('existingImg').value = '';
    }

    document.getElementById('profileFeedback').textContent = '';
  } catch (err) { }
}

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  const name = document.getElementById('profName').value.trim();
  const fb = document.getElementById('profileFeedback');

  if (!name) {
    fb.textContent = 'Nome é obrigatório.';
    fb.className = 'apply-feedback error';
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('labs', document.getElementById('profLabs').value.trim());
  formData.append('interests', document.getElementById('profInterests').value.trim());
  formData.append('github', document.getElementById('profGithub').value.trim());
  formData.append('linkedin', document.getElementById('profLinkedin').value.trim());
  formData.append('email', document.getElementById('profEmail').value.trim());
  formData.append('bio', document.getElementById('profBio').value.trim());
  formData.append('question', document.getElementById('profQuestion').value.trim());
  formData.append('existingImg', document.getElementById('existingImg').value);

  const fileInput = document.getElementById('profImgFile');
  if (fileInput.files[0]) {
    formData.append('imgFile', fileInput.files[0]);
  }

  try {
    const res = await fetch(`/api/profile/${editingUserId}`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const respData = await res.json();
      fb.textContent = 'Perfil salvo com sucesso!';
      fb.className = 'apply-feedback success';
      if (respData.img) {
        document.getElementById('existingImg').value = respData.img;
        document.getElementById('profImgPreview').src = respData.img;
        document.getElementById('profImgPreview').style.display = 'block';
      }
      fetchCandidates();
      setTimeout(() => fb.textContent = '', 3000);
    } else {
      const errData = await res.json();
      fb.textContent = errData.error || 'Erro ao salvar perfil.';
      fb.className = 'apply-feedback error';
    }
  } catch (err) {
    fb.textContent = 'Erro de conexão.';
    fb.className = 'apply-feedback error';
  }
});

async function loadAdminData() {
  try {
    const [statsRes, candRes, usersRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/candidaturas'),
      fetch('/api/users')
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      document.getElementById('statTotal').textContent = stats.total;
      document.getElementById('statToday').textContent = stats.today;
      document.getElementById('statRandom').textContent = stats.random;
      document.getElementById('adminMeta').textContent = `Atualizado ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (candRes.ok) {
      adminData = await candRes.json();
      renderAdminTable();
    }

    if (usersRes.ok) {
      adminUsersData = await usersRes.json();
      renderUsersTable();
    }
  } catch (err) { }
}

function renderAdminTable() {
  const body = document.getElementById('adminTableBody');
  if (adminData.length === 0) {
    body.innerHTML = `<div class="empty-state">Nenhuma candidatura recebida ainda.</div>`;
    return;
  }
  body.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Padrinho Escolhido</th>
          <th>Usuário</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${adminData.map((r, i) => `
          <tr>
            <td class="td-date">${r.id}</td>
            <td class="td-name">${escHtml(r.nome_usuario)}</td>
            <td class="td-padrinho">${escHtml(r.padrinho_escolhido)}</td>
            <td class="td-date">${escHtml(r.usuario_login)}</td>
            <td class="td-date">${fmtDate(r.criado_em)}</td>
            <td>
              <div class="table-actions">
                <button class="btn-export" onclick="openAdminRead(${i})">Ler</button>
                <button class="btn-danger" onclick="deleteCandidatura(${r.id})">Del</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderUsersTable() {
  const body = document.getElementById('adminUsersBody');
  if (adminUsersData.length === 0) {
    body.innerHTML = `<div class="empty-state">Nenhum usuário encontrado.</div>`;
    return;
  }
  body.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuário</th>
          <th>Papel</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${adminUsersData.map(u => `
          <tr>
            <td class="td-date">${u.id}</td>
            <td class="td-name">${escHtml(u.username)}</td>
            <td class="td-date">${u.role.toUpperCase()}</td>
            <td>
              <div class="table-actions">
                ${u.role === 'candidato' ? `
                  <button class="btn-promote" onclick="changeRole(${u.id}, 'padrinho')">Para Padrinho</button>
                  <button class="btn-promote" onclick="changeRole(${u.id}, 'admin')">Para Admin</button>
                ` : ''}
                
                ${u.role === 'padrinho' ? `
                  <button class="btn-promote" onclick="changeRole(${u.id}, 'admin')">Para Admin</button>
                  <button class="btn-warning" onclick="changeRole(${u.id}, 'candidato')">Rebaixar</button>
                  <button class="btn-export" onclick="adminEditProfile(${u.id})">Editar Perfil</button>
                ` : ''}
                
                ${u.role === 'admin' && session.userId !== u.id ? `
                  <button class="btn-warning" onclick="changeRole(${u.id}, 'padrinho')">Para Padrinho</button>
                  <button class="btn-warning" onclick="changeRole(${u.id}, 'candidato')">Para Candidato</button>
                ` : ''}

                ${session.userId !== u.id ? `<button class="btn-warning" onclick="resetPassword(${u.id})">Reset Senha</button>` : ''}
                
                ${session.userId !== u.id ? `<button class="btn-danger" onclick="deleteUser(${u.id})">Del</button>` : ''}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function deleteCandidatura(id) {
  if (!await customConfirm('Deletar Candidatura', 'Deseja excluir esta resposta permanentemente? Esta ação não pode ser desfeita.')) return;
  try {
    const res = await fetch(`/api/candidaturas/${id}`, { method: 'DELETE' });
    if (res.ok) loadAdminData();
  } catch (err) { }
}

async function deleteUser(id) {
  if (!await customConfirm('Deletar Usuário', 'Excluir este usuário permanentemente? O perfil associado também será apagado. Esta ação não pode ser desfeita.')) return;
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) loadAdminData();
  } catch (err) { }
}

async function changeRole(id, role) {
  const messages = {
    'admin': 'Tornar este usuário um Administrador? Ele terá acesso total ao sistema.',
    'padrinho': 'Tornar este usuário um Padrinho? Ele poderá editar seu próprio perfil.',
    'candidato': 'Rebaixar este usuário para Candidato? Ele perderá acessos especiais e as credenciais de edição.'
  };

  if (!await customConfirm('Alterar Permissão', messages[role])) return;

  try {
    const res = await fetch(`/api/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (res.ok) loadAdminData();
  } catch (err) { }
}

async function resetPassword(id) {
  if (!await customConfirm('Resetar Senha', 'Gerar uma nova senha aleatória para este usuário?')) return;
  try {
    const res = await fetch(`/api/users/${id}/reset-password`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      await customAlert('Senha Redefinida', `A nova senha gerada é:\n\n${data.newPassword}\n\nCopie e envie ao usuário imediatamente.`);
    }
  } catch (err) { }
}

function adminEditProfile(uid) {
  editingUserId = uid;
  switchView('perfil');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function exportCSV() {
  const header = 'id,nome_usuario,sobre_usuario,padrinho_escolhido,usuario_login,criado_em';
  const lines = adminData.map(r => [r.id, `"${(r.nome_usuario || '').replace(/"/g, '""')}"`,
  `"${(r.sobre_usuario || '').replace(/"/g, '""')}"`,
  `"${(r.padrinho_escolhido || '').replace(/"/g, '""')}"`,
  r.usuario_login, r.criado_em].join(',')
  );
  const csv = [header, ...lines].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `candidaturas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function openAdminRead(index) {
  const data = adminData[index];
  document.getElementById('readModalName').textContent = data.nome_usuario;
  document.getElementById('readModalUser').textContent = `@${data.usuario_login}`;
  document.getElementById('readModalBio').textContent = data.sobre_usuario || 'Nenhuma informação adicional fornecida.';
  document.getElementById('adminReadOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminRead() {
  document.getElementById('adminReadOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('adminReadClose').addEventListener('click', closeAdminRead);
document.getElementById('adminReadOverlay').addEventListener('click', e => { if (e.target === document.getElementById('adminReadOverlay')) closeAdminRead(); });

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const fb = document.getElementById('loginFeedback');

  if (!username || !password) {
    fb.textContent = 'Preencha usuário e senha.';
    fb.className = 'apply-feedback error';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      session = await res.json();
      updateUIAfterLogin();
      fb.textContent = '';
      editingUserId = session.userId;
    } else {
      const data = await res.json();
      fb.textContent = data.error || 'Erro ao entrar.';
      fb.className = 'apply-feedback error';
    }
  } catch (err) {
    fb.textContent = 'Erro de conexão.';
    fb.className = 'apply-feedback error';
  }
}

document.getElementById('showRegisterBtn').addEventListener('click', () => {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('registerOverlay').style.display = 'flex';
  document.getElementById('regUser').value = '';
  document.getElementById('regPass').value = '';
  document.getElementById('pwdStrength').classList.remove('show');
  document.getElementById('registerFeedback').textContent = '';
});

document.getElementById('backToLoginBtn').addEventListener('click', () => {
  document.getElementById('registerOverlay').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
});

document.getElementById('regPass').addEventListener('input', (e) => {
  const val = e.target.value;
  const strengthWrap = document.getElementById('pwdStrength');
  const b1 = document.getElementById('pwdBar1');
  const b2 = document.getElementById('pwdBar2');
  const b3 = document.getElementById('pwdBar3');
  const txt = document.getElementById('pwdText');

  b1.className = 'pwd-bar'; b2.className = 'pwd-bar'; b3.className = 'pwd-bar';

  if (val.length === 0) {
    strengthWrap.classList.remove('show');
    return;
  }

  strengthWrap.classList.add('show');

  let strength = 0;
  if (val.length >= 6) strength++;
  if (val.length >= 8 && /[A-Za-z]/.test(val) && /[0-9]/.test(val)) strength++;
  if (val.length >= 8 && /[^A-Za-z0-9]/.test(val)) strength++;

  if (strength === 0) {
    b1.classList.add('pwd-weak');
    txt.textContent = 'Fraca';
    txt.style.color = 'var(--red)';
  } else if (strength === 1) {
    b1.classList.add('pwd-medium'); b2.classList.add('pwd-medium');
    txt.textContent = 'Média';
    txt.style.color = 'var(--yellow)';
  } else {
    b1.classList.add('pwd-strong'); b2.classList.add('pwd-strong'); b3.classList.add('pwd-strong');
    txt.textContent = 'Forte';
    txt.style.color = 'var(--green)';
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  const fb = document.getElementById('registerFeedback');

  if (!username || !password || username.length < 3 || password.length < 6) {
    fb.textContent = 'Usuário (mín 3) e senha (mín 6).';
    fb.className = 'apply-feedback error';
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      session = await res.json();
      fb.textContent = 'Bem-vindo(a)!';
      fb.className = 'apply-feedback success';
      editingUserId = session.userId;
      setTimeout(() => {
        updateUIAfterLogin();
        fb.textContent = '';
      }, 1000);
    } else {
      const data = await res.json();
      fb.textContent = data.error || 'Erro ao criar conta.';
      fb.className = 'apply-feedback error';
    }
  } catch (err) {
    fb.textContent = 'Erro de conexão.';
    fb.className = 'apply-feedback error';
  }
});

document.getElementById('btnTantoFaz').addEventListener('click', () => openApplyForm(null));

document.getElementById('navPerfil').addEventListener('click', () => {
  editingUserId = session.userId;
});

fetchCandidates();
checkSession();