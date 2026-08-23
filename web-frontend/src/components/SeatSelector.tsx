import React, { useState } from 'react';

// Structured Mock Blueprint reflecting database layout payload rules
const SAMPLE_THEATER_SEATS = [
  { id: 101, rowLetter: 'A', number: 1, type: 'Standard', price: 12.00, status: 'Available' },
  { id: 102, rowLetter: 'A', number: 2, type: 'Standard', price: 12.00, status: 'Available' },
  { id: 103, rowLetter: 'A', number: 3, type: 'Standard', price: 12.00, status: 'Reserved' },
  { id: 104, rowLetter: 'A', number: 4, type: 'Standard', price: 12.00, status: 'Available' },

  { id: 201, rowLetter: 'B', number: 1, type: 'Premium', price: 16.00, status: 'Available' },
  { id: 202, rowLetter: 'B', number: 2, type: 'Premium', price: 16.00, status: 'Reserved' },
  { id: 203, rowLetter: 'B', number: 3, type: 'Premium', price: 16.00, status: 'Available' },
  { id: 204, rowLetter: 'B', number: 4, type: 'Premium', price: 16.00, status: 'Available' },

  { id: 301, rowLetter: 'C', number: 1, type: 'VIP', price: 22.00, status: 'Available' },
  { id: 302, rowLetter: 'C', number: 2, type: 'VIP', price: 22.00, status: 'Available' },
  { id: 303, rowLetter: 'C', number: 3, type: 'VIP', price: 22.00, status: 'Available' },
  { id: 304, rowLetter: 'C', number: 4, type: 'VIP', price: 22.00, status: 'Reserved' }
];

export default function SeatSelector({ maxAllowed = 6, onSelectionChange }) {
  const [seatInventory, setSeatInventory] = useState(SAMPLE_THEATER_SEATS);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Handle seat click lifecycle checks
  const handleSeatClick = (seat) => {
    if (seat.status === 'Reserved') return; // Absolute return shortcut if occupied

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);

    let updatedSelection = [];
    if (isAlreadySelected) {
      // Remove element if unclicked
      updatedSelection = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      // Restrict capacity overflows based on threshold allocations
      if (selectedSeats.length >= maxAllowed) {
        alert(`You can reserve a maximum validation ceiling of ${maxAllowed} seats.`);
        return;
      }
      updatedSelection = [...selectedSeats, seat];
    }

    setSelectedSeats(updatedSelection);

    // Bubble parameter values upwards if tracking parent requires metrics hook
    if (onSelectionChange) {
      onSelectionChange(updatedSelection);
    }
  };

  // Compute live subtotal summary invoice metrics
  const computedTotalCost = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div style={{ maxWidth: '480px', margin: '20px auto', fontFamily: 'sans-serif', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>

      {/* Screen Boundary Visual Anchor */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '85%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '9999px', margin: '0 auto 6px auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>CINEMA SCREEN THIS WAY</span>
      </div>

      {/* Primary Responsive CSS Grid Matrix Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // Adjust this to match your columns layout requirements
        gap: '12px',
        justifyItems: 'center',
        marginBottom: '28px'
      }}>
        {seatInventory.map((seat) => {
          const isSelected = selectedSeats.some(s => s.id === seat.id);
          const isReserved = seat.status === 'Reserved';

          // Inline dynamic theme state assignment engine
          let currentBgColor = '#e2e8f0'; // Default Available color
          let currentTextColor = '#334155';
          let currentCursor = 'pointer';

          if (isReserved) {
            currentBgColor = '#94a3b8'; // Grey when occupied/reserved
            currentTextColor = '#ffffff';
            currentCursor = 'not-allowed';
          } else if (isSelected) {
            currentBgColor = '#2563eb'; // Blue when clicked/selected
            currentTextColor = '#ffffff';
          }

          return (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              disabled={isReserved}
              style={{
                width: '52px',
                height: '46px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                backgroundColor: currentBgColor,
                color: currentTextColor,
                fontWeight: '700',
                fontSize: '12px',
                cursor: currentCursor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s ease',
                outline: 'none'
              }}
              title={`${seat.type} Class - $${seat.price}`}
            >
              <span style={{ fontSize: '10px', opacity: 0.85 }}>{seat.rowLetter}</span>
              <span>{seat.number}</span>
            </button>
          );
        })}
      </div>

      {/* Color Mapping Context Legend Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
          <span>Reserved (Grey)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#2563eb', borderRadius: '4px' }} />
          <span>Selected (Blue)</span>
        </div>
      </div>

      {/* Dynamic Summary Cost Ticket Block */}
      {selectedSeats.length > 0 && (
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Chosen Allocations:</span>
            <span style={{ color: '#334155', fontFamily: 'monospace' }}>
              {selectedSeats.map(s => `${s.rowLetter}${s.number}`).join(', ')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
            <span>Subtotal Aggregate</span>
            <span style={{ color: '#16a34a' }}>${computedTotalCost.toFixed(2)}</span>
          </div>
        </div>
      )}

    </div>
  );
}
