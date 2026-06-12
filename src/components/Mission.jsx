import { MISSION, PRODUCT_IMAGES } from '../data/content';

export default function Mission() {
  return (
    <section
      className="wp-block-group alignfull"
      style={{
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 120,
        paddingBottom: 120,
        background: '#fff',
      }}
    >
      <div
        className="wp-block-group"
        style={{
          maxWidth: 650,
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center',
        }}
      >
        <h2
          className="wp-block-heading has-text-align-center"
          style={{
            color: '#000',
            fontSize: 'clamp(29.768px, 1.861rem + ((1vw - 3.2px) * 2.526), 52px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Our Mission and Values
        </h2>

        <div style={{ height: 80 }} aria-hidden="true" />

        {/* Vision/Mission 2-column grid */}
        <div
          className="mission-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <div>
            <img
              src="https://temtemsabah.com/wp-content/uploads/2024/05/shared-vision.png"
              alt="Vision"
              style={{ width: 100, height: 'auto', margin: '0 auto' }}
            />
            <div style={{ height: 20 }} />
            <h2
              className="wp-block-heading"
              style={{
                color: '#000',
                fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 1.5,
                textTransform: 'none',
                margin: 0,
              }}
            >
              Vision Statement
            </h2>
            <div style={{ height: 12 }} />
            <p
              className="has-text-align-center"
              style={{
                color: '#000',
                fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {MISSION.vision}
            </p>
          </div>

          <div>
            <img
              src="https://temtemsabah.com/wp-content/uploads/2024/05/target.png"
              alt="Mission"
              style={{ width: 100, height: 'auto', margin: '0 auto' }}
            />
            <div style={{ height: 20 }} />
            <h2
              className="wp-block-heading"
              style={{
                color: '#000',
                fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 1.5,
                textTransform: 'none',
                margin: 0,
              }}
            >
              Mission Statement
            </h2>
            <div style={{ height: 12 }} />
            <p
              className="has-text-align-center"
              style={{
                color: '#000',
                fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {MISSION.mission}
            </p>
          </div>
        </div>

        <div style={{ height: 80 }} aria-hidden="true" />

        {/* Values */}
        <div>
          <img
            src="https://temtemsabah.com/wp-content/uploads/2024/05/value.png"
            alt="Values"
            style={{ width: 100, height: 'auto', margin: '0 auto' }}
          />
          <div style={{ height: 20 }} />
          <h2
            className="wp-block-heading"
            style={{
              color: '#000',
              fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 1.5,
              textTransform: 'none',
              margin: 0,
            }}
          >
            Values
          </h2>
          <div style={{ height: 16 }} />
          <p
            className="has-text-align-center"
            style={{
              color: '#000',
              fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Teamwork, Accountability, Gratitude, Integrity, Humility (TAGIH)
          </p>
        </div>
      </div>

      {/* Product Gallery — Jetpack tiled gallery: 2 columns, square, no gap, responsive */}
      <div style={{ height: 80 }} aria-hidden="true" />
      <div
        className="wp-block-jetpack-tiled-gallery aligncenter is-style-square"
        style={{
          margin: 0,
          padding: 0,
          maxWidth: 900,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        <div className="tiled-gallery__gallery">
          {/* Row 1: 2 images */}
          <div className="tiled-gallery__row" style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 0, lineHeight: 0 }}>
            {PRODUCT_IMAGES.slice(0, 2).map((src, i) => (
              <div key={i} className="tiled-gallery__col" style={{ flex: '0 0 50%', maxWidth: '50%', lineHeight: 0 }}>
                <figure className="tiled-gallery__item" style={{ margin: 0, padding: 0 }}>
                  <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: 1, objectFit: 'cover', borderRadius: 12 }} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
          {/* Row 2: 2 images */}
          <div className="tiled-gallery__row" style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 0, lineHeight: 0 }}>
            {PRODUCT_IMAGES.slice(2, 4).map((src, i) => (
              <div key={i} className="tiled-gallery__col" style={{ flex: '0 0 50%', maxWidth: '50%', lineHeight: 0 }}>
                <figure className="tiled-gallery__item" style={{ margin: 0, padding: 0 }}>
                  <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: 1, objectFit: 'cover', borderRadius: 12 }} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
          {/* Row 3: 2 images */}
          <div className="tiled-gallery__row" style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 0, lineHeight: 0 }}>
            {PRODUCT_IMAGES.slice(4, 6).map((src, i) => (
              <div key={i} className="tiled-gallery__col" style={{ flex: '0 0 50%', maxWidth: '50%', lineHeight: 0 }}>
                <figure className="tiled-gallery__item" style={{ margin: 0, padding: 0 }}>
                  <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: 1, objectFit: 'cover', borderRadius: 12 }} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
          {/* Row 4: 2 new images */}
          <div className="tiled-gallery__row" style={{ display: 'flex', gap: 8, marginBottom: 0, padding: 0, lineHeight: 0 }}>
            {PRODUCT_IMAGES.slice(6, 8).map((src, i) => (
              <div key={i} className="tiled-gallery__col" style={{ flex: '0 0 50%', maxWidth: '50%', lineHeight: 0 }}>
                <figure className="tiled-gallery__item" style={{ margin: 0, padding: 0 }}>
                  <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: 1, objectFit: 'cover', borderRadius: 12 }} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
