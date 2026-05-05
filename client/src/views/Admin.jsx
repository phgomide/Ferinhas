import { useState, useEffect } from 'react';
import { formatDate } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

export default function Admin({ session, navigateTo }) {
    const [activeTab, setActiveTab] = useState('respostas');
    const [stats, setStats] = useState({ total: 0, today: 0, random: 0 });
    const [candidaturas, setCandidaturas] = useState([]);
    const [users, setUsers] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');

    // Modals state
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });
    const [readModal, setReadModal] = useState({ isOpen: false, data: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, candRes, usersRes] = await Promise.all([
                fetch('/api/stats'), fetch('/api/candidaturas'), fetch('/api/users')
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (candRes.ok) setCandidaturas(await candRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());

            setLastUpdated(`Atualizado ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
        } catch (err) {
            console.error(err);
        }
    };

    const confirmAction = (title, message, actionFn) => {
        setConfirmConfig({
            isOpen: true,
            title,
            message,
            onConfirm: async () => {
                setConfirmConfig({ ...confirmConfig, isOpen: false });
                await actionFn();
                loadData();
            }
        });
    };

    const deleteCandidatura = (id) => {
        confirmAction('Deletar Candidatura', 'Deseja excluir esta resposta permanentemente?', async () => {
            await fetch(`/api/candidaturas/${id}`, { method: 'DELETE' });
        });
    };

    const deleteUser = (id) => {
        confirmAction('Deletar Usuário', 'Excluir este usuário e seu perfil permanentemente?', async () => {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
        });
    };

    const changeRole = (id, role) => {
        const messages = {
            'admin': 'Tornar este usuário um Administrador?',
            'padrinho': 'Tornar este usuário um Padrinho?',
            'candidato': 'Rebaixar este usuário para Candidato?'
        };
        confirmAction('Alterar Permissão', messages[role], async () => {
            await fetch(`/api/users/${id}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });
        });
    };

    const resetPassword = (id) => {
        confirmAction('Resetar Senha', 'Gerar uma nova senha aleatória para este usuário?', async () => {
            const res = await fetch(`/api/users/${id}/reset-password`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setAlertConfig({
                    isOpen: true,
                    title: 'Senha Redefinida',
                    message: `A nova senha gerada é:\n\n${data.newPassword}\n\nCopie e envie ao usuário imediatamente.`
                });
            }
        });
    };

    const exportCSV = () => {
        const header = 'id,nome_usuario,sobre_usuario,padrinho_escolhido,usuario_login,criado_em';
        const lines = candidaturas.map(r => [
            r.id,
            `"${(r.nome_usuario || '').replace(/"/g, '""')}"`,
            `"${(r.sobre_usuario || '').replace(/"/g, '""')}"`,
            `"${(r.padrinho_escolhido || '').replace(/"/g, '""')}"`,
            r.usuario_login,
            r.criado_em
        ].join(','));

        const csv = [header, ...lines].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `candidaturas_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="view active">
            <div className="admin-wrap">
                <div className="admin-header">
                    <div>
                        <p className="admin-title">Painel Administrativo</p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '.6rem', color: 'var(--muted)', letterSpacing: '.1em', marginTop: '.3rem' }}>
              // Controle Geral
                        </p>
                    </div>
                    <span className="admin-meta">{lastUpdated}</span>
                </div>

                <div className="admin-stats">
                    <div className="stat-card">
                        <p className="stat-label">Total de Candidaturas</p>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Hoje</p>
                        <p className="stat-value">{stats.today}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Tanto faz papai</p>
                        <p className="stat-value">{stats.random}</p>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button className={`btn-tab ${activeTab === 'respostas' ? 'active' : ''}`} onClick={() => setActiveTab('respostas')}>
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Respostas
                    </button>
                    <button className={`btn-tab ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Usuários
                    </button>
                </div>

                {activeTab === 'respostas' && (
                    <div className="admin-table-wrap">
                        <div className="admin-table-header">
                            <span className="admin-table-label">// Registro de Candidaturas</span>
                            <button className="btn-export" onClick={exportCSV}>Exportar CSV</button>
                        </div>
                        {candidaturas.length === 0 ? (
                            <div className="empty-state">Nenhuma candidatura recebida ainda.</div>
                        ) : (
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
                                    {candidaturas.map(r => (
                                        <tr key={r.id}>
                                            <td className="td-date">{r.id}</td>
                                            <td className="td-name">{r.nome_usuario}</td>
                                            <td className="td-padrinho">{r.padrinho_escolhido}</td>
                                            <td className="td-date">{r.usuario_login}</td>
                                            <td className="td-date">{formatDate(r.criado_em)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-export" onClick={() => setReadModal({ isOpen: true, data: r })}>Ler</button>
                                                    <button className="btn-danger" onClick={() => deleteCandidatura(r.id)}>Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'usuarios' && (
                    <div className="admin-table-wrap">
                        <div className="admin-table-header">
                            <span className="admin-table-label">// Gestão de Usuários</span>
                        </div>
                        {users.length === 0 ? (
                            <div className="empty-state">Nenhum usuário encontrado.</div>
                        ) : (
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
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="td-date">{u.id}</td>
                                            <td className="td-name">{u.username}</td>
                                            <td className="td-date">{u.role.toUpperCase()}</td>
                                            <td>
                                                <div className="table-actions">
                                                    {u.role === 'candidato' && (
                                                        <>
                                                            <button className="btn-promote" onClick={() => changeRole(u.id, 'padrinho')}>Para Padrinho</button>
                                                            <button className="btn-promote" onClick={() => changeRole(u.id, 'admin')}>Para Admin</button>
                                                        </>
                                                    )}
                                                    {u.role === 'padrinho' && (
                                                        <>
                                                            <button className="btn-promote" onClick={() => changeRole(u.id, 'admin')}>Para Admin</button>
                                                            <button className="btn-warning" onClick={() => changeRole(u.id, 'candidato')}>Rebaixar</button>
                                                            <button className="btn-export" onClick={() => navigateTo('perfil', u.id)}>Editar Perfil</button>
                                                        </>
                                                    )}
                                                    {u.role === 'admin' && session.userId !== u.id && (
                                                        <>
                                                            <button className="btn-warning" onClick={() => changeRole(u.id, 'padrinho')}>Para Padrinho</button>
                                                            <button className="btn-warning" onClick={() => changeRole(u.id, 'candidato')}>Para Candidato</button>
                                                        </>
                                                    )}
                                                    {session.userId !== u.id && (
                                                        <>
                                                            <button className="btn-warning" onClick={() => resetPassword(u.id)}>Reset Senha</button>
                                                            <button className="btn-danger" onClick={() => deleteUser(u.id)}>Del</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ isOpen: false, title: '', message: '' })}
            />

            {/* Admin Read Bio Modal */}
            <div className={`apply-overlay ${readModal.isOpen ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('apply-overlay') && setReadModal({ isOpen: false, data: null })}>
                <div className="apply-card">
                    <button className="apply-card-close" onClick={() => setReadModal({ isOpen: false, data: null })}>✕</button>
                    <p className="apply-title">{readModal.data?.nome_usuario}</p>
                    <p className="apply-subtitle">@{readModal.data?.usuario_login}</p>
                    <div className="apply-field">
                        <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                            {readModal.data?.sobre_usuario || 'Nenhuma informação adicional fornecida.'}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}