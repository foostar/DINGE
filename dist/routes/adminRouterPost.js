"use strict";

var _user = require("../admin/user");

var _user2 = _interopRequireDefault(_user);

var _common = require("../common/common");

var _common2 = _interopRequireDefault(_common);

var _movie = require("../admin/movie");

var _movie2 = _interopRequireDefault(_movie);

var _comment = require("../admin/comment");

var _comment2 = _interopRequireDefault(_comment);

var _ad = require("../admin/ad");

var _ad2 = _interopRequireDefault(_ad);

var _middleware = require("../middleware/middleware");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = app => {
  /*
   *  @desc  common
   */
  // 查看举报的列表
  app.get("/common/reports", _middleware.isAuth, _common2.default.reports);
  /*
   *  @desc  movie相关
   */
  // 电影列表
  app.get("/movie/movielist", _middleware.isAuth, _movie2.default.find);
  // 豆瓣电影
  app.get("/movie/dbMovie", _middleware.isAuth, _movie2.default.dbMovie);
  // 添加电影
  app.post("/movie/addMovie", _middleware.isAuth, _movie2.default.addMovie);
  // 删除电影
  app.get("/movie/delete", _middleware.isAuth, _movie2.default.delMovie);
  /*
   *  @desc  user相关
   */
  // 后台用户登录
  app.post("/user/login", _user2.default.login);
  // 加载用户列表
  app.get("/user/userlist", _middleware.isAuth, _user2.default.userlist);
  // 屏蔽用户
  app.get("/user/shut", _middleware.isAuth, _user2.default.shut);
  // 更改密码
  app.post("/user/changepassword", _middleware.isAuth, _user2.default.changePass);
  /*
   *  @desc  评论相关
   */
  // 评论列表
  app.get("/comment/commentlist", _middleware.isAuth, _comment2.default.find);
  // 评论列表
  app.get("/comment/shield", _middleware.isAuth, _comment2.default.shield);
  // 删除评论
  app.get("/comment/delete", _middleware.isAuth, _comment2.default.delete);
  // 更改权重
  app.get("/comment/changeWeight", _middleware.isAuth, _comment2.default.changeWeight);
  /*
   *  @desc  广告相关
   */
  // 添加广告
  app.post("/ad/addCarousel", _middleware.isAuth, _ad2.default.addCarousel);
  // 展示广告图片
  app.get("/ad/adlist", _middleware.isAuth, _ad2.default.adlist);
  // 展示广告图片
  app.get("/ad/delete", _middleware.isAuth, _ad2.default.delete);
  // 展示广告图片
  app.get("/ad/changeWeight", _middleware.isAuth, _ad2.default.changeWeight);
  // 查看手机定位
  app.get("/geolocation", _common2.default.location);
  app.get("/saveLocation", _common2.default.saveLocation);
  app.get("/getLocation", _common2.default.getLocation);
  app.get("/getSetting", _common2.default.getSetting);
  app.get("/getCode", _common2.default.getCode);
  /* eslint-disable */
  app.use((err, req, res, next) => {
    // next(err)
    res.status(err.status || 500).json(err);
  });
};