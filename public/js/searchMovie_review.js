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
            //console.log(data);         
            for(var i=0;i<data.length;i++){
                html += "<div class='review_div'>"
                            +"<div class='review_title font-title'>"+data[ i ].title+"</div>"
                            +"<span class='font-normal'>——《"+data[ i ].movie+"》</span>"
                            +"<p class='font-normal'>"+data[ i ].content+"</p>"
                        +"</div>";
            }
            $(html).appendTo($("#searchMovie_review"));
        }
    });
});