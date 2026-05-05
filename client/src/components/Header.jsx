export default function Header({ session, currentView, setView, onLogout }) {
    return (
        <header>
            <div className="corner-deco corner-tl"></div>
            <div className="corner-deco corner-tr"></div>
            <div className="corner-deco corner-bl"></div>
            <div className="corner-deco corner-br"></div>

            {session && (
                <div className="header-nav">
                    <span className="user-badge">@{session.username}</span>

                    <button className={`btn-nav ${currentView === 'candidatos' ? 'active' : ''}`} onClick={() => setView('candidatos')}>
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Candidatos
                    </button>

                    {(session.role === 'admin' || session.role === 'padrinho') && (
                        <button className={`btn-nav ${currentView === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
                            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Meu Perfil
                        </button>
                    )}

                    {session.role === 'admin' && (
                        <button className={`btn-nav ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>
                            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            Admin
                        </button>
                    )}

                    <button className={`btn-nav ${currentView === 'contato' ? 'active' : ''}`} onClick={() => setView('contato')}>
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Contato
                    </button>

                    <button className="btn-nav" onClick={onLogout}>
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sair
                    </button>
                </div>
            )}

            <span className="eyebrow">UFPB &nbsp;·&nbsp; Veteranos</span>
            <h1><span className="dim">Programa de</span><br /><span className="hi">Apadrinhamento</span></h1>
            <div className="header-sub">
                <p>Meet people before you actually meet them :P</p>
            </div>
        </header>
    );
}