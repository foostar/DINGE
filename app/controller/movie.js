/**
 * Created by Administrator on 2016-06-08.
 */
var Movie = require("../model/movie");
var jwt = require("jwt-simple");
var Tools = require("../tools/tool");
var regex = require("../tools/regex")
//添加电影方法
exports.addMovie = function(req, res) {
    var _movie = {
        title:"蝙蝠侠大战超人",
        etitle:"superman battle",
        rating:{
            average:"7.8",
            star:80
        },
        directors:[{
            name:"xiu"
        },{
            name:"json"
        }],
        casts:[{
            name:"hahaha"
        },{
            name:"heiheihei"
        }],
        releasetime:new Date("2016-06-08T07:58:56.949Z"),
        country:[{
            name:'usa'  
        },{
            name:'uk'
        }],
        genres:[{
            name:'恐怖'
        },{
            name:'惊险'
        }],
        aka:[{
            name:"用户大战蝙蝠侠"
        },{
            name:'我了个呵呵呵'
        }],
        language:[{
            name:'english'
        },{
            name:'chinese'
        }],
        actime:125,
        images:{
            large:"https://img1.doubanio.com/view/movie_poster_cover/lpst/public/p2345947329.jpg",
            medium:"https://img1.doubanio.com/view/movie_poster_cover/spst/public/p2345947329.jpg",
            small:"https://img1.doubanio.com/view/movie_poster_cover/ipst/public/p2345947329.jpg"
        }
    }
    var movie = new Movie(_movie)
    movie.save()
        .then(function(result){
            res.redirect('/')
        })
};
//查看电影方法
exports.find = function(req, res){
    var _movieId = req.query.movieId;
    if(_movieId){
        Movie.findById(_movieId)
            .then(function(result) {
                if(!result) {
                    return res.json({ "status":-1, msg:"抱歉，没有这部电影！" })
                }
                return res.json(Tools.merge({}, { status:1 }, { data:result }))
            })
    }else{
        var _page = req.query.p
        var _index = (_page-1)*2
        if(_page) {
            Movie.find({})
                .sort({ 'updatedAt':-1 })
                .limit(10)
                .skip(_index)
                .exec()
                .then(function(result) {
                    if(!result) {
                        return res.json({ "status":-1, msg:"查找失败" })
                    }
                    return res.json(Tools.merge({}, { status:1 }, { data:result }))
                })
        }else{
            return res.json({ "status":-1, msg:"查找失败" })
        }

    }


};
//电影搜索
exports.search = function(req, res) {
    var _name = req.query.movieName;
    var name = new RegExp(_name)
    var _page = req.query.p || 1;
    var _index = (_page-1)*2;
    //检测搜索值为空
    if(!_name){
        return res.json({ "status":-1, msg:"查找失败" })
    }
    //检测只能为字母和数字和中文的组合，并且length小于20
    if(!regex.movieName.test(_name)){
        return res.json({ "status":-1, msg:"电影名称不合法" })
    }
    Movie.find({title:name})
        .sort({'updatedAt':-1})
        .limit(10)
        .skip(_index)
        .exec()
        .then(function(result){
            if(!result){
                return res.json({ "status":-1, msg:"查找失败" })
            }
            return res.json(Tools.merge({},{status:1},{data:result}))
        })
};