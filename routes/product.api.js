const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller")
const router = express.Router();



router.post("/",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
    );

router.get("/",productController.getProducts);

router.put("/:id",
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);


module.exports = router;
