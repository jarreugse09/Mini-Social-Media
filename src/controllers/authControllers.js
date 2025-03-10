const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async(req, res) => {
    try {
        console.log(req.body);
        const { username, password, role } = req.body; 
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword, role });
        console.log(newUser);
        res.status(201).json({ message: `User registered with username ${username}` });
    } catch (err) {
        res.status(500).json({ message: `Something went wrong.` });
    }
};

const login = async(req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: `User with username ${username} not found.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({ message: `Invalid credentials` });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: `Something went wrong.` });
    }
};

// Admin can update roles
const updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Only admin can assign roles." });
        }

        const { username, newRole } = req.body;
        if (!["poster", "commenter", "reactor"].includes(newRole)) {
            return res.status(400).json({ message: "Invalid role assignment." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: `User with username ${username} not found.` });
        }

        user.role = newRole;
        await user.save();

        res.status(200).json({ message: `User ${username} is now assigned as ${newRole}` });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong." });
    }
};

module.exports = {
    register,
    login,
    updateUserRole
};

const getCurrentUser = async (req, res) => {
    res.json({ username: req.user.username, role: req.user.role });
};

module.exports = {
    register,
    login,
    getCurrentUser,
};