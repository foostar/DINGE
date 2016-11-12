/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 私信详细列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
(function($){
    function Message(){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
        this.init();
    }
    Message.prototype = {
        init:function(){
            dingeTools.init(); 
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            var self = this;
            // 发送私信
            self.sendMessage();
            // 向上返回
            dingeTools.goBack();
            // 刷新拉取新的聊天信息
            self.getRefresh();
        },
        getRefresh:function(){
            var self = this;
            $(".chat-refresh").on("tap", function(){
                self.showList();
            });
        },
        sendMessage:function(){
            var self = this;
            $("#sendMessage").submit(function(event){
                var messageInput = $.trim($("#message_input").val());
                event.preventDefault();
                if(messageInput){
                    var toId = $(".triangle-left").attr("data-to");
                    self.sendPost({
                        token:$.cookie("dinge"),
                        to:toId,
                        content:messageInput
                    })
                    .done(function(result){
                        if(result.status == 1){
                            self.mySwiper.appendSlide(
                                "<div class='swiper-slide swiper-from'>"
                                    +"<div class='dialog_carouse'><img src='"+result.data.avatar+"'/></div>"
                                    +"<div class='triangle-right'></div>"
                                    +"<div class='dialog_content'>"+messageInput+"</div>"
                                +"</div>"
                            );
                            var swiperHeight = $(".swiper-wrapper").height();
                            var containerHeight = self.mySwiper.height;
                            if(swiperHeight > containerHeight){
                                var transition = "-"+(swiperHeight-containerHeight);
                                self.mySwiper.setWrapperTranslate(0,transition,0);
                            }
                            self.mySwiper.params.onlyExternal=false;
                            dingeTools.resetForm({
                                formId:"sendMessage"
                            });
                        }
                    });
                }  
            });
        },
        sendPost:function(data){
            return $.ajax({
                url:"/data/sendMessage.json",
                method:"GET",
                data:data,
                dataType:"json"
            });
        },
        render:function(){
            // 展示数据
            this.showList();
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadMessage(self.page)
            .done(function(result){
                // 拼凑数据
                self.makeData(result);
                // 初始化swiper
                self.initSwiper(result);
            });
        },
        loadMessage:function(page){
            // 加载详细信息
            return  $.ajax({
                url:"../data/getMessageDetail.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:page,
                    typeId:dingeTools.getQueryString("mId")
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            if(result.status == 1 && result.data.length>0){
                $(".swiper-wrapper").html("");
                var html = "";
                var data = result.data;
                data.forEach(function(item){
                    var frome = "";
                    var direction = "left";
                    if(item.from._id == $.cookie("dinge")){
                        frome = "swiper-from";
                        direction = "right";
                    }
                    html += "<div class='swiper-slide'>"
                                +"<div class='swiper-slide-warpper "+frome+"'>"
                                    +"<div class='dialog_carouse'><img src='"+item.from.avatar+"'/></div>"
                                    +"<div data-to='"+item.to._id+"' class='triangle-"+direction+"'></div>"
                                    +"<div class='dialog_content'>"+item.content+"</div>"
                                +"</div>"
                            +"</div>";
                });
                $(".swiper-wrapper").prepend($(html));
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
                    onFirstInit: function(swiper){
                        var swiperHeight = $(".swiper-wrapper").height();
                        var containerHeight = swiper.height;
                        if(swiperHeight > containerHeight){
                            var transition = "-"+(swiperHeight-containerHeight);
                            swiper.setWrapperTranslate(0,transition,0);
                        }
                    },
                    onTouchStart: function() {
                        self.holdPosition = 0;
                    },
                    onResistanceBefore: function(s, pos){
                        self.holdPosition = pos;
                    },
                    onTouchEnd: function(){
                        if (self.holdPosition>100) {
                            // Hold Swiper in required position
                            self.mySwiper.setWrapperTranslate(0,100,0);

                            //Dissalow futher interactions
                            self.mySwiper.params.onlyExternal=true;

                            //Show loader
                            $(".preloader").addClass("visible");

                            //加载新的slide
                            self.loadMessage(self.page)
                            .done(function(result){
                                if(result.status == 1 && result.data.length>0){
                                    var data = result.data;
                                    data.forEach(function(item){
                                        var frome = "",direction = "left";
                                        if(item.from._id == $.cookie("dinge")){
                                            frome = "swiper-from";
                                            direction = "right";
                                        }
                                        self.mySwiper.prependSlide(
                                            "<div class='swiper-slide-warpper "+frome+"'>"
                                                +"<div class='dialog_carouse'><img src='"+item.from.avatar+"'/></div>"
                                                +"<div class='triangle-"+direction+"'></div>"
                                                +"<div class='dialog_content'>"+item.content+"</div>"
                                            +"</div>");
                                    });
                                    //Release interactions and set wrapper
                                    self.mySwiper.setWrapperTranslate(0,0,0);
                                    self.mySwiper.params.onlyExternal=false;

                                    //Update active slide
                                    self.mySwiper.updateActiveSlide(0);

                                    //Hide loader
                                    $(".preloader").removeClass("visible");
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
    new Message();
})($);

    