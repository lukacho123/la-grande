import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

const slideBgs = [
  {
    bg: 'linear-gradient(135deg, #2C1A0E 0%, #5C3D1E 40%, #3D2810 100%)',
    accent: 'linear-gradient(135deg, #C9A84C 0%, #F5DFA0 50%, #9A7830 100%)',
    pattern: 'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.15) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #1A0E2C 0%, #3D1E5C 40%, #280D3D 100%)',
    accent: 'linear-gradient(135deg, #C9A84C 0%, #F5DFA0 50%, #9A7830 100%)',
    pattern: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #0E1A2C 0%, #1E3D5C 40%, #0D2838 100%)',
    accent: 'linear-gradient(135deg, #C9A84C 0%, #F5DFA0 50%, #9A7830 100%)',
    pattern: 'radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.1) 0%, transparent 60%)',
  },
  {
    bg: 'linear-gradient(135deg, #1A150E 0%, #4A3218 40%, #2C1D0A 100%)',
    accent: 'linear-gradient(135deg, #C9A84C 0%, #F5DFA0 50%, #9A7830 100%)',
    pattern: 'radial-gradient(ellipse at 75% 55%, rgba(201,168,76,0.18) 0%, transparent 60%)',
  },
];

export default function HeroSlider() {
  const { t } = useLanguage();
  const slides = t('hero.slides');
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 500);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i) => { goTo(i); resetTimer(); };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const slide = Array.isArray(slides) ? slides[current] : null;
  const bg = slideBgs[current];

  return (
    <section className={styles.hero} id="hero">
      {/* Background layers */}
      {slideBgs.map((s, i) => (
        <div
          key={i}
          className={`${styles.slideBg} ${i === current ? styles.bgActive : ''}`}
          style={{ background: s.bg }}
        >
          <div className={styles.bgPattern} style={{ background: s.pattern }} />
          <div className={styles.bgNoise} />
          <div className={styles.bgVignette} />
          {/* Decorative geometric ornament */}
          <div className={styles.ornament}>
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="195" stroke="url(#ornGold)" strokeWidth="0.5" opacity="0.3" />
              <circle cx="200" cy="200" r="160" stroke="url(#ornGold)" strokeWidth="0.5" opacity="0.2" />
              <circle cx="200" cy="200" r="120" stroke="url(#ornGold)" strokeWidth="0.5" opacity="0.15" />
              <path d="M200 5 L395 200 L200 395 L5 200 Z" stroke="url(#ornGold)" strokeWidth="0.5" opacity="0.25" />
              <path d="M200 40 L360 200 L200 360 L40 200 Z" stroke="url(#ornGold)" strokeWidth="0.5" opacity="0.2" />
              <circle cx="200" cy="200" r="4" fill="url(#ornGold)" opacity="0.6" />
              <circle cx="200" cy="5" r="3" fill="url(#ornGold)" opacity="0.4" />
              <circle cx="395" cy="200" r="3" fill="url(#ornGold)" opacity="0.4" />
              <circle cx="200" cy="395" r="3" fill="url(#ornGold)" opacity="0.4" />
              <circle cx="5" cy="200" r="3" fill="url(#ornGold)" opacity="0.4" />
              <defs>
                <linearGradient id="ornGold" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C9A84C" />
                  <stop offset="50%" stopColor="#F5DFA0" />
                  <stop offset="100%" stopColor="#9A7830" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      ))}

      {/* Content */}
      <div className={`${styles.content} ${transitioning ? styles.fadeOut : styles.fadeIn}`}>
        <div className={styles.inner}>
          {slide && (
            <>
              <span className={styles.tag}>{slide.tag}</span>
              <h1 className={styles.title}>{slide.title}</h1>
              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerDiamond}>◆</span>
                <span className={styles.dividerLine} />
              </div>
              <p className={styles.desc}>{slide.desc}</p>
              <div className={styles.ctaRow}>
                <a
                  href="#products"
                  className={styles.ctaPrimary}
                  onClick={(e) => handleNavClick(e, '#products')}
                >
                  {slide.cta}
                </a>
                <a
                  href="#order"
                  className={styles.ctaSecondary}
                  onClick={(e) => handleNavClick(e, '#order')}
                >
                  {slide.ctaSecondary}
                </a>
              </div>
            </>
          )}
        </div>

        {/* Slide counter */}
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>0{current + 1}</span>
          <span className={styles.counterSep} />
          <span className={styles.counterTotal}>0{slides.length}</span>
        </div>
      </div>

      {/* Arrows */}
      <button className={`${styles.arrow} ${styles.arrowPrev}`} onClick={handlePrev} aria-label="Previous slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={handleNext} aria-label="Next slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint}>
        <span className={styles.scrollLine} />
        <span className={styles.scrollDot} />
      </div>
    </section>
  );
}
