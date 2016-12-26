import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ReplySchema = new mongoose.Schema({
    commentTo  : { type: ObjectId, ref: "User" },
    commentFrom: { type: ObjectId, ref: "User" },
    commentId  : { type: ObjectId, ref: "comment" },
    content    : String
}, {
    timestamps: true
})
const Reply = mongoose.model("reply", ReplySchema)
module.exports = Reply
