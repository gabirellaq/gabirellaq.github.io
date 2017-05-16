//初始拖拽功能
function initContainer(){
	$(".demo2,.column").sortable({
		connectWith: ".column",
		opacity: .35,
		handle: ".drag",
		start: function(e,t) {
			if (!startdrag) stopsave++;
			startdrag = 1;
		},
		stop: function(e,t) {
			if(stopsave>0) stopsave--;
			startdrag = 0;
		}
	});
};

//滚动条
var layoutMenuScroll = function(){
	var $layoutMenuScroll =$('.layoutMenuScroll:visible');
	$layoutMenuScroll.tinyscrollbar();
    var layoutMenuScroll = $layoutMenuScroll.data("plugin_tinyscrollbar");
    layoutMenuScroll.update("relative");
};

var menuHiddenScroll = function(){
	var $menuHiddenScroll =$('.menuHiddenScroll:visible');
	$menuHiddenScroll.tinyscrollbar();
    var menuHiddenScroll = $menuHiddenScroll.data("plugin_tinyscrollbar");
    menuHiddenScroll.update("relative");
};

//from拖拽数据
var waitingData = function(status,url){
	//遍历字段
	if(status == "add"){
		var sel = $("#modelGrid").grid("option","selarrrow").concat();
		urldata(url);
		if(sel.length != 0){
			$.each(sel, function(i){
                $('#elmJS [data-id="'+sel[i]+'"]').hide();
            });
        }
        layoutMenuScroll();
	}else{
		$.ajax({
			url:url,
			type:"GET",
			dataType:"json",
			cache:false,
			success:function(data){
				urldata(data);
			},
			error:function(){
				$.message("数据错误！");
			}
		});
	}


	function urldata(data){
		var dataName,dataType;
		var dataStr = [];
		var dataId;
		var comcls = "form-control";
		for(i in data){
			dataName = data[i]['showName'];
			dataType = data[i]['inputType'] ? data[i]['inputType'] : 'textbox';
			dataId = data[i]['id'];
			dataStr.push('<div class="box box-element ui-draggable"  data-id="'+dataId+'"><a class="remove label label-important"><i class="icon-remove icon-white"></i></a><span class="drag label"><i class="icon-move"></i></span><div class="preview"><span class="iconfont icon-'+dataType+'"></span><span class="perName" title="'+dataName+'">'+dataName+'</span></div><div class="view viewTarget" xtype="'+dataType+'">');
			if(dataType == "radiolist" || dataType == "checkboxlist"){
				dataStr.push('<div class="coral-ui coralui-'+dataType+'" data-roll="'+dataType+'"  data-options="labelField:'+dataName+'" data-id="'+dataId+'"></div>');
			}
			else if(dataType == "checkbox" || dataType == "radio"){
				dataStr.push('<input class="coral-ui coralui-'+dataType+'" type="'+dataType+'" data-roll="'+dataType+'" data-options="labelField:\''+dataName+'\',value:\'CN\',label:\'中国\'"  data-id="'+dataId+'">');
			}else{
				dataStr.push('<input class="coral-ui coralui-'+dataType+'"  data-roll="'+dataType+'" data-options="labelField:\''+dataName+'\',componentCls:\''+comcls+'\'">');
			}
			dataStr.push('</div></div>');
		}
		$('#elmJS .overview').append(dataStr.join(""));
		layoutMenuScroll();
		$("#elmJS .box").draggable({
			connectToSortable: ".column",
			helper: "clone",
			handle: ".drag",
			start: function(e,t) {
				if (!startdrag) stopsave++;
				startdrag = 1;
			},
			drag: function(e, t) {
				t.helper.width(400)
			},
			stop: function(e,t) {
				var datarowId = $(e.target).attr('data-id');
				var component = $('.demo [data-id="'+datarowId+'"]').find(".coral-ui"),
				    view = component.closest(".view");
				if (component){
					var roll = component.data("roll");
       				component.addClass("coralui-"+roll).removeClass("coral-ui");
	               $.parser.parse(view);
				}
				//删除
				//拖动成功后删除待选区域的字段
				if($('.demo2 .box[data-id="'+datarowId+'"]').length > 0){
					//alert('待选区拖入工作区')
					$(e.target).hide();
				}
				if($('#elmJS .box[data-id="'+datarowId+'"]').length > 1){
					//alert('待选区拖动和排序不成功')
					$(e.target).remove();
				}

				if($('#navhiddenarea .box[data-id="'+datarowId+'"]').length > 0 ){
//					alert('待选区拖入隐藏区12222')
					$(e.target).remove();
				}				
				hiddenAreaField();
				$("#elmJS .column").sortable({
					opacity: .35,
					connectWith: ".column",
					start: function(e,t) {
						if (!startdrag) stopsave++;
						startdrag = 1;
					},
					stop: function(e,t) {
						hiddenAreaField();
						//alert('待选区排序');
						if(stopsave>0) stopsave--;
						startdrag = 0;
					},
					receive: function(e,t){
						//当一个已连接的sortable对象接收到另一个sortable对象的元素后触发此事件。
//						alert($('#navhiddenarea .box[data-id="'+datarowId+'"]').length);
//						if($('#navhiddenarea .box[data-id="'+datarowId+'"]').length <= 0){
//							alert("隐藏区拖入待选区");
						hiddenAreaField();
//						}		
						layoutMenuScroll();
						if(stopsave>0) stopsave--;
						startdrag = 0;
					}
				});
				if(stopsave>0) stopsave--;
				startdrag = 0;
				layoutMenuScroll();
				menuHiddenScroll();
			}
		});
	}

	//隐藏字段
	$.ajax({
		url:"modules/aside/menuhidden.json",
		type:"post",
		dataType:"json",
		cache:false,
		success:function(data){
			//showName inputType
			//data[i][showName] data[i][inputType]
			var dataName,dataType;
			var dataStr = [];
			var dataId;
			var comcls = "form-control";
			for(i in data){
				dataName = data[i]['showName'];
				dataType = data[i]['inputType'] ? data[i]['inputType'] : 'textbox';
				dataId = data[i]['id'];
				dataStr.push('<div class="box box-element ui-draggable"  data-id="'+dataId+'"><a class="remove label label-important"><i class="icon-remove icon-white"></i></a><span class="drag label"><i class="icon-move"></i></span><span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span><div class="preview"><span class="iconfont icon-'+dataType+'"></span><span class="perName" title="'+dataName+'">'+dataName+'</span></div><div class="view viewTarget" xtype="'+dataType+'">');
				if(dataType == "radiolist" || dataType == "checkboxlist"){
					dataStr.push('<div class="coral-ui coralui-'+dataType+'" data-roll="'+dataType+'"  data-options="labelField:'+dataName+'" data-id="'+dataId+'"></div>');
				}
				else if(dataType == "checkbox" || dataType == "radio"){
					dataStr.push('<input class="coral-ui coralui-'+dataType+'" type="'+dataType+'" data-roll="'+dataType+'" data-options="labelField:\''+dataName+'\',value:\'CN\',label:\'中国\'"  data-id="'+dataId+'">');
				}else{
					dataStr.push('<input class="coral-ui coralui-'+dataType+'"  data-roll="'+dataType+'" data-options="labelField:\''+dataName+'\',componentCls:\''+comcls+'\'">');
				}
				dataStr.push('</div></div>');
			}
			$('#navhiddenarea .column').append(dataStr.join(""));
			menuHiddenScroll();
			$("#navhiddenarea .box").draggable({
				connectToSortable: ".column",
				helper: "clone",
				handle: ".drag",
				start: function(e,t) {
					if (!startdrag) stopsave++;
					startdrag = 1;
				},
				drag: function(e, t) {
					t.helper.width(400)
				},
				stop: function(e,t) {
					/*$("#navhiddenarea .column").sortable({
						opacity: .35,
						connectWith: "#navhiddenarea .column",
						start: function(e,t) {
							if (!startdrag) stopsave++;
							startdrag = 1;
						},
						stop: function(e,t) {
							alert('隐藏区排序');
							if(stopsave>0) stopsave--;
							startdrag = 0;
						}
					});*/
					if(stopsave>0) stopsave--;
					startdrag = 0;
					var datarowId = $(e.target).attr('data-id');
					//删除 拖拽成功删除
					if($('.demo2 .box[data-id="'+datarowId+'"]').length > 0 ){
						//alert('隐藏区拖入工作区12');
						$(e.target).hide();
					}

					if($('#elmJS .box[data-id="'+datarowId+'"]').length > 0){
						$(e.target).remove();
					}
					layoutMenuScroll();
					menuHiddenScroll();
				}
			});
		},
		error:function(){
			$.message("隐藏数据错误！");
		}
	});
};
function hiddenAreaField(){
	var hiddenFields = $('#navhiddenarea [data-id]');
	var data = {};
	for(var i=0;i<hiddenFields.length;i++){
		var columnId = $(hiddenFields[i]).attr("data-id");
		var property = $(hiddenFields[i]).find('[data-options]').attr("data-options");
		var propertyData = getColumnData(property);
		data['fieldList['+i+'].columnId']=columnId;
		data['fieldList['+i+'].properties']=propertyData['properties'];
		data['fieldList['+i+'].showName']=propertyData['showName'];
	}
	data["map.appDefineId"] = GetQueryValue("appDefineId");
	$.ajax({
		type : 'post',
		url : ctx+"define/app-form-field!saveAndDelete.json",
		data : data,
		dataType : 'json',
		success : function(data) {
			//success;
		},
		error : function(e) {
			error(e);
		}
	});
}

function getColumnData(property){
	var values = property.replace(/'/g,"").split(',');
	var properties = '';
	var showName = '';
	for(var i=0;i<values.length;i++){
		var ps = values[i].split(":");
		if(properties!=''){
			properties += ",";
		}
		if(ps[0]=='labelField'){
			showName = ps[1];
		}
		properties += '"'+ps[0]+'":"'+ps[1]+'"';
	}
	
	var data = {};
	data["properties"] = properties;
	data["showName"]=showName;
	return data;
}
/*
//通过字段id删除隐藏区域字段
function deleteHiddenAreaField(columnId){

	$.ajax({
		type : 'post',
		url : ctx+"define/app-form-field!deleteByAppDefineIdAndColumnId.json",
		data : {"map.appDefineId":GetQueryValue("appDefineId"),columnId:columnId},
		dataType : 'json',
		success : function(data) {
			//success;
		},
		error : function(e) {
			error(e);
		}
	});
}

//通过字段id添加隐藏区域字段
function addHiddenAreaField(columnId){
	var value = $('#navhiddenarea .box[data-id="'+columnId+'"] [data-options]').attr("data-options");
	value = value.replace(/'/g,"");
	var values = value.split(',');
	var properties = '';
	var showName = '';
	for(var i=0;i<values.length;i++){
		var ps = values[i].split(":");
		if(properties!=''){
			properties += ",";
		}
		if(ps[0]=='labelField'){
			showName = ps[1];
		}
		properties += '"'+ps[0]+'":"'+ps[1]+'"';
	}
	
	var data = {};
	data["properties"] = properties;
	data["columnId"]=columnId;
	data["showName"]=showName;
	data["map.appDefineId"] = GetQueryValue("appDefineId");
	$.ajax({
		type : 'post',
		url : ctx+"define/app-form-field!create.json",
		data : data,
		dataType : 'json',
		success : function(data) {
			//success;
		},
		error : function(e) {
			error(e);
		}
	});
}
*/