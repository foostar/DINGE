/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 公共功能-ctrl
 */
import Carsousel from "../model/carousel.js"
import Movie from "../model/movie.js"
import Comment from "../model/comment.js"
import User from "../model/user.js"

exports.getCarousels = (req, res, next) => {
    Carsousel.find({ weight: { $gte: 90 } }).exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
        }, (err) => {
            if (err) {
                return next({ status: -1, msg: "查找失败！" })
            }
        })
}
// 搜索
exports.search = (req, res, next) => {
    let _name = null
    let listPro = null
    let count = null
    const _page = req.query.page || 1
    const _index = (_page - 1) * 20
    console.log(222)
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
    console.log(111)
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
