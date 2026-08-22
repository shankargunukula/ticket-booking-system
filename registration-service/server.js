// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. Enable Global Middleware Configurations
app.use(express.json());
app.use(cors()); // Instructs browsers that external origins (like React) can make API calls

// 2. High-Precision Absolute Request Timeout Interceptor
app.use((req, res, next) => {
  // Establish an absolute hard-stop timer execution clock (5 seconds)
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`🚨 [TIMEOUT ALERT] - Request to ${req.originalUrl} killed after 5000ms`);
      res.status(408).json({
        error: "Backend operation timed out.",
        details: "The server failed to receive a timely response from the underlying directory infrastructure."
      });
    }
  }, 5000);

  // Clean up the timer immediately if the request finishes or closes normally early
  res.on('finish', () => clearTimeout(timeoutId));
  res.on('close', () => clearTimeout(timeoutId));

  next();
});

// 3. Attach Modular API Version Routes
app.use('/api/v1/auth', authRoutes);

// 4. Catch-all route fallback handler for invalid endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Resource endpoint not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Authentication Service running on port ${PORT}`);
  console.log(`===============================================`);
});
