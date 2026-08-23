import React, { useState } from 'react';
import axios from 'axios'; // Injecting network transaction module
/**
 * TicketBookingModal - Drop-in Layer for Movie Dashboard
 *
 * @param {Object} movie - Pass the selected movie dictionary down from your dataset state.
 * @param {Function} onClose - State setter callback that resets selected state values to null.
 */
export default function TicketBookingModal({ movie, onClose }) {
  // Navigation Flow State Machine (1 = Selection, 2 = Checkout Form, 3 = Confirmation Slip Receipt)
  const [currentStep, setCurrentStep] = useState(1);
  const [chosenShowtime, setChosenShowtime] = useState(movie?.showtimes?.[0] || "");
  const [seatsCount, setSeatsCount] = useState(1);

  // Form Field Trackers
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

   // Asynchronous API Pipeline Communication State Trackers
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [transactionError, setTransactionError] = useState(null);
    const [serverReceiptData, setServerReceiptData] = useState(null);
  if (!movie) return null;

  // Real-time Pricing Logic Operations
  const ticketBaseRate = movie.ticketPrice || 14.50; // Fallback rate if omitted from database
  const billingSubtotal = ticketBaseRate * seatsCount;
  const convenienceFee = 1.50;
  const absoluteTotal = billingSubtotal + convenienceFee;

  // Form validation submission handler
  const handlePaymentProcessing = (e) => {
   e.preventDefault();
       setTransactionError(null);
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert("Please populate all transactional verification fields.");
      return;
    }

    setIsAuthorizing(true);
 // Structural JSON payload layout mapping schema configurations out
    const bookingPayload = {
      movieId: movie.id,
      movieTitle: movie.title,
      selectedShowtime: chosenShowtime,
      ticketsPurchased: seatsCount,
      financialSummary: {
        subtotal: billingSubtotal,
        fees: convenienceFee,
        totalCharged: absoluteTotal
      },
      paymentDetailsMock: {
        // Redacting credit digits for PCI Data Security Compliance standards
        maskedCard: `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}`,
        expiryDate: cardExpiry
      }
    };

    try {
      // Connect target endpoint routing base matching either local json-server or prod configurations
      const API_BASE = import.meta.env?.VITE_APP_API_BASE_URL || 'http://localhost:5000';
      const endpointUri = `${API_BASE}/bookings`;

      const response = await axios.post(endpointUri, bookingPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Capture operational values on standard HTTP 200/201 response metrics
      setServerReceiptData(response.data);
      setCurrentStep(3); // Advance state direct to verified transaction layout block
    } catch (error) {
      console.error("Critical error encountered tracking database commitment stream:", error);

      // Extract specific endpoint error warnings if available or supply general failure fallback text
      const failureReason = error.response?.data?.message || "Remote server processing connection timeout failure. Database rejected commit state.";
      setTransactionError(failureReason);
    } finally {
      setIsAuthorizing(false);
    }

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

            {/* Volume Stepper Core Controls */}
            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabelStyle}>Number of Tickets</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                  style={stepperBtnStyle}
                >-</button>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', width: '24px', textAlign: 'center' }}>{seatsCount}</span>
                <button
                  type="button"
                  onClick={() => setSeatsCount(seatsCount + 1)}
                  style={stepperBtnStyle}
                >+</button>
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
              <button type="button" onClick={() => setCurrentStep(2)} style={btnPrimaryStyle}>Proceed to Checkout</button>
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
              Your reservation pass for <strong>{movie.title}</strong> at <strong>{chosenShowtime}</strong> ({seatsCount} allocation seat passes) has been successfully finalized.
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
const overlayWrapperStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '16px' };
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
const stepperBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.15rem',
    color: '#334155'
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