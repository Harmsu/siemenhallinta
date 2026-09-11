// Käyttö: node scripts/delete-test-user.js
// Poistaa uitest@example.com-testitilin ja kaiken siihen liittyvän datan.
require('dotenv').config();
const { pool } = require('../database');

const TEST_EMAIL = 'uitest@example.com';

async function main() {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [TEST_EMAIL]);
  if (rows.length === 0) {
    console.log('Testitiliä ei löytynyt, ei mitään poistettavaa.');
    await pool.end();
    return;
  }
  const uid = rows[0].id;

  const c1 = await pool.query('DELETE FROM care_logs WHERE user_id = $1', [uid]);
  console.log('care_logs poistettu:', c1.rowCount);
  const c2 = await pool.query('DELETE FROM plantings WHERE user_id = $1', [uid]);
  console.log('plantings poistettu:', c2.rowCount);
  const c3 = await pool.query('DELETE FROM seeds WHERE user_id = $1', [uid]);
  console.log('seeds poistettu:', c3.rowCount);
  const c4 = await pool.query('DELETE FROM subcategories WHERE user_id = $1', [uid]);
  console.log('subcategories poistettu:', c4.rowCount);
  const c5 = await pool.query('DELETE FROM locations WHERE user_id = $1', [uid]);
  console.log('locations poistettu:', c5.rowCount);
  const c6 = await pool.query('DELETE FROM users WHERE id = $1', [uid]);
  console.log('users poistettu:', c6.rowCount);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
