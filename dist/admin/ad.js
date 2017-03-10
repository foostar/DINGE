"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Created by @xiusiteng on 2017-02-14
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc 广告功能-ctrl
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


var _carousel = require("../model/carousel.js");

var _carousel2 = _interopRequireDefault(_carousel);

var _util = require("../utils/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @增加轮播图
 */
exports.addCarousel = (req, res, next) => {
    const body = JSON.parse(req.body.data);
    if (body._id) {
        return _carousel2.default.update({ _id: body._id }, { $set: body }).exec().then(result => {
            if (result.n != 1) return next(_util.errorType[102]);
            res.json(_util.errorType[200]);
        }).catch(err => {
            next((0, _util.sendError)(err));
        });
    }
    _carousel2.default.findOne({ title: body.title }).exec().then(data => {
        if (data && data._id) return Promise.reject(_util.errorType[406]);
        const movie = new _carousel2.default(body);
        return movie.save();
    }).then(() => {
        res.json(_util.errorType[200]);
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @获取广告
 */
exports.adlist = (req, res, next) => {
    const page = req.query.page;

    const index = (page - 1) * 10;
    delete req.query.page;
    if (req.query.weight) {
        req.query.weight = { $gte: 90 };
    } else if (req.query.weight == false) {
        req.query.weight = { $lt: 90 };
    }
    Promise.all([_carousel2.default.count(req.query), _carousel2.default.find(req.query).sort({ createdAt: -1 }).limit(10).skip(index).exec()]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        res.json({ status: 1, data: { totalNum, list, page } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @删除广告
 */
exports.delete = (req, res, next) => {
    const carouselId = JSON.parse(req.query.carouselId);
    Promise.all(carouselId.map(v => {
        return _carousel2.default.remove({ _id: v });
    })).then(() => {
        res.json({ status: 1, carouselId });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @更改权重
 */
exports.changeWeight = (req, res, next) => {
    var _req$query = req.query;
    const _id = _req$query._id,
          weight = _req$query.weight;

    _carousel2.default.update({ _id }, { $set: { weight } }).exec().then(result => {
        if (result.n != 1) return Promise.reject(_util.errorType[102]);
        res.json({ status: 1, _id, weight });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};