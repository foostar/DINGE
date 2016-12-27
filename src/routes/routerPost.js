/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户接口
 */
import User from "../app/user"
import passport from "passport"
import local from "passport-local"
import userModel from "../model/user"
import Movie from "../app/movie"
import Comment from "../app/comment"
import Common from "../app/common"
import Message from "../app/message"
import { getItem, setExpire } from "../redis/redis"
import { sendError, Regexp } from "../utils/util.js"
import bcrypt from "bcryptjs"

const Strategy = local.Strategy

passport.serializeUser((user, cb) => {
    cb(null, user._id)
})
passport.deserializeUser((id, cb) => {
    userModel.find({ _id: id }).exec()
        .then((user) => {
            cb(null, user)
        })
})
passport.use(new Strategy({ usernameField: "email" },
    (username, password, cb) => {
        // 检测空账户
        if (!username) {
            return cb(null, false, { message: "邮箱不能为空" })
        }
        // 检测空密码
        if (!password) {
            return cb(null, false, { message: "密码不能为空" })
        }
        // 账号格式不正确
        if (!Regexp.email.test(username)) {
            return cb(null, false, { message: "邮箱格式不正确" })
        }
        // 检测密码规范
        if (!Regexp.password.test(password)) {
            return cb(null, false, { message: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" })
        }
        userModel.findOne({ username }).exec()
            .then((user) => {
                if (!user) {
                    return cb(null, false, { message: "用户不存在" })
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return cb(err)
                    }
                    if (!isMatch) return cb(null, false, { message: "密码与账户不匹配" })
                    return cb(null, user)
                })
            })
    })
)
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
module.exports = (app) => {
    /*
     *  @desc  common
     */
    // 加载首页轮播图
    app.get("/common/getCarousels", Common.getCarousels)
    // 搜索电影
    app.get("/common/search", Common.search)
    /*
     *  @desc  user相关
     */
    // 加载我关注的人
    app.get("/user/getUserFocuslist", User.focusList)
    // 加载关注我的人
    app.get("/user/getUserFocusFromlist", User.focusFromList)
    // 关注用户
    app.post("/user/FocusUser", isAuth, User.focusUser)
    // 用户注册api
    app.post("/user/signup", User.signUp)
    // 用户登录api
    app.post("/user/signin", User.signin)
    // 加载用户信息
    app.get("/user/getUserInfo", isAuth, User.getUserInfo)
    // 编辑用户信息
    app.post("/user/editUserInfo", isAuth, User.editUserInfo)
    // 上传头像
    app.post("/user/getAvatar", User.getAvatar)
    // 加载用户历史记录
    app.get("/user/getHistory", User.getHistory)
    // 加载他人资料
    app.get("/user/userInfo", User.userInfo)
    // 拉入黑名单
    app.get("/user/blackList", isAuth, User.blackList)
    // 举报用户
    app.get("/user/reportUser", User.reportUser)
    /*
     *  @desc  movie相关
     */
    // 电影详情
    app.get("/movie/movieFindOne", Movie.find)
    // 电影列表
    app.get("/movie/showMovieList", Movie.find)
    // 添加电影
    app.post("/movie/addMovie", Movie.addMovie)
    /*
     *  @desc  comment相关
     */
    // 评论电影
    app.post("/comment/commentMovie", isAuth, Comment.save)
    // 加载评论
    app.get("/comment/getComments", Comment.getCommentsList)
    // 加载我的影评
    app.get("/comment/myComments", Comment.getMyComments)
    // 评论别人的评论
    app.post("/comment/addComments", isAuth, Comment.addComments)
    // 查看评论详情
    app.get("/comment/commentsDetail", Comment.commentDetail)
    // 查看评论我的
    app.get("/comment/commentsToMe", Comment.commentsToMe)
    // 喜欢用户的评论
    app.post("/comment/addLike", isAuth, Comment.addLike)
    // 收藏评论
    app.post("/comment/collet", isAuth, Comment.collet)
    // 查看我收藏的评论
    app.get("/comment/getMyCollet", Comment.getMyCollet)
    /*
     *  @desc  message相关
     */
    // 发送私信
    app.post("/message/sendMessage", Message.sendMessage)
    // 私信列表
    app.get("/message/getMessageList", Message.getMessageList)
    // 查看私信详情
    app.get("/message/getMessageDetail", Message.getMessageDetail)
    /* eslint-disable */
    app.use((err, req, res, next) => {
        // next(err)
        res.status(err.status || 500).json(err)
    })
}
