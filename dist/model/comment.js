"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose2.default.Schema; /**
                                           * Created by @xiusiteng on 2016-11-23.
                                           * @desc 评论相关-model
                                           */

const ObjectId = Schema.Types.ObjectId;
const WEIGHT_TYPE = {
    1: "defaultWeight",
    3: "indexWeight"
};
const CommentSchema = new _mongoose2.default.Schema({
    movie: { // 评论电影的id
        type: ObjectId,
        ref: "movie"
    },
    title: String, // 评论的标题
    commentFrom: { // 评论人id
        type: ObjectId,
        ref: "User"
    },
    reading: { type: Number, default: 0 }, // 阅读数
    rank: { // 星星评分
        type: Number,
        default: 0
    },
    star: [{ // 点赞
        type: ObjectId,
        ref: "zanlist"
    }],
    collet: [{ // 收藏此评论的人
        type: ObjectId,
        ref: "User"
    }],
    weight: { // 评论类型
        default: 0,
        type: Number,
        enum: WEIGHT_TYPE
    },
    valid: { // 是否屏蔽
        default: 0,
        type: Number
    },
    reply: [{ type: ObjectId, ref: "reply" }], // 回复评论的id
    content: String // 评论内容
}, {
    timestamps: true
});
const Comment = _mongoose2.default.model("comment", CommentSchema);
module.exports = Comment;