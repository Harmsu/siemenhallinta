const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');

router.use(requireAuth);

function toPlanting(row) {
  return {
    id: row.id,
    seedId: row.seed_id,
    locationId: row.location_id,
    plantedDate: row.planted_date,
    quantity: row.quantity,
    currentQuantity: row.current_quantity ?? row.quantity,
    notes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
  };
}

// GET /api/plantings
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM plantings WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]
  );
  res.json(rows.map(toPlanting));
});

// POST /api/plantings
router.post('/', async (req, res) => {
  const { seedId, locationId, plantedDate, quantity, currentQuantity, notes, status } = req.body;
  if (!seedId || !locationId || !plantedDate) {
    return res.status(400).json({ error: 'Siemen, paikka ja päivämäärä vaaditaan' });
  }
  const { rows } = await pool.query(
    `INSERT INTO plantings (user_id, seed_id, location_id, planted_date, quantity, current_quantity, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.userId, seedId, locationId, plantedDate, Number(quantity) || 1, currentQuantity ?? quantity ?? 1, notes || null, status || 'seedling']
  );
  res.status(201).json(toPlanting(rows[0]));
});

// PUT /api/plantings/:id
router.put('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM plantings WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Istutusta ei löydy' });

  const { seedId, locationId, plantedDate, quantity, currentQuantity, notes, status } = req.body;
  const { rows } = await pool.query(
    `UPDATE plantings SET seed_id=$1, location_id=$2, planted_date=$3, quantity=$4,
       current_quantity=$5, notes=$6, status=$7
     WHERE id=$8 AND user_id=$9 RETURNING *`,
    [seedId, locationId, plantedDate, Number(quantity) || 1, currentQuantity ?? quantity ?? 1, notes || null, status || 'seedling', req.params.id, req.userId]
  );
  res.json(toPlanting(rows[0]));
});

// DELETE /api/plantings/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM plantings WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Istutusta ei löydy' });
  await pool.query('DELETE FROM plantings WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
