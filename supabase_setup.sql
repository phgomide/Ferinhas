-- ════════════════════════════════════════════════════════════
--  SUPABASE SETUP — Programa de Apadrinhamento
--  Execute no SQL Editor: https://supabase.com/dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- 1. Tabela de candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
  id                BIGSERIAL PRIMARY KEY,
  nome_usuario      TEXT        NOT NULL,
  sobre_usuario     TEXT,
  padrinho_escolhido TEXT       NOT NULL DEFAULT 'TANTO_FAZ',
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índice para consultas por padrinho
CREATE INDEX IF NOT EXISTS idx_candidaturas_padrinho
  ON candidaturas (padrinho_escolhido);

-- 3. Row Level Security — leitura bloqueada publicamente,
--    apenas inserção anônima permitida
ALTER TABLE candidaturas ENABLE ROW LEVEL SECURITY;

-- Permite inserção pública (anon key)
CREATE POLICY "allow_anon_insert"
  ON candidaturas
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Bloqueia leitura pública (apenas service_role lê)
-- Se quiser que usuários autenticados leiam, troque TO anon por TO authenticated
CREATE POLICY "deny_public_select"
  ON candidaturas
  FOR SELECT
  USING (false);

-- ════════════════════════════════════════════════════════════
--  COMO USAR
-- ════════════════════════════════════════════════════════════
-- Após rodar este SQL:
-- 1. Vá em Settings → API no painel do Supabase.
-- 2. Copie "Project URL" e "anon public key".
-- 3. Cole em supabase.js:
--      const SUPABASE_URL = 'https://SEU_PROJECT_ID.supabase.co';
--      const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
-- 4. Para visualizar candidaturas recebidas:
--      SELECT * FROM candidaturas ORDER BY criado_em DESC;
-- ════════════════════════════════════════════════════════════
