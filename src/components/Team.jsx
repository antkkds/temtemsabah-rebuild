import { TEAM, WELCOME_STORY } from '../data/content';

export default function Team() {
  return (
    <section
      className="wp-block-group alignfull"
      style={{
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 65,
        paddingBottom: 100,
        background: '#fff',
      }}
    >
      <div
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
          Leadership: Meet The Team
        </h2>

        <div style={{ height: 100 }} aria-hidden="true" />
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 1rem',
        }}
      >
        <div
          className="team-grid"
          style={{
            display: 'grid',
          }}
        >
          {TEAM.map((member) => (
            <div key={member.name} style={{ textAlign: 'center' }}>
              {/* Rounded image — is-style-rounded = borderRadius 9999px */}
              <figure
                className="wp-block-image is-style-rounded"
                style={{
                  margin: 0,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <img
                  className="team-photo"
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 999,
                  }}
                />
              </figure>
              <div style={{ marginTop: '1rem' }}>
                <h3
                  className="wp-block-heading has-text-align-center"
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
                  {member.name}
                </h3>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <p
                  className="has-text-align-center"
                  style={{
                    color: '#000',
                    fontSize: 'clamp(14.642px, 0.915rem + ((1vw - 3.2px) * 0.836), 22px)',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Message — elegant centered layout */}
      <div
        style={{
          background: '#eaeae3',
          paddingTop: 80,
          paddingBottom: 100,
          marginTop: '5rem',
        }}
      >
        <div
          style={{
            maxWidth: 650,
            margin: '0 auto',
            padding: '0 2rem',
          }}
        >
          <h3
            className="wp-block-heading has-text-align-center"
            style={{
              color: '#000',
              fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 1.5,
              textTransform: 'none',
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}
          >
            Welcome Message
          </h3>
            {WELCOME_STORY.map((para, i) => (
            <p
              key={i}
              className="has-text-align-center"
              style={{
                color: '#000',
                fontSize: 'clamp(14px, 0.875rem + ((1vw - 3.2px) * 0.682), 20px)',
                lineHeight: 1.8,
                textAlign: 'center',
                margin: 0,
                marginBottom: i < WELCOME_STORY.length - 1 ? '2rem' : 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
