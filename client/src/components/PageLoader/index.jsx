import React, { useState, useEffect } from 'react';
import styles from './style.module.css';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1800);
    const t2 = setTimeout(() => setVisible(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.loader} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.inner}>
        <svg className={styles.logo} width="80" height="80" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="29" stroke="#C9A84C" strokeWidth="1.5" />
          <path d="M15 30 Q22 20 30 30 Q38 40 45 30" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
          <path d="M15 24 Q22 14 30 24 Q38 34 45 24" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M15 36 Q22 26 30 36 Q38 46 45 36" stroke="#C9A84C" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        <div className={styles.brand}>LA GRANDE</div>
        <div className={styles.bar}>
          <div className={styles.progress} />
        </div>
      </div>
    </div>
  );
}
