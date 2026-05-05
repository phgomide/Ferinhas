import { useState } from 'react';

export default function AuthModal({ setSession }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState({ msg: '', type: '' });

    const getPasswordStrength = () => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)) strength++;
        if (password.length >= 8 && /[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setFeedback({ msg: 'Preencha usuário e senha.', type: 'error' });
            return;
        }
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setSession(data);
            } else {
                setFeedback({ msg: data.error || 'Erro ao entrar.', type: 'error' });
            }
        } catch (err) {
            setFeedback({ msg: 'Erro de conexão.', type: 'error' });
        }
    };

    const handleRegister = async () => {
        if (!username || !password || username.length < 3 || password.length < 6) {
            setFeedback({ msg: 'Usuário (mín 3) e senha (mín 6).', type: 'error' });
            return;
        }
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setFeedback({ msg: 'Bem-vindo(a)!', type: 'success' });
                setTimeout(() => setSession(data), 1000);
            } else {
                setFeedback({ msg: data.error || 'Erro ao criar conta.', type: 'error' });
            }
        } catch (err) {
            setFeedback({ msg: 'Erro de conexão.', type: 'error' });
        }
    };

    const strength = getPasswordStrength();
    const strengthClass = strength === 0 ? 'pwd-weak' : strength === 1 ? 'pwd-medium' : 'pwd-strong';
    const strengthText = strength === 0 ? 'Fraca' : strength === 1 ? 'Média' : 'Forte';
    const strengthColor = strength === 0 ? 'var(--red)' : strength === 1 ? 'var(--yellow)' : 'var(--green)';

    return (
        <div className="login-overlay" style={{ display: 'flex' }}>
            <div className="login-card">
                <div className="corner-deco corner-tl"></div>
                <div className="corner-deco corner-br" style={{ bottom: 0, right: 0, position: 'absolute' }}></div>

                <p className="login-title">{isRegistering ? 'Nova Conta' : 'Acesso ao Sistema'}</p>
                <p className="login-sub">{isRegistering ? '// Cadastro de Candidato' : '// Programa de Apadrinhamento · UFPB'}</p>

                <div className="apply-field">
                    <label className="apply-label">Usuário</label>
                    <input className="apply-input" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                </div>

                <div className="apply-field">
                    <label className="apply-label">Senha</label>
                    <input className="apply-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())} />

                    {isRegistering && password.length > 0 && (
                        <div className="pwd-strength show">
                            <div className={`pwd-bar ${strengthClass}`}></div>
                            <div className={`pwd-bar ${strength >= 1 ? strengthClass : ''}`}></div>
                            <div className={`pwd-bar ${strength >= 2 ? strengthClass : ''}`}></div>
                            <span className="pwd-text" style={{ color: strengthColor }}>{strengthText}</span>
                        </div>
                    )}
                </div>

                <button className="btn-submit" onClick={isRegistering ? handleRegister : handleLogin}>
                    {isRegistering ? 'Cadastrar' : 'Entrar'}
                </button>

                <button className="btn-secondary" onClick={() => { setIsRegistering(!isRegistering); setFeedback({ msg: '', type: '' }); }}>
                    {isRegistering ? 'Voltar ao Login' : 'Criar Conta'}
                </button>

                {feedback.msg && <p className={`apply-feedback ${feedback.type}`}>{feedback.msg}</p>}
            </div>
        </div>
    );
}