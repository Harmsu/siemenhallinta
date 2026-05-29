import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Migration() {
  const [status, setStatus] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const run = async () => {
    setRunning(true);
    setStatus(['Haetaan siemenet erissä...']);

    // Haetaan ensin vain ID:t
    const { data: allIds, error: idError } = await supabase
      .from('seeds')
      .select('id')
      .like('image_url', 'data:%');

    if (idError) {
      setStatus((p) => [...p, `Virhe: ${idError.message}`]);
      setRunning(false);
      return;
    }

    setStatus((p) => [...p, `Löytyi ${allIds.length} siementä base64-kuvalla`]);

    let ok = 0, fail = 0;
    const BATCH = 3;

    for (let i = 0; i < allIds.length; i += BATCH) {
      const batchIds = allIds.slice(i, i + BATCH).map((r) => r.id);
      const { data: seeds, error: fetchError } = await supabase
        .from('seeds')
        .select('id, image_url')
        .in('id', batchIds);

      if (fetchError) {
        fail += batchIds.length;
        setStatus((p) => [...p, `✗ Erä ${i}-${i + BATCH} epäonnistui: ${fetchError.message}`]);
        continue;
      }

    for (const seed of seeds) {
      try {
        const base64 = seed.image_url;
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: 'image/jpeg' });

        const fileName = `migrated-${seed.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('seed-images')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('seed-images')
          .getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from('seeds')
          .update({ image_url: publicUrl })
          .eq('id', seed.id);

        if (updateError) throw updateError;

        ok++;
        setStatus((p) => [...p, `✓ ${ok}/${allIds.length}`]);
      } catch (err: any) {
        fail++;
        setStatus((p) => [...p, `✗ Virhe (${seed.id}): ${err.message}`]);
      }
    }
    }

    setStatus((p) => [...p, `Valmis! Onnistui: ${ok}, Epäonnistui: ${fail}`]);
    setRunning(false);
    setDone(true);
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2>Kuvien migraatio</h2>
      <p>Siirtää vanhat kuvat tietokannasta Supabase Storageen. Aja vain kerran.</p>
      {!done && (
        <button onClick={run} disabled={running} style={{ padding: '8px 24px', fontSize: 16 }}>
          {running ? 'Ajetaan...' : 'Aja migraatio'}
        </button>
      )}
      <div style={{ marginTop: 16, fontFamily: 'monospace', fontSize: 13 }}>
        {status.map((s, i) => <div key={i}>{s}</div>)}
      </div>
      {done && <p style={{ color: 'green', marginTop: 16 }}>Migraatio valmis! Voit nyt käyttää sovellusta normaalisti.</p>}
    </div>
  );
}
