( function() {
	var modelObject = {};
	define(
			[],
			function(){
				var clearDemo = function() {
					//清空后左侧待选区和隐藏区域内容还原
					$('.demo2 .box').each(function(){
						var dataId = $(this).attr('data-id');
						$('#elmJS .box[data-id="'+dataId+'"]').show();
					});
					$(".demo").empty();
					$(".demo").html("<div class='view' xtype='form'><form id='form1' class='coralui-form'><div class='demo2 ui-sortable'></div></form></div>");
					//初始拖拽功能
					initContainer();
					layouthistory = null;
					//待选区滚动条
					layoutMenuScroll();
					if (supportstorage())
						localStorage.removeItem("layoutdata");
				};
				var configurationElm = function(e, t) {
					$(".demo").delegate(".configuration > a", "click", function(e) {
						e.preventDefault();
						var t = $(this).parent().next().next().children();
						$(this).toggleClass("active");
						t.toggleClass($(this).attr("rel"))
					});
					$(".demo").delegate(".configuration .dropdown-menu a", "click", function(e) {
						e.preventDefault();
						var t = $(this).parent().parent();
						var n = t.parent().parent().next().next().children();
						t.find("li").removeClass("active");
						$(this).parent().addClass("active");
						var r = "";
						t.find("a").each(function() {
							r += $(this).attr("rel") + " "
						});
						t.parent().removeClass("open");
						n.removeClass(r);
						n.addClass($(this).attr("rel"))
					});
				};
				var supportstorage = function() {
//					if (typeof window.localStorage=='object')
//						return true;
//					else
						return false;
				};
				var parseData = function(dataopts){
					var first = null,
					   last  = null,
					   opts  = null,
					   i     = 0,
					   name  = null,
					   value = null,
					   type  = null,
					   dataOpts = {};

					if (dataopts){
						first = dataopts.substring(0,1);
						last  = dataopts.substring(dataopts.length-1,1);
						if (first != '{') dataopts = '{' + dataopts;
						if (last != '}') dataopts = dataopts + '}';
						dataOpts = (new Function('return ' + dataopts))();

					}
					return dataOpts;
				};
				var formatOption = function(opts) {
					delete opts.xtype;
					var itemsOptStr = JSON.stringify(opts),
						itemsOptStr = itemsOptStr.replace("{",""),
						itemsOptStr = itemsOptStr.replace(/\"/g,"'"),
						itemsOptStr = itemsOptStr.substring(0,itemsOptStr.length-1);
					return itemsOptStr;
				};
				var selectModel = function(items,type){
					var itemNumber = items ? items.length:[],
						rows = Math.ceil(itemNumber/type),
						objItem = {},i = 0;
					modelObject.xtype = "form";
					modelObject.items = [];
					objItem.xtype = "row";
					for (var k = 0; k < rows; k++) {
						objItem.columns = [];
						for(var j = 0; j < type; j++){
							var colObj = {};
							colObj.items = [];
							var cls = parseInt(12/type).toString();
							colObj.percent = cls;
							colObj.items.push(items[i]);
							objItem.columns.push(colObj);
							i = i+1;
						}
						var oldItem = $.extend(true, {}, objItem);
						modelObject.items.push(oldItem);
					}
					return modelObject;
				}
				var commonlist ={};
				commonlist.clearDemo = clearDemo;
				commonlist.configurationElm = configurationElm;
				commonlist.supportstorage = supportstorage;
				commonlist.parseData = parseData;
				commonlist.formatOption = formatOption;
				commonlist.selectModel = selectModel;
				return commonlist;
			})

})();