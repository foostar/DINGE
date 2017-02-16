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
    User.findOne({ username, role: 1 })
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
exports.userlist = (req, res, next) => {
    const { page } = req.query
    const index = (page - 1) * 10
    delete req.query.page
    if (req.query.valid) {
        req.query.valid = parseInt(req.query.valid, 10)
    }
    req.query.role = 0
    Promise.all([
        User.count(req.query),
        User.find(req.query)
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(index)
        .exec()
    ])
    .then(([ totalNum, result ]) => {
        const list = []
        result.forEach((v) => {
            list.push({
                _id      : v._id,
                sign     : v.sign,
                sex      : v.sex,
                city     : v.city,
                birthday : v.birthday,
                role     : v.role,
                nickname : v.nickname,
                avatar   : v.avatar,
                lovedTo  : v.lovedTo.length,
                lovedFrom: v.lovedFrom.length,
                star     : v.star.length,
                collet   : v.collet.length,
                valid    : v.valid,
                comments : v.comments,
                createdAt: v.createdAt
            })
        })
        res.json({ status: 1, data: { totalNum, list, page } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 屏蔽用户
 */
exports.shut = (req, res, next) => {
    const { userId, type } = req.query
    User.update({ _id: userId }, { valid: type == "shut" ? 2 : 0 }).exec()
    .then((result) => {
        if (!result.ok) return Promise.reject(errorType[102])
        res.json({ status: 1, userId, type })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 更改密码
 */
exports.changePass = (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    User.findOne({ role: 1 })
    .then((user) => {
        if (!user) return Promise.reject(errorType[405])
        return compare(oldPassword, user.password, user)
    })
    .then(() => {
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(newPassword, salt, (erro, hash) => {
                if (erro) return
                User.update({ role: 1 }, { password: hash }).exec()
                .then(() => {
                    res.json(errorType[200])
                })
            })
        })
    })
    .catch(err => {
        next(sendError(err))
    })
}
