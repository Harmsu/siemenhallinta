# Yhteenveto — Harmsun Puutarhapäiväkirja (päivitetty 2026-09-16)

## ✅ Sovellus on nyt kokonaan tuotannossa

- **Sovellus**: https://harmsunsiemenet.netlify.app
- **Backend**: `siemen-api` Renderissä (https://siemen-api.onrender.com)
- **Tietokanta**: UpCloudin jaettu Postgres-palvelin, kanta `siemenhallinta`
- **Käyttäjät**: `sanna.kuusela@iki.fi` ja `makisenpaivi@gmail.com` (kumpikin vaihtanut väliaikaissalasanan pysyvään sovelluksen "Vaihda salasana" -toiminnolla)

**HUOM osoitteesta**: vanha `siemenhallinta.netlify.app` on edelleen olemassa mutta on eri, saavuttamattomalla Netlify-tilillä (sama kahden-tilin ongelma kuin GitHubissa aiemmin). Se jää käyttämättömäksi/rikkinäiseksi (Supabase-versio, Supabase-projekti poistunut). **Päivitä kirjanmerkit/pikakuvakkeet uuteen osoitteeseen `harmsunsiemenet.netlify.app`.**

## Mitä muutettiin

- Supabase (Auth + Postgres + Storage) → oma Express-backend UpCloudin Postgresilla, JWT-autentikointi
- Kuvat: SFTP:n yli rajoitetulle UpCloud-käyttäjälle (ei enää Supabase Storage)
- Uusi kukkasipulit-ominaisuus: omat "Siemenet"/"Sipulit"-välilehdet, itse muokattavat kategoriat/alakategoriat
- Uusi CSV-tuonti/vienti (varmuuskopiointiin) siemenille ja sipuleille
- Uusi salasanan vaihto -toiminto
- Alkuperäinen Supabase-data oli jo kadonnut ennen migraation alkua — uusi kanta lähti tyhjänä

## Tuotantodeployn aikana löytyneet ja korjatut bugit

1. **Backend kaatui kokonaan** jos yksittäinen tietokantakysely epäonnistui kesken pyynnön (esim. verkkokatko) — korjattu `express-async-errors`-paketilla.
2. **SFTP-avain ei toiminut Renderissä** ("Unsupported key format") — Renderin ympäristömuuttujakenttä ei säily monirivistä avainta luotettavasti. Korjattu muuntamalla avain yksiriviseksi `\n`-koodatuksi merkkijonoksi.
3. **CSV-tuonti ei tallentanut siemen/sipuli-tyyppiä oikein** — tyyppi luettiin väärin vain napista, ei tiedostosta. Korjattu lisäämällä CSV:hen oma "Tyyppi"-sarake.

## Päivitys 2026-09-15 — nimenvaihto ja käytettävyysparannukset

- **Sovelluksen nimi vaihdettu**: "Harmsun siemenet" → "Harmsun Puutarhapäiväkirja" (kattaa nyt myös sipulit). Näkyy kirjautumissivulla, yläpalkissa, selaimen välilehden otsikossa ja PWA-manifestissa (kotinäytön nimi "Puutarha").
- **Uusi Asetukset-välilehti** (valikon viimeinen): CSV-vienti/tuonti (siemenille ja sipuleille erikseen) ja salasanan vaihto siirretty tänne pois Siemenet/Sipulit-työkalupalkeista ja yläpalkista — ne täyttivät ruudun heti alussa erityisesti mobiilissa.
- **Kategoriasuodatus** (`CategoryFilter.tsx`, `BulbCategoryFilter.tsx`): kun jokin tietty kategoria/tyyppi on valittu, ylärivillä näytetään enää vain valittu (+ "Kaikki"-nappi paluuta varten) koko kategorialistan sijaan — vähentää ruudun täyttymistä. Alakategoriat/lajikkeet näkyvät edelleen normaalisti valitun kategorian alla.
- **Oletusvälilehti-asetus**: Asetuksista voi valita avautuuko Siemenet vai Sipulit ensimmäisenä kirjautuessa (kausiluontoinen käytettävyysparannus — esim. Sipulit auki istutuskaudella). Tallennetaan selaimen `localStorage`iin (`harmsu-default-tab`), per laite/selain.
- **render.yaml-korjaus**: `CLIENT_URL` osoitti vanhaan, saavuttamattomaan `siemenhallinta.netlify.app`-osoitteeseen — korjattu oikeaan `harmsunsiemenet.netlify.app`-osoitteeseen.
- Testattu paikallisesti SSH-tunnelin läpi (kirjautuminen, Asetukset-sivun toiminnot) ennen tuotantoon vientiä.

## Päivitys 2026-09-16 — mobiilikorjaukset, poiston luotettavuus, istutuskuvat

Käyttäjän tuotantotestauksessa 15.9. illalla löytämät bugit korjattu ja uusi ominaisuus lisätty, kaikki viety tuotantoon.

**Korjatut bugit:**
- **Sivu vieri vaakasuunnassa puhelimella ja yläpalkin tabit eivät näkyneet pystyasennossa** — yläpalkin tabirivi ei mahtunut yhdelle riville kapealla näytöllä ja työnsi koko sivun leviämään sivuttain. Korjattu: tabirivistä oma vieritettävä alue, sivu ei enää pääse vierimään vaakasuunnassa.
- **Siementen poisto ei aina toiminut, laskuri ei päivittynyt** — kaksi eri syytä:
  1. Sovellus on PWA (kotinäytölle asennettava) ja natiivi selaimen vahvistuskysely (`window.confirm`) ei näytä mitään iOS:n kotinäyttötilassa, joten poisto ei koskaan käynnistynyt. Kaikki poistotoiminnot (siemenet, sipulit, kategoriat, paikat, istutukset) käyttävät nyt sovelluksen omaa vahvistusikkunaa.
  2. "Näytetään X / Y siementä" -laskuri laski nimittäjään vahingossa myös sipulit mukaan — korjattu.
- **"Lisää istutus" -valikko** ei erotellut siemeniä ja sipuleita (molemmat näyttivät tekstin "Siemen") — valikko jaettu nyt selkeästi "Siemenet"- ja "Sipulit"-ryhmiin.
- **CSV-tuonti loi duplikaatteja**, kun samaa tiedostoa tuotiin testinä useaan kertaan. Tuonti tunnistaa nyt jo listalla olevat (nimi+lajike+kategoria+tyyppi) eikä lisää niitä uudelleen. Tuotannon kannasta siivottiin tässä yhteydessä 17 vanhaa testiduplikaattia (lähinnä tulppaanisipuleita) — varmistettu ettei yksikään ollut minkään istutuksen käytössä ennen poistoa.

**Uusi ominaisuus — istutuskuvat:**
Jokaiseen istutukseen voi nyt liittää valokuvia (esim. istutushetkestä tai myöhemmästä taimivaiheesta) — eri asia kuin siemenen/sipulin oma otsikkokuva, joka pysyy ennallaan. Kuville voi antaa valinnaisen kuvatekstin ja muokata päivämäärää. Kuvat tallennetaan samalla SFTP-tavalla kuin otsikkokuvat mutta omaan `planting-photos`-alikansioon, ja ladataan sovelluksessa vasta kun käyttäjä avaa yksittäisen istutuksen kuvat-osion (ei hidasta istutuslistan peruslatausta). Kuvan poistaminen poistaa nyt myös oikeasti tiedoston palvelimelta.

## Git

Kaikki koodi on nyt `master`-branchilla (Harmsu/siemenhallinta), pushattu GitHubiin. `upcloud-migration`-branch on yhä olemassa historiallisena viitteenä mutta ei enää aktiivisessa käytössä.

## Git-identiteetti-insidentti (korjattu, edellisestä istunnosta)

Tällä koneella git ei ollut koskaan asetettu käyttämään henkilökohtaista sähköpostia, joten se päätteli automaattisesti työnantajan verkkotunnuksen (`vivicta.com`). Korjattu kaikissa kolmessa repossa (siemenhallinta, HIFF, uintiharjoittelu). Globaali git-asetus (`user.email = sanna.kuusela@iki.fi`) on korjattu pysyvästi tälle koneelle.

## Muistiin tallennettu (Claude Code -automuisti)

- `C:\Users\SannaKuusela\.claude\projects\C--Users-SannaKuusela\memory\project_siemenhallinta.md`
