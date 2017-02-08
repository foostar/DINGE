import User from "../admin/user"
import Common from "../common/common"
import Movie from "../admin/movie"
import { isAuth } from "../middleware/middleware"
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = (app) => {
    // 增加电影(改为post)
    // app.get("/", (req, res) => {
    //     res.render("home", { title: "受益人" })
    // })
    // 后台用户登录
    app.post("/login", User.login)
    // app.all("*", isAuth)
    // 增加banner图片
    app.post("/common/addCarousel", Common.addCarousel)
    // 加载用户列表
    app.get("/user/getUserlist", User.showList)
    // 电影列表
    app.get("/movielist", Movie.find)
    // 豆瓣电影
    app.get("/dbMovie", Movie.dbMovie)
    // 查看手机定位
    app.get("/geolocation", Common.location)
    app.get("/saveLocation", Common.saveLocation)
    app.get("/getLocation", Common.getLocation)
    app.get("/getSetting", Common.getSetting)
    app.get("/getCode", Common.getCode)
    /* eslint-disable */
    app.use((err, req, res, next) => {
        // next(err)
        res.status(err.status || 500).json(err)
    })
}
