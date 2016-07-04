/**
 * Created by Administrator on 2016-06-08.
 */
var tools={
    merge:function(des, src, obj){
        for(var i in src){
            des[i] = src[i]
        }
        for(var j in obj){
            des[j] = obj[j]
        }
        return des
    }
}
module.exports=tools