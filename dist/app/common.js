"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2016-11-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 公共功能-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _carousel = require("../model/carousel.js");

var _carousel2 = _interopRequireDefault(_carousel);

var _movie = require("../model/movie.js");

var _movie2 = _interopRequireDefault(_movie);

var _comment = require("../model/comment.js");

var _comment2 = _interopRequireDefault(_comment);

var _user = require("../model/user.js");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getCarousels = (req, res, next) => {
    _carousel2.default.find({ weight: { $gte: 90 } }).exec().then(result => {
        if (result) {
            return res.json({ status: 1, data: result });
        }
    }, err => {
        if (err) {
            return next({ status: -1, msg: "查找失败！" });
        }
    });
};
// 搜索
exports.search = (req, res, next) => {
    let _name = null;
    let listPro = null;
    let count = null;
    const _page = req.query.page || 1;
    const _index = (_page - 1) * 20;
    if (req.query.movieName) {
        _name = req.query.movieName;
        listPro = _movie2.default.find({ title: new RegExp(_name) }).sort({ updatedAt: -1 }).limit(20).skip(_index).exec();
        count = _movie2.default.count({ title: new RegExp(_name) });
    } else if (req.query.commentTitle) {
        _name = req.query.commentTitle;
        listPro = _comment2.default.find({ title: new RegExp(_name) }).sort({ updatedAt: -1 }).limit(20).skip(_index).exec();
        count = _comment2.default.count({ title: new RegExp(_name) });
    } else {
        _name = req.query.userName;
        listPro = _user2.default.find({ nickname: new RegExp(_name) }).sort({ updatedAt: -1 }).limit(20).skip(_index).exec();
        count = _user2.default.count({ nickname: new RegExp(_name) });
    }
    Promise.all([count, listPro]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        if (!list) {
            return next({ status: 400, msg: "查找失败" });
        }
        return res.json(Object.assign({}, { status: 1 }, { data: { list, totalNum } }));
    }, err => {
        return next(err);
    });
};