const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
    });
    res
      .status(201)
      .json({ message: `User registered with username ${newUser.username}` });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: `Something went wrong.` });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ message: `User with username ${username} not found.` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: `Invalid credentials` });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: `Something went wrong.` });
  }
};

// Admin can update roles
const updateUserRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admin can assign roles." });
    }

    const { username, newRole } = req.body;
    const allowed = ["admin", "poster", "commenter", "reactor", "user"];
    if (!allowed.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role assignment." });
    }

    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ message: `User with username ${username} not found.` });

    user.role = newRole;
    await user.save();

    res
      .status(200)
      .json({ message: `User ${username} is now assigned as ${newRole}` });
  } catch (err) {
    console.error("updateUserRole error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user.id).select("username role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  updateUserRole,
  getCurrentUser,
};
