import { useState, useEffect } from 'react';

import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';

import Candidatos from './views/Candidatos';
import Contato from './views/Contato';
import Perfil from './views/Perfil';
import Admin from './views/Admin';

export default function App() {
    const [session, setSession] = useState(null);
    const [view, setView] = useState('candidatos');
    const [editingUserId, setEditingUserId] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/session');
            if (res.ok) {
                const data = await res.json();
                setSession(data);
                setEditingUserId(data.userId);
            }
        } catch (err) {
            console.error('Failed to fetch session', err);
        } finally {
            setLoadingSession(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        setSession(null);
        setView('candidatos');
    };

    const navigateTo = (newView, targetUserId = null) => {
        setView(newView);
        if (targetUserId) {
            setEditingUserId(targetUserId);
        } else if (newView === 'perfil' && session) {
            setEditingUserId(session.userId);
        }
    };

    if (loadingSession) return null;

    return (
        <>
            <div className="scanlines"></div>

            {!session && <AuthModal setSession={setSession} />}

            <Header
                session={session}
                currentView={view}
                setView={navigateTo}
                onLogout={handleLogout}
            />

            {/* Views Routing */}
            {view === 'candidatos' && <Candidatos session={session} />}
            {view === 'contato' && <Contato />}
            {view === 'perfil' && <Perfil session={session} editingUserId={editingUserId} navigateTo={navigateTo} />}
            {view === 'admin' && <Admin session={session} navigateTo={navigateTo} />}

            <Footer />
        </>
    );
}