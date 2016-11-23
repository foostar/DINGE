/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 公共功能-ctrl
 */
import Carsousel from "../model/carousel.js"

exports.getCarousels = (req, res) => {
    Carsousel.find({ weight: { $gte: 90 } }).exec()
        .then((result) => {
            if (result) {
                return res.json({ status: 1, data: result })
            }
        }, (err) => {
            if (err) {
                return res.json({ status: -1, msg: "查找失败！" })
            }
        })
}
