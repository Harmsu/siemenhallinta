# Harmsun Puutarhapäiväkirja

Siementen, kukkasipulien, istutuspaikkojen ja istutusten hallintasovellus. Seuraa siemeniä/sipuleita, istutuksia ja hoitotoimenpiteitä millä tahansa laitteella — data synkronoituu käyttäjän kaikkien laitteiden välillä.

## Ominaisuudet

- **Siemenet ja sipulit**: Omat välilehdet, itse muokattavat/poistettavat kategoriat ja alakategoriat kummallekin
- **Istutuspaikat**: Hallitse eri istutuspaikkoja (kasvihuone, avomaalla jne.)
- **Istutukset**: Seuraa mitä on istutettu ja minne, suodata tyypin mukaan
- **Hoitoloki**: Kirjaa kastelut, lannoitukset ja muut hoitotoimenpiteet
- **Kalenteri**: Näe kylvöajat ja istutusaikataulut
- **Tilastot**: Yhteenveto istutuksista ja sadosta
- **Asetukset**: CSV-vienti/tuonti (varmuuskopiointi), salasanan vaihto, oletuksena avautuvan välilehden valinta (Siemenet/Sipulit)
- **Monikäyttäjätuki**: JWT-kirjautuminen, jokainen käyttäjä näkee vain oman datansa
- **Kuvat**: Siementen/sipulien kuvat tallennetaan SFTP:n yli omalle palvelimelle

## Teknologiat

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js/Express (`server/`), JWT-autentikointi
- **Tietokanta**: PostgreSQL (jaettu UpCloud-palvelin)
- **Kuvat**: SFTP-lataus rajoitetulle palvelinkäyttäjälle
- **Testaus**: Vitest, Testing Library

## Kehitys paikallisesti

Backend tarvitsee yhteyden tuotantotietokantaan SSH-tunnelin kautta (paikallista Postgresia ei ole):

```bash
# 1. Avaa SSH-tunneli tietokantaan (jätä auki koko kehitystyön ajaksi)
ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -L 15432:localhost:5432 sanna@87.58.144.118

# 2. Käynnistä backend (server/.env sisältää valmiit paikalliset arvot)
cd server
npm install
npm start          # portti 3001

# 3. Toisessa ikkunassa: käynnistä frontend
npm install
npm run dev         # portti 5173, VITE_API_URL osoittaa .env-tiedostossa localhost:3001:een

# Testit ja tyypit
npx vitest run
npx tsc -b --noEmit
```

## Projektihakemisto

```
siemenhallinta/
├── server/                  # Express-backend
│   ├── database.js          # PG-pool, error-handler
│   ├── auth.js              # JWT-middleware
│   ├── routes/               # auth/seeds/subcategories/locations/plantings/careLogs/images
│   ├── lib/sftp.js           # Kuvien SFTP-lataus
│   ├── scripts/               # create-user.js, delete-test-user.js
│   └── render.yaml
├── src/
│   ├── components/          # React-komponentit (MainApp = pääsovellus, Asetukset-näkymä mukana)
│   ├── api/client.ts        # Backend-API-client
│   ├── hooks/useAuth.ts     # JWT-kirjautuminen
│   ├── hooks/useSupabaseData.ts  # Datahook (nimi historiallinen, kutsuu nyt api.*:aa)
│   ├── utils/seedCsv.ts     # CSV-vienti/tuonti
│   └── types/index.ts       # TypeScript-tyypit
├── schema.sql                # Tietokantarakenne
└── index.html
```

## Deployment

- **Frontend**: Netlify — https://harmsunsiemenet.netlify.app (branch `master`, auto-deploy)
- **Backend**: Render (Blueprint `render.yaml`) — https://siemen-api.onrender.com (branch `master`, auto-deploy)
- **Tietokanta**: UpCloudin jaettu Postgres-palvelin, kanta `siemenhallinta`

Push masteriin käynnistää automaattisesti sekä Netlify- että Render-deployn.

**HUOM**: vanha osoite `siemenhallinta.netlify.app` on eri, saavuttamattomalla Netlify-tilillä eikä ole enää käytössä.

## Kategoriat

Siementen ja sipulien pääkategoriat ja alakategoriat ovat käyttäjän itse muokattavia sovelluksen kautta (ei kiinteää listaa koodissa).

### Istutustilat
- Esikasvatuksessa
- Istutettu maahan
- Istutettu kasvihuoneeseen
- Kasvaa
- Korjattu
- Epäonnistunut

### Hoitotyypit
- Kastelu
- Lannoitus
- Leikkaus
- Sadonkorjuu
- Tuholaistorjunta
- Muu

## Lisenssi

Yksityinen projekti.
