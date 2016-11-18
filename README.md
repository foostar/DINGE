# DINGE
# API包：
       #1. 使用方式：  引入API，实例化
       #2. 参数列表  {
            #env    使用环境
            #url    host路径
            #cacheTime   缓存时间，默认不开启   0 不开启  -1 永久开启  num 缓存分钟
            #showLoading  loading开启函数
            #closeLoading  loading关闭函数
        #}
        #举个例子：   new API（{
            #env: 'test',
            #url: 'http://localhost:3080',
            #cacheTime: 5
        #}）
       #3. 适用其他环境方法： 实例化后改写api方法，和getStorage setStorage removeStorage缓存的方法
# 调用接口方法：new API().xxx()
    #此环境已经合并到dingeTools对象上，直接使用dingeTools.xxx(data, cache)
    #传入参数:
        #data: 发送请求时传入的参数   非必传
        #cache:  这次请求的缓存时间   非必传   不传时缓存时间默认为实例化时传入的缓存时间

