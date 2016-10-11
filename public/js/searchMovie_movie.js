var $ = window.jQuery;

$(function(){
    $.ajax({
        url:"/data/movieFindOne.json",
        method:"GET",
        data:{
            movieId:"12345"
        },
        dataType:"json"
    })
    .done(function(res){
        //console.log(res);
        var html = "";
        if(res.status == 1){
            var data = res.data;   
            //console.log(data);         
            for(var i=0;i<data.length;i++){
                var monent = data[ i ].releasetime;
                var monsubstr=monent.substr(0, 10);    
                html += "<ul>"
                            +"<li class='search_tag1img'><img src="+data[ i ].images.large+" alt=''></li>"
                            +"<li class='search_tag1txt'>"
                                +"<div class='tag1_title font-title'>"+data[ i ].title+"</div>"
                                +"<div class='tag1_midtxt'><span class='font-normal'>"+monsubstr+"</span><em class='font-normal'>"+data[ i ].directors[ i ].name+"</em></div>"
                                +"<div class='tag1_bnttxt font-normal'><span class='font-title'>"+data[ i ].rating.average+"</span>评分</div>"
                            +"</li>"
                        +"</ul>";
            }
            $(html).appendTo($("#searchMovie_movie"));
        }
    });
});