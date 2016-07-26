/**
 * Created by Administrator on 2016-06-12.
 */
var jwt = require("jwt-simple");
var User = require("../model/user");
var Tools = require("../tools/tool");
var Comment = require("../model/comment");
var moment = require("moment");

/*
 * @desc 创建一条电影评论
 */
exports.save = function(req, res){
    var _comment = req.body;
    if(!_comment.token){
        return res.json({status:-1, msg:"没有token"});
    }
    var username = jwt.decode(_comment.token, Tools.secret);
    User.findOne({_id:username}).exec()
        .then(function(result){
            if(!result){
                return res.json({status:-1, msg:"操作失败"});
            }
            _comment.commentFrom = username;
            delete _comment.token;
            var comment = new Comment(_comment);
            comment.save(function(){
                return res.json({status:1});
            });
        });
};
/*
 * @desc 查看用户的评论 筛选：电影/首页
 */
exports.getCommentsList = function(req, res){
    var _movieId = req.query.movieId;
    if(_movieId){
        Comment.find({movie:_movieId})
            .populate("commentFrom", "nickname").exec()
            .then(function(result){
                if(!result){
                    return res.json({ status:-1, msg:"操作失败" });
                }
                return res.json({ status:1, data:result });
            });
    }else{
        Comment.find({"weight":{ "$gte":90 }})
            .populate([ {
                path:"commentFrom",
                select:"avatar nickname -_id"
            } ,{
                path:"movie",
                select:"images.small -_id"
            } ] ).exec()
            .then(function(result){
                if(!result){
                    return res.json({ status:-1, msg:"操作失败" });
                }
                return res.json({ status:1, data:result });
            });
    }   
};
/*
 * @desc 查看用户的所有电影评论 ops：列表
 */
exports.getMyComments = function(req, res){
    var token = req.query.token;
    if(!token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var userId = jwt.decode(token, Tools.secret);
    User.findById(userId).exec()
        .then(function(result){
            if(!result){
                return res.json({ status:-1, msg:"token错误" }); 
            }
            return Comment.fetch({commentFrom:userId}).populate([ {
                path:"movie", select:"title -_id"
            }, {
                path:"commentFrom" 
            } ]).exec();
        })
        .then(function(result){
            if(result){
                return res.json({status:1, data:result});
            }
        });
};
/*
 * @desc 评论其他用户的评论
 */
exports.addComments = function(req, res){
    var token = req.body.token;
    if(!token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var userId = jwt.decode(token, Tools.secret);
    User.findById(userId).exec()
        .then(function(result){
            if(!result){
                return res.json({ status:-1, msg:"token错误" }); 
            }
            var commentId = req.body.commentsId;
            Comment.findById(commentId, function(err, comment){
                if(err){
                    return res.json({status:-1, msg:err});
                }
                var reply = {};
                reply.commentTo = req.body.commentTo;
                reply.commentFrom = userId;
                reply.content = req.body.content;
                comment.reply.push(reply);
                comment.save(function(err){
                    if(err){
                        return res.json({status:-1,msg:"修改失败"});
                    }
                    res.json({status:1,msg:"修改成功"});
                });
            });
        });
};
/*
 * @desc 评论详情
 */
exports.commentDetail = function(req, res){
    var commentId = req.query.commentId;
    var token = req.query.token;
    if(!commentId){
        return res.json({status:-1,msg:"缺少评论id"});
    }
    Comment.findById(commentId).populate("reply.commentFrom reply.commentTo commentFrom","nickname avatar -_id").exec()
        .then(function(result){
            var starful = false;
            var colletful = false;
            var starNumber = result.star.length
            var colletNumber = result.collet.length
            if(!result){
                return res.json({status:-1,msg:"缺少评论id"}); 
            }
            if(token == ""){
                result.startful = false;
                result.colletful = false;
                return res.json({status:1,data:result,starful:starful,colletful:colletful,starNumber:starNumber,colletNumber:colletNumber}); 
            }
            var userId = jwt.decode(token, Tools.secret);
            console.log("userId",userId)
            for(var i=0; i<result.star.length; i++){
                console.log(result.star[ i ])
                if(userId == result.star[ i ]){
                    starful = true; 
                }
            }
            for(var j=0; j<result.collet.length; j++){
                if(userId == result.collet[ j ]){
                    colletful = true; 
                }
            }
            return res.json({status:1,data:result,starful:starful,colletful:colletful,starNumber:starNumber,colletNumber:colletNumber}); 

        });
};
/*
 * @desc 所有评论我的人
 */
exports.commentsToMe = function(req, res){ 
    if(!req.query.token){
        return res.json({ status:-1, msg:"没有token" });
    }
    var token = req.query.token;
    var userId = jwt.decode(token, Tools.secret);
    User.findById(userId).exec()
        .then(function(result){
            if(!result){
                return res.json({ status:-1, msg:"token错误" }); 
            }
            return Comment.find({commentFrom:userId}).populate([ {
                path:"reply.commentFrom",select:"nickname avatar -_id"
            }, {
                path:"reply.commentTo",select:"nickname avatar -_id"
            },{
                path:"commentFrom",select:"nickname avatar -_id"
            },{
                path:"reply.commentId",select:"title"
            } ]).exec();
/*            "reply.commentFrom reply.commentTo commentFrom","email role -_id"*/
        })
        .then(function(result){
            if(result){
                var data = [];
                for(var i=0;i<result.length;i++){
                    data = data.concat(result[ i ].reply);
                }
                res.json({status:1,data:data});
            }else{
                res.json({status:-1,msg:"查找失败"});
            }
        });
};