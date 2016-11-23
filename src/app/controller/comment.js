/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 评论相关-ctrl
 */
import jwt from "jwt-simple"
import User from "../model/user"
import Tools from "../tools/tool"
import Comment from "../model/comment"

/*
 * @desc 创建一条电影评论
 */
exports.save = (req, res) => {
    let _comment = req.body
    if (!_comment.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const username = jwt.decode(_comment.token, Tools.secret)
    User.findOne({ _id: username }).exec()
        .then((result) => {
            if (!result) {
                return res.json({ status: -1, msg: "操作失败" })
            }
            _comment.commentFrom = username
            delete _comment.token
            const comment = new Comment(_comment)
            comment.save(() => {
                return res.json({ status: 1 })
            })
        })
}
/*
 * @desc 查看用户的评论 筛选：电影/首页
 */
exports.getCommentsList = (req, res) => {
    const _movieId = req.query.movieId
    if (_movieId) {
        Comment.find({ movie: _movieId })
            .populate("commentFrom", "nickname").exec()
            .then((result) => {
                if (!result) {
                    return res.json({ status: -1, msg: "操作失败" })
                }
                return res.json({ status: 1, data: result })
            })
    } else {
        Comment.find({ weight: { $gte: 90 } })
            .populate([ {
                path  : "commentFrom",
                select: "avatar nickname -_id"
            }, {
                path  : "movie",
                select: "images.small -_id"
            } ]).exec()
            .then((result) => {
                if (!result) {
                    return res.json({ status: -1, msg: "操作失败" })
                }
                return res.json({ status: 1, data: result })
            })
    }
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
exports.addComments = (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const userId = jwt.decode(token, Tools.secret)
    User.findById(userId).exec()
        .then((result) => {
            if (!result) {
                return res.json({ status: -1, msg: "token错误" })
            }
            const commentId = req.body.commentsId
            Comment.findById(commentId, (err, comment) => {
                if (err) {
                    return res.json({ status: -1, msg: err })
                }
                let reply = {}
                reply.commentTo = req.body.commentTo
                reply.commentFrom = userId
                reply.content = req.body.content
                comment.reply.push(reply)
                comment.save((error) => {
                    if (error) {
                        return res.json({ status: -1, msg: "修改失败" })
                    }
                    res.json({ status: 1, msg: "修改成功" })
                })
            })
        })
}
/*
 * @desc 评论详情
 */
exports.commentDetail = (req, res) => {
    const commentId = req.query.commentId
    const token = req.query.token
    if (!commentId) {
        return res.json({ status: -1, msg: "缺少评论id" })
    }
    if (token.length > 1) {
        const userId = jwt.decode(token, Tools.secret)
        User.findById(userId).exec()
            .then((result) => {
                if (result.history.length >= 10) {
                    result.history.pop()
                    result.history.unshift(commentId)
                } else {
                    result.history.unshift(commentId)
                }
                return result.save()
            })
    }
    Comment.findById(commentId).populate("reply.commentFrom reply.commentTo commentFrom", "nickname avatar -_id").exec()
        .then((result) => {
            let colletful = true
            let starNumber = result.star
            let colletNumber = result.collet.length
            if (!result) {
                return res.json({ status: -1, msg: "缺少评论id" })
            }
            if (token == "") {
                result.colletful = true
                return res.json({ status: 1, data: result, colletful, starNumber, colletNumber })
            }
            const userId = jwt.decode(token, Tools.secret)
            result.collet.forEach((v) => {
                if (v == userId) {
                    colletful = false
                }
            })
            return res.json({ status: 1, data: result, colletful, starNumber, colletNumber })
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
exports.addLike = (req, res) => {
    if (!req.body.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const commentId = req.body.commentId
    Comment.findById(commentId).exec()
        .then(result => {
            result.star = parseInt(result.star, 10) + 1
            return result.save()
        })
        .then(result => {
            if (result) {
                res.json({ status: 1, star: result.star })
            }
        }, err => {
            if (err) {
                res.json({ status: -1, msg: "修改失败！" })
            }
        })
}
/*
 * @desc 收藏用户的评论
 */
exports.addCollet = (req, res) => {
    if (!req.body.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const token = req.body.token
    const commentId = req.body.commentId
    const userId = jwt.decode(token, Tools.secret)
    const updateCommentP = Comment.update({ _id: commentId }, { $addToSet: { collet: userId } }).exec()
    const updateUserP = User.update({ _id: userId }, { $addToSet: { collet: commentId } }).exec()
    Promise.all([ updateCommentP, updateUserP ])
        .then(([ updateComment, updateUser ]) => {
            if (updateComment.n == 1 && updateUser.n == 1) {
                return res.json({ status: 1, msg: "修改成功" })
            }
            return res.json({ status: -1, msg: "修改失败，请重试!" })
        })
}
/*
 * @desc 删除收藏的评论
 */
exports.unCollet = (req, res) => {
    if (!req.body.token) {
        return res.json({ status: -1, msg: "没有token" })
    }
    const page = req.body.page
    const index = page * 10 - 1
    const token = req.body.token
    const commentId = req.body.commentId
    const userId = jwt.decode(token, Tools.secret)
    const updateCommentP = Comment.update({ _id: commentId }, { $pull: { collet: userId } }).exec()
    const updateUserP = User.update({ _id: userId }, { $pull: { collet: commentId } }).exec()
    Promise.all([ updateCommentP, updateUserP ])
        .then(([ updateComment, updateUser ]) => {
            if (updateComment.n == 1 && updateUser.n == 1) {
                return User.findById(userId).populate("collet", "title createdAt").exec()
            }
            return res.json({ status: -1, msg: "修改失败，请重试！" })
        })
        .then(result => {
            if (result) {
                if (index < result.collet.length) {
                    const data = result.collet[index]
                    return res.json({ status: 1, data })
                }
                res.json({ status: 1, msg: "修改成功！" })
            }
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
