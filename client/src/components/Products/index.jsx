import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

export default function Products() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  const products = t('products.items');
  const filters = t('products.filters');

  const filterKeys = ['all', 'floral', 'classic', 'modern', 'seasonal'];

  const filtered = activeFilter === 'all'
    ? products
    : products.filter((p) => p.collection === activeFilter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-card]').forEach((el, i) => {
              setTimeout(() => el.classList.add(styles.cardVisible), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [filtered]);

  const handleOrder = (collection) => {
    const orderSection = document.querySelector('#order');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
      // Dispatch custom event to pre-fill
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('prefillOrder', { detail: { collection } }));
      }, 600);
    }
  };

  return (
    <section className={styles.products} id="products" ref={sectionRef}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label">{t('products.subtitle')}</span>
          <h2 className={styles.title}>{t('products.title')}</h2>
          <div className="gold-divider" style={{ margin: '16px auto' }} />
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {filterKeys.map((key) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${activeFilter === key ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {Array.isArray(filters) ? key : filters[key]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {Array.isArray(filtered) && filtered.map((product, i) => (
            <div
              key={product.id}
              className={styles.card}
              data-card
              data-category={product.collection}
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Visual area */}
              <div
                className={styles.cardVisual}
                style={{ background: product.gradient }}
              >
                {/* Fabric pattern overlay */}
                <div className={styles.cardPattern}>
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id={`cardGold${i}`} x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#9A7830" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {[0, 72, 144, 216, 288].map((rot, j) => (
                      <g key={j} transform={`rotate(${rot} 100 100)`}>
                        <path d={`M100 20 Q115 60 100 100 Q85 60 100 20`} fill={`url(#cardGold${i})`} />
                      </g>
                    ))}
                    <circle cx="100" cy="100" r="35" stroke={`url(#cardGold${i})`} strokeWidth="0.8" fill="none" />
                    <circle cx="100" cy="100" r="15" stroke={`url(#cardGold${i})`} strokeWidth="0.6" fill="none" />
                    <circle cx="100" cy="100" r="4" fill={`url(#cardGold${i})`} />
                  </svg>
                </div>
                {/* Badge */}
                <span className={styles.badge}>{product.badge}</span>
                {/* Hover overlay */}
                <div className={`${styles.overlay} ${hoveredCard === product.id ? styles.overlayVisible : ''}`}>
                  <button
                    className={styles.overlayBtn}
                    onClick={() => handleOrder(product.collection)}
                  >
                    {t('products.orderBtn')}
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className={styles.cardBody}>
                <span className={styles.collectionLabel}>{product.collectionLabel}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.desc}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>{product.price}</span>
                  <button
                    className={styles.orderBtn}
                    onClick={() => handleOrder(product.collection)}
                  >
                    {t('products.orderBtn')}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
