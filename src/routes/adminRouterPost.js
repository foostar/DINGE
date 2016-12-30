import User from "../admin/user"
import Common from "../common/common"
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = (app) => {
    // 增加电影(改为post)
    // app.get("/", (req, res) => {
    //     res.render("home", { title: "受益人" })
    // })
    // 增加banner图片
    app.post("/common/addCarousel", Common.addCarousel)
    // 加载用户列表
    app.get("/user/getUserlist", User.showList)
}
