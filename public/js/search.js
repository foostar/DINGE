var $ = window.jQuery;

$(function(){
	// 加载底部
    $("#footer").load("../views/footer.html");
    //电影列表的接口
    $.ajax({
        url:"../data/showMovieList.json",
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
               //console.log(item.images.medium);

                html += "<li><img src="+item.images.large+" alt=''><span>"+item.title+"</span></li>";
            });
            $(html).appendTo($(".search_body"));
        }
    });
    /*.done(function(result){
        var html = "";
        if(result.status == 1 && result.data.length>0){
            var data = result.data;
            //console.log(data);
            for(var i=0;i<data.length;i++){
                //console.log(data[ i ].title);
                html += "<li><img src="+data[ i ].images.large+" alt=''><span>"+data[ i ].title+"</span></li>";
            }
            $(html).appendTo($(".search_body"));
        }
    });*/
    //点击搜索跳转搜索Ajax.load
    $("#sousuo").change(function(){
        //$(document).load(searchMovie.html);
        window.location.href = "searchMovie.html";
    });
});