/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = (app) => {
    // 增加电影(改为post)
    app.get("/", (req, res) => {
        res.render("home", { title: "受益人" })
    })
}
