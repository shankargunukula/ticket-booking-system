import React, { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ token }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hello! How can I assist you with your booking reservations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);

    try {
      const response = await fetch('http://localhost:8080/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Session expired. Please log in again.');
        throw new Error('Failed to process message.');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: data.response || data.text }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: `Error: ${error.message}`, isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Layout */}
      <div style={styles.header}>
        <div style={styles.avatarIcon}>🤖</div>
        <div>
          <h2 style={styles.headerTitle}>Booking AI Support</h2>
          <p style={styles.headerSubtitle}>Secure Gateway Intercept Active</p>
        </div>
      </div>

      {/* Message Feed */}
      <div style={styles.messageList}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.messageWrapper,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              ...styles.messageBubble,
              backgroundColor: msg.role === 'user' ? '#2563eb' : msg.isError ? '#fef2f2' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : msg.isError ? '#b91c1c' : '#1e293b',
              border: msg.role === 'user' ? 'none' : msg.isError ? '1px solid #fca5a5' : '1px solid #e2e8f0',
              borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <span style={styles.spinner}>⏳</span> AI is formulating a response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls block footer */}
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about your flight bookings..."
          style={styles.textField}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: (isLoading || !input.trim()) ? 0.5 : 1,
            cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

// 🎨 Explicit CSS styles object mapping to prevent framework layout leakage
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '550px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#0f172a',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#ffffff'
  },
  avatarIcon: {
    backgroundColor: '#3b82f6',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '18px',
    lineHeight: '1'
  },
  headerTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  messageList: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    padding: '10px 14px',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '75%',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  loadingIndicator: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  inputArea: {
    padding: '12px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    display: 'flex',
    gap: '8px'
  },
  textField: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  sendButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};
