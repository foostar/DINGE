var $ = window.jQuery;
var Swiper = window.Swiper;
var dingeTools = window.dingeTools;
$(function(){
    var holdPosition = 0;
    var page = 0;
    var mySwiper;
    $("#footer").load("../views/footer.html");
    $(".swiper-container").height($(window).height()-202);

    loadFocusList(page)
    .done(function(result){
        var html = "";
        if(result.status == 1) {
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-slide'>"
                            +"<div class='myfocus'>"
                                +"<div class='myfocus-slide'>"
                                    +"<div class='focus_carouse'>"
                                        +"<a href='javascript:;'>"
                                            +"<img src='"+item.avatar+"'>"
                                        +"</a>"
                                    +"</div>"
                                    +"<div class='focus_content'>"
                                        +"<a href='javascript:;'>"
                                            +"<div class='focus_nickname'>"+item.nickname+"</div>"
                                            +"<div class='focus_notice'>"+item.sign+"</div>"
                                        +"</a>"
                                    +"</div>"
                                +"</div>"
                                +"<div class='del_focus' data-id='"+item._id+"'><img src='../images/delete.png'/></div>"
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
                onTouchMove:function(){
                    if($(".myfocus-slide-left")){
                        $(".myfocus-slide-left").removeClass("myfocus-slide-left"); 
                    }
                    if($(".del_focus_visible")){
                        $(".del_focus_visible").removeClass("del_focus_visible"); 
                    }
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
                        loadFocusList(page)
                        .done(function(result){
                            if(result.status == 1){
                                var data = result.data;
                                data.forEach(function(item){
                                    mySwiper.prependSlide(
                                        "<div class='myfocus'>"
                                            +"<div class='myfocus-slide'>"
                                                +"<div class='focus_carouse'>"
                                                    +"<a href='javascript:;'>"
                                                        +"<img src='"+item.avatar+"'>"
                                                    +"</a>"
                                                +"</div>"
                                                +"<div class='focus_content'>"
                                                    +"<a href='javascript:;'>"
                                                        +"<div class='focus_nickname'>"+item.nickname+"</div>"
                                                        +"<div class='focus_notice'>"+item.sign+"</div>"
                                                    +"</a>"
                                                +"</div>"
                                            +"</div>"
                                            +"<div class='del_focus' data-id='"+item._id+"'><img src='../images/delete.png'/></div>"
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


    $(".swiper-wrapper").on("swipeLeft",".swiper-slide", function(event){
        event.preventDefault();
        $(this).find(".myfocus-slide").addClass("myfocus-slide-left");
        $(this).find(".del_focus").addClass("del_focus_visible");
    });
    $(".swiper-container").on("tap", function(){
        if($(".myfocus-slide-left")){
            $(".myfocus-slide-left").removeClass("myfocus-slide-left"); 
        }
        if($(".del_focus_visible")){
            $(".del_focus_visible").removeClass("del_focus_visible"); 
        }
    });
    $(".swiper-container").on("tap",".del_focus",function(event){
        var userId = $(this).attr("data-id");
        $(this).parent().parent().remove();
        $.ajax({
            url:"../data/unfocus.json",
            method:"GET",
            data:{
                token:$.cookie("dinge"),
                page:page,
                userId:userId
            },
            dataType:"json"
        })
        .done(function(result){
            if(result.status == 1 && result.data){
                var item = result.data;
                mySwiper.params.onlyExternal=true;
                mySwiper.appendSlide(
                    "<div class='myfocus'>"
                        +"<div class='myfocus-slide'>"
                            +"<div class='focus_carouse'>"
                                +"<a href='javascript:;'>"
                                    +"<img src='"+item.avatar+"'>"
                                +"</a>"
                            +"</div>"
                            +"<div class='focus_content'>"
                                +"<a href='javascript:;'>"
                                    +"<div class='focus_nickname'>"+item.nickname+"</div>"
                                    +"<div class='focus_notice'>"+item.sign+"</div>"
                                +"</a>"
                            +"</div>"
                        +"</div>"
                        +"<div class='del_focus' data-id='"+item._id+"'><img src='../images/delete.png'/></div>"
                    +"</div>");
                mySwiper.params.onlyExternal=false;
                //Update active slide
                mySwiper.updateActiveSlide(0);
            }   
        });
        event.stopPropagation();
    });
    function loadFocusList(page){
        return  $.ajax({
            url:"../data/getUserFocuslist.json",
            method:"GET",
            data:{
                token:$.cookie("dinge"),
                page:page
            },
            dataType:"json"
        });
    }
});
