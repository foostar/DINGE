/**
 * Created by @xiusiteng on 2017-02-14
 * @desc 广告功能-ctrl
 */
import Carsousel from "../model/carousel.js"
import { errorType, sendError } from "../utils/util"

/*
 * @增加轮播图
 */
exports.addCarousel = (req, res, next) => {
    const body = JSON.parse(req.body.data)
    if (body._id) {
        return Carsousel.update({ _id: body._id }, { $set: body }).exec()
            .then((result) => {
                if (result.n != 1) return next(errorType[102])
                res.json(errorType[200])
            })
            .catch(err => {
                next(sendError(err))
            })
    }
    Carsousel.findOne({ title: body.title }).exec()
    .then((data) => {
        if (data && data._id) return Promise.reject(errorType[406])
        const movie = new Carsousel(body)
        return movie.save()
    })
    .then(() => {
        res.json(errorType[200])
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @获取广告
 */
exports.adlist = (req, res, next) => {
    const { page } = req.query
    const index = (page - 1) * 10
    delete req.query.page
    if (req.query.weight) {
        req.query.weight = { $gte: 90 }
    } else if (req.query.weight == false) {
        req.query.weight = { $lt: 90 }
    }
    Promise.all([
        Carsousel.count(req.query),
        Carsousel.find(req.query)
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
 * @删除广告
 */
exports.delete = (req, res, next) => {
    const carouselId = JSON.parse(req.query.carouselId)
    Promise.all(carouselId.map((v) => {
        return Carsousel.remove({ _id: v })
    }))
    .then(() => {
        res.json({ status: 1, carouselId })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @更改权重
 */
exports.changeWeight = (req, res, next) => {
    const { _id, weight } = req.query
    Carsousel.update({ _id }, { $set: { weight } }).exec()
    .then((result) => {
        if (result.n != 1) return Promise.reject(errorType[102])
        res.json({ status: 1, _id, weight })
    })
    .catch(err => {
        next(sendError(err))
    })
}
