var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
(function($){
    function MyCollet(opt){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.ele = $("#"+opt.id);
        this.init();
    }
    MyCollet.prototype = {
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
            // 关闭删除按钮
            dingeTools.cancelDelete(self.ele);
            // 删除silder
            self.deleteSilder();
            // 向上返回
            dingeTools.goBack();
            self.goHref();
        },
        goHref:function(){
            $(".m_details_top").tap(function(){
                window.location.href = "/views/moviedetails_top.html";
            });
            $(".m_detail_href").tap(function(){
                window.location.href="/views/moviedetails_comment.html";
            });
        },
        getTemplate:function(item){
            return "<div class='info_mini'>"
                        +"<div class='info_slide'>"
                            +"<div class='mycollet_author font-normal'>"
                                +"<div class='m_detail_left'>"
                                    +"<a href='javascript:;'>"
                                        +"<img src='"+item.commentFrom.avatar+"' alt=''><span>"+item.commentFrom.nickname+"</span>"
                                    +"</a>"
                                +"</div>"
                                +"<div class='m_detail_comment'>"+item.rank+"</div>"
                            +"</div>"
                            +"<div class='mycollet_title m_detail_title'>"+item.title+"</div>"
                            +"<div class='mycollet_content font-normal'>"+item.content+"</div>"
                        +"</div>"
                        +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                    +"</div>";
        },
        deleteSilder:function(){
            var self = this;
            // 删除slider
            this.ele.on("tap",".del_info_btn",function(event){
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
                        var template = self.getTemplate(item);
                        self.mySwiper.params.onlyExternal=true;
                        self.mySwiper.appendSlide(template);
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
                url:"../data/unfocus.json",
                method:"GET",
                data:data,
                dataType:"json"
            });
        },
        render:function(){
            var self = this;
            // 加载底部文件
            dingeTools.loadingFooter();
            self.showList(); 
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadColletList(self.page)
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
            });
        },
        loadColletList:function(page){
            return  $.ajax({
                url:"../data/commentsDetail.json",
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
            if(result.status == 1 &&  result.data.length>0) {
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-slide'>"+self.getTemplate(item)+"</div>";
                });
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
                            self.loadColletList(self.page)
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
    new MyCollet({id:"mycollet"});
})($);
