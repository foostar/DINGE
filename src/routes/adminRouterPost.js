import User from "../admin/user"
import Common from "../common/common"
import Movie from "../admin/movie"
import Comment from "../admin/comment"
import Advert from "../admin/ad"
import { isAuth } from "../middleware/middleware"
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = (app) => {
    /*
     *  @desc  common
     */
    // 查看举报的列表
    app.get("/common/reports", isAuth, Common.reports)
    /*
     *  @desc  movie相关
     */
    // 电影列表
    app.get("/movie/movielist", isAuth, Movie.find)
    // 豆瓣电影
    app.get("/movie/dbMovie", isAuth, Movie.dbMovie)
    // 添加电影
    app.post("/movie/addMovie", isAuth, Movie.addMovie)
    // 删除电影
    app.get("/movie/delete", isAuth, Movie.delMovie)
    /*
     *  @desc  user相关
     */
    // 后台用户登录
    app.post("/user/login", User.login)
    // 加载用户列表
    app.get("/user/userlist", isAuth, User.userlist)
    // 屏蔽用户
    app.get("/user/shut", isAuth, User.shut)
    // 更改密码
    app.post("/user/changepassword", isAuth, User.changePass)
    /*
     *  @desc  评论相关
     */
    // 评论列表
    app.get("/comment/commentlist", isAuth, Comment.find)
    // 评论列表
    app.get("/comment/shield", isAuth, Comment.shield)
    // 删除评论
    app.get("/comment/delete", isAuth, Comment.delete)
    // 更改权重
    app.get("/comment/changeWeight", isAuth, Comment.changeWeight)
    /*
     *  @desc  广告相关
     */
    // 添加广告
    app.post("/ad/addCarousel", isAuth, Advert.addCarousel)
    // 展示广告图片
    app.get("/ad/adlist", isAuth, Advert.adlist)
    // 展示广告图片
    app.get("/ad/delete", isAuth, Advert.delete)
    // 展示广告图片
    app.get("/ad/changeWeight", isAuth, Advert.changeWeight)
    // 查看手机定位
    // app.get("/geolocation", Common.location)
    // app.get("/saveLocation", Common.saveLocation)
    // app.get("/getLocation", Common.getLocation)
    // app.get("/getSetting", Common.getSetting)
    // app.get("/getCode", Common.getCode)
    /* eslint-disable */
    app.use((err, req, res, next) => {
        // next(err)
        res.status(err.status || 500).json(err)
    })
}
