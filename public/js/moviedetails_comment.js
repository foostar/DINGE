var $ = window.jQuery;
var dingeTools = window.dingeTools;
$(function(){
    dingeTools.init(); 
    dingeTools.loadingFooter2();
    $(".goback").on("tap", function(){
        window.history.back();
    });
});