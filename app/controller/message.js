var Message = require("../model/message");
var jwt = require("jwt-simple");
var Tools = require("../tools/tool");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//发送私信
exports.sendMessage = function(req, res){
    var token = req.body.token;
    if(!token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var userId = jwt.decode(token, Tools.secret);
    var toId = req.body.to;
    var typeId1 = userId.substring(20)+toId.substring(20);
    var typeId2 = toId.substring(20)+userId.substring(20);
    Message.findOne({"$or":[ {typeId:typeId1},{typeId:typeId2} ]}).exec()
        .then(result => {
            if(!result){
                var message = new Message({
                    from:userId,
                    to:toId,
                    typeId:typeId1,
                    content:req.body.content
                });
                return message.save();     
            }
            var typeId = typeId2;
            if(result.typeId == typeId1){
                typeId = typeId1;
            }
            var rmessage = new Message({
                from:userId,
                to:toId,
                typeId:typeId,
                content:req.body.content
            });
            return rmessage.save();
        })
        .then(result => {
            res.json({status:1,message:result.content});
        });
};
//查看私信列表
exports.getMessageList = function(req, res){
    var token = req.query.token;
    if(!token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var userId = jwt.decode(token, Tools.secret);
    Message.aggregate()
        .match({"$or":[ {fromStr:userId}, {toStr:userId} ]})
        .group({_id:"$typeId",from:{$last:"$from"},to:{$last:"$to"},content:{$last:"$content"},createdAt:{$last:"$createdAt"},readAble:{$last:"$readAble"}})
        .sort({createdAt:-1})
        .exec()
        .then(result => {
            var opts = [ {
                path:"from",
                select:"nickname avatar",
                model:"User"
            }, {
                path:"to",
                select:"nickname avatar",
                model:"User"
            } ];
            Message.populate(result, opts, function(err,populateDocs){
                var data = [];
                populateDocs.forEach(function(item){
                    if(item.from._id == userId){
                        data.push({
                            typeId:item._id,
                            username:item.to.nickname,
                            avatar:item.to.avatar,
                            content:item.content,
                            readAble:false
                        });
                    }else{
                        data.push({
                            typeId:item._id,
                            username:item.from.nickname,
                            avatar:item.from.avatar,
                            content:item.content,
                            readAble:item.readAble
                        });
                    }
                });
                res.json({status:1,data:data});
            });
        });
};
//查看私信详情
exports.getMessageDetail = function(req, res){
    var token = req.query.token;
    if(!token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var typeId = req.query.typeId;
    Message.update({typeId:typeId},{$set: { readAble: true }},{multi:true}).exec()
        .then(() => {
            return Message.find({typeId:typeId}).populate("from to","avatar nickname").exec();
        })
        .then(result => {
            return res.json({status:1, data:result});
        });
};