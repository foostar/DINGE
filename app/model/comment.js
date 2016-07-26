/**
 * Created by Administrator on 2016-06-08.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var WEIGHT_TYPE = {
    0:"defaultWeight",
    3:"indexWeight"
};
var CommentSchema = new mongoose.Schema({
    movie:{
        type:ObjectId,
        ref:"movie"
    },
    title:String,
    commentFrom:{
        type:ObjectId,
        ref:"User"
    },
    reading:{type:Number,default:0},
    rank:{
        type:Number,
        default:0
    },
    star:[ {
        type:ObjectId, ref:"User"
    } ],
    collet:[ {
        type:ObjectId, ref:"User"
    } ],
    weight:{
        default:0,
        type:Number,
        enum:WEIGHT_TYPE
    },
    reply:[ {
        commentTo:{type:ObjectId, ref:"User"},
        commentFrom:{type:ObjectId, ref:"User"},
        createdAt:{
            type:Date,
            default:Date.now()
        },
        commentId:{type:ObjectId, ref:"comment"},
        content:String
    } ],
    content:String
},{
    timestamps:true
});
CommentSchema.pre("save",function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now();
    }else{
        this.updatedAt = Date.now();
    }
    next();
});
CommentSchema.statics={
    fetch:function(opt){
        return this
            .find(opt)
            .sort({"updatedAt":-1});
    }
    
};
var Comment = mongoose.model("comment", CommentSchema);
module.exports = Comment;