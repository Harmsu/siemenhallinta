-- =============================================================
-- Harmsun siemenet - Tietokantarakenne (uusi asennus)
-- Aja tämä kokonaisuudessaan Supabase SQL Editorissa
-- =============================================================


-- -------------------------------------------------------------
-- 1. TAULUT
-- user_id asetetaan automaattisesti kirjautuneen käyttäjän mukaan
-- -------------------------------------------------------------

-- Siemenet
CREATE TABLE seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  name_fi TEXT NOT NULL,
  variety TEXT,
  category TEXT NOT NULL CHECK (category IN ('vihannekset','yrtit','kukat','hedelmät','marjat')),
  subcategory TEXT,
  planting_start_month INTEGER NOT NULL CHECK (planting_start_month BETWEEN 1 AND 12),
  planting_end_month INTEGER NOT NULL CHECK (planting_end_month BETWEEN 1 AND 12),
  planting_indoor BOOLEAN DEFAULT false,
  growing_instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alakategoriat
CREATE TABLE subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  category TEXT NOT NULL CHECK (category IN ('vihannekset','yrtit','kukat','hedelmät','marjat')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, name)
);

-- Istutuspaikat
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  sun_exposure TEXT NOT NULL CHECK (sun_exposure IN ('aurinkoinen','puolivarjo','varjo')),
  soil_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Istutukset
CREATE TABLE plantings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  seed_id UUID NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  planted_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  current_quantity INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'seedling'
    CHECK (status IN ('seedling','planted_ground','planted_greenhouse','active','harvested','failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hoitoloki
CREATE TABLE care_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('watering','fertilizing','pruning','harvesting','pest_control','loss','note','improvement','other')),
  notes TEXT,
  quantity_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 2. ROW LEVEL SECURITY – jokainen näkee vain oman datansa
-- -------------------------------------------------------------

ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantings ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

-- seeds
CREATE POLICY "Oma data: siemenet SELECT"
  ON seeds FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: siemenet INSERT"
  ON seeds FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Oma data: siemenet UPDATE"
  ON seeds FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: siemenet DELETE"
  ON seeds FOR DELETE TO authenticated USING (user_id = auth.uid());

-- subcategories
CREATE POLICY "Oma data: alakategoriat SELECT"
  ON subcategories FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: alakategoriat INSERT"
  ON subcategories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Oma data: alakategoriat DELETE"
  ON subcategories FOR DELETE TO authenticated USING (user_id = auth.uid());

-- locations
CREATE POLICY "Oma data: paikat SELECT"
  ON locations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: paikat INSERT"
  ON locations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Oma data: paikat UPDATE"
  ON locations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: paikat DELETE"
  ON locations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- plantings
CREATE POLICY "Oma data: istutukset SELECT"
  ON plantings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: istutukset INSERT"
  ON plantings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Oma data: istutukset UPDATE"
  ON plantings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: istutukset DELETE"
  ON plantings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- care_logs
CREATE POLICY "Oma data: hoitoloki SELECT"
  ON care_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Oma data: hoitoloki INSERT"
  ON care_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Oma data: hoitoloki DELETE"
  ON care_logs FOR DELETE TO authenticated USING (user_id = auth.uid());


-- -------------------------------------------------------------
-- 3. STORAGE BUCKET (kuville)
-- -------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('seed-images', 'seed-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Kirjautuneet voivat ladata kuvia"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'seed-images');

CREATE POLICY "Kaikki voivat katsella kuvia"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'seed-images');

CREATE POLICY "Kirjautuneet voivat poistaa kuvia"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'seed-images');
