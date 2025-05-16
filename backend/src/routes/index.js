const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers/healthController');

// Health check route
router.get('/health', healthCheck);

// TODO: Add more routes here
// Example:
// router.use('/auth', require('./auth'));
// router.use('/messages', require('./messages'));

module.exports = router; 