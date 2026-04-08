-- ============================================================
-- E-Trading — Supabase Schema completo
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USUARIOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  name             TEXT,
  password_hash    TEXT,                          -- NULL para usuarios de Google
  plan             TEXT NOT NULL DEFAULT 'pro_trial'
                     CHECK (plan IN ('free','starter','pro','elite','pro_trial')),
  trial_ends_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  xp               INTEGER NOT NULL DEFAULT 0,
  racha            INTEGER NOT NULL DEFAULT 0,
  last_active      DATE,
  liga_nivel       INTEGER NOT NULL DEFAULT 1,
  liga_pos         INTEGER,
  onboarding       JSONB,
  provider         TEXT DEFAULT 'credentials',   -- 'credentials' | 'google'
  provider_id      TEXT,                         -- Google sub
  stripe_customer_id TEXT,
  avatar_url       TEXT,
  role             TEXT NOT NULL DEFAULT 'user'
                     CHECK (role IN ('user','admin')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PORTAFOLIO ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cash       DECIMAL(14,2) NOT NULL DEFAULT 10000.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── POSICIONES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol     TEXT NOT NULL,
  shares     DECIMAL(18,8) NOT NULL,
  avg_price  DECIMAL(14,4) NOT NULL,
  opened_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

-- ─── HISTORIAL DE OPERACIONES ────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('buy','sell')),
  symbol      TEXT NOT NULL,
  shares      DECIMAL(18,8) NOT NULL,
  price       DECIMAL(14,4) NOT NULL,
  total       DECIMAL(14,2) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROGRESO DE RETOS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reto_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reto_id      TEXT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  score        INTEGER,                           -- % de aciertos
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, reto_id)
);

-- ─── INSIGNIAS GANADAS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ─── CLASES COMPLETADAS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS clases_completadas (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clase_id     TEXT NOT NULL,
  score        INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, clase_id)
);

-- ─── HISTORIAL CHAT IA ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  mode       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LÍMITES DIARIOS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_usage (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  ia_messages   INTEGER NOT NULL DEFAULT 0,
  clases_vistas INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- ─── LÍMITES SEMANALES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_usage (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  ops_count  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, week_start)
);

-- ─── LIGA SEMANAL ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS liga_weekly (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  xp_semanal INTEGER NOT NULL DEFAULT 0,
  liga_nivel INTEGER NOT NULL DEFAULT 1,
  posicion   INTEGER,
  PRIMARY KEY (user_id, week_start)
);

-- ─── CLICKS AFILIADOS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  broker     TEXT NOT NULL,
  source     TEXT,                                -- 'simulator'|'broker_page'|'ia'|'email'
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trades_user      ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user   ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user        ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user ON daily_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_liga_week        ON liga_weekly(week_start, liga_nivel);
CREATE INDEX IF NOT EXISTS idx_affiliates_broker ON affiliate_clicks(broker, clicked_at);

-- ─── FUNCIÓN: Degradar trial expirado ────────────────────────
-- Llamar periódicamente con un cron job en Supabase
CREATE OR REPLACE FUNCTION downgrade_expired_trials()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET plan = 'free'
  WHERE plan = 'pro_trial'
    AND trial_ends_at < NOW();
END;
$$ LANGUAGE plpgsql;
