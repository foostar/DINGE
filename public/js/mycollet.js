var $ = window.jQuery;
var Swiper = window.Swiper;
var moment = window.moment;
$(function(){
    var holdPosition = 0;
    var page = 0;
    var mySwiper;
    $("#footer").load("../views/footer.html");
    $(".swiper-container").height($(window).height()-202);

    loadColletList(page)
    .done(function(result){
        var html = "";
        if(result.status == 1) {
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-slide'>"
                            +"<div class='mycollet'>"
                                +"<div class='mycollet-slide'>"
                                    +"<a href='javascript:;'>"
                                        +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+moment(item.createdAt).format("YY-MM-DD")+"</span></div>"
                                        +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                        +"<div class='mycollet_content'>"+item.content+"</div>"
                                    +"</a>"
                                +"</div>"
                                +"<div class='del_collet' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
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

                        //Load slides
                        loadColletList(page)
                        .done(function(result){
                            if(result.status == 1){
                                var data = result.data;
                                data.forEach(function(item){
                                    mySwiper.appendSlide(
                                        "<div class='mycollet'>"
                                            +"<div class='mycollet-slide'>"
                                                +"<a href='javascript:;'>"
                                                    +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+moment(item.createdAt).format("YY-MM-DD")+"</span></div>"
                                                    +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                                    +"<div class='mycollet_content'>"+item.content+"</div>"
                                                +"</a>"
                                            +"</div>"
                                            +"<div class='del_collet' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
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
    $(".swiper-wrapper").on("swipeLeft",".swiper-slide", function(){
        $(this).find(".mycollet-slide").addClass("slide-left");
        $(this).find(".del_collet").addClass("del_visible");
    });
    $(".swiper-container").on("tap", function(){
        if($(".slide-left")){
            $(".slide-left").removeClass("slide-left"); 
        }
        if($(".del_visible")){
            $(".del_visible").removeClass("del_visible"); 
        }
    });
    $(".swiper-container").on("tap",".del_collet",function(event){
        var userId = $(this).attr("data-id");
        console.log(userId)
        $(this).parent().parent().remove();
        $.ajax({
            url:"../data/unCollet.json",
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
                    "<div class='mycollet'>"
                        +"<div class='mycollet-slide'>"
                            +"<a href='javascript:;'>"
                                +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+moment(item.createdAt).format("YY-MM-DD")+"</span></div>"
                                +"<div class='mycollet_title'>「"+item.title+"」</div>"
                                +"<div class='mycollet_content'>"+item.content+"</div>"
                            +"</a>"
                        +"</div>"
                        +"<div class='del_collet' data-id='"+item._id+"'><img class='delete_img' src='../images/delete.png'/></div>"
                    +"</div>");
                mySwiper.params.onlyExternal=false;
                //Update active slide
                mySwiper.updateActiveSlide(0);
            }   
        });
        event.stopPropagation();
    });
    function loadColletList(page){
        return  $.ajax({
            url:"../data/getMyCollet.json",
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
