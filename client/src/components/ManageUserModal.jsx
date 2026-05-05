import { useState, useEffect } from 'react';

export default function ManageUserModal({ user, isOpen, onClose, onAction, session }) {
    const [role, setRole] = useState('');
    const [group, setGroup] = useState('');

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setGroup(user.friend_group || '');
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const isManagingSelf = session.userId === user.id;

    const handleSaveChanges = () => {
        if (!isManagingSelf && role !== user.role) {
            onAction('changeRole', { id: user.id, role });
        }
        if (group !== (user.friend_group || '')) {
            onAction('changeGroup', { id: user.id, group });
        }
        onClose();
    };

    return (
        <div className="apply-overlay open" onClick={(e) => e.target.classList.contains('apply-overlay') && onClose()}>
            <div className="apply-card">
                <button className="apply-card-close" onClick={onClose}>✕</button>
                <p className="apply-title">Gerenciar Usuário</p>
                <p className="apply-subtitle" style={{ color: 'var(--cyan)' }}>@{user.username}</p>

                <div className="apply-field">
                    <label className="apply-label">Papel (Role)</label>
                    <select
                        className="apply-input"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        disabled={isManagingSelf} /* Bloqueia a alteração do próprio papel */
                    >
                        <option value="candidato">Candidato</option>
                        <option value="padrinho">Padrinho</option>
                        <option value="admin">Admin</option>
                    </select>
                    {isManagingSelf && <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Você não pode alterar seu próprio papel.</p>}
                </div>

                <div className="apply-field">
                    <label className="apply-label">Tag de Grupo</label>
                    <select
                        className="apply-input"
                        value={group}
                        onChange={e => setGroup(e.target.value)}
                        disabled={role !== 'padrinho' && role !== 'admin'} /* Permite para admins */
                    >
                        <option value="">Nenhum</option>
                        <option value="Undergrounds">Undergrounds</option>
                        <option value="Girlgroup">Girlgroup</option>
                    </select>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <p className="section-label" style={{ marginBottom: '1rem', color: isManagingSelf ? 'var(--muted)' : 'var(--red)' }}>Ações Perigosas</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-warning"
                            style={{ flex: 1 }}
                            onClick={() => onAction('resetPassword', { id: user.id })}
                            disabled={isManagingSelf} /* Bloqueia resetar a própria senha */
                        >
                            Resetar Senha
                        </button>
                        <button
                            className="btn-danger"
                            style={{ flex: 1 }}
                            onClick={() => onAction('deleteUser', { id: user.id })}
                            disabled={isManagingSelf} /* Bloqueia deletar a si mesmo */
                        >
                            Excluir Usuário
                        </button>
                    </div>
                </div>

                <button className="btn-submit" style={{ marginTop: '2rem' }} onClick={handleSaveChanges}>Salvar Alterações</button>
            </div>
        </div>
    );
}