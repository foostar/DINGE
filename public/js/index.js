/**
 * Created by Administrator on 2016-06-01. 
 */
/*
 * @desc 上线时，删掉不必要的声明
 */
var $ = window.jQuery;
var TouchSlide = window.TouchSlide;
$(function(){
    $("#submitComment").click(function(){
        $.ajax({
            type:"post",
            url:"/Api/commentMovie",
            data:{
                title:$("#title").val(),
                content:$("#content").val(),
                movie:"575ce9607d5db6a81924e106"
            },
            datatype:"json'"
        }).success(function(data){
            console.log(data);
        });
    });
    $("#submit").click(function(){
        $.ajax({
            type:"post",
            url:"/Api/signin",
            data:{
                email:$("#email").val(),
                password:$("#password").val()
            },
            datatype:"json"
        }).success(function(data){
            console.log(data);
        });
    });


   /* var host = "http://localhost:3008";
    $("footer .xx_bg").click(function(){
       
        window.location.href = host+"/views/message.html";

    });

    $("footer .sy_bg").click(function(){
        // console.log($(this).attr("class"));
        window.location.href = host+"/views/home.html"; 
    });

    $("footer .wd_bg").click(function(){
        window.location.href = host+"/views/user.html"; 
    });

    $("footer .fx_bg").click(function(){
        window.location.href=host+"/views/search.html"; 
    });*/

    // 加载footer资源
    $("#footer").load("../views/footer.html");
    $("#footer").click(function(e){
        var target = e.target;
        if(target.nodeName === "LI"){            
               /* var oul = $(this);
                var current_ele = oul.find("li.on");   
                //console.log(current_ele.attr("status_off"));     
                current_ele.attr("class",current_ele.attr("status_off"));*/
                
            /*for(var i=0;i<target.length;i++){

            }*/
            $(this).attr("class","status_on");
        }
    });



/*---------------------------------------home page 首页评论 start--------------------------------*/
    $.ajax({
        url:"../data/getCommentsByRight.json",
        type:"GET",
        data:{},
        datatype:"json",
        success:function(res){
            console.log(res.data);
            //console.log(res.data[0].commentFrom.nickname);
            $(res.data).each(function(i,ele){
                var monent = ele.createdAt;
                var monsubstr=monent.substr(0, 10);
                console.log(monsubstr);
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
        }
    });

/*---------------------------------------searchMovie page tab 切换------------------------------*/
    $("#tag_movie").addClass("current");
    $("#tagContent").load("searchMovie_movie.html");
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
});



























