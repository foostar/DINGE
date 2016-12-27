/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 电影相关-ctrl
 */
import Movie from "../model/movie"
// 添加电影方法
exports.addMovie = (req, res) => {
    const body = req.body
    body.directors = JSON.parse(body.directors)
    body.casts = JSON.parse(body.casts)
    body.country = JSON.parse(body.country)
    body.genres = JSON.parse(body.genres)
    body.aka = JSON.parse(body.aka)
    body.language = JSON.parse(body.language)
    body.images = JSON.parse(body.images)
    const movie = new Movie(body)
    movie.save()
        .then(() => {
            res.json({ status: 1, msg: "添加成功" })
        })
}
// 查看电影方法
exports.find = (req, res, next) => {
    // 查看单个电影
    const _movieId = req.query.movieId
    if (_movieId) {
        return Movie.findById(_movieId)
            .then((result) => {
                if (!result) {
                    return next({ status: 400, msg: "抱歉，没有这部电影！" })
                }
                return res.json(Object.assign({}, { status: 1 }, { data: result }))
            })
    }
    // 查看电影列表
    let _page = req.query.page
    let _index = (_page - 1) * 20
    if (!_page) return next({ status: 400, msg: "缺少必要的参数" })
    const listPro = Movie.find({})
        .sort({ updatedAt: -1 })
        .limit(20)
        .skip(_index)
        .exec()
    Promise.all([ Movie.count({}), listPro ])
        .then(([ totalNum, list ]) => {
            if (!list) {
                return next({ status: 400, msg: "查找失败" })
            }
            return res.json(Object.assign({}, { status: 1 }, { data: { list, totalNum } }))
        })
        .catch((err) => {
            next({ status: 400, msg: "网络出错请重试", errmsg: err })
        })
}

