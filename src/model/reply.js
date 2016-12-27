import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ReplySchema = new mongoose.Schema({
    commentTo  : { type: ObjectId, ref: "User" },      // 给谁回复的用户id
    commentFrom: { type: ObjectId, ref: "User" },      // 回复人的用户id
    commentId  : { type: ObjectId, ref: "comment" },   // 评论的id
    content    : String                                // 回复内容
}, {
    timestamps: true
})
const Reply = mongoose.model("reply", ReplySchema)
module.exports = Reply
