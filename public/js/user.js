var $ = window.jQuery;
$(function(){
    // 加载底部
    $("#footer").load("../views/footer.html");
    // 加载当前数据
    $.ajax({
        url:"../data/getUserInfo.json",
        method:"GET",
        data:{
            token:$.cookie("dinge")
        },
        dataType:"json"
    }).done(function(result){
        if(result.status == 1){
            // 给当前页面赋值
            var data = result.data;
            $(".user_carouse img").attr("src", data.avatar);
            $(".user_nickname").html(data.nickname);
            $(".notice").html(data.sign);
        }
    });
});