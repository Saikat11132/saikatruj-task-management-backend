const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const authRoutes = require('./authRoute');

// const notificationController = require('../controllers/notificationController');
// //user Api
router.use('/auth', authRoutes);
router

module.exports = router;