import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ZanlistSchema = new mongoose.Schema({
    zanTo    : { type: ObjectId, ref: "User" },      // 给谁点赞
    zanFrom  : { type: ObjectId, ref: "User" },      // 点赞人
    commentId: {                                     // 赞的评论
        type: ObjectId,
        ref : "comment"
    }
}, {
    timestamps: true
})
const Zanlist = mongoose.model("zanlist", ZanlistSchema)
module.exports = Zanlist
