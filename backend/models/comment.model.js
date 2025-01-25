import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    comment:
    {
        type:String, 
        required:true
    },
    author:
    {
        type:mongoose.Schema.Types.ObjectId, 
        ref:'User', 
        required:true
    },
    Post:
    {
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Post', 
        required:true
    },
});
export default commentSchema = mongoose.model('Comment', commentSchema);