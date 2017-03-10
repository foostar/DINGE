"use strict";

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-model
 */
const Schema = _mongoose2.default.Schema;
const ObjectId = Schema.Types.ObjectId;
const VAILD_TYPE = {
    0: "vaild", // 正常用户
    1: "masking", // 屏蔽的用户
    2: "invaild" };
const ROLE_TYPE = {
    0: "normal", // 正常用户
    1: "super" // 超级管理员
};
const userSchema = new _mongoose2.default.Schema({
    // _id  用户唯一id
    username: { // 用户名
        unique: true,
        type: String
    },
    // 0:normal
    // 1:verified user
    // 2:professonal user
    // >10 admin
    // >50 super admin
    sign: { // 签名
        type: String,
        default: "来说点什么吧！"
    },
    sex: { // 性别
        type: String,
        default: "男"
    },
    city: { // 城市
        type: String,
        default: "北京市,东城区"
    },
    birthday: { // 生日
        type: Date,
        default: Date.now()
    },
    role: { // 角色（默认为用户）
        type: Number,
        default: 0,
        enum: ROLE_TYPE
    },
    nickname: { // 昵称
        unique: true,
        type: String,
        default: `dinge${ Date.now() }`
    },
    avatar: { // 头像
        type: String,
        default: "/carouse/head.png"
    },
    lovedTo: [{ // 关注的人
        type: ObjectId,
        ref: "User"
    }],
    lovedFrom: [{ // 关注此用户的人
        type: ObjectId,
        ref: "User"
    }],
    history: [{ // 浏览历史
        type: ObjectId,
        ref: "comment"
    }],
    star: [{ // 点赞的评论（暂时无用，评论默认为可以无限点赞）
        type: ObjectId,
        ref: "comment"
    }],
    collet: [{ // 收藏的评论
        type: ObjectId,
        ref: "comment"
    }],
    blackList: [{ // 黑名单
        type: ObjectId,
        ref: "User"
    }],
    password: String, // 密码
    valid: { // 用户是否正常
        default: 0,
        type: Number,
        enum: VAILD_TYPE
    },
    comments: { // 影评数
        default: 0,
        type: Number
    }
}, {
    timestamps: true
});
const User = _mongoose2.default.model("User", userSchema);
User.findOne({ role: 1 }, (err, result) => {
    if (result) return;
    _bcryptjs2.default.genSalt(10, (error, salt) => {
        _bcryptjs2.default.hash("123456789", salt, (erro, hash) => {
            if (erro) return;
            new User({
                username: "admin",
                password: hash,
                role: 1
            }).save();
        });
    });
});
module.exports = User;