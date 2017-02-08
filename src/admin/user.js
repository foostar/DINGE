import bcrypt from "bcryptjs"
import { sendError, errorType, createSession } from "../utils/util.js"
import { setItem } from "../redis/redis"
import User from "../model/user"
/*
 * @desc 后台用户登录
 */
const compare = (target, resouce, user) => {
    return new Promise((reslove, reject) => {
        bcrypt.compare(target, resouce, (err, isMatch) => {
            if (err) {
                return reject(err)
            }
            if (!isMatch) return reject(errorType[509])
            reslove(user)
        })
    })
}
exports.login = (req, res, next) => {
    const { username, password } = req.body
    if (!username || !password) {
        return next(errorType[103])
    }
    User.findOne({ username, vaild: 5 })
        .then((user) => {
            if (!user) return Promise.reject(errorType[405])
            return compare(password, user.password, user)
        })
        .then((user) => {
            return createSession(user)
        })
        .then((result) => {
            return setItem(result.token, result.value)
        })
        .then((result) => {
            res.json({ status: 1, token: result.token })
        })
        .catch(err => {
            next(sendError(err))
        })
}
/*
 * @desc 加载用户列表
 */
exports.showList = (req, res, next) => {
    const page = req.query.page || 1
    const index = (page - 1) * 20
    Promise.all([ User.count({}),
        User.find({}).sort({ updatedAt: -1 })
        .limit(20)
        .skip(index)
        .exec()
    ])
    .then(([ count, data ]) => {
        res.json({
            status: 1,
            data  : {
                list    : data,
                totalNum: count
            }
        })
    }, err => {
        return next(sendError(err))
    })
}
