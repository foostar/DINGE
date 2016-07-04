/**
 * Created by Administrator on 2016-06-08.
 */
var Movie = require("../app/controller/movie")
module.exports = function(app) {
    //增加电影(改为post)
    app.get('/admin/Api/addmovie',Movie.addMovie)
}