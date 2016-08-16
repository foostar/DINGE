/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 我收藏的列表
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    var holdPosition = 0,
            page = 0,
            mySwiper;
    // 加载底部文件
    $("#footer").load("../views/footer.html");
    // 规定swiper容器
    $(".swiper-container").height($(window).height()-202);
    // 加载数据
    loadColletList(page)
    // 拼凑数据
    .done(function(result){
        var html = "";
        if(result.status == 1 &&  result.data.length>0) {
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-slide'>"
                            +"<div class='mycollet'>"
                                +"<div class='mycollet-slide'>"
                                    +"<a href='javascript:;'>"
                                        +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
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
                        loadColletList(page)
                        .done(function(result){
                            if(result.status == 1 &&  result.data.length>0){
                                var data = result.data;
                                data.forEach(function(item){
                                    mySwiper.appendSlide(
                                        "<div class='mycollet'>"
                                            +"<div class='mycollet-slide'>"
                                                +"<a href='javascript:;'>"
                                                    +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
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
    // 左滑出现删除按钮
    $(".swiper-wrapper").on("swipeLeft",".swiper-slide", function(){
        $(this).find(".mycollet-slide").addClass("slide-left");
        $(this).find(".del_collet").addClass("del_visible");
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
    $(".swiper-container").on("tap",".del_collet",function(event){
        var userId = $(this).attr("data-id");
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
                                +"<div class='mycollet_author'>"+item.commentFrom.nickname+"<span>"+dingeTools.format(item.createdAt,"yy-MM-dd")+"</span></div>"
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
    // 加载我收藏的
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
