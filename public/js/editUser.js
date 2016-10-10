/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 编辑用户资料
 */
var $ = window.jQuery,
        dingeTools = window.dingeTools,
        provsData = window.provsData,
        citysData = window.citysData,
        distsData = window.distsData;
$(function(){
    function EditUser(opt){
        this.ele = $("#"+opt.id);
    }
    EditUser.prototype = {
        init:function(){
            dingeTools.init();
            this.bindEvent();
            this.render();
        },
        bindEvent:function(){
            var self = this;
            // 提交用户资料
            $(".goback").on("click", function(event){
                event.preventDefault();
                if($("#sign").val().length > 30){
                    return alert("签名不能大于30个字符！");
                }
                // 拼凑数据
                var data = {};
                data.avatar = $(".edit_carouse img").attr("src");
                data.nickname = $(".edit_content_username input").val();
                data.sign = $("#sign").val();
                data.sex = $(".edit_content_sex").html();
                data.city = $("#city").val();
                data.birthday = $("#birthday").val();
                // 修改数据
                self.editUserInfo(data);
            });
            // 性别选择弹出层
            self.ele.on("click",".edit_content_sex", function(){
                $(".edit_mask").show();
                setTimeout(function(){
                    $(".edit_mask").addClass("edit_mask_in");
                },0);
            });
            // 选择性别
            $(".edit_modal a").on("tap", function(){
                $(".edit_content_sex").html($(this).html());
                $(".edit_mask").addClass("edit_mask_out");
                setTimeout(function(){
                    $(".edit_mask").removeClass("edit_mask_out edit_mask_in");
                    $(".edit_mask").hide();
                },100);
            });
            // 上传图片
            new dingeTools.LUploader(document.getElementById("carouse"), {
                url: "/carouse/api/addCarouse",//post请求地址
                multiple: false,//是否一次上传多个文件 默认false
                maxsize: 102400,//忽略压缩操作的文件体积上限 默认100kb
                accept: "image/*",//可上传的图片类型
                quality: 0.1,//压缩比 默认0.1  范围0.1-1.0 越小压缩率越大
                showsize:false//是否显示原始文件大小 默认false
            });
        },
        editUserInfo:function(data){
            $.ajax({
                url:"../data/editUserInfo.json",
                method:"GET",
                data:{
                    data:data
                },
                dataType:"json"
            }).done(function(result){
                if(result.status == 1){
                    window.history.back();
                }
            });
        },
        render:function(){
            var self = this;
            // 加载底部文件
            self.loadingFooter()
            .then(function(result){
                if(result.status == 1){
                    // 展示数据
                    self.showUserData();
                }
            });
        },
        loadingFooter:function(){
            var dtd = $.Deferred();
            $("#footer").load("../views/footer.html",function(){
                $(".swiper-container").height($(window).height()-($(".mes_title").height()+$(".footer").height()));
                dtd.resolve({status:1});
            });
            return dtd;
        },
        showUserData:function(){
            var self = this;
            // 加载数据
            self.loadUserData()
            // 展示数据
            .done(function(result){
                self.makeData(result);
            });
        },
        loadUserData:function(){
            return $.ajax({
                url:"../data/getUserInfo.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge")
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            if(result.status == 1){
                // 给当前页面赋值
                var data = result.data;
                $(".edit_carouse").attr("data-src",data.avatar);
                $(".edit_carouse img").attr("src",data.avatar);
                $(".edit_content_username input").val(data.nickname);
                $("#sign").val(data.sign);
                $(".word_count span").html(data.sign.length);
                $(".edit_content_sex").html(data.sex);
                $("#city").val(data.city);
                $("#birthday").val(data.birthday);
                $("#carouse").attr("data-user-id",$.cookie("dinge"));
                var sign = document.getElementById("sign");
                // 创建日历插件
                var calendar = new dingeTools.LCalendar();
                calendar.init({
                    "trigger": "#birthday", //标签id
                    "type": "date", //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择,
                    "minDate": "1900-1-1", //最小日期
                    "maxDate": new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() //最大日期
                });
                // 创建地区插件
                var area1 = new dingeTools.LArea();
                area1.init({
                    "trigger": "#city", //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
                    "valueTo": "#city_value", //选择完毕后id属性输出到该位置
                    "keys": {
                        id: "value",
                        name: "text"
                    }, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
                    "type": 2, //数据源类型
                    "data": [ provsData, citysData, distsData ] //数据源
                });
                // 计算输入字符
                sign.oninput = function(){
                    $(".word_count span").html(sign.value.length);
                };
            }
        }
    };
    var edituser = new EditUser({id:"edituser"});
    edituser.init();
});