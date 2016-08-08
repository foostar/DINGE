var $ = window.jQuery;
var moment = window.moment;
$(function(){
    // 获取列表页面，进行渲染
    $.ajax({
        url:"../data/getMessageList.json",
        method:"GET",
        data:{
            token:$.cookie("dinge"),
            page:0
        },
        dataType:"json"
    }).done(function(result){
        var html = "";
        if(result.status == 1) {
            var data = result.data;
            data.forEach(function(item){
                html += "<li>"
                        +"<a href='/views/message.html?mId="+item.typeId+"'>"
                            +"<div class='message_carouse'><img src='"+item.avatar+"'/></div>"
                            +"<div class='message_list'>"
                                +"<div class='message_nickname'>"+item.username+"</div>"
                                +"<div class='message_date'>"+moment(item.createdAt).format("MM-DD")+"</div>"
                                +"<div class='message_talk'>"+item.content+"</div>"
                            +"</div>"
                        +"</a>"
                    +"</li>";
            })  
            $(html).appendTo($(".message_list_wrap ul"));
        }
    });
});