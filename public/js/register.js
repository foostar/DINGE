var $ = window.jQuery,
        dingeTools = window.dingeTools;
(function($){
    function register(){
        this.init();
        this.errMsg = [];
    }
    register.prototype = {
        init: function(){
            dingeTools.init();
            this.bindEvent();
        },
        bindEvent: function () {
            var self = this;
            $(".login_btn").on("click", function(){
                self.errMsg.splice(0,self.errMsg.length);
                var type = $(this).attr("data-type");
                self.formatData(type);
                if(self.errMsg.length > 0){
                    return console.log(self.errMsg[ 0 ],self.errMsg);
                }
                self.submitData(type)
                .done(function(result){
                    if(result.status == 1){
                        console.log(type+"成功！");
                        $.cookie("dinge", result.data.token);
                        window.location.href = "/views/home.html";
                    } else {
                        console.log(result.msg);
                    }
                });
            });
        },
        formatData: function(type) {
            if(type == "login"){
                return this.formatLogin();
            }
            this.formatRegister();
        },
        formatLogin: function(){
            var accountResult = dingeTools.checkAccount($("#email").val());
            var passwordResult = dingeTools.checkPassword($("#password").val());
            if(accountResult) this.errMsg.push(accountResult);
            if(passwordResult) this.errMsg.push(passwordResult);
        },
        formatRegister: function () {
            var usernameResult = dingeTools.checkUsername($("#userName").val());
            var emailResult = dingeTools.checkEmail($("#email").val());
            var passwordResult = dingeTools.checkPassword($("#password").val());
            if(usernameResult) this.errMsg.push(usernameResult);
            if(emailResult) this.errMsg.push(emailResult);
            if(passwordResult) this.errMsg.push(passwordResult);
        },
        submitData:function(type){
            if(type == "login"){
                return this.submitLogin();
            }
            return this.submitRegister();
        },
        submitLogin: function(){
            return $.ajax({
                type:"get",
                url:"../data/signin.json",
                data:{
                    account:$("#email").val(),
                    password:$("#password").val()
                },
                datatype:"json"
            });
        },
        submitRegister: function(){
            return $.ajax({
                type:"get",
                url:"../data/signup.json",
                data:{
                    userName:$("#userName").val(),
                    email   :$("#email").val(),
                    password:$("#password").val()
                },
                datatype:"json"
            });
        }
    };
    new register();
})($);