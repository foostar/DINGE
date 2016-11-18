var $ = window.jQuery;
var dingeTools = window.dingeTools;
(function($){
    function UserInfo(opt){
        this.id = opt.id;
        this.init();
    }
    UserInfo.prototype = {
        init:function(){
            dingeTools.init();
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            $(".user_carouse").on("tap", function(){
                window.location.href = "/views/edit_user.html";
            });
        },
        // 获取数据
        getData:function(){
            return dingeTools.userInfo({
                token:$.cookie("dinge")
            }, 5);
        },
        // 渲染数据
        renderData:function(result){
            var data = result.data;
            $(".user_carouse img").attr("src", data.avatar);
            $(".user_nickname").html(data.nickname);
            $(".notice").html(data.sign);
        },
        // 渲染页面
        render:function(){
            var self = this;
            dingeTools.loadingFooter();
            this.getData()
            .then(function(result){
                self.renderData(result);
            });
        }
    };
    new UserInfo({
        id:"userinfo"
    });
})($);