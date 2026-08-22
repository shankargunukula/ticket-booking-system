// src/main.tsx
import './frontend-tracing'; // 🚀 MUST BE FIRST: Hooks the browser network interception layer early

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Ensure matching extensions match your project standard
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
