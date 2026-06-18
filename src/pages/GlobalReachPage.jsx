import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import WorldMap from '../components/WorldMap';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

const containerStyle = {
  minHeight: '100vh',
  background: '#ffffff',
  color: '#1a1a2e',
};

const sectionStyle = {
  padding: '4rem 1.5rem',
  maxWidth: 1200,
  margin: '0 auto',
};

export default function GlobalReachPage() {
  const { t } = useLanguage();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('global_reach').select('*').order('country_name', { ascending: true })
      .then(({ data }) => setCountries(data || []))
      .finally(() => setLoading(false));
  }, []);

  const flagEmoji = (code) => {
    if (!code) return '🏳';
    try {
      return String.fromCodePoint(...code.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt()));
    } catch { return '🏳'; }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 800,
              color: '#00373e',
              marginBottom: '0.5rem',
            }}>
              {t(T.globalReach.heading)}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
              {t(T.globalReach.subtitle)}
            </p>
          </div>
        </div>
      </div>

      {/* Self-contained SVG World Map */}
      <div style={{ ...sectionStyle, paddingTop: '1rem' }}>
        <div style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          background: '#f9fafb',
        }}>
          <WorldMap />
        </div>
      </div>

      {/* Country List */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1.3rem', color: '#00373e', marginBottom: '1.5rem', textAlign: 'center' }}>
          {t(T.globalReach.countries_reached)}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {countries.map(c => (
            <div key={c.id} style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '1rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
                {flagEmoji(c.country)}
              </div>
              <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{t(T.countryNames[c.country_name] || { en: c.country_name || c.country })}</div>
              {c.states && c.states.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                  {c.states.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
        {!loading && countries.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
            {t(T.globalReach.no_data)}
          </p>
        )}
      </div>

      {/* Footer note */}
      <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          {t(T.globalReach.footer_note)}
        </p>
      </div>
    </div>
  );
}
