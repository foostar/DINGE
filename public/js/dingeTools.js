var jQuery = window.jQuery
;(function($){
    if (!Array.prototype.forEach) {  
        Array.prototype.forEach = function(callback, thisArg) {  
            var T, k;  
            if (this == null) {  
                throw new TypeError(" this is null or not defined");  
            }  
            var O = Object(this);  
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32  
            if ({}.toString.call(callback) != "[object Function]") {  
                throw new TypeError(callback + " is not a function");  
            }  
            if (thisArg) {  
                T = thisArg;  
            }  
            k = 0;  
            while (k < len) {  
                var kValue;  
                if (k in O) {  
                    kValue = O[ k ];  
                    callback.call(T, kValue, k, O);  
                }  
                k++;  
            }  
        };  
    } 
    var DingeTools = {
        //重置表单
        resetForm:function(opt){
            var _option = {
                className:"form-group",   //表单group值
                errorClass:"has-error",   //错误信息提示框
                helpClass:"help-block",   //错误信息提示
                countDownClass:"btn-primary", //倒计时变化样式 
                helpInfo:"获取验证码",   //倒计时提示文字
                countDown:"getvalidate"  //倒计时button
            };
            var option = $.extend({},_option,opt);
            if(!option.formId){
                throw new Error("请传入要重置的表单ID");
            }
            $("#"+option.formId+" ."+option.className+"").each(function(index,ele){
                var inputText = $(ele).find($("input[type='text'], input[type='password'], input[type='email'], input[type='number']"));
                var inputRadio = $(ele).find($("input[type='radio']"));
                var inputCheckbox = $(ele).find($("input[type='checkbox']"));
                var select = $(ele).find($("select"));
                var textarea = $(ele).find($("textarea"));
                var counter = $(ele).find($("."+option.countDown+""));
                if(inputText){
                    $(ele,inputText).removeClass("has-error");
                    $(ele).find($("."+option.helpClass+"")).each(function(index,element){
                        $(element).html("");
                    });
                    inputText.val("");
                }
                if(inputRadio){
                    inputRadio.each(function(index,element){
                        element.checked = false;
                        if(index == 0){
                            element.checked = true;
                        }
                    });
                }
                if(textarea){
                    textarea.val("");
                }
                if(inputCheckbox){
                    inputCheckbox.each(function(index,element){
                        element.checked = false;
                        if(index == 0){
                            element.checked = true;
                        }
                    });
                }
                if(select.length>0){
                    select.val(select.find("option")[ 0 ].val());
                }
                if(counter){
                    counter.removeClass(option.countDownClass);
                    counter.attr("disabled",true);
                    counter.html(option.helpInfo);
                }
            });
        },
        getQueryString:function(name){
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null){
                return  unescape(r[ 2 ]);
            } 
            return null;
        }
    };
    var tools = $.extend({}, DingeTools);
    function objCreat(proto){
        function Create(){}
        Create.prototype = proto;
        return new Create();
    }
    window.dingeTools = objCreat(tools);
})(jQuery);