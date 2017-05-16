( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./core"
			
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
function _parseUI(context, controllerName) {
	var index = -1,
	controllerName = controllerName || null;
	//context = $(context)[0];
	var classNames = String(context.className);
	if (classNames) {
		// 判断是不是组件
		var component = $(context);
		if (!component.attr("component-role")) {
			var classNameArr = classNames.split(" ");
			for (var i = 0, l = classNameArr.length; i < l; i++) {
				var className = classNameArr[i], 
					UI = $.coral.getUI(className);
				if (UI !== -1) {
					var name = className.split("-")[1];
					index = $.inArray(name, $.parser.formPlugins);
					if (component[name]){
						component.removeClass('coralui-' + name);
						if (name == "view") {
							//得到参数，得到参数之后赋值给opts
							controllerName = $.parser.parseOptions(component).controllerName;
						}
						if (controllerName) {
							component.attr("controllerName", controllerName);
						}
						new UI({}, component);
						//component[name]();
						break;
					}
				}
			}
		}
	}
	if( index !== -1) return;
	var children = context.childNodes;
	if (context.getAttribute("data-render") === "false") {
		return;
	}
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeType == 1)
			if (child.parentNode == context)
				_parseUI(child, controllerName);
	}
}
$.parser = {
	auto: true,
	doneArr: [],
	component: [],
	onComplete: function(context){},
	onInit: function(context){},
	plugins:["coralui-tabs","coralui-layout","coralui-grid","coralui-panel",
	         "coralui-button", "coralui-menubutton" , "coralui-treebutton",
	         "coralui-splitbutton", "coralui-accordion","coralui-textbox", 
	         "coralui-autocomplete","coralui-autocompletetree","coralui-uploader", "coralui-radio",
	         "coralui-radiolist","coralui-checkbox", "coralui-checkboxlist",
	         "coralui-spinner","coralui-slider","coralui-combo","coralui-combobox",
	         "coralui-combotree","coralui-combogrid", "coralui-datepicker",
	         "coralui-form","coralui-picgrid","coralui-tree","coralui-toolbar",
	         "coralui-progressbar","coralui-menu","coralui-menubar",
	         "coralui-contextmenu","coralui-slidemenu","coralui-tieredmenu",
	         "coralui-navigatemenu","coralui-dialog","coralui-subfield",
	         "coralui-splitcontainer","coralui-view", "coralui-loading",
	         "coralui-adjusted","fill","coral-adjusted"],
	formPlugins:["grid","button", "menubutton", "textbox", "autocomplete","uploader", "splitbutton",
	             "radio","radiolist","checkbox","checkboxlist","spinner","slider","combo",
		         "combobox","combotree","combogrid","datepicker","tree","progressbar","colorpicker"],
    isElement: function(el) {
    	if (el && el.appendChild) {
			return true;
		}
    	return false;
    },
	parse: function(context){
		if (typeof context == "string") {
			if (!$(context).length) {
				context = document.body;
			}
		}
		if (!context) {
			context = document.body;
		}
		$.parser.onInit.call($.parser, context);
		if (!$.parser.isElement($(context)[0])) {
			context = document.body;
		}
		_parseUI($(context)[0]);
		$.coral.refreshAllComponent(context);
		$.parser.onComplete.call($.parser, context);
		$.each($.parser.doneArr,function(i){
			var fun = $.parser.doneArr.shift();
			if ( $.isFunction(fun) ) {
				fun.call($.parser);
			} else if (fun) {
				var o = fun;
				if ( $.isFunction(o.fun) ) {
					o.fun.call(o.context, o.args);
				}
			}
		});
	},
	/**
	 * parse options, including standard 'data-options' attribute.
	 * 
	 * calling examples:
	 * $.parser.parseOptions(target);
	 * $.parser.parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
	 *  castProperties --options中要转换了属性 格式：["data", "setting.xx.xx", ...]
	 */
	parseOptions: function(target, properties, castProperties){
		var t = $(target),
		    s = $.trim(t.attr('data-options')),
		    first = null,
		    last  = null,
		    opts  = null,
		    i     = 0,
		    name  = null,
		    value = null,
		    type  = null,
		    options = {};
		
		if (s){
			first = s.substring(0,1);
			last  = s.substring(s.length-1,1);
			if (first != '{') s = '{' + s;
			if (last != '}') s = s + '}';
			options = (new Function('return ' + s))();
		}
			
		if (properties){
			opts = {};
			for(var i=0; i<properties.length; i++){
				value = properties[i];
				if (typeof value == 'string'){
					if (value == 'width' || value == 'height' || value == 'left' || value == 'top'){
						opts[value] = parseInt(target.style[value]) || undefined;
					} else {
						opts[value] = t.attr(value);
					}
				} else {
					for(name in value){
						type = value[name];
						if (type == 'boolean'){
							opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
						} else if (type == 'number'){
							opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
						}
					}
				}
			}
			$.extend(options, opts); opts = null;
		}
		if ( castProperties instanceof Array) {
			for (i = 0; i < castProperties.length; i++) {
				name = castProperties[i];
				if (options.controllerName && typeof options[name] == "string" && options[name] !="true" && options[name] !="false") {
					options[name] = options.controllerName + "." + options[name];
				}
				change2object(options, name.split("."), options.controllerName);
			}
		}
		return options;
	}
};
$(function(){
	if (!window.easyloader && $.parser.auto){
		$.parser.parse();
	}
});

/**
 * 把指定属性名的值(字符串)转换为对象
 */
function change2object (obj, keys)  {
	var key = keys.shift();
	if (keys.length == 0) {
		if (obj && obj[key] && typeof obj[key] === "string") {
			try {
				obj[key] = (new Function('return ' + obj[key]))();
			} catch (e) {}
		}
	} else {
		change2object (obj[key], keys);
	}
}
$.parseDone = function(done){
	$.parser.doneArr.push(done);
};
// noDefinePart
} ) );