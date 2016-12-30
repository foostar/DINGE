/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 评论相关-ctrl
 */
import User from "../model/user"
import Comment from "../model/comment"
import Reply from "../model/reply"
import Zanlist from "../model/zanlist"
import { getItem, setExpire } from "../redis/redis"
import { sendError, Regexp } from "../utils/util.js"

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
    const { movieId, page, rights, userId } = req.query
    const index = (page - 1) * 20
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
    if (userId) {
        return Promise.all([
            Comment.count({ commentFrom: userId }),
            Comment.find({ commentFrom: userId })
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
            select: "images.large -_id"
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
 * @desc 查看我的所有电影评论 ops：列表
 */
exports.getMyComments = (req, res, next) => {
    const { page } = req.query
    const userId = JSON.parse(req.user)._id
    const index = (page - 1) * 10
    Promise.all([
        Comment.count({ commentFrom: userId, vaild: 0 }),
        Comment.find({ commentFrom: userId, vaild: 0 }).populate([ {
            path  : "movie",
            select: "title -_id"
        }, {
            path: "commentFrom"
        } ])
        .sort({ updatedAt: -1 })
        .limit(10)
        .skip(index)
        .exec()
    ])
    .then(([ count, data ]) => {
        const list = data.map((v) => {
            const item = {
                _id  : v._id,
                title: v.title,
                star : v.star.length,
                reply: v.reply.length
            }
            return item
        })
        res.json({ status: 1, data: { totalNum: count, list } })
    })
    .catch(err => {
        next(sendError(err))
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
        return next({ status: -1, msg: "缺少评论id" })
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
            let history = User.update({ _id: userId }, { $pop: { history: 1 } }).then((result) => {
                if (result.n != 1) return Promise.reject({ status: 400, msg: "修改失败！" })
                return User.update({ _id: userId }, { $addToSet: { history: commentId } })
            })
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
exports.commentsToMe = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const { page } = req.query
    const index = (page - 1) * 10
    Promise.all([
        Reply.count({ commentTo: userId, vaild: 0 }).exec(),
        Reply.find({ commentTo: userId, vaild: 0 }).populate([ {
            path  : "commentFrom",
            select: "nickname avatar"
        }, {
            path  : "commentId",
            select: "title"
        } ])
        .limit(10)
        .skip(index)
        .exec()
    ])
    .then(([ count, data ]) => {
        res.json({ status: 1, data: { totalNum: count, list: data } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 喜欢用户的评论
 */
exports.addLike = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const { zanTo, commentId } = req.body
    if (!commentId || !zanTo) {
        return next({ status: 400, msg: "缺少评论id" })
    }
    new Zanlist({
        zanTo,
        commentId,
        zanFrom: userId
    }).save((err, result) => {
        if (err) return Promise.reject({ status: 400, msg: "操作失败，请重试！" })
        Comment.update({ _id: commentId }, { $addToSet: { star: result._id } }).exec()
        .then((data) => {
            console.log("data", data)
            if (data.n != 1) return Promise.reject({ status: 400, msg: "操作失败，请重试！" })
            console.log(111)
            return res.json({ status: 1, msg: "修改成功！" })
        })
    })
    .catch(err => {
        console.log("err", err)
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
exports.getMyCollet = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const { page } = req.query
    const index = (page - 1) * 10
    Promise.all([
        User.count({ _id: userId, vaild: 0 }).exec(),
        User.findOne({ _id: userId, vaild: 0 })
        .populate({
            path    : "collet",
            select  : "title content commentFrom createdAt",
            populate: {
                path  : "commentFrom",
                select: "nickname avatar _id"
            }
        })
        .limit(10)
        .skip(index)
        .exec()
    ])
    .then(([ count, data ]) => {
        res.json({ status: 1, data: { totalNum: count, list: data.collet } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
/*
 * @desc 给我点赞的人
 */
exports.zanList = (req, res, next) => {
    const userId = JSON.parse(req.user)._id
    const { page } = req.query
    const index = (page - 1) * 10
    User.findOne({ _id: userId, vaild: 0 })
    .then((data) => {
        if (!data) return Promise.reject({ status: 400, msg: "此用户不存在或账号存在问题！" })
        return Promise.all([
            Zanlist.count({ zanTo: userId }).exec(),
            Zanlist.find({ zanTo: userId }).populate([ {
                path  : "zanFrom",
                select: "nickname"
            }, {
                path  : "commentId",
                select: "title"
            } ])
            .limit(10)
            .skip(index)
            .exec()
        ])
    })
    .then(([ count, data ]) => {
        res.json({ status: 1, data: { totalNum: count, list: data } })
    })
    .catch(err => {
        next(sendError(err))
    })
}
