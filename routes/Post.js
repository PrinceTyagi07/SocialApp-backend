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
} = require("../controllers/Post")

// Comment Controllers Import
const {
  createComment,
  getAllCommentsLike,
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
router.post("/createComment", auth, isVisitor, createComment)
router.get("/getAllCommentsLike", getAllCommentsLike)

module.exports = router
