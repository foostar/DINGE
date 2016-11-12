/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 历史记录
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
(function($){
    function MyComment(opt){
        this.ele = $("#"+opt.id);
        this.mySwiper = "";
        this.holdPosition = 0;
        this.page = 0;
        this.init();
    }
    MyComment.prototype = {
        init:function(){
            dingeTools.init();
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            var self = this;
            // 初试化touchmove，解决tap中 swipe不生效的问题
            dingeTools.initTouchMove();
            // 左滑出现删除按钮
            dingeTools.showDelete(self.ele);
            // 删除我的影评
            self.deleteSlider();
            // 关闭删除按钮
            dingeTools.cancelDelete(self.ele);
            // 向上返回
            dingeTools.goBack();
        },
        getTemplate:function(item){
            return "<div class='info_mini'>"
                        +"<div class='info_slide'>"
                            +"<a href='javascript:;'>"
                                +"<div class='mycomment_title font-h'>「"+item.content+"」</div>"
                                +"<ul class='mycomment_body font-normal'><li class='mycomment_heart'><img src='../images/comment_likeS.png' alt=''><span>"+item.star+"</span></li><li class='mycomment_say'><img src='../images/comment_commentS.png' alt=''><span>"+item.reading+"</span></li></ul>"
                            +"</a>"
                        +"</div>"
                        +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                        +"<div class='del_info_mask'></div>"
                    +"</div>";
        },
        deleteSlider:function(){
            var self = this;
            // 删除slider
            self.ele.on("tap",".del_info_btn",function(event){
                var userId = $(this).attr("data-id");
                $(this).parent().parent().remove();
                self.deleteAction({
                    token:$.cookie("dinge"),
                    page:self.page,
                    userId:userId
                })
                .done(function(result){
                    if(result.status == 1 && result.data){
                        var item = result.data;
                        self.mySwiper.params.onlyExternal=true;
                        self.mySwiper.appendSlide(self.getTemplate(item));
                        self.mySwiper.params.onlyExternal=false;
                        //Update active slide
                        self.mySwiper.updateActiveSlide(0);
                    }
                });
                event.stopPropagation();
            });
        },
        deleteAction:function(data){
            return $.ajax({
                url:"../data/deleteMyConmment.json",
                method:"GET",
                data:data,
                dataType:"json"
            });
        },  
        render:function(){
            var self = this;
            // 加载底部文件
            dingeTools.loadingFooter()
            .then(function(result){
                if(result.status == 1){
                    // 展示数据
                    self.showList();
                }
            });
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadCommentList(self.page)
            .done(function(result){
                // 拼凑数据
                self.makeData(result);
                // 初始化swiper
                self.initSwiper(result);
            });
        },
        loadCommentList:function(page){
            return $.ajax({
                url:"../data/getMyConmment.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:page
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            var self = this;
            var html = "";
            if(result.status == 1 && result.data.length>0){ 
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-slide'>"+self.getTemplate(item)+"</div>";
                });
                $(html).appendTo($(".swiper-wrapper"));
            }
        },
        initSwiper:function(result){
            var self = this;
            if (result.status != 1 || self.page != 0) return;
            // 初始化swiper
            self.mySwiper = new Swiper(".swiper-container",{
                slidesPerView:"auto",
                mode:"vertical",
                watchActiveIndex: true,
                onTouchStart: function() {
                    self.holdPosition = 0;
                },
                onTouchMove:function(){
                    dingeTools.cancelBtn();
                },
                onResistanceAfter: function(s, pos){
                    self.holdPosition = pos;
                },
                onTouchEnd: function(){
                    if (self.holdPosition < 100) return;
                    // 准备加载新的slider
                    self.preAddSlider();
                    // 加载新的slide
                    self.addSlider(); 
                }
            });
            self.page++; 
        },
        preAddSlider:function(){
            var self = this;
            var swiperHeight = $(".swiper-wrapper").height();
            var containerHeight = self.mySwiper.height;
            if(swiperHeight > containerHeight){
                var transition = "-"+(swiperHeight-containerHeight+100);
                self.mySwiper.setWrapperTranslate(0,transition,0);
            }
            self.mySwiper.params.onlyExternal=true;
            $(".preloader").addClass("visible_bottom");
        },
        addSlider:function(){
            var self = this;
            self.loadCommentList(self.page)
            .done(function(result){
                if(result.status == 1 && result.data.length>0){
                    var data = result.data;
                    data.forEach(function(item){
                        var template = self.getTemplate(item);
                        self.mySwiper.appendSlide(template);
                    });
                    self.mySwiper.params.onlyExternal=false;
                    //Update active slide
                    self.mySwiper.updateActiveSlide(0);
                    //Hide loader
                    $(".preloader").removeClass("visible_bottom");
                    self.page++;
                }
            });    
        }
    };
    new MyComment({id:"mycomment"});
})($);