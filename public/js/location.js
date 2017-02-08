$(() => {
    $.ajax({
        url: 'http://192.168.1.143:8686/admin/api/getSetting',
        method: 'GET',
        success:function(data){
            var gpsPoint = new BMap.Point(data.x, data.y); 
            BMap.Convertor.translate(gpsPoint, 0, initMap); //转换坐标
        }
    })
    function initMap(point){ 
    //初始化地图 
        map = new BMap.Map("allmap"); 
        map.addControl(new BMap.NavigationControl()); 
        map.addControl(new BMap.ScaleControl()); 
        map.addControl(new BMap.OverviewMapControl()); 
        map.centerAndZoom(point, 15); 
        map.addOverlay(new BMap.Marker(point)) 
    } 
})