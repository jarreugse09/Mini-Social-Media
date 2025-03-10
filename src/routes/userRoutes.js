const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const User = require("../models/userModel");

const router = express.Router();

// ✅ Get all users (Admin Only)
router.get("/", verifyToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
        const users = await User.find({}, "username role");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// ✅ Admin can update user roles
router.put("/assign-role", verifyToken, authorizeRoles(["admin"]), async (req, res) => {
    const { username, role } = req.body;
    const allowedRoles = ["admin", "poster", "commenter", "reactor", "user"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role assignment" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role;
        await user.save();

        res.json({ message: `Role updated: ${username} is now a ${role}` });
    } catch (error) {
        res.status(500).json({ message: "Failed to update role" });
    }
});

module.exports = router;
