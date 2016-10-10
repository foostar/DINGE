/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 我收藏的列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function MyCollet(opt){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.ele = $("#"+opt.id);
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
            self.initTouchMove();
            // 左滑出现删除按钮
            self.showDelete();
            // 关闭删除按钮
            self.cancelDelete();
            // 删除silder
            self.deleteFocus();
            // 向上返回
            $(".goback").on("tap", function(){
                window.history.back();
            });
        },
        deleteFocus:function(){
            var self = this;
            // 删除slider
            this.ele.on("tap",".del_collet",function(event){
                var userId = $(this).attr("data-id");
                $(this).parent().parent().remove();
                $.ajax({
                    url:"../data/unfocus.json",
                    method:"GET",
                    data:{
                        token:$.cookie("dinge"),
                        page:self.page,
                        userId:userId
                    },
                    dataType:"json"
                })
                .done(function(result){
                    if(result.status == 1 && result.data){
                        var item = result.data;
                        self.mySwiper.params.onlyExternal=true;
                        self.mySwiper.appendSlide(
                            "<div class='info_mini'>"
                                +"<div class='mycollet-slide'>"
                                    +"<a href='javascript:;'>"
                                        +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
                                        +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                        +"<div class='mycollet_content'>"+item.content+"</div>"
                                    +"</a>"
                                +"</div>"
                                +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                            +"</div>");
                        self.mySwiper.params.onlyExternal=false;
                        //Update active slide
                        self.mySwiper.updateActiveSlide(0);
                    }   
                });
                event.stopPropagation();
            });
        },
        cancelDelete:function(){
            this.ele.on("tap", function(){
                if($(".slide-left")){
                    $(".slide-left").removeClass("slide-left"); 
                }
                if($(".del_info_visible")){
                    $(".del_info_visible").removeClass("del_info_visible"); 
                }
            });
        },
        showDelete:function(){
            this.ele.on("swipeLeft",".swiper-slide", function(){
                $(this).find(".mycollet-slide").addClass("slide-left");
                $(this).find(".del_info_btn").addClass("del_info_visible");
            });
        },
        initTouchMove:function(){
            document.addEventListener("touchmove", function (event) {
                event.preventDefault();
            }, false);
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
                $(".swiper-container").height($(window).height()-($(".mes_title").height()+$(".footer").height()));
                dtd.resolve({status:1});
            });
            return dtd;
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
        loadColletList:function(){
            return  $.ajax({
                url:"../data/getMyCollet.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:this.page
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            var html = "";
            if(result.status == 1 &&  result.data.length>0) {
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-slide'>"
                                +"<div class='info_mini'>"
                                    +"<div class='mycollet-slide'>"
                                        +"<a href='javascript:;'>"
                                            +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
                                            +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                            +"<div class='mycollet_content'>"+item.content+"</div>"
                                        +"</a>"
                                    +"</div>"
                                    +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
                                +"</div>"
                            +"</div>";
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
                        if($(".slide-left")){
                            $(".slide-left").removeClass("slide-left"); 
                        }
                        if($(".del_visible")){
                            $(".del_visible").removeClass("del_visible"); 
                        }
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
                            self.loadColletList(self.page)
                            .done(function(result){
                                if(result.status == 1 &&  result.data.length>0){
                                    var data = result.data;
                                    data.forEach(function(item){
                                        self.mySwiper.appendSlide(
                                            "<div class='info_mini'>"
                                                +"<div class='mycollet-slide'>"
                                                    +"<a href='javascript:;'>"
                                                        +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
                                                        +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                                        +"<div class='mycollet_content'>"+item.content+"</div>"
                                                    +"</a>"
                                                +"</div>"
                                                +"<div class='del_collet' data-id='"+item._id+"'></div>"
                                            +"</div>");
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
    var mycollet = new MyCollet({id:"mycollet"});
    mycollet.init();
});
