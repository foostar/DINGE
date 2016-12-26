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
    movie: {
        type: ObjectId,
        ref : "movie"
    },
    title      : String,
    commentFrom: {
        type: ObjectId,
        ref : "User"
    },
    reading: { type: Number, default: 0 },
    rank   : {
        type   : Number,
        default: 0
    },
    star: {
        type   : Number,
        default: 0
    },
    collet: [ {
        type: ObjectId,
        ref : "User"
    } ],
    weight: {
        default: 0,
        type   : Number,
        enum   : WEIGHT_TYPE
    },
    reply  : [ { type: ObjectId, ref: "reply" } ],
    content: String
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
