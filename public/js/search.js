var $ = window.jQuery;
var dingeTools = window.dingeTools;
$(function(){
    function Search(){ 
        this.init();
    }
    Search.prototype={
        init:function(){
            dingeTools.init();
            this.render();
        },
        loadingFooter:function(){
            // 加载底部  
            $("#footer").load("../views/footer.html");
        },
        loadingImg:function(){
            $(".loading").show();
        },
        movieList:function(){
            //电影列表的接口
            var dtd = $.Deferred();
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

                        html += "<li><img src="+item.images.large+" alt=''><span class='font-h'>"+item.title+"</span></li>";
                    });
                    $(html).appendTo($(".search_body"));
                }
            });
            dtd.resolve();
        },
        changeHref:function(){
            //点击搜索跳转搜索Ajax.load
            $("#sousuo").change(function(){
                //$(document).load(searchMovie.html);
                window.location.href = "searchMovie.html";
            });
        },
        //渲染页面
        render:function(){
            var self = this;
            this.loadingFooter();
            this.loadingImg();
            self.changeHref();
            this.movieList()
            .then(function(){
                $(".loading").hide();   
            });
        }
    };
    new Search();
});