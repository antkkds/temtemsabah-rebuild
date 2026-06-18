import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, languages } = useLanguage();
  const t = (obj) => obj?.[lang] || obj?.en || '';

  const currentPath = location.hash ? location.hash.replace('#', '') : location.pathname;
  const isActive = (href) => currentPath === href || (href !== '/' && currentPath.startsWith(href));

  const navLinks = [
    { href: '/', label: T.nav.home },
    { href: '/newsroom', label: T.nav.newsroom },
    { href: '/more-recipes', label: T.nav.recipes },
    { href: '/global-reach', label: T.nav.globalReach },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '1px solid #eee',
      fontFamily: "'Work Sans', sans-serif",
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1200, margin: '0 auto', padding: '0 1rem', height: 140,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://temtemsabah.com/wp-content/uploads/2024/04/Mum-Approved-Snacks-e1712135606895.png"
            alt={T.site_name.en} style={{ height: 120, width: 'auto' }} />
          <span style={{ fontFamily: 'Prata, serif', fontSize: '1rem', color: '#00373e', fontWeight: 600 }}>
            {T.site_name[lang] || T.site_name.en}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)} style={{
              padding: '0.5rem 0.75rem', borderRadius: 6,
              color: isActive(link.href) ? '#00373e' : '#555',
              fontWeight: isActive(link.href) ? 600 : 400,
              fontSize: '0.85rem', textDecoration: 'none',
              transition: 'all 0.15s',
            }}>
              {t(link.label)}
            </Link>
          ))}

          {/* Language Switcher — moved to floating button */}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 8, marginLeft: 'auto',
            color: '#00373e',
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 98,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
            background: '#fff', zIndex: 99, boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            padding: '1.5rem',
            animation: 'slideInRight 0.25s ease-out',
            display: 'flex', flexDirection: 'column',
          }}>
            <button onClick={() => setMenuOpen(false)} style={{
              alignSelf: 'flex-end', background: 'none', border: 'none',
              cursor: 'pointer', padding: 8, color: '#00373e', marginBottom: '1rem',
            }}>
              <X size={24} />
            </button>
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '0.75rem 1rem', borderRadius: 8,
                color: isActive(link.href) ? '#00373e' : '#333',
                fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                background: isActive(link.href) ? '#f0fdf4' : 'transparent',
              }}>
                {t(link.label)}
              </Link>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>Language:</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {languages.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setMenuOpen(false); }} style={{
                    padding: '6px 12px', borderRadius: 6, border: 'none',
                    background: lang === l.code ? '#00373e' : '#f5f5f5',
                    color: lang === l.code ? '#fff' : '#555',
                    fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                  }}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
