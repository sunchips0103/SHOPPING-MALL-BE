const { populate } = require("dotenv");
const Cart = require("../models/Cart");

const cartController={}
cartController.addItemToCart = async(req,res)=>{
    try{
        const {userId} = req;
        const {productId,size,qty}=req.body;
        //유저를 가지고 카트 찾기
        let cart = await Cart.findOne({userId});
        if(!cart){
            //유저가 만든 카트가 없다, 만들어주기
            cart= new Cart({userId});
            await cart.save();
        }
        //이미 카트에 들어가 있는 아이템이냐? productId,size
        const existItem = cart.items.find(
        (item) => item.productId.equals(productId)&&item.size===size
        );
        if(existItem){
        //그렇다면 에러('이미 아이템이 카트에 있습니다')
        throw new Error("아이템이 이미 카트에 담김");
        }   
        //카트에 아이템을 추가
        cart.items = [...cart.items,{productId,size,qty}];
        await cart.save();

        res
        .status(200)
        .json({status:"success",data:cart,cartItemQty:cart.items.length});

    }catch(error){
        return res.status(400).json({status:'fail',error:error.message});
    }
};

cartController.getCart=async(req,res)=>{
    try{
        const {userId} = req;
        const cart = await Cart.findOne({userId}).populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
            }
        });
        res.status(200).json({status:"success",data:cart.items});
    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});

    }
}

cartController.deleteCartItem = async(req,res)=>{
     try {
    const {userId} = req;
    const cartItemId = req.params.id;
    const cart = await Cart.findOne({userId});
    // const deleteItem = await cart.items.findById(cartItemId) //cart.items는 배열이므로 mongoose model 함수를 쓰면 오류가 뜸
    const deleteItem = cart.items.find((item) => item._id == cartItemId);
    //item._id는 ObjectId type, cartItemId는 string type이어서 값이 같아도도 ===연산은 false가 뜬다/ !item._id.equals(id)도 가능
    if (!deleteItem) throw new Error("item doesn't exist");
    cart.items = cart.items.filter((item) => item._id != cartItemId);
    await cart.save();
    res.status(200).json({status: "success",cartItemCount: cart.items.length});
  } catch (error) {
    return res.status(400).json({status: "fail", error: error.message});
  }
};
cartController.updateQty = async (req, res) => {
  try {
    const { userId } = req;
    const cartItemId = req.params.id;
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) throw new Error("카트 없");
    const updataItem = cart.items.findIndex((item) => item._id.equals(cartItemId));
    if (!updataItem === -1) throw new Error("아이템 없");
    cart.items[updataItem].qty = qty;
    await cart.save();
    res.status(200).json({ status: 200, data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty= async(req,res)=>{
  try{
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("카트 없");
    const cartItemCount = cart.items.length;
    res.status(200).json({status: "success",cartItemCount: cart.items.length});



  }catch(error){
    return res.status(400).json({ status: "fail", error: error.message });

  }
}



module.exports = cartController