// const express = require("express"); method-1 ---------- to access express
import express, { urlencoded } from "express";  // method-2
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config({});
const app = express();

app.get('/',(req,res) =>{
    return res.status(200).json({
        message:'I am coming from backend',
        sucess:true
    })
})

//middlewares
app.use(express.json());  //data will come in json format
app.use(cookieParser());   //when we send request from browser to backend, we use cookie to store our token, if we not going to use we cant see the token it will not parse and we cant see in backend. The cookie parser helps in extracting and handling cookie values from HTTP requests and responses.
app.use(urlencoded({extended:true}));
const corsOptions={
    origin:'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));




const PORT = process.env.PORT || 5000



app.listen(PORT, () =>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});