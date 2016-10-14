/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 历史记录
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function MyComment(){

    }
    MyComment.prototype = {
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
                url:"../data/getMyConmment.json",
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
                                    +"<div class='info_mini'>"
                                        +"<a href='javascript:;'>"
                                            +"<div class='mycomment_title font-h'>「"+item.content+"」</div>"
                                            +"<ul class='mycomment_body font-normal'><li class='mycomment_heart'><img src='../images/comment_likeS.png' alt=''><span>"+item.star+"</span></li><li class='mycomment_say'><img src='../images/comment_commentS.png' alt=''><span>"+item.reading+"</span></li></ul>"
                                        +"</a>"
                                    +"</div>"
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
    var mycomment = new MyComment();
    mycomment.init();
});