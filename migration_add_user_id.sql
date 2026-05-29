-- =============================================================
-- Migraatio: lisää user_id kaikkiin tauluihin
-- Aja tämä Supabase SQL Editorissa (siemenhallinta-projekti)
-- =============================================================

-- -------------------------------------------------------------
-- VAIHE 1: Tarkista ensin että tietokannassa on juuri yksi käyttäjä
--           (sinä). Aja tämä rivi ensin yksinään ja katso tulos:
-- SELECT id, email FROM auth.users;
-- Pitäisi näkyä vain sinun sähköpostisi. Jos näkyy useampi,
-- ota yhteyttä ennen kuin jatkat.
-- -------------------------------------------------------------


-- 1. Lisää user_id-sarake kaikkiin tauluihin (NULL sallittu aluksi)

ALTER TABLE seeds
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE plantings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE care_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);


-- 2. Aseta kaikki olemassa oleva data sinun tunnuksellesi
--    Haetaan ID suoraan auth.users-taulusta — toimii SQL Editorissa

UPDATE seeds
  SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  WHERE user_id IS NULL;

UPDATE subcategories
  SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  WHERE user_id IS NULL;

UPDATE locations
  SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  WHERE user_id IS NULL;

UPDATE plantings
  SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  WHERE user_id IS NULL;

UPDATE care_logs
  SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  WHERE user_id IS NULL;


-- 3. Varmistus: tarkista että kaikissa riveissä on nyt user_id
--    (pitäisi palauttaa 0 — eli ei yhtään riviä ilman user_id:tä)
-- SELECT COUNT(*) FROM seeds WHERE user_id IS NULL;
-- SELECT COUNT(*) FROM locations WHERE user_id IS NULL;
-- SELECT COUNT(*) FROM plantings WHERE user_id IS NULL;


-- 4. Tee user_id pakolliseksi ja aseta DEFAULT tulevaa käyttöä varten

ALTER TABLE seeds         ALTER COLUMN user_id SET NOT NULL,
                          ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE subcategories ALTER COLUMN user_id SET NOT NULL,
                          ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE locations     ALTER COLUMN user_id SET NOT NULL,
                          ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE plantings     ALTER COLUMN user_id SET NOT NULL,
                          ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE care_logs     ALTER COLUMN user_id SET NOT NULL,
                          ALTER COLUMN user_id SET DEFAULT auth.uid();


-- 5. Poista vanhat RLS-käytännöt

DROP POLICY IF EXISTS "Kirjautuneet voivat lukea siemeniä"        ON seeds;
DROP POLICY IF EXISTS "Kirjautuneet voivat lisätä siemeniä"       ON seeds;
DROP POLICY IF EXISTS "Kirjautuneet voivat muokata siemeniä"      ON seeds;
DROP POLICY IF EXISTS "Kirjautuneet voivat poistaa siemeniä"      ON seeds;

DROP POLICY IF EXISTS "Kirjautuneet voivat lukea alakategorioita"  ON subcategories;
DROP POLICY IF EXISTS "Kirjautuneet voivat lisätä alakategorioita" ON subcategories;
DROP POLICY IF EXISTS "Kirjautuneet voivat poistaa alakategorioita" ON subcategories;

DROP POLICY IF EXISTS "Kirjautuneet voivat lukea paikkoja"        ON locations;
DROP POLICY IF EXISTS "Kirjautuneet voivat lisätä paikkoja"       ON locations;
DROP POLICY IF EXISTS "Kirjautuneet voivat muokata paikkoja"      ON locations;
DROP POLICY IF EXISTS "Kirjautuneet voivat poistaa paikkoja"      ON locations;

DROP POLICY IF EXISTS "Kirjautuneet voivat lukea istutuksia"      ON plantings;
DROP POLICY IF EXISTS "Kirjautuneet voivat lisätä istutuksia"     ON plantings;
DROP POLICY IF EXISTS "Kirjautuneet voivat muokata istutuksia"    ON plantings;
DROP POLICY IF EXISTS "Kirjautuneet voivat poistaa istutuksia"    ON plantings;

DROP POLICY IF EXISTS "Kirjautuneet voivat lukea hoitolokia"           ON care_logs;
DROP POLICY IF EXISTS "Kirjautuneet voivat lisätä hoitolokimerkintöjä" ON care_logs;
DROP POLICY IF EXISTS "Kirjautuneet voivat poistaa hoitolokimerkintöjä" ON care_logs;


-- 6. Luo uudet käyttäjäkohtaiset RLS-käytännöt

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
