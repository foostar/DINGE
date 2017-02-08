/**
 * Created by @xiusiteng on 2016-11-23.
 */
import crypto from "crypto"
/*
 * @desc 错误类型
 */
const errorType = {
    101: { status: 400, errcode: 100101, msg: "token为空或已过期!" },
    102: { status: 400, errcode: 100102, msg: "操作失败，请重试！" },
    103: { status: 400, errcode: 100103, msg: "缺少必要的参数或传入参数不合法!" },
    200: { status: 1, msg: "操作成功!" },
    401: { status: 400, errcode: 100401, msg: "标题不能超过20个字符！" },
    402: { status: 400, errcode: 100402, msg: "评论内容过长！" },
    403: { status: 400, errcode: 100403, msg: "此用户不存在或账号存在问题！" },
    404: { status: 400, errcode: 100404, msg: "不能关注自己" },
    405: { status: 400, errcode: 100405, msg: "对不起，未找到匹配项！" },
    501: { status: 400, errcode: 100501, msg: "邮箱不能为空" },
    502: { status: 400, errcode: 100502, msg: "密码不能为空" },
    503: { status: 400, errcode: 100503, msg: "昵称不能为空" },
    504: { status: 400, errcode: 100504, msg: "昵称格式错误，不能包括特殊字符切长度在9位之内。" },
    505: { status: 400, errcode: 100505, msg: "邮箱格式不正确" },
    506: { status: 400, errcode: 100506, msg: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" },
    507: { status: 400, errcode: 100507, msg: "邮箱已经被注册" },
    508: { status: 400, errcode: 100508, msg: "用户名已经被注册" },
    509: { status: 400, errcode: 100509, msg: "用户名或密码错误！" },
    601: { message: "邮箱不能为空" },
    602: { message: "密码不能为空" },
    603: { message: "邮箱格式不正确" },
    604: { message: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" },
    605: { message: "用户不存在" },
    606: { message: "密码与账户不匹配" }
}
/*
 * @desc 错误返回
 */
const sendError = (err) => {
    if (err.status || Object.prototype.toString.call(this) == "[object Object]") {
        return err
    }
    return Object.assign({ status: 400 }, { msg: err })
}
/*
 * @desc 正则表达式
 */
const Regexp = {
    email    : /^([a-zA-Z0-9_\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    password : /^[A-Za-z0-9]{8,22}$/,
    movieName: /^[A-Za-z0-9\u4E00-\u9FA5]{1,20}$/,
    username : /^[A-Za-z0-9\u4e00-\u9fa5]{1,9}$/,
    xsscos   : /<script>/g
}

const createSession = (value) => {
    return new Promise((reslove, reject) => {
        crypto.randomBytes(8, (err, buf) => {
            if (err) reject(err)
            const token = crypto.createHash("sha1").update(`${JSON.stringify(value)}${buf.toString("hex")}`).digest("hex")
            .toString()
            reslove({ token, value })
        })
    })
}
const pathtoString = (obj) => {
    const arr = []
    /* eslint-disable */
    for(let i in obj) {
        arr.push(obj[i].name)
    }
    /* eslint-enable */
    return arr.join(",")
}


module.exports = {
    sendError,
    Regexp,
    errorType,
    createSession,
    pathtoString
}
