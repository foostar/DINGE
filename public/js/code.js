$(() => {
    jQuery('.getLocation').qrcode({
        width:200,
        height:200,
        correctLevel:0,
        text:"http://dinge.v2.yoo.yunpro.cn/admin/api/getLocation"
    });
    jQuery('.setLocation').qrcode({
        width:200,
        height:200,
        correctLevel:0,
        text:"http://dinge.v2.yoo.yunpro.cn/admin/api/geolocation"
    });  
})