var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    
    
    function MessagesComment(){

    }
    MessagesComment.prototype={
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
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
            });
        },
        loadCommentList:function(){
            return $.ajax({
                url:"../data/commentsDetail.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge")
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            var html = "";
            if(result.status == 1 && result.data.length>0){ 
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-wrapper'>"
                                +"<div class='swiper-slide'>"
                                    +"<ul class='comment'>"
                                        +"<li class='head_img'>"
                                            +"<img src='"+item.commentFrom.avatar+"' alt=''>"
                                            +"<em class='font-normal'>"+item.commentFrom.nickname+"</em>"
                                        +"</li>"
                                        +"<li class='comment_ri'>"
                                            +"<p class='font-bold'>"+item.title+"</p>"
                                            +"<h4 class='font-normal'>——「<span>"+item.content+"</span>」"
                                            +"</h4>"
                                        +"</li>"
                                    +"</ul>"
                                +"</div>"
                            +"</div>";
                });
                $(html).appendTo($(".swiper-wrapper"));
            }
        },
        initSwiper:function(result){
            if(result.status == 1){
                // 初始化swiper
                new Swiper(".swiper-container",{
                    slidesPerView:"auto",
                    mode:"vertical",
                    watchActiveIndex: true
                });
            }
        }
    };
    var messagescomment = new MessagesComment();
    messagescomment.init();
});