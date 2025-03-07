const bcrypt = require("bcrypt");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const User = require("../models/UserModel");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
// const { options } = require("../routes/user");
require("dotenv").config();

//send OTP
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request ki body
    const { email } = req.body;
    //check if already exist
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    // otp generate
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log("OTP Generated", otp);

    //Check OTP should be Unique worst code find library that always give unique otp
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    //save otp in database
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP send successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      seccess: false,
      message: "Message sending problem Server Error",
    });
  }
};

//signup route handler
exports.signup = async (req, res) => {
  try {
    // Get data
    const {
      firstName,
      lastName,
      // username,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      aadhaarNumber,
      otp,
    } = req.body;

    // Check if all required fields are provided
    if (
      !firstName ||
      !lastName ||
      // !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !aadhaarNumber ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { aadhaarNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already exists.",
        });
      }
      if (existingUser.aadhaarNumber === aadhaarNumber) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar number already exists.",
        });
      }
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match. Please try again.",
      });
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      contactNumber,
      aadhaarNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
     // Handle duplicate key error (e.g., duplicate username or email)
     if (error.code === 11000) {
      const key = Object.keys(error.keyPattern)[0]; // Get the duplicate key (e.g., "username" or "email")
      return res.status(400).json({
        success: false,
        message: `${key} already exists.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again later",
    });
  }
};

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email/username and password from request body
    const { emailOrUsername, password } = req.body;

    // Check if email/username or password is missing
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/username and password",
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).populate("additionalDetails");

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up to continue.",
      });
    }

    // Compare password
    if (await bcrypt.compare(password, user.password)) {
      // Generate JWT token
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Save token to user document
      user.token = token;
      user.password = undefined;

      // Set cookie and return response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("cookie", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User login successful",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

// function to get all users

exports.countAllUsers = async (req, res) => {
  try {
    // Count the total number of users in the database
    const userCount = await User.countDocuments();

    // Send the count as a response
    res.status(200).json({
      message: "Total user count",
      count: userCount,
    });
  } catch (error) {
    console.error("Error counting users:", error);
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

// Count users created in the last 30 days
exports.countUsersLast30Days = async (req, res) => {
  try {
    // Get the current date and subtract 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count the number of users created in the last 30 days
    const userCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }, // Filter users created after 30 days ago
    });

    // Send the count as a response
    res.status(200).json({
      message: "Total users created in the last 30 days",
      count: userCount,
    });
  } catch (error) {
    console.error("Error counting users in the last 30 days:", error);
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

//  logout controller
exports.logout = async (req, res) => {
  try {
    // Clear the cookie that stores the authentication token
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};


exports.UserSearch = async (req, res) => {
  const searchTerm = req.query.search || '';
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page

  try {
    // MongoDB query for case-insensitive partial match on username
    const users = await User.find(
      { username: { $regex: searchTerm, $options: "i" } }, // Case-insensitive partial match
      { username: 1, firstName: 1, lastName: 1, image: 1 } // Project only necessary fields
    )
      .skip((page - 1) * limit) // Pagination: skip previous pages
      .limit(limit); // Limit results per page

    // Count total matching users for pagination metadata
    const totalUsers = await User.countDocuments({
      username: { $regex: searchTerm, $options: "i" },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    // Return response with pagination metadata
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users from MongoDB:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
