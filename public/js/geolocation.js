$(function() {
    var time = $("#time").val()
    setInterval(function(){
        navigator.geolocation.getCurrentPosition(function(position) {
            var currentLat = position.coords.latitude;
            var currentLon = position.coords.longitude;
            $.ajax({
                url: "http://dinge.v2.yoo.yunpro.cn/admin/api/saveLocation",
                data: {
                    y: currentLat,
                    x: currentLon
                },
                method: 'GET'
            })
        });
    }, time)
    //alert(1)
    // navigator.geolocation.getCurrentPosition(function(position) {
    //     var currentLat = position.coords.latitude;
    //     var currentLon = position.coords.longitude;
    //     $.ajax({
    //         url: "http://192.168.0.102:8686/admin/api/saveLocation",
    //         data: {
    //             y: currentLat,
    //             x: currentLon
    //         },
    //         method: 'GET'
    //     })
    // });
});
