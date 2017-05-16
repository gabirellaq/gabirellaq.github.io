require.config( {
	baseUrl: "./",
	paths: {
		jquery: "res/js/jquery-1.9.1.min.js?version=" + Date.now(),
		cui: "res/cui/cui.js?version=" + Date.now(),
		text: "res/requirejs/plugins/text.js?version=" + Date.now(),
		common:"res/js/common.js?version=" + Date.now(),
		content:"modules/content/content.js?version=" + Date.now(),
		proper:"modules/proper/proper.js?version=" + Date.now(),
		tinyscrollbar:"res/js/jquery.tinyscrollbar.min",
		model:"modules/model/model.js?version=" + Date.now(),
		modelist:"modules/model/modelist.js?version=" + Date.now(),
		modelcontent:"modules/model/modelcontent.js?version=" + Date.now(),
		header:"modules/head/header.js?version=" + Date.now(),
		menu:"modules/aside/menu.js?version=" + Date.now(),
		contentmenu:"modules/content/contentMenu.js?version=" + Date.now()

	},
	enforceDefine:true,
	waitSeconds: 0
});


requirejs(['jquery'], function ($) {
	requirejs(['cui','text','tinyscrollbar'], function(cui,text,tinyscrollbar) {
		requirejs([
			"header",
			"menu",
			"proper",
			"content",
			"contentmenu"],
		function(header,menu,prop,content,contentmenu){
			content.load();
			header.load();
			menu.load();			
			prop.load();
			contentmenu.load();

			//初始拖拽功能
			initContainer();
			
		});
	});
});
