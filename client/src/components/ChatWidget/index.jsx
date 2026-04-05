import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useLanguage } from '../../context/LanguageContext';
import styles from './style.module.css';

const STEPS = { CLOSED: 'closed', INTRO: 'intro', CHAT: 'chat' };
const SERVER_URL = import.meta.env.VITE_SERVER_URL || '/';
const STORAGE_KEY = 'lg_chat_session';

// Get or create a persistent clientId
function getClientId() {
  let id = localStorage.getItem('lg_chat_client_id');
  if (!id) {
    id = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('lg_chat_client_id', id);
  }
  return id;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(name, phone, messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, phone, messages }));
}

export default function ChatWidget() {
  const { t } = useLanguage();
  const c = t('chat');

  const saved = loadSession();

  const [step, setStep] = useState(saved ? STEPS.CHAT : STEPS.CLOSED);
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [inputError, setInputError] = useState('');
  const [messages, setMessages] = useState(saved?.messages || []);
  const [inputVal, setInputVal] = useState('');
  const [unread, setUnread] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const stepRef = useRef(step);

  // Keep stepRef in sync so socket callbacks can read current step
  useEffect(() => { stepRef.current = step; }, [step]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (name && phone) {
      saveSession(name, phone, messages);
    }
  }, [messages, name, phone]);

  // Auto-connect socket if restored session exists
  useEffect(() => {
    if (saved) {
      connectSocket(saved.name, saved.phone);
    }
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (step === STEPS.CHAT) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, step]);

  // Focus input when chat opens
  useEffect(() => {
    if (step === STEPS.CHAT) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [step]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function connectSocket(n, p) {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const clientId = getClientId();
    const socket = io(SERVER_URL, { path: '/socket.io' });
    socketRef.current = socket;

    socket.emit('customer:join', { name: n, phone: p, clientId });

    socket.on('admin:reply', ({ message, createdAt }) => {
      const time = createdAt
        ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : now();
      const newMsg = { from: 'admin', text: message, time };
      setMessages(prev => [...prev, newMsg]);
      // Increment unread only when widget is closed
      if (stepRef.current === STEPS.CLOSED) {
        setUnread(prev => prev + 1);
      }
    });
  }

  function openWidget() {
    setStep(saved || name ? STEPS.CHAT : STEPS.INTRO);
    setUnread(0);
  }

  function closeWidget() {
    setStep(STEPS.CLOSED);
  }

  function startChat(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setInputError(c.namePlaceholder);
      return;
    }
    setInputError('');
    connectSocket(name.trim(), phone.trim());
    const greeting = { from: 'bot', text: c.botGreeting, time: now() };
    setMessages([greeting]);
    setStep(STEPS.CHAT);
  }

  function sendMessage(e) {
    e.preventDefault();
    const text = inputVal.trim();
    if (!text || !socketRef.current) return;
    const userMsg = { from: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    socketRef.current.emit('customer:message', { message: text });
  }

  function clearSession() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('lg_chat_client_id');
    setName('');
    setPhone('');
    setMessages([]);
    setStep(STEPS.INTRO);
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`${styles.fab} ${step !== STEPS.CLOSED ? styles.fabHidden : ''}`}
        onClick={openWidget}
        aria-label={c.openLabel}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
        <span className={styles.fabLabel}>{c.openLabel}</span>
      </button>

      {/* Widget panel */}
      <div className={`${styles.panel} ${step !== STEPS.CLOSED ? styles.panelOpen : ''}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>LG</div>
            <div>
              <strong className={styles.headerTitle}>{c.title}</strong>
              <span className={styles.headerSub}>{c.subtitle}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {step === STEPS.CHAT && (
              <button
                className={styles.closeBtn}
                onClick={clearSession}
                title="ახალი საუბრის დაწყება"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                ✕ წაშლა
              </button>
            )}
            <button className={styles.closeBtn} onClick={closeWidget}>✕</button>
          </div>
        </div>

        {/* INTRO step */}
        {step === STEPS.INTRO && (
          <form className={styles.introForm} onSubmit={startChat}>
            <p className={styles.introText}>{c.botGreeting}</p>
            <div className={styles.field}>
              <label>{c.nameLabel}</label>
              <input
                type="text"
                placeholder={c.namePlaceholder}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>{c.phoneLabel}</label>
              <input
                type="tel"
                placeholder={c.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            {inputError && <p className={styles.error}>{inputError}</p>}
            <button type="submit" className={styles.startBtn}>{c.startBtn}</button>
          </form>
        )}

        {/* CHAT step */}
        {step === STEPS.CHAT && (
          <>
            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.msg} ${msg.from === 'user' ? styles.msgUser : styles.msgBot}`}
                >
                  {(msg.from === 'bot' || msg.from === 'admin') && (
                    <div className={styles.msgAvatar}>LG</div>
                  )}
                  <div className={styles.msgBubble}>
                    {msg.from === 'admin' && (
                      <span className={styles.msgSender}>La Grande</span>
                    )}
                    <span>{msg.text}</span>
                    <time>{msg.time}</time>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputRow} onSubmit={sendMessage}>
              <input
                ref={inputRef}
                type="text"
                placeholder={c.placeholder}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
              <button type="submit" disabled={!inputVal.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
