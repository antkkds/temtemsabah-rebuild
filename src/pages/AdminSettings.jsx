import { useState, useEffect } from 'react';
import { supabase, saveArticles as sbSaveArticles, saveRecipes as sbSaveRecipes } from '../lib/supabase';

const STORAGE_KEY = 'tts_settings';
const BACKUP_KEY = 'tts_backup_';

const MODELS = [
  { value: 'nvidia/llama-3.2-11b-vision', label: 'NVIDIA Llama 3.2 11B Vision (fast)' },
  { value: 'nvidia/llama-3.2-90b-vision', label: 'NVIDIA Llama 3.2 90B Vision (accurate)' },
  { value: 'openai/gpt-4o', label: 'OpenAI GPT-4o' },
  { value: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o-mini' },
  { value: 'gemini/gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = { padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

export function getBackups() {
  const backups = [];
  for (let i = 0; i < 3; i++) {
    try {
      const raw = localStorage.getItem(BACKUP_KEY + i);
      if (raw) backups.push(JSON.parse(raw));
    } catch {}
  }
  return backups;
}

export default function AdminSettings({ setMsg }) {
  const [settings, setSettings] = useState(getSettings());
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || MODELS[0].value);
  const [backups, setBackups] = useState(getBackups());
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    setBackups(getBackups());
  }, []);

  const saveSettings = () => {
    const s = { apiKey, model, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSettings(s);
    setMsg('✅ Settings saved');
    setTimeout(() => setMsg(''), 2000);
  };

  const doBackup = async () => {
    setBackingUp(true);
    try {
      const [aRes, rRes] = await Promise.all([
        supabase.from('newsroom').select('*').order('created_at'),
        supabase.from('recipes').select('*').order('created_at'),
      ]);
      const snapshot = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        articles: aRes.data || [],
        recipes: rRes.data || [],
      };
      // Rotate: shift backups, keep 3 max
      const existing = getBackups();
      while (existing.length >= 3) existing.pop();
      existing.unshift(snapshot);
      existing.forEach((b, i) => localStorage.setItem(BACKUP_KEY + i, JSON.stringify(b)));
      setBackups(existing);
      setMsg('✅ Backup saved (#' + snapshot.id.toString().slice(-4) + ')');
    } catch (err) {
      setMsg('❌ Backup failed: ' + (err.message || err));
    }
    setBackingUp(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const doRestore = async (backup) => {
    if (!confirm('Restore backup from ' + backup.time + '?\nThis will REPLACE all current newsroom and recipes!')) return;
    setRestoring(backup.id);
    try {
      const { error: ae } = await sbSaveArticles(backup.articles || []);
      if (ae) throw ae;
      const { error: re } = await sbSaveRecipes(backup.recipes || []);
      if (re) throw re;
      setMsg('✅ Restored backup from ' + backup.time);
    } catch (err) {
      setMsg('❌ Restore failed: ' + (err.message || err));
    }
    setRestoring(null);
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteBackup = (idx) => {
    if (!confirm('Delete this backup?')) return;
    localStorage.removeItem(BACKUP_KEY + idx);
    setBackups(getBackups());
    setMsg('🗑️ Backup deleted');
    setTimeout(() => setMsg(''), 2000);
  };

  const downloadBackup = (backup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `temtemsabah-backup-${backup.id}.json`;
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
        const backup = JSON.parse(text);
        if (!backup.articles || !backup.recipes) throw new Error('Invalid backup file');
        await doRestore(backup);
      } catch (err) {
        setMsg('❌ Invalid backup file: ' + (err.message || err));
        setTimeout(() => setMsg(''), 3000);
      }
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
          Used by the Magic Key feature to auto-fill recipes from photos. Saved in your browser only.
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
      </div>

      {/* ── Backup & Restore ── */}
      <div style={{ background: '#1a1f2e', padding: '1.5rem', borderRadius: 8, border: '1px solid #2a3040' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem' }}>💾 Backup & Restore</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
          Save the current newsroom + recipes. Up to 3 history records kept automatically.
        </p>

        <button onClick={doBackup} disabled={backingUp} style={{
          ...btn, background: backingUp ? '#1a3a3e' : '#00373e', color: 'white', marginBottom: '1rem',
        }}>
          {backingUp ? '⏳ Backing up...' : '📥 Backup Now'}
        </button>

        {backups.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No backups yet</p>
        )}

        {backups.map((b, i) => (
          <div key={b.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', background: '#0f1219', borderRadius: 6,
            marginBottom: '0.5rem', border: '1px solid #2a3040',
          }}>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500 }}>#{i + 1}</span>
              <span style={{ color: '#9ca3af', marginLeft: '0.5rem' }}>{b.time}</span>
              <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                ({b.articles?.length || 0} articles · {b.recipes?.length || 0} recipes)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button onClick={() => doRestore(b)} disabled={restoring === b.id}
                style={{ ...btn, background: '#1a3a3e', color: '#59c2ff', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                {restoring === b.id ? '⏳' : '↩ Restore'}
              </button>
              <button onClick={() => downloadBackup(b)}
                style={{ ...btn, background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid #2a3040' }}>⬇</button>
              <button onClick={() => deleteBackup(i)}
                style={{ ...btn, background: 'transparent', color: '#f26d78', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>✕</button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '1rem', borderTop: '1px solid #2a3040', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Or restore from a downloaded backup file (.json):
          </p>
          <button onClick={uploadAndRestore} style={{ ...btn, background: '#1a1f2e', color: '#e0e6ed', border: '1px solid #2a3040' }}>
            📂 Upload Backup File
          </button>
        </div>
      </div>
    </div>
  );
}
