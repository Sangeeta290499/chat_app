//user ka schema banainge

import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    username:
    {
        type:String, 
        required:true, 
        unique:true
    },
    email:
    {
        type: String,
        required:true,
        unique:true,
    },
    password:
    {
        type:String,
        required:true,
    },
    
    profilePicture:
    {
        type:String,
        default:'',
    },
    bio:
    {
        type:String,
        enum:['male', 'female'],
    },
    followers:
    [
        { //other user ki id store karenge taki baaki ka details hum  nikaal paye
            type:mongoose.Schema.Types.ObjectId, 
            ref:'User'
        }
    ],
    following:
    [
        { //other user ki id store karenge taki baaki ka details hum  nikaal paye
            type:mongoose.Schema.Types.ObjectId, 
            ref:'User'
        }
    ],
    posts:
    [
        {
            type:mongoose.Schema.Types.ObjectId, 
            ref:'Post'
        }
    ],
    bookmarks:
    [
        {
            type:mongoose.Schema.Types.ObjectId, 
            ref:'Post'
        }
    ]
}, {timestamps:true});
export default User = mongoose.model('User', userSchema);