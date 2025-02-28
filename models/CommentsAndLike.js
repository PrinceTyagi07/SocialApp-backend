const mongoose = require("mongoose");

const CommentsAndLikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    post:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
   
    like: {
        type: Boolean, // Boolean type for true/false
        default: false,
    },
    comment: {
        type: String,
        // required:true,
    }
});

module.exports = mongoose.model("CommentsAndLike", CommentsAndLikeSchema);