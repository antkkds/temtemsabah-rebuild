import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = { padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
const labelS = { display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginBottom: '0.25rem' };

const malaysiaStates = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
];

export default function AdminGlobalReach({ setMsg }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [countriesList, setCountriesList] = useState([]);

  useEffect(() => {
    load();
    // Load all country names from database
    supabase.from('countries').select('code2, name, region').order('name', { ascending: true })
      .then(({ data }) => setCountriesList(data || []));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('global_reach').select('*').order('country_name', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  const doSave = async () => {
    if (!editing.country) { setMsg('❌ Select a country'); setTimeout(() => setMsg(''), 2000); return; }
    const countryObj = countriesList.find(c => c.code2 === editing.country);
    const payload = {
      country: editing.country,
      country_name: countryObj?.name || editing.country,
      states: editing.states || [],
      lat: 0,
      lng: 0,
    };

    if (editing.id) {
      const { error } = await supabase.from('global_reach').update(payload).eq('id', editing.id);
      if (error) { setMsg('❌ ' + error.message); setTimeout(() => setMsg(''), 3000); return; }
    } else {
      const { error } = await supabase.from('global_reach').insert(payload);
      if (error) { setMsg('❌ ' + error.message); setTimeout(() => setMsg(''), 3000); return; }
    }
    setMsg('✅ Saved!');
    setTimeout(() => setMsg(''), 2000);
    setEditing(null);
    load();
  };

  const doDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await supabase.from('global_reach').delete().eq('id', id);
    load();
  };

  const toggleState = (state) => {
    const current = editing.states || [];
    if (current.includes(state)) {
      setEditing({ ...editing, states: current.filter(s => s !== state) });
    } else {
      setEditing({ ...editing, states: [...current, state] });
    }
  };

  const flagEmoji = (code) => {
    if (!code) return '🏳';
    try {
      return String.fromCodePoint(...code.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt()));
    } catch { return '🏳'; }
  };

  // Group countries by region for better browsing
  const addedCodes = new Set(items.map(i => i.country));
  const grouped = {};
  countriesList.forEach(c => {
    const region = c.region || 'Other';
    if (!grouped[region]) grouped[region] = [];
    grouped[region].push(c);
  });
  const regionOrder = ['Southeast Asia', 'East Asia', 'South Asia', 'West Asia', 'Oceania', 'Europe', 'North America', 'South America', 'Africa', 'Other'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>🌍 Global Reach</h2>
        <button onClick={() => setEditing({ country: '', states: [] })} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 4, background: '#00373e', color: 'white' }}>
          <Plus size={14} /> Add Country
        </button>
      </div>

      {editing !== null ? (
        <div style={{ background: '#1a1f2e', padding: '1.5rem', borderRadius: 8, border: '1px solid #2a3040', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editing.id ? '✏️ Edit' : '➕ Add'} Country</h3>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelS}>Country — {countriesList.length} countries in database {addedCodes.size > 0 && <span style={{color:'#7fd962',fontSize:'0.7rem'}}>({addedCodes.size} added, filtered from list)</span>}</label>
            <select value={editing.country || ''} onChange={e => setEditing({ ...editing, country: e.target.value })}
              style={{ ...inp, height: 200, color: '#e0e6ed' }} size={8}>
              {regionOrder.map(region => {
                const regionCountries = grouped[region];
                if (!regionCountries || regionCountries.length === 0) return null;
                const filtered = editing.id ? regionCountries : regionCountries.filter(c => !addedCodes.has(c.code2));
                if (filtered.length === 0) return null;
                return (
                  <optgroup key={region} label={`── ${region} (${filtered.length}) ──`} style={{ color: '#00cec9', fontWeight: 600 }}>
                    {filtered.map(c => (
                      <option key={c.code2} value={c.code2} style={{ padding: '0.25rem', color: '#e0e6ed', background: '#1a1f2e' }}>
                        {c.name} ({c.code2})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {editing.country === 'MY' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelS}>States (Malaysia only)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {malaysiaStates.map(st => (
                  <label key={st} style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: '0.8rem', color: '#9ca3af', cursor: 'pointer',
                    padding: '0.2rem 0.4rem', borderRadius: 4,
                    background: (editing.states || []).includes(st) ? '#00373e' : 'transparent',
                    border: '1px solid ' + ((editing.states || []).includes(st) ? '#00cec9' : '#2a3040'),
                  }}>
                    <input type="checkbox" checked={(editing.states || []).includes(st)}
                      onChange={() => toggleState(st)} style={{ display: 'none' }} />
                    {st}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={doSave} style={{ ...btn, background: '#00373e', color: 'white' }}>💾 Save</button>
            <button onClick={() => setEditing(null)} style={{ ...btn, background: 'transparent', color: '#9ca3af', border: '1px solid #2a3040' }}>Cancel</button>
          </div>
        </div>
      ) : null}

      {loading && <p style={{ color: '#6b7280', textAlign: 'center' }}>Loading...</p>}

      {!loading && items.length === 0 && (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No countries added yet. Click "Add Country" to start.</p>
      )}

      {items.map(item => (
        <div key={item.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem', background: '#1a1f2e', borderRadius: 6,
          marginBottom: '0.5rem', border: '1px solid #2a3040',
        }}>
          <div>
            <div style={{ fontWeight: 500 }}>
              {flagEmoji(item.country)} {item.country_name || item.country}
            </div>
            {item.states && item.states.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.states.join(', ')}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setEditing({ ...item })} style={{ background: 'none', border: 'none', color: '#59c2ff', cursor: 'pointer' }}><Pencil size={14} /></button>
            <button onClick={() => doDelete(item.id)} style={{ background: 'none', border: 'none', color: '#f26d78', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
