var modelnewData= [];
define(
	[
	 	"text!modules/model/modelcontent.html",
	 	"content",
	 	"menu"
	],
	function(modelcontenthtml,content,menu){
		var modelcontentHtml = function(){
			$('.modelcontent').html(modelcontenthtml);
		};
		var modelcontent = {};
		modelcontent.load = function(){
			modelcontentHtml();
			//下一步
			$('#modelnext').button({
				cls:"btn-normal",
				onClick:function(){
					if(!$(".modelcontentArticle").html()){
						$(".demo").wrap("<div class='view' xtype='form'><form id='form1' class='coralui-form' style='height:100%'></form></div>");
						$(".demo").children().remove();
					}
					//面板收起
					$(this).parents('.model').slideUp();
					$('.dragDemo').show();
					//头部设计按钮 和 预览按钮可见
					$('#menuDesign').addClass('current').removeClass('opacity').siblings().removeClass('current');
					$("#menuStart").addClass('opacity');
					$("#menuPreview").removeClass('opacity');
					modelnewData = $("#modelGrid").grid("getRowData");
					waitingData("add",modelnewData);
				}
			});

			$('#model_isShowIntro_checkbox').checkbox({
			    value: "modelshowIntro",
			    label: "显示说明",
			    onChange:function(event,ui){
			    	if(ui.checked == true){
			    		modelintroInit();
			    	}			    	
			    }
			});

			function modelintroInit(){
	    		introJs('.model')
	    			.setOptions({'prevLabel':'&larr; 上一步','nextLabel':'下一步 &rarr;','skipLabel':'跳过','doneLabel':'完成'})
	    			.start();
			}
        };
        return modelcontent;
});
