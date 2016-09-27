var $ = window.jQuery;
var dingeTools = window.dingeTools;

$(function(){
    //localStorage.removeItem("userinfo");
    function UserInfo(opt){
        this.init();
        this.id = opt.id;
    }
    UserInfo.prototype = {
        init:function(){
            dingeTools.init();
            this.render();
        },
        // 加载底部
        loadingFooter:function(){    
            $("#footer").load("../views/footer.html");
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
            this.loadingFooter();
            this.getData()
            .done(function(result){
                self.renderData(result);
            });
        }
    };
    new UserInfo({
        id:"userinfo"
    });
});