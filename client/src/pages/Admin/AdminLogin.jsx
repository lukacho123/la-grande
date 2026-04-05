import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid password');
        setLoading(false);
        return;
      }
      localStorage.setItem('lg_admin_token', data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('კავშირის შეცდომა. სცადეთ თავიდან.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="29" stroke="#C9A84C" strokeWidth="1.5" />
            <path d="M15 30 Q22 20 30 30 Q38 40 45 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
            <path d="M15 24 Q22 14 30 24 Q38 34 45 24" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M15 36 Q22 26 30 36 Q38 46 45 36" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
          <h1 className={styles.brand}>LA GRANDE</h1>
          <p className={styles.subtitle}>ადმინ პანელი</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>პაროლი</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="შეიყვანეთ პაროლი"
              required
              autoFocus
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'შესვლა...' : 'შესვლა'}
          </button>
        </form>
      </div>
    </div>
  );
}
