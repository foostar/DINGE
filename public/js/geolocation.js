$(function(){
    var time = $("#time").val()
    // setInterval(() => {
    //     navigator.geolocation.getCurrentPosition(translatePoint); //定位 
    // }, time) 
    // $.ajax({
    //     url: "http://192.168.1.143:8686/admin/api/saveLocation",
    //     data: {
    //         x: 12,
    //         y: 14
    //     },
    //     method: 'GET'
    // })
    navigator.geolocation.getCurrentPosition((position) => {
        var currentLat = position.coords.latitude; 
        var currentLon = position.coords.longitude;
        alert(1)
        $.ajax({
            url: "http://192.168.1.143:8686/admin/api/saveLocation",
            data: {
                y: currentLat,
                x: currentLon
            },
            method: 'GET'
        })
    }); //定位 
    // function translatePoint(){ 
        
    // // var gpsPoint = new BMap.Point(currentLon, currentLat); 
    // // BMap.Convertor.translate(gpsPoint, 0, initMap); //转换坐标 
    // } 
    
}); 

function initMap(point){ 
//初始化地图 
map = new BMap.Map("allmap"); 
map.addControl(new BMap.NavigationControl()); 
map.addControl(new BMap.ScaleControl()); 
map.addControl(new BMap.OverviewMapControl()); 
map.centerAndZoom(point, 15); 
map.addOverlay(new BMap.Marker(point)) 
}  
