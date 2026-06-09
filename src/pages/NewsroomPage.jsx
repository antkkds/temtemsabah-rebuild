import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { NEWSROOM_DATA } from '../data/newsroom';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'External News', 'Facebook Updates', 'Internal Stories', 'Announcements'];
const CATEGORY_COLORS = {
  'External News': '#00373e',
  'Facebook Updates': '#1877F2',
  'Internal Stories': '#03081e',
  'Announcements': '#ffd976',
};

function NewsCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (article.content_type === 'external' && article.external_url) {
      window.open(article.external_url, '_blank', 'noopener');
    } else if (article.content_type === 'facebook' && article.facebook_url) {
      window.open(article.facebook_url, '_blank', 'noopener');
    } else if (article.content_type === 'internal' && article.slug) {
      navigate(`/newsroom/${article.slug}`);
    } else if (article.content_type === 'announcement') {
      navigate(`/newsroom/${article.slug}`);
    }
  };

  return (
    <article
      onClick={handleClick}
      itemScope
      itemType="https://schema.org/Article"
      style={{
        cursor: 'pointer',
        borderRadius: 0,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
        <img
          src={article.featured_image}
          alt={article.title}
          loading="lazy"
          itemProp="image"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span style={{
          position: 'absolute', top: 8, left: 8,
          background: CATEGORY_COLORS[article.category] || '#00373e',
          color: article.category === 'Announcements' ? '#000' : '#fff',
          padding: '2px 8px', fontSize: '0.7rem', fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>
          {article.category}
        </span>
        {article.status === 'draft' && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: '#f59e0b', color: '#000',
            padding: '2px 8px', fontSize: '0.65rem', fontWeight: 500,
            textTransform: 'uppercase',
          }}>DRAFT</span>
        )}
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.5rem' }}>
          <Calendar size={12} style={{ color: '#9ca3af' }} />
          <time style={{ fontSize: '0.75rem', color: '#9ca3af' }} dateTime={article.publish_date} itemProp="datePublished">
            {article.publish_date}
          </time>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>· {article.author}</span>
        </div>
        <h3 itemProp="headline" style={{
          fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.227), 16px)',
          fontWeight: 600, color: '#000', margin: 0, marginBottom: '0.5rem', lineHeight: 1.4,
        }}>
          {article.title}
        </h3>
        <p itemProp="description" style={{
          fontSize: '0.8rem', color: '#555', lineHeight: 1.5, margin: 0,
          marginBottom: '1rem', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00373e', fontSize: '0.8rem', fontWeight: 500 }}>
          Read More {(article.content_type === 'external' || article.content_type === 'facebook') ? <ExternalLink size={12} /> : <ChevronRight size={12} />}
        </div>
        <meta itemProp="author" content={article.author} />
      </div>
    </article>
  );
}

export default function NewsroomPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try loading from API first, fallback to local data
    fetch('http://127.0.0.1:3456/api/newsroom?status=published')
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.articles?.length) {
          setArticles(d.articles);
        } else {
          setArticles(NEWSROOM_DATA.filter(a => a.status === 'published'));
        }
        setLoading(false);
      })
      .catch(() => {
        setArticles(NEWSROOM_DATA.filter(a => a.status === 'published'));
        setLoading(false);
      });
  }, []);

  const filtered = activeFilter === 'All'
    ? articles
    : articles.filter(a => a.category === activeFilter);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Loading...</div>;

  return (
    <main>
      {/* Hero Section */}
      <section className="wp-block-cover alignfull is-light" style={{
        position: 'relative', marginTop: 0, marginBottom: 0,
        minHeight: 640, aspectRatio: 'unset', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img decoding="async" className="wp-block-cover__image-background" alt=""
          src="https://temtemsabah.com/wp-content/uploads/2024/04/pexels-photo-699459.jpeg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '59% 77%' }}
        />
        <span aria-hidden="true" className="wp-block-cover__background has-white-background-color has-background-dim-60 has-background-dim"
          style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)' }}
        />
        <div className="wp-block-cover__inner-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)', fontWeight: 600, color: '#03081e', margin: 0 }}>
            Newsroom
          </h1>
          <p style={{ fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)', color: '#555', maxWidth: 500, margin: '0.75rem auto 0' }}>
            Company Milestones & Partnerships
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1rem', display: 'flex', gap: 0, overflow: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)} style={{
              padding: '0.75rem 1.25rem', border: 'none',
              borderBottom: activeFilter === cat ? '2px solid #00373e' : '2px solid transparent',
              background: 'transparent', color: activeFilter === cat ? '#00373e' : '#666',
              fontSize: '0.85rem', fontWeight: activeFilter === cat ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* News Grid */}
      <section style={{ padding: '3rem 1rem', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '3rem 0' }}>No articles found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
