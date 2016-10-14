/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 私信详细列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function MessageList(opt){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.ele = $("#"+opt.id);
    }
    MessageList.prototype={
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
            // 删除slider
            var self = this;
            $(".swiper-container").on("tap",".del_focus",function(event){
                var userId = $(this).attr("data-id");
                $(this).parent().parent().remove();
                $.ajax({
                    url:"../data/getMessageList.json",
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
                                +"<div class='message_list_slide'>"
                                    +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                        +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                        +"<div class='message_list'>"
                                            +"<div class='message_nickname'>"+item.username+"</div>"
                                            +"<div class='message_date'>"+dingeTools.format(item.createdAt,"MM-dd")+"</div>"
                                            +"<div class='message_talk'>"+item.content+"</div>"
                                        +"</div>"
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
                if($(".del_info_visible_normal")){
                    $(".del_info_visible_normal").removeClass("del_info_visible_normal"); 
                }
            });
        },
        showDelete:function(){
            this.ele.on("swipeLeft",".swiper-slide", function(){
                $(this).find(".message_list_slide").addClass("slide-left");
                $(this).find(".del_info_btn").addClass("del_info_visible_normal");
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
                dtd.resolve({status:1});
            });
            return dtd;
        },
        loadMessageList:function(){
            return  $.ajax({
                url:"../data/getMessageList.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:this.page
                },
                dataType:"json"
            });
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadMessageList(self.page)
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
            var html = "";
            if(result.status == 1 &&  result.data.length>0) {
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-slide'>"
                            +"<div class='info_mini'>"
                                +"<div class='message_list_slide'>"
                                    +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                        +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                        +"<div class='message_list'>"
                                            +"<div class='message_nickname'>"+item.username+"</div>"
                                            +"<div class='message_date'>"+dingeTools.format(item.createdAt,"MM-dd")+"</div>"
                                            +"<div class='message_talk'>"+item.content+"</div>"
                                        +"</div>"
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
                            self.loadMessageList(self.page)
                            .done(function(result){
                                if(result.status == 1 && result.data.length>0){
                                    var data = result.data;
                                    data.forEach(function(item){
                                        self.mySwiper.appendSlide(
                                            "<div class='info_mini'>"
                                                +"<div class='message_list_slide'>"
                                                    +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                                        +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                                        +"<div class='message_list'>"
                                                            +"<div class='message_nickname'>"+item.username+"</div>"
                                                            +"<div class='message_date'>"+dingeTools.format(item.createdAt,"MM-dd")+"</div>"
                                                            +"<div class='message_talk'>"+item.content+"</div>"
                                                        +"</div>"
                                                    +"</a>"
                                                +"</div>"
                                                +"<div class='del_info_btn' data-id='"+item._id+"'></div>"
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
    var messagelist = new MessageList({id:"messagelist"});
    messagelist.init();
});