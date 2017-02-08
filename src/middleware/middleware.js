/**
 * Created by @xiusiteng on 2016-12-23.
 * @desc 用户接口
 */
import { sendError, errorType } from "../utils/util.js"
import { getItem } from "../redis/redis"
/*
 * @检测是否登录
 */
const isAuth = (req, res, next) => {
    const isAdminLogin = /\/admin\/api\/login/.test(req.path)
    const isAdminAuth = /\/admin\/api/.test(req.path)
    if (!req.headers.authentication && !isAdminLogin) {
        return next(errorType[101])
    }
    const sessionKey = req.headers.authentication
    getItem(sessionKey)
    .then(result => {
        if (isAdminLogin) {
            return next()
        }
        if (isAdminAuth) {
            req.admin = result
        } else {
            req.user = result
        }
        next()
    })
    .catch(err => {
        return next(sendError(err))
    })
}

module.exports = {
    isAuth
}
