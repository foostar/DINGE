/**
 * Created by Administrator on 2016-06-08.
 */
var mongoose = require("mongoose")
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var CommentSchema = new mongoose.Schema({
    movie:{
        type:ObjectId,
        ref:'Movie'
    },
    title:String,
    commentFrom:{
        type:ObjectId,
        ref:'User'
    },
    reply:[{
        commentTo:{type:ObjectId, ref:'User'},
        commentFrom:{type:ObjectId, ref:'User'},
        content:String
    }],
    loved:[{
        lovedTo:{type:ObjectId, ref:'User'},
        lovedFrom:{type:ObjectId, ref:'User'}
    }],
    collectd:[{
        collectTo:{type:ObjectId, ref:'User'},
        collectFrom:{type:ObjectId, ref:'User'}
    }],
    content:String
},{
    timestamps:true
})
CommentSchema.pre('save',function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    }else{
        this.updatedAt = Date.now()
    }
    next()
})
CommentSchema.statics={
    fetch:function(){
        return this
            .find({})
            .sort({'updatedAt':-1})
            .exec()
    },
    findById:function(id){
        return this
            .findOne({_id:id})
            .exec()

    }
}
var Comment = mongoose.model('comment', CommentSchema)
module.exports = Comment