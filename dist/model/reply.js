"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose2.default.Schema;
const ObjectId = Schema.Types.ObjectId;

const ReplySchema = new _mongoose2.default.Schema({
    commentTo: { type: ObjectId, ref: "User" }, // 给谁回复的用户id
    commentFrom: { type: ObjectId, ref: "User" }, // 回复人的用户id
    commentId: { type: ObjectId, ref: "comment" }, // 评论的id
    content: String, // 回复内容
    vaild: {
        default: 0,
        type: Number
    }
}, {
    timestamps: true
});
const Reply = _mongoose2.default.model("reply", ReplySchema);
module.exports = Reply;