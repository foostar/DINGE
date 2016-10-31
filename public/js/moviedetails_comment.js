var $ = window.jQuery;
var dingeTools = window.dingeTools;
$(function(){
    dingeTools.init(); 
    $(".goback").on("tap", function(){
        window.history.back();
    });
});