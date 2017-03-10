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

var _report = require("../model/report.js");

var _report2 = _interopRequireDefault(_report);

var _util = require("../utils/util.js");

var _location = require("../model/location.js");

var _location2 = _interopRequireDefault(_location);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @获取轮播图
 */
exports.getCarousels = (req, res, next) => {
    _carousel2.default.find({ weight: { $gte: 90 } }).exec().then(result => {
        return res.json({ status: 1, data: result });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @搜索
 */
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
exports.reports = (req, res, next) => {
    const page = req.query.page;

    const index = (page - 1) * 10;
    delete req.query.page;
    Promise.all([_report2.default.count(req.query), _report2.default.find(req.query).sort({ createdAt: -1 }).limit(10).skip(index).exec()]).then((_ref3) => {
        var _ref4 = _slicedToArray(_ref3, 2);

        let totalNum = _ref4[0],
            list = _ref4[1];

        res.json({ status: 1, data: { totalNum, list, page } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 *  @渲染地理定位
 */
exports.location = (req, res) => {
    res.render("home", { title: "获取地理定位", time: process.env.time || 5 * 60 * 1000 });
};
exports.saveLocation = (req, res) => {
    _location2.default.findOne({}).then(data => {
        if (!data) {
            return new _location2.default(req.query).save();
        }
        data.x = req.query.x;
        data.y = req.query.y;
        data.save();
        res.json({ status: 1 });
    });
};
exports.getLocation = (req, res) => {
    res.render("location", { title: "获取地理定位", time: process.env.time || 5 * 60 * 1000 });
};
exports.getSetting = (req, res) => {
    _location2.default.findOne({}).sort({ createdAt: -1 }).exec().then(data => {
        res.json(data);
    });
};
exports.getCode = (req, res) => {
    res.render("code", { title: "二维码" });
};