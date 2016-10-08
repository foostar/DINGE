var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    /*$.ajax({
        url:"../data/getCarousels.json",
        method:"GET",
        data:{
            token:""
        },
        dataType:"json"     
    }).done(function(result){
        var oul = $("#slide_ul"),
                childNodes = oul[ 0 ].childNodes,
                temp = "",
                arr = [];
        //console.log(childNodes);
        for(var i=0,len=childNodes.length;i<len;i++){
            var element = childNodes[ i ];
            //console.log(element);
            if(element.nodeType == 8){
                temp = element.nodeValue;
                break;              
            }
        }


        $(result.data).each(function(i,ele){
            var _url = ele.url;
            //console.log(temp);
            arr.push(temp.replace(/\%s/,_url).replace(/\%t/,_url));//console.log(arr);
        });
        oul.html(arr.join(""));

        var mySwiper = new Swiper(".swiper-container",{  
            direction:"horizontal",//横向滑动  
            loop:true,//形成环路（即：可以从最后一张图跳转到第一张图 
            pagination:".swiper-pagination",//分页器  
            prevButton:".swiper-button-prev",//前进按钮 
            nextButton:".swiper-button-next",//后退按钮 
            autoplay:3000//每隔3秒自动播放

        });
    });*/

    function Home(){
        this.init();
    }
    Home.prototype = {
        init:function(){
            dingeTools.init();
            // loading
            //$(".loading").hide();
            //this.bindEvent();
            this.render();

        },
        //渲染页面
        render:function(){
            var self = this;
            self.loadingFooter();
            self.loadingImg();
            $.when(self.loadingBanner(),self.loadingComent())
            .then(function(){
                $("#loading").hide();   
            });
        },
        loadingFooter:function(){
            // 加载底部  
            $("#footer").load("../views/footer.html");
        },
        loadingImg:function(){
            $("#loading").show();
        },
        loadingBanner:function(){
            //轮播图部分
            var dtd = $.Deferred();
            $.ajax({
                url:"../data/getCarousels.json",
                method:"GET",
                dataType:"json"
            }).done(function(result){
                var html = "";
                if(result.status == 1 && result.data.length>0){ 
                    var data = result.data;
                    data.forEach(function(item){
                       //console.log(item.url);

                        html += "<div class='swiper-slide'><a class='pic' href='javascript://'><img src="+item.url+" alt=''/></a></div>";
                    });
                    $(html).appendTo($(".swiper-wrapper"));
                }
            }).done(function(result){
                if(result.status == 1){
                    new Swiper(".swiper-container",{  
                        direction:"horizontal",//横向滑动  
                        loop:true,//形成环路（即：可以从最后一张图跳转到第一张图 
                        pagination:".swiper-pagination",//分页器  
                        prevButton:".swiper-button-prev",//前进按钮 
                        nextButton:".swiper-button-next",//后退按钮 
                        autoplay:3000//每隔3秒自动播放

                    });
                }
            });
            dtd.resolve();
        },
        loadingComent:function(){
            var dtd = $.Deferred();
            $.ajax({
                url:"../data/getCommentsByRight.json",
                type:"GET",
                data:{},
                datatype:"json"
            }).done(function(res){
                var data = res.data;
                var html = "";
                //console.log(data);
                data.forEach(function(item,index){                   
                    html += "<div class='home_comment_block flex-container";
                    if(index%2){
                        html+=" home_comment_right";
                    }
                    html +=  "'>"
                                +"<img class='home_comment_img flex-normal' src='"+item.movie.images.small+"' alt=''>"
                                +"<div class='home_comment flex-normal'>"
                                    +"<div class='home_comment_author font-normal'>"
                                        +"<em>"+dingeTools.fromNow(item.createdAt)+"</em>"
                                        +"<a href='other_means.html'><span style='background-image:url(../.."+item.commentFrom.avatar+");'>"+item.commentFrom.nickname+"</span></a>"
                                    +"</div>"
                                    +"<div class='home_comment_title'>"+item.content+"</div>"
                                    +"<div class='flex-container home_comment_meta font-normal'>"
                                        +"<div class='flex-normal'>阅读<span>"+item.reading+"</span></div>"
                                        +"<div class='flex-normal'>评论<span>"+item.rank+"</span></div>"
                                        +"<div class='flex-normal'>喜欢<span>"+item.weight+"</span></div>"
                                    +"</div>"
                                +"</div>"
                            +"</div>";
                });
                $(html).appendTo($("#loadingComent"));       
            });
            dtd.resolve();
        }
    };
    new Home();
   // home.init();
});