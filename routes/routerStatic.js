/**
 * Created by Administrator on 2016-06-01.
 * 用户端静态路由
 */
var Home=require("../app/controller/home.js")
module.exports=function(app){
	//测试页面
    app.get('/',Home.render);
    //登陆页面
    app.get('/login',Home.Login);
}
