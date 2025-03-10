const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const POSTS_FILE = path.join(__dirname, "../data/posts.json");

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Helper functions to read and write posts
function readPosts() {
    if (!fs.existsSync(POSTS_FILE)) return [];
    const data = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(data || "[]");
}

function savePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Create Post Route
router.post("/", authMiddleware, upload.single("image"), (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;
        const username = req.user.username;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        let posts = readPosts();
        const newPost = {
            id: Date.now().toString(),
            title,
            description,
            username,
            user: userId,
            image,
            likes: 0,
            dislikes: 0,
            comments: [],
        };

        posts.push(newPost);
        savePosts(posts);
        res.status(201).json(newPost);
    } catch (error) {
        console.error("🔥 Error creating post:", error);
        res.status(500).json({ error: error.message });
    }
});

// Serve Uploaded Images
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
