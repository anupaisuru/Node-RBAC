const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  return res.json({ message: "welcome admin" });
});

router.get("/manager", verifyToken, authorizeRoles("manager","admin"), (req, res) => {
  return res.json({ message: "welcome manager" });
});

router.get("/user", verifyToken, authorizeRoles("user","admin","manager"), (req, res) => {
  return res.json({ message: "welcome user" });
});

module.exports = router;
