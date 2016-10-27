var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
(function($){
    function MyFocus(opt){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.ele = $("#"+opt.id);
        this.init();
    }
    MyFocus.prototype = {
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
            self.deleteSlider();
            // 向上返回
            dingeTools.goBack();

        },
        getTemplate:function(item){
            return "<div class='info_normal'>"
                        +"<div class='info_slide'>"
                            +"<div class='myfocus_carouse'>"
                                +"<a href='javascript:;'>"
                                    +"<img src='"+item.avatar+"'>"
                                +"</a>"
                            +"</div>"
                            +"<div class='myfocus_content'>"
                                +"<a href='javascript:;'>"
                                    +"<div class='myfocus_nickname'>"+item.nickname+"</div>"
                                    +"<div class='myfocus_notice font-normal'>"+item.sign+"</div>"
                                +"</a>"
                            +"</div>"
                        +"</div>"
                        +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                    +"</div>";
        },
        deleteSlider:function(){
            // 删除slider
            var self = this;
            $(".swiper-container").on("tap",".del_info_btn",function(event){
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
            dingeTools.loadingFooter()
            .then(function(result){
                if(result.status == 1){
                    // 展示数据
                    self.showList();
                }
            });
        },
        loadFocusList:function(page){
            return  $.ajax({
                url:"../data/getUserFocuslist.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:page
                },
                dataType:"json"
            });
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadFocusList(self.page)
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
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
                            // Hold Swiper in required position
                            //mySwiper.setWrapperTranslate(0,100,0);

                            //Dissalow futher interactions
                            self.mySwiper.params.onlyExternal=true;

                            //Show loader
                            $(".preloader").addClass("visible_bottom");

                            //加载新的slide
                            self.loadFocusList(self.page)
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
                    }
                });
                self.page++;
            }    
        }
    };
    new MyFocus({id:"myfocus"});
})($);
