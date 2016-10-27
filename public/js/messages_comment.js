var $ = window.jQuery,
        dingeTools = window.dingeTools,
        Swiper = window.Swiper;
(function($){
    function MessagesComment(opt){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.ele = $("#"+opt.id);
        this.init();
    }
    MessagesComment.prototype={
        init:function(){
            dingeTools.init(); 
            this.bindEvent();
            this.render();
        },
        getTemplate:function(item){
            return "<div class='info_large'>"
                        +"<div class='info_slide'>"
                            +"<div class='mescomment_carouse'>"
                                +"<a href='javascript:;'>"
                                    +"<img src='"+item.commentFrom.avatar+"' alt=''>"
                                    +"<em class='font-normal'>"+item.commentFrom.nickname+"</em>"
                                +"</a>"
                            +"</div>"
                            +"<div class='mescomment_comment flex-normal'>"
                                +"<a href='javascript:;'>"
                                    +"<p class='font-bold'>"+item.content+"</p>"
                                    +"<h4 class='font-normal'>——「<span>"+item.commentId.title+"</span>」</h4>"
                                +"</a>"
                            +"</div>"
                        +"</div>"
                        +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                        +"<div class='del_info_mask'></div>"
                    +"</div>";
        },
        bindEvent:function(){
            var self = this;
            // 初试化touchmove，解决tap中 swipe不生效的问题
            dingeTools.initTouchMove();
            // 左滑出现删除按钮
            dingeTools.showDelete(self.ele);
            // 关闭删除按钮
            dingeTools.cancelDelete(self.ele);
            // 向上返回
            dingeTools.goBack();
        },
        render:function(){
            var self = this;
            // 加载底部文件
            dingeTools.loadingFooter();
            // 展示数据
            self.showList();
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadMessageComment({
                token:$.cookie("dinge"),
                page:self.page
            })
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
            });
        },
        loadMessageComment:function(data){
            return  $.ajax({
                url:"../data/commentToMe.json",
                method:"GET",
                data:data,
                dataType:"json"
            });
        },
        makeData:function(result){
            var self = this;
            var html = "";
            if(result.status == 1 &&  result.data.length>0) {
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-slide'>"+self.getTemplate(item)+"</div>";
                });
                console.log(html);
                $(html).appendTo($(".swiper-wrapper"));
            }
        },
        initSwiper:function(result){
            var self = this;
            if(result.status == 1 && self.page == 0){
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
                        if (self.holdPosition>100) {
                            var swiperHeight = $(".swiper-wrapper").height();
                            var containerHeight = self.mySwiper.height;
                            if(swiperHeight > containerHeight){
                                var transition = "-"+(swiperHeight-containerHeight+100);
                                self.mySwiper.setWrapperTranslate(0,transition,0);
                            }
                            self.mySwiper.params.onlyExternal=true;
                            //Show loader
                            $(".preloader").addClass("visible_bottom");
                            //加载新的slide
                            self.loadMessageComment({
                                token:$.cookie("dinge"),
                                page:self.page
                            })
                            .done(function(result){
                                if(result.status == 1 &&  result.data.length>0){
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
                    }
                });
                self.page++;
            } 
        }
    };
    new MessagesComment({id:"commentToMe"});
})($);
