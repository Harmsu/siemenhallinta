const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken, requireAuth } = require('../auth');
const { pool } = require('../database');

const MIN_PASSWORD_LENGTH = 8;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Sähköposti ja salasana vaaditaan' });
  }
  const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
  }
  res.json({ token: generateToken({ id: user.id, email: user.email }) });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  if (!rows[0]) return res.status(404).json({ error: 'Käyttäjää ei löydy' });
  res.json(rows[0]);
});

router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Nykyinen ja uusi salasana vaaditaan' });
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Uuden salasanan pitää olla vähintään ${MIN_PASSWORD_LENGTH} merkkiä` });
  }

  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return res.status(401).json({ error: 'Nykyinen salasana on väärin' });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);
  res.json({ success: true });
});

module.exports = router;
