import { useState } from 'react';

const API = 'http://127.0.0.1:3456';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(API + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await resp.json();
      if (data.ok) {
        localStorage.setItem('admin_token', data.token);
        onLogin(data.token);
      } else {
        setError('Wrong password');
      }
    } catch {
      setError('Cannot connect to server');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f1219',
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#1a1f2e',
        padding: '2.5rem',
        borderRadius: 12,
        border: '1px solid #2a3040',
        width: '100%',
        maxWidth: 360,
      }}>
        <h1 style={{ color: '#e0e6ed', fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          🔐 Admin Login
        </h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter admin password"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 6,
            border: '1px solid #2a3040',
            background: '#0f1219',
            color: '#e0e6ed',
            fontSize: '1rem',
            marginBottom: '1rem',
            outline: 'none',
          }}
          autoFocus
        />
        {error && <p style={{ color: '#f26d78', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
        <button type="submit" style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 6,
          border: 'none',
          background: '#00373e',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer',
        }}>
          Login
        </button>
      </form>
    </div>
  );
}
