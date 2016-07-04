/**
 * Created by Administrator on 2016-06-01.
 * 用户端静态路由
 */
var Home=require("../app/controller/home.js")
module.exports=function(app){
    app.get('/',Home.render);
}
