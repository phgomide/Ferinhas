import { useState, useEffect, useMemo } from 'react';
import { formatDate } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import ManageUserModal from '../components/ManageUserModal';

const KebabMenu = ({ onSelect, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleSelect = (action) => {
        setIsOpen(false);
        onSelect(action, user);
    };
    return (
        <div className="kebab-menu-container">
            <button className="kebab-button" onClick={() => setIsOpen(!isOpen)}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            {isOpen && (
                <div className="kebab-dropdown">
                    <button className="kebab-dropdown-item" onClick={() => handleSelect('manage')}>Gerenciar Usuário</button>
                    <button className="kebab-dropdown-item" onClick={() => handleSelect('editProfile')}>Editar Perfil</button>
                </div>
            )}
        </div>
    );
};

export default function Admin({ session, navigateTo }) {
    if (session?.role !== 'admin') {
        return (
            <div className="admin-container">
                <div className="admin-content" style={{ textAlign: 'center', width: '100%' }}>
                    <h2 className="admin-view-title" style={{ color: 'var(--red)' }}>Acesso Negado</h2>
                    <p className="admin-view-subtitle">Você não tem permissão para visualizar esta página.</p>
                </div>
            </div>
        );
    }

    const [view, setView] = useState('dashboard');
    const [stats, setStats] = useState({ total: 0, today: 0, random: 0 });
    const [candidaturas, setCandidaturas] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [groupFilter, setGroupFilter] = useState('');

    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false });
    const [manageUser, setManageUser] = useState(null);
    const [readModal, setReadModal] = useState({ isOpen: false, data: null });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [statsRes, candRes, usersRes] = await Promise.all([
                fetch('/api/stats'), fetch('/api/candidaturas'), fetch('/api/users')
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (candRes.ok) setCandidaturas(await candRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (err) { console.error(err); }
    };

    const confirmAction = (title, message, actionFn) => {
        setConfirmConfig({
            isOpen: true, title, message,
            onConfirm: async () => {
                setConfirmConfig({ isOpen: false });
                await actionFn();
                await loadData();
            }
        });
    };

    const handleUserAction = (action, payload) => {
        setManageUser(null);
        switch (action) {
            case 'changeRole':
                confirmAction('Alterar Papel', `Tornar este usuário ${payload.role.toUpperCase()}?`, async () =>
                    await fetch(`/api/users/${payload.id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: payload.role }) })
                );
                break;
            case 'changeGroup':
                confirmAction('Alterar Grupo', `Atribuir o grupo ${payload.group || 'Nenhum'}?`, async () =>
                    await fetch(`/api/users/${payload.id}/group`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group: payload.group }) })
                );
                break;
            case 'resetPassword':
                confirmAction('Resetar Senha', 'Gerar nova senha aleatória?', async () => {
                    const res = await fetch(`/api/users/${payload.id}/reset-password`, { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        setAlertConfig({ isOpen: true, title: 'Senha Redefinida', message: `A nova senha é:\n\n${data.newPassword}\n\nCopie e envie ao usuário.` });
                    }
                });
                break;
            case 'deleteUser':
                confirmAction('Excluir Usuário', 'Excluir este usuário permanentemente?', async () => await fetch(`/api/users/${payload.id}`, { method: 'DELETE' }));
                break;
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (roleFilter === '' || user.role === roleFilter) &&
            (groupFilter === '' || user.friend_group === groupFilter)
        );
    }, [users, searchQuery, roleFilter, groupFilter]);

    const exportCSV = () => {
        const lines = candidaturas.map(r => [r.id, `"${(r.nome_usuario || '').replace(/"/g, '""')}"`, `"${(r.sobre_usuario || '').replace(/"/g, '""')}"`, `"${(r.padrinho_escolhido || '').replace(/"/g, '""')}"`, r.usuario_login, r.criado_em].join(','));
        const csv = ['id,nome_usuario,sobre_usuario,padrinho_escolhido,usuario_login,criado_em', ...lines].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `candidaturas_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <nav className="admin-sidebar-nav">
                    <a href="#" className={`admin-sidebar-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Dashboard
                    </a>
                    <a href="#" className={`admin-sidebar-link ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Usuários
                    </a>
                    <a href="#" className={`admin-sidebar-link ${view === 'applications' ? 'active' : ''}`} onClick={() => setView('applications')}>
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>Candidaturas
                    </a>
                </nav>
            </aside>

            <main className="admin-content">
                {view === 'dashboard' && (
                    <>
                        <div className="admin-view-header">
                            <h2 className="admin-view-title">Dashboard</h2>
                            <p className="admin-view-subtitle">Visão geral e estatísticas do sistema</p>
                        </div>
                        <div className="admin-grid">
                            <div className="admin-card">
                                <p className="stat-label" style={{ color: 'var(--cyan)' }}>Total de Candidaturas</p>
                                <p className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.total}</p>
                            </div>
                            <div className="admin-card">
                                <p className="stat-label" style={{ color: 'var(--purple2)' }}>Chegaram Hoje</p>
                                <p className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.today}</p>
                            </div>
                            <div className="admin-card">
                                <p className="stat-label" style={{ color: 'var(--accent)' }}>Tanto faz papai</p>
                                <p className="stat-value" style={{ fontSize: '2.5rem' }}>{stats.random}</p>
                            </div>
                        </div>
                    </>
                )}

                {view === 'users' && (
                    <>
                        <div className="admin-view-header">
                            <h2 className="admin-view-title">Gerenciamento de Usuários</h2>
                            <p className="admin-view-subtitle">Edite permissões, atribua tags e gerencie contas</p>
                        </div>
                        <div className="user-controls">
                            <input type="text" className="apply-input" placeholder="Buscar por usuário..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
                            <select className="apply-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">Todos os Papéis</option><option value="candidato">Candidato</option><option value="padrinho">Padrinho</option><option value="admin">Admin</option></select>
                            <select className="apply-input" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}><option value="">Todos os Grupos</option><option value="Undergrounds">Undergrounds</option><option value="Girlgroup">Girlgroup</option></select>
                        </div>
                        <div className="admin-card" style={{ padding: 0 }}>
                            <table className="elegant-table">
                                <thead><tr><th>Usuário</th><th>Papel</th><th>Grupo</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="td-name">
                                                {u.username}
                                                {session.userId === u.id && <span style={{ fontSize: '0.6rem', color: 'var(--cyan)', marginLeft: '0.5rem' }}>(VOCÊ)</span>}
                                            </td>
                                            <td>{u.role}</td>
                                            <td>{u.friend_group ? (u.friend_group === 'Undergrounds' ? <span className="tag tag-undergrounds">Undergrounds</span> : <span className="tag tag-girlgroup">Girlgroup</span>) : <span style={{ color: 'var(--muted)' }}>-</span>}</td>
                                            <td>
                                                <KebabMenu user={u} onSelect={(action, user) => action === 'manage' ? setManageUser(user) : navigateTo('perfil', user.id)} />
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário encontrado.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {view === 'applications' && (
                    <>
                        <div className="admin-view-header">
                            <h2 className="admin-view-title">Candidaturas Recebidas</h2>
                            <p className="admin-view-subtitle">Visualize e gerencie as aplicações de apadrinhamento</p>
                        </div>
                        <div className="admin-card" style={{ padding: 0 }}>
                            <div className="admin-table-header">
                                <span className="admin-table-label">// Registro de Candidaturas</span>
                                <button className="btn-export" onClick={exportCSV}>Exportar CSV</button>
                            </div>
                            <table className="elegant-table">
                                <thead><tr><th>Nome</th><th>Padrinho Escolhido</th><th>Login do Autor</th><th>Data</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {candidaturas.length > 0 ? candidaturas.map(r => (
                                        <tr key={r.id}>
                                            <td className="td-name">{r.nome_usuario}</td>
                                            <td style={{ color: 'var(--accent2)' }}>{r.padrinho_escolhido}</td>
                                            <td>@{r.usuario_login}</td>
                                            <td>{formatDate(r.criado_em)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-export" onClick={() => setReadModal({ isOpen: true, data: r })}>Ler Resposta</button>
                                                    <button className="btn-danger" onClick={() => confirmAction('Excluir Candidatura?', 'Esta ação não pode ser desfeita.', async () => await fetch(`/api/candidaturas/${r.id}`, { method: 'DELETE' }))}>Excluir</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma candidatura recebida.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>

            <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig({ isOpen: false })} />
            <AlertModal isOpen={alertConfig.isOpen} title={alertConfig.title} message={alertConfig.message} onClose={() => setAlertConfig({ isOpen: false })} />
            <ManageUserModal session={session} user={manageUser} isOpen={!!manageUser} onClose={() => setManageUser(null)} onAction={handleUserAction} />

            <div className={`apply-overlay ${readModal.isOpen ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('apply-overlay') && setReadModal({ isOpen: false, data: null })}>
                <div className="apply-card">
                    <button className="apply-card-close" onClick={() => setReadModal({ isOpen: false, data: null })}>✕</button>
                    <p className="apply-title">{readModal.data?.nome_usuario}</p>
                    <p className="apply-subtitle">@{readModal.data?.usuario_login}</p>
                    <div className="apply-field"><p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{readModal.data?.sobre_usuario || 'Nenhuma informação adicional fornecida.'}</p></div>
                </div>
            </div>
        </div>
    );
}