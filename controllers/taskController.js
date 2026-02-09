const userSchema = require('../models/userModel');
const taskSchema = require('../models/taskModel');
const helper = require('../helper/index');
const { default: mongoose } = require('mongoose');

exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        const userId = req.user.userId; // Get user ID from authenticated token

        // Validation
        if (!title) {
            return res.status(400).json(helper.response(400, false, "Title is required!"));
        }

        if (!dueDate) {
            return res.status(400).json(helper.response(400, false, "Due Date is required!"));
        }

        // Create new task
        const newTask = {
            user: userId,
            title: title.trim(),
            description: description ? description.trim() : '',
            dueDate: new Date(dueDate),
            priority: priority || 'Medium',
        };

        const task = new taskSchema(newTask);
        const savedTask = await task.save();

        if (savedTask) {
            return res.status(201).json(helper.response(201, true, "Task Created Successfully!", { task: savedTask }));
        }

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}

exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from authenticated token
        const { search, status, priority, sortBy, page = 1, limit = 10 } = req.query;

        // Convert page and limit to numbers
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter = { user: userId };

        // Search filter - search in title and description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter
        if (status) {
            if (!['Completed', 'Pending'].includes(status)) {
                return res.status(400).json(helper.response(400, false, "Invalid status! Use 'Completed' or 'Pending'"));
            }
            filter.status = status;
        }

        // Priority filter
        if (priority) {
            if (!['High', 'Medium', 'Low'].includes(priority)) {
                return res.status(400).json(helper.response(400, false, "Invalid priority! Use 'High', 'Medium', or 'Low'"));
            }
            filter.priority = priority;
        }

        // Build sort object
        let sortObject = { dueDate: 1 }; // Default: sort by due date ascending

        if (sortBy) {
            if (sortBy === 'dueDate') {
                sortObject = { dueDate: 1 };
            } else if (sortBy === 'dueDate-desc') {
                sortObject = { dueDate: -1 };
            } else if (sortBy === 'priority') {
                sortObject = { priority: 1 };
            } else if (sortBy === 'priority-desc') {
                sortObject = { priority: -1 };
            } else if (sortBy === 'createdAt') {
                sortObject = { createdAt: -1 };
            } else {
                return res.status(400).json(helper.response(400, false, "Invalid sortBy! Use 'dueDate', 'dueDate-desc', 'priority', 'priority-desc', or 'createdAt'"));
            }
        }

        // Get total count for pagination
        const totalCount = await taskSchema.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limitNum);

        // Fetch tasks with filters, sorting, and pagination
        const tasks = await taskSchema.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(limitNum);

        if (tasks.length === 0) {
            return res.status(200).json(helper.response(200, true, "No tasks found!", { 
                tasks: [], 
                pagination: {
                    currentPage: pageNum,
                    limit: limitNum,
                    totalItems: totalCount,
                    totalPages: totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }));
        }

        return res.status(200).json(helper.response(200, true, "Tasks retrieved successfully!", { 
            tasks: tasks,
            pagination: {
                currentPage: pageNum,
                limit: limitNum,
                totalItems: totalCount,
                totalPages: totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        }));
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        return res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId; // Get user ID from authenticated token
        const { title, description, dueDate, priority, status } = req.body;
        // Find the task by ID and ensure it belongs to the authenticated user
        const task = await taskSchema.findOne({ _id: taskId, user: userId });
        
        // if (!dueDate) {
        //     return res.status(400).json(helper.response(400, false, "Due Date is required!"));
        // }
        // task.dueDate = new Date(dueDate);
        if(dueDate){
            task.dueDate = new Date(dueDate);
        }
        if (!task) {
            return res.status(404).json(helper.response(404, false, "Task not found or you do not have permission to update it!"));
        }

        // Update fields if provided
        if (title) {
            task.title = title.trim();
        }
        if (description !== undefined) {
            task.description = description.trim();
        }
        
        if (priority) {
            if (!['High', 'Medium', 'Low'].includes(priority)) {
                return res.status(400).json(helper.response(400, false, "Invalid priority! Use 'High', 'Medium', or 'Low'"));
            }
            task.priority = priority;
        }
        if (status) {
            if (!['Completed', 'Pending'].includes(status)) {
                return res.status(400).json(helper.response(400, false, "Invalid status! Use 'Completed' or 'Pending'"));
            }
            task.status = status;
            task.completionDate = status === 'Completed' ? new Date() : null;
        }

        task.updatedAt = Date.now(); // Manually update updatedAt as Mongoose `timestamps` only update on save with new object

        const updatedTask = await task.save();

        if (updatedTask) {
            return res.status(200).json(helper.response(200, true, "Task Updated Successfully!", { task: updatedTask }));
        }

    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json(helper.response(500, false, "Something went wrong!"));
    }
}

exports.getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId; // From authenticated token

        if (!taskId) {
            return res
                .status(400)
                .json(helper.response(400, false, "Task ID is required!"));
        }

        // Find task by ID and user
        const task = await taskSchema.findOne({
            _id: taskId,
            user: userId
        });

        if (!task) {
            return res
                .status(404)
                .json(helper.response(404, false, "Task not found or you do not have permission to view it!"));
        }

        return res
            .status(200)
            .json(helper.response(200, true, "Task retrieved successfully!", { task }));

    } catch (error) {
        console.error("Error retrieving task by ID:", error);
        return res
            .status(500)
            .json(helper.response(500, false, "Something went wrong!"));
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const task = await taskSchema.findOneAndDelete({
            _id: taskId,
            user: userId,
        });

        if (!task) {
            return res
                .status(404)
                .json(helper.response(404, false, "Task not found or you do not have permission to delete it!"));
        }

        return res
            .status(200)
            .json(helper.response(200, true, "Task deleted successfully!"));
    } catch (error) {
        console.error("Error deleting task:", error);
        return res
            .status(500)
            .json(helper.response(500, false, "Something went wrong!"));
    }
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('userId - ', userId);
    const priorityDistribution = await taskSchema.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    console.log('priorityDistribution - ', priorityDistribution);
    const completionProgress = await taskSchema.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), 
        status: "Completed", 
        completionDate: { $exists: true } 
        } 
    },
      {
        $group: {
          _id: {
            year: { $year: "$completionDate" },
            month: { $month: "$completionDate" },
            day: { $dayOfMonth: "$completionDate" }
          },
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingDeadlines = await taskSchema.find({
      user: userId,
      dueDate: { $gte: today, $lte: nextWeek },
      status: { $ne: "Completed" }
    }).sort({ dueDate: 1 });

    return res.status(200).json(helper.response(
      200,
      true,
      "Dashboard data retrieved successfully",
       {
        priorityDistribution,
        completionProgress,
        upcomingDeadlines
      }
    ));

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ status: false, message: "Something went wrong!" });
  }
};

