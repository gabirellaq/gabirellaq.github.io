/**
 * 第一种方案（参考网易）http://www.codeceo.com/article/font-size-web-design.html
 * [以iPhone4/5的设计稿为例js动态设置文档 rem 值]
 * 6.4怎么来的，当然是根据设计稿的横向分辨率/100得到的
 * 如果是750的设计稿，应该除以7.5
 * 当deviceWidth大于640时，则物理分辨率大于1280（这就看设备的devicePixelRatio这个值了），应该去访问pc网站 所以加上这个判断if(deviceWidth > 640) deviceWidth = 640;
 */
var deviceWidth = document.documentElement.clientWidth;
if(deviceWidth > 750) deviceWidth = 750;
document.documentElement.style.fontSize = deviceWidth / 7.5 + 'px';

require.config({
	baseUrl: "./",
	paths: {
		zepto: 'js/zepto.min',
		text: 'js/requirejs/plugins/text',
		json: 'js/requirejs/plugins/json',
		async: 'js/requirejs/plugins/async',
		BMap: 'http://api.map.baidu.com/api?v=2.0&ak=eM1XK6ESgAmeTi6WrMSZeXVd'
	}
});

require(['zepto','async!BMap'], function ($) {
	var $mapWrap = $('#mapWrap');
	window.$mapWrap = $mapWrap;
	var $searchSort = $('#searchSort');
	window.$searchSort = $searchSort;

	//初始化地图
	bmapInit();

	//关闭
	$('body').on('tap','.iconBack',function(e){
		e.stopPropagation();
		var _this = $(this).parents('.secondWrap,.resultWrap');
		_this.animate({'left':'100%'},function(){
			if(_this.hasClass('resultWrap')) {
				_this.hide();
			}else {
				_this.remove();	
			}					
		});
	});

	//选择距离范围
	var flag = false;
	$('body').on('tap','#chooseKmButton',function(){
		if(!flag){
			$(this).parents('.chooseDistance').children('.chooseKm').show();
			flag = true;
		}else{
			$(this).parents('.chooseDistance').children('.chooseKm').hide();
			flag = false;
		}
	});

	//地图初始化
	function bmapInit(){
		// 百度地图API功能
		var map = new BMap.Map("allmap");    // 创建Map实例
		map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
		map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
		map.centerAndZoom("上海",15);// 初始化地图,用城市名设置地图中心点
		window.map = map;//将map变量存储在全局

		//定位当前坐标
		var geolocation = new BMap.Geolocation();
		window.geolocation = geolocation;
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				var mk = new BMap.Marker(r.point);
				map.addOverlay(mk);
				map.panTo(r.point);
				//alert('您的位置：'+r.point.lng+','+r.point.lat);
			}
			else {
				//alert('failed'+this.getStatus());
			}        
		},{enableHighAccuracy: true});

	}

	//初始化搜索
	document.onkeydown = function(e){ 
	    var ev = document.all ? window.event : e;
	    if(ev.keyCode==13) {
	    	initSearch();
	    }
	};

	//切换距离
	$('body').on('tap','#chooseKm span',function(){
		var _text = $(this).text();
		var _data = $(this).attr('data');
		$('#kmsum').text(_text).attr('data',_data);
		$(this).parent('#chooseKm').hide();
		initSearch();
		flag = false;
	});

	//首页搜索
	function initSearch(){
		var localmark = $("#mapSearchText").val();
	    var panel = "r-result";
	    var distance = $('#kmsum').attr('data');
	    searchFun(localmark,panel,distance);
	};

	//超市，菜场，批发市场，餐饮企业搜索事件
	$('body').on('tap','#searchSort > span',function(){
		$(this).addClass('current').siblings().removeClass('current');
		var localmark = $("#mapSearchText").val();
	    var panel = "r-result";
	    var distance = $('#kmsum').attr('data');
		var keys = $(this).find('.stext').text();
		searchFun(localmark,panel,distance,keys);
	});

	//搜索示例
	//localMark 输入的地点
	//panel 查询结果展示面板
	//distance 查询的范围
	//keys指定的查询类型 如超市，菜场等
	function searchFun(localMark,panel,distance,keys){
		if(localMark == "" || localMark == null){
			alert("请输入地址");
		}
		map.clearOverlays(); //清除地图上所有标记 
		var mykeys = ["超市","菜场","批发市场","餐饮企业"];
		//默认搜索一个地址内的这四个信息点
		if(keys == null){
			keys = mykeys;
		}
		var circle,local,totalResults;
		var totalResults = 0;
		// 创建地址解析器实例
		var myGeo = new BMap.Geocoder();
		myGeo.getPoint(localMark, function(point){
			if (point) {
				map.centerAndZoom(point, 15);
				map.addOverlay(new BMap.Marker(point));
				circle = new BMap.Circle(point,distance,{
					fillColor:"blue",
					strokeWeight: 1 ,
					fillOpacity: 0.3,
					strokeOpacity: 0.3});
				map.addOverlay(circle);
				local = new BMap.LocalSearch(map, {
					renderOptions:{
						map: map,
						panel:panel,
						autoViewport: false
					},
					onSearchComplete : function(results) {
						//拼接数据
		    		var searchSort = '';
		    		
                    	//需要获取当前搜索总共有多少条结果 totalResults
                    	if(keys == mykeys){
                    		for (var i=0;i<results.length;i++){
                    			totalResults += results[i].getNumPois();
                    		}
                    		searchSort += '<div class="searchSort" id="searchSort">'
		    						+ '<span id="marketBtn"><span class="marketSUM">'+results[0].getNumPois()+'</span><span class="stext">超市</span></span>'
		    						+ '<span id="foodmarketBtn"><span class="foodmarketSUM">'+results[1].getNumPois()+'</span><span class="stext">菜场</span></span>'
		    						+ '<span id="wholesalemarketBtn"><span class="wholesalemarketSUM">'+results[2].getNumPois()+'</span><span class="stext">批发市场</span></span>'
		    						+ '<span id="cateringbusinessBtn"><span class="cateringbusinessSUM">'+results[3].getNumPois()+'</span><span class="stext">餐饮企业</span></span>'
		    					+ '</div>';
                    		if($searchSort.length >= 1 ){
				    			$searchSort.remove();
				    		}
				    		$mapWrap.append(searchSort);
				    		//显示总共的节点数
			    			$('#mapserachResultSum').html('<span>共有</span><span class="mapSearchSum">'+totalResults+'</span><span>个节点</span>');                   		
                    	}else{
                    		totalResults = results.getNumPois();
                    		//显示总共的节点数
		    				$('#mapserachResultSum').html('<span>已选</span><span class="mapSearchSum">'+totalResults+'</span><span>个节点</span> <span class="iconfont icon-liebiao" id="showDetailList"></span>');
                    	}
               		},
					pageCapacity:10 //搜索结果每页显示多少条
				});	
		    	local.searchNearby(keys,point,1000);
	    		

	    		//显示可追溯的产品
	    		var traceList = '';
	    			traceList += '<div class="traceList" id="traceList">'
	    							+ '<h1>可追溯的商品</h1>'
	    							+ '<span class="traceBox">'
	    								+ '<span class="tracepro">'
	    									+ '<a>雨润猪肉</a><a>精气神猪肉</a><a>双汇猪肉</a><a>牛肉</a><a>鸡肉</a><a>双汇猪肉</a><a>雨润猪肉</a><a>精气神猪肉</a><a>双汇猪肉</a><a>牛肉</a><a>鸡肉</a><a>双汇猪肉</a>'
	    								+ '</span>'
	    							+ '</span>'
	    						+'</div>';
	    		var $traceList = $('#traceList');
	    		if($traceList.length >= 1 ){
	    			$traceList.remove();
	    		}
	    		$mapWrap.append(traceList);

			}else{
				alert("您选择地址没有解析到结果!");
			}
		}, "上海市");		
	};

	//点击超市，菜场等的详情事件
	$('body').on('tap','#showDetailList',function(){
		$('#r-result').parents('.resultWrap').show().animate({'left':'0'});
	});

	//点击超市，菜场等详细列表后进入图片展示页面
	$('body').on('tap','#r-result li',function(){
		var rname = "超市";
		var raddress = "大道";
		var rdistance = "1km";
		//头部信息
		var rheadhtml = '';
			rheadhtml += '<div class="searchListHead">'
							+ '<span class="iconfont icon-jiantouBack iconBack"></span>'
							+ '<div class="headlist" id="head-searchThumb">'
								+ '<span class="headName">'+rname+'</span>'
								+ '<span class="headAddress">'+raddress+'</span>'
								+ '<span class="headtance"><span class="iconfont icon-iconfontluxiandaohang"></span> <label class="headDistance">'+rdistance+'</label></span>'
							+ '</div>'
						+ '</div>';
		//内容
		var rbodyhtml = '<div class="searchListBody" id="searchThumbBox"><ul class="searchThumblist" id="searchThumblist"></ul></div>';

		$mapWrap.append('<div class="secondWrap" id="searchThumbBox"></div>');
		$('#searchThumbBox').animate({'left':'0'}).html(rheadhtml+rbodyhtml);
		$.getJSON('json/searchThumb.json', function(data){
			var searchThumblist = '';
			for(var i=0;i<data.length;i++){
				searchThumblist += '<li><a>'
									+ '<img class="thumbimg" src="'+data[i].img+'">'
									+ '<p class="thumbname">'+data[i].name+'</p>'
									+ '<p class="thumbcodename">'+data[i].tcodename+'</p>'
									+ '<p class="thumbcode">'+data[i].tcode+'</p>'
									+ '<p class="thumbline">'
										+ '<span class="iconfont icon-dao"></span>'
										+ '<span class="iconfont icon-car2"></span>'
										+ '<span class="iconfont icon-fangziall"></span>'
										+ '<span class="iconfont icon-gouwuche"></span>'
									+ '</p>'
								+ '</li></a>'
			}			
			$('#searchThumblist').html(searchThumblist);
		});
		
	});

	//展示
	$('body').on('tap','#searchThumblist a',function(){
        //获取内容
        var img = $(this).find('.thumbimg').attr('src');
        var name = $(this).find('.thumbname').text();
        var thumbcodename = $(this).find('.thumbcodename').text();
        var thumbcode = $(this).find('.thumbcode').text();

        //头部信息
        var rname = $(this).parents('.secondWrap').find('.headName').text();
		var raddress = $(this).parents('.secondWrap').find('.headAddress').text();
		var rdistance = $(this).parents('.secondWrap').find('.headDistance').text();
		var rheadhtml = '';
			rheadhtml += '<div class="searchListHead">'
							+ '<span class="iconfont icon-jiantouBack iconBack"></span>'
							+ '<div class="headlist" id="head-searchThumb">'
								+ '<span class="headName">'+rname+'</span>'
								+ '<span class="headAddress">'+raddress+'</span>'
								+ '<span class="headtance"><span class="iconfont icon-iconfontluxiandaohang"></span> <label class="headDistance">'+rdistance+'</label></span>'
							+ '</div>'
						+ '</div>';

        //内容
        var dbodyhtml = '<div class="searchListBody" id="searchThumblistBox"></div>';
        $mapWrap.append('<div class="secondWrap" id="searchThumbDetailBox"></div>');
        $('#searchThumbDetailBox').animate({'left':'0'}).html(rheadhtml+dbodyhtml);
                         
        var html = '';
            html+= '<img class="tImg" src="'+img+'">'
                + '<p class="tName">'+name+'</p>'
                + '<p class="tCodeName"><label>'+thumbcodename+'：</lable><span class="tCode">'+thumbcode+'</span></p>'
                + '<div class="tLine">'
                    + '<div class="tLineTool clearfix"><span class="iconfont icon-dao"></span><div class="tooltipsbox"><h1>屠宰</h1><p>建东屠宰场</p><span>2017-05-05 00:28</span></div></div>'
                    + '<div class="tLineTool clearfix"><span class="iconfont icon-car2"></span><div class="tooltipsbox"><h1>屠宰</h1><p>建东屠宰场</p><span>2017-05-05 00:28</span></div></div>'
                    + '<div class="tLineTool clearfix"><span class="iconfont icon-fangziall"></span><div class="tooltipsbox"><h1>屠宰</h1><p>建东屠宰场</p><span>2017-05-05 00:28</span></div></div>'
                    + '<div class="tLineTool clearfix"><span class="iconfont icon-gouwuche"></span><div class="tooltipsbox"><h1>屠宰</h1><p>建东屠宰场</p><span>2017-05-05 00:28</span></div></div>'
                + '</div>';
        $('#searchThumblistBox').html(html);
    });


	//类别
	$('body').on('tap','#headList li',function(){
		var _thisChild = $(this).children('.iconfont');
		var _this = $(this);
		var fixed = $(this).parents('.resultWrap');
		_this.addClass('current').siblings().removeClass('current');		
		if(_thisChild.hasClass('icon-kongdown')){
			_thisChild.addClass('icon-kongup').removeClass('icon-kongdown');
			_this.siblings().children('.iconfont').removeClass('icon-kongup').addClass('icon-kongdown');
			_this.parents('.searchListHead').children('#categoriesBox').show();
			if(fixed.find('.fixed').length >= 1){
				fixed.find('.fixed').remove();
			}
			fixed.append('<div class="fixed"></div>');
		}else{
			_thisChild.addClass('icon-kongdown').removeClass('icon-kongup');
			_this.parents('.searchListHead').children('#categoriesBox').hide();
			fixed.find('.fixed').remove();
		}
	});

	$('body').on('tap','#categoriesList > span',function(){
		$(this).addClass('current').siblings().removeClass('current');
	});

});