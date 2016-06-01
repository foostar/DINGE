/**
 * Created by Administrator on 2016-06-01.
 * 用户端静态路由
 */
var send=require('send')
module.exports=function(app){
    app.get('/',function(req,res){
         send(req, path.join(__dirname, 'public/index.html')).pipe(res)
    })
}
