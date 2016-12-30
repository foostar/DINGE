import { sendError } from "../utils/util.js"
import User from "../model/user"
/*
 * @desc 加载用户列表
 */
exports.showList = (req, res, next) => {
    const page = req.query.page || 1
    const index = (page - 1) * 20
    Promise.all([ User.count({}),
        User.find({}).sort({ updatedAt: -1 })
        .limit(20)
        .skip(index)
        .exec()
    ])
    .then(([ count, data ]) => {
        res.json({
            status: 1,
            data  : {
                list    : data,
                totalNum: count
            }
        })
    }, err => {
        return next(sendError(err))
    })
}
