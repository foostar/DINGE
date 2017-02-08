$(() => {
    jQuery('.getLocation').qrcode({
        width:200,
        height:200,
        correctLevel:0,
        text:"http://192.168.1.143:8686/admin/api/getLocation"
    });
    jQuery('.setLocation').qrcode({
        width:200,
        height:200,
        correctLevel:0,
        text:"http://192.168.1.143:8686/admin/api/geolocation"
    });  
})