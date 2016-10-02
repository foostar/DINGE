var $ = window.jQuery;
$(function(){
	function register(opt){
        this.init();
        this.id = opt.id;
    }
    register.prototype = {
    	var me = this,
    	var s  = $('#alertS'),
    	init: function(){
	    	$('#userName').blur(function(){	    		
	    		if (this.val()=='') {
	    			me.s.css('display','block');
	    			me.s.html('昵称不能为空!');
	    		}else{
	    			m.s.css('display','none');
	    			m.s.html('');
	    		}
	    	});
	    	$('#email').blur(function(){
    			me.isEmail(this.val());
    		});
    		$('#password').blur(function(){
    			me.isPassWord(this.val());
    		});
    		$("#submit").click(function(){
    			this.submitData($('#userName'),$("#email"),$("#password"));
    		})
    		.done(function(data){
    			console.log(data);
    		});
    	},
    	isEmail:function(obj){
       		var reg=/^\w{3,}@\w+(\.\w+)+$/;   
		    if(!reg.test(obj)){   
		    	me.s.css('display','block');     
		        me.s.html("<b>请输入正确的邮箱地址</b>");   
		    }else{  
		    	me.s.css('display','none'); 
		        me.s.html("");   
		    }   
    	},
    	isPassWord:function(obj){
    		var reg1=/^[a-zA-Z]{6,8}$/;
    		var reg2=/^[a-z0-9]{6,8}$/;
    		var reg3=/^[A-Z0-9]{6,8}$/;
    		if(reg1.test(obj)){
    			me.s.css('display','block');     
		        me.s.html("<b>密码至少包含一位数字</b>");
    		}else if(reg2.test(obj)){
    			me.s.css('display','block');     
		        s.html("<b>密码至少包含一位大写字符</b>");
    		}else if(reg3.test(obj)){
    			me.s.css('display','block');     
		        me.s.html("<b>密码至少包含一位小写字符</b>");
    		}else if(obj.length<6){
    			me.s.css('display','block');     
		        me.s.html("<b>密码必须大于6位字符</b>");
    		}else if(obj.length>8){
    			me.s.css('display','block');     
		        me.s.html("<b>密码必须小于8位字符</b>");
		    }else{
    			me.s.css('display','none'); 
		        me.s.html(""); 
    		}
    	},
    	submitData:function(a,b,c){
    		var dtd  = $.Deffer();
    		$.ajax({
	            type:"get",
	            url:"../data/signup.json",
	            data:{
	            	userName:a.val(),
	                email   :b.val(),
	                password:c.val()
	            },
	            datatype:"json"
	        });
	        dtd.resolve();
	        return dtd;
    	}
    }
    new register({});
});