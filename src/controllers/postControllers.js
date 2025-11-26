const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// GET all posts (with pagination and filtering)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("user", "username role")
      .populate("comments.user", "username role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "username role")
      .populate("comments.user", "username role");

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE post
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const userId = req.user.id;
    const username = req.user.username;
    
    // Use uploaded file if available, otherwise use imageUrl from request body (database link)
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const newPost = await Post.create({
      title,
      description,
      username,
      user: userId,
      image,
      likes: 0,
      dislikes: 0,
      comments: [],
    });

    const populated = await newPost.populate("user", "username role");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error.message });
  }
});

// LIKE post
router.put("/:postId/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DISLIKE post
router.put("/:postId/dislike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.dislikes += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD comment to post
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = {
      user: req.user.id,
      username: req.user.username,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    await post.populate("comments.user", "username role");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE comment
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: "Post not found" });

      const comment = post.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      // Only allow deletion by comment author or post author
      if (
        req.user.id !== comment.user.toString() &&
        req.user.id !== post.user.toString()
      ) {
        return res.status(403).json({ error: "Not authorized" });
      }

      comment.deleteOne();
      await post.save();

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE post
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Only allow deletion by post author or admin
    if (req.user.id !== post.user.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
