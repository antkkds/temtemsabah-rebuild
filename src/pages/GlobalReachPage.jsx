import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// TemTem custom pin icon
const temtemIcon = new L.DivIcon({
  className: 'temtem-pin',
  html: `<div style="
    width: 36px; height: 36px; border-radius: 50%;
    background: #00373e; border: 3px solid #00cec9;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    cursor: pointer;
  "><span style="font-size:14px;font-weight:bold;color:#00cec9;">T</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const countryCoords = {
  'MY': { lat: 4.2105, lng: 101.9758, name: 'Malaysia' },
  'SG': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  'BN': { lat: 4.5353, lng: 114.7277, name: 'Brunei' },
  'TW': { lat: 23.6978, lng: 120.9605, name: 'Taiwan' },
  'US': { lat: 37.0902, lng: -95.7129, name: 'United States' },
  'GB': { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
  'AU': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  'JP': { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  'CN': { lat: 35.8617, lng: 104.1954, name: 'China' },
  'KR': { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
  'TH': { lat: 15.8700, lng: 100.9925, name: 'Thailand' },
  'ID': { lat: -0.7893, lng: 113.9213, name: 'Indonesia' },
  'PH': { lat: 12.8797, lng: 121.7740, name: 'Philippines' },
  'VN': { lat: 14.0583, lng: 108.2772, name: 'Vietnam' },
  'DE': { lat: 51.1657, lng: 10.4515, name: 'Germany' },
  'FR': { lat: 46.6034, lng: 1.8883, name: 'France' },
};

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0f 0%, #0f1219 50%, #0a1920 100%)',
  color: '#e0e6ed',
};

const sectionStyle = {
  padding: '4rem 1.5rem',
  maxWidth: 1200,
  margin: '0 auto',
};

export default function GlobalReachPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    supabase.from('global_reach').select('*').order('country_name', { ascending: true })
      .then(({ data }) => setCountries(data || []))
      .finally(() => setLoading(false));
    setMapReady(true);
  }, []);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(0,55,62,0.3) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(0,206,201,0.15)',
      }}>
        <div style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 800,
              color: '#00cec9',
              marginBottom: '0.5rem',
            }}>
              🌍 Global Reach
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
              From Sabah to the world — Tem Tem Sabah products are enjoyed across the globe
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ ...sectionStyle, paddingTop: '1rem' }}>
        <div style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(0,206,201,0.2)',
          background: '#0f1219',
          height: '500px',
          position: 'relative',
        }}>
          {mapReady && !loading && (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {countries.map(c => {
                const coords = countryCoords[c.country] || { lat: c.lat, lng: c.lng };
                if (!coords.lat && !coords.lng) return null;
                return (
                  <Marker key={c.id} position={[coords.lat, coords.lng]} icon={temtemIcon}>
                    <Popup>
                      <div style={{ textAlign: 'center', minWidth: 120 }}>
                        <strong style={{ fontSize: '1rem' }}>{coords.name || c.country_name || c.country}</strong>
                        {c.states && c.states.length > 0 && (
                          <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#666' }}>
                            {c.states.join(', ')}
                          </div>
                        )}
                        <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#00373e', fontWeight: 600 }}>
                          🌱 Tem Tem Sabah
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
              Loading map...
            </div>
          )}
        </div>
      </div>

      {/* Country List */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1.3rem', color: '#00cec9', marginBottom: '1.5rem', textAlign: 'center' }}>
          Countries We&apos;ve Reached
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {countries.map(c => {
            const coords = countryCoords[c.country] || {};
            const name = coords.name || c.country_name || c.country;
            return (
              <div key={c.id} style={{
                background: 'rgba(26,31,46,0.8)',
                border: '1px solid rgba(0,206,201,0.15)',
                borderRadius: 8,
                padding: '1rem',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
                  {c.country ? String.fromCodePoint(c.country.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt()).join('')) : '🏳'}
                </div>
                <div style={{ fontWeight: 600, color: '#e0e6ed' }}>{name}</div>
                {c.states && c.states.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.3rem' }}>
                    {c.states.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!loading && countries.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            🌱 No global reach data yet. Check back soon!
          </p>
        )}
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(0,206,201,0.1)' }}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          🇲🇾 Made in Sabah, Malaysia — Loved around the world 🌍
        </p>
      </div>
    </div>
  );
}
