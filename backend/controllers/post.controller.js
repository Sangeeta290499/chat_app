import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id; //logged in user id will get from authentication, which we have saved

    if (!image) {
      return res.status(401).json({
        message: "Image required",
      });
    }
    // image upload
    const optimizedImageBuffer = await sharp(image.buffer)
    .resize({width:800, height:800, fit:'inside'})
    .toFormat('jpeg', {quality:80})
    .toBuffer();

    // buffer to data uri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post({
        caption,
        image:cloudResponse.secure_url,
        author:authorId
    });
    //In user there is a post, inside that post we have to add this above created post
    const user = await User.findById(authorId);
    if(user){
        user.posts.push(post._id);
        await user.save();
    }

  } catch (error) {
    console.log(error);
  }
};
