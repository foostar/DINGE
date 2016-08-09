var $ = window.jQuery;
var moment = window.moment;
var Swiper = window.Swiper;
$(function(){
    var holdPosition = 0;
    var page = 0;
    var mySwiper;
    // 加载footer资源
    $("#footer").load("../views/footer.html");
    $(".swiper-container").height($(window).height()-202);
    // 获取列表页面，进行渲染
    loadMessageList(page)
    .done(function(result){
        var html = "";
        if(result.status == 1) {
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-slide'>"
                        +"<div class='message_list_slide'>"
                            +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                +"<div class='message_list'>"
                                    +"<div class='message_nickname'>"+item.username+"</div>"
                                    +"<div class='message_date'>"+moment(item.createdAt).format("MM-DD")+"</div>"
                                    +"<div class='message_talk'>"+item.content+"</div>"
                                +"</div>"
                            +"</a>"
                        +"</div>"
                    +"</div>";
            });
            $(html).appendTo($(".swiper-wrapper"));
        }
    })
    .done(function(result){
        if(result.status == 1 && page == 0){
            mySwiper = new Swiper(".swiper-container",{
                slidesPerView:"auto",
                mode:"vertical",
                watchActiveIndex: true,
                onTouchStart: function() {
                    holdPosition = 0;
                },
                onResistanceAfter: function(s, pos){
                    holdPosition = pos;
                },
                onTouchEnd: function(){
                    if (holdPosition>100) {
                        var swiperHeight = $(".swiper-wrapper").height();
                        var containerHeight = mySwiper.height;
                        if(swiperHeight > containerHeight){
                            var transition = "-"+(swiperHeight-containerHeight+100);
                            mySwiper.setWrapperTranslate(0,transition,0);
                        }
                        // Hold Swiper in required position
                        //mySwiper.setWrapperTranslate(0,100,0);

                        //Dissalow futher interactions
                        mySwiper.params.onlyExternal=true;

                        //Show loader
                        $(".preloader").addClass("visible_bottom");

                        //Load slides
                        loadMessageList(page)
                        .done(function(result){
                            if(result.status == 1){
                                var data = result.data;
                                data.forEach(function(item){
                                    mySwiper.prependSlide(
                                        "<div class='message_list_slide'>"
                                            +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                                +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                                +"<div class='message_list'>"
                                                    +"<div class='message_nickname'>"+item.username+"</div>"
                                                    +"<div class='message_date'>"+moment(item.createdAt).format("MM-DD")+"</div>"
                                                    +"<div class='message_talk'>"+item.content+"</div>"
                                                +"</div>"
                                            +"</a>"
                                        +"</div>");
                                });
                                mySwiper.params.onlyExternal=false;
                                //Update active slide
                                mySwiper.updateActiveSlide(0);
                                //Hide loader
                                $(".preloader").removeClass("visible_bottom");
                                page++;
                            }
                        });
                    }
                }
            });
            page++;
        }    
    });
    function loadMessageList(page){
        return  $.ajax({
            url:"../data/getMessageList.json",
            method:"GET",
            data:{
                token:$.cookie("dinge"),
                page:page
            },
            dataType:"json"
        })
    }
});