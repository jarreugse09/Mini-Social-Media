const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    username: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
