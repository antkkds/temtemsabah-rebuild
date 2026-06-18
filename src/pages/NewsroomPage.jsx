import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { NEWSROOM_DATA } from '../data/newsroom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['All', 'External News', 'Facebook Updates', 'Internal Stories', 'Announcements'];
const CATEGORY_COLORS = {
  'External News': '#00373e',
  'Facebook Updates': '#1877F2',
  'Internal Stories': '#03081e',
  'Announcements': '#ffd976',
};

const CATEGORY_LABELS = {
  'All': 'All',
  'External News': { en: 'External News', ms: 'Berita Luar', 'zh-CN': '外部新闻', 'zh-TW': '外部新聞' },
  'Facebook Updates': { en: 'Facebook Updates', ms: 'Kemas Kini Facebook', 'zh-CN': 'Facebook 更新', 'zh-TW': 'Facebook 更新' },
  'Internal Stories': { en: 'Internal Stories', ms: 'Cerita Dalaman', 'zh-CN': '内部故事', 'zh-TW': '內部故事' },
  'Announcements': { en: 'Announcements', ms: 'Pengumuman', 'zh-CN': '公告', 'zh-TW': '公告' },
};


function FbEmbed({ url }) {
  const { t } = useLanguage();
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) { setLoading(false); setError(true); return; }
    
    // Try Facebook's oEmbed API first — supports more URL formats
    const oembedUrl = `https://www.facebook.com/plugins/post/oembed.json?url=${encodeURIComponent(url)}`;
    fetch(oembedUrl)
      .then(r => r.json())
      .then(data => {
        if (data && data.html) {
          // Extract the embed URL from the oEmbed HTML
          const match = data.html.match(/src=["']([^"']+)["']/);
          if (match) {
            setResolvedUrl(match[1]);
          } else {
            setResolvedUrl(data.url || url);
          }
        } else {
          setResolvedUrl(url);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback: direct embed
        let cleanUrl = url.replace('//web.facebook.com/', '//www.facebook.com/');
        // Only strip tracking params, NOT essential params like fbid
        cleanUrl = cleanUrl.replace(/[?&]ref=[^&]*/g, '').replace(/[?&]rdid=[^&]*/g, '').replace(/[?&]share_url=[^&]*/g, '');
        if (cleanUrl.includes('/share/')) {
          setError(true);
        }
        setResolvedUrl(cleanUrl);
        setLoading(false);
      });
  }, [url]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>{t(T.internalArticle.loading)}</div>;
  if (error || !resolvedUrl || resolvedUrl.includes('/share/')) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📘</div>
      <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>
        {t(T.newsroomExtra.fb_post)}
      </p>
      <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '1rem' }}>
        {t(T.newsroomExtra.fb_unavailable)}
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: 999,
        background: '#1877F2', color: '#fff', fontSize: '0.85rem', fontWeight: 600,
        textDecoration: 'none',
      }}>{t(T.newsroomExtra.view_fb)}</a>
    </div>
  );

  return (
    <iframe
      src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(resolvedUrl)}&show_text=true&width=340`}
      style={{ width: '100%', height: 400, border: 'none', overflow: 'hidden' }}
      scrolling="no"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      title="Facebook Post"
    />
  );
}

function NewsCard({ article, onFbClick }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (article.content_type === 'internal' && article.slug) {
      navigate(`/newsroom/${article.slug}`);
    } else if (article.content_type === 'announcement') {
      navigate(`/newsroom/${article.slug}`);
    }
    // External news: clicking card does nothing — use the button
    // Facebook: inline embed
  };

  return article.content_type === 'facebook' ? (
    <div style={{
      borderRadius: 0, overflow: 'hidden',
      background: '#fff', border: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '0.5rem 1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '0.7rem', color: '#999', marginLeft: 'auto' }}>
          {article.publish_date ? new Date(article.publish_date).toLocaleDateString() : ''}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 280, overflow: 'hidden' }}>
        <FbEmbed url={article.facebook_url} />
      </div>
    </div>
  ) : (
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
          onError={e => { e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect fill="#f5f5f5" width="400" height="225"/><text fill="#ccc" font-family="sans-serif" font-size="14" text-anchor="middle" x="200" y="115">No Image</text></svg>'); }}
        />
        <span style={{
          position: 'absolute', top: 8, left: 8,
          background: CATEGORY_COLORS[article.category] || '#00373e',
          color: article.category === 'Announcements' ? '#000' : '#fff',
          padding: '2px 8px', fontSize: '0.7rem', fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>
          {t(CATEGORY_LABELS[article.category] || { en: article.category })}
        </span>
        {article.status === 'draft' && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: '#f59e0b', color: '#000',
            padding: '2px 8px', fontSize: '0.65rem', fontWeight: 500,
            textTransform: 'uppercase',
          }}>{t(T.newsroomExtra.draft_label)}</span>
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
        <p style={{
          fontSize: '0.85rem', color: '#444', lineHeight: 1.7,
          margin: 0, marginBottom: '1rem', flex: 1,
          overflow: 'hidden',
        }}>
          {article.full_content || article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {article.content_type === 'external' && article.external_url ? (
            <a href={article.external_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '0.4rem 1rem', borderRadius: 6,
                background: '#00373e', color: '#fff',
                fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none',
              }}
            >
              {t(T.newsroomExtra.read_full)} <ExternalLink size={12} />
            </a>
          ) : (
            <span style={{ color: '#00373e', fontSize: '0.8rem', fontWeight: 500 }}>
              {t({en:'Read More',ms:'Baca Lagi','zh-CN':'阅读更多','zh-TW':'閱讀更多'})} <ChevronRight size={12} />
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: '#999', marginLeft: 'auto' }}>
            <Calendar size={11} style={{ marginRight: 2, verticalAlign: 'middle' }} />
            {new Date(article.publish_date).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <meta itemProp="author" content={article.author} />
      </div>
    </article>
  );
}

export default function NewsroomPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fbModal, setFbModal] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Fetch from Supabase, fallback to static data
    supabase.from('newsroom').select('*').eq('status', 'published').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setArticles(data);
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
    ? [...articles]
    : [...articles].filter(a => a.category === activeFilter);

  // Sort by publish date
  filtered.sort((a, b) => {
    const da = new Date(a.publish_date || 0);
    const db = new Date(b.publish_date || 0);
    return sortOrder === 'desc' ? db - da : da - db;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>{t(T.internalArticle.loading)}</div>;

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
            {t(T.newsroom.heading)}
          </h1>
          <p style={{ fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)', color: '#555', maxWidth: 500, margin: '0.75rem auto 0' }}>
            {t(T.newsroom.subtitle)}
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
              {cat === 'All' ? t(T.newsroomExtra.all) : t(CATEGORY_LABELS[cat])}
            </button>
          ))}
          </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', marginTop: '0.5rem' }}>
          <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '0.3rem 0.75rem', borderRadius: 6,
            border: '1px solid #d1d5db', background: '#fff',
            color: '#555', fontSize: '0.75rem', cursor: 'pointer',
          }}>
            {sortOrder === 'desc' ? '↓ ' + t(T.newsroomExtra.sort_newest) : '↑ ' + t(T.newsroomExtra.sort_oldest)}
          </button>
        </div>
      </section>

      {/* News Grid */}
      <section style={{ padding: '3rem 1rem', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '3rem 0' }}>{t(T.newsroom.no_articles)}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(article => (
                <NewsCard key={article.id} article={article} onFbClick={setFbModal} />
              ))}
            </div>
          )}
        </div>
      </section>
          {/* Facebook Embed Modal */}
      {fbModal && (
        <div onClick={() => setFbModal(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 12, maxWidth: 550, width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button onClick={() => setFbModal(null)} style={{
                background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666'
              }}>✕</button>
            </div>
            <iframe
              src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(fbModal)}&show_text=true&width=500`}
              style={{ width: '100%', border: 'none', minHeight: 500 }}
              scrolling="yes"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
            <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem' }}>
              <a href={fbModal} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2' }}>
                {t({en:'Open on Facebook →',ms:'Buka di Facebook →','zh-CN':'在 Facebook 上打开 →','zh-TW':'在 Facebook 上打開 →'})}
              </a>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
