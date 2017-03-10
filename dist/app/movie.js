"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 电影相关-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _movie = require("../model/movie");

var _movie2 = _interopRequireDefault(_movie);

var _util = require("../utils/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 查看电影方法
exports.find = (req, res, next) => {
    // 查看单个电影
    const _movieId = req.query.movieId;
    if (_movieId) {
        return _movie2.default.findById(_movieId).then(result => {
            return res.json(Object.assign({}, { status: 1 }, { data: result }));
        }).catch(err => {
            next((0, _util.sendError)(err));
        });
    }
    // 查看电影列表
    let _page = req.query.page;
    let _index = (_page - 1) * 20;
    if (!_page) return next(_util.errorType[103]);
    const listPro = _movie2.default.find({}).sort({ updatedAt: -1 }).limit(20).skip(_index).exec();
    Promise.all([_movie2.default.count({}), listPro]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        if (!list) {
            return Promise.reject(_util.errorType[102]);
        }
        const data = Object.assign({}, { status: 1 }, { data: { list, totalNum, page: _page } });
        return res.json(data);
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};