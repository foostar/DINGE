import redis from "redis"
import config from "../../config/index"

const client = redis.createClient(config.redisUrl)

const setItem = (key, value) => {
    return new Promise((reslove, reject) => {
        client.set(key, value, (error) => {
            if (error) {
                return reject(error)
            }
            // 模拟token
            reslove()
        })
    })
}

const getItem = (key) => {
    return new Promise((reslove, reject) => {
        client.get(key, (err, result) => {
            if (err || !result) {
                return reject({ status: 400, errcode: 100401, msg: "token过期" })
            }
            reslove(result)
        })
    })
}

const removeItem = (key) => {
    return new Promise((reslove, reject) => {
        client.del(key, (err, result) => {
            if (err || !result) {
                return reject({ status: 400, msg: "操作失败，请重试！" })
            }
            reslove()
        })
    })
}

const setExpire = (key, time) => {
    client.expire(key, time)
}

module.exports = {
    setItem,
    getItem,
    removeItem,
    setExpire
}
