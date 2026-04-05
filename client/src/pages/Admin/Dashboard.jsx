import React, { useState, useEffect } from 'react';
import { adminGet } from './adminApi';
import styles from './Dashboard.module.css';

const STATUS_KA = { new: 'ახალი', processing: 'მუშავდება', done: 'დასრულებული' };

function StatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>{STATUS_KA[status] || status}</span>;
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue} style={accent ? { color: '#C9A84C' } : undefined}>
        {value ?? '-'}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminGet('/stats'), adminGet('/orders')])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (loading) return <div className={styles.loading}>იტვირთება...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <StatCard
          accent
          label="სულ შეკვეთა"
          value={stats?.totalOrders}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="2" />
            </svg>
          }
        />
        <StatCard
          accent
          label="ახალი შეკვეთა"
          value={stats?.newOrders}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatCard
          label="სულ შეტყობინება"
          value={stats?.totalMessages}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C3D1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="წაუკითხავი"
          value={stats?.unreadMessages}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C3D1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>ბოლო შეკვეთები</h2>
        {orders.length === 0 ? (
          <p className={styles.empty}>შეკვეთა ჯერ არ არის.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>მომხმარებელი</th>
                  <th>კოლექცია</th>
                  <th>სტატუსი</th>
                  <th>თარიღი</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.firstName} {o.lastName}</td>
                    <td>{o.collection}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className={styles.date}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
