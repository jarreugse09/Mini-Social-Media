const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const POSTS_FILE = path.join(__dirname, "../data/posts.json");

function readPosts() {
    if (!fs.existsSync(POSTS_FILE)) return [];
    const data = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(data || "[]");
}

function savePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

router.post("/", authMiddleware, (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;
        const username = req.user.username;

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

router.get("/", (req, res) => {
    try {
        const posts = readPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:postId/like", (req, res) => {
    try {
        let posts = readPosts();
        const post = posts.find(p => p.id === req.params.postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        post.likes += 1;
        savePosts(posts);
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:postId/dislike", (req, res) => {
    try {
        let posts = readPosts();
        const post = posts.find(p => p.id === req.params.postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        post.dislikes += 1;
        savePosts(posts);
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
