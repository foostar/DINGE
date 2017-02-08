import Movie from "../model/movie"
import request from "request"
import { errorType, sendError, pathtoString } from "../utils/util"
/*
 * @电影列表
 */
exports.find = (req, res, next) => {
    if (req.query.title) {
        req.query.title = decodeURIComponent(req.query.title)
    }
    const { page } = req.query
    const index = (page - 1) * 10
    delete req.query.page
    Promise.all([
        Movie.count(req.query),
        Movie.find(req.query)
        .sort({ createdAt: -1 })
        .limit(20)
        .skip(index)
        .exec()
    ])
    .then(([ totalNum, list ]) => {
        res.json({ status: 1, data: { totalNum, list } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @查找豆瓣电影
 */
exports.dbMovie = (req, res, next) => {
    const { movieId } = req.query
    if (!movieId) {
        return next(errorType[103])
    }
    request(`https://api.douban.com/v2/movie/subject/${movieId}`, (err, response, body) => {
        if (err) return next(errorType.mobcentError(err))
        let json
        try {
            json = JSON.parse(body)
        } catch (error) {
            try {
                /* eslint-disable */
                const vm = require('vm')
                /* eslint-enable */
                const sandbox = { json: null }
                const script = new vm.Script(`json=${body}`, sandbox)
                const context = vm.createContext(sandbox)
                script.runInContext(context)
                json = sandbox.json
            } catch (e) {
                json = {}
            }
        }
        if (json.code && json.msg) {
            return next(errorType[102])
        }
        const data = {
            title : json.title,
            rating: {
                average: json.rating.average,
                star   : json.rating.star
            },
            directors: pathtoString(json.directors),
            casts    : pathtoString(json.casts),
            country  : json.countries.join(","),
            genres   : json.genres.join(","),
            aka      : json.aka.join(","),
            images   : {
                large : json.images.large,
                medium: json.images.medium,
                small : json.images.small
            },
            releaseTime: json.year,
            subject    : json.summary
        }
        res.json({ status: 1, data })
    })
}
