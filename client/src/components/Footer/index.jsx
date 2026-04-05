import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'collection', href: '#products' },
  { key: 'gallery', href: '#gallery' },
  { key: 'reviews', href: '#testimonials' },
  { key: 'contact', href: '#order' },
];

export default function Footer() {
  const { t } = useLanguage();
  const footer = t('footer');

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.inner}>
        {/* Col 1: Brand */}
        <div className={styles.col}>
          <div className={styles.logoWrap}>
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="url(#fGold)" strokeWidth="1.5" fill="none" />
              <path d="M8 24 Q24 8 40 24 Q24 40 8 24Z" stroke="url(#fGold)" strokeWidth="0.8" fill="none" opacity="0.5" />
              <text x="24" y="20" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="10" fontWeight="600" fill="url(#fGold)" letterSpacing="1">LG</text>
              <text x="24" y="31" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="4.5" fontWeight="500" fill="url(#fGold)" letterSpacing="2">LA GRANDE</text>
              <defs>
                <linearGradient id="fGold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C9A84C" />
                  <stop offset="50%" stopColor="#F5DFA0" />
                  <stop offset="100%" stopColor="#9A7830" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.logoTexts}>
              <span className={styles.logoName}>La Grande</span>
              <span className={styles.logoTagline}>{footer.tagline}</span>
            </div>
          </div>
          <p className={styles.brandDesc}>{footer.desc}</p>
          {/* Social links */}
          <div className={styles.socials}>
            {Array.isArray(footer.social) && footer.social.map((s) => (
              <a key={s} href="#" className={styles.socialLink} aria-label={s}>
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{footer.navTitle}</h4>
          <ul className={styles.linkList}>
            {navLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  className={styles.footerLink}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {t(`nav.${link.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Collections */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{footer.collectionsTitle}</h4>
          <ul className={styles.linkList}>
            {Array.isArray(footer.collections) && footer.collections.map((c, i) => (
              <li key={i}>
                <a
                  href="#products"
                  className={styles.footerLink}
                  onClick={(e) => handleNavClick(e, '#products')}
                >
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{footer.contactTitle}</h4>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>✆</span>
              <a href={`tel:${footer.phone}`} className={styles.contactLink}>{footer.phone}</a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>✉</span>
              <a href={`mailto:${footer.email}`} className={styles.contactLink}>{footer.email}</a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>◉</span>
              <span className={styles.contactText}>{footer.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copyright}>{footer.copyright}</span>
          <div className={styles.bottomDivider} />
          <span className={styles.bottomBrand}>La Grande</span>
        </div>
      </div>
    </footer>
  );
}
