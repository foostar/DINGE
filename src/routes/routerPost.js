/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户接口
 */
import User from "../app/user"
import Movie from "../app/movie"
import Comment from "../app/comment"
import Common from "../common/common"
import Message from "../app/message"
import { isAuth } from "../middleware/middleware"

module.exports = (app, io) => {
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
    app.get("/user/getUserFocuslist", isAuth, User.focusList)
    // 加载关注我的人
    app.get("/user/getUserFocusFromlist", isAuth, User.focusFromList)
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
    app.get("/user/getHistory", isAuth, User.getHistory)
    // 加载他人资料
    app.get("/user/userInfo", User.userInfo)
    // 拉入黑名单
    app.get("/user/blackList", isAuth, User.blackList)
    // 举报用户
    app.get("/user/reportUser", isAuth, User.reportUser)
    /*
     *  @desc  movie相关
     */
    // 电影详情
    app.get("/movie/movieFindOne", Movie.find)
    // 电影列表
    app.get("/movie/showMovieList", Movie.find)
    /*
     *  @desc  comment相关
     */
    // 评论电影
    app.post("/comment/commentMovie", isAuth, Comment.save)
    // 加载评论
    app.get("/comment/getComments", Comment.getCommentsList)
    // 加载我的影评
    app.get("/comment/myComments", isAuth, Comment.getMyComments)
    // 评论别人的评论
    app.post("/comment/addComments", isAuth, Comment.addComments)
    // 查看评论详情
    app.get("/comment/commentsDetail", Comment.commentDetail)
    // 查看评论我的
    app.get("/comment/commentsToMe", isAuth, Comment.commentsToMe)
    // 查看给我点赞的
    app.get("/comment/zanList", isAuth, Comment.zanList)
    // 喜欢用户的评论
    app.post("/comment/addLike", isAuth, Comment.addLike)
    // 收藏评论
    app.post("/comment/collet", isAuth, Comment.collet)
    // 查看我收藏的评论
    app.get("/comment/getMyCollet", isAuth, Comment.getMyCollet)
    /*
     *  @desc  message相关
     */
    // 发送私信
    app.post("/message/sendMessage", Message.sendMessage)
    // 私信列表
    app.get("/message/getMessageList", Message.getMessageList)
    // 查看私信详情
    app.get("/message/getMessageDetail", Message.getMessageDetail)
    // socket链接
    
    /* eslint-disable */
    app.use((err, req, res, next) => {
        // next(err)
        res.status(err.status || 500).json(err)
    })
}
