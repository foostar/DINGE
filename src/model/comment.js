/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 评论相关-model
 */
import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const WEIGHT_TYPE = {
    0: "defaultWeight",
    3: "indexWeight"
}
const CommentSchema = new mongoose.Schema({
    movie: {                // 评论电影的id
        type: ObjectId,
        ref : "movie"
    },
    title      : String,    // 评论的标题
    commentFrom: {          // 评论人id
        type: ObjectId,
        ref : "User"
    },
    reading: { type: Number, default: 0 },  // 阅读数
    rank   : {              // 星星评分
        type   : Number,
        default: 0
    },
    star: [ {               // 点赞此评论的人
        type: ObjectId,
        ref : "User"
    } ],
    collet: [ {             // 收藏此评论的人
        type: ObjectId,
        ref : "User"
    } ],
    weight: {               // 评论类型
        default: 0,
        type   : Number,
        enum   : WEIGHT_TYPE
    },
    valid: {                // 是否屏蔽
        default: 1,
        type   : Number
    },
    reply  : [ { type: ObjectId, ref: "reply" } ],  // 回复评论的id
    content: String         // 评论内容
}, {
    timestamps: true
})
CommentSchema.statics = {
    fetch(opt) {
        return this
            .find(opt)
            .sort({ updatedAt: -1 })
    }
}
const Comment = mongoose.model("comment", CommentSchema)
module.exports = Comment
