import { PRODUCT_IMAGES } from '../data/content';

export default function Ingredients() {
  return (
    <section className="section-ingredients" style={{ background: '#fff' }}>
      <div className="container-narrow" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="text-section-title" style={{ color: '#000' }}>
          Our Products
        </h2>
        <div className="spacer-30" />
        <p className="text-body" style={{ color: '#000', maxWidth: 600, margin: '0 auto' }}>
          Crafted with care using the finest ingredients. Our tempeh chips are made from
          premium soybeans, blended with traditional spices and modern innovation.
          100% plant-based, gluten-free, and packed with protein.
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
                alt={`Tem Tem Sabah product ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container-narrow" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          <span className="value-tag">100% Plant-Based</span>
          <span className="value-tag">Gluten Free</span>
          <span className="value-tag">No Preservatives</span>
          <span className="value-tag">High Protein</span>
          <span className="value-tag">Made in Sabah</span>
        </div>
      </div>
    </section>
  );
}
