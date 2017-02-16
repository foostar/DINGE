/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 电影相关-ctrl
 */
import Movie from "../model/movie"
import { errorType, sendError } from "../utils/util"
// 查看电影方法
exports.find = (req, res, next) => {
    // 查看单个电影
    const _movieId = req.query.movieId
    if (_movieId) {
        return Movie.findById(_movieId)
            .then((result) => {
                return res.json(Object.assign({}, { status: 1 }, { data: result }))
            })
            .catch(err => {
                next(sendError(err))
            })
    }
    // 查看电影列表
    let _page = req.query.page
    let _index = (_page - 1) * 20
    if (!_page) return next(errorType[103])
    const listPro = Movie.find({})
        .sort({ updatedAt: -1 })
        .limit(20)
        .skip(_index)
        .exec()
    Promise.all([ Movie.count({}), listPro ])
        .then(([ totalNum, list ]) => {
            if (!list) {
                return Promise.reject(errorType[102])
            }
            const data = Object.assign({}, { status: 1 }, { data: { list, totalNum, page: _page } })
            return res.json(data)
        })
        .catch((err) => {
            next(sendError(err))
        })
}

