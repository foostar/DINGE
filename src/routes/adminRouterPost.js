import User from "../app/user"
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = (app) => {
    // 增加电影(改为post)
    app.get("/", (req, res) => {
        res.render("home", { title: "受益人" })
    })
    // 加载用户列表
    /*
     *  @desc  未来可能要挪到后台的功能
     */
    app.get("/getUserlist", User.showList)
}
