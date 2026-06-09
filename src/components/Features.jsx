import { FEATURES } from '../data/content';

export default function Features() {
  return (
    <section
      className="wp-block-cover alignfull"
      style={{
        position: 'relative',
        padding: '100px 20px',
        minHeight: 352,
        aspectRatio: 'unset',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffd976',
        }}
      />
      <div
        className="wp-block-cover__inner-container"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1rem',
        }}
      >
        <div
          className="wp-block-columns features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
        >
          {FEATURES.map((f, idx) => (
            <div
              key={idx}
              className="wp-block-column"
              style={{
                padding: 0,
                textAlign: 'center',
              }}
            >
              <h3
                className="wp-block-heading has-text-align-center"
                style={{
                  color: '#000',
                  margin: 0,
                  fontSize: 'clamp(37.821px, 2.364rem + ((1vw - 3.2px) * 3.657), 70px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {f.strong ? <strong>{f.title}</strong> : f.title}
              </h3>
              <p
                className="has-text-align-center"
                style={{
                  color: '#000',
                  marginTop: 5,
                  marginBottom: 0,
                  fontSize: 'clamp(20px, 1.25rem + ((1vw - 3.2px) * 1.364), 32px)',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {f.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
