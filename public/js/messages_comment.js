var $ = window.jQuery;
var dingeTools = window.dingeTools;
$(function(){
    
    
    function MessagesComment(){

    }
    MessagesComment.prototype={
        init:function(){
            dingeTools.init(); 
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
			// 向上返回
            $(".goback").on("tap", function(){
                window.history.back();
            });
        },
        render:function(){
			// 加载底部
            $("#footer").load("../views/footer.html");
        }
    };
    var messagescomment = new MessagesComment();
    messagescomment.init();
});