/**
 * Created by Administrator on 2016-06-07.
 */
var Regexp = require("../tools/regex");
var Tools = require("../tools/tool")
var User = require("../model/user");
var passport=require("passport");
var jwt = require("jwt-simple");
/*
 * 注册接口方法
 */
exports.signUp = function(req, res){
    var _user = req.body
    //检测空账户
    if(!_user.email) {
        return res.json({ "status":-1, msg:"邮箱不能为空" })
    }
    //检测空密码
    if(!_user.password) {
        return res.json({ "status":-1, msg:"密码不能为空" })
    }
    //账号格式不正确
    if(!Regexp.email.test(_user.email)) {
        return res.json({ "status":-1, msg:"邮箱格式不正确" })
    }
    //检测密码规范
    if(!Regexp.password.test(_user.password)) {
        return res.json({ "status":-1, msg:"密码格式不正确,应为字母或数字的组合或任意一种，长度在8-22位之间" })
    }
    //检测重复用户
    User.find({username:_user.username}).exec()
        .then(function(user) {
            if(user.length > 0){
                return res.json({"status":-1,msg:"邮箱已经被注册"})
            }
        })
        .then(function() {
            var user = new User(_user)
            user.save(function () {
                return res.json({"status":1,msg:""})
            })
        })

};
/*
 * 登陆接口方法
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info){
        console.log(err,user,info)
        if(!user){
            var response = Tools.merge({},{status:-1},info)
            return res.json(response)
        }
        var token = jwt.encode({ username:user._id }, app.get("jwtTokenSecret"));
        //模拟token
        req.session.token = token
        res.json({ status:-1 , data:{ "token":token } })
    })(req, res, next)
}