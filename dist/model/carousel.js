"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const carouselSchema = new _mongoose2.default.Schema({
    title: String, // 轮播图标题
    content: String, // 图片地址
    url: String, // 轮播图跳转地址
    weight: { // 权重
        type: Number,
        default: 90
    }
}, {
    timestamps: true
}); /**
     * Created by @xiusiteng on 2016-11-23.
     * @desc 轮播图-model
     */


const Carousel = _mongoose2.default.model("carousel", carouselSchema);

module.exports = Carousel;