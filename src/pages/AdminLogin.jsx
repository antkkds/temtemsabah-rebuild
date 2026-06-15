import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await fetch('/api/crm/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await resp.json();
      if (data.ok) {
        localStorage.setItem('crm_token', data.token);
        localStorage.setItem('crm_user', JSON.stringify(data.user));
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Cannot connect to server');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f1219',
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#1a1f2e', padding: '2.5rem', borderRadius: 12,
        border: '1px solid #2a3040', width: '100%', maxWidth: 380,
      }}>
        <h1 style={{ color: '#e0e6ed', fontSize: '1.25rem', marginBottom: '0.25rem', textAlign: 'center' }}>
          🔐 Admin Login
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Tem Tem Sabah CRM
        </p>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email address" required
          style={inputStyle} autoFocus
        />
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" required
          style={inputStyle}
        />
        {error && <p style={{ color: '#f26d78', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.75rem', borderRadius: 6, border: 'none',
          background: loading ? '#1a3a3e' : '#00373e', color: 'white',
          fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 6,
  border: '1px solid #2a3040', background: '#0f1219', color: '#e0e6ed',
  fontSize: '1rem', marginBottom: '1rem', outline: 'none', boxSizing: 'border-box',
};
