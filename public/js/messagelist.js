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
    // 加载footer资源
    $("#footer").load("../views/footer.html");
    $(".swiper-container").height($(window).height()-202);
    // 获取列表页面，进行渲染
    loadMessageList(page)
    .done(function(result){
        var html = "";
        if(result.status == 1 &&  result.data.length>0) {
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-slide'>"
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
                    +"</div>";
            });
            $(html).appendTo($(".swiper-wrapper"));
        }
    })
    .done(function(result){
        if(result.status == 1 && page == 0){
            // 初始化swiper
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

                        ////加载新的slide
                        loadMessageList(page)
                        .done(function(result){
                            if(result.status == 1 &&  result.data.length>0){
                                var data = result.data;
                                data.forEach(function(item){
                                    mySwiper.prependSlide(
                                        "<div class='message_list_slide'>"
                                            +"<a href='/views/message.html?mId="+item.typeId+"'>"
                                                +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                                                +"<div class='message_list'>"
                                                    +"<div class='message_nickname'>"+item.username+"</div>"
                                                    +"<div class='message_date'>"+dingeTools.format(item.createdAt,"MM-dd")+"</div>"
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
    // 加载私信列表
    function loadMessageList(page){
        return  $.ajax({
            url:"../data/getMessageList.json",
            method:"GET",
            data:{
                token:$.cookie("dinge"),
                page:page
            },
            dataType:"json"
        });
    }
});