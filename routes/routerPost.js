/**
 * Created by Administrator on 2016-06-07.
 */
var User = require("../app/controller/user");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var userModel = require("../app/model/user");
var Regexp = require("../app/tools/regex");
var Movie = require("../app/controller/movie");
var Comment = require("../app/controller/comment");
passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
    userModel.find({_id:id}).exec()
        .then(function (user) {
            cb(null, user);
        });
});
passport.use(new Strategy({usernameField:'email'},
    function(username, password, cb) {
        //检测空账户
        if(!username){
            return cb(null, false, {message:'邮箱不能为空'})
        }
        //检测空密码
        if(!password) {
            return cb(null, false, {message:'密码不能为空'})
        }
        //账号格式不正确
        if(!Regexp.email.test(username)) {
            return cb(null, false, {message:'邮箱格式不正确'})
        }
        //检测密码规范
        if(!Regexp.password.test(password)) {
            return cb(null, false, {message:'密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间'})
        }
        userModel.findOne({email:username}).exec()
            .then(function(user) {
                if (!user) { return cb(null, false, {message:'用户不存在'}); }
                return user
            })
            .then(function(user){
                user.comparePassword(password,function(err,isMatch){
                    console.log(isMatch)
                    if(isMatch){
                        return cb(null,user)
                    }else{
                        return cb(null, false, {message:'密码不匹配'});
                    }
                })
            })
    })
);
module.exports = function(app) {
    //用户注册api
    app.post('/Api/signup', User.signUp);
    //用户登录api
    app.post('/Api/signin', User.signin);
    //电影详情
    app.get('/Api/movieFindOne', Movie.find)
    //电影列表
    app.get('/Api/showMovieList', Movie.find)
    //搜索电影
    app.get('/Api/serchMovie', Movie.search)
    //评论电影
    app.post('/Api/commentMovie', Comment.save)
    //加载电影评论
    app.get('/Api/movieComments', Comment.getMovieCommentsList)
}