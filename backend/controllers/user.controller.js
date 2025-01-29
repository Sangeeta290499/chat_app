//here we will write registration things
import { User } from "../models/user.model.js";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

//creating register logic
export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    const user = await User.findOne({ email }); //here we will check user already exist or not
    if (user) {
      return res.status(401).json({
        message: "Try with different email id",
        success: false,
      });
    }
    const hashedPassword = await bycrypt.hash(password, 10); //here we will save our password in hashed value
    await User.create({
      username,
      password: hashedPassword,
      email,
    });
    return res.status(201).json({
      message: "Acccount created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//creating login logic
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something  is missing, please check!",
        success: false,
      });
    }
    let user = await User.findOne({email}); //here we will check user already exist or not
    if(!user){  //if user does not exist
        return res.status(401).json({
            message:"Incorrect email or password.",
            success:false,
        });
    }
    const isPasswordMatch = await bycrypt.compare(password, user.password); // if user exist but enter wrong password 
    if(!isPasswordMatch){
        return res.status(401).json({
            message:"Incorrect email or password.",
            success:false,
        });
    }
    //frontend me save krne k liye creating user object
    user = {
        _id:user._id,
        username:user.username,
        email:user.email,
        profilePicture:user.profilePicture,
        bio:user.bio,
        followers:user.followers,
        folowing:user.following,
        posts:user.posts

    }
    // token is generated ,it will tell whether user is authenticated or not
    const token = await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1d'});
    // after generating we will store token into cookie
    return res.cookie('token', token, {httpOnly:true, sameSte:'strict', maxAge:1*24*60*60*1000}).json({
        message:`Welcome back ${user.username}`,  //while  login we return user ,so that we can save in frontend
        success:true,
        user
    });
  } catch (error) {
    console.log(error);
  }
};

//creating logout logic
export const logout = async (_, res) => {
  try {
      // Clear the authentication token if stored in cookies
      res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });

      // Send a successful response with the correct status code
      return res.status(200).json({
          message: "Logged out successfully.",
          success: true,
      });
    }catch(error){
        console.log(error);
    }
};

//creating getProfile logic
export const getProfile = async (req, res) => {
    try{
        const userId = req.params.id;
        let user = await User.findById(userId).select('-password');
        return res.status(200).json({
            user,
            success:true
        });
    }catch(error){
      console.log(error);
    }
}

//creating editProfile logic
export const editProfile = async (req, res) =>{
  try{
    const userId = req.id;
    const {bio, gender} = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if(profilePicture){
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    //finding the user before editing
    const user = await User.findById(userId);
    if(!user){
      return res.status(401).json({
        message:"User not found.",
        success:false
      });
    }
    if(bio) user.bio = bio;
    if(gender) user.gender = gender;
    if(profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(201).json({
      message:"Profile Updated.",
      success:true,
      user,
    });

  }catch(error){
    console.log(error);
  }
}

//creating suggested user
export const getSuggestedUsers = async (req, res) => {
  try{
    const suggestedUsers = await User.find({_id:{$ne:req.id}}).selcect("-password");
    if(!suggestedUsers){
      return res.status(400).json({
        message:"Currently do not have any users",
      })
    } ;
    return res.status(200).json({
      success:true,
      users:suggestedUsers
    })
  }catch(error){
    console.log(error);
  }
};

//creating follower and following
export const followOrUnfollow = async (req, res) => {
  try{
    const followKrneWali = req.id; // Sangi
    const jiskoFollowKarungi = req.params.id; // Rahul
    if(followKrneWali === jiskoFollowKarungi){
      return res.status(400).json({
        message:"You cannot follow/unfollow youself",
        success: false
      });
    }

    const user = await User.findById(followKrneWali);
    const targetUser = await User.findById(jiskoFollowKarungi);

    if(!user || !targetUser){
      return res.status(400).json({
        message:"User not found",
        success:false
      });
    }
    //mai check karungi ki follow krna hai ya unfollow
    const isFollowing = user.following.includes(jiskoFollowKarungi);
    if(isFollowing){
      // unfollow logic aaiga
      await Promise.all([
        User.updateOne({_id: followKrneWali}, {$pull:{following:jiskoFollowKarungi}}),
        User.updateOne({_id: jiskoFollowKarungi}, {$pull:{followers:followKrneWali}}),
      ])
      return res.status(200).json({
        message:"Unfollowed Successfully",
        success:true
      });
    } else{
      // follow logic aaiga
      await Promise.all([
        User.updateOne({_id: followKrneWali}, {$push:{following:jiskoFollowKarungi}}),
        User.updateOne({_id: jiskoFollowKarungi}, {$push:{followers:followKrneWali}}),
      ])
      return res.status(200).json({
        message:"followed Successfully",
        success:true
      });
    }
  } catch(error){
    console.log(error);
  }
}
