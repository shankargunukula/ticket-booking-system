import React, { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ token }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hello! How can I assist you with your booking reservations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Establish and maintain the WebSocket connection
  useEffect(() => {
    // Connects to your FastAPI websocket endpoint
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

            // Pass error context cleanly to local state structure
            setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              isToolPayload: true,
              isError: !!structuredToolData.error, // Tracks error status true/false
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

    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Transmit messages safely over WebSockets (Replacing the broken api.post code)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const userMessage = input.trim();
    setInput('');

    // Append user message locally to chat UI
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);

    // Package payload and stream down the open socket to your LangGraph service
    const messagePayload = { message: userMessage, token: token };
    ws.current.send(JSON.stringify(messagePayload));
  };

  const handleSelectShowtime = (movie, time) => {
    alert(`Redirecting your dashboard to checkout: ${movie} at ${time}`);
  };

  return (
    <div style={styles.container}>
      {/* Header Layout */}
      <div style={styles.header}>
        <div style={styles.avatarIcon}>🤖</div>
        <div>
          <h2 style={styles.headerTitle}>Booking AI Support</h2>
          <p style={styles.headerSubtitle}>
            {isConnected ? "🟢 Secure Intercept Active" : "🔴 Disconnected from Engine"}
          </p>
        </div>
      </div>

      {/* Message Feed */}
      <div style={styles.messageList}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.messageWrapper,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
      {/* Dynamic UI Component: Error layout warning block */}
      {msg.isToolPayload && msg.isError && (
        <div style={{
          ...styles.toolCard,
          border: '1px solid #ef4444',
          background: '#fef2f2',
          boxShadow: 'none'
        }}>
          <p style={{fontSize: '12px', color: '#991b1b', margin: '6px 0 0 0', lineHeight: '1.4'}}>
            {msg.toolData?.error || "An unexpected issue occurred while loading showtime availability indexes."}
          </p>
        </div>
      )}
            {/* Standard Text Message Layout */}
            {!msg.isToolPayload && (
              <div style={{
                ...styles.messageBubble,
                backgroundColor: msg.role === 'user' ? '#2563eb' : msg.isError ? '#fef2f2' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : msg.isError ? '#b91c1c' : '#1e293b',
                border: msg.role === 'user' ? 'none' : msg.isError ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
              }}>
                {msg.text}
              </div>
            )}

            {/* Dynamic UI Component: Rendered from search_movie_showtimes output */}
            {msg.isToolPayload && msg.toolData?.movie && msg.toolData?.details && (
              <div style={styles.toolCard}>
                <div style={styles.cardHeader}>🎬 Available Showtimes for <strong>{msg.toolData.movie}</strong></div>
                <p style={styles.cardMeta}>Location: {msg.toolData.city} | Date: {msg.toolData.date}</p>
                <div style={styles.chipContainer}>
                  {msg.toolData.details.showtimes?.map((time, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectShowtime(msg.toolData.movie, time)}
                      style={styles.timeChip}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p style={styles.cardPrice}>Tickets: {msg.toolData.details.ticket_price}</p>
              </div>
            )}

            {/* Dynamic UI Component: Rendered from fetch_movie_ticket_status output */}
            {msg.isToolPayload && (msg.toolData?.seats || msg.toolData?.status) && (
              <div style={styles.ticketStatusCard}>
                <div style={styles.ticketHeader}>🎟️ Reservation Confirmation</div>
                <div style={styles.ticketBody}>
                  <p style={styles.ticketLine}><strong>Movie:</strong> {msg.toolData.movie}</p>
                  <p style={styles.ticketLine}><strong>Theater:</strong> {msg.toolData.theater}</p>
                  <p style={styles.ticketLine}><strong>Time:</strong> {msg.toolData.time}</p>
                  <p style={styles.ticketLine}>
                    <strong>Seats:</strong> <span style={styles.seatBadge}>{msg.toolData.seats}</span>
                  </p>
                  <div style={styles.ticketFooter}>Status: {msg.toolData.status}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input controls block footer */}
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
  container: {
    display: 'flex', flexDirection: 'column', height: '550px', width: '100%', maxWidth: '450px',
    border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', fontFamily: 'system-ui, sans-serif'
  },
  header: { backgroundColor: '#0f172a', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' },
  avatarIcon: { backgroundColor: '#3b82f6', padding: '8px', borderRadius: '8px', fontSize: '18px', lineHeight: '1' },
  headerTitle: { margin: 0, fontSize: '14px', fontWeight: '600' },
  headerSubtitle: { margin: 0, fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  messageList: { flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageWrapper: { display: 'flex', width: '100%' },
  messageBubble: { padding: '10px 14px', fontSize: '13px', lineHeight: '1.5', maxWidth: '75%', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },
  inputArea: { padding: '12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', gap: '8px' },
  textField: { flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  sendButton: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' },
  toolCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', width: '85%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { fontSize: '13px', fontWeight: '700', color: '#1e293b' },
  cardMeta: { fontSize: '11px', color: '#64748b', margin: '4px 0 10px 0' },
  chipContainer: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  timeChip: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  cardPrice: { fontSize: '11px', color: '#0f172a', fontWeight: '600', margin: 0 },
  ticketStatusCard: { background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: '12px', padding: '14px', width: '85%' },
  ticketHeader: { fontSize: '13px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' },
  ticketBody: { marginTop: '8px' },
  ticketLine: { fontSize: '12px', margin: '4px 0', color: '#334155' },
  seatBadge: { backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  ticketFooter: { marginTop: '10px', fontSize: '11px', fontWeight: '700', color: '#16a34a' }
};
