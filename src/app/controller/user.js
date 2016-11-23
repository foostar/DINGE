/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-ctrl
 */
import Regexp from "../tools/regex"
import Tools from "../tools/tool"
import User from "../model/user"
import passport from "passport"
import jwt from "jwt-simple"
import fs from "fs"
import path from "path"
/*
 * 注册接口方法
 */
exports.signUp = (req, res) => {
    const _user = req.body
    // 检测空账户
    if (!_user.email) {
        return res.json({ status: -1, msg: "邮箱不能为空" })
    }
    // 检测空密码
    if (!_user.password) {
        return res.json({ status: -1, msg: "密码不能为空" })
    }
    // 检测空昵称
    if (!_user.username) {
        return res.json({ status: -1, msg: "昵称不能为空" })
    }
    // 检测昵称不正确
    if (!Regexp.username.test(_user.username)) {
        return res.json({ status: -1, msg: "昵称格式错误，不能包括特殊字符切长度在9位之内。" })
    }
    // 账号格式不正确
    if (!Regexp.email.test(_user.email)) {
        return res.json({ "status": -1, msg: "邮箱格式不正确" })
    }
    // 检测密码规范
    if (!Regexp.password.test(_user.password)) {
        return res.json({ "status": -1, msg: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" })
    }
    // 检测重复用户
    User.findOne({ username: _user.email }).exec()
        .then((user) => {
            if (user) {
                return res.json({ status: -1, msg: "邮箱已经被注册" })
            }
            return User.find({ nickname: _user.username }).exec()
        })
        .then((result) => {
            if (result) {
                return res.json({ status: -1, msg: "邮箱已经被注册" })
            }
            let _User = new User({
                username: _user.email,
                password: _user.password,
                nickname: _user.nickname,
                birthday: "1990-01-01",
                city    : "北京市,东城区",
                sex     : "男",
                avatar  : "/carouse/head.png"
            })
            _User.save((err) => {
                if (err) {
                    return res.json({ status: -1, msg: "注册失败，请重试！" })
                }
                return res.json({ status: 1, msg: "" })
            })
        })
}
/*
 * 登陆接口方法
 */
exports.signin = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (!user) {
            const response = Tools.merge({}, { status: -1 }, info)
            return res.json(response)
        }
        const token = jwt.encode(user._id, Tools.secret)
        // 模拟token
        req.session.token = token
        res.json({ status: 1, data: { token } })
    })(req, res, next)
}
/*
 * @desc 加载用户列表
 */
exports.showList = (req, res) => {
    User.find({}).exec()
    .then((result) => {
        if (result) {
            res.json({ status: 1, data: result })
        }
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
exports.focusUser = (req, res) => {
    let userId = jwt.decode(req.body.token, Tools.secret)
    let foucsTo = req.body.userId
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" })
    }
    User.findById(userId).exec()
        .then(result => {
            if (result) {
                return User.find({ lovedTo: foucsTo }).exec()
            }
            return res.json({ status: -1, msg: "token不正确" })
        })
        .then(result => {
            if (result.length < 1 || !result) {
                // 添加我关注的人、添加人的粉丝
                let focus = User.update({ _id: userId }, { $push: { lovedTo: foucsTo } }).exec()
                let froms = User.update({ _id: foucsTo }, { $push: { lovedFrom: userId } }).exec()
                return Promise.all([ focus, froms ])
            }
            return res.json({ status: -1, msg: "您已经关注过了这个用户" })
        })
        .then(result => {
            if (result[0].n == 1 && result[1].n == 1) {
                res.json({ status: 1, msg: "修改成功" })
            } else {
                res.json({ status: -1, msg: "修改失败" })
            }
        })
}
/*
 * @desc 取消关注用户
 * @tip  需要使用token
 */
exports.unFocusUser = (req, res) => {
    let userId = jwt.decode(req.body.token, Tools.secret)
    let foucsTo = req.body.userId
    const page = req.body.page
    const index = page * 10 - 1
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" })
    }
    User.findById(userId).exec()
        .then(result => {
            if (result) {
                let focus = User.update({ _id: userId }, { $pull: { lovedTo: foucsTo } }).exec()
                let froms = User.update({ _id: foucsTo }, { $pull: { lovedTo: userId } }).exec()
                return Promise.all([ focus, froms ])
            }
            return res.json({ status: -1, msg: "token不正确" })
        })
        .then(result => {
            if (result[0].n == 1 && result[1].n == 1) {
                return User.findById(userId).populate("lovedFrom", "avatar nickname").exec()
            }
            res.json({ status: -1, msg: "修改失败" })
        })
        .then(result => {
            if (result) {
                if (index < result.lovedFrom.length) {
                    const data = result.lovedFrom[index]
                    return res.json({ status: 1, data })
                }
                res.json({ status: 1, msg: "修改成功！" })
            }
        })
}
/*
 * @desc 获取用户信息
 * @tip  需要使用token
 */
exports.getUserInfo = (req, res) => {
    const token = req.query.token
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
            return res.json({ status: -1, msg: "查找用户失败" })
        }, (err) => {
            if (err) {
                return res.json({ status: -1, msg: "查找用户失败" })
            }
        })
}
/*
 * @desc 编辑用户资料
 * @tip  需要使用token
 */
exports.editUserInfo = (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).exec()
        .then((result) => {
            result.sex = req.body.sex
            result.sign = req.body.sign
            result.birthday = req.body.birthday
            result.city = req.body.city
            result.avatar = req.body.avatar
            result.save((err) => {
                if (err) {
                    return res.json({ status: -1, msg: "修改失败" })
                }
                return res.json({ status: 1, msg: "修改成功" })
            })
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
