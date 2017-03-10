"use strict";

var _redis = require("redis");

var _redis2 = _interopRequireDefault(_redis);

var _index = require("../../config/index");

var _index2 = _interopRequireDefault(_index);

var _util = require("../utils/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const client = _redis2.default.createClient(_index2.default.redisUrl);

const setItem = (key, value, time) => {
    time = time || _index2.default.catchTime;
    return new Promise((reslove, reject) => {
        let redisValue = value;
        if (typeof value != "string") {
            value = JSON.stringify(value);
        } else {
            redisValue = JSON.parse(value);
        }
        client.set(key, value, error => {
            if (error) {
                return reject(error);
            }
            client.expire(key, time);
            // 模拟token
            reslove({
                token: key,
                value: redisValue
            });
        });
    });
};

const getItem = key => {
    return new Promise((reslove, reject) => {
        client.get(key, (err, result) => {
            if (err || !result) {
                return reject(_util.errorType[101]);
            }
            reslove(result);
        });
    });
};

const removeItem = key => {
    return new Promise((reslove, reject) => {
        client.del(key, (err, result) => {
            if (err || !result) {
                return reject(_util.errorType[102]);
            }
            reslove();
        });
    });
};

const setExpire = (key, time) => {
    client.expire(key, time);
};

module.exports = {
    setItem,
    getItem,
    removeItem,
    setExpire
};