import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

function Stars({ count }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLanguage();
  const items = t('testimonials.items');
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-tcard]').forEach((el, i) => {
              setTimeout(() => el.classList.add(styles.tcardVisible), i * 150);
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.testimonials} id="testimonials" ref={sectionRef}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label">{t('testimonials.subtitle')}</span>
          <h2 className={styles.title}>{t('testimonials.title')}</h2>
          <div className="gold-divider" style={{ margin: '16px auto' }} />
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {Array.isArray(items) && items.map((item, i) => (
            <div key={i} className={styles.card} data-tcard>
              {/* Quote mark */}
              <span className={styles.quote}>&ldquo;</span>
              <Stars count={item.stars} />
              <p className={styles.text}>{item.text}</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{item.initial}</div>
                <div className={styles.authorInfo}>
                  <strong className={styles.authorName}>{item.name}</strong>
                  <span className={styles.authorCity}>{item.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
