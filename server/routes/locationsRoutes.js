const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');

router.use(requireAuth);

function toLocation(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    sunExposure: row.sun_exposure,
    soilType: row.soil_type || '',
    createdAt: row.created_at,
  };
}

// GET /api/locations
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM locations WHERE user_id = $1 ORDER BY name', [req.userId]);
  res.json(rows.map(toLocation));
});

// POST /api/locations
router.post('/', async (req, res) => {
  const { name, description, sunExposure, soilType } = req.body;
  if (!name || !sunExposure) {
    return res.status(400).json({ error: 'Nimi ja valoisuus vaaditaan' });
  }
  const { rows } = await pool.query(
    'INSERT INTO locations (user_id, name, description, sun_exposure, soil_type) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.userId, name, description || null, sunExposure, soilType || null]
  );
  res.status(201).json(toLocation(rows[0]));
});

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM locations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Istutuspaikkaa ei löydy' });

  const { name, description, sunExposure, soilType } = req.body;
  const { rows } = await pool.query(
    'UPDATE locations SET name=$1, description=$2, sun_exposure=$3, soil_type=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [name, description || null, sunExposure, soilType || null, req.params.id, req.userId]
  );
  res.json(toLocation(rows[0]));
});

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM locations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Istutuspaikkaa ei löydy' });
  await pool.query('DELETE FROM locations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
