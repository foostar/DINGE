/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-ctrl
 */
import User from "../model/user"
import Report from "../model/report"
import passport from "passport"
import jwt from "jwt-simple"
import fs from "fs"
import path from "path"
import { setItem, setExpire, getItem } from "../redis/redis"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { sendError, Regexp } from "../utils/util.js"

/*
 * 注册接口方法
 */
exports.signUp = (req, res, next) => {
    const _user = req.body
    // 检测空账户
    if (!_user.email) {
        return next({ status: 400, msg: "邮箱不能为空" })
    }
    // 检测空密码
    if (!_user.password) {
        return next({ status: 400, msg: "密码不能为空" })
    }
    // 检测空昵称
    if (!_user.username) {
        return next({ status: 400, msg: "昵称不能为空" })
    }
    // 检测昵称不正确
    if (!Regexp.username.test(_user.username)) {
        return next({ status: 400, msg: "昵称格式错误，不能包括特殊字符切长度在9位之内。" })
    }
    // 账号格式不正确
    if (!Regexp.email.test(_user.email)) {
        return next({ status: 400, msg: "邮箱格式不正确" })
    }
    // 检测密码规范
    if (!Regexp.password.test(_user.password)) {
        return next({ status: 400, msg: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" })
    }
    // 检测重复用户
    User.findOne({ username: _user.email }).exec()
        .then((user) => {
            if (user && user.username) {
                return Promise.reject({ status: 400, msg: "邮箱已经被注册" })
            }
            return User.findOne({ nickname: _user.username })
        })
        .then((result) => {
            if (result && result.nickname) {
                return Promise.reject({ status: 400, msg: "用户名已经被注册" })
            }
            let _User = {
                username: _user.email,
                password: _user.password,
                nickname: _user.username,
                birthday: "1990-01-01",
                city    : "北京市,东城区",
                sex     : "男",
                avatar  : "/images/carouse/head.png"
            }
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(_user.password, salt, (error, hash) => {
                    if (error) {
                        return next(error)
                    }
                    _User.password = hash
                    new User(_User).save((erro) => {
                        if (erro) {
                            return Promise.reject({ status: 400, msg: "注册失败，请重试！" })
                        }
                        return res.json({ status: 1, msg: "注册成功" })
                    })
                })
            })
        })
        .catch(err => {
            next(sendError(err))
        })
}
/*
 * 登陆接口方法
 */
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
exports.signin = (req, res, next) => {
    console.log(111)
    passport.authenticate("local", (err, user, info) => {
        if (!user) {
            return Promise.reject(Object.assign({}, { status: 400 }, info))
        }
        createSession(user)
        .then((result) => {
            setItem(result.token, JSON.stringify(result.value))
            .then(() => {
                setExpire(result.token, parseInt(1800, 10))
                res.json({ status: 1, data: { token: result.token, userId: user._id } })
            })
        })
        .catch((error) => {
            next(sendError(error))
        })
    })(req, res, next)
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
/*
 * @desc 加载我关注的人
 * @tip  需要使用token
 */
exports.focusList = (req, res) => {
    let userId = jwt.decode(req.query.token, Tools.secret)
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" })
    }
    User.findById(userId).populate("lovedTo", "avatar nickname").exec()
    .then(result => {
        if (result) {
            res.json({ status: 1, data: result.lovedTo })
        } else {
            res.json({ status: -1, msg: "token不正确" })
        }
    })
}
/*
 * @desc 加载关注我的人
 * @tip  需要使用token
 */
exports.focusFromList = (req, res) => {
    let userId = jwt.decode(req.query.token, Tools.secret)
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" })
    }
    User.findById(userId).populate("lovedFrom", "avatar nickname -_id").exec()
    .then(result => {
        if (result) {
            res.json({ status: 1, data: result.lovedFrom })
        } else {
            res.json({ status: -1, msg: "token不正确" })
        }
    })
}
/*
 * @desc 关注用户
 * @tip  需要使用token
 */
exports.focusUser = (req, res, next) => {
    const userInfo = JSON.parse(req.user)
    const id = userInfo._id
    const { userId, type, isList, page } = req.body
    if (!userId || (type == "unfocus" && isList && !page) || !type) {
        return next({ status: 400, msg: "缺少必要的参数" })
    }
    if (id == userId) {
        return next({ status: 400, msg: "不能关注自己" })
    }
    // 关注列表删除返回下一个用户
    const addnewUser = (result) => {
        const data = {
            isFixed: false,
            isOver : true,
            result : {}
        }
        if (result[0].n == 1 && result[1].n == 1) {
            data.isFixed = true
            if (type == "unfocus" && isList) {
                data.isOver = false
                User.findById(id).populate("lovedTo", "avatar nickname").exec()
                .then(user => {
                    data.result = user
                    return Promise.resolve(data)
                })
            }
        }
        return Promise.resolve(data)
    }
    // 添加我关注的人、添加人的粉丝
    let focus = User.update({ _id: id }, { $addToSet: { lovedTo: userId } }).exec()
    let froms = User.update({ _id: userId }, { $addToSet: { lovedFrom: id } }).exec()
    if (type == "unfocus") {
        focus = User.update({ _id: id }, { $pull: { lovedTo: userId } }).exec()
        froms = User.update({ _id: userId }, { $pull: { lovedFrom: id } }).exec()
    }
    Promise.all([ focus, froms ])
    .then(addnewUser)
    .then((result) => {
        if (!result.isFixed) return next({ status: 400, msg: "修改失败" })
        if (result.isOver) return res.json({ status: 1, msg: "修改成功" })
        const index = page * 10 - 1
        const lovedTo = result.result.lovedTo || []
        if (index > lovedTo.length) {
            return next({ status: 400, msg: "已经到底啦！" })
        }
        const data = lovedTo[index]
        res.json({ status: 1, data })
    })
    .catch((err) => {
        next(sendError(err))
    })
}
/*
 * @desc 获取用户信息
 * @tip  需要使用token
 */
exports.getUserInfo = (req, res, next) => {
    const userInfo = JSON.parse(req.user)
    User.findById(userInfo._id).exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
            return next({ status: 400, msg: "查找用户失败" })
        })
        .catch((err) => {
            return next({ status: 400, msg: "查找用户失败", errmsg: err })
        })
}
/*
 * @desc 编辑用户资料
 * @tip  需要使用token
 */
exports.editUserInfo = (req, res, next) => {
    const userInfo = JSON.parse(req.user)
    const body = req.body
    User.update({ _id: userInfo._id }, { $set: body }).exec()
        .then((data) => {
            if (data.n && data.n == 1) {
                return res.json({ status: 1, msg: "修改成功" })
            }
            return next({ status: 400, msg: "修改失败" })
        })
        .catch((err) => {
            return next({ status: 400, msg: "网络请求出错，请重试", errmsg: err })
        })
}
/*
 * @desc 上传用户头像
 * @tip  需要使用token
 */
exports.getAvatar = (req, res) => {
    const token = req.body.userId
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    // 接收前台POST过来的base64
    let imgData = req.body.formFile
    // 过滤data:URL
    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "")
    let dataBuffer = new Buffer(base64Data, "base64")
    let timestamp = Date.now()
    let poster = `${timestamp}.png`
    let newPath = path.join(__dirname, "../../", `public/carouse/${poster}`)
    fs.writeFile(newPath, dataBuffer, (err) => {
        if (err) {
            return res.json({ status: -1, msg: "上传失败！" })
        }
        User.findById(userId).exec()
            .then((result) => {
                result.avatar = newPath
                return result.save()
            })
            .then((result) => {
                return res.json({ status: 1, url: result.avatar })
            })
    })
}
/*
 * @desc 查看浏览历史
 * @tip  需要使用token
 */
exports.getHistory = (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).populate("history", "title createdAt").exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
        }, (err) => {
            if (err) {
                return res.json({ status: -1, msg: "查询失败，请重试！" })
            }
        })
}
/*
 * @desc 查看他人资料
 */
exports.userInfo = (req, res, next) => {
    const { userId } = req.query
    let body
    User.findOne({ _id: userId, vaild: 0 })
        .then((data) => {
            if (!data) return Promise.reject({ status: 400, msg: "此用户不存在！" })
            body = {
                nickname : data.nickname,
                _id      : data._id,
                sign     : data.sign,
                avatar   : data.avatar,
                lovedTo  : data.lovedTo.length,
                lovedFrom: data.lovedFrom.length,
                focusAble: false
            }
            if (req.headers.authentication) {
                const sessionKey = req.headers.authentication
                return getItem(sessionKey).then((result) => {
                    return Promise.resolve({
                        focus: result,
                        sessionKey,
                        data
                    })
                })
            }
            return {
                noauth: 1,
            }
        })
        .then(result => {
            if (result.noauth) return res.json({ status: 1, data: body })
            const user = JSON.parse(result.focus)._id
            body.focusAble = result.data.lovedFrom.some(x => x.toString() == user)
            setExpire(result.sessionKey, parseInt(1800, 10))
            return res.json({ status: 1, data: body })
        })
        .catch(err => {
            if (err.errcode && err.errcode) {
                return res.json({ status: 1, data: body })
            }
            next(sendError(err))
        })
}
/*
 * @desc 拉入黑名单
 */
exports.blackList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const blackId = req.query.userId
    Promise.all([ User.findOne({ _id: userId, vaild: 0 }).exec(), User.findOne({ _id: blackId, vaild: 0 }).exec() ])
    .then((result) => {
        if (!result[0] || !result[1]) return Promise.reject({ status: 400, msg: "用户不存在或出现异常！" })
        return User.update({ _id: userId }, { $addToSet: { blackList: blackId } }).exec()
    })
    .then((result) => {
        if (result.n != 1) return Promise.reject({ status: 400, msg: "操作失败，请重试！" })
        res.json({ status: 1, msg: "操作成功!" })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 举报用户
 */
exports.reportUser = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const reportId = req.query.userId
    Promise.all([ User.findOne({ _id: userId, vaild: 0 }).exec(), User.findOne({ _id: reportId, vaild: 0 }).exec() ])
    .then((result) => {
        if (!result[0] || !result[1]) return Promise.reject({ status: 400, msg: "用户不存在或出现异常！" })
        return new Report({
            reportTo  : reportId,
            reportFrom: userId
        })
    })
    .then((err) => {
        if (err) return Promise.reject({ status: 400, msg: "操作失败，请重试！" })
        res.json({ status: 1, msg: "操作成功!" })
    })
    .catch(err => {
        next(sendError(err))
    })
}
