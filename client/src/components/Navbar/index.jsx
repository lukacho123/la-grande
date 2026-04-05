import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'collection', href: '#products' },
  { key: 'gallery', href: '#gallery' },
  { key: 'reviews', href: '#testimonials' },
  { key: 'contact', href: '#footer' },
];

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#" className={styles.logo} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
            <circle cx="24" cy="24" r="22" stroke="url(#gold-ring)" strokeWidth="1.5" fill="none" />
            <path d="M8 24 Q24 8 40 24 Q24 40 8 24Z" stroke="url(#gold-ring)" strokeWidth="0.8" fill="none" opacity="0.4" />
            <text x="24" y="20" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="10" fontWeight="600" fill="url(#gold-text)" letterSpacing="1">LG</text>
            <text x="24" y="31" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="4.5" fontWeight="500" fill="url(#gold-text)" letterSpacing="2">LA GRANDE</text>
            <defs>
              <linearGradient id="gold-ring" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="50%" stopColor="#F5DFA0" />
                <stop offset="100%" stopColor="#9A7830" />
              </linearGradient>
              <linearGradient id="gold-text" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="50%" stopColor="#F5DFA0" />
                <stop offset="100%" stopColor="#9A7830" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.logoText}>La Grande</span>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={styles.navLink}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </nav>

        {/* Right controls */}
        <div className={styles.controls}>
          <button
            className={styles.langToggle}
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            aria-label="Toggle language"
          >
            <span className={lang === 'ka' ? styles.langActive : ''}>KA</span>
            <span className={styles.langSep}>|</span>
            <span className={lang === 'en' ? styles.langActive : ''}>EN</span>
          </button>
          <a
            href="#order"
            className={styles.ctaBtn}
            onClick={(e) => handleNavClick(e, '#order')}
          >
            {t('nav.order')}
          </a>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ''}`} ref={menuRef}>
        {navLinks.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className={styles.mobileLink}
            onClick={(e) => handleNavClick(e, link.href)}
          >
            {t(`nav.${link.key}`)}
          </a>
        ))}
        <a
          href="#order"
          className={styles.mobileCta}
          onClick={(e) => handleNavClick(e, '#order')}
        >
          {t('nav.order')}
        </a>
        <button
          className={styles.mobileLang}
          onClick={() => { setLang(lang === 'ka' ? 'en' : 'ka'); setMenuOpen(false); }}
        >
          {lang === 'ka' ? 'Switch to English' : 'გადართვა ქართულზე'}
        </button>
      </div>
    </header>
  );
}
