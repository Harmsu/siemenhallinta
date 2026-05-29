# Siemenhallinta – Asennusohje omaan käyttöön

Tässä ohjeessa käydään läpi jokainen vaihe yksityiskohtaisesti. Ohje on kirjoitettu niin, että aiempaa ohjelmointikokemusta ei tarvita.

---

## Mitä tarvitset

- Tietokone (Windows, Mac tai Linux)
- Internetyhteys
- Noin 30–60 minuuttia aikaa

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

Jos sovellus on GitHub-repositoriossa:

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

## VAIHE 3 – Luo oma Supabase-projekti (ilmainen tietokanta)

Supabase on ilmainen pilvipalvelu, joka hoitaa tietokannan ja kirjautumisen.

### 3.1 Rekisteröidy Supabaseen

1. Mene osoitteeseen: **https://supabase.com**
2. Klikkaa **"Start your project"** tai **"Sign Up"** oikeassa yläkulmassa
3. Kirjaudu sisään GitHub-tilillä (tai luo uusi tili sähköpostilla)
   - GitHub-kirjautuminen on helpointa: klikkaa "Continue with GitHub" ja seuraa ohjeita
4. Kun olet kirjautunut, sinut ohjataan Dashboard-näkymään

### 3.2 Luo uusi projekti

1. Klikkaa **"New project"** -painiketta
2. Täytä tiedot:
   - **Organization**: valitse olemassa oleva tai luo uusi (klikkaa "New organization", anna nimi, valitse "Free plan")
   - **Name**: anna projektille nimi, esim. `siemenhallinta`
   - **Database Password**: luo vahva salasana ja tallenna se talteen (tarvitset sen myöhemmin jos teet suoria tietokantayhteyksiä)
   - **Region**: valitse lähin palvelinsijainti, esim. `eu-central-1 (Frankfurt)` tai `eu-west-2 (London)`
3. Klikkaa **"Create new project"**
4. Odota noin 1–2 minuuttia — Supabase luo tietokannan. Näet latauspyörän.

### 3.3 Hae projektin API-avaimet

1. Kun projekti on luotu, klikkaa vasemmasta sivupalkista **"Project Settings"** (hammaspyörä-ikoni)
2. Klikkaa **"API"** vasemmasta valikosta
3. Näet kaksi tärkeää arvoa — kopioi nämä talteen (esim. Muistioon):
   - **Project URL**: muotoa `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **anon public** (kohdassa "Project API keys"): pitkä teksti, alkaa `eyJhbGci...`

---

## VAIHE 4 – Luo tietokantataulut

Tämä vaihe luo kaikki tarvittavat tietokantataulut.

1. Supabase-dashboardissa klikkaa vasemmasta sivupalkista **"SQL Editor"** (pääteikoni tai hakasulukkeet)
2. Klikkaa **"+ New query"**
3. Avaa tiedosto `schema.sql` sovelluksen kansiosta (esim. Muistiolla tai VS Codella)
4. Kopioi koko tiedoston sisältö
5. Liitä se SQL Editor -kenttään
6. Klikkaa vihreää **"Run"**-painiketta (tai paina `Ctrl + Enter`)
7. Näet alhaalla viestin `Success. No rows returned` — tämä on normaalia ja tarkoittaa että kaikki meni oikein

**Varmistus:** Klikkaa vasemmasta sivupalkista **"Table Editor"** — näet listalla taulut: `care_logs`, `locations`, `plantings`, `seeds`, `subcategories`.

---

## VAIHE 5 – Konfiguroi ympäristömuuttujat

Tässä kerrot sovellukselle, mitä Supabase-projektia se käyttää.

1. Avaa sovelluksen kansio tiedostonhallinnassa
2. Etsi tiedosto nimeltä `.env.example`
   - **Huom Windows:** Windows saattaa piilottaa pistepiste-alkuiset tiedostot. Jos et näe sitä, avaa Resurssienhallinta → Näytä → Näytä piilotiedostot (tai kirjoita tiedoston nimi suoraan terminaaliin)
3. Tee tiedostosta kopio ja nimeä kopio `.env.local`:
   - Terminaalissa (Windowsissa):
     ```
     copy .env.example .env.local
     ```
   - Terminaalissa (Macilla):
     ```
     cp .env.example .env.local
     ```
4. Avaa `.env.local` tekstieditorilla (esim. Muistio, VS Code, tai Notepad++)
5. Korvaa esimerkkiarvot omilla Supabase-arvoillasi (VAIHE 3.3):
   ```
   VITE_SUPABASE_URL=https://sinuntunnus.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...koko pitkä avain tähän
   ```
6. Tallenna tiedosto

**Tärkeää:** Älä jaa `.env.local`-tiedostoa kenellekään. Se sisältää avaimia, joilla pääsee tietokantaasi.

---

## VAIHE 6 – Luo käyttäjätili sovellukseen

Sovellus vaatii kirjautumisen. Luo itsellesi tili Supabasen kautta.

1. Supabase-dashboardissa klikkaa vasemmasta sivupalkista **"Authentication"** (henkilöikoni)
2. Klikkaa **"Users"**
3. Klikkaa **"+ Invite user"** tai **"Add user"**
4. Syötä sähköpostiosoitteesi ja salasanasi
5. Klikkaa **"Create user"**

Voit myös vaihtoehtoisesti ensin käynnistää sovelluksen (VAIHE 7) ja rekisteröityä sovelluksen kirjautumissivulla — mutta siihen tarvitaan lisäasetus:

**Sähköpostivahvistuksen poistaminen käytöstä (helpompaa testaukseen):**
1. Authentication → Providers → Email
2. Poista rasti kohdasta "Confirm email"
3. Tallenna

---

## VAIHE 7 – Asenna riippuvuudet ja käynnistä sovellus

1. Avaa terminaali ja varmista, että olet sovelluksen kansiossa:
   ```
   cd C:\Dokumentit\siemenhallinta
   ```
   (tai missä ikinä kansiosi on)

2. Asenna riippuvuudet:
   ```
   npm install
   ```
   Tämä lataa kaikki tarvittavat kirjastot. Kestää 1–3 minuuttia. Terminaaliin tulostuu paljon tekstiä — se on normaalia.

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

6. Näet kirjautumissivun — kirjaudu äsken luomillasi tunnuksilla.

**Sovellus toimii!** Voit nyt lisätä omia siemeniä, istutuspaikkoja ja istutuksia.

Kehityspalvelin toimii niin kauan kuin terminaali on auki. Sulje se painamalla `Ctrl + C`.

---

## VAIHE 8 (valinnainen) – Julkaise sovellus verkkoon

Jos haluat käyttää sovellusta myös puhelimella tai muilla laitteilla ilman, että tietokone on päällä, voit julkaista sen ilmaiseksi Netlifyyn.

### 8.1 Rekisteröidy Netlifyyn

1. Mene osoitteeseen: **https://netlify.com**
2. Klikkaa **"Sign up"** → kirjaudu GitHub-tilillä (helpoin tapa)

### 8.2 Julkaise sovellus

**Tapa A: Vedä ja pudota (helpoin)**

1. Terminaalissa, sovelluksen kansiossa, aja:
   ```
   npm run build
   ```
   Tämä luo `dist`-kansion, joka sisältää valmiin sovelluksen.

2. Mene **https://app.netlify.com/drop**
3. Vedä `dist`-kansio sivulle — Netlify julkaisee sovelluksen välittömästi
4. Saat URL:n kuten `https://amazing-name-12345.netlify.app`

**Tapa B: GitHub + automaattinen julkaisu**

Jos olet kloonannut sovelluksen GitHubista:
1. Netlify-dashboardissa klikkaa **"Add new site"** → **"Import an existing project"**
2. Valitse GitHub ja anna Netlifylle lupa
3. Valitse repositorio
4. Build-asetukset:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Klikkaa **"Add environment variables"** ja lisää:
   - `VITE_SUPABASE_URL` = projekti-URL:si
   - `VITE_SUPABASE_ANON_KEY` = anon-avaimesi
6. Klikkaa **"Deploy site"**

Jatkossa kun pushaat muutoksia GitHubiin, Netlify päivittää sivun automaattisesti.

---

## Sovelluksen mukauttaminen

### Sovelluksen nimen vaihtaminen

Sovelluksen nimi "Harmsun siemenet" näkyy:
- Kirjautumissivulla: `src/components/Login.tsx` rivi 36
- Selaimen välilehdessä: `index.html` rivi 6
- iOS-kuvakkeen nimessä: `index.html` rivi 21
- README:ssä: `README.md` rivi 1

Avaa nämä tiedostot tekstieditorilla ja korvaa "Harmsun siemenet" omalla nimelläsi.

---

## Yleisimmät ongelmat

### "Cannot find module" tai muita virheitä `npm install` jälkeen

Poista `node_modules`-kansio ja aja `npm install` uudelleen:
```
# Windowsissa
rmdir /s /q node_modules
npm install

# Macilla
rm -rf node_modules
npm install
```

### Sovellus ei käynnisty — "Supabase-ympäristömuuttujat puuttuvat"

Tarkista, että `.env.local`-tiedosto on olemassa sovelluksen juurikansiossa ja sisältää oikeat arvot (VAIHE 5).

### Kirjautuminen ei onnistu

1. Tarkista, että käyttäjä on luotu Supabase → Authentication → Users
2. Tarkista, onko "Confirm email" päällä — jos on, sinun pitää vahvistaa sähköposti ensin
3. Tarkista, että `.env.local`:n URL ja avain ovat oikein (ei ylimääräisiä välilyöntejä)

### Taulut puuttuvat / "relation does not exist" -virhe

Aja `schema.sql` uudelleen Supabase SQL Editorissa (VAIHE 4).

### Netlify-sivulla tyhjää tai virhe

Tarkista, että olet lisännyt ympäristömuuttujat Netlifyn asetuksiin (VAIHE 8, Tapa B, kohta 5).

---

## Tuki

Jos jokin ei toimi, voit pyytää apua Claudelta (AI-assistentti). Kerro:
1. Missä vaiheessa ongelma ilmeni
2. Mitä virheviestiä näkyy (kopioi koko viesti)
3. Millä käyttöjärjestelmällä olet

Claude osaa auttaa konfiguroinnissa ja virheiden selvittämisessä vaihe vaiheelta.
