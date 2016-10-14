/**
 * Created by xiusiteng on 2016-08-12.
 * @desc 历史记录
 */
var $ = window.jQuery,
        Swiper = window.Swiper,
        dingeTools = window.dingeTools;
$(function(){
    function History(){

    }
    History.prototype = {
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
            var self = this;
            // 加载底部文件
            self.loadingFooter()
            .then(function(result){
                if(result.status == 1){
                    // 展示数据
                    self.showList();
                }
            });
        },
        loadingFooter:function(){
            var dtd = $.Deferred();
            $("#footer").load("../views/footer.html",function(){
                dtd.resolve({status:1});
            });
            return dtd;
        },
        showList:function(){
            var self = this;
            // 加载数据
            self.loadHistoryList()
            // 拼凑数据
            .done(function(result){
                self.makeData(result);
            })
            // 初始化swiper
            .done(function(result){
                self.initSwiper(result);
            });
        },
        loadHistoryList:function(){
            return $.ajax({
                url:"../data/history.json",
                method:"GET",
                data:{
                    token:$.cookie("dinge")
                },
                dataType:"json"
            });
        },
        makeData:function(result){
            var html = "";
            if(result.status == 1 && result.data.length>0){ 
                var data = result.data;
                data.forEach(function(item){
                    html += "<div class='swiper-wrapper'>"
                                +"<div class='swiper-slide'>"
                                    +"<div class='info_large'>"
                                        +"<a href='javascript:;'>"
                                            +"<div class='history_title'>「"+item.title+"」</div>"
                                            +"<div class='history_date font-normal'>"+dingeTools.fromNow(item.createdAt)+"</div>"
                                        +"</a>"
                                    +"</div>"
                                +"</div>"
                            +"</div>";
                });
                $(html).appendTo($(".swiper-wrapper"));
            }
        },
        initSwiper:function(result){
            if(result.status == 1){
                // 初始化swiper
                new Swiper(".swiper-container",{
                    slidesPerView:"auto",
                    mode:"vertical",
                    watchActiveIndex: true
                });
            } 
        }
    };
    var history = new History();
    history.init();
});