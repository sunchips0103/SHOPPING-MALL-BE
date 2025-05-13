const productController = {};
const Product = require('../models/Product');
// product 모델 참고해서 작성하면 됨

const PAGE_SIZE=1;
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
      let response = {status:"success"};
      if(page){
        query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE) //limit 갖고싶은 데이터 최대수 ex 10개중 5개를 가지고 싶다.  skip 데이터를 건너뜀
        //최종 몇개 페이지
        //데이터가 총 몇개있는지 확인
        const totalItemNum = await Product.countDocuments(cond);   
        //테이터 총갯수 / PAGE_SIZE
        const totalPageNum = Math.ceil(totalItemNum/PAGE_SIZE);
        response.totalPageNum=totalPageNum;
      }

      const productList = await query.exec();
      response.data=productList
      res.status(200).json(response);
    }catch(error){
      res.status(400).json({ status: 'fail', error: error.message });
    }
  }

module.exports = productController;