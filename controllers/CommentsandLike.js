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
      like: false, // Default false since it's a comment
      post: postId,
    });

    // Add the comment to the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { CommentsAndLike: newComment._id } },
      { new: true } // Added new: true here
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
      updatedPost, // Added updatedPost to response
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

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    // Check if post exists
    const postDetails = await Post.findById(postId);
    if (!postDetails) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user has already liked the post
    const existingLike = await CommentsAndLike.findOne({
      user: userId,
      post: postId,
      like: true, // Corrected to boolean true
    });

    if (existingLike) {
      // Unlike the post - Remove from CommentsAndLike collection
      await CommentsAndLike.findByIdAndDelete(existingLike._id);

      // Remove like from Post schema array
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { CommentsAndLike: existingLike._id } },
        { new: true } // Added new: true here
      );
    } else {
      // Like the post - Add to CommentsAndLike collection
      const newLike = await CommentsAndLike.create({
        like: true, // Corrected to boolean true
        user: userId,
        post: postId,
      });

      // Add like reference to Post schema array
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $push: { CommentsAndLike: newLike._id } },
        { new: true } // Added new: true here
      );
    }

    // Get updated like count efficiently
    const likeCount = await CommentsAndLike.countDocuments({
      post: postId,
      like: true, // Corrected to boolean true
    });

    return res.status(200).json({
      success: true,
      message: existingLike
        ? "Post unliked successfully"
        : "Post liked successfully",
        likeCount,
        existingLike
      //updatedPost, // can add updatedPost to response if needed.
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to like/unlike the post",
      error: error.message,
    });
  }
};

// API to get all comments for a specific post
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await CommentsAndLike.find({
      post: postId,
      comment: { $ne: null },
    })
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