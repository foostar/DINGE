"use strict";

require("isomorphic-fetch");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _cookieParser = require("cookie-parser");

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require("express-session");

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _connectMongo = require("connect-mongo");

var _connectMongo2 = _interopRequireDefault(_connectMongo);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _connectMultiparty = require("connect-multiparty");

var _connectMultiparty2 = _interopRequireDefault(_connectMultiparty);

var _promise = require("promise");

var _promise2 = _interopRequireDefault(_promise);

var _routerPost = require("./routes/routerPost");

var _routerPost2 = _interopRequireDefault(_routerPost);

var _adminRouterPost = require("./routes/adminRouterPost");

var _adminRouterPost2 = _interopRequireDefault(_adminRouterPost);

var _index = require("../config/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 建立服务

// var favicon = require("serve-favicon");
const app = (0, _express2.default)();
const adminApi = (0, _express2.default)();
const client = (0, _express2.default)();
// 配置跨域请求
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "authentication");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", "3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// 数据库配置
_mongoose2.default.connect(_index2.default.mongoUrl);
_mongoose2.default.Promise = _promise2.default;
const MongoStore = (0, _connectMongo2.default)(_expressSession2.default);
// 模板设定
app.set("views", _path2.default.join(__dirname, "../views"));
app.set("view engine", "pug");
// 静态资源加载
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use((0, _morgan2.default)("dev"));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use((0, _cookieParser2.default)());
app.use(_express2.default.static(_path2.default.join(__dirname, "../public")));
app.use((0, _connectMultiparty2.default)());
// 本地调试报错
// if (app.get("env") == "development") {
//     app.set("showStackError", true)
//     app.use(logger(":method :url :status"))
//     mongoose.set("debug", true)
// }
// 设置session
app.use((0, _expressSession2.default)({
    secret: "yeah",
    name: "keyvalue",
    store: new MongoStore({
        url: _index2.default.mongoUrl,
        collection: "sessions"
    }),
    cookie: { maxAge: 259200000 },
    resave: true,
    saveUninitialized: true
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());
// 设置公共路径

app.use("/admin/api", adminApi);
app.use("/Api", client);
// 用户端API
(0, _routerPost2.default)(client);
// 后台管理API
(0, _adminRouterPost2.default)(adminApi);
// catch 404
// app.use((err, req, res, next) => {
//     console.log("err", err)
//     // const err = new Error("Not Found")
//     // err.status = 404
//     // next(err)
// })
// 错误处理
const server = app.listen(8686, () => {
    const host = server.address().address || "localhost";
    const port = server.address().port;
    console.log("dinge start, listening at http://%s:%s", host, port);
});