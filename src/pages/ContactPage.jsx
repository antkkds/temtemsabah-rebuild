import Contact from '../components/Contact';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <main>
      {/* Hero Image Cover */}
      <div style={{
        position: 'relative',
        height: '50vh',
        minHeight: 320,
        backgroundImage: `url(https://temtemsabah.com/wp-content/uploads/2024/04/Get-in-Touch-Instagram-Post-3.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.35)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Prata, serif', fontSize: 'clamp(28px, 3.5vw, 48px)',
            color: '#fff', fontWeight: 700,
          }}>{t(T.contactPage.heading)}</h1>
        </div>
      </div>
      <Contact />
    </main>
  );
}
