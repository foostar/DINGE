/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 评论相关-ctrl
 */
import jwt from "jwt-simple"
import User from "../model/user"
import Comment from "../model/comment"
import Reply from "../model/reply"
import { getItem, setExpire } from "../../redis/redis"
import { sendError, Regexp } from "../../utils/util.js"

/*
 * @desc 创建一条电影评论
 */
exports.save = (req, res, next) => {
    const id = JSON.parse(req.user)._id
    const _comment = req.body
    if (!_comment.title || !_comment.content || !Regexp.xsscos.test(_comment.title) || !Regexp.xsscos.test(_comment.content)) {
        return next({ status: 400, msg: "缺少必要的参数或传入参数不合法" })
    }
    if (_comment.title.length > 20) {
        return next({ status: 400, msg: "标题不能超过20个字符！" })
    }
    if (_comment.content.length > 1000) {
        return next({ status: 400, msg: "评论内容过长！" })
    }
    User.findOne({ _id: id }).exec()
        .then((result) => {
            if (!result) {
                return Promise.reject({ status: 400, msg: "操作失败" })
            }
            _comment.commentFrom = id
            return _comment
        })
        .then((comment) => {
            new Comment(comment).save(() => {
                return res.json({ status: 1, msg: "评论成功" })
            })
        })
        .catch(err => {
            next(sendError(err))
        })
}
/*
 * @desc 查看用户的评论 筛选：电影/首页
 */
exports.getCommentsList = (req, res, next) => {
    const { movieId, page, rights } = req.query
    const index = (page - 1) * 20
    if ((movieId == "undefined" && !rights) || (rights == "undefined" && !movieId)) {
        return next({ status: 400, msg: "缺少必要的参数" })
    }
    if (movieId) {
        return Promise.all([
            Comment.count({ movie: movieId }),
            Comment.find({ movie: movieId })
                .sort({ updatedAt: -1 })
                .limit(20)
                .skip(index)
                .populate("commentFrom", "nickname")
                .exec() ])
            .then(([ count, result ]) => {
                if (!result) {
                    return Promise.reject({ status: 400, msg: "操作失败" })
                }
                res.json({
                    status: 1,
                    data  : {
                        list    : result,
                        totalNum: count
                    }
                })
            })
            .catch(err => {
                next(sendError(err))
            })
    }
    Promise.all([
        Comment.count({ weight: { $gte: rights } }),
        Comment.find({ weight: { $gte: rights } })
        .populate([ {
            path  : "commentFrom",
            select: "avatar nickname -_id"
        }, {
            path  : "movie",
            select: "images.small -_id"
        } ])
        .sort({ updatedAt: -1 })
        .limit(20)
        .skip(index)
        .exec()
    ])
    .then(([ count, result ]) => {
        if (!result) {
            return Promise.reject({ status: 400, msg: "操作失败" })
        }
        res.json({
            status: 1,
            data  : {
                list    : result,
                totalNum: count
            }
        })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 查看用户的所有电影评论 ops：列表
 */
exports.getMyComments = (req, res) => {
    const token = req.query.token
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).exec()
        .then((result) => {
            if (!result) {
                return res.json({ status: -1, msg: "token错误" })
            }
            return Comment.fetch({ commentFrom: userId }).populate([ {
                path  : "movie",
                select: "title -_id"
            }, {
                path: "commentFrom"
            } ]).exec()
        })
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
        })
}
/*
 * @desc 评论其他用户的评论
 */
const saveReply = (opts) => {
    return new Promise((reslove, reject) => {
        new Reply(opts).save((err, reply) => {
            if (err) return reject(err)
            reslove(reply)
        })
    })
}
exports.addComments = (req, res, next) => {
    const { commentTo, commentFrom, commentId, content } = req.body
    if (!commentTo || !commentFrom || !commentId || !content || Regexp.xsscos.test(content)) {
        return next({ status: 400, msg: "缺少必要的参数，或者传入参数不合法!" })
    }
    saveReply(req.body)
    .then(reply => {
        const replyId = reply._id
        return Comment.update({ _id: commentId }, { $push: { reply: replyId } }).exec()
    })
    .then(result => {
        if (result.n != 1) {
            return Promise.reject({ status: 400, msg: "修改失败！" })
        }
        res.json({ status: 1, msg: "评论成功!" })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 评论详情
 */

exports.commentDetail = (req, res, next) => {
    const { commentId, token } = req.query
    if (!commentId) {
        return res.json({ status: -1, msg: "缺少评论id" })
    }
    let userId
    // 设置访问历史
    const setHistory = new Promise((reslove, reject) => {
        if (!token) {
            reslove()
        }
        return getItem(token)
        .then((result) => {
            userId = JSON.parse(result)._id
            return User.findOne({ _id: userId }).exec()
        })
        .then((data) => {
            let history = User.update({ _id: userId }, { $pop: { history: 1 }, $addToSet: { history: commentId } })
            if (data.history.length < 10) {
                history = User.update({ _id: userId }, { $addToSet: { history: commentId } })
            }
            return history
        })
        .then(() => {
            setExpire(token, parseInt(1800, 10))
            reslove()
        })
        .catch(err => {
            return reject(sendError(err))
        })
    })
    // 先修改reading数量
    Promise.all([ setHistory, Comment.update({ _id: commentId }, { $inc: { reading: 1 } }) ])
    .then((comment) => {
        if (comment[1].n != 1) return Promise.reject({ status: 400, msg: "操作失败！" })
        // 查出详细信息
        return Comment.findOne({ _id: commentId }).populate({ path: "reply", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec()
    })
    .then((result) => {
        let colletful = true
        let starNumber = result.star
        let colletNumber = result.collet.length
        if (!result) {
            return Promise.reject({ status: -1, msg: "缺少评论id" })
        }
        if (!userId) {
            result.colletful = true
            return res.json({ status: 1, data: result, colletful, starNumber, colletNumber })
        }
        result.collet.forEach((v) => {
            if (v == userId) {
                colletful = false
            }
        })
        return res.json({ status: 1, data: result, colletful, starNumber, colletNumber })
    })
    .catch(err => {
        return next(sendError(err))
    })
}
/*
 * @desc 所有评论我的人
 */
exports.commentsToMe = (req, res) => {
    if (!req.query.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const token = req.query.token
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).exec()
        .then((result) => {
            if (!result) {
                return res.json({ status: -1, msg: "token错误" })
            }
            return Comment.find({ commentFrom: userId }).populate([ {
                path  : "reply.commentFrom",
                select: "nickname avatar -_id"
            }, {
                path  : "reply.commentTo",
                select: "nickname avatar -_id"
            }, {
                path  : "commentFrom",
                select: "nickname avatar -_id"
            }, {
                path  : "reply.commentId",
                select: "title"
            } ]).exec()
/*            "reply.commentFrom reply.commentTo commentFrom","email role -_id"*/
        })
        .then((result) => {
            if (result) {
                let data = []
                result.length.forEach((v) => {
                    data = data.concat(v.reply)
                })
                return res.json({ status: 1, data })
            }
            res.json({ status: -1, msg: "查找失败" })
        })
}
/*
 * @desc 喜欢用户的评论
 */
exports.addLike = (req, res, next) => {
    const commentId = req.body.commentId
    Comment.update({ _id: commentId }, { $inc: { star: 1 } }).exec()
        .then(result => {
            res.json({ status: 1, star: result.star })
        })
        .catch(err => {
            next(sendError(err))
        })
}
/*
 * @desc 收藏用户的评论
 */
exports.collet = (req, res, next) => {
    const { commentId, type, isList, page } = req.body
    const userId = JSON.parse(req.user)._id
    let updateCommentP = Comment.update({ _id: commentId }, { $addToSet: { collet: userId } }).exec()
    let updateUserP = User.update({ _id: userId }, { $addToSet: { collet: commentId } }).exec()
    if (type == "uncollet") {
        updateCommentP = Comment.update({ _id: commentId }, { $pull: { collet: userId } }).exec()
        updateUserP = User.update({ _id: userId }, { $pull: { collet: commentId } }).exec()
    }
    const addnewUser = (result) => {
        const data = {
            isFixed: false,
            isOver : true,
            result : {}
        }
        if (result[0].n == 1 && result[1].n == 1) {
            data.isFixed = true
            if (type == "uncollet" && isList) {
                data.isOver = false
                User.findById(userId).populate({ path: "collet", select: "_id title content commentFrom", populate: { path: "commentFrom", select: "nickname avatar _id" } }).exec()
                .then(user => {
                    data.result = user
                    return Promise.resolve(data)
                })
            }
        }
        return Promise.resolve(data)
    }
    // 返回值
    Promise.all([ updateCommentP, updateUserP ])
        .then(addnewUser)
        .then(result => {
            if (!result.isFixed) return next({ status: 400, msg: "修改失败" })
            if (result.isOver) return res.json({ status: 1, msg: "修改成功" })
            const index = page * 10 - 1
            const colletTo = result.result.collet || []
            if (index > colletTo.length) {
                return next({ status: 400, msg: "已经到底啦！" })
            }
            const data = colletTo[index]
            return res.json({ status: 1, data })
        })
        .catch((err) => {
            next(sendError(err))
        })
}
/*
 * @desc 我收藏的评论
 */
exports.getMyCollet = (req, res) => {
    if (!req.query.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const token = req.query.token
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).populate("collet", "title content commentFrom createdAt").exec()
        .then(result => {
            if (result) {
                let opts = [ {
                    path  : "collet.commentFrom",
                    select: "nickname avatar",
                    model : "User"
                } ]
                User.populate(result, opts, (err, populateDoc) => {
                    return res.json({ status: 1, data: populateDoc.collet })
                })
            }
        })
}
