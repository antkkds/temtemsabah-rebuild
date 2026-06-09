import { SITE, NAV, CONTACT } from '../data/content';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#03081e', padding: '2rem 0', textAlign: 'center' }}>
      <div className="container-wide">
        {/* Simple nav links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {NAV.map((item) => (
            item.href.startsWith('/') ? (
              <Link key={item.label} to={item.href} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>
                {item.label}
              </a>
            )
          ))}
        </div>

        {/* Line 1: Inline contact — "Tem Tem Sabah" bigger, rest bold */}
        <p style={{
          color: '#9ca3af',
          fontSize: '0.8rem',
          margin: '0 0 0.5rem 0',
          fontWeight: 700,
        }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tem Tem Sabah</span>
          <span style={{ fontWeight: 700 }}> | info@temtemsabah.com | +6012-2277363 | Kolombong, Sabah.</span>
        </p>

        {/* Line 2: Copyright — bold */}
        <p style={{
          color: '#6b7280',
          fontSize: '0.75rem',
          margin: 0,
          fontWeight: 700,
        }}>
          &copy; 2024 Tem Tem Berhad Reg No 202401005732 (1551582-V). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
