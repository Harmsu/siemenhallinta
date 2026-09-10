// Käyttö: node create-user.js <email> <password>
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../database');

const BULB_TYPE_ANCHOR = '__sipulit__';
const DEFAULT_BULB_SUBCATEGORIES = ['Tulppaani', 'Lilja', 'Narsissi', 'Hyasintti', 'Helmililja'];

const CATEGORY_ANCHOR = '__kategoriat__';
const DEFAULT_CATEGORIES = ['vihannekset', 'yrtit', 'kukat', 'hedelmät', 'marjat'];

async function seedDefaults(userId, anchor, names) {
  for (const name of names) {
    await pool.query(
      `INSERT INTO subcategories (user_id, category, name) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category, name) DO NOTHING`,
      [userId, anchor, name]
    );
  }
}

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Käyttö: node create-user.js <email> <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email`,
    [email, hash]
  );
  console.log('Käyttäjä tallennettu:', rows[0]);

  await seedDefaults(rows[0].id, CATEGORY_ANCHOR, DEFAULT_CATEGORIES);
  console.log('Siementen oletuskategoriat lisätty:', DEFAULT_CATEGORIES.join(', '));

  await seedDefaults(rows[0].id, BULB_TYPE_ANCHOR, DEFAULT_BULB_SUBCATEGORIES);
  console.log('Sipulien oletuskategoriat lisätty:', DEFAULT_BULB_SUBCATEGORIES.join(', '));

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
