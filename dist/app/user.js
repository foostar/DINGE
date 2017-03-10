"use strict";

var _user2 = require("../model/user");

var _user3 = _interopRequireDefault(_user2);

var _report = require("../model/report");

var _report2 = _interopRequireDefault(_report);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _redis = require("../redis/redis");

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
        return next(_util.errorType[501]);
    }
    // 检测空密码
    if (!_user.password) {
        return next(_util.errorType[502]);
    }
    // 检测空昵称
    if (!_user.username) {
        return next(_util.errorType[503]);
    }
    // 检测昵称不正确
    if (!_util.Regexp.username.test(_user.username)) {
        return next(_util.errorType[504]);
    }
    // 账号格式不正确
    if (!_util.Regexp.email.test(_user.email)) {
        return next(_util.errorType[505]);
    }
    // 检测密码规范
    if (!_util.Regexp.password.test(_user.password)) {
        return next(_util.errorType[506]);
    }
    // 检测重复用户
    _user3.default.findOne({ username: _user.email }).exec().then(user => {
        if (user && user.username) {
            return Promise.reject(_util.errorType[507]);
        }
        return _user3.default.findOne({ nickname: _user.username });
    }).then(result => {
        if (result && result.nickname) {
            return Promise.reject(_util.errorType[508]);
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
                        return Promise.reject(_util.errorType[102]);
                    }
                    return res.json(_util.errorType[200]);
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
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户相关-ctrl
 */
exports.signin = (req, res, next) => {
    var _req$body = req.body;
    const email = _req$body.email,
          password = _req$body.password;

    _user3.default.findOne({ username: email }).exec().then(user => {
        if (!user) {
            return Promise.reject(_util.errorType[510]);
        }
        return new Promise((resolve, reject) => {
            _bcryptjs2.default.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return reject(_util.errorType[102]);
                }
                if (!isMatch) return reject(_util.errorType[511]);
                resolve(user);
            });
        });
    }).then(user => (0, _util.createSession)(user)).then(result => {
        (0, _redis.setItem)(result.token, JSON.stringify(result.value)).then(() => {
            res.json({ status: 1, data: { token: result.token, userId: result.value._id } });
        });
    }).catch(error => {
        next((0, _util.sendError)(error));
    });
};
/*
 * @desc 加载我关注的人
 * @tip  需要使用token
 */
exports.focusList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const page = req.query.page;

    const index = (page - 1) * 10;
    _user3.default.findOne({ _id: userId, valid: 0 }).populate("lovedTo", "avatar nickname sign").exec().then(result => {
        const data = {
            totalNum: result.lovedTo.length,
            list: result.lovedTo.slice(index, index + 10)
        };
        res.json({ status: 1, data });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 加载关注我的人
 * @tip  需要使用token
 */
exports.focusFromList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const page = req.query.page;

    const index = (page - 1) * 10;
    _user3.default.findById(userId).populate("lovedFrom", "avatar nickname sign").exec().then(result => {
        const data = {
            totalNum: result.lovedFrom.length,
            list: result.lovedFrom.slice(index, index + 10)
        };
        res.json({ status: 1, data });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 关注用户
 * @tip  需要使用token
 */
exports.focusUser = (req, res, next) => {
    const userInfo = JSON.parse(req.user);
    const id = userInfo._id;
    var _req$body2 = req.body;
    const userId = _req$body2.userId,
          type = _req$body2.type,
          isList = _req$body2.isList,
          page = _req$body2.page;

    if (!userId || type == "unfocus" && isList && !page || !type) {
        return next(_util.errorType[103]);
    }
    if (id == userId) {
        return next(_util.errorType[404]);
    }
    // 关注列表删除返回下一个用户
    const addnewUser = result => {
        const data = {
            isFixed: false,
            isOver: true,
            result: {}
        };
        console.log(result[0], result[1]);
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
        if (!result.isFixed) return next(_util.errorType[102]);
        if (result.isOver) return res.json(_util.errorType[200]);
        const index = page * 10 - 1;
        const lovedTo = result.result.lovedTo || [];
        if (index > lovedTo.length) {
            return res.json({ status: 1, data: {} });
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
        return res.json({ status: 1, data: result });
    }).catch(err => {
        next((0, _util.sendError)(err));
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
            return res.json(_util.errorType[200]);
        }
        return next(_util.errorType[102]);
    }).catch(err => {
        return next((0, _util.sendError)(err));
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
        _user3.default.findById().exec().then(result => {
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
exports.getHistory = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    _user3.default.findOne({ _id: userId }).populate("history", "title createdAt").exec().then(result => {
        if (!result) {
            return Promise.reject(_util.errorType[403]);
        }
        res.json({ status: 1, data: { totalNum: result.history.length, list: result.history } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 查看他人资料
 */
exports.userInfo = (req, res, next) => {
    const userId = req.query.userId;

    let body;
    _user3.default.findOne({ _id: userId, valid: 0 }).then(data => {
        if (!data) return Promise.reject(_util.errorType[403]);
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
        if (err.errcode && err.errcode == 101) {
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
    Promise.all([_user3.default.findOne({ _id: userId, valid: 0 }).exec(), _user3.default.findOne({ _id: blackId, valid: 0 }).exec()]).then(result => {
        if (!result[0] || !result[1]) return Promise.reject(_util.errorType[403]);
        return _user3.default.update({ _id: userId }, { $addToSet: { blackList: blackId } }).exec();
    }).then(result => {
        if (result.n != 1) return Promise.reject(_util.errorType[102]);
        res.json(_util.errorType[200]);
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
    Promise.all([_user3.default.findOne({ _id: userId, valid: 0 }).exec(), _user3.default.findOne({ _id: reportId, valid: 0 }).exec()]).then(result => {
        if (!result[0] || !result[1]) return Promise.reject(_util.errorType[403]);
        return new _report2.default({
            reportTo: reportId,
            reportFrom: userId
        }).save();
    }).then(() => {
        res.json(_util.errorType[200]);
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};