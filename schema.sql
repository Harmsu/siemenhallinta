-- =============================================================
-- Harmsun siemenet - Tietokantarakenne (UpCloud Postgres)
-- Aja tämä kokonaisuudessaan tuotantokantaan (ks. server/database.js:n
-- initDB, joka ajaa saman rakenteen automaattisesti paikallista kehitystä varten)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Käyttäjät
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Siemenet
CREATE TABLE seeds (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  name_fi               TEXT NOT NULL,
  variety               TEXT,
  -- Siemenillä yksi 5 kiinteästä kategoriasta; sipuleilla kukkasipulin tyyppi (esim. "Tulppaani"),
  -- joita käyttäjä voi itse lisätä - siksi EI CHECK-rajoitusta (validointi UI:ssa)
  category              TEXT NOT NULL,
  -- Siemenillä vapaa alakategoria; sipuleilla lajikeryhmä kategorian sisällä (esim. "Darwin-tulppaani")
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

CREATE INDEX idx_seeds_user ON seeds(user_id);

-- Alakategoriat
CREATE TABLE subcategories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  category   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, name)
);

CREATE INDEX idx_subcategories_user ON subcategories(user_id);

-- Istutuspaikat
CREATE TABLE locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id),
  name         TEXT NOT NULL,
  description  TEXT,
  sun_exposure TEXT NOT NULL CHECK (sun_exposure IN ('aurinkoinen','puolivarjo','varjo')),
  soil_type    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_user ON locations(user_id);

-- Istutukset
-- HUOM: planted_date on TEXT (YYYY-MM-DD), ei DATE — Postgresin DATE + Node pg:n
-- Date-olion toISOString()-muunnos siirtää päivän taaksepäin kun palvelin on UTC:n
-- edellä (havaittu uintiharjoittelu-migraatiossa).
CREATE TABLE plantings (
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

CREATE INDEX idx_plantings_user ON plantings(user_id);

-- Hoitoloki (date on myös TEXT, sama syy kuin plantings.planted_date)
CREATE TABLE care_logs (
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

CREATE INDEX idx_care_logs_user ON care_logs(user_id);

-- Istutuksen aikaiset/myöhemmät valokuvat (eri asia kuin siemenen/sipulin otsikkokuva
-- seeds.image_url yllä) - nolla tai useampi kuva per istutus, ladataan omaan SFTP-
-- alikansioon ("planting-photos") jotta ne pysyvät erillään otsikkokuvista.
CREATE TABLE planting_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  -- TEXT (YYYY-MM-DD), sama syy kuin plantings.planted_date yllä
  taken_at    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planting_photos_planting ON planting_photos(planting_id);
