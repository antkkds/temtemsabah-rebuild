import { CONTACT } from '../data/content';
import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

// Exact SVG icons from www.temtemsabah.com WordPress social links block
const SocialIcon = ({ name }) => {
  const icons = {
    instagram: <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>,
    facebook: <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path></svg>,
    tiktok: <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z"></path></svg>,
  };
  return icons[name] || null;
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section id="contact" style={{ padding: '120px 0' }}>
      <div className="container-narrow" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {/* Logo badge above heading — 400% larger */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img
            src="https://temtemsabah.com/wp-content/uploads/2024/04/Mum-Approved-Snacks-e1712135606895.png"
            alt="Tem Tem Sabah"
            style={{ width: 240, height: 240, borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }}
          />
        </div>
        <h2 className="text-section-title" style={{ color: '#000', marginBottom: '1rem' }}>
          Feel Free to Contact Us
        </h2>
        <p className="text-body-sm" style={{ color: '#000' }}>
          Reach out to us through phone or email, or visit our address. You can also connect with us on social media for the latest updates and offers!
        </p>
      </div>

      <div
          className="contact-grid"
          style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {/* Contact Info */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ color: '#00373e', fontSize: 'clamp(15.747px, 0.984rem + ((1vw - 3.2px) * 0.938), 24px)', fontWeight: 600, marginBottom: '1rem' }}>
                  Contact
                </h3>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Phone size={18} style={{ color: '#00373e', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>WhatsApp :</div>
                    <a href={`tel:${CONTACT.phone}`} style={{ color: '#00373e', textDecoration: 'underline', fontSize: '0.9rem' }}>
                      {CONTACT.phone}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Mail size={18} style={{ color: '#00373e', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</div>
                    <a href={`mailto:${CONTACT.email}`} style={{ color: '#00373e', textDecoration: 'underline', fontSize: '0.9rem' }}>
                      {CONTACT.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: '#00373e', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Address</div>
                    <p style={{ color: '#333', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                      {CONTACT.address}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Connect With Us</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: 36 }}>
                  {[
                    { name: 'instagram', href: CONTACT.social.instagram, label: 'Instagram' },
                    { name: 'facebook', href: CONTACT.social.facebook, label: 'Facebook' },
                    { name: 'tiktok', href: CONTACT.social.tiktok, label: 'TikTok' },
                  ].map(({ name, href, label }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#000',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 0,
                        transition: 'transform 0.1s ease',
                      }}
                      className="wp-block-social-link-anchor"
                      onMouseOver={e => e.currentTarget.parentElement.style.transform = 'scale(1.1)'}
                      onMouseOut={e => e.currentTarget.parentElement.style.transform = 'scale(1)'}
                      aria-label={label}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                        <SocialIcon name={name} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form
              action="https://formsubmit.co/info@temtemsabah.com"
              method="POST"
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" required placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  Phone Number <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" placeholder="Your phone number" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" required placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  Comment or Message <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea name="message" rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" style={{ resize: 'vertical' }} required placeholder="Your message..." />
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
              {submitted ? (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', textAlign: 'center' }}>
                  ✓ Message sent! We'll get back to you soon.
                </div>
              ) : (
                <button type="submit" className="wp-block-button__link" style={{ width: '100%', textAlign: 'center' }}>
                  Submit
                </button>
              )}
            </form>
          </div>
        </div>
    </section>
  );
}
