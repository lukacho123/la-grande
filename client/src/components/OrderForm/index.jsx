import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';
import { supabase } from '../../lib/supabase';

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  collection: '',
  size: '140x180',
  address: '',
  notes: '',
};

export default function OrderForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const fields = t('order.fields');
  const sizes = t('order.sizes');
  const collectionOptions = t('order.collectionOptions');
  const features = t('order.features');

  // Listen for prefillOrder event from Products
  useEffect(() => {
    const handler = (e) => {
      const { collection } = e.detail;
      if (collection) {
        setForm((prev) => ({ ...prev, collection }));
      }
    };
    window.addEventListener('prefillOrder', handler);
    return () => window.removeEventListener('prefillOrder', handler);
  }, []);

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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.from('orders').insert({
        id: `LG-${Date.now()}`,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        email: form.email,
        collection: form.collection,
        size: form.size,
        address: form.address,
        notes: form.notes,
        status: 'new',
      });
      if (error) throw error;
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(initialForm);
  };

  return (
    <section className={styles.orderSection} id="order" ref={sectionRef}>
      <div className={styles.inner}>
        {/* Left info panel */}
        <div className={`${styles.infoPanel} reveal-left`} ref={leftRef}>
          <span className="section-label">{t('order.subtitle')}</span>
          <h2 className={styles.title}>{t('order.title')}</h2>
          <div className="gold-divider" />
          <h3 className={styles.infoTitle}>{t('order.infoTitle')}</h3>
          <ul className={styles.featureList}>
            {Array.isArray(features) && features.map((feat, i) => (
              <li key={i} className={styles.featureItem}>
                <span className={styles.featureDot}>◆</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Decorative ornament */}
          <div className={styles.ornament}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="formOrnGold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9A7830" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              {[0, 60, 120, 180, 240, 300].map((rot, i) => (
                <g key={i} transform={`rotate(${rot} 100 100)`}>
                  <path d="M100 10 Q118 55 100 100 Q82 55 100 10" fill="url(#formOrnGold)" />
                </g>
              ))}
              <circle cx="100" cy="100" r="80" stroke="url(#formOrnGold)" strokeWidth="1" fill="none" />
              <circle cx="100" cy="100" r="50" stroke="url(#formOrnGold)" strokeWidth="0.8" fill="none" />
              <circle cx="100" cy="100" r="8" fill="url(#formOrnGold)" />
            </svg>
          </div>
        </div>

        {/* Right form card */}
        <div className={`${styles.formCard} reveal-right`} ref={rightRef}>
          {submitted ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✦</div>
              <h3 className={styles.successTitle}>{t('success.title')}</h3>
              <p className={styles.successText}>{t('success.text')}</p>
              <button className={styles.successBtn} onClick={handleReset}>
                {t('success.btn')}
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {/* Row 1: firstName + lastName */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>{fields.firstName} *</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder={fields.firstNamePlaceholder}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{fields.lastName} *</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder={fields.lastNamePlaceholder}
                    required
                  />
                </div>
              </div>

              {/* Row 2: phone + email */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>{fields.phone} *</label>
                  <input
                    className={styles.input}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={fields.phonePlaceholder}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{fields.email}</label>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={fields.emailPlaceholder}
                  />
                </div>
              </div>

              {/* Collection select */}
              <div className={styles.field}>
                <label className={styles.label}>{fields.collection} *</label>
                <select
                  className={styles.select}
                  name="collection"
                  value={form.collection}
                  onChange={handleChange}
                  required
                >
                  <option value="">{fields.collectionPlaceholder}</option>
                  {Array.isArray(collectionOptions) && collectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Size radio */}
              <div className={styles.field}>
                <label className={styles.label}>{fields.size} *</label>
                <div className={styles.sizeGrid}>
                  {Array.isArray(sizes) && sizes.map((size) => (
                    <label
                      key={size.value}
                      className={`${styles.sizeOption} ${form.size === size.value ? styles.sizeActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.value}
                        checked={form.size === size.value}
                        onChange={handleChange}
                        className={styles.radioHidden}
                      />
                      <span className={styles.sizeLabel}>{size.label}</span>
                      <span className={styles.sizeSub}>{size.sub}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className={styles.field}>
                <label className={styles.label}>{fields.address} *</label>
                <input
                  className={styles.input}
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder={fields.addressPlaceholder}
                  required
                />
              </div>

              {/* Notes */}
              <div className={styles.field}>
                <label className={styles.label}>{fields.notes}</label>
                <textarea
                  className={styles.textarea}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder={fields.notesPlaceholder}
                  rows={4}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? '...' : fields.submit}
                {!loading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
