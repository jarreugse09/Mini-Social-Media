const express = require("express");
const { register, login, getCurrentUser } = require("../controllers/authControllers");
const verifyToken = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username role");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;