const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

//회원가입
router.post("/", userController.createUser);
router.get("/me", authController.authenticate,userController.getUser)//토큰이 valid한 토큰인지, 이 token가지고 유저를 찾아서 리턴
// 토큰 값을 헤더에 넣어서 보내기에 get 사용, 유저값을 다시 줘야하기 때문
//미드웨어 체인구조
module.exports=router;
