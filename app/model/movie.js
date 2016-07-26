/**
 * Created by Administrator on 2016-06-08.
 */
var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var MovieSchema = new mongoose.Schema({
    title:String,
    etitle:String,
    rating:{
        average:String,
        star:Number
    },
    directors:[ {
        name:String
    } ],
    casts:[ {
        name:String
    } ],
    releasetime:Date,
    country:[ {
        name:String
    } ],
    genres:[ {
        name:String
    } ],
    aka:[ {
        name:String
    } ],
    language:[ {
        name:String
    } ],
    actime:Number,
    images:{
        large:String,
        small:String,
        medium:String
    }
},{
    timestamps:true
});
MovieSchema.pre("save",function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now();
    }else{
        this.updatedAt = Date.now();
    }
    next();
});
MovieSchema.statics={
    fetch:function(){
        return this
            .find({})
            .sort({"updatedAt":-1});
    },
    findById:function(id){
        return this
            .findOne({_id:id});
    }
};
var Movie = mongoose.model("movie", MovieSchema);
module.exports = Movie;