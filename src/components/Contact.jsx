import { CONTACT } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';
import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

// ── Email masking (anti-scraper) ──
const emailUser = 'info';
const emailDomain = 'temtemsabah.com';
const maskedEmail = () => emailUser + '\u0040' + emailDomain;
const mailtoHref = () => 'mailto:' + emailUser + String.fromCharCode(64) + emailDomain;

// ── Web3Forms config ──
// Sign up free at https://web3forms.com to get your access_key
const WEB3FORMS_KEY = 'b287f84a-77af-4e98-9673-ec7193d64c43';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

// Exact SVG icons from www.temtemsabah.com WordPress social links block
const SocialIcon = ({ name }) => {
  const icons = {
    instagram: <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z\"></path></svg>,
    facebook: <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path></svg>,
    tiktok: <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '1em', height: '1em' }}><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.2-1.896 5.391-2.652 8.256-2.113 0.191 1.657 0.687 3.352 1.74 4.7-0.98-0.3-2.063-0.441-3.047-0.171-1.14 0.312-2.192 1.165-2.844 2.156-0.62 0.979-0.943 2.171-0.819 3.323 0.004 0.031 0.011 0.063 0.015 0.096 0.28 1.188 1.027 2.308 2.052 3.015 1.1 0.724 2.588 0.953 3.833 0.469 0.892-0.301 1.709-0.933 2.171-1.747 0.48-0.78 0.651-1.692 0.593-2.605 0.028-3.4 0.004-6.799 0.005-10.199 0.020-0.447 0-0.893 0-1.344z\"></path></svg>,
  };
  return icons[name] || null;
};

export default function Contact() {
  const { lang } = useLanguage();
  const t = (obj) => obj?.[lang] || obj?.en || '';
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', botcheck: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── JS validation ──
  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.message.trim()) return 'Message is required.';
    if (form.message.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check — if bot filled the hidden field, silently reject
    if (form.botcheck) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setSubmitting(true);

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: 'Tem Tem Sabah - New Contact Form Submission',
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      botcheck: form.botcheck,
    };

    try {
      const resp = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to send. Please try again.');
      }
    } catch {
      // Fallback: try existing methods
      const antformailUrl = 'https://antformail.onrender.com/api/submit';
      const fallbackPayload = { name: form.name, email: form.email, phone: form.phone, message: form.message };
      const promises = [
        fetch(antformailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': 'afm_5c507d1e53a72992c45fc93e8030516646014a026abd8089' },
          body: JSON.stringify(fallbackPayload),
        }).catch(() => {}),
        fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallbackPayload),
        }).catch(() => {}),
      ];
      try {
        await Promise.all(promises);
        setSubmitted(true);
      } catch {
        setError('Cannot connect. Please try again later.');
      }
    }
    setSubmitting(false);
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
        <h2 className="text-section-title" style={{ fontSize: 'clamp(23.6px, 1.475rem + ((1vw - 3.2px) * 1.66), 38px)', fontWeight: 700, color: '#00373e', marginBottom: '0.75rem' }}>
          {t(T.contact.heading)}
        </h2>
        <p className="text-body" style={{ color: '#333', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
          We'd love to hear from you. Whether you have a question about our products, distribution, or just want to say hi.
        </p>
      </div>

      <div className="container-medium">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}>

          {/* Left Column: Contact Info */}
          <div>
            {/* Phone */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t(T.contact.phone)}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a href={`tel:${CONTACT.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#00373e', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none' }}>
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            {/* Email — masked to prevent scraping */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t(T.contact.email)}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a href={mailtoHref()} style={{ color: '#00373e', fontSize: '1.1rem', textDecoration: 'underline' }}>
                  {maskedEmail()}
                </a>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t(T.contact.address_label)}</div>
              <p style={{ color: '#333', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                {CONTACT.address}
              </p>
            </div>

            {/* Connect With Us */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t(T.contact.connect)}</div>
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
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <SocialIcon name={name} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Honeypot — hidden from humans, visible to bots */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input type="text" name="botcheck" value={form.botcheck}
                  onChange={(e) => setForm({ ...form, botcheck: e.target.value })}
                  tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  {t(T.contact.form_name)} <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" required placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  {t(T.contact.form_phone)}
                </label>
                <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" placeholder="Your phone number" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  {t(T.contact.form_email)} <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" required placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.875rem' }}>
                  {t(T.contact.form_message)} <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea name="message" rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" style={{ resize: 'vertical' }} required placeholder="Your message..." />
              </div>
              {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
              {submitted ? (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', textAlign: 'center' }}>
                  {t(T.contact.form_success)}
                </div>
              ) : (
                <button type="submit" disabled={submitting} style={{
                  width: '100%',
                  padding: '14px 28px',
                  background: submitting ? '#9ca3af' : '#00373e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                }}>
                  {submitting ? t(T.contact.form_sending) : t(T.contact.form_submit)}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
