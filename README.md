# Harmsun siemenet

Siementen ja kasvien hallintasovellus. Seuraa siemeniä, istutuksia ja hoitotoimenpiteitä.

## Ominaisuudet

- **Siementen hallinta**: Lisää, muokkaa ja poista siemeniä kategorioittain
- **Istutuspaikat**: Hallitse eri istutuspaikkoja (kasvihuone, avomaalla jne.)
- **Istutukset**: Seuraa mitä siemeniä on istutettu ja minne
- **Hoitoloki**: Kirjaa kastelut, lannoitukset ja muut hoitotoimenpiteet
- **Kalenteri**: Näe kylvöajat ja istutusaikataulut
- **Tilastot**: Yhteenveto istutuksista ja sadosta
- **Kirjautuminen**: Supabase-autentikointi

## Teknologiat

- **Frontend**: React 19, TypeScript, Vite
- **Tyylitys**: CSS
- **Tietokanta**: Supabase (PostgreSQL)
- **Autentikointi**: Supabase Auth
- **Testaus**: Vitest, Testing Library

## Asennus

```bash
# Asenna riippuvuudet
npm install

# Käynnistä kehityspalvelin
npm run dev

# Aja testit
npm run test

# Buildaa tuotantoversio
npm run build
```

## Ympäristö

Sovellus käyttää Supabasea backendina. Supabase-konfiguraatio on tiedostossa `src/lib/supabase.ts`.

### Tietokantataulut

- **seeds** - Siemenet (nimi, lajike, kategoria, kylvöaika, ohjeet)
- **locations** - Istutuspaikat (nimi, kuvaus, valoisuus, maalaji)
- **plantings** - Istutukset (siemen, paikka, päivämäärä, määrä, tila)
- **care_logs** - Hoitoloki (istutus, päivämäärä, tyyppi, muistiinpanot)
- **subcategories** - Alakategoriat

## Projektihakemisto

```
src/
├── components/          # React-komponentit
│   ├── Calendar.tsx     # Kylvökalenteri
│   ├── CareLogForm.tsx  # Hoitolokin lisäys
│   ├── CategoryFilter.tsx
│   ├── LocationCard.tsx
│   ├── LocationForm.tsx
│   ├── LocationList.tsx
│   ├── Login.tsx        # Kirjautuminen
│   ├── MainApp.tsx      # Pääsovellus
│   ├── PlantingCard.tsx
│   ├── PlantingForm.tsx
│   ├── PlantingList.tsx
│   ├── SearchBar.tsx
│   ├── SeedCard.tsx
│   ├── SeedForm.tsx
│   ├── SeedList.tsx
│   └── Statistics.tsx
├── data/                # Esimerkkidata
├── hooks/               # React-hookit
│   ├── useLocalStorage.ts
│   └── useSupabaseData.ts
├── lib/
│   └── supabase.ts      # Supabase-client
├── test/
│   └── setup.ts         # Testien konfiguraatio
├── types/
│   └── index.ts         # TypeScript-tyypit
├── App.tsx              # Pääkomponentti
├── main.tsx             # Entry point
└── index.css            # Globaalit tyylit
```

## Skriptit

| Komento | Kuvaus |
|---------|--------|
| `npm run dev` | Käynnistä kehityspalvelin |
| `npm run build` | Buildaa tuotantoversio |
| `npm run preview` | Esikatsele tuotantoversiota |
| `npm run test` | Aja testit watch-tilassa |
| `npm run test:run` | Aja testit kerran |
| `npm run lint` | Tarkista koodi ESLintillä |

## Testaus

Testit käyttävät Vitestiä ja Testing Libraryä.

```bash
# Aja testit watch-tilassa
npm run test

# Aja testit kerran
npm run test:run
```

### Testitiedostot

- `src/types/index.test.ts` - Tyyppien ja vakioiden testit
- `src/components/Login.test.tsx` - Kirjautumis-komponentin testit

## Deployment

Sovellus on deployattu Netlifyyn:

**URL**: https://siemenhallinta.netlify.app

### Manuaalinen deploy

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

## Kategoriat

### Siemenkategoriat
- Vihannekset
- Yrtit
- Kukat
- Hedelmät
- Marjat

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
