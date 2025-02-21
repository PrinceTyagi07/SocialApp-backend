const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
  },
  CommentsAndLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommentsAndLike",
    },
  ],
  thumbnail: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", postSchema);
