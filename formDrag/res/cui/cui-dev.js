( function() {
	
	// Find the script element
	var scripts = document.getElementsByTagName( "script" );
	var script = scripts[ scripts.length - 1 ];
	var path=script.src.substring(0,script.src.lastIndexOf("/")+1);
	
	function includeStyle( url ) {
		document.write( '<script src="' + path + url + '"></script>' );
	}
	// Load the modules
	var modules = [
		"locale-cn", "core", "component", "formelement", "inputbase", "parser", "validate",
		"mouse", "sortable", "draggable", "droppable", "resizable", "selectable", "position", "easing", "grid",
		"gridPivot", "grid.common", "grid.celledit", "grid.inlinedit", "fmatter", "textbox", "toolbar",
		"button", "splitbutton", "menubutton", "treebutton", "panel", "combo", "combobox", "combotree",
		"combogrid", "datepicker", "checkbox", "checkboxlist", "radio", "radiolist", "progressbar", "accordion",
		"dialog", "messager", "form", "tabs", "tree", "layout", "menu", "swfobject", "swfuploader",
		"fileupload", "fileupload.process", "fileuploader", "uploadify", "uploader", "tooltip", "spinner",
		"slider", "easytext", "autocomplete", "autocompletetree", "pinyinData", "pinyinEngine", "loading",
		"config", "subfield", "mousewheel", "splitcontainer", "view", "adjusted"
		, "swfupload"
	];
	if ( modules ) {
		for ( var i = 0; i < modules.length; i++ ) {
			includeStyle( "dev/js/" + modules[ i ] + ".js" );
		}
	}

} )();