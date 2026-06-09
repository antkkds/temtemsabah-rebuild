import { SITE } from '../data/content';

export default function Hero() {
  return (
    <section
      className="wp-block-cover alignfull is-light"
      style={{
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        minHeight: 880,
        aspectRatio: 'unset',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background image */}
      <img
        decoding="async"
        className="wp-block-cover__image-background"
        alt=""
        src="https://temtemsabah.com/wp-content/uploads/2024/04/bryan-heng-vk2gTv6Qd80-unsplash-scaled.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* White overlay 40% */}
      <span
        aria-hidden="true"
        className="wp-block-cover__background has-white-background-color has-background-dim-40 has-background-dim"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.4)',
        }}
      />

      {/* Inner container */}
      <div
        className="wp-block-cover__inner-container"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center',
        }}
      >
        <h1
          className="wp-block-heading has-text-align-center has-text-color"
          style={{
            color: '#000',
            fontSize: 'clamp(46.987px, 2.937rem + ((1vw - 3.2px) * 5.115), 92px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {SITE.headline}
        </h1>

        <div style={{ height: 30 }} aria-hidden="true" className="wp-block-spacer" />

        <h5
          className="wp-block-heading has-text-align-center has-text-color"
          style={{
            color: '#000',
            fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 1.5,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <strong>MALAYSIA . SINGAPORE . BRUNEI . TAIWAN</strong>
        </h5>

        <h2
          className="wp-block-heading has-text-align-center has-text-color"
          style={{
            color: '#000',
            fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          &ldquo;Mum Approved Snacks&rdquo;
        </h2>

        <div style={{ height: 50 }} aria-hidden="true" className="wp-block-spacer" />

        <div
          className="wp-block-buttons is-content-justification-center"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.5em',
          }}
        >
          <div
            className="wp-block-button"
            style={{
              fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.455), 18px)',
              fontStyle: 'normal',
              fontWeight: 200,
            }}
          >
            <a
              className="wp-block-button__link"
              href={SITE.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#fff',
                backgroundColor: '#000',
                padding: '15px 25px',
                border: 'none',
                borderRadius: 0,
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.455), 18px)',
                fontWeight: 200,
                cursor: 'pointer',
              }}
            >
              {SITE.cta.text}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
