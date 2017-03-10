"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _util = require("../utils/util.js");

var _redis = require("../redis/redis");

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @desc 后台用户登录
 */
const compare = (target, resouce, user) => {
    return new Promise((reslove, reject) => {
        _bcryptjs2.default.compare(target, resouce, (err, isMatch) => {
            if (err) {
                return reject(err);
            }
            if (!isMatch) return reject(_util.errorType[509]);
            reslove(user);
        });
    });
};
exports.login = (req, res, next) => {
    var _req$body = req.body;
    const username = _req$body.username,
          password = _req$body.password;

    if (!username || !password) {
        return next(_util.errorType[103]);
    }
    _user2.default.findOne({ username, role: 1 }).then(user => {
        if (!user) return Promise.reject(_util.errorType[405]);
        return compare(password, user.password, user);
    }).then(user => {
        return (0, _util.createSession)(user);
    }).then(result => {
        return (0, _redis.setItem)(result.token, result.value);
    }).then(result => {
        res.json({ status: 1, token: result.token });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 加载用户列表
 */
exports.userlist = (req, res, next) => {
    const page = req.query.page;

    const index = (page - 1) * 10;
    delete req.query.page;
    if (req.query.valid) {
        req.query.valid = parseInt(req.query.valid, 10);
    }
    req.query.role = 0;
    Promise.all([_user2.default.count(req.query), _user2.default.find(req.query).sort({ createdAt: -1 }).limit(10).skip(index).exec()]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            result = _ref2[1];

        const list = [];
        result.forEach(v => {
            list.push({
                _id: v._id,
                sign: v.sign,
                sex: v.sex,
                city: v.city,
                birthday: v.birthday,
                role: v.role,
                nickname: v.nickname,
                avatar: v.avatar,
                lovedTo: v.lovedTo.length,
                lovedFrom: v.lovedFrom.length,
                star: v.star.length,
                collet: v.collet.length,
                valid: v.valid,
                comments: v.comments,
                createdAt: v.createdAt
            });
        });
        res.json({ status: 1, data: { totalNum, list, page } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 屏蔽用户
 */
exports.shut = (req, res, next) => {
    var _req$query = req.query;
    const userId = _req$query.userId,
          type = _req$query.type;

    _user2.default.update({ _id: userId }, { valid: type == "shut" ? 2 : 0 }).exec().then(result => {
        if (!result.ok) return Promise.reject(_util.errorType[102]);
        res.json({ status: 1, userId, type });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 更改密码
 */
exports.changePass = (req, res, next) => {
    var _req$body2 = req.body;
    const oldPassword = _req$body2.oldPassword,
          newPassword = _req$body2.newPassword;

    _user2.default.findOne({ role: 1 }).then(user => {
        if (!user) return Promise.reject(_util.errorType[405]);
        return compare(oldPassword, user.password, user);
    }).then(() => {
        _bcryptjs2.default.genSalt(10, (error, salt) => {
            _bcryptjs2.default.hash(newPassword, salt, (erro, hash) => {
                if (erro) return;
                _user2.default.update({ role: 1 }, { password: hash }).exec().then(() => {
                    res.json(_util.errorType[200]);
                });
            });
        });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};