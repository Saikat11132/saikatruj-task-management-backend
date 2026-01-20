const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/', authMiddleware.isAuth, taskController.createTask);
router.get('/', authMiddleware.isAuth, taskController.getTasks);
router.put('/:taskId', authMiddleware.isAuth, taskController.updateTask);
router.get('/:taskId', authMiddleware.isAuth, taskController.getTaskById);
router.delete('/:taskId', authMiddleware.isAuth, taskController.deleteTask);


module.exports = router;