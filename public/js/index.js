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
function returnDays(x,y){
    return y-x;
}

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
            var _monent = ele.createdAt;
                _monsubstr=_monent.substr(0, 10);
            console.log(_monsubstr);
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
                    if(_monsubstr.substr(0,4)==currentdate.substr(0,4) && _monsubstr.substr(5,2)==currentdate.substr(5,2)){
                        if(parseInt(_monsubstr.substr(8,2))+1==parseInt(currentdate.substr(8,2))){
                            $("#createdAt").text("昨天");
                        }else if(parseInt(_monsubstr.substr(8,2))+2==parseInt(currentdate.substr(8,2))){
                            $("#createdAt").text("两天前");
                        }else{
                            $("#createdAt").text(_monsubstr);
                        }
                    }else{
                        $("#createdAt").text(_monsubstr);
                    }
                }
                getNowFormatDate();








            $("#nickname").text(ele.commentFrom.nickname);
            $("#nickname").css("backgroundImage","url(.."+ele.commentFrom.avatar+")");
            $("#Title").text(ele.title);
            //$("#createdAt").text(date);
            //console.log(new Date((_monent._d-moment()._d)).getDay())
            //console.log(_monent.add(1,'days').format('YYYY-MM-DD'),_monent.add(1,'days').format('YYYY-MM-DD'),moment().format('YYYY-MM-DD'))
            //console.log(moment().format('YYYYMMDD'))
            /*var _add = moment().format('YYYY.MM.DD')-_monent.add(1,'days').format('YYYYMMDD');
            console.log(_add)
            if(_obj[_add]){
                console.log(_obj[_add])
            }*/
            /*if(_monent.add(1,'days').format('YYYY-MM-DD')==moment().format('YYYY-MM-DD')){
                $("#createdAt").text("昨天");
            }else if(_monent.add(1,'days').format('YYYY-MM-DD')==moment().format('YYYY-MM-DD')){
                $("#createdAt").text("两天前");
            }else{
                $("#createdAt").text(date);
            }*/
            //console.log(moment().format('YYYY-MM-DD'));
            $("#home_img").attr('src',ele.movie.images.small);
            $("#reading").text(ele.reading);
            $("#Rank").text(ele.rank);
            $("#star").text(ele.star);

        });
    }
})


























