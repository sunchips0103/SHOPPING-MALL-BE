const jwt = require("jsonwebtoken")
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {OAuth2Client} = require("google-auth-library");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;

const authController = {}

authController.loginWithEmail = async(req,res)=>{
    try{
        const {email,password} = req.body;
        let user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compare(password,user.password)
            if(isMatch){
                const token = await user.generateToken()
                return res.status(200).json({status:"success",user,token})
            }
        }
        throw new Error("invalid email or password")
    }catch(error){
        res.status(400).json({status:"fail", error:error.message})
    }
};
authController.loginWithGoogle =async(req,res)=>{
   try {
    const {token} = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const {email, name} = ticket.getPayload();
    console.log("eee", email, name);
    let user = await User.findOne({email});
    if (!user) {
      //유저를 새로 생성
      const randomPassword = ""+Math.floor(Math.random()*10000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name,
        email,
        password: newPassword,
      });
      await user.save()
    }
    //토큰 발행 후 리턴
    const sessionToken = await user.generateToken();
    res.status(200).json({status:"success",user,token:sessionToken})
    }catch(error){
        return res.status(400).json({status:"fail", error: error.message})

    }
};
// 4. 백엔드에서 로그인하기
        //토큰 값을 읽어와서 => 유저정보를 뽑아내고 email
        //  a.이미 로그인 한적이 있는 유저->로그인시키고 토큰값 주면 장떙
        //  b.처음 로그인을 시도를 한 유저다 -> 유저 정보 먼저 새로생성 => 토큰 값


authController.authenticate = async(req,res,next)=>{
    try{
        const tokenString = req.headers.authorization
        if(!tokenString) throw new Error("Token not found");
        const token = tokenString.replace("Bearer ","");
        jwt.verify(token,JWT_SECRET_KEY,(error,payload)=>{
            if(error) throw new Error("invalid token");
            req.userId = payload._id;
        })
        next();
    }catch(error){
        res.status(400).json({status:"fail",error:error.message})
    }
}

authController.checkAdminPermission = async(req,res,next) => {
    try{
        //token
        const {userId} = req;
        const user = await User.findById(userId)
        if(user.level !== "admin") throw new Error ("no permission");
        next()
    }catch(error){
        res.status(400).json({status:"fail",error:error.message})
    }
}


module.exports = authController