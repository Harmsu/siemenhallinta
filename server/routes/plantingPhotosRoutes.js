const router = require('express').Router();
const { pool } = require('../database');
const { requireAuth } = require('../auth');
const { deleteImage } = require('../lib/sftp');

router.use(requireAuth);

const PLANTING_PHOTOS_DIR = 'planting-photos';

function toPhoto(row) {
  return {
    id: row.id,
    plantingId: row.planting_id,
    imageUrl: row.image_url,
    caption: row.caption || '',
    takenAt: row.taken_at,
    createdAt: row.created_at,
  };
}

// GET /api/planting-photos?plantingId=xxx
router.get('/', async (req, res) => {
  const { plantingId } = req.query;
  if (!plantingId) return res.status(400).json({ error: 'plantingId vaaditaan' });
  const { rows } = await pool.query(
    'SELECT * FROM planting_photos WHERE planting_id = $1 AND user_id = $2 ORDER BY taken_at DESC, created_at DESC',
    [plantingId, req.userId]
  );
  res.json(rows.map(toPhoto));
});

// POST /api/planting-photos
router.post('/', async (req, res) => {
  const { plantingId, imageUrl, caption, takenAt } = req.body;
  if (!plantingId || !imageUrl || !takenAt) {
    return res.status(400).json({ error: 'Istutus, kuva ja päivämäärä vaaditaan' });
  }

  const { rows: plantingRows } = await pool.query(
    'SELECT id FROM plantings WHERE id = $1 AND user_id = $2', [plantingId, req.userId]
  );
  if (!plantingRows[0]) return res.status(404).json({ error: 'Istutusta ei löydy' });

  const { rows } = await pool.query(
    `INSERT INTO planting_photos (user_id, planting_id, image_url, caption, taken_at)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.userId, plantingId, imageUrl, caption || null, takenAt]
  );
  res.status(201).json(toPhoto(rows[0]));
});

// PUT /api/planting-photos/:id
router.put('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT id FROM planting_photos WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Kuvaa ei löydy' });

  const { caption, takenAt } = req.body;
  if (!takenAt) return res.status(400).json({ error: 'Päivämäärä vaaditaan' });

  const { rows } = await pool.query(
    `UPDATE planting_photos SET caption = $1, taken_at = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
    [caption || null, takenAt, req.params.id, req.userId]
  );
  res.json(toPhoto(rows[0]));
});

// DELETE /api/planting-photos/:id
router.delete('/:id', async (req, res) => {
  const { rows: existingRows } = await pool.query(
    'SELECT * FROM planting_photos WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]
  );
  if (!existingRows[0]) return res.status(404).json({ error: 'Kuvaa ei löydy' });

  await pool.query('DELETE FROM planting_photos WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);

  // Poista myös itse kuvatiedosto SFTP:ltä - DB-rivi on joka tapauksessa jo poistettu,
  // joten roskatiedosto levyllä ei ole kriittinen virhe
  const filename = existingRows[0].image_url.split('/').pop();
  try {
    await deleteImage(filename, PLANTING_PHOTOS_DIR);
  } catch (err) {
    console.error('Kuvatiedoston poisto SFTP:ltä epäonnistui (DB-rivi poistettu silti):', err);
  }

  res.json({ success: true });
});

module.exports = router;
