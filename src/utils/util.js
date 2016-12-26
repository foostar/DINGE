/**
 * Created by @xiusiteng on 2016-11-23.
 */
/*
 * @desc 错误返回
 */
const sendError = (err) => {
    if (err.status) {
        return err
    }
    if (Object.prototype.toString.call(this) == "[object Object]") {
        return { status: 400, msg: "操作失败，请重试" }
    }
    return { status: 400, msg: err }
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
module.exports = {
    sendError,
    Regexp
}
