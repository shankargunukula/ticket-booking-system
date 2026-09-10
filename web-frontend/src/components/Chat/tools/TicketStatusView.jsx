import React from 'react';

export default function TicketStatusView({ toolData }) {
  return (
    <div style={styles.ticketStatusCard}>
      <div style={styles.ticketHeader}>🎟️ Reservation Confirmation</div>
      <div style={styles.ticketBody}>
        <p style={styles.ticketLine}><strong>Movie:</strong> {toolData.movie}</p>
        <p style={styles.ticketLine}><strong>Theater:</strong> {toolData.theater}</p>
        <p style={styles.ticketLine}><strong>Time:</strong> {toolData.time}</p>
        <p style={styles.ticketLine}>
          <strong>Seats:</strong> <span style={styles.seatBadge}>{toolData.seats}</span>
        </p>
        <div style={styles.ticketFooter}>Status: {toolData.status}</div>
      </div>
    </div>
  );
}

const styles = {
  ticketStatusCard: { background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: '12px', padding: '14px', width: '85%' },
  ticketHeader: { fontSize: '13px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' },
  ticketBody: { marginTop: '8px' },
  ticketLine: { fontSize: '12px', margin: '4px 0', color: '#334155' },
  seatBadge: { backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  ticketFooter: { marginTop: '10px', fontSize: '11px', fontWeight: '700', color: '#16a34a' }
};
