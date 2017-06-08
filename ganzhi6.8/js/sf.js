/**
 * 第一种方案（参考网易）http://www.codeceo.com/article/font-size-web-design.html
 * [以iPhone4/5的设计稿为例js动态设置文档 rem 值]
 * 6.4怎么来的，当然是根据设计稿的横向分辨率/100得到的
 * 如果是750的设计稿，应该除以7.5
 * 当deviceWidth大于640时，则物理分辨率大于1280（这就看设备的devicePixelRatio这个值了），应该去访问pc网站 所以加上这个判断if(deviceWidth > 640) deviceWidth = 640;
 */
 //字体转换rem单位
initFontRem();
function initFontRem(){
	var deviceWidth = document.documentElement.clientWidth;
	if(deviceWidth > 750) deviceWidth = 750;
	document.documentElement.style.fontSize = deviceWidth / 7.5 + 'px';
}
$(window).resize(function(){
	initFontRem();
});

	$mapWrap = $('#mapWrap');
	$searchSort = $('#searchSort');
	if (window.localStorage) {
	    localStorage.setItem("initRadius", 3000);	
	}
	var initCenter = new BMap.Point(108.30658044894886,22.873883384337855);
	bmapInit();
	
	//关闭
	$('body').off('touchend','.iconBack').on('touchend','.iconBack',function(e){
		e.stopPropagation();
		var _this = $(this).parents('.secondWrap,.resultWrap');
		_this.animate({'transform':'translateX(0)'});
	});

	//选择距离范围
	var flag = false;
	$('body').off('touchend','#chooseKmButton').on('touchend','#chooseKmButton',function(e){
		e.preventDefault();
		if(!flag){
			$(this).parents('.chooseDistance').children('.chooseKm').show();
			flag = true;
		}else{
			$(this).parents('.chooseDistance').children('.chooseKm').hide();
			flag = false;
		}
	});
	$('body').off('touchend','.distancePlus span').on('touchend','.distancePlus span',function(e){
		e.preventDefault();
		initRadius = parseInt(initRadius) + 1000;
		console.log("plus:"+initRadius);
		getMarketData("http://bd.zhuisuyun.net/shianyun-web/proxy/perception/CompInfo",{"lng":initCenter.lng,"lat":initCenter.lat},initRadius,'all');
	});
	$('body').off('touchend','.distanceMinus span').on('touchend','.distanceMinus span',function(e){
		e.preventDefault();
		initRadius = parseInt(initRadius) - 1000 <= 0 ?1000 : parseInt(initRadius) - 1000;
		console.log("minus:"+initRadius);
		getMarketData("http://bd.zhuisuyun.net/shianyun-web/proxy/perception/CompInfo",{"lng":initCenter.lng,"lat":initCenter.lat},initRadius,'all');
	});
	//切换距离重新显示结果
	$('body').off('touchend','#chooseKm span').on('touchend','#chooseKm span',function(e){
		e.preventDefault();
		var _text = $(this).text();
		var _data = $(this).attr('data');
		$('#kmsum').text(_text).attr('data',_data);
		$(this).parent('#chooseKm').hide();
		//getMarketData(dataUrl,point,radius,address);
		
		getMarketData("http://bd.zhuisuyun.net/shianyun-web/proxy/perception/CompInfo",{"lng":initCenter.lng,"lat":initCenter.lat},_data,'all');
		//search('all');
		flag = false;
	});


	$('body').off('touchend','#searchSort > span').on('touchend','#searchSort > span',function(){
		$('#mapserachResultSum').html("");
		$(this).addClass('current').siblings().removeClass('current');
		var num = $(this).data("num");
		var text = $(this).children(".stext").data("type");
		$('#mapserachResultSum').html('<span>已选</span><span class="mapSearchSum">'+num+'</span><span>个节点</span> <span class="iconfont icon-liebiao" id="showDetailList" data-type="'+ text +'"></span>');
	});

	//搜索结果列表页面
	//保存新数据
	var _dataArray = [],_otherArry=[];
	$('body').off('touchend','#showDetailList').on('touchend','#showDetailList',function(){
		$('#r-result').html('');
		var lists = '<ul class="listUl">';
		var data = $(this).data("type") == "all" ?  searchClass.data : $(this).data("type") == "cs" ? searchClass.currentMarket : searchClass.currentJM;
		var distance;
		for (var i = 0; i < data.length; i++) {
			distance = (getDistance(new BMap.Point(108.2758138185506,22.848675894991487),new BMap.Point(data[i].point.lng,data[i].point.lat)) / 1000).toFixed(1);
			lists += '<li id="'+data[i].compId+'"><span class="iconfont icon-yuandian"></span><p class="storeName">'+ data[i].compName +'</p><p class="address">'+ data[i].address +'</p><span class="distance">'+ distance + 'km'  +'</span><span class="iconfont icon-liebiao"></span></li>';
			_dataArray.push({
				'storeName':data[i].compName,
				'address':data[i].address,
				'distance':distance
			})

		}
		lists += '</ul>';
		//$('#r-result');
		$('#r-result').parents('.resultWrap').animate({'transform':'translateX(-100%)'});
		$('#r-result').html(lists);
	});
	$('body').off('blur','#categoriesList > span').on('blur','#categoriesList > span',function(){
		$("#categoriesBox").hide();
	})
	$('body').off('touchend','#categoriesList > span').on('touchend','#categoriesList > span',function(){
		$(this).addClass('current').siblings().removeClass('current');
		var productId = $(this).data("key");
		var data = searchClass.data;
		var pointArry = [], resultArry=[],otherArry = [],isExit=true;
		for(var i = 0;i<data.length;i++){
			var productList = data[i].goodsList, productListArry=[];
			for(var j = 0; j<productList.length;j++){
				productListArry.push(parseInt(productList[j]["goodsId"]));
			}
			if($.inArray(productId,productListArry)<0){
				isExit = false;
			}else{
				isExit = true;
			}
			if(!isExit){
				resultArry.push(data[i]);
			}else{
				otherArry.push(data[i])
			}
		}
		_otherArry = otherArry;
		console.log(resultArry)
		disableProduct(resultArry,otherArry);
	});
	$('body').off('touchend','.tracepro>a').on('touchend','.tracepro>a',function(e){
		if($(this).hasClass('current')){
			$(this).removeClass("current");
		}else{
			$(this).addClass("current").removeClass('current');
		}
		var data = searchClass.data;
		var productId = $(this).data("id");
		var pointArry = [], resultArry=[],ortherArry=[],isExit=true;
		for(var i = 0;i<data.length;i++){
			var productList = data[i].goodsList, productListArry=[];
			for(var j = 0; j<productList.length;j++){
				productListArry.push(parseInt(productList[j]["goodsId"]));
			}
			if($.inArray(productId,productListArry) < 0){
				isExit = false;
			}else{
				isExit = true;
			}
			if(!isExit){
				resultArry.push(data[i]);
			}else{
				ortherArry.push(data[i]);
			}
		}
		console.log(resultArry);
		changeMarker(resultArry,ortherArry);
	})

	//点击超市，菜场等详细列表后进入图片展示页面
	$('body').off('tap','#r-result li').on('tap','#r-result li',function(){
		if($(this).hasClass("product-state-disabled")){
			return;
		}
		var rname = $(this).children(".storeName").text();
		var raddress = $(this).children(".address").text();
		var rdistance = $(this).children(".distance").text();
		
		showFoodsList(rname, raddress, rdistance)
	});
	//点击弹窗的详情按钮进入图片展示页面
	

	$('body').off('tap','#searchThumblist a').on('tap','#searchThumblist a',function(){
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
								+ '<span class="headName">'+rname+'</span><br />'
								+ '<span class="headAddress">'+raddress+'</span>'
								+ '<span class="headtance"><span class="iconfont icon-iconfontluxiandaohang"></span> <label class="headDistance">'+rdistance+'</label></span>'
							+ '</div>'
						+ '</div>';

        //内容
        var dbodyhtml = '<div class="searchListBody" id="searchThumblistBox"></div>';
        $mapWrap.append('<div class="secondWrap" id="searchThumbDetailBox"></div>');
        $('#searchThumbDetailBox').animate({'transform':'translateX(-100%)'},function(){
        	var requestParam='{"serviceKey":"D1GHjOfkTKOo8bqdtwMBKbb1EDA1I9","param":{"traceCode":"'+thumbcode+'"}}';
			var dataUrl = "http://bd.zhuisuyun.net/shianyun-web/proxy/perception/traceCode/code";
	        $.ajax({
		        url: dataUrl,
		        type: "post",
		        dataType: 'json',
		        data: {"requestParam":requestParam},
		        async:false,
		        success: function(data, textStatus){
					console.log(data);
					var html = [];
					html.push('<img class="tImg" src="'+img+'"><p class="tName">'+data.GOODS_NAME+'</p>');
					html.push('<p class="tCodeName"><label>'+thumbcodename+'：</lable><span class="tCode">'+data.TraceCode+'</span></p>');
					html.push('<div class="tLine">');
					for(var i = 0;i< data.List.length;i++){
						var listArry = data.List[i].split(";");
						var detailArry = listArry[0].split("：");
						html.push('<div class="tLineTool clearfix"><span class="iconfont icon-dao"></span><div class="tooltipsbox"><h1>'+detailArry[0]+'</h1><p class="addressInfo">'+detailArry[1]+'</p><span>'+listArry[1]+'</span></div></div>')
					}
					html.join("");
					$('#searchThumblistBox').html(html);
		        },
				error:function(error,status){
					//debugger;
				}
		    }); 
        }).html(rheadhtml+dbodyhtml);


                        
    });
	function disableProduct(result,data){
		$("li").removeClass("product-state-disabled");
		for(var i = 0; i< result.length;i++){
			$("#"+result[i]["compId"]).addClass("product-state-disabled");
		}
	};
	//地图初始化
	function bmapInit(){
		// 百度地图API功能
		var map = new BMap.Map("allmap");    // 创建Map实例
		map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
		map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
		initCenter = new BMap.Point(108.30658044894886,22.873883384337855);
		map.centerAndZoom(initCenter,13);// 初始化地图,用城市名设置地图中心点
		window.map = map;//将map变量存储在全局

		//定位当前坐标
		var geolocation = new BMap.Geolocation();
		window.geolocation = geolocation;
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				var mk = new BMap.Marker(initCenter);
				map.addOverlay(mk);
				map.panTo(initCenter);

				setPointToAddress(initCenter);
				initRadius = 3000;
				//获取总的数据
				getMarketData("http://bd.zhuisuyun.net/shianyun-web/proxy/perception/CompInfo",{"lng":initCenter.lng,"lat":initCenter.lat},initRadius,'all');
				//search('all');
			}
			else {
				//alert('failed'+this.getStatus());
			}        
		},{enableHighAccuracy: true});

	}

	function SearchClass(data){  
	    this.data = data;
	    this.currentMarket = [];
	    this.currentJM = [];	
	    for (var i = 0; i < this.data.length; i++) {
	    	if(data[i].marketTypeName == "超市"){
    			this.currentMarket.push(data[i]);
    		}else{
    			this.currentJM.push(data[i]);
    		}
	    }	
	}
	SearchClass.prototype.filter = function(type){  
	    if(this.data == null){alert("无结果显示!");return false;}

	    //显示统计数据
	    showTotalData(this.currentMarket.length,this.currentJM.length,this.data.length);

	    //针对不同类型的点进行筛选并大点
	    var reval = [];
	    if(type == "all"){
	    	reval = this.data;
	    }else if(type == "CS"){
	    	reval = this.currentMarket;
	    }else if(type == "JM"){
	    	reval = this.currentJM;
	    }
	    return reval;  
	}

	//请求数据
	var _dataProductArray = []
	function getMarketData(dataUrl,point,radius,searchType){
	    var requestParam='{"serviceKey":"D1GHjOfkTKOo8bqdtwMBKbb1EDA1I9","param":{"lat":'+ point.lat +',"lng":'+ point.lng +',"raidus":'+ radius +'}}';//'{"serviceKey":"oi4TMEmIQcWjJ4eA62qYHaLaJJmROe","param":{"areaId":"310000"}}';
		//初始化地图
		$.ajax({
	        url: dataUrl,
	        type: "post",
	        dataType: 'json',
	        data: {"requestParam":requestParam},
	        async:false,
	        success: function(data, textStatus){
				console.log(data);
				_dataProductArray = data;
				searchClass = null;
	            searchClass = new SearchClass(data.data);

				search(searchType,data.data);
	        }
	    });
	}

	function setPointToAddress(point){
		var address = "";
		var geoc = new BMap.Geocoder();
		geoc.getLocation(point, function(rs){
			$("#mapSearchText").prop('value',rs.address);
		});
	}

	//搜索方法 param{address:中心点地址,radius:显示范围半径}  
	function search(type,data){
	    var dd = searchClass.filter(type);  
	    addMarker(dd);//向地图中添加marker
	    //显示可追溯的产品
		var traceList = [],proInfo={},proArry=[];
			traceList.push('<div class="traceList" id="traceList"><h1>可追溯的商品</h1><span class="traceBox"><span class="tracepro">');
			for(var i = 0;i<data.length;i++){
				var productList = data[i].goodsList;
				$.each(productList,function(key,value){
					proInfo[productList[key]["goodsId"]] = productList[key]["goodsName"];
				})
			}
			$.each(proInfo,function(key,value){
				traceList.push('<a data-id="'+key +'" class="traceProduct">'+ value +'</a>')
			})
			traceList.push('</span></span></div>');
		var $traceList = $('#traceList');
		if($traceList.length >= 1 ){
			$traceList.remove();
		}
		$mapWrap.append(traceList.join(""));  
	}
	function changeMarker(resultArry,ortherArry){
		map.clearOverlays(); 
		for(var i=0;i<ortherArry.length;i++){
	        var json = ortherArry[i];  
	        var point = new BMap.Point(json.point.lng,json.point.lat);
	        var icon = json.marketTypeName == "超市" ? myIcon1 : myIcon2; 
	        var marker = new BMap.Marker(point,{icon:icon});
	        map.addOverlay(marker);  
	    }
	    for(var j=0;j<resultArry.length;j++){
	        var point = new BMap.Point(resultArry[j]["point"].lng,resultArry[j]["point"].lat);
	        var icon = resultArry[j].marketTypeName == "超市" ? myIcon1_grey : myIcon2_grey; 
	        var marker = new BMap.Marker(point,{icon:icon});
	        map.addOverlay(marker);  
	    }
	}
	var opts = {
		width : 250, 
		height: 140
   	};
   	var myIcon1 = new BMap.Icon("img/CSMarker.png", new BMap.Size(19,30));
   	var myIcon2 = new BMap.Icon("img/JMMarker.png", new BMap.Size(27,30));
   	var myIcon1_grey = new BMap.Icon("img/CSMarker_grey.png", new BMap.Size(27,30));
   	var myIcon2_grey = new BMap.Icon("img/JMMarker_grey.png", new BMap.Size(27,30));
	//创建marker 
	function addClickHandler(content,marker){
		marker.addEventListener("click",function(e){
			openInfo(content,e)
			document.getElementById("detail").onclick = function(){
				alert("asd");
			}
		});
	}
	//点击marker打开弹出窗口
	function openInfo(content,e){
		var p = e.target;
		var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
		var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象 
		map.openInfoWindow(infoWindow,point); //开启信息窗口
	}

	function addMarker(data){ 
	    map.clearOverlays(); 
	    for(var i=0;i<data.length;i++){
	        var json = data[i];  
	        var point = new BMap.Point(json.point.lng,json.point.lat);
	        var icon = json.marketTypeName == "超市" ? myIcon1 : myIcon2; 
	        var marker = new BMap.Marker(point,{icon:icon});
	        var content = "<div class='infoWindow clearfix'>"
	        + "<div class='head'>"
	        + "<h2 class='title'>"+ json.compName +"</h2>"
	        + "<h3 class='secondTitle'>"+ json.address +"<i class='icon iconfont icon-iconfontluxiandaohang'></i></h3>"
	        + "</div>"
	        + "<ul class='list'>";
	        for(var j = 0; j<json.goodsList.length; j++){
				var goods = json.goodsList[j];
				content += "<li><i class='icon iconfont icon-yuandian'></i>"+ goods.goodsName +"</li>";
				if(j == 2){
					break;
				}
	        }
	        content = content
	        + "</ul>"
	        + "<span class='detail' data-name='"+ json.compName +"' data-address='"+ json.address +"' data-distance='"+ (getDistance(initCenter,new BMap.Point(json.point.lng,json.point.lat)) / 1000).toFixed(1) + 'km' +"' onclick='showDetail(this)'>详情</span>"
	        + "<span class='arrow'><i class='inner'></i></span>"
	        + "</div>";
	        map.addOverlay(marker);
	        addClickHandler(content,marker);
	    }
	}
	//点击infowindow的详情按钮展示改该超市的产品列表
	function showDetail(obj){
		var rname = $(obj).data("name");
		var raddress = $(obj).data("address");
		var rdistance = $(obj).data("distance");
		showFoodsList(rname, raddress, rdistance);
	}


	//获取两个点之间的距离，传入的参数是两个包含经纬度的point
	function getDistance(point1,point2){
		return BMapLib.GeoUtils.getDistance(point1,point2);
	}

	function showTotalData(marketLength,jmLength,totalLength){
		var searchSort;
		searchSort += '<div class="searchSort" id="searchSort">'
				+ '<span id="marketBtn" data-num="'+ marketLength +'"><span class="marketSUM">'+marketLength+'</span><span class="stext" data-type="cs">超市</span></span>'
				+ '<span id="foodmarketBtn" data-num="'+ jmLength +'"><span class="foodmarketSUM">'+jmLength+'</span><span class="stext" data-type="jm">集贸</span></span>'
			+ '</div>';
		if($searchSort.length >= 1 ){
			$searchSort.remove();
		}
		$mapWrap.append(searchSort);

		//显示总共的节点数
		$('#mapserachResultSum').html('<span>共有</span><span class="mapSearchSum">'+totalLength+'</span><span>个节点</span> <span class="iconfont icon-liebiao" id="showDetailList" data-type="all"></span>'); 
	}

	//显示产品列表
	function showFoodsList(rname, raddress, rdistance){
		//头部信息
		var rheadhtml = '';
			rheadhtml += '<div class="searchListHead">'
							+ '<span class="iconfont icon-jiantouBack iconBack"></span>'
							+ '<div class="headlist" id="head-searchThumb">'
								+ '<span class="headName">'+rname+'</span><br />'
								+ '<span class="headAddress">'+raddress+'</span>'
								+ '<span class="headtance"><span class="iconfont icon-iconfontluxiandaohang"></span> <label class="headDistance">'+rdistance+'</label></span>'
							+ '</div>'
						+ '</div>';
		//内容
		var rbodyhtml = '<div class="searchListBody" id="searchThumbBox"><ul class="searchThumblist" id="searchThumblist"></ul></div>';

		$mapWrap.append('<div class="secondWrap" id="searchThumbBox"></div>');
		$('#searchThumbBox').animate({'transform':'translateX(-100%)'},function(){
			var requestParam='{"serviceKey":"D1GHjOfkTKOo8bqdtwMBKbb1EDA1I9","param":{"nodeId":"450103309"}}';
			var dataUrl = "http://bd.zhuisuyun.net/shianyun-web/proxy/perception/traceId";
			$.ajax({
		        url: dataUrl,
		        type: "post",
		        dataType: 'json',
		        data: {"requestParam":requestParam},
		        async:false,
		        success: function(data, textStatus){
					console.log(data.data);
					var data = data.data;
					var searchThumblist = '';
					for(var i=0;i<data.length;i++){
						searchThumblist += '<li><a>'
											+ '<img class="thumbimg" src="img/'+data[i].goodsId+'.png">'
											+ '<p class="thumbname">'+data[i].goodsName+'</p>'
											+ '<p class="thumbcodename">肉菜流通追溯码</p>'
											+ '<p class="thumbcode">'+data[i].traceId+'</p>'
											+ '<p class="thumbline">'
												+ '<span class="iconfont icon-dao"></span>'
												+ '<span class="iconfont icon-car2"></span>'
												+ '<span class="iconfont icon-fangziall"></span>'
												+ '<span class="iconfont icon-gouwuche"></span>'
											+ '</p>'
										+ '</li></a>'
					}			
					$('#searchThumblist').html(searchThumblist);
		        }
		    });
		}).html(rheadhtml+rbodyhtml);
	}
	
//商品排序
function getProductSort(obj){
	var proInfo = {},categoriesList = [];
	$(obj).addClass('current').siblings().removeClass('current');
	var object = $(obj).children('.iconfont');
	var categoriesBox = $('#categoriesBox');
	if(object.hasClass('icon-kongdown')){
		object.addClass('icon-kongup').removeClass('icon-kongdown');
		categoriesBox.show();	
	}else{
		object.addClass('icon-kongdown').removeClass('icon-kongup');
		categoriesBox.hide();
	}
	console.log(_dataProductArray);
	for(var i = 0;i<_dataProductArray.data.length;i++){
		var productList = _dataProductArray.data[i].goodsList;
		$.each(productList,function(key,value){
			proInfo[productList[key]["goodsId"]] = productList[key]["goodsName"];
		});
	}
	categoriesList.push('<div id="categoriesList" class="categoriesList">');
	$.each(proInfo,function(key,value){
		categoriesList.push('<span data-key="'+key +'">'+ value +'</span>')
	})
	categoriesList.push('</div>');
	$('#categoriesBox').html(categoriesList.join(""));

};	

//距离远近排序
function getDistanceSort(obj){
	$(obj).addClass('current').siblings().removeClass('current');
	$('#categoriesBox').hide();
	//_dataArray 从这个数组中获取数据排序

	var object = $(obj).children('.iconfont');
	if(object.hasClass('icon-kongdown')){
		object.addClass('icon-kongup').removeClass('icon-kongdown');
		_dataArray.sort(getSortFun('asc', 'distance'));		
	}else{
		object.addClass('icon-kongdown').removeClass('icon-kongup');
		_dataArray.sort(getSortFun('desc', 'distance'));
	}
	var lists = '<ul class="listUl">';
	for (var i = 0; i < _dataArray.length; i++) {
		lists += '<li><span class="iconfont icon-yuandian"></span><p class="storeName">'+ _dataArray[i].storeName +'</p><p class="address">'+ _dataArray[i].address +'</p><span class="distance">'+ _dataArray[i].distance + 'km'  +'</span><span class="iconfont icon-liebiao"></span></li>';
	}
	lists += '</ul>';
	$('#r-result').html(lists);
	//alert(JSON.stringify(_dataArray));
}
	
function getSortFun(order, sortBy) {
  var ordAlpah = (order == 'asc') ? '>' : '<';
  var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
  return sortFun;
}

