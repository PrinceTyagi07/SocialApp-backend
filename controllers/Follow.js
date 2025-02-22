const User = require("../models/UserModel");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user to follow
    const currentUserId = req.user.id; // ID of the logged-in user

    // Prevent users from following themselves
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    // Add the user to the current user's "following" list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId }, // Use $addToSet to avoid duplicates
    });

    // Add the current user to the target user's "followers" list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId }, // Use $addToSet to avoid duplicates
    });

    res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // ID of the user to unfollow
    const currentUserId = req.user.id; // ID of the logged-in user

    // Prevent users from unfollowing themselves
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself.",
      });
    }

    // Remove the user from the current user's "following" list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });

    // Remove the current user from the target user's "followers" list
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
};

// Get followers and following lists
exports.getFollowersAndFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("followers", "username firstName lastName image") // Populate followers with selected fields
      .populate("following", "username firstName lastName image"); // Populate following with selected fields

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch followers and following",
    });
  }
};