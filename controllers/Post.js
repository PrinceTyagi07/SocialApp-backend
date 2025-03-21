const User = require("../models/UserModel");
const Post = require("../models/Post");
const mongoose = require("mongoose");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();
//Function to create post
exports.createPost = async (req, res) => {
  try {
    // get user id
    console.log(req.body)
    const userId = req.user.id;
    // get post data
    let { description, status } = req.body;
    const postdata = req.files.postdata
    //video --> chnage to --> postdata
    //validate
    if (!description || !postdata) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }
    // Check if the user is a Visitor
    const creatorDetails = await User.findById(userId);
    if (!creatorDetails || creatorDetails.accountType !== "Visitor") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only Visitors can create posts",
      });
    }


    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      postdata,
      process.env.FOLDER_NAME
    );
    console.log(uploadDetails)
    // console.log("creater details" creatorDetails._id)

    const newPost = await Post.create({
      description,
      postUrl: uploadDetails.secure_url,
      status: status,
      creatorId: creatorDetails._id,
    });

    //   Add the new post to schema
    await User.findByIdAndUpdate(
      {
        _id: creatorDetails._id,
      },
      {
        $push: {
          posts: newPost._id,
        },
      },
      { new: true }
    );
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

//Edit post
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const updates = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        post[key] = updates[key];
      }
    }
    if (req.files && req.files.postdata !== undefined) {
      const postdata = req.files.postdata
      const uploadDetails = await uploadImageToCloudinary(
        postdata,
        process.env.FOLDER_NAME
      )
      Post.postdataUrl = uploadDetails.secure_url

    }

    await post.save();
    const updatedPost = await Post.findOne({
      _id: postId,
    })
      .populate({
        path: "creatorId",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("description")
      .populate("username")
      .populate({
        path: "CommentsAndLike",
        populate: {
          path: "user",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while editing post",
      error: error.message,
    });
  }
};

// Get Post List
exports.getAllPosts = async (req, res) => {
  try {
     const PostCount = await Post.countDocuments();
    const allPosts = await Post.find(
      { status: "Published" },
      {
        description: true,
        postUrl:true,
        creator: true,
        CommentsAndLike: true,
      }
    )
      .populate("creatorId")
      // .populate("username")
      .exec();

    return res.status(200).json({
      success: true,
      PostCount: PostCount,
      data: allPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Post Data`,
      error: error.message,
    });
  }
};
// get recent posts
exports.getRecentPosts = async (req, res) => { 
  try {
    // Get the current date and subtract 20 days
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    // Count the number of recent posts
    const postCount = await Post.countDocuments({
      createdAt: { $gte: twentyDaysAgo },
      status: "Published",
    });

    // Fetch posts created in the last 20 days with "Published" status
    const recentPosts = await Post.find(
      { 
        createdAt: { $gte: twentyDaysAgo }, 
        status: "Published"
      },
      {
        description: true,
        postUrl: true,
        creator: true,
        CommentsAndLike: true,
      }
    )
    .populate("creatorId")
    .populate("CommentsAndLike")
    .exec();

    return res.status(200).json({
      success: true,
      PostCount: postCount,
      data: recentPosts,
    });

  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return res.status(500).json({
      success: false,
      message: "Can't Fetch Recent Posts",
      error: error.message,
    });
  }
};

exports.getPostdetails = async (req, res) => {
  try {
    const { postId } = req.body;
    // console.log(postId);
    const postDetails = await Post.findOne({ _id: postId })
      .populate({
        path: "creatorId",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("CommentsAndLike")
      .exec();

    if (!postDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find post with id: ${postId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        postDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a list of Post for a given User
exports.getCreatorPosts = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body

    const Creator = req.query.Creator; // Access from query parameter
    // Find all posts belonging to the creator
    const CreatorPosts = await User.findById(
      Creator,
    )
    .populate({
      path: "posts",
      populate: {
        path: "CommentsAndLike",
      }
    })
    .populate("additionalDetails")
    .exec();
    


    // Return the Posts
    res.status(200).json({
      success: true,
      data: CreatorPosts,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve Creator post",
      error: error.message,
    });
  }
};

// Delete the Post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.body;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    // remove creator from the post
    const creator = post.creatorId;

    await User.findByIdAndUpdate(creator, {
      $pull: { posts: postId },
    },{new:true});

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
