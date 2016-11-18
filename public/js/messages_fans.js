var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function MessagesFans(){
        this.page = 0;
    }
    MessagesFans.prototype = {
        init:function(){
            dingeTools.init();
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            // 向上返回
            $(".goback").on("tap", function(){
                window.history.back();
            });
        },
        render:function(){
            var self = this;
            // 加载底部文件
            self.loadingFooter()
            .then(function(result){
                if(result.status == 1){
                    // 展示数据
                    self.showList();
                }
            });
        },
        loadingFooter:function(){
            var dtd = $.Deferred();
            $("#footer").load("../views/footer.html",function(){
                dtd.resolve({status:1});
            });
            return dtd;
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadCommentList()
            .then(function(result){
                // 拼凑数据
                self.makeData(result);
                // 初始化swiper
                self.initSwiper(result);
            });
        },
        loadCommentList:function(){
            var self = this;
            this.page++;
            return dingeTools.userLikeMe({
                token:$.cookie("dinge"),
                page: self.page
            });
        },
        makeData:function(result){
            var html = "";
            if(result.status == 1 && result.data.list.length>0){ 
                var data = result.data.list;
                data.forEach(function(item){
                    html += "<div class='swiper-wrapper'>"
                                +"<div class='swiper-slide'>"
                                    +"<div class='fans'><span>"+item.commentFrom.nickname+"</span>成为了你的粉丝</div>"
                                +"</div>"
                            +"</div>";
                });
                $(html).appendTo($(".swiper-wrapper"));
            }
        },
        initSwiper:function(result){
            if(result.status == 1 && this.page == 1){
                // 初始化swiper
                new Swiper(".swiper-container",{
                    slidesPerView:"auto",
                    mode:"vertical",
                    watchActiveIndex: true
                });
            }
        }
    };
    var messagefans = new MessagesFans();
    messagefans.init();
});