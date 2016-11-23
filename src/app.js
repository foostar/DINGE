import "isomorphic-fetch"
import express from "express"
import path from "path"
// var favicon = require("serve-favicon");
import logger from "morgan"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import session from "express-session"
import mongoose from "mongoose"
import send from "send"
import connect from "connect-mongo"
import passport from "passport"
import multiparty from "connect-multiparty"
import promise from "promise"
import userApi from "./routes/routerPost"
import adminApi from "./routes/adminRouterPost"

const app = express()
const admin = express()
const MongoStore = connect(session)
const dbUrl = "mongodb://localhost/dinge"
mongoose.Promise = promise
mongoose.connect(dbUrl)
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
app.set("jwtTokenSecret", "international meeting")

if (app.get("env") == "development") {
    app.set("showStackError", true)
    app.use(logger(":method :url :status"))
    mongoose.set("debug", true)
}
app.use(session({
    secret: "imooc",
    name  : "keyvalue",
    store : new MongoStore({
        url       : dbUrl,
        collection: "sessions"
    }),
    resave           : true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use("/admin", admin)
// 用户端API
userApi(app)
// 后台管理API
adminApi(app)
// catch 404
app.use((req, res, next) => {
    const err = new Error("Not Found")
    err.status = 404
    next(err)
})
// 错误处理
app.use((err, req, res) => {
    res.status(err.status || 500)
    send(req, path.join(__dirname, "../public/404.html")).pipe(res)
})
const server = app.listen(8686, () => {
    const host = server.address().address
    const port = server.address().port
    console.log("xiaoyun-app-wallet start, listening at http://%s:%s", host, port)
})
