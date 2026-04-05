import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

export default function Process() {
  const { t } = useLanguage();
  const steps = t('process.steps');
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-step]').forEach((el, i) => {
              setTimeout(() => el.classList.add(styles.stepVisible), i * 150);
            });
            const line = entry.target.querySelector('[data-line]');
            if (line) {
              setTimeout(() => line.classList.add(styles.lineGrow), 300);
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.process} id="process" ref={sectionRef}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label" style={{ color: 'var(--gold)' }}>
            {t('process.subtitle')}
          </span>
          <h2 className={styles.title}>{t('process.title')}</h2>
          <div className="gold-divider" style={{ margin: '16px auto' }} />
        </div>

        {/* Steps */}
        <div className={styles.stepsRow}>
          {/* Connecting line */}
          <div className={styles.lineTrack}>
            <div className={styles.line} data-line />
          </div>

          {Array.isArray(steps) && steps.map((step, i) => (
            <div key={i} className={styles.step} data-step>
              <div className={styles.stepCircle}>
                <span className={styles.stepNum}>{step.num}</span>
              </div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
