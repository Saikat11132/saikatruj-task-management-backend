const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const authRoutes = require('./authRoute');
const taskRoute = require('./taskRoute');
const taskController = require('../controllers/taskController');
// const notificationController = require('../controllers/notificationController');
// //user Api
router.use('/auth', authRoutes);
router.use('/tasks', taskRoute);

router.get('/dashboard-data', authMiddleware.isAuth, taskController.getDashboardData);

module.exports = router;