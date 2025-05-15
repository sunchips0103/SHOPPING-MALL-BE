const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller.js");
const authController = require("../controllers/auth.controller.js");


router.post("/",authController.authenticate, cartController.addItemToCart);

module.exports =router;