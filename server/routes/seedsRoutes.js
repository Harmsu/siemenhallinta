const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');

router.use(requireAuth);

function toSeed(row) {
  return {
    id: row.id,
    nameFi: row.name_fi,
    variety: row.variety || '',
    category: row.category,
    subcategory: row.subcategory || '',
    categoryType: row.category_type,
    plantingDepthCm: row.planting_depth_cm !== null ? Number(row.planting_depth_cm) : undefined,
    plantingTime: {
      startMonth: row.planting_start_month,
      endMonth: row.planting_end_month,
      indoor: row.planting_indoor,
    },
    growingInstructions: row.growing_instructions || '',
    imageUrl: row.image_url || '',
    createdAt: row.created_at,
  };
}

// GET /api/seeds
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM seeds WHERE user_id = $1 ORDER BY name_fi', [req.userId]);
  res.json(rows.map(toSeed));
});

// POST /api/seeds
router.post('/', async (req, res) => {
  const {
    nameFi, variety, category, subcategory, categoryType, plantingDepthCm,
    plantingTime, growingInstructions, imageUrl,
  } = req.body;
  if (!nameFi || !category || !plantingTime) {
    return res.status(400).json({ error: 'Nimi, kategoria ja istutusaika vaaditaan' });
  }
  const { rows } = await pool.query(
    `INSERT INTO seeds
      (user_id, name_fi, variety, category, subcategory, category_type, planting_depth_cm,
       planting_start_month, planting_end_month, planting_indoor, growing_instructions, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      req.userId, nameFi, variety || null, category, subcategory || null,
      categoryType || 'siemen', plantingDepthCm ?? null,
      plantingTime.startMonth, plantingTime.endMonth, !!plantingTime.indoor,
      growingInstructions || null, imageUrl || null,
    ]
  );
  res.status(201).json(toSeed(rows[0]));
});

// PUT /api/seeds/:id
router.put('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM seeds WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Siementä ei löydy' });

  const {
    nameFi, variety, category, subcategory, categoryType, plantingDepthCm,
    plantingTime, growingInstructions, imageUrl,
  } = req.body;
  const { rows } = await pool.query(
    `UPDATE seeds SET
      name_fi=$1, variety=$2, category=$3, subcategory=$4, category_type=$5, planting_depth_cm=$6,
      planting_start_month=$7, planting_end_month=$8, planting_indoor=$9,
      growing_instructions=$10, image_url=$11
     WHERE id=$12 AND user_id=$13 RETURNING *`,
    [
      nameFi, variety || null, category, subcategory || null, categoryType || 'siemen', plantingDepthCm ?? null,
      plantingTime.startMonth, plantingTime.endMonth, !!plantingTime.indoor,
      growingInstructions || null, imageUrl || null,
      req.params.id, req.userId,
    ]
  );
  res.json(toSeed(rows[0]));
});

// DELETE /api/seeds/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM seeds WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Siementä ei löydy' });
  await pool.query('DELETE FROM seeds WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
