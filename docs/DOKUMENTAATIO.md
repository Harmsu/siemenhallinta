# Harmsun Puutarhapäiväkirja - Tekninen dokumentaatio

## Yleiskuvaus

Harmsun Puutarhapäiväkirja on web-sovellus siementen, kukkasipulien, istutuspaikkojen ja istutusten hallintaan. Sovellus toimii kaikilla laitteilla (puhelin, tabletti, tietokone), tukee PWA-asennusta kotinäytölle, ja data synkronoituu laitteiden välillä oman backendin kautta. Sovellus tukee useaa käyttäjää — jokainen näkee vain oman datansa.

## Teknologiat

### Frontend
- **React 19** - UI-kirjasto
- **TypeScript** - Tyypitetty JavaScript
- **Vite** - Kehitys- ja build-työkalu
- **CSS** - Tyylitys (ei erillistä CSS-kirjastoa)
- **Vitest + Testing Library** - Testaus

### Backend
- **Node.js / Express** (`server/`) - oma REST-API
- **JWT (jsonwebtoken + bcryptjs)** - autentikointi, ei kolmannen osapuolen Auth-palvelua
- **PostgreSQL** - tietokanta (jaettu palvelin, ei sovelluskohtaista Backend-as-a-Service-ratkaisua)
- **ssh2-sftp-client** - kuvien tallennus SFTP:n yli omalle palvelimelle

### Hosting
- **Netlify** - frontend (staattinen build)
- **Render** - backend (Node-palvelu, Blueprint `server/render.yaml`)
- Tietokanta ja kuvapalvelin ovat erillisiä, käyttäjän itse hankkimia/ylläpitämiä (ks. `ASENNUSOHJE.md`)

> **Historia**: sovellus käytti alun perin Supabasea (Auth + Postgres + Storage). Se migroitiin omaan Express-backendiin, erilliseen Postgres-tietokantaan ja SFTP-kuvatallennukseen — tämä dokumentti kuvaa nykytilan.

## Projektin rakenne

```
siemenhallinta/
├── server/                      # Express-backend
│   ├── index.js                 # Sovelluksen käynnistys, reittien rekisteröinti
│   ├── database.js              # PG-pool, initDB() (luo puuttuvat taulut automaattisesti)
│   ├── auth.js                  # JWT-middleware (requireAuth)
│   ├── routes/
│   │   ├── authRoutes.js        # Kirjautuminen, salasanan vaihto
│   │   ├── seedsRoutes.js       # Siemenet/sipulit (CRUD)
│   │   ├── subcategoriesRoutes.js  # Kategoriat/alakategoriat (myös sipulityypit)
│   │   ├── locationsRoutes.js   # Istutuspaikat
│   │   ├── plantingsRoutes.js   # Istutukset
│   │   ├── careLogsRoutes.js    # Hoitoloki
│   │   ├── imageRoutes.js       # Kuvien lataus/haku/poisto (SFTP-proxy)
│   │   └── plantingPhotosRoutes.js  # Istutusten liitekuvat (CRUD)
│   ├── lib/sftp.js              # SFTP-kuvien lataus/haku/poisto, alikansiotuki
│   ├── scripts/
│   │   ├── create-user.js       # Uuden käyttäjätilin luonti + oletuskategoriat
│   │   └── delete-test-user.js  # Testitilin ja sen datan poisto
│   └── render.yaml              # Render-julkaisun Blueprint
├── src/
│   ├── components/               # React-komponentit
│   │   ├── Login.tsx             # Kirjautumissivu
│   │   ├── MainApp.tsx           # Pääsovellus, navigaatio, poistovahvistuksen tila
│   │   ├── SeedList.tsx / SeedCard.tsx / SeedForm.tsx     # Siemenet
│   │   ├── BulbCategoryFilter.tsx / CategoryFilter.tsx    # Kategoriasuodattimet (sipulit/siemenet)
│   │   ├── LocationList.tsx / LocationCard.tsx / LocationForm.tsx  # Istutuspaikat
│   │   ├── PlantingList.tsx / PlantingCard.tsx / PlantingForm.tsx  # Istutukset
│   │   ├── PlantingPhotos.tsx    # Istutuksen liitekuvat (lazy-ladattava galleria)
│   │   ├── CareLogForm.tsx       # Hoitomerkinnän lomake
│   │   ├── Calendar.tsx          # Kalenterinäkymä
│   │   ├── Statistics.tsx        # Tilastonäkymä
│   │   ├── ChangePasswordForm.tsx  # Salasanan vaihto (Asetukset-välilehti)
│   │   ├── ConfirmDialog.tsx     # Oma poistovahvistusdialogi (EI window.confirm())
│   │   └── SearchBar.tsx
│   ├── hooks/
│   │   ├── useAuth.ts            # JWT-kirjautuminen, tokenin tallennus
│   │   └── useSupabaseData.ts    # Datahook (nimi historiallinen, kutsuu nyt api.*:aa)
│   ├── api/
│   │   └── client.ts             # Backend-API-client (fetch + JWT-Authorization-header)
│   ├── utils/
│   │   ├── seedCsv.ts            # CSV-vienti/tuonti, duplikaattisuodatus
│   │   └── image.ts              # Jaettu kuvanpakkausapufunktio (canvas-pohjainen)
│   ├── types/
│   │   └── index.ts              # TypeScript-tyypit
│   ├── App.tsx                   # Juurikomponentti (kirjautuminen vs. MainApp)
│   ├── App.css                   # Päätyylit
│   └── main.tsx                  # Sovelluksen käynnistys
├── schema.sql                    # Tietokantarakenne (viitteellinen - server/database.js ajaa saman automaattisesti)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tietomalli

### Seed (Siemen / Sipuli)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| nameFi | string | Suomenkielinen nimi |
| variety | string | Lajike |
| category | string | Yläkategoria — siemenillä yksi 5 vakiokategoriasta, sipuleilla käyttäjän itse lisäämä sipulityyppi (esim. "Tulppaani") |
| subcategory | string | Alakategoria (valinnainen) |
| categoryType | `'siemen'` \| `'sipuli'` | Erottaa siemenet ja sipulit samasta taulusta |
| plantingDepthCm | number (valinnainen) | Istutussyvyys — käytössä lähinnä sipuleilla |
| plantingTime | PlantingTime | Istutusaika (alkukuukausi, loppukuukausi, esikasvatus) |
| growingInstructions | string | Kasvatusohjeet |
| imageUrl | string | Otsikkokuva (SFTP-osoite, ei base64) |
| createdAt | timestamp | Luontiaika |

### SeedCategory (kiinteät siemenkategoriat)
vihannekset, yrtit, kukat, hedelmät, marjat — käyttäjä voi lisätä/poistaa myös näitä sekä sipulityyppejä `subcategories`-taulun kautta (ei kiinteä lista koodissa, ks. alla).

### Subcategory (Ala-/pääkategoria)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| category | string | Yläkategoria, tai `__kategoriat__`/`__sipulit__` -ankkuri kun rivi on itse pääkategoria/sipulityyppi |
| name | string | Nimi |
| createdAt | timestamp | Luontiaika |

### PlantingLocation (Istutuspaikka)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| name | string | Paikan nimi |
| description | string | Kuvaus |
| sunExposure | SunExposure | Valoisuus |
| soilType | string | Maaperän tyyppi |
| createdAt | timestamp | Luontiaika |

### SunExposure (Valoisuus)
aurinkoinen, puolivarjo, varjo

### Planting (Istutus)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| seedId | UUID | Viittaus siemeneen/sipuliin |
| locationId | UUID | Viittaus istutuspaikkaan |
| plantedDate | date (TEXT) | Istutuspäivä |
| quantity | number | Alkuperäinen määrä |
| currentQuantity | number | Jäljellä oleva määrä (pienenee hävikin myötä) |
| notes | string | Muistiinpanot |
| status | PlantingStatus | Tila |
| createdAt | timestamp | Luontiaika |

### PlantingStatus (Istutuksen tila)
- seedling (Esikasvatuksessa)
- planted_ground (Istutettu maahan)
- planted_greenhouse (Istutettu kasvihuoneeseen)
- active (Kasvaa)
- harvested (Korjattu)
- failed (Epäonnistunut)

### PlantingPhoto (Istutuksen liitekuva)
Eri asia kuin Seed.imageUrl (otsikkokuva) — istutuksella voi olla 0-N liitekuvaa esim. istutushetkestä tai taimivaiheesta.

| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| plantingId | UUID | Viittaus istutukseen |
| imageUrl | string | Kuvan osoite (SFTP, oma `planting-photos`-alikansio) |
| caption | string | Valinnainen kuvateksti |
| takenAt | date (TEXT) | Kuvauspäivä, käyttäjän muokattavissa |
| createdAt | timestamp | Luontiaika |

### CareLogEntry (Hoitomerkintä)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| plantingId | UUID | Viittaus istutukseen |
| date | date (TEXT) | Päivämäärä |
| type | CareType | Hoitotyyppi |
| notes | string | Muistiinpanot |
| quantityAfter | number (valinnainen) | Jäljellä oleva määrä merkinnän jälkeen (hävikin kirjaukseen) |
| createdAt | timestamp | Luontiaika |

### CareType (Hoitotyyppi)
- watering (Kastelu)
- fertilizing (Lannoitus)
- pruning (Leikkaus)
- harvesting (Sadonkorjuu)
- pest_control (Tuholaistorjunta)
- loss (Hävikki)
- note (Muistiinpano)
- improvement (Parannusehdotus)
- other (Muu)

## Tietokantataulut (PostgreSQL)

Ajantasainen, täydellinen rakenne on tiedostossa `schema.sql` sovelluksen juuressa. `server/database.js`:n `initDB()`-funktio ajaa saman rakenteen (`CREATE TABLE IF NOT EXISTS`) automaattisesti aina kun backend käynnistyy — uudet taulut/indeksit syntyvät siis itsestään ilman erillistä käsin ajettavaa migraatiota.

Taulut: `users`, `seeds`, `subcategories`, `locations`, `plantings`, `care_logs`, `planting_photos`. Kaikilla käyttäjädataa sisältävillä tauluilla on `user_id`-viittaus `users`-tauluun — tietokantatasolla ei ole Row Level Securityä, moni-käyttäjyys on toteutettu sovellustasolla (jokainen reitti suodattaa `WHERE user_id = req.userId` JWT:stä puretun käyttäjä-id:n mukaan, ks. `server/auth.js`).

## Autentikointi

Sovellus käyttää omaa JWT-pohjaista autentikointia (ei kolmannen osapuolen Auth-palvelua):
- Sähköposti + salasana -kirjautuminen (`POST /api/auth/login`), salasanat hashattu bcryptillä
- Onnistunut kirjautuminen palauttaa JWT:n, joka tallennetaan selaimen `localStorage`iin ja lähetetään `Authorization: Bearer <token>` -headerissa jokaisessa API-kutsussa
- `server/auth.js`:n `requireAuth`-middleware tarkistaa tokenin ja asettaa `req.userId`:n jokaiselle suojatulle reitille
- Käyttäjätilejä ei luoda sovelluksen kautta itse — ks. `server/scripts/create-user.js`
- Salasanan voi vaihtaa sovelluksen Asetukset-välilehdeltä (`PUT /api/auth/password`)

## PWA-ominaisuudet

- Web App Manifest (`public/manifest.json`), `display: standalone`
- Kuvakkeet (192x192, 512x512)
- iOS-tuki (apple-touch-icon, apple-mobile-web-app-capable)
- Standalone-näyttötila (ei selaimen osoitepalkkia)
- **HUOM**: `window.confirm()`/`window.alert()`/`window.prompt()` eivät ole luotettavia iOS:n standalone-PWA-tilassa (voivat olla näyttämättä mitään, jolloin dialogia odottava koodi ei koskaan jatku). Poistotoiminnot käyttävät siksi omaa `ConfirmDialog`-komponenttia natiivin `confirm()`:n sijaan.

## Kehitysympäristö

### Vaatimukset
- Node.js 18+ (backendille ja frontendille erikseen `npm install`)
- Oma PostgreSQL-tietokanta (paikallisessa kehityksessä tyypillisesti SSH-tunnelin kautta jaettuun tuotantokantaan, tai oma erillinen kehityskanta)
- SFTP-yhteensopiva palvelin kuvien lataukselle (valinnainen paikallisessa kehityksessä — ilman sitä kuvien lataus ei toimi, muu sovellus toimii normaalisti)

Täydellinen asennusohje: `ASENNUSOHJE.md`.

### Asennus
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### Kehityspalvelimet (kaksi terminaalia)
```bash
# Terminaali 1: backend
cd server
npm start        # tai npm run dev (nodemon, automaattinen uudelleenkäynnistys)

# Terminaali 2: frontend
npm run dev
```

### Tuotantoversio (frontend)
```bash
npm run build
```

### Testit ja tyypit
```bash
npx vitest run
npx tsc -b --noEmit
```

### PWA-kuvakkeiden generointi
```bash
node scripts/generate-icons.mjs
```

### Käyttäjätilin luonti
```bash
node server/scripts/create-user.js sposti@esimerkki.fi salasana
```

## Ympäristömuuttujat

### Backend (`server/.env`)
- `PORT` - portti (oletus 3001)
- `CLIENT_URL` - sallittu CORS-origin (frontendin osoite)
- `JWT_SECRET` - JWT-allekirjoitusavain
- `DATABASE_URL` - Postgres-yhteysmerkkijono
- `SFTP_HOST`, `SFTP_PORT`, `SFTP_USERNAME`, `SFTP_PRIVATE_KEY`, `SFTP_REMOTE_DIR` - kuvapalvelimen tiedot

### Frontend (`.env.local`)
- `VITE_API_URL` - backendin API-osoite (esim. `http://localhost:3001/api` paikallisesti, `https://oma-backend.onrender.com/api` tuotannossa)

Täydellinen selitys kullekin muuttujalle: `ASENNUSOHJE.md`.

## Julkaisu

1. **Backend**: Render-Blueprint (`server/render.yaml`), auto-deploy `master`-branchista, ympäristömuuttujat asetettu Renderin dashboardissa
2. **Frontend**: Netlify, `npm run build` → `dist`-kansio, auto-deploy `master`-branchista, `VITE_API_URL`-ympäristömuuttuja asetettu Netlifyn asetuksissa

Push `master`-branchiin käynnistää automaattisesti molemmat deployt.

## Toteutetut ominaisuudet (aiemmin "jatkokehitysideoina")

Seuraavat ovat nyt osa sovellusta: kuvien pakkaus ennen tallennusta (canvas-pohjainen, `src/utils/image.ts`), siementen/sipulien CSV-tuonti/vienti varmuuskopiointiin (duplikaattisuodatuksella), moni-käyttäjätuki (JWT), istutuksen liitekuvat.

## Jatkokehitysideoita

- Offline-tuki (Service Worker) — ei vielä käytössä, PWA toimii nyt vain kun verkkoyhteys on päällä
- Satohistoria ja pidemmän aikavälin tilastointi vuosien yli
- Sääennuste-integraatio
- Jakaminen muiden käyttäjien kanssa (nyt jokainen käyttäjä näkee vain oman datansa, ei yhteiskäyttöä)
- Vanhojen otsikkokuvien roskatiedostojen siivous SFTP-palvelimelta (kuvan poisto/vaihto ei tällä hetkellä poista vanhaa tiedostoa palvelimelta — istutuskuvilla tämä on jo korjattu, otsikkokuvilla ei vielä)
