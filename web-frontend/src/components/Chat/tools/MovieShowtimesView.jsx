import React from 'react';

export default function MovieShowtimesView({ toolData, onSelectShowtime }) {
  const { movie, city, date, details } = toolData;
  if (!movie || !details) return null;

  return (
    <div style={styles.toolCard}>
      <div style={styles.cardHeader}>🎬 Available Showtimes for <strong>{movie}</strong></div>
      <p style={styles.cardMeta}>Location: {city} | Date: {date}</p>
      <div style={styles.chipContainer}>
        {details.showtimes?.map((time, idx) => (
          <button
            key={idx}
            onClick={() => onSelectShowtime(movie, time)}
            style={styles.timeChip}
          >
            {time}
          </button>
        ))}
      </div>
      <p style={styles.cardPrice}>Tickets: {details.ticket_price}</p>
    </div>
  );
}

const styles = {
  toolCard: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', width: '85%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { fontSize: '13px', fontWeight: '700', color: '#1e293b' },
  cardMeta: { fontSize: '11px', color: '#64748b', margin: '4px 0 10px 0' },
  chipContainer: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  timeChip: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  cardPrice: { fontSize: '11px', color: '#0f172a', fontWeight: '600', margin: 0 }
};
