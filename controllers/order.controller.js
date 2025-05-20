const orderController={};
const Order = require("../models/Order");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");



orderController.createOrder=async(req,res)=>{
    try{
        //프론트엔드에서 데이터 보낸거 받아와 userId,totalPrice,ShipTo,contact,orderList
        const {userId}=req; //미드웨어에서 옴
        const {shipTo,contact,totalPrice,orderList} = req.body;
        //재고 확인 & 재고 업데이트(product)
        const insufficientStockItems= await productController.checkItemListStock(orderList);

        //재고가 충분하지 않는 아이템이 있었다 => 에러
        if(insufficientStockItems.length>0){
            const errorMessage = insufficientStockItems.reduce(
                (total,item)=>total+=item.message,
                ""
            );
            throw new Error(errorMessage);
        }
        //order를 만들자!
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items:orderList, //주문한 아이템들
            orderNum:randomStringGenerator()

        });
        await newOrder.save(); //재고 부족 문제 생각하자!
        res.status(200).json({status:"success",orderNum:newOrder.orderNum})

    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports=orderController;