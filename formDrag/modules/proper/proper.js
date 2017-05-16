(function() {
	var MODULE_PROPER = "modules/proper/proper.html";
	var boolArr = ["readonly","readonlyInput","disabled","isLabel","required","showClose","enablePinyin","enableHighlight","clearOnLoad","forceSelection","iframePanel","enableFilter","enterFilter"];
	var validStr = ["name","data","componentCls","panelComponentCls"];
	var validNum = ["width","panelComponentCls","selectedIndex"];
	var comboArr = ["type","validType","postMode","model"];
	define(
		[
		 	"text!" + MODULE_PROPER,
		 	"common"
		],
		function(prop,common){
			var propHtml = function(){
				$(".prop").html(prop);
			};
			var boxaddClass = function(viewDom,preOptions){
				if(preOptions.fit == true || preOptions.heightStyle == "fill"){
					viewDom.parent().addClass("fill");
				}else if(viewDom.parent().hasClass("fill")){
					viewDom.parent().removeClass("fill");
				}
			};
			var assignOptions = function(conObject,preOptions,eveOptions) {
				var type = conObject.attr("xtype");
				for (var item in preOptions){
					if (preOptions[item] === "") {
						preOptions[item] = null
					}
				}
				//var dataOptions = $.extend(true,preOptions,eveOptions);
				var opts = common.formatOption(preOptions);
				if(type == "textarea") {
					type = "textbox"
				}
				conObject.find(".ctrl-init-"+ type +":first")[type]("option",preOptions);
				conObject.find(".ctrl-init-"+ type +":first").attr("data-options",opts);
			};
			var saveUI = function(){
			    var viewDom = $("#propTabs").data("view");
			    var preOptions = $("#preForm").form("formData");
			    for (var item in preOptions){
			    	if (preOptions[item] === "true") {
			    		preOptions[item] = true
			    	}else if( preOptions[item] === "false") {
			    		preOptions[item] = false
			    	}
			    	if (preOptions[item] === ""){
			    		delete preOptions[item]
			    	}
			    }
			    boxaddClass(viewDom,preOptions)
			    assignOptions(viewDom,preOptions);
			};
			$('body').on("click",".demo2 .viewTarget",function(e) {
	    		e.stopPropagation();
	    		//属性面板右侧划出 tab初始
	    		currenteditor = $(this).parent().parent().children('.view');
	    		var type = currenteditor.attr("xtype");
	    		$('.prop').addClass('propRight');
	    		$('.maindemo,.contentMenu').addClass('propRight');
	    		//$('#propTabs').tabs({});
	    		var editOpts =  getOptions(currenteditor)[0].dataOpts;
	    		var pRenderTo = "fragment-1";
	    		editUI (e,pRenderTo);
	    		$("#preForm").form("load",editOpts);
	           
	    	});
			var editUI  = function(e,pRenderTo){
				$("#"+ pRenderTo).html("");
				var viewDom = $(e.target).closest(".box-element").find(".view:first"),
				    roll = $(e.target).closest(".box-element").find(".view").attr("xtype"),
				    pre ,events ;
				var preForm = {
					xtype : "form",
					id : "preForm",
					renderTo : "#"+pRenderTo,
					items : []
				};
				//将编辑的dom外面的view层的wrapper关联到dialog下面的保存按钮上
				$("#propTabs").data("view",viewDom);
				$.ajax({
					url: "modules/proper/json/prop.json",
					type: "post",
					dataType: "json" ,
					success: function(data, st, xhr) {
						if(data[roll]){
							pre = data[roll][0];
						}
						for ( var item in pre ){
							if($.inArray(item,boolArr) > -1){
								var textJson = {
							    		labelField : item,
							    		xtype : "combobox",
							    		componentCls:"form-control",
							    		data:[{"value":"true","text":"true"},{"value":"false","text":"false"}],
							    		name : item,
							    		value : pre[item]
							    	};
							}else if($.inArray(item,comboArr) > -1){
								var dataArr=[];
								switch (item) {
									case "type":
										dataArr = [{"value":"text","text":"text"},{"value":"password","text":"password"},{"value":"hidden","text":"hidden"}];
										break;
									case "validType":
										dataArr = [{"value":"number","text":"数字"},{"value":"naturalnumber","text":"自然数"},
										           {"value":"integer","text":"整数"},{"value":"float","text":"实数"},
										           {"value":"zh","text":"中文"},{"value":"letter","text":"英文字母"},
										           {"value":"uppercase","text":"大写英文"},{"value":"lowercase","text":"小写英文"},
										           {"value":"zhOrNumOrLett","text":"中文，数字，英文"},{"value":"ip","text":"IP"},
										           {"value":"port","text":"端口号"},{"value":"url","text":"网址"},
										           {"value":"email","text":"电子邮件"},{"value":"mobile","text":"手机号码"},
										           {"value":"idno","text":"身份证号码"},{"value":"zipcode","text":"邮政编码"}];
										break;
									case "postMode":
										dataArr = [{"value":"value","text":"value"},{"value":"text","text":"text"},{"value":"value-text","text":"value-text"}];
										break;
									case "model":
										dataArr = [{"value":"datepciker","text":"日期模式",selected:true},{"value":"timepicker","text":"单独的时间模式"}];
										break;
							    }
								var textJson = {
							    		labelField : item,
							    		xtype : "combobox",
							    		componentCls:"form-control",
							    		data:dataArr,
							    		name : item,
							    		value : pre[item]
							    	};
							}else if($.inArray(item,validStr) > -1){
								var textJson = {
							    		labelField : item,
							    		xtype : "textbox",
							    		name : item,
							    		componentCls:"form-control",
							    		validType:"letter",
							    		value : pre[item]
							    	};
							}else if($.inArray(item,validNum) > -1){
								var textJson = {
							    		labelField : item,
							    		xtype : "textbox",
							    		componentCls:"form-control",
							    		name : item,
							    		//validType:"number",
							    		value : pre[item]
							    	};
							}else{
								if(roll=="datepicker"){
									var validtype="number";
								}else{
									validtype="";
								}
								var textJson = {
							    		labelField : item,
							    		xtype : "textbox",
							    		componentCls:"form-control",
							    		name : item,
							    		validType:validtype,
							    		value : pre[item]
							    	};
							}
					    	preForm.items.push(textJson);
						};
						$.coral.customRender(preForm);
						$("#preForm [component-role='textbox']").textbox({
							onBlur:saveUI
						});
						$("#preForm [component-role='combobox']").combobox({
							onChange:saveUI
						});
						$(".coral-label",$(".prop"))
						var editOpts =  getOptions(viewDom)[0].dataOpts;
						$("#preForm").form("load",editOpts);
					},
					error: function(xhr,st,err) {}
				});
			};
	    	var getOptions = function(conObject) {
	    		var jsonObj = [];
	    		var obj = {},
	    			type = conObject.attr("xtype");
	    		obj.xtype = type;
	    		var dataOpts =conObject.find(".ctrl-init-"+ type +":first").attr("data-options");
	    		obj.dataOpts = common.parseData(dataOpts);
	    		jsonObj.push(obj);
	    		return jsonObj;
	    	};

	    	$('body').on('click','#propdrop',function(e){
	    		e.stopPropagation();
	    		$(this).parents('.prop').removeClass('propRight');
	    		$('.maindemo').removeClass('propRight');
	    	});

			var porplist = {};
			porplist.load = function(){
				propHtml();
				$.ajax({
					url: "modules/proper/json/cnLanguage.json",
					type: "post",
					dataType: "json" ,
					success: function(data, st, xhr) {
						$("#fragment-1").tooltip({
							items: ".coral-label",
			  		   		content: function() {
			  		   		 var name = $(this).html();
			  		   		 return "<div>"+ data[name] +"</div>"
			  		   		},
			  			    position: {
			  			        my: "center top",
			  			        at: "center bottom",
			  			      }
						});
					}
				})
		      };
		    return porplist;
		})
})();