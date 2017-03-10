"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 评论相关-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _user = require("../model/user");

var _user2 = _interopRequireDefault(_user);

var _comment2 = require("../model/comment");

var _comment3 = _interopRequireDefault(_comment2);

var _reply = require("../model/reply");

var _reply2 = _interopRequireDefault(_reply);

var _zanlist = require("../model/zanlist");

var _zanlist2 = _interopRequireDefault(_zanlist);

var _redis = require("../redis/redis");

var _util = require("../utils/util.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @desc 创建一条电影评论
 */
exports.save = (req, res, next) => {
    console.log(req.user);
    const id = JSON.parse(req.user)._id;
    const _comment = req.body;
    if (!_comment.title || !_comment.content) {
        return next(_util.errorType[103]);
    }
    if (_comment.title.length > 20) {
        return next(_util.errorType[401]);
    }
    if (_comment.content.length > 1000) {
        return next(_util.errorType[402]);
    }
    _user2.default.findOne({ _id: id }).exec().then(result => {
        if (!result) {
            return Promise.reject(_util.errorType[102]);
        }
        _comment.commentFrom = id;
        return _comment;
    }).then(comment => {
        new _comment3.default(comment).save(() => {
            return res.json(_util.errorType[200]);
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
          userId = _req$query.userId;

    const index = (page - 1) * 20;
    if (movieId) {
        return Promise.all([_comment3.default.count({ movie: movieId }), _comment3.default.find({ movie: movieId }).sort({ updatedAt: -1 }).limit(20).skip(index).populate("commentFrom", "nickname").exec()]).then((_ref) => {
            var _ref2 = _slicedToArray(_ref, 2);

            let count = _ref2[0],
                result = _ref2[1];

            if (!result) {
                return Promise.reject(_util.errorType[102]);
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
                return Promise.reject(_util.errorType[102]);
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
    Promise.all([_comment3.default.count({ weight: 3 }), _comment3.default.find({ weight: 3 }).populate([{
        path: "commentFrom",
        select: "avatar nickname -_id"
    }, {
        path: "movie",
        select: "images.large -_id"
    }]).sort({ updatedAt: -1 }).limit(20).skip(index).exec()]).then((_ref5) => {
        var _ref6 = _slicedToArray(_ref5, 2);

        let count = _ref6[0],
            result = _ref6[1];

        if (!result) {
            return Promise.reject(_util.errorType[102]);
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
exports.getMyComments = (req, res, next) => {
    const page = req.query.page;

    const userId = JSON.parse(req.user)._id;
    const index = (page - 1) * 10;
    Promise.all([_comment3.default.count({ commentFrom: userId, valid: 0 }), _comment3.default.find({ commentFrom: userId, valid: 0 }).populate([{
        path: "movie",
        select: "title -_id"
    }, {
        path: "commentFrom"
    }]).sort({ updatedAt: -1 }).limit(10).skip(index).exec()]).then((_ref7) => {
        var _ref8 = _slicedToArray(_ref7, 2);

        let count = _ref8[0],
            data = _ref8[1];

        const list = data.map(v => {
            const item = {
                _id: v._id,
                title: v.title,
                star: v.star.length,
                reply: v.reply.length
            };
            return item;
        });
        res.json({ status: 1, data: { totalNum: count, list } });
    }).catch(err => {
        next((0, _util.sendError)(err));
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
          commentId = _req$body.commentId,
          content = _req$body.content;

    const commentFrom = JSON.parse(req.user)._id;
    if (!commentTo || !commentFrom || !commentId || !content || _util.Regexp.xsscos.test(content)) {
        return next(_util.errorType[103]);
    }
    saveReply(req.body).then(reply => {
        const replyId = reply._id;
        return _comment3.default.update({ _id: commentId }, { $push: { reply: replyId } }).exec();
    }).then(result => {
        if (result.n != 1) {
            return Promise.reject(_util.errorType[102]);
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
        return next(_util.errorType[103]);
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
                if (result.n != 1) return Promise.reject(_util.errorType[102]);
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
        if (comment[1].n != 1) return Promise.reject(_util.errorType[102]);
        // 查出详细信息
        return _comment3.default.findOne({ _id: commentId }).populate({ path: "reply", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec();
    }).then(result => {
        let colletful = true;
        let starNumber = result.star;
        let colletNumber = result.collet.length;
        if (!result) {
            return Promise.reject(_util.errorType[103]);
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
exports.commentsToMe = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const page = req.query.page;

    const index = (page - 1) * 10;
    Promise.all([_reply2.default.count({ commentTo: userId, valid: 0 }).exec(), _reply2.default.find({ commentTo: userId, valid: 0 }).populate([{
        path: "commentFrom",
        select: "nickname avatar"
    }, {
        path: "commentId",
        select: "title"
    }]).limit(10).skip(index).exec()]).then((_ref9) => {
        var _ref10 = _slicedToArray(_ref9, 2);

        let count = _ref10[0],
            data = _ref10[1];

        res.json({ status: 1, data: { totalNum: count, list: data } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 喜欢用户的评论
 */
exports.addLike = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    var _req$body2 = req.body;
    const zanTo = _req$body2.zanTo,
          commentId = _req$body2.commentId;

    if (!commentId || !zanTo) {
        return next(_util.errorType[103]);
    }
    new _zanlist2.default({
        zanTo,
        commentId,
        zanFrom: userId
    }).save((err, result) => {
        if (err) return Promise.reject(_util.errorType[102]);
        _comment3.default.update({ _id: commentId }, { $addToSet: { star: result._id } }).exec().then(data => {
            if (data.n != 1) return Promise.reject(_util.errorType[102]);
            return res.json(_util.errorType[200]);
        });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 收藏用户的评论
 */
exports.collet = (req, res, next) => {
    var _req$body3 = req.body;
    const commentId = _req$body3.commentId,
          type = _req$body3.type,
          isList = _req$body3.isList,
          page = _req$body3.page;

    const userId = JSON.parse(req.user)._id;
    let updateCommentP = _comment3.default.update({ _id: commentId }, { $addToSet: { collet: userId } }).exec();
    let updateUserP = _user2.default.update({ _id: userId }, { $addToSet: { collet: commentId } }).exec();
    if (type == "uncollet") {
        updateCommentP = _comment3.default.update({ _id: commentId }, { $pull: { collet: userId } }).exec();
        updateUserP = _user2.default.update({ _id: userId }, { $pull: { collet: commentId } }).exec();
    }
    const addnewUser = () => {
        const data = {
            isFixed: true,
            isOver: true,
            result: {}
        };
        if (type == "uncollet" && isList) {
            data.isOver = false;
            _user2.default.findById(userId).populate({ path: "collet", select: "_id title content commentFrom", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec().then(user => {
                data.result = user;
                return Promise.resolve(data);
            });
        }
        return Promise.resolve(data);
    };
    // 返回值
    Promise.all([updateCommentP, updateUserP]).then(addnewUser).then(result => {
        if (!result.isFixed) return next(_util.errorType[102]);
        if (result.isOver) return res.json(_util.errorType[200]);
        const index = page * 10 - 1;
        const colletTo = result.result.collet || [];
        if (index > colletTo.length) {
            return res.json({ status: 1, data: {} });
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
exports.getMyCollet = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const page = req.query.page;

    const index = (page - 1) * 10;
    Promise.all([_user2.default.count({ _id: userId, valid: 0 }).exec(), _user2.default.findOne({ _id: userId, valid: 0 }).populate({
        path: "collet",
        select: "title content commentFrom createdAt",
        populate: {
            path: "commentFrom",
            select: "nickname avatar _id"
        }
    }).limit(10).skip(index).exec()]).then((_ref11) => {
        var _ref12 = _slicedToArray(_ref11, 2);

        let count = _ref12[0],
            data = _ref12[1];

        res.json({ status: 1, data: { totalNum: count, list: data.collet } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @desc 给我点赞的人
 */
exports.zanList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id;
    const page = req.query.page;

    const index = (page - 1) * 10;
    _user2.default.findOne({ _id: userId, valid: 0 }).then(data => {
        if (!data) return Promise.reject(_util.errorType[403]);
        return Promise.all([_zanlist2.default.count({ zanTo: userId }).exec(), _zanlist2.default.find({ zanTo: userId }).populate([{
            path: "zanFrom",
            select: "nickname"
        }, {
            path: "commentId",
            select: "title"
        }]).limit(10).skip(index).exec()]);
    }).then((_ref13) => {
        var _ref14 = _slicedToArray(_ref13, 2);

        let count = _ref14[0],
            data = _ref14[1];

        res.json({ status: 1, data: { totalNum: count, list: data } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};