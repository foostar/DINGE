"use strict";

var _util = require("../utils/util.js");

var _redis = require("../redis/redis");

/*
 * @检测是否登录
 */
/**
 * Created by @xiusiteng on 2016-12-23.
 * @desc 用户接口
 */
const isAuth = (req, res, next) => {
    const isAdminLogin = /\/admin\/api\/login/.test(req.path);
    const isAdminAuth = /\/admin\/api/.test(req.path);
    if (!req.headers.authentication && !isAdminLogin) {
        return next(_util.errorType[101]);
    }
    const sessionKey = req.headers.authentication;
    (0, _redis.getItem)(sessionKey).then(result => {
        if (isAdminLogin) {
            return next();
        }
        if (isAdminAuth) {
            req.admin = result;
        } else {
            req.user = result;
        }
        next();
    }).catch(err => {
        return next((0, _util.sendError)(err));
    });
};

module.exports = {
    isAuth
};