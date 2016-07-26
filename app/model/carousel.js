var mongoose = require("mongoose");
var carouselSchema = new mongoose.Schema({
    name:String,
    url:String,
    weight:{
        type:Number,
        default:90
    }
},{
    timestamps:true
});
carouselSchema.pre("save",function(next){
    if(this.isNew) {
        this.createdAt = this.updatedAt = Date.now();
    }else{
        this.updatedAt = Date.now();
    }
    next();
});
var Carousel = mongoose.model("carousel", carouselSchema);
module.exports = Carousel;