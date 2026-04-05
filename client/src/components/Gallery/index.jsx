import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

export default function Gallery() {
  const { t } = useLanguage();
  const captions = t('gallery.captions');
  const gradients = t('gallery.gradients');

  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateProgress, { passive: true });
    return () => el.removeEventListener('scroll', updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-gitem]').forEach((el, i) => {
              setTimeout(() => el.classList.add(styles.gitemVisible), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
    trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const onTouchStart = (e) => {
    setStartX(e.touches[0].pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const onTouchMove = (e) => {
    const x = e.touches[0].pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    const itemW = trackRef.current.querySelector('[data-gitem]')?.offsetWidth || 320;
    trackRef.current.scrollBy({ left: dir * (itemW + 24), behavior: 'smooth' });
  };

  return (
    <section className={styles.gallery} id="gallery" ref={sectionRef}>
      <div className={styles.header}>
        <div className={`${styles.headerInner} reveal`}>
          <span className="section-label">{t('gallery.subtitle')}</span>
          <h2 className={styles.title}>{t('gallery.title')}</h2>
          <div className="gold-divider" />
        </div>
        <div className={styles.arrowGroup}>
          <button className={styles.arrow} onClick={() => scrollBy(-1)} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className={styles.arrow} onClick={() => scrollBy(1)} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        className={styles.track}
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ cursor: 'grab' }}
      >
        {Array.isArray(captions) && captions.map((caption, i) => (
          <div
            key={i}
            className={styles.item}
            data-gitem
            style={{ opacity: 0, transform: 'translateY(20px)', transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s` }}
          >
            <div
              className={styles.itemVisual}
              style={{ background: Array.isArray(gradients) ? gradients[i] : '' }}
            >
              {/* Fabric SVG pattern */}
              <div className={styles.itemPattern}>
                <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`gGold${i}`} x1="0" y1="0" x2="240" y2="280" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#9A7830" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  {[0, 60, 120, 180, 240, 300].map((rot, j) => (
                    <g key={j} transform={`rotate(${rot} 120 140)`}>
                      <path d="M120 40 Q138 90 120 140 Q102 90 120 40" fill={`url(#gGold${i})`} />
                    </g>
                  ))}
                  <circle cx="120" cy="140" r="50" stroke={`url(#gGold${i})`} strokeWidth="1" fill="none" />
                  <circle cx="120" cy="140" r="25" stroke={`url(#gGold${i})`} strokeWidth="0.8" fill="none" />
                  <circle cx="120" cy="140" r="6" fill={`url(#gGold${i})`} />
                  <rect x="20" y="20" width="200" height="240" stroke={`url(#gGold${i})`} strokeWidth="0.5" fill="none" rx="2" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((a, j) => {
                    const rad = (a * Math.PI) / 180;
                    const x = 120 + 75 * Math.cos(rad);
                    const y = 140 + 75 * Math.sin(rad);
                    return <circle key={j} cx={x} cy={y} r="2.5" fill={`url(#gGold${i})`} opacity="0.5" />;
                  })}
                </svg>
              </div>
              <div className={styles.itemOverlay}>
                <span className={styles.itemNum}>0{i + 1}</span>
              </div>
            </div>
            <div className={styles.itemCaption}>
              <span className={styles.captionText}>{caption}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressLabel}>{Math.round(progress)}%</span>
      </div>
    </section>
  );
}
