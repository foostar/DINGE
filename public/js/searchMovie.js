var $ = window.jQuery;
var dingeTools = window.dingeTools;

$(function(){
    /*
    searchMovie page tab 切换
    */
    function SearchMovie(){
        this.init();
    }
    SearchMovie.prototype ={
        init:function(){
            dingeTools.init();
            this.render();
            this.bindEvent();
        },
        render:function(){
            this.movieModule();
            this.reviewModule();
            this.userModule(); 
        },
        bindEvent:function(){
            this.cancel();
            this.tab();
        },
        movieModule:function(){
            //电影模块
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
        },
        reviewModule:function(){
            //影评模块
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
        },
        userModule:function(){
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
        },
        tab:function(){
            //选项卡点击事件
            $("#tag li").click(function(){
                $("#tag li").eq($(this).index()).addClass("current").siblings().removeClass("current");
                $(".tagClass").hide().eq($(this).index()).show();
            });
        },
        cancel:function(){
            //点击取消触发事件
            $("#search_cancel").click(function(){
                window.location.href="search.html";
            });
        }
    };
    new SearchMovie();
    

});