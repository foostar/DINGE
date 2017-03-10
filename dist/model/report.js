"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose2.default.Schema;
const ObjectId = Schema.Types.ObjectId;

const ReportSchema = new _mongoose2.default.Schema({
    reportTo: { type: ObjectId, ref: "User" }, // 要举报的人
    reportComment: { type: ObjectId, ref: "comment" }, // 要举报的影评
    reportFrom: { type: ObjectId, ref: "User" }, // 举报人
    types: {
        type: String,
        default: "user"
    },
    reason: { // 举报原因
        default: "不良信息",
        type: String
    }
}, {
    timestamps: true
});
const Report = _mongoose2.default.model("reports", ReportSchema);
module.exports = Report;