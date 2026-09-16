# Harmsun Puutarhapäiväkirja – Asennusohje omaan käyttöön

Tässä ohjeessa käydään läpi jokainen vaihe yksityiskohtaisesti. Ohje on kirjoitettu niin, että aiempaa ohjelmointikokemusta ei tarvita — yhtä vaihetta (VAIHE 5, kuvien tallennuspalvelin) lukuun ottamatta, joka vaatii hieman enemmän teknistä säätöä.

Sovellus koostuu kolmesta osasta:
- **Frontend** (selainsovellus, React) — julkaistaan esim. Netlifyyn
- **Backend** (Express-palvelin, hoitaa kirjautumisen ja tietokantayhteydet) — julkaistaan esim. Renderiin
- **Tietokanta** (PostgreSQL) — tarvitset oman Postgres-tietokannan jostain palveluntarjoajalta

Lisäksi siemenien/sipulien ja istutusten valokuvat tallennetaan SFTP:n yli omalle palvelimelle (ei osaksi tietokantaa).

---

## Mitä tarvitset

- Tietokone (Windows, Mac tai Linux)
- Internetyhteys
- Noin 45–90 minuuttia aikaa (kuvapalvelimen asennus mukaan lukien)

---

## VAIHE 1 – Asenna Node.js

Node.js on ohjelma, jolla sovellus ajetaan paikallisesti kehitysvaiheessa.

1. Mene osoitteeseen: **https://nodejs.org**
2. Klikkaa isoa vihreää latauspainiketta (LTS-versio, esim. "22.x.x LTS")
3. Aja ladattu asennusohjelma
   - Windowsissa: tuplaklikkaa `.msi`-tiedostoa, klikkaa Next → Next → Install
   - Macilla: tuplaklikkaa `.pkg`-tiedostoa, seuraa ohjeita
4. Varmista asennus: avaa terminaali (ks. kohta alla) ja kirjoita:
   ```
   node --version
   ```
   Pitäisi tulostua jotain kuten `v22.x.x`.

**Kuinka avata terminaali:**
- **Windows**: paina `Win + R`, kirjoita `cmd`, paina Enter. Tai hae "Komentokehote" Käynnistä-valikosta.
- **Mac**: paina `Cmd + Space`, kirjoita `Terminal`, paina Enter.

---

## VAIHE 2 – Hanki sovelluksen lähdekoodi

Sinulla on kaksi vaihtoehtoa: GitHub (suositeltava) tai ZIP-paketti.

### Vaihtoehto A: GitHub (suositeltava)

1. Asenna ensin Git: **https://git-scm.com/downloads** (Windows-käyttäjille suositellaan)
2. Avaa terminaali
3. Siirry kansioon, johon haluat tallentaa sovelluksen, esim.:
   ```
   cd C:\Käyttäjät\sinunnimi\Dokumentit
   ```
   tai Macilla:
   ```
   cd ~/Documents
   ```
4. Kloonaa repositorio (korvaa URL oikealla osoitteella):
   ```
   git clone https://github.com/kayttaja/siemenhallinta.git
   ```
5. Siirry luotuun kansioon:
   ```
   cd siemenhallinta
   ```

### Vaihtoehto B: ZIP-paketti

1. Lataa ZIP-tiedosto (saat linkin sovelluksen omistajalta)
2. Pura ZIP valitsemaasi kansioon (esim. `C:\Dokumentit\siemenhallinta`)
3. Avaa terminaali ja siirry purettuun kansioon:
   ```
   cd C:\Dokumentit\siemenhallinta
   ```
   tai Macilla:
   ```
   cd ~/Documents/siemenhallinta
   ```

---

## VAIHE 3 – Luo oma Postgres-tietokanta

Sovellus tarvitsee oman PostgreSQL-tietokannan. Yksinkertaisin tapa on käyttää ilmaista/edullista hallinnoitua Postgres-palvelua — silloin ei tarvitse asentaa tai ylläpitää tietokantapalvelinta itse.

**Suositus aloittelijalle: Renderin Postgres** (koska tarvitset joka tapauksessa Render-tilin backendiä varten VAIHEESSA 8 — kaikki samassa paikassa). Vaihtoehtoisesti käy mikä tahansa muu PostgreSQL-palvelu (esim. Neon, ElephantSQL, tai oma VPS-palvelin) — periaatteet ovat samat, tarvitset vain yhteysmerkkijonon (`postgresql://...`).

1. Mene osoitteeseen: **https://render.com** ja luo tili (esim. GitHub-tilillä kirjautuen)
2. Dashboardissa klikkaa **"New +"** → **"PostgreSQL"**
3. Anna tietokannalle nimi, esim. `siemenhallinta-db`, valitse sopiva alue (esim. Frankfurt) ja tarkista ajantasainen hinnoittelu/ilmaistaso Renderin sivulta ennen valintaa
4. Klikkaa **"Create Database"** ja odota, että tietokanta on valmis
5. Kun tietokanta on luotu, etsi sivulta **"External Database URL"** (tai vastaava yhteysmerkkijono) — se on muotoa:
   ```
   postgresql://kayttaja:salasana@host:5432/tietokannannimi
   ```
6. Kopioi tämä talteen (esim. Muistioon) — tarvitset sitä VAIHEESSA 6

---

## VAIHE 4 – Luo tietokantataulut

Tämä vaihe luo kaikki tarvittavat tietokantataulut valmiin `schema.sql`-tiedoston avulla.

**Tapa A: psql-komentorivillä** (jos asensit Postgresin komentorivityökalut, tai ne tulivat Node.js:n mukana — voit myös asentaa pelkän `psql`:n osoitteesta https://www.postgresql.org/download/):

```
psql "postgresql://kayttaja:salasana@host:5432/tietokannannimi" -f schema.sql
```
(Korvaa yhteysmerkkijono VAIHEESSA 3 kopioimallasi arvolla. Aja komento sovelluksen juurikansiossa, jossa `schema.sql` sijaitsee.)

**Tapa B: graafinen työkalu** (helpompi, jos komentorivi tuntuu hankalalta):

1. Asenna ilmainen tietokantatyökalu, esim. **TablePlus** (https://tableplus.com) tai **pgAdmin** (https://www.pgadmin.org)
2. Luo uusi yhteys VAIHEESSA 3 kopioimallasi yhteysmerkkijonolla (tai host/portti/käyttäjä/salasana/tietokanta erikseen)
3. Avaa SQL-kysely-ikkuna ("Query" tai "SQL Editor")
4. Avaa `schema.sql` sovelluksen kansiosta tekstieditorilla, kopioi koko sisältö
5. Liitä se kysely-ikkunaan ja aja se

**Varmistus:** Tietokantatyökalussa (tai `\dt`-komennolla psql:ssä) pitäisi näkyä taulut: `users`, `seeds`, `subcategories`, `locations`, `plantings`, `care_logs`, `planting_photos`.

---

## VAIHE 5 – Määritä kuvien tallennuspalvelin (SFTP)

Tämä on ohjeen teknisin vaihe. Siemenien/sipulien otsikkokuvat ja istutusten liitekuvat ladataan SFTP:n yli omalle palvelimelle — ei tietokantaan eikä valmiiseen pilvitallennuspalveluun.

Tarvitset tätä varten **oman Linux-palvelimen (VPS)**, johon sinulla on SSH-pääsy — esim. UpCloud, Hetzner tai DigitalOcean (kaikilla on edullisia kuukausihintaisia VPS-vaihtoehtoja). Jos sinulla on jo tällainen palvelin, voit käyttää sitä.

Lyhyesti tarvitset palvelimelle:
1. Oman käyttäjätunnuksen kuville (esim. `kuva-lataus`), mielellään rajattuna vain SFTP-käyttöön (ei täyttä komentorivipääsyä) — tämä on turvallisempaa kuin pääkäyttäjän tunnusten käyttö
2. SSH-avainparin, jolla sovellus kirjautuu tähän käyttäjään ilman salasanaa
3. Kansion palvelimella, johon kuvat tallennetaan (esim. `/uploads`)

**Tämä vaihe kannattaa tehdä yhdessä Claude Coden kanssa** (ks. Tuki-osio lopussa) — tarkat komennot vaihtelevat käyttöjärjestelmän ja palveluntarjoajan mukaan, ja rajatun SFTP-käyttäjän luonti (chroot + `ForceCommand internal-sftp`) on helpompi tehdä opastettuna kuin tästä yleisohjeesta suoraan kopioiden.

Kun palvelin on valmis, sinulla pitäisi olla talteen otettuna:
- Palvelimen osoite (esim. `12.34.56.78`)
- SSH-portti (yleensä `22`)
- Käyttäjätunnus (esim. `kuva-lataus`)
- Yksityinen SSH-avain (tekstimuodossa, `-----BEGIN OPENSSH PRIVATE KEY-----` ... `-----END OPENSSH PRIVATE KEY-----`)
- Kuvakansion polku palvelimella (esim. `/uploads`)

Näitä tarvitaan seuraavassa vaiheessa.

**Jos et vielä halua asentaa kuvapalvelinta:** voit ohittaa tämän vaiheen ja jättää SFTP-ympäristömuuttujat tyhjiksi VAIHEESSA 6 — sovellus toimii silti, mutta kuvien lataus (siemenille/sipuleille ja istutuksille) epäonnistuu, kunnes SFTP on määritetty.

---

## VAIHE 6 – Konfiguroi ympäristömuuttujat

### Backend (`server/.env`)

1. Siirry `server`-kansioon
2. Kopioi `server/.env.example` nimellä `server/.env`:
   ```
   copy .env.example .env
   ```
   Macilla:
   ```
   cp .env.example .env
   ```
3. Avaa `server/.env` tekstieditorilla ja täytä arvot:
   ```
   PORT=3001
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=<pitkä satunnainen merkkijono, esim. 40+ merkkiä sekalaisia kirjaimia/numeroita>
   DATABASE_URL=<VAIHEESSA 3 kopioimasi Postgres-yhteysmerkkijono>

   SFTP_HOST=<VAIHEESSA 5 saamasi palvelimen osoite>
   SFTP_PORT=22
   SFTP_USERNAME=<VAIHEESSA 5 luomasi käyttäjätunnus>
   SFTP_PRIVATE_KEY=<yksityinen avain - jos liität monirivisenä, se toimii sellaisenaan paikallisessa kehityksessä; tuotantopalvelun (esim. Renderin) ympäristömuuttujakenttä voi vaatia sen yhdelle riville kirjaimellisilla \n-merkeillä muunnettuna, ks. VAIHE 8>
   SFTP_REMOTE_DIR=/uploads
   ```
   **`JWT_SECRET`:n voi luoda esim. terminaalissa:**
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

**Tärkeää:** Älä jaa `.env`-tiedostoa kenellekään. Se sisältää salasanoja/avaimia, joilla pääsee tietokantaasi ja kuvapalvelimellesi.

### Frontend (`.env.local`)

1. Sovelluksen juurikansiossa, kopioi `.env.example` nimellä `.env.local`:
   ```
   copy .env.example .env.local
   ```
   Macilla:
   ```
   cp .env.example .env.local
   ```
2. Tiedosto sisältää valmiiksi paikallisen kehityksen oletusarvon:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```
   Tätä ei tarvitse muuttaa paikallista kehitystä varten (osoittaa VAIHEESSA 8 käynnistettävään backendiin).

---

## VAIHE 7 – Luo käyttäjätili sovellukseen

Sovelluksessa ei ole itserekisteröitymistä — käyttäjätilit luodaan komentorivillä valmiilla skriptillä.

1. Avaa terminaali `server`-kansiossa
2. Asenna riippuvuudet, jos et ole vielä tehnyt (ks. VAIHE 8.1)
3. Luo käyttäjä:
   ```
   node scripts/create-user.js oma.sposti@esimerkki.fi vahvaSalasana123
   ```
4. Näet vahvistuksen: `Käyttäjä tallennettu: { id: '...', email: '...' }` sekä oletuskategorioiden lisäyksen

Voit luoda useamman käyttäjän ajamalla komennon uudelleen eri sähköpostilla — jokainen käyttäjä näkee vain oman datansa.

---

## VAIHE 8 – Asenna riippuvuudet ja käynnistä sovellus paikallisesti

### 8.1 Backend

1. Avaa terminaali ja siirry `server`-kansioon:
   ```
   cd server
   ```
2. Asenna riippuvuudet:
   ```
   npm install
   ```
3. Käynnistä backend:
   ```
   npm start
   ```
   Terminaaliin pitäisi tulostua `Palvelin käynnissä portissa 3001`. Ensimmäisellä käynnistyksellä sovellus myös luo puuttuvat tietokantataulut automaattisesti, jos VAIHE 4 jäi tekemättä.

### 8.2 Frontend

1. Avaa **toinen** terminaali-ikkuna, siirry sovelluksen juurikansioon
2. Asenna riippuvuudet:
   ```
   npm install
   ```
3. Käynnistä kehityspalvelin:
   ```
   npm run dev
   ```
4. Terminaaliin ilmestyy teksti kuten:
   ```
   VITE v7.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```
5. Avaa selain ja mene osoitteeseen: **http://localhost:5173**
6. Kirjaudu VAIHEESSA 7 luomillasi tunnuksilla

**Sovellus toimii!** Voit nyt lisätä omia siemeniä, sipuleita, istutuspaikkoja ja istutuksia.

Molempien palvelimien pitää olla käynnissä yhtä aikaa (kaksi terminaali-ikkunaa auki). Sulje jompikumpi painamalla `Ctrl + C` sen ikkunassa.

```bash
# Testit ja tyypit (sovelluksen juurikansiossa)
npx vitest run
npx tsc -b --noEmit
```

---

## VAIHE 9 (valinnainen) – Julkaise sovellus verkkoon

Jos haluat käyttää sovellusta myös puhelimella tai muilla laitteilla ilman, että tietokone on päällä, julkaise backend ja frontend erikseen.

### 9.1 Backend Renderiin

1. Rekisteröidy/kirjaudu **https://render.com** (jos et tehnyt jo VAIHEESSA 3)
2. Dashboardissa klikkaa **"New +"** → **"Blueprint"**
3. Yhdistä GitHub-repositoriosi — Render löytää automaattisesti `server/render.yaml`-tiedoston ja ehdottaa palvelun luontia sen mukaan
4. Lisää ympäristömuuttujat Renderin palveluasetuksiin (samat kuin `server/.env`:ssä): `JWT_SECRET`, `DATABASE_URL`, `CLIENT_URL` (päivitä myöhemmin oikeaan Netlify-osoitteeseen), `SFTP_HOST`, `SFTP_PORT`, `SFTP_USERNAME`, `SFTP_PRIVATE_KEY`, `SFTP_REMOTE_DIR`
   - **HUOM `SFTP_PRIVATE_KEY`:sta**: Renderin ympäristömuuttujakenttä ei aina säilytä moniriviä luotettavasti copy-pastella. Jos kuvien lataus tuotannossa epäonnistuu virheellä "Unsupported key format", muunna avain yksiriviseksi kirjaimellisilla `\n`-merkeillä ennen liittämistä (sovellus osaa purkaa tämän muodon takaisin).
5. Klikkaa **"Apply"/"Deploy"** ja odota, että build valmistuu
6. Kopioi valmiin palvelun osoite talteen, esim. `https://oma-sovellus.onrender.com`

### 9.2 Frontend Netlifyyn

1. Mene osoitteeseen: **https://netlify.com**, kirjaudu (esim. GitHub-tilillä)
2. Klikkaa **"Add new site"** → **"Import an existing project"**
3. Valitse GitHub ja repositoriosi
4. Build-asetukset:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **"Add environment variables"** ja lisää:
   - `VITE_API_URL` = `https://oma-sovellus.onrender.com/api` (VAIHEESSA 9.1 saamasi Render-osoite + `/api`)
6. Klikkaa **"Deploy site"**
7. Kun sivusto on julkaistu, päivitä Renderin `CLIENT_URL`-ympäristömuuttuja vastaamaan Netlify-osoitettasi (esim. `https://oma-sovellus.netlify.app`) — muuten backend estää selaimen pyynnöt CORS-suojauksella

Jatkossa kun pushaat muutoksia GitHubiin, sekä Render että Netlify päivittävät automaattisesti.

---

## Sovelluksen mukauttaminen

### Sovelluksen nimen vaihtaminen

Sovelluksen nimi "Harmsun Puutarhapäiväkirja" näkyy:
- Kirjautumissivulla: `src/components/Login.tsx`
- Yläpalkissa kirjautumisen jälkeen: `src/components/MainApp.tsx`
- Selaimen välilehdessä: `index.html`
- PWA-kotinäyttökuvakkeen nimessä: `public/manifest.json` (`name`-kenttä; `short_name` on lyhyempi versio samassa tiedostossa) ja `index.html`:n `apple-mobile-web-app-title`-metatagissa
- README:ssä: `README.md` rivi 1

Avaa nämä tiedostot tekstieditorilla ja korvaa nimi omallasi.

---

## Yleisimmät ongelmat

### "Cannot find module" tai muita virheitä `npm install` jälkeen

Poista `node_modules`-kansio ja aja `npm install` uudelleen (tee tämä sekä juurikansiossa että `server`-kansiossa):
```
# Windowsissa
rmdir /s /q node_modules
npm install

# Macilla
rm -rf node_modules
npm install
```

### Backend ei käynnisty — tietokantavirhe

- Tarkista, että `server/.env`:n `DATABASE_URL` on kopioitu oikein VAIHEESTA 3 (ei ylimääräisiä välilyöntejä tai rivinvaihtoja)
- Tarkista, että tietokantapalvelusi sallii yhteydet ulkopuolelta (osa palveluntarjoajista vaatii IP-osoitteen sallimisen erikseen — tarkista palveluntarjoajasi ohjeista)

### Kirjautuminen ei onnistu

1. Tarkista, että käyttäjä on luotu VAIHEEN 7 skriptillä
2. Tarkista, että backend on käynnissä ja `.env.local`:n `VITE_API_URL` osoittaa oikeaan backend-osoitteeseen
3. Selaimen kehittäjätyökalujen Console-välilehdellä näkyy usein tarkempi virheviesti

### Taulut puuttuvat / "relation does not exist" -virhe

Aja `schema.sql` uudelleen tietokantaasi vasten (VAIHE 4), tai käynnistä backend uudelleen — se yrittää luoda puuttuvat taulut automaattisesti käynnistyessään.

### Kuvien lataus epäonnistuu

- Tarkista, että VAIHEEN 5 SFTP-tiedot on syötetty oikein `server/.env`:ään (tai Renderin ympäristömuuttujiin)
- Tarkista, että SFTP-käyttäjällä on kirjoitusoikeus `SFTP_REMOTE_DIR`-kansioon
- Jos virhe on "Unsupported key format" tuotannossa, ks. VAIHE 9.1:n huomio yksiriviseksi muunnetusta avaimesta

### Netlify-sivulla tyhjää tai virhe

Tarkista, että olet lisännyt `VITE_API_URL`-ympäristömuuttujan Netlifyn asetuksiin (VAIHE 9.2, kohta 5) ja että se osoittaa oikeaan, toimivaan backend-osoitteeseen.

### CORS-virhe selaimen konsolissa ("blocked by CORS policy")

Backendin `CLIENT_URL`-ympäristömuuttuja ei täsmää frontendin oikeaan osoitteeseen. Päivitä se Renderin asetuksista (ks. VAIHE 9.1 lopussa) ja käynnistä backend-palvelu uudelleen.

---

## Tuki

Jos jokin ei toimi, voit pyytää apua Claudelta (AI-assistentti) — erityisesti VAIHE 5 (kuvapalvelin) kannattaa tehdä yhdessä sen kanssa. Kerro:
1. Missä vaiheessa ongelma ilmeni
2. Mitä virheviestiä näkyy (kopioi koko viesti)
3. Millä käyttöjärjestelmällä olet
4. Mitä palveluntarjoajaa käytät tietokannalle/palvelimelle, jos relevanttia

Claude osaa auttaa konfiguroinnissa ja virheiden selvittämisessä vaihe vaiheelta.
