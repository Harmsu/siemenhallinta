require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');

const authRoutes = require('./routes/authRoutes');
const seedsRoutes = require('./routes/seedsRoutes');
const subcategoriesRoutes = require('./routes/subcategoriesRoutes');
const locationsRoutes = require('./routes/locationsRoutes');
const plantingsRoutes = require('./routes/plantingsRoutes');
const careLogsRoutes = require('./routes/careLogsRoutes');
const imageRoutes = require('./routes/imageRoutes');
const plantingPhotosRoutes = require('./routes/plantingPhotosRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: false,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/seeds', seedsRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/plantings', plantingsRoutes);
app.use('/api/care-logs', careLogsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/planting-photos', plantingPhotosRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Sisäinen palvelinvirhe' });
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}`));
}).catch(err => {
  console.error('Tietokannan alustus epäonnistui:', err);
  process.exit(1);
});
