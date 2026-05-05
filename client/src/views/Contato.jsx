export default function Contato() {
  return (
    <div className="view active">
      <main>
        <div className="contact-wrap">
          <p className="admin-title">Informações de Contato</p>
          <p className="apply-subtitle" style={{ marginBottom: '2rem' }}>// Suporte e Equipe Staff</p>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted2)' }}>
            <p>Precisa de ajuda com sua candidatura ou enfrentou algum problema técnico?</p>
            <p>Entre em contato com nossa equipe administrativa através dos canais oficiais.</p>
            <br />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text)' }}>
              <p><strong>Email:</strong> walter.linhares@academico.ufpb.br</p>
              <p><strong>Discord:</strong> <a href="https://discord.gg/euPYvFfpXx" style={{ color: 'var(--accent)' }}>Servidor 2025.2</a></p>
              <p><strong>Local:</strong> Centro de Informática, UFPB</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}