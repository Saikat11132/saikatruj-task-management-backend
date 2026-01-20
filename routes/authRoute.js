const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authMiddleware.isAuth, userController.getProfile);

module.exports = router;