/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 私信详细列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function Message(){
        this.holdPosition = 0;
        this.page = 0;
        this.mySwiper = "";
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
            $(".goback").on("tap", function(){
                window.history.back();
            });
        },
        sendMessage:function(){
            var self = this;
            $("#sendMessage").submit(function(event){
                var messageInput = $.trim($("#message_input").val());
                var src = $(".triangle-right").parent().find("img").attr("src");
                event.preventDefault();
                if(messageInput){
                    var toId = $(".triangle-left").attr("data-to");
                    $.ajax({
                        url:"../data/sendMessage.json",
                        method:"GET",
                        data:{
                            token:$.cookie("dinge"),
                            to:toId,
                            content:messageInput
                        },
                        dataType:"json"
                    }).done(function(result){
                        if(result.status == 1){
                            self.mySwiper.appendSlide(
                                "<div class='swiper-slide swiper-from'>"
                                    +"<div class='dialog_carouse'><img src='"+src+"'/></div>"
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
        render:function(){
            // 展示数据
            this.showList();
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadMessage(self.page)
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
            });
        },
        loadMessage:function(){
            var self = this;
            // 加载详细信息
            return  $.ajax({
                url:"../data/getMessageDetail.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge"),
                    page:self.page,
                    typeId:dingeTools.getQueryString("mId")
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            if(result.status == 1 && result.data.length>0){
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
    var message = new Message();
    message.init();
});

    