// Aja tämä skripti selaimen konsolissa osoitteessa https://siemenhallinta.netlify.app
// HUOM: Kirjaudu ensin sisään ennen ajamista

async function migrateImages() {
  const SUPABASE_URL = 'https://vhcehzlcitjvlcyldyqc.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoY2VoemxjaXRqdmxjeWxkeXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDE0NTYsImV4cCI6MjA4NTc3NzQ1Nn0.u6lXBIKk7TFnMq3KhaxDGJHjg9O7pf8_oGwmW4Kn9SE';

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  // Hae kaikki siemenet joilla on base64-kuva
  console.log('Haetaan siemenet...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/seeds?select=id,image_url&image_url=like.data:*`, { headers });
  const seeds = await res.json();
  console.log(`Löytyi ${seeds.length} siementä base64-kuvalla`);

  let ok = 0, fail = 0;

  for (const seed of seeds) {
    try {
      // Muunna base64 -> Blob
      const base64 = seed.image_url;
      const byteString = atob(base64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });

      // Lataa Storageen
      const fileName = `migrated-${seed.id}.jpg`;
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/seed-images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        body: blob,
      });

      if (!uploadRes.ok) {
        // Jos tiedosto on jo olemassa, jatketaan silti URL-päivitykseen
        if (uploadRes.status !== 409) throw new Error(`Upload failed: ${uploadRes.status}`);
      }

      // Päivitä seed tietokantaan uudella URL:lla
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/seed-images/${fileName}`;
      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/seeds?id=eq.${seed.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ image_url: publicUrl }),
      });

      if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);

      ok++;
      console.log(`✓ ${seed.id} (${ok}/${seeds.length})`);
    } catch (err) {
      fail++;
      console.error(`✗ ${seed.id}:`, err.message);
    }
  }

  console.log(`\nValmis! Onnistui: ${ok}, Epäonnistui: ${fail}`);
}

migrateImages();
