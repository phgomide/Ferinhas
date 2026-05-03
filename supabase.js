// ── SUPABASE CONFIG ──
// Substitua pelos seus valores reais do projeto Supabase.
// Encontre em: https://supabase.com/dashboard → Settings → API
const SUPABASE_URL = 'https://SEU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';

/**
 * Envia candidatura para tabela `candidaturas` no Supabase.
 * @param {string} nome         - Nome do candidato (preenchido pelo usuário)
 * @param {string} sobre        - Texto "sobre mim" do usuário
 * @param {string|null} padrinho - Nome do padrinho escolhido (null = "Tanto faz papai")
 */
export async function submitCandidatura(nome, sobre, padrinho) {
  const payload = {
    nome_usuario: nome,
    sobre_usuario: sobre,
    padrinho_escolhido: padrinho ?? 'TANTO_FAZ',
    criado_em: new Date().toISOString()
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/candidaturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return true;
}
