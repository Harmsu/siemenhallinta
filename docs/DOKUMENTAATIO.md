# Harmsun siemenet - Tekninen dokumentaatio

## Yleiskuvaus

Harmsun siemenet on web-sovellus siementen, istutuspaikkojen ja istutusten hallintaan. Sovellus toimii kaikilla laitteilla (puhelin, tabletti, tietokone) ja data synkronoituu laitteiden välillä.

## Teknologiat

### Frontend
- **React 18** - UI-kirjasto
- **TypeScript** - Tyypitetty JavaScript
- **Vite** - Kehitys- ja build-työkalu
- **CSS** - Tyylitys (ei erillistä CSS-kirjastoa)

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL-tietokanta
  - Autentikointi (sähköposti + salasana)
  - Row Level Security (RLS)

### Hosting
- **Netlify** - Staattinen hosting

## Projektin rakenne

```
siemenhallinta/
├── public/
│   ├── icons/              # PWA-kuvakkeet
│   └── manifest.json       # PWA-manifest
├── src/
│   ├── components/         # React-komponentit
│   │   ├── Calendar.tsx    # Kalenterinäkymä
│   │   ├── CareLogForm.tsx # Hoitomerkinnän lomake
│   │   ├── CategoryFilter.tsx # Kategoriasuodatin
│   │   ├── LocationCard.tsx   # Istutuspaikkakortti
│   │   ├── LocationForm.tsx   # Istutuspaikan lomake
│   │   ├── LocationList.tsx   # Istutuspaikkalista
│   │   ├── Login.tsx          # Kirjautumissivu
│   │   ├── MainApp.tsx        # Pääsovellus
│   │   ├── PlantingCard.tsx   # Istutuskortti
│   │   ├── PlantingForm.tsx   # Istutuksen lomake
│   │   ├── PlantingList.tsx   # Istutuslista
│   │   ├── SearchBar.tsx      # Hakupalkki
│   │   ├── SeedCard.tsx       # Siemenkortti
│   │   ├── SeedForm.tsx       # Siemenen lomake
│   │   └── SeedList.tsx       # Siemenlista
│   ├── hooks/
│   │   ├── useLocalStorage.ts   # LocalStorage-hook (ei käytössä)
│   │   └── useSupabaseData.ts   # Supabase-datahook
│   ├── lib/
│   │   └── supabase.ts        # Supabase-client
│   ├── types/
│   │   └── index.ts           # TypeScript-tyypit
│   ├── App.tsx                # Juurikomponentti
│   ├── App.css                # Päätyylit
│   └── main.tsx               # Sovelluksen käynnistys
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tietomalli

### Seed (Siemen)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| nameFi | string | Suomenkielinen nimi |
| nameLatin | string | Latinankielinen nimi (valinnainen) |
| variety | string | Lajike |
| category | SeedCategory | Yläkategoria |
| subcategory | string | Alakategoria (valinnainen) |
| plantingTime | PlantingTime | Istutusaika |
| growingInstructions | string | Kasvatusohjeet |
| imageUrl | string | Kuva (base64) |
| createdAt | timestamp | Luontiaika |

### SeedCategory (Siemenkategoria)
- vihannekset
- yrtit
- kukat
- hedelmät
- marjat

### Subcategory (Alakategoria)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| category | SeedCategory | Yläkategoria |
| name | string | Alakategorian nimi |
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
- aurinkoinen
- puolivarjo
- varjo

### Planting (Istutus)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| seedId | UUID | Viittaus siemeneen |
| locationId | UUID | Viittaus istutuspaikkaan |
| plantedDate | date | Istutuspäivä |
| quantity | number | Määrä |
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

### CareLogEntry (Hoitomerkintä)
| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | UUID | Yksilöivä tunniste |
| plantingId | UUID | Viittaus istutukseen |
| date | date | Päivämäärä |
| type | CareType | Hoitotyyppi |
| notes | string | Muistiinpanot |
| createdAt | timestamp | Luontiaika |

### CareType (Hoitotyyppi)
- watering (Kastelu)
- fertilizing (Lannoitus)
- pruning (Leikkaus)
- harvesting (Sadonkorjuu)
- pest_control (Tuholaistorjunta)
- other (Muu)

## Tietokantataulut (Supabase)

```sql
-- Siemenet
CREATE TABLE seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_fi TEXT NOT NULL,
  name_latin TEXT,
  variety TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  planting_start_month INTEGER NOT NULL,
  planting_end_month INTEGER NOT NULL,
  planting_indoor BOOLEAN DEFAULT false,
  growing_instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alakategoriat
CREATE TABLE subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, name)
);

-- Istutuspaikat
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sun_exposure TEXT NOT NULL,
  soil_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Istutukset
CREATE TABLE plantings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  planted_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hoitoloki
CREATE TABLE care_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  planting_id UUID REFERENCES plantings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Autentikointi

Sovellus käyttää Supabasen autentikointia:
- Sähköposti + salasana -kirjautuminen
- Row Level Security (RLS) rajoittaa pääsyn vain kirjautuneille käyttäjille
- Istunto säilyy selaimen localStoragessa

## PWA-ominaisuudet

- Web App Manifest (`manifest.json`)
- Kuvakkeet (192x192, 512x512)
- iOS-tuki (apple-touch-icon, apple-mobile-web-app-capable)
- Standalone-näyttötila (ei selaimen osoitepalkkia)

## Kehitysympäristö

### Vaatimukset
- Node.js 18+
- npm

### Asennus
```bash
cd siemenhallinta
npm install
```

### Kehityspalvelin
```bash
npm run dev
```

### Tuotantoversio
```bash
npm run build
```

### PWA-kuvakkeiden generointi
```bash
node scripts/generate-icons.mjs
```

## Ympäristömuuttujat

Supabase-asetukset ovat tiedostossa `src/lib/supabase.ts`:
- `supabaseUrl` - Supabase-projektin URL
- `supabaseAnonKey` - Julkinen API-avain

## Julkaisu

1. Aja `npm run build`
2. Lataa `dist`-kansio Netlifyyn (app.netlify.com/drop)

## Jatkokehitysideoita

- Offline-tuki (Service Worker)
- Kuvien pakkaus ennen tallennusta
- Siementen tuonti/vienti (CSV/JSON)
- Satohistoria ja tilastot
- Sääennuste-integraatio
- Jakaminen muiden käyttäjien kanssa
