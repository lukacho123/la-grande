import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getMessages, markMessageRead, sendReply } from './adminApi';
import styles from './Messages.module.css';

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
  // threads: Map clientId → { clientId, name, phone, messages: [], unread: number }
  const [threads, setThreads] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const channelRef = useRef(null);
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
    const sid = msg.client_id || 'general';
    setThreads(prev => {
      const thread = prev[sid] || {
        clientId: sid,
        name: msg.name || 'Unknown',
        phone: msg.phone || '',
        messages: [],
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

  // Helper: merge an admin reply into threads
  const addAdminReply = useCallback((clientId, message, createdAt) => {
    const sid = clientId || 'general';
    setThreads(prev => {
      const thread = prev[sid];
      if (!thread) return prev;
      const replyMsg = {
        id: `REPLY-${Date.now()}-${Math.random()}`,
        from: 'admin',
        message,
        created_at: createdAt,
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
    getMessages()
      .then(msgs => {
        const grouped = {};
        // Sort oldest first for display
        const sorted = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        for (const msg of sorted) {
          const sid = msg.client_id || 'general';
          if (!grouped[sid]) {
            grouped[sid] = {
              clientId: sid,
              name: msg.name || 'Unknown',
              phone: msg.phone || '',
              messages: [],
              unread: 0,
            };
          }
          grouped[sid].messages.push({ ...msg, from: 'customer' });
        }
        setThreads(grouped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    // Setup Supabase Realtime
    const channel = supabase.channel('admin-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        addCustomerMessage(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'replies' }, (payload) => {
        const reply = payload.new;
        addAdminReply(reply.client_id, reply.message, reply.created_at);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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

  async function handleSendReply(e) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedSession) return;
    await sendReply(selectedSession, text);
    // Realtime will echo it back via the replies subscription
    setReplyText('');
    replyInputRef.current?.focus();
  }

  // Build sorted sessions list: by last message time
  const sessionList = Object.values(threads).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.created_at || '';
    const bLast = b.messages[b.messages.length - 1]?.created_at || '';
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
        </div>
        {sessionList.length === 0 ? (
          <div className={styles.emptyState}>შეტყობინება ჯერ არ არის.</div>
        ) : (
          <div className={styles.sessionList}>
            {sessionList.map(thread => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = selectedSession === thread.clientId;
              return (
                <div
                  key={thread.clientId}
                  className={`${styles.sessionItem} ${isSelected ? styles.sessionItemActive : ''}`}
                  onClick={() => selectSession(thread.clientId)}
                >
                  <div className={styles.sessionItemTop}>
                    <div className={styles.sessionItemName}>
                      <span>{thread.name}</span>
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
                  {lastMsg?.created_at && (
                    <div className={styles.sessionItemTime}>{formatDate(lastMsg.created_at)}</div>
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
                  <strong>{selectedThread.name}</strong>
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
                const time = msg.created_at ? formatTime(msg.created_at) : '';
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

            <form className={styles.replyBar} onSubmit={handleSendReply}>
              <input
                ref={replyInputRef}
                type="text"
                className={styles.replyInput}
                placeholder="პასუხის გაწერა..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                className={styles.replyBtn}
                disabled={!replyText.trim()}
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
