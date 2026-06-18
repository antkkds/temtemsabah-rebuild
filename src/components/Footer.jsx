import { SITE, CONTACT } from '../data/content';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function Footer() {
  const { lang } = useLanguage();
  const t = (obj) => obj?.[lang] || obj?.en || '';

  const navLinks = [
    { href: '/', label: T.nav.home },
    { href: '/newsroom', label: T.nav.newsroom },
    { href: '/more-recipes', label: T.nav.recipes },
    { href: '/global-reach', label: T.nav.globalReach },
  ];

  return (
    <footer style={{ background: '#03081e', padding: '2rem 0', textAlign: 'center' }}>
      <div className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {navLinks.map((item) => (
            item.href.startsWith('/') ? (
              <Link key={item.href} to={item.href} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}>
                {t(item.label)}
              </Link>
            ) : (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}>
                {t(item.label)}
              </a>
            )
          ))}
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.8 }}>
          2024 Tem Tem Berhad Reg No 202401005732 (1551582-V). All rights reserved. | Tem Tem Sabah | {CONTACT.email} | {CONTACT.phone} | Kolombong, Sabah.
        </p>
      </div>
    </footer>
  );
}
