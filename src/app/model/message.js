/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 消息相关-model
 */
import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const messageSchema = new mongoose.Schema({
    from: {
        type   : ObjectId,
        ref    : "User",
        require: true
    },
    fromStr: {
        type: String
    },
    to: {
        type   : ObjectId,
        ref    : "User",
        require: true
    },
    toStr   : String,
    typeId  : String,
    readAble: {
        type   : Boolean,
        default: false
    },
    content: {
        type   : String,
        require: true
    }
}, {
    timestamps: true
})
messageSchema.pre("save", (next) => {
    if (this.isNew) {
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})
const Message = mongoose.model("message", messageSchema)
module.exports = Message
