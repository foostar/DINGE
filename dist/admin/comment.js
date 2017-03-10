"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _comment = require("../model/comment");

var _comment2 = _interopRequireDefault(_comment);

var _util = require("../utils/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @评论列表
 */
exports.find = (req, res, next) => {
    const page = req.query.page;

    const index = (page - 1) * 10;
    delete req.query.page;
    if (req.query.valid) {
        req.query.valid = parseInt(req.query.valid, 10);
    }
    Promise.all([_comment2.default.count(req.query), _comment2.default.find(req.query).populate([{
        path: "commentFrom",
        select: "nickname _id"
    }, {
        path: "movie",
        select: "title _id"
    }]).sort({ createdAt: -1 }).limit(10).skip(index).exec()]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        res.json({ status: 1, data: { totalNum, list, page } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @屏蔽评论
 */
exports.shield = (req, res, next) => {
    var _req$query = req.query;
    const commentId = _req$query.commentId,
          type = _req$query.type;

    _comment2.default.update({ _id: commentId }, { valid: type == "shield" ? 1 : 0 }).exec().then(result => {
        if (!result.ok) return Promise.reject(_util.errorType[102]);
        res.json({ status: 1, commentId, type });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @删除评论
 */
exports.delete = (req, res, next) => {
    const commentsId = JSON.parse(req.query.commentsId);
    Promise.all(commentsId.map(v => {
        return _comment2.default.remove({ _id: v });
    })).then(() => {
        res.json({ status: 1, commentsId });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @更改权重
 */
exports.changeWeight = (req, res, next) => {
    var _req$query2 = req.query;
    const _id = _req$query2._id,
          weight = _req$query2.weight;

    _comment2.default.update({ _id }, { $set: { weight } }).exec().then(result => {
        if (result.n != 1) return Promise.reject(_util.errorType[102]);
        res.json({ status: 1, _id, weight });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};