const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const { requireAuth } = require('../auth');
const { uploadImage, downloadImage } = require('../lib/sftp');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/images
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

// GET /api/images/:filename
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
