import {v2 as cloudinary} from "cloudinary"; //1. cloudinary library is imported to interact with Cloudinary's API.
//2. This library allows you to upload, manage, and manipulate media files using Cloudinary.
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({ //Configures the Cloudinary SDK with credentials so you can interact with the Cloudinary service.
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});
export default cloudinary;