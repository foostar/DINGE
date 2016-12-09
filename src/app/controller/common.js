/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 公共功能-ctrl
 */
import Carsousel from "../model/carousel.js"
import Movie from "../model/movie.js"

exports.getCarousels = (req, res) => {
    Carsousel.find({ weight: { $gte: 90 } }).exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
        }, (err) => {
            if (err) {
                return res.json({ status: -1, msg: "查找失败！" })
            }
        })
}
// 搜索
exports.search = (req, res, next) => {
    let _name = req.query.movieName
    let name = new RegExp(_name)
    let _page = req.query.p
    let _index = _page * 20
    // 检测搜索值为空
    if (!_name) {
        return next({ status: 400, msg: "查找失败" })
    }
    const listPro = Movie.find({ title: name })
        .sort({ updatedAt: -1 })
        .limit(20)
        .skip(_index)
        .exec()
    Promise.all([ Movie.count({ title: name }), listPro ])
        .then(([ totalNum, list ]) => {
            if (!list) {
                return next({ status: 400, msg: "查找失败" })
            }
            return res.json(Object.assign({}, { status: 1 }, { data: { list, totalNum } }))
        })
}
