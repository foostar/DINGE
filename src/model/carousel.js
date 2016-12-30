/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 轮播图-model
 */
import mongoose from "mongoose"
const carouselSchema = new mongoose.Schema({
    title  : String,         // 轮播图标题
    content: String,        // 图片地址
    url    : String,         // 轮播图跳转地址
    weight : {               // 权重
        type   : Number,
        default: 90
    }
}, {
    timestamps: true
})

const Carousel = mongoose.model("carousel", carouselSchema)

module.exports = Carousel
