import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

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

    // buffer to data uri me convert krna padega
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

    await post.populate({path:'author', select:'-password'});

    return res.status(201).json({
      message:'New post added',
      post,
      success:true,
    })

  } catch (error) {
    console.log(error);
  }
};

//to get all post
export const getAllPost = async(req,res) =>{
  try{
    const posts = await Post.find().sort({createdAt:-1}).populate({path:'author', select:'username,profilePicture'})
    .populate({
        path:'comments',
        sort:{createdAt:-1},
        populate:{
          path:'author',
          select:'username, profilePicture'
        }
    });
    return res.status(200).json({
      posts,
      success:true
    })
  } catch(error){
    console.log(error);
  }
};

export const getUserPost = async(req, res) => {
  try{
    const authorId = req.id;
    const posts = await Post.find({author:authorId}).sort({createdAt:-1}).populate({
      path:'author',
      select:'username, profilePicture'
    }).populate({
      path:'comments',
      sort:{createdAt:-1},
      populate:{
        path:'author',
        select:'username, profilePicture'
      }
    });
    return res.status(200).json({
      posts,
      success:true
    })
  }catch(error){
    console.log(error);
  }
}

// logic of like post
export const LikePost = async(req,res) => {
  try{
    const likeKarneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message:"Post not found",
        success:"false"
      });
    }
    // dislike logic started
    await post.updateOne({$addToSet: {likes:likeKarneWalaUserKiId}});  // post k ander like update ho jaiga
    await post.save();

    // implement socket io for real time notification


    return res.status(200).json({
      message:"Post liked",
      success:true
    })
  }catch(error){
    console.log(error);
  }
}

// logic of dislike post
export const disLikePost = async(req,res) => {
  try{
    const likeKarneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message:"Post not found",
        success:"false"
      });
    }
    // like logic started
    await post.updateOne({$pull: {likes:likeKarneWalaUserKiId}});  // post k ander dislike update ho jaiga
    await post.save();

    // implement socket io for real time notification


    return res.status(200).json({
      message:"Post disliked",
      success:true
    })
  }catch(error){
    console.log(error);
  }
}

// logic of addComments started
export const addComment = async (req, res) => {
  try{
    const postId = req.params.id;
    const commentKrneWalaKiId = req.id;

    const {text} = req.body;
     const post = await Post.findById(postId);

     if(!post){
      return res.status(404).json({
        message:"text is required",
        success:false
      })
     }

     const comment = await Comment.create({
      text,
      author:commentKrneWalaKiId,
      post:postId
     });
  } catch(error){
    console.log(error);
  }

};

// logic for getComment post
export const getCommentsOfPost = async(req, res) => {
  try{
    const postId = req.params.id;
    const comments = await Comment.find({post:postId}).populate('author', 'username', 'profilePicture');
    if(!comments){
      return res.status(404).json({
        message:'No comments found for this post',
        success:false
      })
    }
    
    return res.status(200).json({
      success:true,
      comments
    });
  } catch(error){
    console.log(error);
  }
}

//logic for delete post

export const deletePost = async(req, res) =>{
  try{
      const postId = req.params.id;
      const authorId = req.id;

      const post = await Post.findById(postId);
      if(!post){
        return req.status(404).json({
          message:"Post not found",
          success:false
        })
      }
      // check if the logged-in user is the owner of the post
      if(post.author.toString() !== authorId){
        return res.status(403).json({
          message:'Unauthorized'
        });
      }
      //delete post
      await Post.findByIdAndDelete(postId);

      // remove the post id from the user's post
      let user = await User.findById(authorId);
      user.posts = user.posts.filter(id =>id.toString() !==postId);
      await user.save();

      //delete associated comments
      await Comment.deleteMany({post:postId});
      return res.status(200).json({
        success:true,
        message:'Post deleted'
      })

  } catch(error){
    console.log(error);
  }
};

//logic for bookmark post
export const bookmarkPost = async(req,res) =>{
  try{
    //which post we want to bookmark that postId
    const postId = req.params.id;
    // and authors id who is bookmarking
    const authorId = req.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message:'Post not found',
        success:false
      });
    }

    const user = await User.findById(authorId);
    if(user.bookmarks.includes(post._id)){
      // if already bookmarked -> then remove from bookmark
        await user.updateOne({$pull:{bookmarks:post._id}});
        await user.save();
        return res.status(200).json({
          type:'unsaved',
          message:'Post removed from bookmark',
          success:true
        });
    }else{
      // if it is not bookmark and we want to then belows logic will come
      await user.updateOne({$addToSet:{bookmarks:post._id}});
        await user.save();
        return res.status(200).json({
          type:'saved',
          message:'Post bookmarked',
          success:true
        });
    }
  } catch(error){
    console.log(error);
  }
}

