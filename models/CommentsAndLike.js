const mongoose = require("mongoose");

const CommentsAndLikeSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    like:{
        type:String,
        // required:true,
    },
    comment:{
        type:String,
        // required:true,
    }
});

module.exports = mongoose.model("CommentsAndLike",CommentsAndLikeSchema);