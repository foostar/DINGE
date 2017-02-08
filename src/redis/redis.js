import redis from "redis"
import config from "../../config/index"
import { errorType } from "../utils/util"

const client = redis.createClient(config.redisUrl)

const setItem = (key, value, time) => {
    time = time || config.catchTime
    return new Promise((reslove, reject) => {
        let redisValue = value
        if (typeof value != "string") {
            value = JSON.stringify(value)
        } else {
            redisValue = JSON.parse(value)
        }
        client.set(key, value, (error) => {
            if (error) {
                return reject(error)
            }
            client.expire(key, time)
            // 模拟token
            reslove({
                token: key,
                value: redisValue
            })
        })
    })
}

const getItem = (key) => {
    return new Promise((reslove, reject) => {
        client.get(key, (err, result) => {
            if (err || !result) {
                return reject(errorType[101])
            }
            reslove(result)
        })
    })
}

const removeItem = (key) => {
    return new Promise((reslove, reject) => {
        client.del(key, (err, result) => {
            if (err || !result) {
                return reject(errorType[102])
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
