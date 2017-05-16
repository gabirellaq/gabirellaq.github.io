define(
	[
	 	"text!modules/content/contentMenu.html",
	 	"common",
	 	"content"
	],
	function(contentmenu,common,content){
		var contentmenuHtml = function(){
			$('.contentMenu').html(contentmenu);
		};
		var contentmenulist = {};
		contentmenulist.load = function(){
			contentmenuHtml();


			$('#content_isShowIntro_checkbox').checkbox({
			    value: "modelshowIntro",
			    label: "显示说明",
			    onChange:function(event,ui){
			    	if(ui.checked == true){
			    		contentintroInit();
			    	}			    	
			    }
			});

			function contentintroInit(){
				if($('.prop').hasClass('propRight')){
    				$('.propSet').attr({'data-step':'5','data-intro':'属性设置<br>点击设计区中的字段，右侧自动弹出属性设置界面'});
    			}else{
    				$('.propSet').attr('');
    			}
	    		introJs('.dragDemo')
	    			.setOptions({'prevLabel':'&larr; 上一步','nextLabel':'下一步 &rarr;','skipLabel':'跳过','doneLabel':'完成'})
	    			.start();
			}

			$(".contentMenu").on("click","#clear",function(e){
	    		e.preventDefault();
	    		common.clearDemo()
	    	});

	    	$(".dragDemo").on("click",'#lan1',function(){
	    		$(this).addClass('current').siblings().removeClass('current');
	    		produceModel(1);
	    		//初始拖拽
	    		initContainer();
	    	});
	    	$(".dragDemo").on("click",'#lan2',function(){
	    		$(this).addClass('current').siblings().removeClass('current');
	    		produceModel(2);
	    		//初始拖拽
	    		initContainer();
	    	});
	    	$(".dragDemo").on("click",'#lan3',function(){
	    		$(this).addClass('current').siblings().removeClass('current');
	    		produceModel(3);
	    		//初始拖拽
	    		initContainer();
	    	});

	    	$(".dragDemo").on("click","#save",function(e) {
	    		e.preventDefault();
	    		var data = downloadLayoutSrc();
	    		var content = JSON.stringify(data);
	    		loading("保存中......");
	    		$.ajax({
					type : 'post',
					url : ctx+'define/app-form-layout!createOrUpdate.json',
					data : {'map.content':content,appDefineId:GetQueryValue('appDefineId')},
					dataType : 'json',
					success : function(data) {
						hide();
						message("保存成功 !");
						try {
							opener.refreshAppGrid();// 弹出的是普通窗口
						} catch (e1) {
							try {
								var parentObj = window.dialogArguments;// 弹出的是模态窗口
								parentObj.refreshAppGrid();
							} catch (e2) {// 有可能父窗口没有这个方法！
							}
						}
					},
					error : function(e) {
						hide();
						error(e);
					}
				});
	    	});

	    	var produceModel = function(col){
	    		var jsonData = downloadLayoutSrc(),newArry=[];
	    		if(jsonData.items[0] && jsonData.items[0].xtype=="form"){
	    			jsonData = jsonData.items[0];
	    		}
	    		var itemArry = pasreItems(jsonData);
	    		var newArry = [];
	    		$.each(itemArry,function(j){
	    			if(itemArry[j]!=undefined){
	    				newArry.push(itemArry[j]);
	    			}
	    		})
	    		var objectItems = common.selectModel(newArry,col);
	    		var jsonStr = content.reEdit(objectItems);
	    		$(".demo").html(jsonStr);
				$.parser.parse($(".demo"));
	    	};

	    	var downloadLayoutSrc = function() {
	    		var jsonObjectData  = content.productSrcCode();
	    		$("#editDiv").hide();
	    		$("#showCode").show();
	    		//console.log(JSON.stringify(jsonObjectData));
	    		return jsonObjectData;
	    	};

	    	var pasreItems = function(opt){
	    		var typeStr = [];
	    		var item = opt.items;
	        	if(item){
	        		for(var j = 0; j< item.length;j++){
	        			if(item[j].columns){
	        				var subItem = item[j].columns;
	        				for(var k = 0 ; k< subItem.length; k++){
	        					typeStr.push(subItem[k].items[0]);
	        				}
	        			}
	        		}
	        	}
	        	return typeStr
	    	};

			//布局拖拽
			$(".lyrow").draggable({
				connectToSortable: ".demo2",
				helper: "clone",
				scroll: true,
				start: function(e,t) {
					if (!startdrag) stopsave++;
					startdrag = 1;
				},
				drag: function(e, t) {
					t.helper.width(400)
				},
				stop: function(e, t) {
					$(".column").sortable({
						opacity: .35,
						connectWith: ".column",
						start: function(e,t) {
							if (!startdrag) stopsave++;
							startdrag = 1;
						},
						stop: function(e,t) {
							if(stopsave>0) stopsave--;
							startdrag = 0;
						}
					});

					if(stopsave>0) stopsave--;
					startdrag = 0;
				}
			});
        };
        return contentmenulist;
});
