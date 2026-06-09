import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import NewsroomPage from './pages/NewsroomPage';
import MoreRecipes from './pages/MoreRecipes';
import AdminPage from './pages/AdminPage';
import InternalArticlePage from './pages/InternalArticlePage';

export default function App() {
  return (
    <BrowserRouter basename="/temtemsabah">
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/newsroom" element={<NewsroomPage />} />
            <Route path="/newsroom/:slug" element={<InternalArticlePage />} />
            <Route path="/more-recipes" element={<MoreRecipes />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <Footer />
        
        {/* Hidden admin icon — bottom right corner */}
        <Link
          to="/admin"
          style={{
            position: 'fixed',
            bottom: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.25)',
            fontSize: 14,
            textDecoration: 'none',
            zIndex: 999,
            opacity: 0.3,
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '1'}
          onMouseOut={e => e.currentTarget.style.opacity = '0.3'}
          title="Admin"
        >
          ⚙
        </Link>
      </div>
    </BrowserRouter>
  );
}
