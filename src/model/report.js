import mongoose from "mongoose"
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ReportSchema = new mongoose.Schema({
    reportTo     : { type: ObjectId, ref: "User" },      // 要举报的人
    reportComment: { type: ObjectId, ref: "comment" },      // 要举报的影评
    reportFrom   : { type: ObjectId, ref: "User" },      // 举报人
    types        : {
        type   : String,
        default: "user"
    },
    reason: {                                     // 举报原因
        default: "不良信息",
        type   : String
    }
}, {
    timestamps: true
})
const Report = mongoose.model("reports", ReportSchema)
module.exports = Report
