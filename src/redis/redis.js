import redis from "redis"

const client = redis.createClient("redis://127.0.0.1:6379")

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

const setExpire = (key, time) => {
    client.expire(key, time)
}

module.exports = {
    setItem,
    getItem,
    setExpire
}
