"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 评论相关-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _comment2 = require("../model/comment");

var _comment3 = _interopRequireDefault(_comment2);

var _reply = require("../model/reply");

var _reply2 = _interopRequireDefault(_reply);

var _redis = require("../redis/redis");

var _util = require("../utils/util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @desc 创建一条电影评论
 */
exports.save = (req, res, next) => {
    const id = JSON.parse(req.user)._id;
    const _comment = req.body;
    if (!_comment.title || !_comment.content || !_util.Regexp.xsscos.test(_comment.title) || !_util.Regexp.xsscos.test(_comment.content)) {
        return next({ status: 400, msg: "缺少必要的参数或传入参数不合法" });
    }
    if (_comment.title.length > 20) {
        return next({ status: 400, msg: "标题不能超过20个字符！" });
    }
    if (_comment.content.length > 1000) {
        return next({ status: 400, msg: "评论内容过长！" });
    }
    _user2.default.findOne({ _id: id }).exec().then(result => {
        if (!result) {
            return Promise.reject({ status: 400, msg: "操作失败" });
        }
        _comment.commentFrom = id;
        return _comment;
    }).then(comment => {
        new _comment3.default(comment).save(() => {
            return res.json({ status: 1, msg: "评论成功" });
        });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 查看用户的评论 筛选：电影/首页
 */
exports.getCommentsList = (req, res, next) => {
    var _req$query = req.query;
    const movieId = _req$query.movieId,
          page = _req$query.page,
          rights = _req$query.rights,
          userId = _req$query.userId;

    const index = (page - 1) * 20;
    if (movieId) {
        return Promise.all([_comment3.default.count({ movie: movieId }), _comment3.default.find({ movie: movieId }).sort({ updatedAt: -1 }).limit(20).skip(index).populate("commentFrom", "nickname").exec()]).then((_ref) => {
            var _ref2 = _slicedToArray(_ref, 2);

            let count = _ref2[0],
                result = _ref2[1];

            if (!result) {
                return Promise.reject({ status: 400, msg: "操作失败" });
            }
            res.json({
                status: 1,
                data: {
                    list: result,
                    totalNum: count
                }
            });
        }).catch(err => {
            next((0, _util.sendError)(err));
        });
    }
    if (userId) {
        return Promise.all([_comment3.default.count({ commentFrom: userId }), _comment3.default.find({ commentFrom: userId }).sort({ updatedAt: -1 }).limit(20).skip(index).populate("commentFrom", "nickname").exec()]).then((_ref3) => {
            var _ref4 = _slicedToArray(_ref3, 2);

            let count = _ref4[0],
                result = _ref4[1];

            if (!result) {
                return Promise.reject({ status: 400, msg: "操作失败" });
            }
            res.json({
                status: 1,
                data: {
                    list: result,
                    totalNum: count
                }
            });
        }).catch(err => {
            next((0, _util.sendError)(err));
        });
    }
    Promise.all([_comment3.default.count({ weight: { $gte: rights } }), _comment3.default.find({ weight: { $gte: rights } }).populate([{
        path: "commentFrom",
        select: "avatar nickname -_id"
    }, {
        path: "movie",
        select: "images.small -_id"
    }]).sort({ updatedAt: -1 }).limit(20).skip(index).exec()]).then((_ref5) => {
        var _ref6 = _slicedToArray(_ref5, 2);

        let count = _ref6[0],
            result = _ref6[1];

        if (!result) {
            return Promise.reject({ status: 400, msg: "操作失败" });
        }
        res.json({
            status: 1,
            data: {
                list: result,
                totalNum: count
            }
        });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 查看我的所有电影评论 ops：列表
 */
exports.getMyComments = (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    _user2.default.findById(userId).exec().then(result => {
        if (!result) {
            return res.json({ status: -1, msg: "token错误" });
        }
        return _comment3.default.fetch({ commentFrom: userId }).populate([{
            path: "movie",
            select: "title -_id"
        }, {
            path: "commentFrom"
        }]).exec();
    }).then(result => {
        if (result) {
            return res.json({ status: 1, data: result });
        }
    });
};
/*
 * @desc 评论其他用户的评论
 */
const saveReply = opts => {
    return new Promise((reslove, reject) => {
        new _reply2.default(opts).save((err, reply) => {
            if (err) return reject(err);
            reslove(reply);
        });
    });
};
exports.addComments = (req, res, next) => {
    var _req$body = req.body;
    const commentTo = _req$body.commentTo,
          commentFrom = _req$body.commentFrom,
          commentId = _req$body.commentId,
          content = _req$body.content;

    if (!commentTo || !commentFrom || !commentId || !content || _util.Regexp.xsscos.test(content)) {
        return next({ status: 400, msg: "缺少必要的参数，或者传入参数不合法!" });
    }
    saveReply(req.body).then(reply => {
        const replyId = reply._id;
        return _comment3.default.update({ _id: commentId }, { $push: { reply: replyId } }).exec();
    }).then(result => {
        if (result.n != 1) {
            return Promise.reject({ status: 400, msg: "修改失败！" });
        }
        res.json({ status: 1, msg: "评论成功!" });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 评论详情
 */

exports.commentDetail = (req, res, next) => {
    var _req$query2 = req.query;
    const commentId = _req$query2.commentId,
          token = _req$query2.token;

    if (!commentId) {
        return res.json({ status: -1, msg: "缺少评论id" });
    }
    let userId;
    // 设置访问历史
    const setHistory = new Promise((reslove, reject) => {
        if (!token) {
            reslove();
        }
        return (0, _redis.getItem)(token).then(result => {
            userId = JSON.parse(result)._id;
            return _user2.default.findOne({ _id: userId }).exec();
        }).then(data => {
            let history = _user2.default.update({ _id: userId }, { $pop: { history: 1 } }).then(result => {
                if (result.n != 1) return Promise.reject({ status: 400, msg: "修改失败！" });
                return _user2.default.update({ _id: userId }, { $addToSet: { history: commentId } });
            });
            if (data.history.length < 10) {
                history = _user2.default.update({ _id: userId }, { $addToSet: { history: commentId } });
            }
            return history;
        }).then(() => {
            (0, _redis.setExpire)(token, parseInt(1800, 10));
            reslove();
        }).catch(err => {
            return reject((0, _util.sendError)(err));
        });
    });
    // 先修改reading数量
    Promise.all([setHistory, _comment3.default.update({ _id: commentId }, { $inc: { reading: 1 } })]).then(comment => {
        if (comment[1].n != 1) return Promise.reject({ status: 400, msg: "操作失败！" });
        // 查出详细信息
        return _comment3.default.findOne({ _id: commentId }).populate({ path: "reply", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec();
    }).then(result => {
        let colletful = true;
        let starNumber = result.star;
        let colletNumber = result.collet.length;
        if (!result) {
            return Promise.reject({ status: -1, msg: "缺少评论id" });
        }
        if (!userId) {
            result.colletful = true;
            return res.json({ status: 1, data: result, colletful, starNumber, colletNumber });
        }
        result.collet.forEach(v => {
            if (v == userId) {
                colletful = false;
            }
        });
        return res.json({ status: 1, data: result, colletful, starNumber, colletNumber });
    }).catch(err => {
        return next((0, _util.sendError)(err));
    });
};
/*
 * @desc 所有评论我的人
 */
exports.commentsToMe = (req, res) => {
    if (!req.query.token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const token = req.query.token;
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    _user2.default.findById(userId).exec().then(result => {
        if (!result) {
            return res.json({ status: -1, msg: "token错误" });
        }
        return _comment3.default.find({ commentFrom: userId }).populate([{
            path: "reply.commentFrom",
            select: "nickname avatar -_id"
        }, {
            path: "reply.commentTo",
            select: "nickname avatar -_id"
        }, {
            path: "commentFrom",
            select: "nickname avatar -_id"
        }, {
            path: "reply.commentId",
            select: "title"
        }]).exec();
        /*            "reply.commentFrom reply.commentTo commentFrom","email role -_id"*/
    }).then(result => {
        if (result) {
            let data = [];
            result.length.forEach(v => {
                data = data.concat(v.reply);
            });
            return res.json({ status: 1, data });
        }
        res.json({ status: -1, msg: "查找失败" });
    });
};
/*
 * @desc 喜欢用户的评论
 */
exports.addLike = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const commentId = req.body.commentId;
    Promise.all([_comment3.default.update({ _id: commentId }, { $addToSet: { star: userId } }).exec(), _user2.default.update({ _id: userId }, { $addToSet: { star: commentId } }).exec()]).then(() => {
        res.json({ status: 1, msg: "修改成功！" });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 收藏用户的评论
 */
exports.collet = (req, res, next) => {
    var _req$body2 = req.body;
    const commentId = _req$body2.commentId,
          type = _req$body2.type,
          isList = _req$body2.isList,
          page = _req$body2.page;

    const userId = JSON.parse(req.user)._id;
    let updateCommentP = _comment3.default.update({ _id: commentId }, { $addToSet: { collet: userId } }).exec();
    let updateUserP = _user2.default.update({ _id: userId }, { $addToSet: { collet: commentId } }).exec();
    if (type == "uncollet") {
        updateCommentP = _comment3.default.update({ _id: commentId }, { $pull: { collet: userId } }).exec();
        updateUserP = _user2.default.update({ _id: userId }, { $pull: { collet: commentId } }).exec();
    }
    const addnewUser = result => {
        const data = {
            isFixed: false,
            isOver: true,
            result: {}
        };
        if (result[0].n == 1 && result[1].n == 1) {
            data.isFixed = true;
            if (type == "uncollet" && isList) {
                data.isOver = false;
                _user2.default.findById(userId).populate({ path: "collet", select: "_id title content commentFrom", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec().then(user => {
                    data.result = user;
                    return Promise.resolve(data);
                });
            }
        }
        return Promise.resolve(data);
    };
    // 返回值
    Promise.all([updateCommentP, updateUserP]).then(addnewUser).then(result => {
        if (!result.isFixed) return next({ status: 400, msg: "修改失败" });
        if (result.isOver) return res.json({ status: 1, msg: "修改成功" });
        const index = page * 10 - 1;
        const colletTo = result.result.collet || [];
        if (index > colletTo.length) {
            return next({ status: 400, msg: "已经到底啦！" });
        }
        const data = colletTo[index];
        return res.json({ status: 1, data });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 我收藏的评论
 */
exports.getMyCollet = (req, res) => {
    if (!req.query.token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const token = req.query.token;
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    _user2.default.findById(userId).populate("collet", "title content commentFrom createdAt").exec().then(result => {
        if (result) {
            let opts = [{
                path: "collet.commentFrom",
                select: "nickname avatar",
                model: "User"
            }];
            _user2.default.populate(result, opts, (err, populateDoc) => {
                return res.json({ status: 1, data: populateDoc.collet });
            });
        }
    });
};