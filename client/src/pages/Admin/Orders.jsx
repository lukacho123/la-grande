import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from './adminApi';
import styles from './Orders.module.css';

const TABS = [
  { key: 'All', label: 'ყველა' },
  { key: 'New', label: 'ახალი' },
  { key: 'Processing', label: 'მუშავდება' },
  { key: 'Done', label: 'დასრულებული' },
];

const STATUS_KA = { new: 'ახალი', processing: 'მუშავდება', done: 'დასრულებული' };

function StatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>{STATUS_KA[status] || status}</span>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // key stays English for filter logic
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id, status) {
    setUpdating(id);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(null);
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter((o) => o.status === activeTab.toLowerCase());

  if (loading) return <div className={styles.loading}>იტვირთება...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>
              {tab.key === 'All'
                ? orders.length
                : orders.filter((o) => o.status === tab.key.toLowerCase()).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>ამ კატეგორიაში შეკვეთა არ არის.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>სახელი</th>
                  <th>ტელეფონი</th>
                  <th>კოლექცია</th>
                  <th>ზომა</th>
                  <th>მისამართი</th>
                  <th>სტატუსი</th>
                  <th>თარიღი</th>
                  <th>მოქმედება</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr className={expandedId === o.id ? styles.rowExpanded : ''}>
                      <td className={styles.orderId}>{o.id}</td>
                      <td className={styles.name}>{o.first_name} {o.last_name}</td>
                      <td>{o.phone}</td>
                      <td>{o.collection}</td>
                      <td>{o.size}</td>
                      <td className={styles.address}>{o.address}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className={styles.dateCell}>{formatDate(o.created_at)}</td>
                      <td>
                        <div className={styles.actions}>
                          <select
                            className={styles.select}
                            value={o.status}
                            disabled={updating === o.id}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                            <option value="new">ახალი</option>
                            <option value="processing">მუშავდება</option>
                            <option value="done">დასრულებული</option>
                          </select>
                          {o.notes && (
                            <button
                              className={styles.expandBtn}
                              onClick={() => toggleExpand(o.id)}
                              title="Toggle notes"
                            >
                              {expandedId === o.id ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === o.id && o.notes && (
                      <tr className={styles.notesRow}>
                        <td colSpan={9}>
                          <div className={styles.notesBox}>
                            <strong>შენიშვნა:</strong> {o.notes}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
