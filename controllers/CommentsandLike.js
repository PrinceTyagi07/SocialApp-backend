const mongoose = require("mongoose");
const CommentsAndLike = require("../models/CommentsAndLike");
const Post = require("../models/Post");

// API to create a new comment
exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment, postId } = req.body;

    const postDetails = await Post.findById(postId);
    if (!postDetails) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create a new comment
    const newComment = await CommentsAndLike.create({
      comment,
      user: userId,
      post: postId,
    });

    // Add the comment to the post
    await Post.findByIdAndUpdate(postId, {
      $push: { CommentsAndLike: newComment._id },
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// API to toggle likes for a post
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    const postDetails = await Post.findById(postId);
    if (!postDetails) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user has already liked the post
    const alreadyLiked = await CommentsAndLike.findOne({ user: userId, post: postId, like: true });

    if (alreadyLiked) {
      // Unlike the post
      await CommentsAndLike.findByIdAndDelete(alreadyLiked._id);
      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
      });
    } else {
      // Like the post
      const newLike = await CommentsAndLike.create({
        like: true,
        user: userId,
        post: postId,
      });

      await Post.findByIdAndUpdate(postId, {
        $push: { CommentsAndLike: newLike._id },
      });

      return res.status(201).json({
        success: true,
        message: "Post liked successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to like/unlike the post",
      error: error.message,
    });
  }
};

// Get all comments for a post
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await CommentsAndLike.find({ post: postId, comment: { $exists: true } })
      .populate("user", "firstName lastName email image")
      .exec();

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve comments",
      error: error.message,
    });
  }
};
