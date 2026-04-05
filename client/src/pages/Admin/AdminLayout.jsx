import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { supabase } from '../../lib/supabase';

const NAV_ITEMS = [
  {
    path: '/admin/dashboard',
    label: 'მთავარი',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    path: '/admin/orders',
    label: 'შეკვეთები',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="2" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    path: '/admin/messages',
    label: 'შეტყობინებები',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading
  if (!session) return <Navigate to="/admin/login" replace />;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  const currentPage = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentPage ? currentPage.label : 'ადმინი';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <svg width="36" height="36" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="29" stroke="#C9A84C" strokeWidth="1.5" />
            <path d="M15 30 Q22 20 30 30 Q38 40 45 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
            <path d="M15 24 Q22 14 30 24 Q38 34 45 24" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M15 36 Q22 26 30 36 Q38 46 45 36" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
          <span className={styles.sidebarBrand}>LA GRANDE</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>გასვლა</span>
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.userBadge}>
            <span className={styles.userDot} />
            Admin
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
