const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: [3, "Username must be at least 3 characters long."], // Minimum length
      maxlength: [20, "Username cannot exceed 20 characters."], // Maximum length
      validate: {
        validator: function (v) {
          // Allow only alphanumeric characters, underscores, and dots
          return /^[a-zA-Z0-9_.]+$/.test(v);
        },
        message: "Username can only contain letters, numbers, underscores, and dots.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    aadhaarNumber: {
      type: String,
      required: true,
      length: 12,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v);
        },
        message: "Aadhaar number must be 12 digits long.",
      },
    },
    // role
    accountType: {
      type: String,
      enum: ["Admin", "Visitor"],
      required: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    // content
    image: {
      type: String,
      required: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    // Followers and Following
    followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to other users
      index: true, // Add indexing for faster queries
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to other users
      index: true, // Add indexing for faster queries
    },
  ],
},
  { timestamps: true }
); // Enabling timestamp

const User = mongoose.model("User", UserSchema);
module.exports = User;