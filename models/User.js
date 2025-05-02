const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = Schema({
    email:{type:String, require:true, unique:true},
    password:{type:String, require:true},
    name:{type:String, require:true},
    levle:{type:String, default:"customer"} //2types:customer, admin   
},{timestamps:true})
userSchema.methods.toJSON = function(){
    const obj = this._doc
    delete obj.password
    delete obj.__v
    delete obj.updateAt
    delete obj.createAt
    return obj
}

const User = mongoose.model("User",userSchema)
module.exports = User;