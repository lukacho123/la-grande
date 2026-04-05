import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

export default function FeaturesStrip() {
  const { t } = useLanguage();
  const items = t('features.items');
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-reveal]').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.strip} ref={ref}>
      <div className={styles.inner}>
        {Array.isArray(items) && items.map((item, i) => (
          <div key={i} className={styles.item} data-reveal>
            <span className={styles.icon}>{item.icon}</span>
            <div className={styles.text}>
              <strong className={styles.itemTitle}>{item.title}</strong>
              <span className={styles.itemSub}>{item.subtitle}</span>
            </div>
            {i < items.length - 1 && <span className={styles.sep} />}
          </div>
        ))}
      </div>
    </section>
  );
}
