const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post('/login',authController.loginWithEmail); //요청시 body 보냄 get()은 body 안보냄
router.post('/google',authController.loginWithGoogle); 


module.exports =router;