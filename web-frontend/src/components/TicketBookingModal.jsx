import React, { useState } from 'react';
import axios from 'axios';

// 1. STRUCTURED HALL MAP SEAT ASSETS DATA
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

/**
 * TicketBookingModal - Drop-in Layer for Movie Dashboard with Interactive Seating Grid
 *
 * @param {Object} movie - Pass the selected movie dictionary down from your dataset state.
 * @param {Function} onClose - State setter callback that resets selected state values to null.
 */
export default function TicketBookingModal({ movie, onClose }) {
  // Navigation Flow State Machine (1 = Selection, 2 = Payment Simulation, 3 = Confirmation Ticket Receipt)
  const [currentStep, setCurrentStep] = useState(1);
  const [chosenShowtime, setChosenShowtime] = useState(movie?.showtimes?.[0] || "");

  // Interactive Seat Allocation State trackers
  const [seatsCount, setSeatsCount] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Form Field Trackers
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Storage Tracker for Server Response Elements
  const [serverReceiptData, setServerReceiptData] = useState(null);
  if (!movie) return null;

  // Real-time Pricing Logic Operations
  const ticketBaseRate = movie.ticketPrice || 14.50;
  const billingSubtotal = ticketBaseRate * seatsCount;
  const convenienceFee = seatsCount > 0 ? 1.50 : 0.00;
  const absoluteTotal = billingSubtotal + convenienceFee;

 // Integrated Seat Multi-Selection and Allocation Change Handler
  const handleSeatAllocationChange = (seat) => {
    if (seat.status === 'Reserved') return;

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    let updatedSelection = [];

    if (isAlreadySelected) {
      updatedSelection = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      if (selectedSeats.length >= 6) {
        alert("You can reserve a maximum validation ceiling of 6 seats.");
        return;
      }
      updatedSelection = [...selectedSeats, seat];
    }

    setSelectedSeats(updatedSelection);
    setSeatsCount(updatedSelection.length);
  };

  // Form validation submission handler
  const handlePaymentProcessing = async (e) => {
    e.preventDefault();
    if (seatsCount === 0) {
      alert("Please assign at least one active seat selection parameter before checkout.");
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert("Please populate all transactional verification fields.");
      return;
    }

    setIsAuthorizing(true);

    const javaPayload = {
      movieId: movie.id,
      movieTitle: movie.title,
      selectedShowtime: chosenShowtime,
      ticketsPurchased: seatsCount,
      totalCharged: absoluteTotal,
      maskedCard: `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}`
    };

    try {
      const response = await axios.post('http://localhost:8080/api/v1/bookings', javaPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Capture the generated Postgres Long ID key back out of the Java response body mapping
      setServerReceiptData(response.data);
      setCurrentStep(3); // Route viewport view safely to confirmation card layout
    } catch (error) {
      console.error("Java server endpoint rejected checkout processing request", error);
      alert("Transaction processing failed on backend connection path.");
    } finally {
      setIsAuthorizing(false);
    } // FIXED: Closed the block cleanly inside the scope of the method assignment
  };
  return (
    <div style={overlayWrapperStyle}>
      <div style={modalContainerStyle}>

        {/* Modal Window Header */}
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {currentStep === 1 && "Select Seats & Timing"}
              {currentStep === 2 && "Secure Payment Window"}
              {currentStep === 3 && "Order Confirmed!"}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{movie.title}</p>
          </div>
          {currentStep !== 2 && (
            <button onClick={onClose} style={closeWindowBtnStyle} aria-label="Dismiss view">&times;</button>
          )}
        </div>

        {/* STEP 1: PARAMETER SPECIFICATION PANELS */}
        {currentStep === 1 && (
          <div>
            {/* Session Showtime Clusters */}
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>Choose Available Showtime</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {movie.showtimes?.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setChosenShowtime(time)}
                    style={{
                      ...timingPillSelectionStyle,
                      borderColor: chosenShowtime === time ? '#2563eb' : '#e2e8f0',
                      backgroundColor: chosenShowtime === time ? '#eff6ff' : '#ffffff',
                      color: chosenShowtime === time ? '#1d4ed8' : '#334155',
                      fontWeight: chosenShowtime === time ? '700' : '400'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* ADJUSTMENT: Interactive CSS Grid Seat Assignment Matrix */}
            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabelStyle}>Choose Your Seats (Max 6)</label>

              {/* Screen Direction Visual Anchor */}
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <div style={{ width: '85%', height: '5px', backgroundColor: '#cbd5e1', borderRadius: '4px', margin: '0 auto 4px auto' }} />
                <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>CINEMA SCREEN</span>
              </div>

              {/* Seating Layout Map Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', justifyItems: 'center', padding: '6px 0' }}>
                {SAMPLE_THEATER_SEATS.map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isReserved = seat.status === 'Reserved';

                  let bg = '#e2e8f0';
                  let color = '#334155';
                  if (isReserved) { bg = '#94a3b8'; color = '#ffffff'; }
                  else if (isSelected) { bg = '#2563eb'; color = '#ffffff'; }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isReserved}
                      onClick={() => handleSeatAllocationChange(seat)}
                      style={{
                        width: '48px',
                        height: '44px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                        backgroundColor: bg,
                        color: color,
                        fontWeight: '700',
                        fontSize: '11px',
                        cursor: isReserved ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.1s ease-out'
                      }}
                      title={`${seat.type} Class - $${seat.price}`}
                    >
                      <span style={{ fontSize: '9px', opacity: 0.85 }}>{seat.rowLetter}</span>
                      <span>{seat.number}</span>
                    </button>
                  );
                })}
              </div>

              {/* Matrix Mappings Color Key Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />Available</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#94a3b8', borderRadius: '3px' }} />Reserved</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '3px' }} />Selected</div>
              </div>
            </div>

            {/* Ledger Line Breakdown invoice matrix */}
            <div style={ledgerBoxStyle}>
              <div style={ledgerRowStyle}>
                <span>Admission Tickets ({seatsCount} x ${ticketBaseRate.toFixed(2)})</span>
                <span>${billingSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ ...ledgerRowStyle, fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                <span>Online Processing convenience Fee</span>
                <span>${convenienceFee.toFixed(2)}</span>
              </div>
              <div style={ledgerFinalTotalRowStyle}>
                <span>Total Amount</span>
                <span>${absoluteTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Step 1 Control Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle}>Cancel</button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={seatsCount === 0}
                style={{ ...btnPrimaryStyle, backgroundColor: seatsCount === 0 ? '#94a3b8' : '#2563eb', cursor: seatsCount === 0 ? 'not-allowed' : 'pointer' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SIMULATED CREDIT PROCESSING FORM */}
        {currentStep === 2 && (
          <form onSubmit={handlePaymentProcessing}>
            <div style={{ ...ledgerBoxStyle, marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600' }}>
                <span style={{ color: '#475569' }}>Total Due:</span>
                <span style={{ color: '#16a34a' }}>${absoluteTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Card fields layout groups */}
            <div style={{ marginBottom: '14px' }}>
              <label style={fieldLabelStyle}>Card Number</label>
              <input
                type="text"
                maxLength="16"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                style={inputControlStyle}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={fieldLabelStyle}>Expiry Date</label>
                <input
                  type="text"
                  maxLength="5"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  style={inputControlStyle}
                  required
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>CVV Code</label>
                <input
                  type="password"
                  maxLength="3"
                  placeholder="***"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  style={inputControlStyle}
                  required
                />
              </div>
            </div>

            {/* Step 2 Actions Bar */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setCurrentStep(1)} style={btnSecondaryStyle} disabled={isAuthorizing}>
                Back
              </button>
              <button type="submit" style={{ ...btnPrimaryStyle, backgroundColor: isAuthorizing ? '#93c5fd' : '#2563eb' }} disabled={isAuthorizing}>
                {isAuthorizing ? "Authorizing Funds..." : `Pay $${absoluteTotal.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: TRANSACTIONAL CONFIRMATION SLIP RECEIPT */}
        {currentStep === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🎟️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#16a34a', fontWeight: '700' }}>Tickets Confirmed!</h3>

            <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              Your reservation pass for <strong>{movie.title}</strong> at <strong>{chosenShowtime}</strong> (Seats: <strong>{selectedSeats.map(s => `${s.rowLetter}${s.number}`).join(', ')}</strong>) has been successfully finalized.
            </p>

            <div style={{ ...ledgerBoxStyle, textAlign: 'left', marginBottom: '24px', borderStyle: 'dashed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Booking ID Reference Code:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>BK-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            <button type="button" onClick={onClose} style={{ ...btnPrimaryStyle, display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
              Return to Dashboard Viewport
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ================= ISOLATED UX SPECIFICATION STYLES =================
const overlayWrapperStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '16px'
};
const modalContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    boxSizing: 'border-box'
};
const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px'
};
const closeWindowBtnStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.75rem',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 0.5
};
const fieldLabelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
};
const timingPillSelectionStyle = {
    border: '1px solid #e2e8f0',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.1s ease'
};
const ledgerBoxStyle = {
    backgroundColor: '#f8fafc',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};
const ledgerRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '0.85rem',
    color: '#334155'
};
const ledgerFinalTotalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '700',
    fontSize: '1rem',
    borderTop: '1px dashed #cbd5e1',
    paddingTop: '10px',
    color: '#0f172a'
};
const inputControlStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc'
};
const btnPrimaryStyle = {
    flex: 1,
    backgroundColor: '#2563eb',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textAlign: 'center'
};
const btnSecondaryStyle = {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textAlign: 'center'
};