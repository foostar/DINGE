"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose2.default.Schema; /**
                                           * Created by @xiusiteng on 2016-11-23.
                                           * @desc 消息相关-model
                                           */

const ObjectId = Schema.Types.ObjectId;
const MESSAGE_TYPE = {
    0: "vaild",
    1: "invaild"
};
const messageSchema = new _mongoose2.default.Schema({
    from: { // 发起会话的人
        type: ObjectId,
        ref: "User",
        require: true
    },
    fromStr: { // 发起会话的人
        type: String
    },
    to: { // 接受会话的人
        type: ObjectId,
        ref: "User",
        require: true
    },
    toStr: String, // 接受会话的人
    typeId: String, // 会话id
    readAble: { // 是否未读
        type: Boolean,
        default: false
    },
    content: { // 会话内容
        type: String,
        require: true
    },
    vaild: {
        default: 0,
        type: Number,
        enum: MESSAGE_TYPE
    }
}, {
    timestamps: true
});
messageSchema.pre("save", next => {
    if (undefined.isNew) {
        undefined.createdAt = undefined.updatedAt = Date.now();
    } else {
        undefined.updatedAt = Date.now();
    }
    next();
});
const Message = _mongoose2.default.model("message", messageSchema);
module.exports = Message;