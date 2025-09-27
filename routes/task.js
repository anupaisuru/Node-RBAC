const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require("../controllers/task");

router.post("/create-task", verifyToken, authorizeRoles("admin"), createTask);
router.get("/get-tasks", verifyToken,authorizeRoles("user","admin"), getTasks);
router.get("/get-task/:id", verifyToken,authorizeRoles("user","admin"), getTaskById);
router.put("/update-task/:id", verifyToken,authorizeRoles("admin"), updateTask);
router.delete("/delete-task/:id", verifyToken, authorizeRoles("admin"), deleteTask);

module.exports = router;
