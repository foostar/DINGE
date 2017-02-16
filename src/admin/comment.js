import Comment from "../model/comment"
import { errorType, sendError } from "../utils/util"
/*
 * @评论列表
 */
exports.find = (req, res, next) => {
    const { page } = req.query
    const index = (page - 1) * 10
    delete req.query.page
    if (req.query.valid) {
        req.query.valid = parseInt(req.query.valid, 10)
    }
    Promise.all([
        Comment.count(req.query),
        Comment.find(req.query)
        .populate([ {
            path  : "commentFrom",
            select: "nickname _id"
        }, {
            path  : "movie",
            select: "title _id"
        } ])
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
 * @屏蔽评论
 */
exports.shield = (req, res, next) => {
    const { commentId, type } = req.query
    Comment.update({ _id: commentId }, { valid: type == "shield" ? 1 : 0 }).exec()
    .then((result) => {
        if (!result.ok) return Promise.reject(errorType[102])
        res.json({ status: 1, commentId, type })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @删除评论
 */
exports.delete = (req, res, next) => {
    const commentsId = JSON.parse(req.query.commentsId)
    Promise.all(commentsId.map((v) => {
        return Comment.remove({ _id: v })
    }))
    .then(() => {
        res.json({ status: 1, commentsId })
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
    Comment.update({ _id }, { $set: { weight } }).exec()
    .then((result) => {
        if (result.n != 1) return Promise.reject(errorType[102])
        res.json({ status: 1, _id, weight })
    })
    .catch(err => {
        next(sendError(err))
    })
}
