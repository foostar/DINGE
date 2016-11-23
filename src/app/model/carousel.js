/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 轮播图-model
 */
import mongoose from "mongoose"
const carouselSchema = new mongoose.Schema({
    name  : String,
    url   : String,
    weight: {
        type   : Number,
        default: 90
    }
}, {
    timestamps: true
})
carouselSchema.pre("save", (next) => {
    if (this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})
const Carousel = mongoose.model("carousel", carouselSchema)

module.exports = Carousel
