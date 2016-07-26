/**
 * Created by Administrator on 2016-06-07.
 */
var User = require("../app/controller/user");
var passport = require("passport");
var Strategy = require("passport-local").Strategy;
var userModel = require("../app/model/user");
var Regexp = require("../app/tools/regex");
var Movie = require("../app/controller/movie");
var Comment = require("../app/controller/comment");
var Common = require("../app/controller/common");
passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
    userModel.find({_id:id}).exec()
        .then(function (user) {
            cb(null, user);
        });
});
passport.use(new Strategy({usernameField:"email"},
    function(username, password, cb) {
        //检测空账户
        if(!username){
            return cb(null, false, {message:"邮箱不能为空"});
        }
        //检测空密码
        if(!password) {
            return cb(null, false, {message:"密码不能为空"});
        }
        //账号格式不正确
        if(!Regexp.email.test(username)) {
            return cb(null, false, {message:"邮箱格式不正确"});
        }
        //检测密码规范
        if(!Regexp.password.test(password)) {
            return cb(null, false, {message:"密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间"});
        }
        userModel.findOne({email:username}).exec()
            .then(function(user) {
                if (!user) { 
                    return cb(null, false, {message:"用户不存在"}); 
                }
                user.comparePassword(password,function(err,isMatch){
                    if(isMatch){
                        return cb(null,user);
                    }else{
                        return cb(null, false, {message:"密码不匹配"});
                    }
                });
            });
    })
);
module.exports = function(app) {
    //加载用户列表
    /*
     *  @desc  未来可能要挪到后台的功能
     */
    app.get("/Api/getUserlist", User.showList);
    //加载首页轮播图
    app.get("/Api/getCarousels", Common.getCarousels);
    //加载我关注的人
    app.get("/Api/getUserFocuslist", User.focusList);
    //加载关注我的人
    app.get("/Api/getUserFocusFromlist", User.focusFromList);
    //关注用户
    app.post("/Api/FocusUser", User.focusUser);
    //取消关注用户
    app.post("/Api/unFocusUser", User.unFocusUser);
    //用户注册api
    app.post("/Api/signup", User.signUp);
    //用户登录api
    app.post("/Api/signin", User.signin);
    //电影详情
    app.get("/Api/movieFindOne", Movie.find);
    //电影列表
    app.get("/Api/showMovieList", Movie.find);
    //搜索电影
    app.get("/Api/serchMovie", Movie.search);
    //评论电影
    app.post("/Api/commentMovie", Comment.save);
    //加载评论
    app.get("/Api/getComments", Comment.getCommentsList);
    //加载我的影评
    app.get("/Api/myComments", Comment.getMyComments);
    //评论别人的评论
    app.post("/Api/addComments", Comment.addComments);
    //查看评论详情
    app.get("/Api/commentsDetail", Comment.commentDetail);
    //查看评论我的
    app.get("/Api/commentsToMe", Comment.commentsToMe);
    //加载用户信息
    app.get("/Api/getUserInfo", User.getUserInfo);
    //编辑用户信息
    app.post("/Api/editUserInfo", User.editUserInfo);
};