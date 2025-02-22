// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendOTP,
  changePassword,
  countAllUsers,
  countUsersLast30Days,
  logout,
  UserSearch
} = require("../controllers/Auth")

// Import the required controllers and middleware functions
const {
    
  followUser,
  unfollowUser,
  getFollowersAndFollowing,
} = require("../controllers/Follow"); // Import new controller functions

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/Resetpassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************
// dummy route
router.get("/test", async (req, res) => {
  return res.json({
		success: true,
		message: "hey backend is working , after live 💕 💕",
	});

})
// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)
//Route for logout
router.post("/logout", logout)
// serch box 
router.get("/UserSearch",auth, UserSearch)
// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// count all user 
router.get("/countusers", countAllUsers)
router.get("/count30users", countUsersLast30Days)
// ********************************************************************************************************
//                                      Follow/Unfollow routes
// ********************************************************************************************************
// Route for following a user
router.post("/follow/:userId", auth, followUser); // :userId is the ID of the user to follow

// Route for unfollowing a user
router.post("/unfollow/:userId", auth, unfollowUser); // :userId is the ID of the user to unfollow

// Route for getting followers and following lists
router.get("/followers-following/:userId", auth, getFollowersAndFollowing); // :userId is the ID of the user to fetch data for



// Export the router for use in the main application
module.exports = router