"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 电影相关-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _movie = require("../model/movie");

var _movie2 = _interopRequireDefault(_movie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 添加电影方法
exports.addMovie = (req, res) => {
    const body = req.body;
    body.directors = JSON.parse(body.directors);
    body.casts = JSON.parse(body.casts);
    body.country = JSON.parse(body.country);
    body.genres = JSON.parse(body.genres);
    body.aka = JSON.parse(body.aka);
    body.language = JSON.parse(body.language);
    body.images = JSON.parse(body.images);
    const movie = new _movie2.default(body);
    movie.save().then(() => {
        res.json({ status: 1, msg: "添加成功" });
    });
};
// 查看电影方法
exports.find = (req, res, next) => {
    // 查看单个电影
    const _movieId = req.query.movieId;
    if (_movieId) {
        return _movie2.default.findById(_movieId).then(result => {
            if (!result) {
                return next({ status: 400, msg: "抱歉，没有这部电影！" });
            }
            return res.json(Object.assign({}, { status: 1 }, { data: result }));
        });
    }
    // 查看电影列表
    let _page = req.query.page;
    let _index = (_page - 1) * 20;
    if (!_page) return next({ status: 400, msg: "缺少必要的参数" });
    const listPro = _movie2.default.find({}).sort({ updatedAt: -1 }).limit(20).skip(_index).exec();
    Promise.all([_movie2.default.count({}), listPro]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        if (!list) {
            return next({ status: 400, msg: "查找失败" });
        }
        return res.json(Object.assign({}, { status: 1 }, { data: { list, totalNum } }));
    }).catch(err => {
        next({ status: 400, msg: "网络出错请重试", errmsg: err });
    });
};