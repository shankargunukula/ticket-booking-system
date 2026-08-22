const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { RegisterSchema } = require('../validation/auth');

// POST handler mapping for user registrations
router.post('/register', validateBody(RegisterSchema), authController.registerUser);

module.exports = router;
