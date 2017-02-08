import "isomorphic-fetch"
import express from "express"
import path from "path"
// var favicon = require("serve-favicon");
import logger from "morgan"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import session from "express-session"
import mongoose from "mongoose"
import connect from "connect-mongo"
import passport from "passport"
import multiparty from "connect-multiparty"
import promise from "promise"
import clientRouter from "./routes/routerPost"
import adminApiRouter from "./routes/adminRouterPost"
import config from "../config/index"
// 建立服务
const app = express()
const adminApi = express()
const client = express()
// 配置跨域请求
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    // res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Headers", "authentication,content-type")
    // res.header("Access-Control-Allow-Headers", "authorization")
    res.header("X-Powered-By", "3.2.1")
    // res.header("Content-Type", "application/json;charset=utf-8")
    next()
})
// 数据库配置
mongoose.connect(config.mongoUrl)
mongoose.Promise = promise
const MongoStore = connect(session)
// 模板设定
app.set("views", path.join(__dirname, "../views"))
app.set("view engine", "pug")
// 静态资源加载
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "../public")))
app.use(multiparty())
// 本地调试报错
// if (app.get("env") == "development") {
//     app.set("showStackError", true)
//     app.use(logger(":method :url :status"))
//     mongoose.set("debug", true)
// }
// 设置session
app.use(session({
    secret: "yeah",
    name  : "keyvalue",
    store : new MongoStore({
        url       : config.mongoUrl,
        collection: "sessions"
    }),
    cookie           : { maxAge: 259200000 },
    resave           : true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
// 设置公共路径

app.use("/admin/api", adminApi)
app.use("/Api", client)
// 用户端API
clientRouter(client)
// 后台管理API
adminApiRouter(adminApi)
// catch 404
// app.use((err, req, res, next) => {
//     console.log("err", err)
//     // const err = new Error("Not Found")
//     // err.status = 404
//     // next(err)
// })
// 错误处理
const server = app.listen(8686, () => {
    const host = server.address().address || "localhost"
    const port = server.address().port
    console.log("dinge start, listening at http://%s:%s", host, port)
})
