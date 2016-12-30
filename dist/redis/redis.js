"use strict";

var _redis = require("redis");

var _redis2 = _interopRequireDefault(_redis);

var _index = require("../../config/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const client = _redis2.default.createClient(_index2.default.redisUrl);

const setItem = (key, value) => {
    return new Promise((reslove, reject) => {
        client.set(key, value, error => {
            if (error) {
                return reject(error);
            }
            // 模拟token
            reslove();
        });
    });
};

const getItem = key => {
    return new Promise((reslove, reject) => {
        client.get(key, (err, result) => {
            if (err || !result) {
                return reject({ status: 400, errcode: 100401, msg: "token过期" });
            }
            reslove(result);
        });
    });
};

const setExpire = (key, time) => {
    client.expire(key, time);
};

module.exports = {
    setItem,
    getItem,
    setExpire
};