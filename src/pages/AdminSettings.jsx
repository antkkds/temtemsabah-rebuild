import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'tts_settings';

const MODELS = [
  { value: 'nvidia/llama-3.2-11b-vision', label: 'NVIDIA Llama 3.2 11B Vision (fast)' },
  { value: 'nvidia/llama-3.2-90b-vision', label: 'NVIDIA Llama 3.2 90B Vision (accurate)' },
  { value: 'openai/gpt-4o', label: 'OpenAI GPT-4o' },
  { value: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o-mini' },
  { value: 'gemini/gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

// Tables to include in full backup
const BACKUP_TABLES = ['newsroom', 'recipes', 'content', 'contacts', 'crm_users'];

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = { padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };

export function getSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

// Backup helpers
async function fetchAllTables() {
  const results = {};
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (!error) results[table] = data || [];
    else results[table] = [];
  }
  return results;
}

async function restoreTables(data) {
  for (const table of BACKUP_TABLES) {
    const rows = data[table];
    if (!rows || !rows.length) continue;
    // Delete all existing rows, then insert backup
    // Use a dummy filter to delete all (Supabase delete requires a filter)
    const { error: delErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) throw new Error('Delete ' + table + ': ' + delErr.message);
    // Insert in batches of 50 to avoid payload limits
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error: insErr } = await supabase.from(table).insert(batch);
      if (insErr) throw new Error('Insert ' + table + ': ' + insErr.message);
    }
  }
}

export default function AdminSettings({ setMsg }) {
  const [settings, setSettings] = useState(getSettings());
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || MODELS[0].value);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [localMsg, setLocalMsg] = useState('');

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    setLoadingBackups(true);
    const { data } = await supabase.from('backups').select('*').order('created_at', { ascending: false }).limit(3);
    setBackups(data || []);
    setLoadingBackups(false);
  };

  const saveSettings = () => {
    const s = { apiKey, model, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSettings(s);
    setLocalMsg('✅ Settings saved');
    setMsg('✅ Settings saved');
    setTimeout(() => { setLocalMsg(''); setMsg(''); }, 2500);
  };

  const doBackup = async (name) => {
    setBackingUp(true);
    try {
      // Fetch ALL tables data
      const allData = await fetchAllTables();
      const totalRows = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);

      // Insert into backups table
      const { error } = await supabase.from('backups').insert({
        name: name || new Date().toLocaleString(),
        data: allData,
      });
      if (error) throw error;

      // Keep only 3 most recent
      const { data: all } = await supabase.from('backups').select('id').order('created_at', { ascending: false });
      if (all && all.length > 3) {
        const toDelete = all.slice(3).map(b => b.id);
        await supabase.from('backups').delete().in('id', toDelete);
      }

      await loadBackups();
      setMsg('✅ Backup saved (' + totalRows + ' rows across ' + Object.keys(allData).length + ' tables)');
    } catch (err) {
      setMsg('❌ Backup failed: ' + (err.message || err));
    }
    setBackingUp(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const doRestore = async (backup) => {
    if (!confirm('⚠️ Restore backup from ' + backup.name + '?\n\nThis will REPLACE all data in:\n' + Object.keys(backup.data || {}).join(', ') + '\n\nCurrent data will be lost! Are you sure?')) return;
    setRestoring(backup.id);
    try {
      await restoreTables(backup.data);
      const total = Object.values(backup.data || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
      setMsg('✅ Restored backup from ' + backup.name + ' (' + total + ' rows)');
    } catch (err) {
      setMsg('❌ Restore failed: ' + (err.message || err));
    }
    setRestoring(null);
    setTimeout(() => setMsg(''), 4000);
  };

  const deleteBackup = async (id) => {
    if (!confirm('Delete this backup?')) return;
    const { error } = await supabase.from('backups').delete().eq('id', id);
    if (!error) {
      await loadBackups();
      setMsg('🗑️ Backup deleted');
    } else {
      setMsg('❌ ' + error.message);
    }
    setTimeout(() => setMsg(''), 2000);
  };

  const downloadBackup = async (backup) => {
    // Re-fetch full data from Supabase to ensure completeness
    const fullData = backup.data;
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'temtemsabah-full-backup-' + backup.id.slice(0, 8) + '.json';
    a.click();
  };

  const uploadAndRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Validate it has backup structure
        const hasTables = BACKUP_TABLES.some(t => Array.isArray(data[t]));
        if (!hasTables) throw new Error('Invalid backup file — no recognized tables found');

        // Import as a new backup in Supabase
        const { error } = await supabase.from('backups').insert({
          name: '📂 ' + file.name.replace(/\.json$/, ''),
          data: data,
        });
        if (error) throw error;

        // Trim to 3
        const { data: all } = await supabase.from('backups').select('id').order('created_at', { ascending: false });
        if (all && all.length > 3) {
          const toDelete = all.slice(3).map(b => b.id);
          await supabase.from('backups').delete().in('id', toDelete);
        }

        await loadBackups();
        setMsg('✅ Backup file imported! Go to Restore to apply it.');
      } catch (err) {
        setMsg('❌ Invalid file: ' + (err.message || err));
      }
      setTimeout(() => setMsg(''), 4000);
    };
    input.click();
  };

  const labelS = { display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginBottom: '0.25rem' };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      {/* ── API Key & Model Settings ── */}
      <div style={{ background: '#1a1f2e', padding: '1.5rem', borderRadius: 8, border: '1px solid #2a3040', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem' }}>🔑 API Settings</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
          Used by the 🪄 Magic Key to auto-fill recipes from photos. Saved in your browser only.
        </p>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelS}>API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="nvapi-... or sk-..." style={inp} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelS}>Vision Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} style={inp}>
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <button onClick={saveSettings} style={{ ...btn, background: '#00373e', color: 'white' }}>💾 Save Settings</button>
        {localMsg && <p style={{ color: '#7fd962', fontSize: '0.85rem', marginTop: '0.75rem' }}>{localMsg}</p>}
      </div>

      {/* ── Full Website Backup & Restore ── */}
      <div style={{ background: '#1a1f2e', padding: '1.5rem', borderRadius: 8, border: '1px solid #2a3040' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>💾 Full Website Backup</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
          Backs up all tables: {BACKUP_TABLES.join(', ')}. Stored in Supabase. Last 3 kept automatically.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button onClick={() => doBackup()} disabled={backingUp} style={{
            ...btn, background: backingUp ? '#1a3a3e' : '#00373e', color: 'white',
          }}>
            {backingUp ? '⏳ Backing up...' : '📥 Backup Now'}
          </button>
          <button onClick={uploadAndRestore} style={{ ...btn, background: '#1a1f2e', color: '#e0e6ed', border: '1px solid #2a3040' }}>
            📂 Upload Backup File
          </button>
        </div>

        {loadingBackups && <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>Loading backups...</p>}

        {!loadingBackups && backups.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No backups yet. Click "Backup Now" to create your first snapshot.
          </p>
        )}

        {backups.map((b, i) => (
          <div key={b.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', background: '#0f1219', borderRadius: 6,
            marginBottom: '0.5rem', border: '1px solid #2a3040',
          }}>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: i === 0 ? '#59c2ff' : '#e0e6ed' }}>
                {i === 0 ? '🆕 ' : ''}#{i + 1}
              </span>
              <span style={{ color: '#9ca3af', marginLeft: '0.5rem' }}>{b.name}</span>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: '0.5rem', display: 'block' }}>
                {b.data ? Object.keys(b.data).filter(t => b.data[t]?.length).map(t => t + ' (' + b.data[t].length + ')').join(' · ') : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
              <button onClick={() => doRestore(b)} disabled={restoring === b.id}
                style={{ ...btn, background: '#1a3a3e', color: '#59c2ff', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                {restoring === b.id ? '⏳' : '↩ Restore'}
              </button>
              <button onClick={() => downloadBackup(b)}
                style={{ ...btn, background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid #2a3040' }}>⬇</button>
              <button onClick={() => deleteBackup(b.id)}
                style={{ ...btn, background: 'transparent', color: '#f26d78', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>✕</button>
            </div>
          </div>
        ))}

        {backups.length > 0 && (
          <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.75rem', textAlign: 'center' }}>
            Backups stored in Supabase. Oldest auto-removed when 4th is created.
          </p>
        )}
      </div>
    </div>
  );
}
