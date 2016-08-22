var $ = window.jQuery;

$(function(){
    // 加载底部
    $("#footer").load("../views/footer.html");
    /*--------------------------------他人资料-更多-举报用户--------------*/
    $("#more_h3_user").click(function(){
        $("#more_h3_dis").toggle();
    });
    $("#more_h3_blacklist").click(function(){
        $("#mask").show();
        $("#pop").show();
    });
    $("#mask").click(function(){
        $(this).hide();
        $("#pop").hide();
    });
});