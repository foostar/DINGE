/**
 * Created by @xiusiteng on 2016-12-23.
 * @desc 用户接口
 */
import { sendError } from "../utils/util.js"
import { getItem, setExpire } from "../redis/redis"
/*
 * @检测是否登录
 */
const isAuth = (req, res, next) => {
    if (!req.headers.authentication) {
        return next({ status: 400, errcode: 100401, msg: "token为必传参数" })
    }
    const sessionKey = req.headers.authentication
    getItem(sessionKey)
    .then(result => {
        req.user = result
        setExpire(sessionKey, parseInt(1800, 10))
        next()
    })
    .catch(err => {
        return next(sendError(err))
    })
}

module.exports = {
    isAuth
}
