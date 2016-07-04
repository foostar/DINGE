/**
 * Created by Administrator on 2016-06-12.
 */
var jwt = require("jwt-simple");
var User = require("../model/user");
var Comment = require("../model/comment")
exports.save = function(req, res){
    const secret = "international meeting";
    var _comment = req.body;
    var username = jwt.decode(req.session.token, secret).username;
    User.findOne({_id:username}).exec()
        .then(function(result){
            if(!result){
                return res.json({status:-1, msg:"操作失败"})
            }
            _comment.commentFrom = username
        })
        .then(function(){
            var comment = new Comment(_comment)
            comment.save(function(){
                return res.json({status:1})
            })
        })
};
exports.getMovieCommentsList = function(req, res){
    var _movieId = req.query.movieId;
    Comment.find({movie:_movieId})
        .populate("commentFrom", "email").exec()
        .then(function(result){
            if(!result){
                return res.json({ status:-1, msg:"操作失败" })
            }
            return res.json({ status:1, data:result })
        })
        
}