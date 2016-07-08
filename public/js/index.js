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