/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-model
 */
import mongoose from "mongoose"

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const userSchema = new mongoose.Schema({
    username: {
        unique: true,
        type  : String
    },
    // 0:normal
    // 1:verified user
    // 2:professonal user
    // >10 admin
    // >50 super admin
    sign: {
        type   : String,
        default: "来说点什么吧！"
    },
    sex: {
        type   : String,
        default: "男"
    },
    city: {
        type   : String,
        default: "北京市,东城区"
    },
    birthday: {
        type   : Date,
        default: Date.now()
    },
    role: {
        type   : Number,
        default: 0
    },
    nickname: {
        unique : true,
        type   : String,
        default: `dinge${Date.now()}`
    },
    avatar: {
        type   : String,
        default: "/carouse/head.png"
    },
    lovedTo: [ {
        type: ObjectId,
        ref : "User"
    } ],
    lovedFrom: [ {
        type: ObjectId,
        ref : "User"
    } ],
    history: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    star: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    collet: [ {
        type: ObjectId,
        ref : "comment"
    } ],
    password: String
}, {
    timestamps: true
})
const User = mongoose.model("User", userSchema)
module.exports = User
