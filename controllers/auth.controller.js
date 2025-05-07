const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config(); 
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {}

authController.loginWithEmail=async(req,res)=>{
    try{
        const {email,password} = req.body
        let user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compare(password,user.password)
            if(isMatch){
                //token
                const token = await user.generateToken();
                return res.status(200).json({status:"success",user,token});
            }
        }
        throw new Error("이메일 or 비밀번호 틀림");
    }catch(error){
        res.status(400).json({status:"fail",error:error.message});
        
    }
};
authController.authenticate = async(req,res,next)=>{
    try{
        const tokenString = req.headers.authorization;
        if(!tokenString) throw new Error("토큰을 찾을 수 없음");
        const token = tokenString.replace("Bearer ","")
        jwt.verify(token,JWT_SECRET_KEY,(error,payload)=>{
            if(error) throw new Error("invalid token");
            req.userId = payload._id;
        });
        next(); //authenticate 끝나고 getUser로 넘어감 (user.api 미드웨어)
    }catch(error){
        res.status(400).json({status:"fail",erro:error.message})
    }
}


module.exports=authController;