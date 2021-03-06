"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MovieSchema = new _mongoose2.default.Schema({
    title: String, // 电影标题
    rating: {
        average: { // 评分平均分
            type: Number,
            default: 8
        },
        star: { // 电影星星
            type: Number,
            default: 4
        }
    },
    directors: [{ // 电影导演
        name: String
    }],
    casts: [{ // 电影主演
        name: String
    }],
    country: [{ // 国家
        name: String
    }],
    genres: [{ // 类型
        name: String
    }],
    aka: [{ // 又名
        name: String
    }],
    language: [{ // 语言
        name: String
    }],
    actime: Number, // 片长
    images: {
        large: String, // 大海报地址
        small: String, // 中海报地址
        medium: String // 小海报地址
    },
    subject: String, // 电影简介
    videoUrl: String, // 预告片
    releaseTime: String // 上映时间
}, {
    timestamps: true
}); /**
     * Created by @xiusiteng on 2016-11-23.
     * @desc 电影相关-model
     */

MovieSchema.statics = {
    fetch() {
        return this.find({}).sort({ updatedAt: -1 });
    },
    findById(id) {
        return this.findOne({ _id: id });
    }
};
const Movie = _mongoose2.default.model("movie", MovieSchema);
module.exports = Movie;