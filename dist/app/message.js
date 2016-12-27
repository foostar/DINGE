"use strict";

var _message = require("../model/message");

var _message2 = _interopRequireDefault(_message);

var _jwtSimple = require("jwt-simple");

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 发送私信
/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 消息相关-ctrl
 */
exports.sendMessage = (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    const toId = req.body.to;
    let typeId1 = userId.substring(20) + toId.substring(20);
    let typeId2 = toId.substring(20) + userId.substring(20);
    _message2.default.findOne({ $or: [{ typeId: typeId1 }, { typeId: typeId2 }] }).exec().then(result => {
        if (!result) {
            const message = new _message2.default({
                from: userId,
                to: toId,
                typeId: typeId1,
                content: req.body.content
            });
            return message.save();
        }
        let typeId = typeId2;
        if (result.typeId == typeId1) {
            typeId = typeId1;
        }
        const rmessage = new _message2.default({
            from: userId,
            to: toId,
            typeId,
            content: req.body.content
        });
        return rmessage.save();
    }).then(result => {
        res.json({ status: 1, message: result.content });
    });
};
// 查看私信列表
exports.getMessageList = (req, res) => {
    const token = req.query.token;
    let page = req.query.page;
    let index = page * 10;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    const userId = _jwtSimple2.default.decode(token, Tools.secret);
    _message2.default.aggregate().match({ $or: [{ fromStr: userId }, { toStr: userId }] }).group({ _id: "$typeId", from: { $last: "$from" }, to: { $last: "$to" }, content: { $last: "$content" }, createdAt: { $last: "$createdAt" }, readAble: { $last: "$readAble" } }).sort({ createdAt: -1 }).limit(10).skip(index).exec().then(result => {
        let opts = [{
            path: "from",
            select: "nickname avatar",
            model: "User"
        }, {
            path: "to",
            select: "nickname avatar",
            model: "User"
        }];
        _message2.default.populate(result, opts, (err, populateDocs) => {
            let data = [];
            populateDocs.forEach(item => {
                if (item.from._id == userId) {
                    data.push({
                        typeId: item._id,
                        username: item.to.nickname,
                        avatar: item.to.avatar,
                        userId: item.to._id,
                        content: item.content,
                        createdAt: item.createdAt,
                        readAble: false
                    });
                } else {
                    data.push({
                        typeId: item._id,
                        username: item.from.nickname,
                        avatar: item.from.avatar,
                        content: item.content,
                        userId: item.from._id,
                        createdAt: item.createdAt,
                        readAble: item.readAble
                    });
                }
            });
            res.json({ status: 1, data });
        });
    });
};
// 查看私信详情
exports.getMessageDetail = (req, res) => {
    const token = req.query.token;
    let page = req.query.page;
    let index = page * 10;
    if (!token) {
        return res.json({ status: -1, msg: "没有token" });
    }
    let typeId = req.query.typeId;
    _message2.default.update({ typeId }, { $set: { readAble: true } }, { multi: true }).exec().then(() => {
        return _message2.default.find({ typeId }).populate("from to", "avatar nickname").sort({ createdAt: 1 }).limit(10).skip(index).exec();
    }).then(result => {
        return res.json({ status: 1, data: result });
    });
};