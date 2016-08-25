var $ = window.jQuery;

$(function(){
    $.ajax({
        url:"/data/commentsDetail.json",
        method:"GET",
        data:{
            commentId:"577ce7c52fbb740830816fe1"
        },
        dataType:"json"
    })
    .done(function(res){
        //console.log(res.data.content);
        //console.log(res.data);
        var html = "";
        if(res.status == 1){
            var data = res.data;   
            //console.log(data[0].commentFrom);         
            for(var i=0;i<data.length;i++){
                html += "<ul class='movie_user'>"
                            +"<li class='user_img'><a href='javascript:;'><img src="+data[ i ].commentFrom.avatar+" alt=''></a></li>"
                            +"<li class='user_txt'>"+data[ i ].commentFrom.nickname+"</li>"        
                        +"</ul>";
            }
            $(html).appendTo($("#searchMovie_user"));
        }
    });
});