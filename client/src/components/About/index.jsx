import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

export default function About() {
  const { t } = useLanguage();
  const stats = t('about.stats');
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (leftRef.current) leftRef.current.classList.add('visible');
            if (rightRef.current) rightRef.current.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.about} id="about" ref={sectionRef}>
      <div className={styles.inner}>
        {/* Left: visual */}
        <div className={`${styles.visual} reveal-left`} ref={leftRef}>
          <div className={styles.visualBox}>
            <div className={styles.fabricPattern}>
              {/* Decorative SVG fabric pattern */}
              <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.patternSvg}>
                <defs>
                  <linearGradient id="fabGold" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#F5DFA0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#9A7830" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                {/* Repeating floral motif */}
                {[0, 60, 120, 180, 240].map((rot, i) => (
                  <g key={i} transform={`rotate(${rot} 150 150)`}>
                    <path d="M150 10 Q170 80 150 150 Q130 80 150 10" fill="url(#fabGold)" />
                  </g>
                ))}
                <circle cx="150" cy="150" r="40" stroke="url(#fabGold)" strokeWidth="1" fill="none" />
                <circle cx="150" cy="150" r="20" stroke="url(#fabGold)" strokeWidth="0.8" fill="none" />
                <circle cx="150" cy="150" r="6" fill="url(#fabGold)" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
                  const rad = (a * Math.PI) / 180;
                  const x = 150 + 60 * Math.cos(rad);
                  const y = 150 + 60 * Math.sin(rad);
                  return <circle key={i} cx={x} cy={y} r="3" fill="url(#fabGold)" opacity="0.6" />;
                })}
                <rect x="30" y="30" width="240" height="240" stroke="url(#fabGold)" strokeWidth="0.5" fill="none" rx="4" />
                <rect x="10" y="10" width="280" height="280" stroke="url(#fabGold)" strokeWidth="0.3" fill="none" rx="2" />
              </svg>
            </div>
            {/* Badge */}
            <div className={styles.badge}>
              <span className={styles.badgeText}>{t('about.badge')}</span>
              <span className={styles.badgeSub}>{t('about.badgeSubtitle')}</span>
            </div>
          </div>
          {/* Stats grid */}
          <div className={styles.statsGrid}>
            {Array.isArray(stats) && stats.map((stat, i) => (
              <div key={i} className={styles.statBox}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: text */}
        <div className={`${styles.textCol} reveal-right`} ref={rightRef}>
          <span className="section-label">{t('about.label')}</span>
          <h2 className={styles.title}>{t('about.title')}</h2>
          <div className="gold-divider" />
          <p className={styles.subtitle}>{t('about.subtitle')}</p>
          <p className={styles.body}>{t('about.text')}</p>
          <a
            href="#products"
            className={styles.cta}
            onClick={(e) => handleNavClick(e, '#products')}
          >
            {t('about.cta')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.ctaArrow}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
