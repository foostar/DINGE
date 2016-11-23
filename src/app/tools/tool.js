/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 公共方法
 */
/* eslint-disable */
const tools = {
    secret: "international meeting",
    merge(des, src, obj) {
        for (let i in src) {
            des[i] = src[i]
        }
        for (let j in obj) {
            des[j] = obj[j]
        }
        return des;
    }
}
module.exports = tools
