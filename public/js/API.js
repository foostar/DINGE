/*
 *   @API接口
 *       #Author   xiusiteng
 *       #createAt   2016-11-18
 *       #question   使用fetch  
 *   适应方式：  1.改写api方法  2.改写storage 
 */

function API (opt) {
    this.env = opt.env;
    this.URL = opt.url;
    this.requestNum = 0;
    this.cacheTime = opt.cacheTime || 0;
    this.showLoading =  opt.showLoading || function(){};
    this.closeLoading = opt.closeLoading || function(){};
}
API.prototype = {
    /*
     * 请求函数
     */
    api: function (opt, storage, controls) {
        var self = this;
        return $.ajax({
            url: opt.url || "",
            data: opt.data || {},
            method: opt.method || "GET",
            datatype: "json",
            beforeSend: function() {
                self.requestNum++;
                self.showLoading();
            },
            complete: function(data) {
                if(data.responseJSON.status == 1) {
                    var value;
                    if(!controls) { 
                        value = data.responseJSON.data;
                        if(Object.prototype.toString.call(value) == "[object Object]") {
                            value = JSON.stringify(Object.assign({}, value, { timeStamp: Date.now() }));
                        } else {
                            value = JSON.stringify(Object.assign({}, { 
                                timeStamp: Date.now(),
                                mes: value
                            }));
                        }
                    }
                    if(controls && controls.replace == true) {
                        value = Object.assign({}, JSON.parse(self.getStorage(storage)), opt.data, {
                            timeStamp: Date.now()
                        });
                        if (value.token) {
                            delete value.token;
                        }
                        value = JSON.stringify(value);
                    }
                    self.setStorage(storage, value);
                }
                self.requestNum--;
                if (self.requestNum == 0) {
                    self.closeLoading();
                }
            }
        });
    },
    /*
     * 设置缓存
     */
    setStorage: function (key, value) {
        if(!key || !value) throw new Error("缺少必要的参数");
        if(Object.prototype.toString.call(value) == "[object object]") {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
    },
    /*
     * 读取缓存
     */
    getStorage: function (key) {
        if(!key) throw new Error("缺少必要的参数");
        return localStorage.getItem(key);
    },
    /*
     * 删除缓存
     */
    removeStorage: function (key) {
        if(!key) throw new Error("缺少必要的参数");
        return localStorage.removeItem(key);
    },
    /*
     * 判断缓存是否过期
     */
    isExpire: function (key, cache) {
        var self = this;
        var now = Date.now();
        var storage = JSON.parse(this.getStorage(key));
        if(cache == 0){
            cache = 0;
        } else {
            cache = cache || self.cacheTime;
        }
        console.log(key, cache, storage);
        if(cache != 0 && storage && (cache == -1 || (now - storage.timeStamp) < cache * 60000 )){
            return true;
        }
        this.removeStorage(key);
    },
    /*
     * 推送缓存
     */
    cacheData: function (key) {
        var storage = JSON.parse(this.getStorage(key));
        return new Promise((resolve) => {
            resolve({ status: 1 , data: storage });
        });
    },
    /*
     * 获取用户信息
     */
    userInfo: function (opt, cache) {
        var self = this;
        var key = "userinfo";
        if(this.isExpire(key, cache)) {
            return self.cacheData(key);
        }
        return this.api({
            url: self.env == "test" ? `${self.URL}/data/getUserInfo.json` : `${self.URL}/Api/user/getUserInfo`,
            data: opt
        }, key);
    },
    /*
     * 编辑用户信息
     */
    editUserInfo: function (opt) {
        var self = this;
        var key = "userinfo";
        return this.api({
            url: self.env == "test" ? `${self.URL}/data/editUserInfo.json` : `${self.URL}/Api/user/editUserInfo`,
            method: self.env == "test" ? "GET" : "POST",
            data: opt
        }, key, {replace: true});
    },
    /*
     * 浏览历史
     */
    historyList: function (opt, cache) {
        var self = this;
        var key = "history";
        if(this.isExpire(key, cache)) {
            return self.cacheData(key);
        }
        return this.api({
            url: self.env == "test" ? `${self.URL}/data/history.json` : `${self.URL}/Api/user/getHistory`,
            data: opt
        }, key);
    },
    /*
     * 获取banner图片
     */
    banner: function (opt, cache) {
        var self = this;
        var key = "banner";
        if(this.isExpire(key, cache)) {
            return self.cacheData(key);
        }
        return this.api(Object.assign({}, opt, {
            url: self.env == "test" ? `${self.URL}/data/getCarousels.json` : `${self.URL}/Api/common/getCarousels`
        }), key);
    },
    /*
     * 获取首页的评论
     */
    comments: function (opt, cache) {
        var self = this;
        var key;
        if (!opt || !opt.page) throw new Error("page为必传的参数，或传入参数不合法");
        if (opt.movieId){
            key = opt.movieId + "comments";
        } else {
            key = "homecomments";
        }
        if(this.isExpire(key, cache) && opt.page == 1) {
            return self.cacheData(key);
        }
        return this.api({
            url: self.env == "test" ? `${self.URL}/data/getCommentsByRight.json` : `${self.URL}/Api/comment/getComments`,
            data: opt
        }, key);
    },
    /*
     * 获取聊天详情
     */
    dialogue: function (opt, cache) {
        var self = this;
        var key = "banner";
        if (!opt || !opt.page) throw new Error("page为必传的参数，或传入参数不合法");
        if(this.isExpire(key, cache) && opt.page == 1) {
            return self.cacheData(key);
        }
        return this.api({
            url: self.env == "test" ? `${self.URL}/data/getMessageDetail.json` : `${self.URL}/Api/message/getMessageDetail`,
            data: opt
        }, key);
    }

};