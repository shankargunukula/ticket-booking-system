import React from 'react';

export default function ToolErrorView({ error }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #ef4444',
      background: '#fef2f2',
      borderRadius: '12px',
      padding: '14px',
      width: '85%'
    }}>
      <p style={{ fontSize: '12px', color: '#991b1b', margin: '6px 0 0 0', lineHeight: '1.4' }}>
        {error || "An unexpected issue occurred while loading showtime availability indexes."}
      </p>
    </div>
  );
}
