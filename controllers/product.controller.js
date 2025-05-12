const productController = {};
const Product = require('../models/Product');
// product 모델 참고해서 작성하면 됨
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: 'success', product });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
productController.getProducts = async(req,res)=>{
    try{
      const { page, name } = req.query;
      const cond = name?{name:{$regex:name,$options:"i"}}:{}
        //regex란 정규표현식
        //options:"i" ->영어 대소문자 구분 x
      let query = Product.find(cond);

      const productList = await query.exec();
      res.status(200).json({status:"success",data:productList})
    }catch(error){
      res.status(400).json({ status: 'fail', error: error.message });
    }
  }

module.exports = productController;