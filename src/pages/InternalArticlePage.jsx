import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { NEWSROOM_DATA } from '../data/newsroom';

export default function InternalArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:3456/api/newsroom/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.article) setArticle(d.article);
        else {
          const found = NEWSROOM_DATA.find(a => a.slug === slug);
          if (found) setArticle(found);
        }
        setLoading(false);
      })
      .catch(() => {
        const found = NEWSROOM_DATA.find(a => a.slug === slug);
        if (found) setArticle(found);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!article) return (
    <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h2>Article not found</h2>
      <Link to="/newsroom" style={{ color: '#00373e' }}>← Back to Newsroom</Link>
    </div>
  );

  return (
    <main itemScope itemType="https://schema.org/Article">
      <article style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1rem' }}>
        <Link to="/newsroom" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00373e', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to Newsroom
        </Link>

        {article.featured_image && (
          <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: '2rem', background: '#f5f5f5' }}>
            <img src={article.featured_image} alt={article.title} itemProp="image"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            background: '#00373e', color: 'white', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase',
          }}>
            {article.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#9ca3af' }}>
            <Calendar size={12} /> {article.publish_date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#9ca3af' }}>
            <User size={12} /> {article.author}
          </span>
        </div>

        <h1 itemProp="headline" style={{
          fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)',
          fontWeight: 600, color: '#000', margin: 0, marginBottom: '1rem', lineHeight: 1.2,
        }}>
          {article.title}
        </h1>

        <p itemProp="description" style={{
          fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
          color: '#555', lineHeight: 1.6, marginBottom: '2rem',
        }}>
          {article.excerpt}
        </p>

        {article.full_content && (
          <div itemProp="articleBody" style={{
            fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
            color: '#333', lineHeight: 1.8,
          }}>
            {article.full_content.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
            ))}
          </div>
        )}

        {/* SEO Schema */}
        <meta itemProp="datePublished" content={article.publish_date} />
        <meta itemProp="author" content={article.author} />
      </article>
    </main>
  );
}
