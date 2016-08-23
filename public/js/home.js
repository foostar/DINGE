var $ = window.jQuery,
        Swiper = window.Swiper;
$(function(){
    // 加载底部
    $("#footer").load("../views/footer.html");
    /*---------------------home page 轮播图接口------------------------------*/
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
    
    $.ajax({
        url:"../data/getCarousels.json",
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


/*---------------------------------------home page 首页评论 start--------------------------------*/
    $.ajax({
        url:"../data/getCommentsByRight.json",
        type:"GET",
        data:{},
        datatype:"json"
    }).done(function(res){
        //console.log(res.data[0].commentFrom.nickname);
        $(res.data).each(function(i,ele){
            var monent = ele.createdAt;
            var monsubstr=monent.substr(0, 10);
            //获取当前时间，格式YYYY-MM-DD
            function getNowFormatDate() {
                var date = new Date();
                var seperator1 = "-";
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = year + seperator1 + month + seperator1 + strDate;
                //return currentdate;
                if(monsubstr.substr(0,4)==currentdate.substr(0,4) && monsubstr.substr(5,2)==currentdate.substr(5,2)){
                    if(parseInt(monsubstr.substr(8,2))+1==parseInt(currentdate.substr(8,2))){
                        $("#createdAt").text("昨天");
                    }else if(parseInt(monsubstr.substr(8,2))+2==parseInt(currentdate.substr(8,2))){
                        $("#createdAt").text("两天前");
                    }else{
                        $("#createdAt").text(monsubstr);
                    }
                }else{
                    $("#createdAt").text(monsubstr);
                }
            }
            getNowFormatDate();
            $("#nickname").text(ele.commentFrom.nickname);
            $("#nickname").css("backgroundImage","url(.."+ele.commentFrom.avatar+")");
            $("#Title").text(ele.title);
            $("#home_img").attr("src",ele.movie.images.small);
            $("#reading").text(ele.reading);
            $("#Rank").text(ele.rank);
            $("#star").text(ele.star);
        });
    });
});