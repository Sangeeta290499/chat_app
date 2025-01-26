import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => { //isAuthenticated job is to tell whether user is login or not........means cookies me token hai ya nhi
    try{
        const token = req.cookies.token  //finding token in cookies
        if(!token){
            return res.status(401).json({
                message:"User is not authenticated.",
                success:false
            });
        }
        //jab hume token mil jaiga tab use hum secret key se verify karenge
        const decode  = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:'Invalid',
                success:false,
            });
        }
        //agar decode/verify/match hogya then,
        req.id = decode.userId;
        next();
    }catch(error){
        console.log(error);
    }
}