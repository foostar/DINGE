var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var messageSchema = new mongoose.Schema({
    from:{
        type:ObjectId,
        ref:"User",
        require:true
    },
    fromStr:{
        type:String
    },
    to:{
        type:ObjectId,
        ref:"User",
        require:true 
    },
    toStr:String,
    typeId:String,
    readAble:{
        type:Boolean,
        default:false
    },
    content:{
        type:String,
        require:true
    }

},{
    timestamps:true
});
messageSchema.pre("save",function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now();
    }else{
        this.updatedAt = Date.now();
    }
    next();
});
var Message = mongoose.model("message", messageSchema);
module.exports = Message;