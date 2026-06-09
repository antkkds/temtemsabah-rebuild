import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Newsroom', href: '/newsroom' },
  { label: 'More Recipes', href: '/more-recipes' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="wp-block-template-part">
      <div
        className="wp-block-group alignfull"
        style={{
          padding: 'var(--wp--preset--spacing--30)',
          background: '#fff',
        }}
      >
        <div
          className="wp-block-group alignwide"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            margin: '0 auto',
            flexWrap: 'wrap',
          }}
        >
          {/* Logo + Site Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="wp-block-site-logo is-default-size">
              <Link to="/" className="custom-logo-link" aria-current={location.pathname === '/' ? 'page' : undefined}>
                <img
                  width="305"
                  height="305"
                  src="https://temtemsabah.com/wp-content/uploads/2024/04/Mum-Approved-Snacks-e1712135606895.png"
                  className="custom-logo"
                  alt="Tem Tem Sabah"
                  decoding="async"
                  style={{
                    width: 120,
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Link>
            </div>
            <h1
              className="wp-block-site-title"
              style={{
                fontFamily: "'Prata', serif",
                fontSize: 'clamp(31.609px, 1.976rem + ((1vw - 3.2px) * 2.772), 56px)',
                fontWeight: 400,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              <Link
                to="/"
                style={{ color: '#00373e', textDecoration: 'none' }}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                Tem Tem Sabah
              </Link>
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav
            className="wp-block-navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <ul
              className="wp-block-navigation__container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.label}
                  className={`wp-block-navigation-item ${location.pathname === item.href ? 'current-menu-item' : ''}`}
                  style={{ position: 'relative' }}
                >
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="wp-block-navigation-item__content"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
                        color: location.pathname === item.href ? '#00373e' : '#333',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        transition: 'background 0.15s',
                      }}
                      aria-current={location.pathname === item.href ? 'page' : undefined}
                    >
                      <span className="wp-block-navigation-item__label">{item.label}</span>
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="wp-block-navigation-item__content"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
                        color: '#333',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        transition: 'background 0.15s',
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="wp-block-navigation-item__label">{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#00373e',
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
          />
          <div
            className="mobile-menu-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 280,
              height: '100vh',
              background: '#fff',
              zIndex: 50,
              boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
              padding: '2rem',
            }}
          >
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
                        color: location.pathname === item.href ? '#00373e' : '#333',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
                        color: '#333',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 767.5px) {
          .wp-block-navigation { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
