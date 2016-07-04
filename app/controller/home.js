/**
 * Created by Administrator on 2016-06-03.
 */
var send=require("send");
var path=require("path");
exports.render=function(req, res){
    send(req, path.join(__dirname,'../../', 'public/views/index.html')).pipe(res);
}