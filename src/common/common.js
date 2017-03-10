/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 公共功能-ctrl
 */
import Carsousel from "../model/carousel.js"
import Movie from "../model/movie.js"
import Comment from "../model/comment.js"
import User from "../model/user.js"
import Report from "../model/report.js"
import { sendError } from "../utils/util.js"
import Location from "../model/location.js"
/*
 * @获取轮播图
 */
exports.getCarousels = (req, res, next) => {
    Carsousel.find({ weight: { $gte: 90 } }).exec()
        .then((result) => {
            return res.json({ status: 1, data: result })
        })
        .catch(err => {
            next(sendError(err))
        })
}
/*
 * @搜索
 */
exports.search = (req, res, next) => {
    let _name = null
    let listPro = null
    let count = null
    const _page = req.query.page || 1
    const _index = (_page - 1) * 20
    if (req.query.movieName) {
        _name = req.query.movieName
        listPro = Movie.find({ title: new RegExp(_name) })
                    .sort({ updatedAt: -1 })
                    .limit(20)
                    .skip(_index)
                    .exec()
        count = Movie.count({ title: new RegExp(_name) })
    } else if (req.query.commentTitle) {
        _name = req.query.commentTitle
        listPro = Comment.find({ title: new RegExp(_name) })
                    .sort({ updatedAt: -1 })
                    .limit(20)
                    .skip(_index)
                    .exec()
        count = Comment.count({ title: new RegExp(_name) })
    } else {
        _name = req.query.userName
        listPro = User.find({ nickname: new RegExp(_name) })
                    .sort({ updatedAt: -1 })
                    .limit(20)
                    .skip(_index)
                    .exec()
        count = User.count({ nickname: new RegExp(_name) })
    }
    Promise.all([ count, listPro ])
        .then(([ totalNum, list ]) => {
            if (!list) {
                return next({ status: 400, msg: "查找失败" })
            }
            return res.json(Object.assign({}, { status: 1 }, { data: { list, totalNum } }))
        }, err => {
            return next(err)
        })
}
exports.reports = (req, res, next) => {
    const { page } = req.query
    const index = (page - 1) * 10
    delete req.query.page
    Promise.all([
        Report.count(req.query),
        Report.find(req.query)
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(index)
        .exec()
    ])
    .then(([ totalNum, list ]) => {
        res.json({ status: 1, data: { totalNum, list, page } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 *  @渲染地理定位
 */
exports.location = (req, res) => {
    res.render("home", { title: "获取地理定位", time: process.env.time || 5 * 60 * 1000 })
}
exports.saveLocation = (req, res) => {
    Location.findOne({})
    .then((data) => {
        if (!data) {
            return new Location(req.query).save()
        }
        data.x = req.query.x
        data.y = req.query.y
        data.save()
        res.json({ status: 1 })
    })
}
exports.getLocation = (req, res) => {
    res.render("location", { title: "获取地理定位", time: process.env.time || 5 * 60 * 1000 })
}
exports.getSetting = (req, res) => {
    Location.findOne({}).sort({ createdAt: -1 }).exec()
        .then((data) => {
            res.json(data)
        })
}
exports.getCode = (req, res) => {
    res.render("code", { title: "二维码" })
}
