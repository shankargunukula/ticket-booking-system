const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enable Global Middleware Configurations
app.use(express.json());
app.use(cors()); // Instructs browsers that external origins (like React on port 3000) can make API calls

// Attach Modular API Version Routes
app.use('/api/auth', authRoutes);

// Catch-all route fallback handler for invalid endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Resource endpoint not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Authentication Service running on port ${PORT}`);
  console.log(`===============================================`);
});
