const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');

router.use(requireAuth);

function toCareLog(row) {
  return {
    id: row.id,
    plantingId: row.planting_id,
    date: row.date,
    type: row.type,
    notes: row.notes || '',
    quantityAfter: row.quantity_after ?? undefined,
    createdAt: row.created_at,
  };
}

// GET /api/care-logs
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM care_logs WHERE user_id = $1 ORDER BY date DESC', [req.userId]
  );
  res.json(rows.map(toCareLog));
});

// POST /api/care-logs
router.post('/', async (req, res) => {
  const { plantingId, date, type, notes, quantityAfter } = req.body;
  if (!plantingId || !date || !type) {
    return res.status(400).json({ error: 'Istutus, päivämäärä ja tyyppi vaaditaan' });
  }
  const { rows } = await pool.query(
    `INSERT INTO care_logs (user_id, planting_id, date, type, notes, quantity_after)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.userId, plantingId, date, type, notes || null, quantityAfter ?? null]
  );
  res.status(201).json(toCareLog(rows[0]));
});

// DELETE /api/care-logs/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM care_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Hoitomerkintää ei löydy' });
  await pool.query('DELETE FROM care_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
