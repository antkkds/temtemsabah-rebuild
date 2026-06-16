import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const inp = { padding: '0.5rem', borderRadius: 6, border: '1px solid #2a3040', background: '#1a1f2e', color: '#e0e6ed', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btn = { padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
const labelS = { display: 'block', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginBottom: '0.25rem' };

const countryOptions = [
  { code: 'MY', name: 'Malaysia' }, { code: 'SG', name: 'Singapore' },
  { code: 'BN', name: 'Brunei' }, { code: 'TW', name: 'Taiwan' },
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' }, { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' }, { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' }, { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' }, { code: 'VN', name: 'Vietnam' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'HK', name: 'Hong Kong' }, { code: 'MO', name: 'Macau' },
  { code: 'KH', name: 'Cambodia' }, { code: 'LA', name: 'Laos' },
  { code: 'MM', name: 'Myanmar' }, { code: 'NP', name: 'Nepal' },
  { code: 'IN', name: 'India' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'BD', name: 'Bangladesh' }, { code: 'PK', name: 'Pakistan' },
  { code: 'AE', name: 'UAE' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' }, { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' }, { code: 'OM', name: 'Oman' },
  { code: 'TR', name: 'Turkey' }, { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' }, { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' }, { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' }, { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' }, { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' }, { code: 'PE', name: 'Peru' },
  { code: 'NL', name: 'Netherlands' }, { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' }, { code: 'AT', name: 'Austria' },
  { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' }, { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' }, { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' }, { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' }, { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' }, { code: 'GR', name: 'Greece' },
  { code: 'IE', name: 'Ireland' }, { code: 'NZ', name: 'New Zealand' },
];

const malaysiaStates = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
];

export default function AdminGlobalReach({ setMsg }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('global_reach').select('*').order('country_name', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  const doSave = async () => {
    if (!editing.country) { setMsg('❌ Select a country'); setTimeout(() => setMsg(''), 2000); return; }
    const countryObj = countryOptions.find(c => c.code === editing.country);
    const payload = {
      country: editing.country,
      country_name: countryObj?.name || editing.country,
      states: editing.states || [],
      lat: countryCoords[editing.country]?.lat || 0,
      lng: countryCoords[editing.country]?.lng || 0,
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

  const countryCoords = {
    'MY': { lat: 4.2105, lng: 101.9758 }, 'SG': { lat: 1.3521, lng: 103.8198 },
    'BN': { lat: 4.5353, lng: 114.7277 }, 'TW': { lat: 23.6978, lng: 120.9605 },
    'US': { lat: 37.0902, lng: -95.7129 }, 'GB': { lat: 55.3781, lng: -3.4360 },
    'AU': { lat: -25.2744, lng: 133.7751 }, 'JP': { lat: 36.2048, lng: 138.2529 },
    'CN': { lat: 35.8617, lng: 104.1954 }, 'KR': { lat: 35.9078, lng: 127.7669 },
    'TH': { lat: 15.8700, lng: 100.9925 }, 'ID': { lat: -0.7893, lng: 113.9213 },
    'PH': { lat: 12.8797, lng: 121.7740 }, 'VN': { lat: 14.0583, lng: 108.2772 },
    'DE': { lat: 51.1657, lng: 10.4515 }, 'FR': { lat: 46.6034, lng: 1.8883 },
    'HK': { lat: 22.3193, lng: 114.1694 }, 'MO': { lat: 22.1987, lng: 113.5439 },
    'KH': { lat: 12.5657, lng: 104.9910 }, 'IN': { lat: 20.5937, lng: 78.9629 },
    'AE': { lat: 23.4241, lng: 53.8478 }, 'SA': { lat: 23.8859, lng: 45.0792 },
    'TR': { lat: 38.9637, lng: 35.2433 }, 'ZA': { lat: -30.5595, lng: 22.9375 },
    'CA': { lat: 56.1304, lng: -106.3468 }, 'BR': { lat: -14.2350, lng: -51.9253 },
    'NL': { lat: 52.1326, lng: 5.2913 }, 'IT': { lat: 41.8719, lng: 12.5674 },
    'ES': { lat: 40.4637, lng: -3.7492 }, 'SE': { lat: 60.1282, lng: 18.6435 },
    'NZ': { lat: -40.9006, lng: 174.8860 },
  };

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
            <label style={labelS}>Country</label>
            <select value={editing.country || ''} onChange={e => setEditing({ ...editing, country: e.target.value })}
              style={{ ...inp, height: 200 }} size={8}>
              {countryOptions.map(co => (
                <option key={co.code} value={co.code} style={{ padding: '0.25rem' }}>{co.name} ({co.code})</option>
              ))}
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
              {item.country ? String.fromCodePoint(item.country.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt()).join('')) : '🏳'} {item.country_name || item.country}
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
