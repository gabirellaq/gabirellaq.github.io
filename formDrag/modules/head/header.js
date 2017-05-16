(function() {
	var currenteditor = null;
	var MODULE_HEADER = "modules/head/header.html";
	define(
		[
		 	"text!" + MODULE_HEADER,
		 	"common",
		 	"content"
		 ],
		 function(head,common,content){
			var headerHtml = function(){
				$(".header").html(head);
			};

			$('body').on('click','#dragheadList li',function(){
				var thisId = $(this).attr('id');
				if($(this).hasClass('opacity')){
					return;
				}
				$(this).addClass('current').siblings().removeClass('current');
				//预览
				if(thisId == "menuPreview"){
					$(".dragDemo").removeClass("edit");
		    		$(".dragDemo").addClass("devpreview sourcepreview");
		    		$('.prop,.maindemo,.contentMenu').removeClass('propRight');
				}
				//设计
				if(thisId == "menuDesign"){
	    			$(".dragDemo").removeClass("devpreview sourcepreview");
		    		$(".dragDemo").addClass("edit");
				}
			});

			$('body').on('click','.modelcontentmenu li,.headBtnTeams .headmenuUl li',function(){
				$(this).addClass('current').siblings().removeClass('current');
				var thisClass = $('.modelcontentmenu:visible').find('li.current').attr('data');
				$('[data = "'+ thisClass + '"]').addClass('current').siblings().removeClass('current');
			});

	    	$('body').on("click","[data-target=#isAutoFit]",function(e) {
	    		e.preventDefault();
	    		currenteditor = $(this).closest(".lyrow");
	    		if(!currenteditor.hasClass("fill")){
	    			currenteditor.addClass("fill");
	    		}else{
	    			currenteditor.removeClass("fill");
	    		}
	    	});
	    	$("#savecontent").click(function(e) {
	    		e.preventDefault();
	    		currenteditor.html(contenthandle.getData());
	    	});
	    	
	    	
	    	$(".content-col").on("click",function(){
	    		var colName = $(this).attr("data-col");
	    		alert(colName);
	    	})
	    	$("#layoutGrid").panel({
	    		height:"500",
	    		width:"100%"
	    	});
	    	
	    

	    	$(".dragDemo").on("click","#undo",function(e){
	    		stopsave++;
	    		if (undoLayout()) common.initContainer();
	    		stopsave--;
	    	});
	    	$(".dragDemo").on("click",'#redo',function(){
	    		stopsave++;
	    		if (redoLayout()) common.initContainer();
	    		stopsave--;
	    	});
	    	
	    	
	    	

	    	var redoLayout = function() {
	    		var data = layouthistory;
	    		if (data) {
	    			if (data.list[data.count]) {
	    				window.demoHtml = data.list[data.count];
	    				data.count++;
	    				$('.demo').html(window.demoHtml);
	    				if (common.supportstorage()) {
	    					localStorage.setItem("layoutdata",JSON.stringify(data));
	    				}
	    				return true;
	    			}
	    		}
	    		return false;
	    	};
	    	var undoLayout = function() {
	    		var data = layouthistory;
	    		if (data) {
	    			if (data.count<2) return false;
	    			window.demoHtml = data.list[data.count-2];
	    			data.count--;
	    			$('.demo').html(window.demoHtml);
	    			if (common.supportstorage()) {
	    				localStorage.setItem("layoutdata",JSON.stringify(data));
	    			}
	    			return true;
	    		}
	    		return false;
	    	};
	    	var headerlist = {};
	    	headerlist.load = function(){
	        	headerHtml();
	        };
	        return headerlist;
		})
})();