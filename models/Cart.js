const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const cartSchema = Schema({
    userId:{type:mongoose.ObjectId, ref:User},
    itmes:[{
        productId:{type:mongoose.ObjectId,ref:Product},
        size:{tpye:String,require:true},
        qty:{type:Number,default:1,require:ture},
    }]

},{timestamps:true})
 cartSchema.methods.toJSON = function(){
    const obj = this._doc
    delete obj.__v
    delete obj.updateAt
    delete obj.createAt
    return obj
}

const Cart = mongoose.model("Cart",userSchema)
module.exports = Cart;