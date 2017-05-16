var stopsave = 0;
var layouthistory;
var currentDocument = null;
var timerSave = 1000;
var startdrag = 0;
var demoHtml = $(".demo").html();
(function() {
	var MODULE_MENU = "modules/aside/menu.html";
	define(
	    [
	     	"text!" + MODULE_MENU,
	     	"common",
	     	"content"
	    ],
		function(menu,common,content){
	    	var menuHtml = function(){
				$(".aside").html(menu);
			};


			$("body").on("click", ".demo .remove", function(e) {
				e.stopPropagation();
				var dataId = $(this).parent('.box').attr('data-id');
				$('#elmJS .box[data-id="'+dataId+'"]').show();
				$(this).parent().remove();
				layoutMenuScroll();
				$('#propdrop').click();
				return;
			});


			//待选区搜索事件
			$('body').on('click','#navsearchbox > span',function(e){
				e.stopPropagation();
				if($(this).parent().hasClass('open')){
					$(this).parent().removeClass('open');
				}else{
					$(this).parent().addClass('open');
					$(this).parent().children('input').focus();
				}
			});
			//待选区检索事件
			$('body').on('keyup','#navsearchbox > input',function(e){
				e.stopPropagation();
				var text = $(this).val();
				//遍历名称
				$('#elmJS .perName').each(function(){
					if(text == $(this).html()){
						$(this).parents('.box').show();
					}else{
						//$(this).parents('.box').hide();
					}
				});
				//遍历类型
				$('#elmJS .preType').each(function(){
					if(text == $(this).html()){
						$(this).parents('.box').show();
					}else{
						//$(this).parents('.box').hide();
					}
				});
			});



			var restoreData = function(){
				/*if (common.supportstorage) {
					layouthistory = JSON.parse(localStorage.getItem("layoutdata"));
					if (!layouthistory) return false;
					window.demoHtml = layouthistory.list[layouthistory.count-1];
					if (window.demoHtml) $("body .demo").html(window.demoHtml);
				}*/
				/*$.ajax({
					type : 'post',
					url : "modules/aside/json/aside.json",
					data : {appDefineId:GetQueryValue("appDefineId")},
					dataType : 'json',
					success : function(data) {
						content.loadData(data);
					},
					error : function(e) {
						error(e);
					}
				});*/
			};
	    	setInterval(function() {
	    		handleSaveLayout()
	    	}, timerSave);



			var randomNumber = function() {
				return randomFromInterval(1, 1e6)
			};
			var randomFromInterval = function(e, t) {
				return Math.floor(Math.random() * (t - e + 1) + e)
			};
			var gridSystemGenerator = function() {
				$("body .lyrow .preview input").bind("keyup", function() {
					var e = 0;
					var t = "";
					var n = $(this).val().split(" ", 12);
					$.each(n, function(n, r) {
						e = e + parseInt(r);
						t += '<div class="span' + r + ' column"></div>'
					});
					if (e == 12) {
						$(this).parent().next().children().html(t);
						$(this).parent().prev().show()
					} else {
						$(this).parent().prev().hide()
					}
				})
			};
			var handleSaveLayout = function() {
				var e = $("body .demo").html();
				if (!stopsave && e != window.demoHtml) {
					stopsave++;
					window.demoHtml = e;
					saveLayout();
					stopsave--;
				}
			};
			var saveLayout = function(){
				var data = layouthistory;
				if (!data) {
					data={};
					data.count = 0;
					data.list = [];
				}
				if (data.list.length>data.count) {
					for (i=data.count;i<data.list.length;i++)
						data.list[i]=null;
				}
				data.list[data.count] = window.demoHtml;
				data.count++;
				if (common.supportstorage) {
					localStorage.setItem("layoutdata",JSON.stringify(data));
				}
				layouthistory = data;
			};
			var menulist = {};
			menulist.load = function(){
				menuHtml();
		    	//var status = GetQueryValue("status");
		    	var status = "add";
		    	var url;
		    	if(status == "add"){
		    		//防止闪烁
		    		$('.dragDemo').hide();
		    		//当前是开始按钮页面
					$('#menuStart').addClass('current').siblings().addClass('opacity');
		    		//加载选择字段页面
		    		requirejs(['modelist','modelcontent'], function(modelist,modelcontent) {
						modelist.load();
						modelcontent.load();
					});
		    	}
	        	if(status == "edit"){
	        		//开始菜单 选择字段页面 去除
	        		$('#menuStart,.model').remove();
	        		//当前是设计按钮页面
	        		$('#menuDesign').addClass('current');
	        		url = ctx+"define/app-form-field!getUndefineColumns.json?map.appDefineId="+GetQueryValue("appDefineId");
	        		waitingData(status,url);
	        		layoutMenuScroll();
	        	}
	        	restoreData();
		    	gridSystemGenerator();	    	
	        };

	        return menulist;
		});

})()