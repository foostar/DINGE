/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 消息相关-model
 */
import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const MESSAGE_TYPE = {
    0: "vaild",
    1: "invaild"
}
const messageSchema = new mongoose.Schema({
    from: {                   // 发起会话的人
        type   : ObjectId,
        ref    : "User",
        require: true
    },
    fromStr: {               // 发起会话的人
        type: String
    },
    to: {                    // 接受会话的人
        type   : ObjectId,
        ref    : "User",
        require: true
    },
    toStr   : String,        // 接受会话的人
    typeId  : String,        // 会话id
    readAble: {              // 是否未读
        type   : Boolean,
        default: false
    },
    content: {               // 会话内容
        type   : String,
        require: true
    },
    vaild: {
        default: 0,
        type   : Number,
        enum   : MESSAGE_TYPE
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
