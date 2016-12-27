"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 用户相关-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _user2 = require("../model/user");

var _user3 = _interopRequireDefault(_user2);

var _report = require("../model/report");

var _report2 = _interopRequireDefault(_report);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _redis = require("../redis/redis");

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _util = require("../utils/util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * 注册接口方法
 */
exports.signUp = (req, res, next) => {
    const _user = req.body;
    // 检测空账户
    if (!_user.email) {
        return next({ status: 400, msg: "邮箱不能为空" });
    }
    // 检测空密码
    if (!_user.password) {
        return next({ status: 400, msg: "密码不能为空" });
    }
    // 检测空昵称
    if (!_user.username) {
        return next({ status: 400, msg: "昵称不能为空" });
    }
    // 检测昵称不正确
    if (!_util.Regexp.username.test(_user.username)) {
        return next({ status: 400, msg: "昵称格式错误，不能包括特殊字符切长度在9位之内。" });
    }
    // 账号格式不正确
    if (!_util.Regexp.email.test(_user.email)) {
        return next({ status: 400, msg: "邮箱格式不正确" });
    }
    // 检测密码规范
    if (!_util.Regexp.password.test(_user.password)) {
        return next({ status: 400, msg: "密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" });
    }
    // 检测重复用户
    _user3.default.findOne({ username: _user.email }).exec().then(user => {
        if (user && user.username) {
            return Promise.reject({ status: 400, msg: "邮箱已经被注册" });
        }
        return _user3.default.findOne({ nickname: _user.username });
    }).then(result => {
        if (result && result.nickname) {
            return Promise.reject({ status: 400, msg: "用户名已经被注册" });
        }
        let _User = {
            username: _user.email,
            password: _user.password,
            nickname: _user.username,
            birthday: "1990-01-01",
            city: "北京市,东城区",
            sex: "男",
            avatar: "/images/carouse/head.png"
        };
        _bcryptjs2.default.genSalt(10, (err, salt) => {
            _bcryptjs2.default.hash(_user.password, salt, (error, hash) => {
                if (error) {
                    return next(error);
                }
                _User.password = hash;
                new _user3.default(_User).save(erro => {
                    if (erro) {
                        return Promise.reject({ status: 400, msg: "注册失败，请重试！" });
                    }
                    return res.json({ status: 1, msg: "注册成功" });
                });
            });
        });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * 登陆接口方法
 */
const createSession = value => {
    return new Promise((reslove, reject) => {
        _crypto2.default.randomBytes(8, (err, buf) => {
            if (err) reject(err);
            const token = _crypto2.default.createHash("sha1").update(`${ JSON.stringify(value) }${ buf.toString("hex") }`).digest("hex").toString();
            reslove({ token, value });
        });
    });
};
exports.signin = (req, res, next) => {
    _passport2.default.authenticate("local", (err, user, info) => {
        if (!user) {
            return Promise.reject(Object.assign({}, { status: 400 }, info));
        }
        createSession(user).then(result => {
            (0, _redis.setItem)(result.token, JSON.stringify(result.value)).then(() => {
                (0, _redis.setExpire)(result.token, parseInt(1800, 10));
                res.json({ status: 1, data: { token: result.token, userId: user._id } });
            });
        }).catch(error => {
            next((0, _util.sendError)(error));
        });
    })(req, res, next);
};
/*
 * @desc 加载用户列表
 */
exports.showList = (req, res, next) => {
    const page = req.query.page || 1;
    const index = (page - 1) * 20;
    Promise.all([_user3.default.count({}), _user3.default.find({}).sort({ updatedAt: -1 }).limit(20).skip(index).exec()]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let count = _ref2[0],
            data = _ref2[1];

        res.json({
            status: 1,
            data: {
                list: data,
                totalNum: count
            }
        });
    }, err => {
        return next((0, _util.sendError)(err));
    });
};
/*
 * @desc 加载我关注的人
 * @tip  需要使用token
 */
exports.focusList = (req, res) => {
    let userId = _jwtSimple2.default.decode(req.query.token, Tools.secret);
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" });
    }
    _user3.default.findById(userId).populate("lovedTo", "avatar nickname").exec().then(result => {
        if (result) {
            res.json({ status: 1, data: result.lovedTo });
        } else {
            res.json({ status: -1, msg: "token不正确" });
        }
    });
};
/*
 * @desc 加载关注我的人
 * @tip  需要使用token
 */
exports.focusFromList = (req, res) => {
    let userId = _jwtSimple2.default.decode(req.query.token, Tools.secret);
    if (!userId) {
        return res.json({ status: -1, msg: "没有token" });
    }
    _user3.default.findById(userId).populate("lovedFrom", "avatar nickname -_id").exec().then(result => {
        if (result) {
            res.json({ status: 1, data: result.lovedFrom });
        } else {
            res.json({ status: -1, msg: "token不正确" });
        }
    });
};
/*
 * @desc 关注用户
 * @tip  需要使用token
 */
exports.focusUser = (req, res, next) => {
    const userInfo = JSON.parse(req.user);
    const id = userInfo._id;
    var _req$body = req.body;
    const userId = _req$body.userId,
          type = _req$body.type,
          isList = _req$body.isList,
          page = _req$body.page;

    if (!userId || type == "unfocus" && isList && !page || !type) {
        return next({ status: 400, msg: "缺少必要的参数" });
    }
    if (id == userId) {
        return next({ status: 400, msg: "不能关注自己" });
    }
    // 关注列表删除返回下一个用户
    const addnewUser = result => {
        const data = {
            isFixed: false,
            isOver: true,
            result: {}
        };
        if (result[0].n == 1 && result[1].n == 1) {
            data.isFixed = true;
            if (type == "unfocus" && isList) {
                data.isOver = false;
                _user3.default.findById(id).populate("lovedTo", "avatar nickname").exec().then(user => {
                    data.result = user;
                    return Promise.resolve(data);
                });
            }
        }
        return Promise.resolve(data);
    };
    // 添加我关注的人、添加人的粉丝
    let focus = _user3.default.update({ _id: id }, { $addToSet: { lovedTo: userId } }).exec();
    let froms = _user3.default.update({ _id: userId }, { $addToSet: { lovedFrom: id } }).exec();
    if (type == "unfocus") {
        focus = _user3.default.update({ _id: id }, { $pull: { lovedTo: userId } }).exec();
        froms = _user3.default.update({ _id: userId }, { $pull: { lovedFrom: id } }).exec();
    }
    Promise.all([focus, froms]).then(addnewUser).then(result => {
        if (!result.isFixed) return next({ status: 400, msg: "修改失败" });
        if (result.isOver) return res.json({ status: 1, msg: "修改成功" });
        const index = page * 10 - 1;
        const lovedTo = result.result.lovedTo || [];
        if (index > lovedTo.length) {
            return next({ status: 400, msg: "已经到底啦！" });
        }
        const data = lovedTo[index];
        res.json({ status: 1, data });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 获取用户信息
 * @tip  需要使用token
 */
exports.getUserInfo = (req, res, next) => {
    const userInfo = JSON.parse(req.user);
    _user3.default.findById(userInfo._id).exec().then(result => {
        if (result) {
            return res.json({ status: 1, data: result });
        }
        return next({ status: 400, msg: "查找用户失败" });
    }).catch(err => {
        return next({ status: 400, msg: "查找用户失败", errmsg: err });
    });
};
/*
 * @desc 编辑用户资料
 * @tip  需要使用token
 */
exports.editUserInfo = (req, res, next) => {
    const userInfo = JSON.parse(req.user);
    const body = req.body;
    _user3.default.update({ _id: userInfo._id }, { $set: body }).exec().then(data => {
        if (data.n && data.n == 1) {
            return res.json({ status: 1, msg: "修改成功" });
        }
        return next({ status: 400, msg: "修改失败" });
    }).catch(err => {
        return next({ status: 400, msg: "网络请求出错，请重试", errmsg: err });
    });
};
/*
 * @desc 上传用户头像
 * @tip  需要使用token
 */
exports.getAvatar = (req, res) => {
    const token = req.body.userId;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    // 接收前台POST过来的base64
    let imgData = req.body.formFile;
    // 过滤data:URL
    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = new Buffer(base64Data, "base64");
    let timestamp = Date.now();
    let poster = `${ timestamp }.png`;
    let newPath = _path2.default.join(__dirname, "../../", `public/carouse/${ poster }`);
    _fs2.default.writeFile(newPath, dataBuffer, err => {
        if (err) {
            return res.json({ status: -1, msg: "上传失败！" });
        }
        _user3.default.findById(userId).exec().then(result => {
            result.avatar = newPath;
            return result.save();
        }).then(result => {
            return res.json({ status: 1, url: result.avatar });
        });
    });
};
/*
 * @desc 查看浏览历史
 * @tip  需要使用token
 */
exports.getHistory = (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    _user3.default.findById(userId).populate("history", "title createdAt").exec().then(result => {
        if (result) {
            return res.json({ status: 1, data: result });
        }
    }, err => {
        if (err) {
            return res.json({ status: -1, msg: "查询失败，请重试！" });
        }
    });
};
/*
 * @desc 查看他人资料
 */
exports.userInfo = (req, res, next) => {
    const userId = req.query.userId;

    let body;
    _user3.default.findOne({ _id: userId, vaild: 0 }).then(data => {
        if (!data) return Promise.reject({ status: 400, msg: "此用户不存在！" });
        body = {
            nickname: data.nickname,
            _id: data._id,
            sign: data.sign,
            avatar: data.avatar,
            lovedTo: data.lovedTo.length,
            lovedFrom: data.lovedFrom.length,
            focusAble: false
        };
        if (req.headers.authentication) {
            const sessionKey = req.headers.authentication;
            return (0, _redis.getItem)(sessionKey).then(result => {
                return Promise.resolve({
                    focus: result,
                    sessionKey,
                    data
                });
            });
        }
        return {
            noauth: 1
        };
    }).then(result => {
        if (result.noauth) return res.json({ status: 1, data: body });
        const user = JSON.parse(result.focus)._id;
        body.focusAble = result.data.lovedFrom.some(x => x.toString() == user);
        (0, _redis.setExpire)(result.sessionKey, parseInt(1800, 10));
        return res.json({ status: 1, data: body });
    }).catch(err => {
        if (err.errcode && err.errcode) {
            return res.json({ status: 1, data: body });
        }
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 拉入黑名单
 */
exports.blackList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const blackId = req.query.userId;
    Promise.all([_user3.default.findOne({ _id: userId, vaild: 0 }).exec(), _user3.default.findOne({ _id: blackId, vaild: 0 }).exec()]).then(result => {
        if (!result[0] || !result[1]) return Promise.reject({ status: 400, msg: "用户不存在或出现异常！" });
        return _user3.default.update({ _id: userId }, { $addToSet: { blackList: blackId } }).exec();
    }).then(result => {
        if (result.n != 1) return Promise.reject({ status: 400, msg: "操作失败，请重试！" });
        res.json({ status: 1, msg: "操作成功!" });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 举报用户
 */
exports.reportUser = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const reportId = req.query.userId;
    Promise.all([_user3.default.findOne({ _id: userId, vaild: 0 }).exec(), _user3.default.findOne({ _id: reportId, vaild: 0 }).exec()]).then(result => {
        if (!result[0] || !result[1]) return Promise.reject({ status: 400, msg: "用户不存在或出现异常！" });
        return new _report2.default({
            reportTo: reportId,
            reportFrom: userId
        });
    }).then(err => {
        if (err) return Promise.reject({ status: 400, msg: "操作失败，请重试！" });
        res.json({ status: 1, msg: "操作成功!" });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};