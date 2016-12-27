"use strict";

var _user = require("../app/user");

var _user2 = _interopRequireDefault(_user);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require("passport-local");

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _user3 = require("../model/user");

var _user4 = _interopRequireDefault(_user3);

var _movie = require("../app/movie");

var _movie2 = _interopRequireDefault(_movie);

var _comment = require("../app/comment");

var _comment2 = _interopRequireDefault(_comment);

var _common = require("../app/common");

var _common2 = _interopRequireDefault(_common);

var _message = require("../app/message");

var _message2 = _interopRequireDefault(_message);

var _redis = require("../redis/redis");

var _util = require("../utils/util.js");

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Strategy = _passportLocal2.default.Strategy; /**
                                                    * Created by @xiusiteng on 2016-11-23.
                                                    * @desc 用户接口
                                                    */


_passport2.default.serializeUser((user, cb) => {
    cb(null, user._id);
});
_passport2.default.deserializeUser((id, cb) => {
    _user4.default.find({ _id: id }).exec().then(user => {
        cb(null, user);
    });
});
_passport2.default.use(new Strategy({ usernameField: "email" }, (username, password, cb) => {
    // 检测空账户
    if (!username) {
        return cb(null, false, { message: "邮箱不能为空" });
    }
    // 检测空密码
    if (!password) {
        return cb(null, false, { message: "密码不能为空" });
    }
    // 账号格式不正确
    if (!_util.Regexp.email.test(username)) {
        return cb(null, false, { message: "邮箱格式不正确" });
    }
    // 检测密码规范
    if (!_util.Regexp.password.test(password)) {
        return cb(null, false, { message: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" });
    }
    _user4.default.findOne({ username }).exec().then(user => {
        if (!user) {
            return cb(null, false, { message: "用户不存在" });
        }
        _bcryptjs2.default.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return cb(err);
            }
            if (!isMatch) return cb(null, false, { message: "密码与账户不匹配" });
            return cb(null, user);
        });
    });
}));
const isAuth = (req, res, next) => {
    if (!req.headers.authentication) {
        return next({ status: 400, errcode: 100401, msg: "token为必传参数" });
    }
    const sessionKey = req.headers.authentication;
    (0, _redis.getItem)(sessionKey).then(result => {
        req.user = result;
        (0, _redis.setExpire)(sessionKey, parseInt(1800, 10));
        next();
    }).catch(err => {
        return next((0, _util.sendError)(err));
    });
};
module.exports = app => {
    /*
     *  @desc  common
     */
    // 加载首页轮播图
    app.get("/common/getCarousels", _common2.default.getCarousels);
    // 搜索电影
    app.get("/common/search", _common2.default.search);
    /*
     *  @desc  user相关
     */
    // 加载我关注的人
    app.get("/user/getUserFocuslist", _user2.default.focusList);
    // 加载关注我的人
    app.get("/user/getUserFocusFromlist", _user2.default.focusFromList);
    // 关注用户
    app.post("/user/FocusUser", isAuth, _user2.default.focusUser);
    // 用户注册api
    app.post("/user/signup", _user2.default.signUp);
    // 用户登录api
    app.post("/user/signin", _user2.default.signin);
    // 加载用户信息
    app.get("/user/getUserInfo", isAuth, _user2.default.getUserInfo);
    // 编辑用户信息
    app.post("/user/editUserInfo", isAuth, _user2.default.editUserInfo);
    // 上传头像
    app.post("/user/getAvatar", _user2.default.getAvatar);
    // 加载用户历史记录
    app.get("/user/getHistory", _user2.default.getHistory);
    // 加载他人资料
    app.get("/user/userInfo", _user2.default.userInfo);
    // 拉入黑名单
    app.get("/user/blackList", isAuth, _user2.default.blackList);
    // 举报用户
    app.get("/user/reportUser", _user2.default.reportUser);
    /*
     *  @desc  movie相关
     */
    // 电影详情
    app.get("/movie/movieFindOne", _movie2.default.find);
    // 电影列表
    app.get("/movie/showMovieList", _movie2.default.find);
    // 添加电影
    app.post("/movie/addMovie", _movie2.default.addMovie);
    /*
     *  @desc  comment相关
     */
    // 评论电影
    app.post("/comment/commentMovie", isAuth, _comment2.default.save);
    // 加载评论
    app.get("/comment/getComments", _comment2.default.getCommentsList);
    // 加载我的影评
    app.get("/comment/myComments", _comment2.default.getMyComments);
    // 评论别人的评论
    app.post("/comment/addComments", isAuth, _comment2.default.addComments);
    // 查看评论详情
    app.get("/comment/commentsDetail", _comment2.default.commentDetail);
    // 查看评论我的
    app.get("/comment/commentsToMe", _comment2.default.commentsToMe);
    // 喜欢用户的评论
    app.post("/comment/addLike", isAuth, _comment2.default.addLike);
    // 收藏评论
    app.post("/comment/collet", isAuth, _comment2.default.collet);
    // 查看我收藏的评论
    app.get("/comment/getMyCollet", _comment2.default.getMyCollet);
    /*
     *  @desc  message相关
     */
    // 发送私信
    app.post("/message/sendMessage", _message2.default.sendMessage);
    // 私信列表
    app.get("/message/getMessageList", _message2.default.getMessageList);
    // 查看私信详情
    app.get("/message/getMessageDetail", _message2.default.getMessageDetail);
    /* eslint-disable */
    app.use((err, req, res, next) => {
        // next(err)
        res.status(err.status || 500).json(err);
    });
};