//here we will write registration things
import { User } from "../models/user.model.js";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
