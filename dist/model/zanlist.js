"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose2.default.Schema;
const ObjectId = Schema.Types.ObjectId;

const ZanlistSchema = new _mongoose2.default.Schema({
    zanTo: { type: ObjectId, ref: "User" }, // 给谁点赞
    zanFrom: { type: ObjectId, ref: "User" }, // 点赞人
    commentId: { // 赞的评论
        type: ObjectId,
        ref: "comment"
    }
}, {
    timestamps: true
});
const Zanlist = _mongoose2.default.model("zanlist", ZanlistSchema);
module.exports = Zanlist;