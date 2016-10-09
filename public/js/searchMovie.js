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
            $("#tag_movie").addClass("current");
            $("#tagContent").load("searchMovie_movie.html");
        },
        bindEvent:function(){
            $("#tag li#tag_movie").click(function(){
                $(this).addClass("current").siblings().removeClass("current");
                $("#tagContent").load("searchMovie_movie.html");
            });
            $("#tag li#tag_review").click(function(){
                $(this).addClass("current").siblings().removeClass("current");
                $("#tagContent").load("searchMovie_review.html");
            });
            $("#tag li#tag_user").click(function(){
                $(this).addClass("current").siblings().removeClass("current");
                $("#tagContent").load("searchMovie_user.html");
            });
            $("#search_cancel").click(function(){
                window.location.href="search.html";
            });
        }
    };
    new SearchMovie();
});