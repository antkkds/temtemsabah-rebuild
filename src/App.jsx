import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage'; // kept for future use
import NewsroomPage from './pages/NewsroomPage';
import MoreRecipes from './pages/MoreRecipes';
import GlobalReachPage from './pages/GlobalReachPage';
import AdminPage from './pages/AdminPage';
import InternalArticlePage from './pages/InternalArticlePage';
import InfoPage from './pages/InfoPage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

export default function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </HashRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const isInfoPage = location.pathname.includes('/info') || location.hash.includes('/info');
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, languages } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {!isInfoPage && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/global-reach" element={<GlobalReachPage />} />
          <Route path="/newsroom" element={<NewsroomPage />} />
          <Route path="/newsroom/:slug" element={<InternalArticlePage />} />
          <Route path="/more-recipes" element={<MoreRecipes />} />
          {/* <Route path="/contact" element={<ContactPage />} /> — hidden, keep for future */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/info" element={<InfoPage />} />
        </Routes>
      </div>
      {!isInfoPage && <Footer />}

      {/* Floating corner: Language + Admin */}
      <div style={{ position: 'fixed', bottom: 12, right: 12, display: 'flex', gap: 8, alignItems: 'flex-end', zIndex: 999 }}>

        {/* Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setLangOpen(!langOpen)} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: langOpen ? '#00373e' : 'rgba(0,0,0,0.15)',
            color: langOpen ? '#fff' : 'rgba(0,0,0,0.4)',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.6,
          }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.6'}
            title={lang}
          >
            {lang.toUpperCase()}
          </button>
          {langOpen && (
            <div style={{
              position: 'absolute', bottom: 40, right: 0,
              background: '#fff', border: '1px solid #eee', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '0.5rem', minWidth: 140, zIndex: 999,
            }}>
              {languages.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.5rem 0.75rem', border: 'none', borderRadius: 4,
                  background: lang === l.code ? '#f0fdf4' : 'transparent',
                  color: lang === l.code ? '#00373e' : '#333',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: lang === l.code ? 600 : 400,
                }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin icon */}
        <Link
          to="/admin"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(0,0,0,0.25)', fontSize: 14, textDecoration: 'none',
            opacity: 0.3, flexShrink: 0,
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '1'}
          onMouseOut={e => e.currentTarget.style.opacity = '0.3'}
          title="Admin"
        >
          ⚙
        </Link>

      </div>
    </div>
  );
}
