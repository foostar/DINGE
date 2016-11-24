/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户接口
 */
import User from "../app/controller/user"
import passport from "passport"
import local from "passport-local"
import userModel from "../app/model/user"
import Regexp from "../app/tools/regex"
import Movie from "../app/controller/movie"
import Comment from "../app/controller/comment"
import Common from "../app/controller/common"
import Message from "../app/controller/message"

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
        userModel.findOne({ email: username }).exec()
            .then((user) => {
                if (!user) {
                    return cb(null, false, { message: "用户不存在" })
                }
                return cb(null, user)
                // user.comparePassword(password,function(err,isMatch){
                //     if(isMatch){
                //         return cb(null,user);
                //     }else{
                //         return cb(null, false, {message:"密码不匹配"});
                //     }
                // });
            })
    })
)
module.exports = (app) => {
    // 加载用户列表
    /*
     *  @desc  未来可能要挪到后台的功能
     */
    app.get("/getUserlist", User.showList)
    /*
     *  @desc  common
     */
    // 加载首页轮播图
    app.get("/common/getCarousels", Common.getCarousels)
    /*
     *  @desc  user相关
     */
    // 加载我关注的人
    app.get("/user/getUserFocuslist", User.focusList)
    // 加载关注我的人
    app.get("/user/getUserFocusFromlist", User.focusFromList)
    // 关注用户
    app.post("/user/FocusUser", User.focusUser)
    // 取消关注用户
    app.post("/user/unFocusUser", User.unFocusUser)
    // 用户注册api
    app.post("/user/signup", User.signUp)
    // 用户登录api
    app.post("/user/signin", User.signin)
    // 加载用户信息
    app.get("/user/getUserInfo", User.getUserInfo)
    // 编辑用户信息
    app.post("/user/editUserInfo", User.editUserInfo)
    // 上传头像
    app.post("/user/getAvatar", User.getAvatar)
    // 加载用户信息
    app.get("/user/getHistory", User.getHistory)
    /*
     *  @desc  movie相关
     */
    // 电影详情
    app.get("/movie/movieFindOne", Movie.find)
    // 电影列表
    app.get("/movie/showMovieList", Movie.find)
    // 搜索电影
    app.get("/movie/serchMovie", Movie.search)
    /*
     *  @desc  comment相关
     */
    // 评论电影
    app.post("/comment/commentMovie", Comment.save)
    // 加载评论
    app.get("/comment/getComments", Comment.getCommentsList)
    // 加载我的影评
    app.get("/comment/myComments", Comment.getMyComments)
    // 评论别人的评论
    app.post("/comment/addComments", Comment.addComments)
    // 查看评论详情
    app.get("/comment/commentsDetail", Comment.commentDetail)
    // 查看评论我的
    app.get("/comment/commentsToMe", Comment.commentsToMe)
    // 喜欢用户的评论
    app.post("/comment/addLike", Comment.addLike)
    // 收藏评论
    app.post("/comment/addCollet", Comment.addCollet)
    // 取消收藏评论
    app.post("/comment/unCollet", Comment.unCollet)
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
}
