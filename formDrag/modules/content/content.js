var jsonObject = {};
(function() {
	var MODULE_CONTENT = "modules/content/content.html";
	define(
		[
		 	"text!" + MODULE_CONTENT,
		 	"common"
		 ],
		function(content,common){
			var contentHtml = function(){
				$(".content").html(content);
			};
			var loadData = function(data){
				var jsonStr = reEdit(data);
				$(".demo").html(jsonStr);
				$.parser.parse($(".demo"));				
				//初始拖拽功能
				initContainer();
			}
			var reEdit = function(opt){
				var type = opt.xtype || opt.inputType, optStr , itemsOption = {};
				var typeStr = [], item = opt.items;
				switch (type) {
				    case "container":
					    //typeStr.push("<div class='demo ui-sortable'>");
				    	if(item.length){
				    		for(var k = 0; k< item.length;k++){
				    			var str = reEdit(item[k]);
				    			typeStr.push(str);
				    		}
				    		//typeStr.push("</div>");
				    	}
				    	break;
				    case "row":
				    	item = opt.columns;
				    	typeStr.push("<div class='lyrow ui-draggable'>");
				    	typeStr.push('<a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>');
				    	//typeStr.push('<span class="configuration"> </span>');
				    	typeStr.push('<div class="view" xtype="row"><div class="row-fluid clearfix">');
				    	if(item.length){
				    		for(var j = 0; j< item.length;j++){
				    			var subItem = item[j];
				    			typeStr.push('<div class="span'+ subItem.percent+' column ctrl-init ctrl-init-sortable coral-sortable">');
				    			if(subItem.items && subItem.items.length != 0){
				    				var itemSub = item[j].items;
				    				for(var k = 0; k< itemSub.length;k++){
				    					var str = reEdit(itemSub[k]);
				    					typeStr.push(str);
				    				}
				    			}
				    			typeStr.push("</div>");
				    		}
				    		typeStr.push("</div></div></div>");
				    	}
			    		break;
				    case "label":
				    	typeStr.push('<div class="box box-element ui-draggable"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view" xtype="label">');
				    	typeStr.push('<label>Label</label>');
				    	typeStr.push("</div></div>");
				    	break;
				    case "button":
			    		var d = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = d;
				    	typeStr.push('<div class="box box-element ui-draggable" data-id="'+opt["id"]+'"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view" xtype="button">');
				    	typeStr.push('<button class="coralui-button" data-options="'+ optStr +'"/>');
				    	typeStr.push("</div></div>");
				    	break;
			    	case "textarea":
			    		var m = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = m;
				    	typeStr.push('<div class="box box-element ui-draggable" data-id="'+opt["id"]+'"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view viewTarget" xtype="textarea">');
				    	typeStr.push('<textarea class="coralui-textbox" data-options="'+ optStr +'"/>');
				    	typeStr.push("</div></div>");
				    	break;
			    	case "textbox":
			    	case "combobox":
			    	case "combogrid":
			    	case "combotree":
			    	case "autocomplete":
			    	case "autocompletetree":
			    	case "datepicker":
			    		var d = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = d;
				    	typeStr.push('<div class="box box-element ui-draggable" data-id="'+opt["id"]+'"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view viewTarget" xtype="'+ type +'">');
				    	typeStr.push('<input class="coralui-'+ type +'" data-options="'+ optStr +'"/>');
				    	typeStr.push("</div></div>");
				    	break;
			    	case "radio":
			    	case "checkbox":
			    		var d = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = d;
				    	typeStr.push('<div class="box box-element ui-draggable" data-id="'+opt["id"]+'"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view viewTarget" xtype="'+ type +'">');
				    	typeStr.push('<input type='+type +' class="coralui-'+ type +'" data-options="'+ optStr +'"/>');
				    	typeStr.push("</div></div>");
				    	break;
			    	case "radiolist":
			    	case "checkboxlist":
			    		var d = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = d;
				    	typeStr.push('<div class="box box-element ui-draggable" data-id="'+opt["id"]+'"> <a class="remove label label-important"><i class="icon-remove icon-white"></i></a> <span class="drag label"><i class="icon-move"></i></span>')
						//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
						typeStr.push('<div class="view viewTarget" xtype="'+ type +'">');
				    	typeStr.push('<div class="coralui-'+ type +'" data-options="'+ optStr +'"></div>');
				    	typeStr.push("</div></div>");
				    	break;
				    case "form":
				    	var c = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = c;
				    	//typeStr.push('<div class="box box-element ui-draggable"> ')
			    		//typeStr.push('<span class="configuration"> <button type="button" class="btn btn-mini" data-target="#editorModal" role="button">编辑</button></span>')
			    		typeStr.push('<div class="view viewTarget" xtype="form">');
				    	typeStr.push( '<form class="coralui-form" data-options="'+ optStr +'">');
				    	if(item.length){
				    		typeStr.push('<div class="demo2 ui-sortable">')
				    		for(var j = 0; j< item.length;j++){
				    			var subItem = item[j];
			    				var str = reEdit(item[j]);
			    				typeStr.push(str);
				    		}
				    		typeStr.push("</div>");
				    	}else{
				    		typeStr.push('<div class="demo2 ui-sortable"></div>')
				    	}
				    	//typeStr.push("</div></div></form>");
				    	typeStr.push("</div></form>");
				    	break;
				    case "view":
				    	var j = opt.items;
			    		delete opt.items;
				    	optStr = common.formatOption(opt);
				    	opt.items = j;
			    		typeStr.push('<div class="view" xtype="view">');
				    	typeStr.push( '<div class="coralui-view" data-options="'+ optStr +'">');
				       	if(item.length){
				       		typeStr.push('<div class="ui-draggable"><div class="column">')
				    		for(var j = 0; j< item.length;j++){
				    			var subItem = item[j];
			    				var str = reEdit(item[j]);
			    				typeStr.push(str);
				    		}
				    		typeStr.push("</div></div>");
				    	}else{
				    		typeStr.push('<div class="ui-draggable"><div class="column"></div></div>')
				    	}
				    	typeStr.push("</div></div>");
				    	break;
				}
				return typeStr.join("");
			};
			var percentClumn = function(classClumn){
				var str = classClumn.substring(4,classClumn.length+1);
				return str;
			};
			var productSrcCode = function(){
				jsonObject.xtype = "container";
				jsonObject.items = [];
				createJson($(".maindemo")[0], jsonObject.items);
				function createSubItems(context,subItems) {
					var children = context.childNodes;
					for (var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child.nodeType == 1)
							if (child.parentNode == context)
								createJson(child, subItems);
					}
				}
				function createJson(context, items) {
					var obj = {}, arry = [], prop,dataOpts = {}, arryColumn = [],
						subItems = items, islayout = false;
					//context = $(context)[0];
					var classNames = String(context.className);
					arry = classNames.split(" ");
					if (arry[0] == "view") {
						// 判断是不是组件
						var component = $(context),regionType,regionOpt,tabsType,titleNum;
						var attr = component.attr("xtype");
						switch(attr){
							case "row":
								var lyContent = component.children(".row-fluid").children(".column");
								obj.columns = [];
								obj.xtype = attr;
								for (var k = 0; k < lyContent.length; k++) {
									var colObj = {};
									var classClumns = String(lyContent[k].className);
									var classClumn = classClumns.split(" ")[0];
									var cls = percentClumn(classClumn);
									colObj.percent = cls;
									obj.columns.push(colObj);
									subItems = colObj.items = [];
									createSubItems(lyContent[k],subItems);
								};
								items.push(obj);
								islayout = true;
							break;
							case "textarea":
								var lyContent = component.find(".ctrl-init-textbox" +":first"),
					   			s = lyContent.attr("data-options");
							   	if(s){
							   		dataOpts = common.parseData(s);
							   		obj = dataOpts;
							   	}
								obj.xtype = "textarea";
								subItems = obj.items = [];
								items.push(obj);
								break;
							default:
								var lyContent = component.find(".ctrl-init-"+ attr +":first"),
					   			s = lyContent.attr("data-options");
							   	if(s){
							   		dataOpts = common.parseData(s);
							   		obj = dataOpts;
							   	}
								obj.xtype = attr;
								subItems = obj.items = [];
								items.push(obj);
						}
					}
					if(!islayout){
						createSubItems(context,subItems);
					}
				}
				return jsonObject;
			};

			var contentlist = {};
			contentlist.load = function(){
				contentHtml();
		     };
		     contentlist.reEdit = reEdit;
		     contentlist.loadData = loadData;
		     contentlist.productSrcCode = productSrcCode;
		     return contentlist;
		})
})();