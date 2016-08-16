/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 历史记录
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    // 加载底部
    $("#footer").load("../views/footer.html");
    // 规定swiper容器
    $(".swiper-container").height($(window).height()-202);
    // 加载当前数据
    $.ajax({
        url:"../data/history.json",
        method:"GET",
        data:{
            token:$.cookie("dinge")
        },
        dataType:"json"
    }).done(function(result){
        var html = "";
        if(result.status == 1 && result.data.length>0){ 
            var data = result.data;
            data.forEach(function(item){
                html += "<div class='swiper-wrapper'>"
                            +"<div class='swiper-slide'>"
                                +"<div class='history_box'>"
                                    +"<a href='javascript:;'>"
                                        +"<div class='history_title'>「"+item.title+"」</div>"
                                        +"<div class='history_date'>"+dingeTools.fromNow(item.createdAt)+"</div>"
                                    +"</a>"
                                +"</div>"
                            +"</div>"
                        +"</div>";
            });
            $(html).appendTo($(".swiper-wrapper"));
        }
    })
    .done(function(result){
        if(result.status == 1){
            // 初始化swiper
            new Swiper(".swiper-container",{
                slidesPerView:"auto",
                mode:"vertical",
                watchActiveIndex: true
            });
        }
    });
});