import React, { useState, useEffect, useRef } from 'react';
import ToolDispatcher from './ToolDispatcher';

export default function ChatWindow({ token }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hello! How can I assist you with your booking reservations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/chat");

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("Connected to Python chat microservice via WebSocket.");
    };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { node, content } = payload;

        if (node === 'assistant' && content) {
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', text: content }]);
        }
        else if (node === 'tools' && content) {
          try {
            const structuredToolData = JSON.parse(content);
            setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              isToolPayload: true,
              toolName: structuredToolData.type || null,
              isError: !!structuredToolData.error,
              toolData: structuredToolData
            }]);
          } catch (e) {
            console.log("Raw tool output string: ", content);
          }
        }
      } catch (err) {
        console.error("Error processing incoming socket message: ", err);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed.");
    };

    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);

    const messagePayload = { message: userMessage, token: token };
    ws.current.send(JSON.stringify(messagePayload));
  };

  const handleSelectShowtime = (movie, time) => {
    alert(`Redirecting your dashboard to checkout: ${movie} at ${time}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatarIcon}>🤖</div>
        <div>
          <h2 style={styles.headerTitle}>Booking AI Support</h2>
          <p style={styles.headerSubtitle}>
            {isConnected ? "📡 Secure Intercept Active" : "🛑 Disconnected from Engine"}
          </p>
        </div>
      </div>

      <div style={styles.messageList}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.messageWrapper,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {!msg.isToolPayload && (
              <div style={{
                ...styles.messageBubble,
                backgroundColor: msg.role === 'user' ? '#2563eb' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
              }}>
                {msg.text}
              </div>
            )}

            {msg.isToolPayload && (
              <ToolDispatcher msg={msg} onSelectShowtime={handleSelectShowtime} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about movies, showtimes or active tickets..."
          style={styles.textField}
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: (!isConnected || !input.trim()) ? 0.5 : 1,
            cursor: (!isConnected || !input.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '550px', width: '100%', maxWidth: '450px', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },
  header: { backgroundColor: '#0f172a', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' },
  avatarIcon: { backgroundColor: '#3b82f6', padding: '8px', borderRadius: '8px', fontSize: '18px', lineHeight: '1' },
  headerTitle: { margin: 0, fontSize: '14px', fontWeight: '600' },
  headerSubtitle: { margin: 0, fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  messageList: { flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageWrapper: { display: 'flex', width: '100%' },
  messageBubble: { padding: '10px 14px', fontSize: '13px', lineHeight: '1.5', maxWidth: '75%', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },
  inputArea: { padding: '12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', gap: '8px' },
  textField: { flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  sendButton: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }
};
