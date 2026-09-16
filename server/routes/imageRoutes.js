const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const { requireAuth } = require('../auth');
const { uploadImage, downloadImage, deleteImage } = require('../lib/sftp');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Istutuskuvat tallennetaan omaan alikansioon, erilleen siementen/sipulien otsikkokuvista
const PLANTING_PHOTOS_DIR = 'planting-photos';

// POST /api/images - siementen/sipulien otsikkokuva
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kuva vaaditaan' });
  const filename = `${crypto.randomUUID()}.jpg`;
  try {
    await uploadImage(req.file.buffer, filename);
  } catch (err) {
    console.error('SFTP-lataus epäonnistui:', err);
    return res.status(502).json({ error: 'Kuvan tallennus epäonnistui' });
  }
  res.status(201).json({ url: `/api/images/${filename}` });
});

// POST /api/images/planting-photos - istutuksen liitekuva
router.post('/planting-photos', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Kuva vaaditaan' });
  const filename = `${crypto.randomUUID()}.jpg`;
  try {
    await uploadImage(req.file.buffer, filename, PLANTING_PHOTOS_DIR);
  } catch (err) {
    console.error('SFTP-lataus epäonnistui:', err);
    return res.status(502).json({ error: 'Kuvan tallennus epäonnistui' });
  }
  res.status(201).json({ url: `/api/images/planting-photos/${filename}` });
});

// GET /api/images/planting-photos/:filename
router.get('/planting-photos/:filename', async (req, res) => {
  try {
    const buffer = await downloadImage(req.params.filename, PLANTING_PHOTOS_DIR);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    res.status(404).json({ error: 'Kuvaa ei löydy' });
  }
});

// DELETE /api/images/planting-photos/:filename
router.delete('/planting-photos/:filename', requireAuth, async (req, res) => {
  try {
    await deleteImage(req.params.filename, PLANTING_PHOTOS_DIR);
  } catch (err) {
    console.error('SFTP-poisto epäonnistui:', err);
    return res.status(502).json({ error: 'Kuvan poisto epäonnistui' });
  }
  res.json({ success: true });
});

// GET /api/images/:filename - siementen/sipulien otsikkokuva
router.get('/:filename', async (req, res) => {
  try {
    const buffer = await downloadImage(req.params.filename);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    res.status(404).json({ error: 'Kuvaa ei löydy' });
  }
});

module.exports = router;
