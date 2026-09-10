const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken, requireAuth } = require('../auth');
const { pool } = require('../database');

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

module.exports = router;
