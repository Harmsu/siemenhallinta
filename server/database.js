const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ilman tätä yksikin katkennut idle-yhteys (esim. verkkokatko) kaataa koko prosessin
pool.on('error', (err) => {
  console.error('Odottamaton tietokantavirhe:', err);
});

async function initDB() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS seeds (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id               UUID NOT NULL REFERENCES users(id),
      name_fi               TEXT NOT NULL,
      variety               TEXT,
      category              TEXT NOT NULL,
      subcategory           TEXT,
      category_type         TEXT NOT NULL DEFAULT 'siemen' CHECK (category_type IN ('siemen','sipuli')),
      planting_depth_cm     NUMERIC,
      planting_start_month  INTEGER NOT NULL CHECK (planting_start_month BETWEEN 1 AND 12),
      planting_end_month    INTEGER NOT NULL CHECK (planting_end_month BETWEEN 1 AND 12),
      planting_indoor       BOOLEAN DEFAULT false,
      growing_instructions  TEXT,
      image_url             TEXT,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_seeds_user ON seeds(user_id);

    CREATE TABLE IF NOT EXISTS subcategories (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id),
      category   TEXT NOT NULL,
      name       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, category, name)
    );

    CREATE INDEX IF NOT EXISTS idx_subcategories_user ON subcategories(user_id);

    CREATE TABLE IF NOT EXISTS locations (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(id),
      name         TEXT NOT NULL,
      description  TEXT,
      sun_exposure TEXT NOT NULL CHECK (sun_exposure IN ('aurinkoinen','puolivarjo','varjo')),
      soil_type    TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);

    CREATE TABLE IF NOT EXISTS plantings (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID NOT NULL REFERENCES users(id),
      seed_id          UUID NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
      location_id      UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      planted_date     TEXT NOT NULL,
      quantity         INTEGER NOT NULL DEFAULT 1,
      current_quantity INTEGER,
      notes            TEXT,
      status           TEXT NOT NULL DEFAULT 'seedling'
        CHECK (status IN ('seedling','planted_ground','planted_greenhouse','active','harvested','failed')),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_plantings_user ON plantings(user_id);

    CREATE TABLE IF NOT EXISTS care_logs (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id        UUID NOT NULL REFERENCES users(id),
      planting_id    UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
      date           TEXT NOT NULL,
      type           TEXT NOT NULL
        CHECK (type IN ('watering','fertilizing','pruning','harvesting','pest_control','loss','note','improvement','other')),
      notes          TEXT,
      quantity_after INTEGER,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_care_logs_user ON care_logs(user_id);
  `);
}

module.exports = { pool, initDB };
