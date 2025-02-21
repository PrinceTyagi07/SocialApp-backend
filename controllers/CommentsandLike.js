const mongoose = require("mongoose");
const CommentsAndLike = require("../models/CommentsAndLike");
const Post = require("../models/Post");

exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment, like, postId } = req.body;
    const postDetails = await Post.findOne({ _id: postId });

    // Check if the user has already reviewed the course
    const alreadyCommented = await CommentsAndLike.findOne({
      user: userId,
      post: postId,
    });

    if (alreadyCommented) {
      return res.status(403).json({
        success: false,
        message: "Post already Commented by user",
      });
    }

    // Create a new like and comment
    const commentLike = await CommentsAndLike.create({
      comment,
      like,
      user: userId,
    });

    // Add the comment and like to the post
    await Post.findByIdAndUpdate(postId, {
      $push: {
        CommentsAndLike: commentLike,
      },
    });
    await postDetails.save();

    return res.status(201).json({
      success: true,
      message: "Like and comment created successfully",
      commentLike,
    });
  } catch (error) {}
};

// Get all Comments and Likes
exports.getAllCommentsLike = async (req, res) => {
    try {
      const allComments = await CommentsAndLike.find({})
        // .sort({ rating: "desc" })
        .populate({
          path: "user",
          select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
        })
        .exec()
  
      res.status(200).json({
        success: true,
        data: allComments,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the Comments and Like for the course",
        error: error.message,
      })
    }
  }
  
