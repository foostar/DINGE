"use strict";

var _user = require("../app/user");

var _user2 = _interopRequireDefault(_user);

var _movie = require("../app/movie");

var _movie2 = _interopRequireDefault(_movie);

var _comment = require("../app/comment");

var _comment2 = _interopRequireDefault(_comment);

var _common = require("../common/common");

var _common2 = _interopRequireDefault(_common);

var _message = require("../app/message");

var _message2 = _interopRequireDefault(_message);

var _middleware = require("../middleware/middleware");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 用户接口
 */
module.exports = app => {
  /*
   *  @desc  common
   */
  // 加载首页轮播图
  app.get("/common/getCarousels", _common2.default.getCarousels);
  // 搜索电影
  app.get("/common/search", _common2.default.search);
  /*
   *  @desc  user相关
   */
  // 加载我关注的人
  app.get("/user/getUserFocuslist", _middleware.isAuth, _user2.default.focusList);
  // 加载关注我的人
  app.get("/user/getUserFocusFromlist", _middleware.isAuth, _user2.default.focusFromList);
  // 关注用户
  app.post("/user/FocusUser", _middleware.isAuth, _user2.default.focusUser);
  // 用户注册api
  app.post("/user/signup", _user2.default.signUp);
  // 用户登录api
  app.post("/user/signin", _user2.default.signin);
  // 加载用户信息
  app.get("/user/getUserInfo", _middleware.isAuth, _user2.default.getUserInfo);
  // 编辑用户信息
  app.post("/user/editUserInfo", _middleware.isAuth, _user2.default.editUserInfo);
  // 上传头像
  app.post("/user/getAvatar", _user2.default.getAvatar);
  // 加载用户历史记录
  app.get("/user/getHistory", _middleware.isAuth, _user2.default.getHistory);
  // 加载他人资料
  app.get("/user/userInfo", _user2.default.userInfo);
  // 拉入黑名单
  app.get("/user/blackList", _middleware.isAuth, _user2.default.blackList);
  // 举报用户
  app.get("/user/reportUser", _middleware.isAuth, _user2.default.reportUser);
  /*
   *  @desc  movie相关
   */
  // 电影详情
  app.get("/movie/movieFindOne", _movie2.default.find);
  // 电影列表
  app.get("/movie/showMovieList", _movie2.default.find);
  /*
   *  @desc  comment相关
   */
  // 评论电影
  app.post("/comment/commentMovie", _middleware.isAuth, _comment2.default.save);
  // 加载评论
  app.get("/comment/getComments", _comment2.default.getCommentsList);
  // 加载我的影评
  app.get("/comment/myComments", _middleware.isAuth, _comment2.default.getMyComments);
  // 评论别人的评论
  app.post("/comment/addComments", _middleware.isAuth, _comment2.default.addComments);
  // 查看评论详情
  app.get("/comment/commentsDetail", _comment2.default.commentDetail);
  // 查看评论我的
  app.get("/comment/commentsToMe", _middleware.isAuth, _comment2.default.commentsToMe);
  // 查看给我点赞的
  app.get("/comment/zanList", _middleware.isAuth, _comment2.default.zanList);
  // 喜欢用户的评论
  app.post("/comment/addLike", _middleware.isAuth, _comment2.default.addLike);
  // 收藏评论
  app.post("/comment/collet", _middleware.isAuth, _comment2.default.collet);
  // 查看我收藏的评论
  app.get("/comment/getMyCollet", _middleware.isAuth, _comment2.default.getMyCollet);
  /*
   *  @desc  message相关
   */
  // 发送私信
  app.post("/message/sendMessage", _message2.default.sendMessage);
  // 私信列表
  app.get("/message/getMessageList", _message2.default.getMessageList);
  // 查看私信详情
  app.get("/message/getMessageDetail", _message2.default.getMessageDetail);
  /* eslint-disable */
  app.use((err, req, res, next) => {
    // next(err)
    res.status(err.status || 500).json(err);
  });
};