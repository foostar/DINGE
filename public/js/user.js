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
            //this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            $(".user_carouse").on("tap", function(){
                window.location.href = "/views/edit_user.html";
            });
        },
        // 存储storage
        setStorage:function(data){
            localStorage.removeItem("userinfo");
            localStorage.userinfo = JSON.stringify({
                status:1,
                data:{
                    avatar:data.avatar,
                    nickname:data.nickname,
                    sign:data.sign 
                }  
            });
        },
        // 获取数据
        getData:function(){
            var dtd = $.Deferred();
            if(localStorage.getItem("userinfo")){
                dtd.resolve(JSON.parse(localStorage.getItem("userinfo")));
                return dtd;
            }
            return $.ajax({
                url:"../data/getUserInfo.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge")
                },
                dataType:"json"
            });
        },
        // 渲染数据
        renderData:function(result){
            var data = result.data;
            $(".user_carouse img").attr("src", data.avatar);
            $(".user_nickname").html(data.nickname);
            $(".notice").html(data.sign);
            if(!localStorage.getItem("userinfo")){
                this.setStorage(data);
            }
        },
        // 渲染页面
        render:function(){
            var self = this;
            dingeTools.loadingFooter();
            this.getData()
            .done(function(result){
                self.renderData(result);
            });
        }
    };
    new UserInfo({
        id:"userinfo"
    });
})($);