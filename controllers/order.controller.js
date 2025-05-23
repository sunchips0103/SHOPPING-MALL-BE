const { populate } = require("dotenv");
const Order = require("../models/Order");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const PAGE_SIZE=5;

const orderController={};


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
        //save후에 카트를 비워주자
        res.status(200).json({status:"success",orderNum:newOrder.orderNum})

    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});
    }
}
orderController.getOrder=async(req,res)=>{
    try{
        
        const {userId} =req;
        const orderList = await Order.find({userId}).populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
                }
            });
        res.status(200).json({status:"success",data:orderList});
    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});
    }
}
orderController.getOrderList =async(req,res)=>{
    try{
        const { page, ordernum} = req.query;
        const { userId } = req; 
        const cond = ordernum
      ? { ordernum: { $regex: ordernum, $options: "i" }, userId }
      : { userId };
        
        let orderList = await Order.find(cond).populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
                }
            }).skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);;


        
            const totalItemNum = await Order.countDocuments(cond); 
            const totalPageNum = Math.ceil(totalItemNum/PAGE_SIZE);
            


        res.status(200).json({status:"success", data : orderList, totalPageNum});


    }catch(error){
        return res.status(400).json({status:"fail",error:error.message});

    }
};

orderController.updateOrder = async(req,res)=>{
    try{
        const id =req.params;
        const {
            userId,
            status,
            totalPrice,
            shipTo,
            contact,
            orderNum,
            items
        } = req.body;

        const order = await Order.findByIdAndUpdata(id,{
            userId,
            status,
            totalPrice,
            shipTo,
            contact,
            orderNum,
            items},{new:true});
            if(!order) throw new Error("주문을 찾을수 없음");
            res.status(200).json({status:"success",data:order})
    }catch(error){
            res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports=orderController;