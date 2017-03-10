"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _movie = require("../model/movie");

var _movie2 = _interopRequireDefault(_movie);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _util = require("../utils/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @添加电影
 */
exports.addMovie = (req, res, next) => {
    const body = JSON.parse(req.body.data);
    if (body._id) {
        return _movie2.default.update({ _id: body._id }, { $set: body }).exec().then(result => {
            if (result.n != 1) return next(_util.errorType[102]);
            res.json(_util.errorType[200]);
        }).catch(err => {
            next((0, _util.sendError)(err));
        });
    }
    _movie2.default.findOne({ title: body.title }).exec().then(data => {
        if (data && data._id) return Promise.reject(_util.errorType[406]);
        const movie = new _movie2.default(body);
        return movie.save();
    }).then(() => {
        res.json(_util.errorType[200]);
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @电影列表
 */
exports.find = (req, res, next) => {
    if (req.query.title) {
        req.query.title = decodeURIComponent(req.query.title);
    }
    const page = req.query.page;

    const index = (page - 1) * 10;
    delete req.query.page;
    Promise.all([_movie2.default.count(req.query), _movie2.default.find(req.query).sort({ createdAt: -1 }).limit(10).skip(index).exec()]).then((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let totalNum = _ref2[0],
            list = _ref2[1];

        res.json({ status: 1, data: { totalNum, list } });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};
/*
 * @查找豆瓣电影
 */
exports.dbMovie = (req, res, next) => {
    const movieId = req.query.movieId;

    if (!movieId) {
        return next(_util.errorType[103]);
    }
    (0, _request2.default)(`https://api.douban.com/v2/movie/subject/${ movieId }`, (err, response, body) => {
        if (err) return next(_util.errorType.mobcentError(err));
        let json;
        try {
            json = JSON.parse(body);
        } catch (error) {
            try {
                /* eslint-disable */
                const vm = require('vm');
                /* eslint-enable */
                const sandbox = { json: null };
                const script = new vm.Script(`json=${ body }`, sandbox);
                const context = vm.createContext(sandbox);
                script.runInContext(context);
                json = sandbox.json;
            } catch (e) {
                json = {};
            }
        }
        if (json.code && json.msg) {
            return next(_util.errorType[102]);
        }
        const data = {
            title: json.title,
            rating: {
                average: json.rating.average,
                star: json.rating.star
            },
            directors: (0, _util.pathtoString)(json.directors),
            casts: (0, _util.pathtoString)(json.casts),
            country: json.countries.join(","),
            genres: json.genres.join(","),
            aka: json.aka.join(","),
            images: {
                large: json.images.large,
                medium: json.images.medium,
                small: json.images.small
            },
            releaseTime: json.year,
            subject: json.summary
        };
        res.json({ status: 1, data });
    });
};
/*
 * @删除电影
 */
exports.delMovie = (req, res, next) => {
    const moviesId = JSON.parse(req.query.movieId);
    Promise.all(moviesId.map(v => {
        return _movie2.default.remove({ _id: v });
    })).then(() => {
        res.json({ status: 1, moviesId });
    }).catch(err => {
        next((0, _util.sendError)(err));
    });
};