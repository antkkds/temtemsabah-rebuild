import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { NEWSROOM_DATA } from '../data/newsroom';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function InternalArticlePage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/newsroom/${slug}`)
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t(T.internalArticle.loading)}</div>;
  if (!article) return (
    <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h2>{t(T.internalArticle.not_found)}</h2>
      <Link to="/newsroom" style={{ color: '#00373e' }}>{t(T.internalArticle.back)}</Link>
    </div>
  );

  return (
    <main itemScope itemType="https://schema.org/Article">
      <article style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1rem' }}>
        <Link to="/newsroom" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00373e', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> {t(T.internalArticle.back)}
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
            <Calendar size={14} />
            <time dateTime={article.publish_date}>{article.publish_date}</time>
            {article.author && <><User size={14} />{article.author}</>}
          </span>
        </div>

        <h1 itemProp="headline" style={{
          fontSize: 'clamp(22px, 1.375rem + ((1vw - 3.2px) * 1.926), 40px)',
          fontWeight: 700, color: '#03081e', lineHeight: 1.3, marginBottom: '1.5rem',
        }}>
          {article.title}
        </h1>

        {article.excerpt && (
          <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
            {article.excerpt}
          </p>
        )}

        <div itemProp="articleBody" style={{ fontSize: '1rem', color: '#333', lineHeight: 1.9 }}
          dangerouslySetInnerHTML={{ __html: article.full_content || '' }}
        />
      </article>
    </main>
  );
}
