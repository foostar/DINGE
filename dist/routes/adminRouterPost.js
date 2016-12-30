"use strict";

var _user = require("../app/user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by @xiusiteng on 2016-11-23.
 * @desc 后台接口
 */
module.exports = app => {
  // 增加电影(改为post)
  app.get("/", (req, res) => {
    res.render("home", { title: "受益人" });
  });
  // 加载用户列表
  /*
   *  @desc  未来可能要挪到后台的功能
   */
  app.get("/getUserlist", _user2.default.showList);
};