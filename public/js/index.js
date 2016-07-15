/**
 * Created by Administrator on 2016-06-01. 
 */
$(function(){
    $("#submitComment").click(function(){
        $.ajax({
            type:"post",
            url:'/Api/commentMovie',
            data:{
                title:$("#title").val(),
                content:$("#content").val(),
                movie:"575ce9607d5db6a81924e106"
            },
            datatype:'json'
        }).success(function(data){
            console.log(data)
        })
    });
    $("#submit").click(function(){
        $.ajax({
            type:"post",
            url:'/Api/signin',
            data:{
                email:$("#email").val(),
                password:$("#password").val()
            },
            datatype:'json'
        }).success(function(data){
            console.log(data)
        })
    })
})


$("footer .xx_bg").click(function(){
    window.location.href="http://localhost:3008/views/message.html"; 
});

$("footer .sy_bg").click(function(){
    window.location.href="http://localhost:3008/views/home.html"; 
});

$("footer .wd_bg").click(function(){
    window.location.href="http://localhost:3008/views/user.html"; 
});

$("footer .fx_bg").click(function(){
    window.location.href="http://localhost:3008/views/search.html"; 
});



/*---------------------home page 轮播图接口------------------------------*/
$.ajax({
    url:'../data/getCarousels.json',
    type:'GET',
    data:'',
    datatype:'json',
    error:function(){
        console.log("ERROR");
    },
    success: function(res){
        //console.log(res.data[0].url);
        //console.log(res);
        //console.log(res.data);
    var oul = $("#slide_ul"),
        childNodes = oul[0].childNodes,
        temp = '',
        arr = [];
    for(var i=0,len=childNodes.length;i<len;i++){
    var element = childNodes[i];
    if(element.nodeType == 8){
        temp = element.nodeValue;
        break;
    }
    }

    $(res.data).each(function(i,ele){
        var _url = ele.url;
        //console.log(ele);
        /*if(typeof _url === 'object'){
            _url = 'javascript://';
        }*/
       // arr.push(temp.replace(/\%s/,_url).replace(/\%t/,ele.data[i].name));
       arr.push(temp.replace(/\%s/,_url).replace(/\%t/,_url));
    });
    oul.html(arr.join(''));

    /*$(res.data).each(function(i,ele){
        console.log(res.data[i]);
    });*/
    setTimeout(function(){
        TouchSlide({ 
          slideCell:"#slideBox",
          titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
          mainCell:".bd ul", 
          effect:"leftLoop", 
          autoPage:true,//自动分页
          autoPlay:true //自动播放
        });
    },100);

    }
})

/*---------------------------------------home page 首页评论 start--------------------------------*/
$.ajax({
    url:'../data/getCommentsByRight.json',
    type:'GET',
    data:'',
    datatype:'json',
    error:function(){
        console.log('ERROR');
    },
    success:function(res){
        console.log(res.data);
        //console.log(res.data[0].commentFrom.nickname);
        $(res.data).each(function(i,ele){
            console.log(ele.commentFrom.avatar);
            $("#nickname").text(ele.commentFrom.nickname);
            $("#nickname").css("backgroundImage","url(.."+ele.commentFrom.avatar+")");
            //$("#nickname").style.backgroundImage="url("+ele.commentFrom.avatar+")";
            $("#content").text(ele.content);
        });
    }
})


























