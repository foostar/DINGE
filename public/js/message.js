/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 私信详细列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    var holdPosition = 0,
            page = 0,
            mySwiper;
    // 规定swiper容器
    $(".swiper-container").height($(window).height()-202);
    // 加载数据
    loadMessage(page)
    // 拼凑数据
    .done(function(result){
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
    })
    .done(function(result){
        if(result.status == 1 && page == 0){
            // 初始化swiper
            mySwiper = new Swiper(".swiper-container",{
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
                    holdPosition = 0;
                },
                onResistanceBefore: function(s, pos){
                    holdPosition = pos;
                },
                onTouchEnd: function(){
                    if (holdPosition>100) {
                        // Hold Swiper in required position
                        mySwiper.setWrapperTranslate(0,100,0);

                        //Dissalow futher interactions
                        mySwiper.params.onlyExternal=true;

                        //Show loader
                        $(".preloader").addClass("visible");

                        //加载新的slide
                        loadMessage(page)
                        .done(function(result){
                            if(result.status == 1 && result.data.length>0){
                                var data = result.data;
                                data.forEach(function(item){
                                    var frome = "",direction = "left";
                                    if(item.from._id == $.cookie("dinge")){
                                        frome = "swiper-from";
                                        direction = "right";
                                    }
                                    mySwiper.prependSlide(
                                        "<div class='swiper-slide-warpper "+frome+"'>"
                                            +"<div class='dialog_carouse'><img src='"+item.from.avatar+"'/></div>"
                                            +"<div class='triangle-"+direction+"'></div>"
                                            +"<div class='dialog_content'>"+item.content+"</div>"
                                        +"</div>");
                                });
                                //Release interactions and set wrapper
                                mySwiper.setWrapperTranslate(0,0,0);
                                mySwiper.params.onlyExternal=false;

                                //Update active slide
                                mySwiper.updateActiveSlide(0);

                                //Hide loader
                                $(".preloader").removeClass("visible");
                                page++;
                            }
                        });
                    }
                }
            });
            page++;
        }    
    });
    // 发送私信
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
                    mySwiper.appendSlide(
                        "<div class='swiper-slide swiper-from'>"
                            +"<div class='dialog_carouse'><img src='"+src+"'/></div>"
                            +"<div class='triangle-right'></div>"
                            +"<div class='dialog_content'>"+messageInput+"</div>"
                        +"</div>"
                    );
                    var swiperHeight = $(".swiper-wrapper").height();
                    var containerHeight = mySwiper.height;
                    if(swiperHeight > containerHeight){
                        var transition = "-"+(swiperHeight-containerHeight);
                        mySwiper.setWrapperTranslate(0,transition,0);
                    }
                    mySwiper.params.onlyExternal=false;
                    dingeTools.resetForm({
                        formId:"sendMessage"
                    });
                }
            });
        }  
    });
    // 加载详细信息
    function loadMessage(page){
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
    }
});

    