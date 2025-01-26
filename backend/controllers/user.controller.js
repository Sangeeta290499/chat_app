//here we will write registration things
import { User } from "../models/user.model.js";
import bycrypt from "bcryptjs";


export const register = async (req, res) => {
    try{
        const {username, password, email} = req.body;
        if(!username || !password || !email){
            return res.status(401).json({
                message:"Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({email}); //here we will check user already exist or not
        if(user){
            return res.status(401).json({
                message:"Try with different email id",
                success:false,
            });
        }
        const hashedPassword = await bycrypt.hash(password, 10);  //here we will save our password in hashed value
        await User.create({
            username,
            password:hashedPassword,
            email
        });
        return res.status(201).json({
            message:"Acccount created successfully.",
            success:true,
        });
    } catch(error){
        console.log(error);
    }
}