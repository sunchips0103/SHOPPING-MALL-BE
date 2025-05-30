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
// isDeleted: false
productController.getProducts = async (req, res) => {
  try {
    const { page, name, min, max } = req.query;

    const cond = { isDeleted: false };

    if (name) {
      cond.name = { $regex: name, $options: 'i' };
    }

    // 가격 조건 정확히 숫자로 처리
      if (min || max) {
      cond.price = {};
      if (min) cond.price.$gte = Number(min);
      if (max) cond.price.$lte = Number(max);
    }

    let query = Product.find(cond);
    const response = { status: 'success' };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      const totalItemNum = await Product.countDocuments(cond);
      response.totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    }

    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
//실제 삭제 로직
productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );

    if (!product) throw new Error("상품이 없음");
    res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};


  productController.updateProduct = async(req,res)=>{
    try{
      const productId = req.params.id;
      const {
        sku,
        name,
        size,
        image,
        price,
        description,
        category,
        stock,
        status
      } = req.body;

      const product = await Product.findByIdAndUpdate({_id:productId},{
        sku,
        name,
        size,
        image,
        price,
        description,
        category,
        stock,
        status},{new:true}
      );
      if(!product) throw new Error("item doesn't exist");
      res.status(200).json({status:"success",data:product})
    }catch(error){
      res.status(400).json({ status: 'fail', error: error.message });

    }
  };

  productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
  productController.checkStock=async(item)=>{
    //내가 사려는 아이템 재고 정보들고오기
    const product = await Product.findById(item.productId);
    //내가 사려는 아이템 qty,재고비교
    if(product.stock[item.size]<item.qty){
      //재고 불충분하면 불충분 메세지와 함께 데이터 반환
      return{isVerify:false,message:`${product.name}의${item.size}재고가 부족합니다`}
    }
    const newStock = {...product.stock};
    newStock[item.size] -= item.qty;
    product.stock=newStock;

    await product.save();
    //충분하다면, 재고에서 - qty, 성공 결과 보냄 
    return{isVerify:true};
  }  

  productController.checkItemListStock=async(itemList)=>{
    const insufficientStockItems= [] //재고가 불충분한 아이템을 저장할 계획
    //재고 확인 로직
    await Promise.all( //여러 비동기 한번에 처리:Promise.all (비동기 병렬 처리)
    itemList.map(async(item)=>{ //아이템 하나하나 보기 위해 map 사용
      const stockCheck = await productController.checkStock(item);
      //checkItemListStock 전체 리스트 체크 ,checkStock 아이템 하나하나 focus
      if(!stockCheck.isVerify){
        insufficientStockItems.push({item,message:stockCheck.message});
      }
      return stockCheck;
    }))



    return insufficientStockItems;
  }
productController.getProductsLevel = async (req, res) => {
  try {
    const level = Number(req.params.level);
    const min = level * 500;
    const max = (level + 1) * 500;

    // getProducts를 직접 호출하지 말고 조건을 이 안에서 처리
    const cond = {
      isDeleted: false,
      price: { $gte: min, $lt: max },
    };

    const productList = await Product.find(cond).exec();

    res.status(200).json({ status: 'success', data: productList });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = productController;