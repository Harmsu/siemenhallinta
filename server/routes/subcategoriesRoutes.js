const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');

router.use(requireAuth);

function toSubcategory(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    createdAt: row.created_at,
  };
}

// GET /api/subcategories
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM subcategories WHERE user_id = $1 ORDER BY name', [req.userId]);
  res.json(rows.map(toSubcategory));
});

// POST /api/subcategories
router.post('/', async (req, res) => {
  const { category, name } = req.body;
  if (!category || !name) {
    return res.status(400).json({ error: 'Kategoria ja nimi vaaditaan' });
  }
  const { rows } = await pool.query(
    'INSERT INTO subcategories (user_id, category, name) VALUES ($1,$2,$3) RETURNING *',
    [req.userId, category, name]
  );
  res.status(201).json(toSubcategory(rows[0]));
});

// DELETE /api/subcategories/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM subcategories WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Alakategoriaa ei löydy' });
  await pool.query('DELETE FROM subcategories WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
