// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createPost,
  getAllPosts,
  getPostdetails,
  editPost,
  getCreatorPosts,
  deletePost,
  getRecentPosts
} = require("../controllers/Post")

// Comment Controllers Import
const {
  createComment,
  toggleLike,
  getCommentsForPost,
  getAllCommentsLike,
  getTotalComments
  
} = require("../controllers/CommentsandLike")

// Importing Middlewares
const { auth, isVisitor, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Post routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createPost", auth,createPost)
// Edit Course routes
router.post("/editPost", auth, isVisitor, editPost)
// Get all Courses Under a Specific Instructor
router.get("/getCreatorPosts", auth, isVisitor, getCreatorPosts)
// Get all Published Courses
router.get("/getAllPosts", getAllPosts)
// Get Details for a Specific Courses
router.get("/getPostdetails", getPostdetails)
router.get("/getRecentPosts", getRecentPosts)
// Delete a Course
router.delete("/deletePost", deletePost)

// ********************************************************************************************************
//                                      routes (Only by Admin)
// ********************************************************************************************************
// Only be Created by Admin
// TODO: Put IsAdmin Middleware here
// router.post("/createCategory", auth, isAdmin, createCategory)


// ********************************************************************************************************
//                                      Comment And Like
// ********************************************************************************************************
// Create a comment on a post
router.post("/createComment", auth, isVisitor, createComment);

// Toggle like/unlike a post
router.post("/toggleLike", auth, isVisitor, toggleLike);

// Get all comments for a specific post
router.get("/:postId/comments", getCommentsForPost);
router.get("/getAllCommentsLike/:id", getAllCommentsLike)
router.get("/getTotalComments",getTotalComments )

module.exports = router
