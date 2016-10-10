var $ = window.jQuery,
        Swiper = window.Swiper;
        dingeTools = window.dingeTools;
$(function(){
    dingeTools.init();
    var holdPosition = 0,
            page = 0, 
            mySwiper;
    // 加载底部文件
    $("#footer").load("../views/footer.html");
    // 规定swiper容器
    $(".swiper-container").height($(window).height()-202);
    // 加载数据
    loadFocusList(page)
    // 拼凑数据
    .done(function(result){
        var html = "";
        if(result.status == 1 &&  result.data.length>0) {
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
                                +"<div class='del_focus' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
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
                onTouchMove:function(){
                    if($(".slide-left")){
                        $(".slide-left").removeClass("slide-left"); 
                    }
                    if($(".del_visible")){
                        $(".del_visible").removeClass("del_visible"); 
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

                        //加载新的slide
                        loadFocusList(page)
                        .done(function(result){
                            if(result.status == 1 && result.data.length>0){
                                var data = result.data;
                                data.forEach(function(item){
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
                                            +"<div class='del_focus' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
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
    // 左滑出现删除按钮
    $(".swiper-wrapper").on("swipeLeft",".swiper-slide", function(){
        $(this).find(".myfocus-slide").addClass("slide-left");
        $(this).find(".del_focus").addClass("del_visible");
    });
    // 关闭删除按钮
    $(".swiper-container").on("tap", function(){
        if($(".slide-left")){
            $(".slide-left").removeClass("slide-left"); 
        }
        if($(".del_visible")){
            $(".del_visible").removeClass("del_visible"); 
        }
    });
    // 删除slider
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
                        +"<div class='del_focus' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
                    +"</div>");
                mySwiper.params.onlyExternal=false;
                //Update active slide
                mySwiper.updateActiveSlide(0);
            }   
        });
        event.stopPropagation();
    });
    // 加载我关注的
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
    document.addEventListener("touchmove", function (event) {
        event.preventDefault();
    }, false);
});
