/**
 * Created by Administrator on 2016-06-03.
 */
var Carsousel = require("../model/carousel.js");
exports.getCarousels = function(req, res){
    Carsousel.find({"weight":{ "$gte":90 }}).exec()
        .then(function(result){
            if(result){
                return res.json({status:1, data:result});
            }
        },function(err){
            if(err){
                return res.json({status:-1, msg:"查找失败！"});
            }
        });
};