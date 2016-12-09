import redis from "redis"

const client = redis.createClient("redis://127.0.0.1:6379")

module.exports = client
