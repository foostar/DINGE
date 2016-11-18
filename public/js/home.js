var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function Home(){
        this.page = 0;
        this.pageSize = 20;
        this.init();
    }
    Home.prototype = {
        init:function(){
            dingeTools.init();
            // loading
            $(".loading").hide();
            this.render();

        },
        //渲染页面
        render:function(){
            var self = this;
            self.loadingFooter();
            self.loadingImg();
            $.when(self.loadingBanner(),self.loadingComent())
            .then(function(){
                $("#loading").hide();   
            });
        },
        loadingFooter:function(){
            // 加载底部  
            $("#footer").load("../views/footer.html");
        },
        loadingImg:function(){
            $("#loading").show();
        },
        loadingBanner:function(){
            //轮播图部分
            var dtd = $.Deferred();
            dingeTools.banner({}, -1)
            .then(function(result){
                var html = "";
                if(result.status == 1 && result.data.list.length>0){ 
                    var data = result.data.list;
                    data.forEach(function(item){
                        html += "<div class='swiper-slide'><a class='pic' href='javascript://'><img src="+item.url+" alt=''/></a></div>";
                    });
                    $(html).appendTo($(".swiper-wrapper"));
                }
                if(result.status == 1){
                    new Swiper(".swiper-container",{  
                        direction:"horizontal",//横向滑动  
                        loop:true,//形成环路（即：可以从最后一张图跳转到第一张图 
                        pagination:".swiper-pagination",//分页器  
                        prevButton:".swiper-button-prev",//前进按钮 
                        nextButton:".swiper-button-next",//后退按钮 
                        autoplay:3000//每隔3秒自动播放

                    });
                }
                dtd.resolve();
            });
            return dtd;
        },
        nextPage: function () {
            var self = this;
            this.page++;
            return dingeTools.comments({
                page: self.page,
                pageSize: self.pageSize
            });
        },
        loadingComent:function(){
            var dtd = $.Deferred();
            this.nextPage()
            .then(function(res){
                var data = res.data.list;
                var html = "";
                data.length > 0 && data.forEach(function(item,index){                   
                    html += "<div class='home_comment_block flex-container";
                    if(index%2){
                        html+=" home_comment_right";
                    }
                    html +=  "'>"
                                +"<img class='home_comment_img flex-normal' src='"+item.movie.images.small+"' alt=''>"
                                +"<div class='home_comment flex-normal'>"
                                    +"<div class='home_comment_author font-normal'>"
                                        +"<em>"+dingeTools.fromNow(item.createdAt)+"</em>"
                                        +"<a href='other_means.html'><span style='background-image:url(../.."+item.commentFrom.avatar+");'>"+item.commentFrom.nickname+"</span></a>"
                                    +"</div>"
                                    +"<div class='home_comment_title'>"+item.content+"</div>"
                                    +"<div class='flex-container home_comment_meta font-normal'>"
                                        +"<div class='flex-normal'>阅读<span>"+item.reading+"</span></div>"
                                        +"<div class='flex-normal'>评论<span>"+item.rank+"</span></div>"
                                        +"<div class='flex-normal'>喜欢<span>"+item.weight+"</span></div>"
                                    +"</div>"
                                +"</div>"
                            +"</div>";
                });
                $(html).appendTo($("#loadingComent"));
                dtd.resolve();      
            });
            return dtd;
        }
    };
    new Home();
   // home.init();
});