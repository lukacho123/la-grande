import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { adminGet } from './adminApi';
import styles from './Messages.module.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '/';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(text, len = 55) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

export default function Messages() {
  // threads: Map sessionId → { name, phone, messages: [], online: bool, unread: number }
  const [threads, setThreads] = useState({});
  const [onlineSessions, setOnlineSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const socketRef = useRef(null);
  const convEndRef = useRef(null);
  const replyInputRef = useRef(null);

  // Auto-scroll conversation
  useEffect(() => {
    convEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, selectedSession]);

  // Focus reply input when session selected
  useEffect(() => {
    if (selectedSession) {
      setTimeout(() => replyInputRef.current?.focus(), 100);
    }
  }, [selectedSession]);

  // Helper: merge a new customer message into threads
  const addCustomerMessage = useCallback((msg) => {
    const sid = msg.sessionId || 'general';
    setThreads(prev => {
      const thread = prev[sid] || {
        sessionId: sid,
        name: msg.name || 'Unknown',
        phone: msg.phone || '',
        messages: [],
        online: true,
        unread: 0,
      };
      const alreadyExists = thread.messages.some(m => m.id === msg.id);
      if (alreadyExists) return prev;
      return {
        ...prev,
        [sid]: {
          ...thread,
          name: msg.name || thread.name,
          phone: msg.phone || thread.phone,
          messages: [...thread.messages, { ...msg, from: 'customer' }],
          unread: thread.unread + 1,
        },
      };
    });
  }, []);

  // Helper: merge an admin reply echo into threads
  const addAdminReply = useCallback((sessionId, message, createdAt) => {
    const sid = sessionId || 'general';
    setThreads(prev => {
      const thread = prev[sid];
      if (!thread) return prev;
      const replyMsg = {
        id: `REPLY-${Date.now()}-${Math.random()}`,
        from: 'admin',
        message,
        createdAt,
      };
      return {
        ...prev,
        [sid]: {
          ...thread,
          messages: [...thread.messages, replyMsg],
        },
      };
    });
  }, []);

  useEffect(() => {
    // Load existing messages
    adminGet('/messages')
      .then(msgs => {
        const grouped = {};
        // Sort oldest first for display
        const sorted = [...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        for (const msg of sorted) {
          const sid = msg.sessionId || 'general';
          if (!grouped[sid]) {
            grouped[sid] = {
              sessionId: sid,
              name: msg.name || 'Unknown',
              phone: msg.phone || '',
              messages: [],
              online: false,
              unread: 0,
            };
          }
          grouped[sid].messages.push({ ...msg, from: 'customer' });
        }
        setThreads(grouped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    // Setup socket
    const token = localStorage.getItem('lg_admin_token') || '';
    const socket = io(SERVER_URL, { path: '/socket.io' });
    socketRef.current = socket;

    socket.emit('admin:join', { token });

    socket.on('admin:auth_error', () => {
      setError('Socket authentication failed.');
    });

    socket.on('session:update', ({ sessions }) => {
      setOnlineSessions(sessions);
      setThreads(prev => {
        const updated = { ...prev };
        // Mark all offline first
        for (const sid of Object.keys(updated)) {
          updated[sid] = { ...updated[sid], online: false };
        }
        // Mark online ones
        for (const s of sessions) {
          const sid = s.socketId;
          if (updated[sid]) {
            updated[sid] = { ...updated[sid], online: true };
          } else {
            updated[sid] = {
              sessionId: sid,
              name: s.name,
              phone: s.phone,
              messages: [],
              online: true,
              unread: 0,
            };
          }
        }
        return updated;
      });
    });

    socket.on('customer:message', msg => {
      addCustomerMessage(msg);
    });

    socket.on('customer:left', ({ sessionId }) => {
      setThreads(prev => {
        if (!prev[sessionId]) return prev;
        return {
          ...prev,
          [sessionId]: { ...prev[sessionId], online: false },
        };
      });
    });

    socket.on('admin:reply:echo', ({ sessionId, message, createdAt }) => {
      addAdminReply(sessionId, message, createdAt);
    });

    return () => {
      socket.disconnect();
    };
  }, [addCustomerMessage, addAdminReply]);

  function selectSession(sid) {
    setSelectedSession(sid);
    // Clear unread
    setThreads(prev => {
      if (!prev[sid]) return prev;
      return { ...prev, [sid]: { ...prev[sid], unread: 0 } };
    });
  }

  function sendReply(e) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedSession || !socketRef.current) return;

    socketRef.current.emit('admin:reply', { sessionId: selectedSession, message: text });

    // Add to local thread immediately (so this admin tab sees it right away)
    const now = new Date().toISOString();
    addAdminReply(selectedSession, text, now);

    setReplyText('');
    replyInputRef.current?.focus();
  }

  // Build sorted sessions list: online first, then by last message time
  const sessionList = Object.values(threads).sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    const aLast = a.messages[a.messages.length - 1]?.createdAt || '';
    const bLast = b.messages[b.messages.length - 1]?.createdAt || '';
    return bLast.localeCompare(aLast);
  });

  const selectedThread = selectedSession ? threads[selectedSession] : null;

  if (loading) return <div className={styles.loading}>იტვირთება...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.chatLayout}>
      {/* Left panel: session list */}
      <div className={styles.sessionPanel}>
        <div className={styles.sessionPanelHeader}>
          <span>საუბრები</span>
          {onlineSessions.length > 0 && (
            <span className={styles.onlineCount}>{onlineSessions.length} online</span>
          )}
        </div>
        {sessionList.length === 0 ? (
          <div className={styles.emptyState}>შეტყობინება ჯერ არ არის.</div>
        ) : (
          <div className={styles.sessionList}>
            {sessionList.map(thread => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = selectedSession === thread.sessionId;
              return (
                <div
                  key={thread.sessionId}
                  className={`${styles.sessionItem} ${isSelected ? styles.sessionItemActive : ''}`}
                  onClick={() => selectSession(thread.sessionId)}
                >
                  <div className={styles.sessionItemTop}>
                    <div className={styles.sessionItemName}>
                      {thread.online && <span className={styles.onlineDot} title="Online" />}
                      <span>{thread.name}</span>
                      {!thread.online && thread.messages.length > 0 && (
                        <span className={styles.offlineBadge}>Offline</span>
                      )}
                    </div>
                    {thread.unread > 0 && (
                      <span className={styles.unreadBadge}>{thread.unread}</span>
                    )}
                  </div>
                  <div className={styles.sessionItemPhone}>{thread.phone}</div>
                  {lastMsg && (
                    <div className={styles.sessionItemPreview}>
                      {lastMsg.from === 'admin' ? 'You: ' : ''}
                      {truncate(lastMsg.message || lastMsg.text || '')}
                    </div>
                  )}
                  {lastMsg?.createdAt && (
                    <div className={styles.sessionItemTime}>{formatDate(lastMsg.createdAt)}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right panel: conversation */}
      <div className={styles.convPanel}>
        {!selectedThread ? (
          <div className={styles.convEmpty}>აირჩიეთ საუბარი</div>
        ) : (
          <>
            <div className={styles.convHeader}>
              <div className={styles.convHeaderInfo}>
                <div className={styles.convHeaderName}>
                  {selectedThread.online && <span className={styles.onlineDot} />}
                  <strong>{selectedThread.name}</strong>
                  {!selectedThread.online && (
                    <span className={styles.offlineBadge}>Offline</span>
                  )}
                </div>
                <div className={styles.convHeaderPhone}>{selectedThread.phone}</div>
              </div>
            </div>

            <div className={styles.convMessages}>
              {selectedThread.messages.length === 0 && (
                <div className={styles.convNoMessages}>შეტყობინება ჯერ არ არის.</div>
              )}
              {selectedThread.messages.map((msg, i) => {
                const isAdmin = msg.from === 'admin';
                const text = msg.message || msg.text || '';
                const time = msg.createdAt ? formatTime(msg.createdAt) : '';
                return (
                  <div
                    key={msg.id || i}
                    className={`${styles.bubble} ${isAdmin ? styles.bubbleAdmin : styles.bubbleCustomer}`}
                  >
                    <div className={styles.bubbleText}>{text}</div>
                    {time && <div className={styles.bubbleTime}>{time}</div>}
                  </div>
                );
              })}
              <div ref={convEndRef} />
            </div>

            <form className={styles.replyBar} onSubmit={sendReply}>
              <input
                ref={replyInputRef}
                type="text"
                className={styles.replyInput}
                placeholder={selectedThread.online ? 'პასუხის გაწერა...' : 'კლიენტი offline-შია...'}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                disabled={!selectedThread.online}
              />
              <button
                type="submit"
                className={styles.replyBtn}
                disabled={!replyText.trim() || !selectedThread.online}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
