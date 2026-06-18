import { PRODUCT_IMAGES } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

export default function Ingredients() {
  const { t } = useLanguage();
  return (
    <section className="section-ingredients" style={{ background: '#fff' }}>
      <div className="container-narrow" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="text-section-title" style={{ color: '#000' }}>
          {t(T.ingredients.heading)}
        </h2>
        <div className="spacer-30" />
        <p className="text-body" style={{ color: '#000', maxWidth: 600, margin: '0 auto' }}>
          {t(T.ingredients.desc)}
        </p>
      </div>

      <div className="container-wide">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {PRODUCT_IMAGES.map((src, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                overflow: 'hidden',
                background: '#f5f5f5',
              }}
            >
              <img
                src={src}
                alt={t({en:'Tem Tem Sabah product','ms':'Produk Tem Tem Sabah','zh-CN':'Tem Tem Sabah 产品','zh-TW':'Tem Tem Sabah 產品'}) + ' ' + (i + 1)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container-narrow" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          <span className="value-tag">{t(T.ingredients.plant_based)}</span>
          <span className="value-tag">{t(T.ingredients.gluten_free)}</span>
          <span className="value-tag">{t(T.ingredients.no_preservatives)}</span>
          <span className="value-tag">{t(T.ingredients.high_protein)}</span>
          <span className="value-tag">{t(T.ingredients.made_in_sabah)}</span>
        </div>
      </div>
    </section>
  );
}
