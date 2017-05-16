( function( factory ) {
if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
// noDefinePart
if (document.documentMode !== undefined ) { // IE only
	if (document.documentMode <= 5) {
		alert("CoralUI can not be used in this ('quirks') mode!");
	}
}
var CoralUIVersion = "4.1.5";
window.Coral = {
	cc: function( componentName, id ){
		$.parser.component.push({componentName: componentName, id: id});
	}
}
window.coral = {};
$.uiplugins = $.uiplugins || {};
coral.eventsQueue = [];
coral.eventsParser = function() {
	$.each(coral.eventsQueue,function(i){
		var o = coral.eventsQueue.shift();
		o.instance._on.apply(o.instance, o.args);
	});
	coral.eventsTimer = null;
} 
coral.render = function(context){
	$(context).attr("data-render", "");
	$.parser.parse(context);
}
var validAction = false;
$.controller = function(controllerName, obj) {
	if (obj) {
		window[controllerName] = window[controllerName] || {};
		return $.extend(true, window[controllerName], obj);
	} else {
		return window[controllerName];
	}
}
$.coralApply = function (fun,t,param){
	var type = $(t).attr("component-role"),opts={};
    if (type){
    	opts = $(t)[type]("option");
    }
	if (opts.controllerName) {
		t = $.controller(opts.controllerName); 
	}
	if ($.isFunction(fun)) {
		return fun.apply(t,param);
	}
};
$.coral = $.coral || {};
$.coral.openTag = true;
$.coral.strictLayout = false;
coral.regSpecialChars = [ "^","$","(",")","[","]","{","}",".","?","+","*","|","\\"];
coral.specialCharsMap = {
		"&": "&amp;", //必须放在第一个,先将&转换了，之后就不会影响到转换后生成的&
		"#":"&#35",//必须放在第二个,先将&转换了，之后就不会影响到转换后生成的& 
        ">" : "&gt;", 
        "<" : "&lt;", 
        "‘":"&lsquo", 
        "’":"&rsquo", 
        ",":"&sbquo", 
        "'":"&#39", 
        "\\":"&#92;", 
        "\"":"&ldquo;", 
        "!":"&#33", 
        "%":"&#37", 
        "~":"&#126", 
        "@":"&#64", 
        "=":"&#61", 
        "(":"&#40", 
        ")":"&#41", 
        "{":"&#123", 
        "}":"&#125", 
        "[":"&#91;", 
        "]":"&#93;", 
        "$":"&#36", 
        "?":"&#63", 
        "*":"&#42;", 
        "|":"&#124;", 
        "^":"&#94;", 
        ".":"&#46;", 
        "+":"&#43;", 
        "/":"&#47;", 
        " ":"&nbsp;" 
	};
$(document).unbind(".clearTips").bind("click.clearTips", function(e){
	if ( validAction ) {
		validAction = false;
		e.stopPropagation();
		return;
	}
	$(".coral-validate-state-error").slideUp(100, function( e ){
		$(this).remove();
	});
	validAction = false;
});

// 鼠标滚动时，重新计算校验提示信息的位置
$(document).unbind("mousewheel").bind("mousewheel", function(e) {
	var validateSuffix = $.validate.validateSuffix();
	
	setTimeout( function() {
		$.each( $(".coral-validate-state-error"), function(idx, item) {
			var className = $(item).attr("class");
			var componentId = className.substring(0, className.indexOf(validateSuffix));
			var $field = $("#"+componentId).find(".ctrl-init");
			var $validator = $field.parents(".coral-validate");
			$(item).remove();
			$validator.validate("validItem", $field, null, true);
		});
	}, 0);
});
//
$.coral.decode = function (value){
	return value;
	var specialCharsMap = coral.specialCharsMap;
	function keyToRegex (key){
		if(isRegexSpecialChar(key)){ 
	        key="\\"+key; 
	    } 
	    var regex = new RegExp(key,"g"); 
	    return regex; 
	}
    function isRegexSpecialChar(character){
		var length = coral.regSpecialChars.length; 
		var ch; 
		for(var index = 0; index < length; index++ ) { 
		    ch = coral.regSpecialChars[index]; 
		    if(character == ch) return true; 
		} 
		return false; 
    }
	if(value==null || value == "") {
		return value; 
	}
	for(var key in specialCharsMap){ 
	    var regex = keyToRegex(key);//有key得到相应的正则表达式 
	    value = value.replace(regex,specialCharsMap[key]);//根据正则表达式来替换相应的内容 
	} 
	return value; 
};
$.coral.encode = function(value){
	return value;
	var specialCharsMap = coral.specialCharsMap;
	if (value == null || value == "" || typeof value != "string"){
		return value;
	}
	for (var key in specialCharsMap){
		var reg = new RegExp(specialCharsMap[key],"g");
		value = value.replace(reg,key);
	}
	return value;
};
$.coral.getStyles = function (el) {
	if(window.getComputedStyle){
		var styles= window.getComputedStyle( el, null );
		return styles;
	}else if(document.documentElement.currentStyle){
		var styles= el.currentStyle;
		return styles;
	}
};
$.coral.fitParent = function ($ele, fit) {
	fit = (fit == undefined ? true : fit);
	//var parent = $ele.parent().closest(".ctrl-fit-element")[0];
	var parent = $ele.parent();
	//parent = $(parent);
	if (fit) {
		if (!parent.hasClass("coral-noscroll")) {
			parent.addClass("coral-noscroll");
			if (parent.attr("tagName") == "BODY") {
				$("html").addClass("coral-panel-fit");
			}
		}
	} else {
		if (parent.hasClass("coral-noscroll")) {
			parent.removeClass("coral-noscroll");
			if (parent.attr("tagName") == "BODY") {
				$("html").removeClass("coral-panel-fit");
			}
		}
	}
	return {
		width: parent.width(),
		height: parent.height()
	};
};
$.coral.getLeft = function ( my, of ) {
	var left = of.offset().left;
	if (left + my.outerWidth() > $(window).outerWidth()
			+ $(document).scrollLeft()) {
		left = $(window).outerWidth() + $(document).scrollLeft()
				- my.outerWidth();
	}
	if (left < 0) {
		left = 0;
	}
	return left;
};
$.coral.getTop = function ( my, of, direction ) {
	var top = of.offset().top + of.outerHeight();
	
	if (direction == "up") {
		top = of.offset().top - my.outerHeight();	
	} else {
		if (top + my.outerHeight() > $(window).outerHeight()
				+ $(document).scrollTop()) {
			top = of.offset().top - my.outerHeight();
		}
		if (top < $(document).scrollTop()) {
			top = of.offset().top + of.outerHeight();
		}		
	}
	
	return top;
};
$.coral.findComponent = function( selector, context ){
	var component = [];
	if ( !selector ){ selector = '.ctrl-init'; }
	var init = $( selector, context );
	var rclass = /[\t\r\n]/g;
	if (init.length){
		$.each(init, function(){
			var name = "",
				className = this.className.replace(rclass, " ").split(" "),
				i = 0,
				l = className.length;
			for ( ; i < l; i++ ) {
				name = $( this ).attr( "component-role" );
				component.push($(this)[name]("instance"));//$().textbox()
				break;
			}
		});
	}
	return component;
};
$.coral.setIsLabel = function(isSet, context) {
	var fields = $.coral.findComponent(".ctrl-form-element", context),
		i = 0, 
		l = fields.length;
	for (i; i < l; i++) {
        var c = fields[i];
        c._setOption("isLabel", isSet);
        if(c.element.hasClass("hasTooltip")) {
        	if(isSet == false) {
        		c.element.tooltip("enable");
        	} else {
        		c.element.tooltip("disable");
        	}
        }
	}
};
$.coral.setIslabel = $.coral.setIsLabel;//旧版本的大小写字母兼容
$.coral.setReadOnly = function(isSet, context){
	var fields = $.coral.findComponent( ".ctrl-form-element", context),
		i = 0, 
		l = fields.length;
	for (i; i < l; i++) {
	    var c = fields[i];
	    c._setOption("readonly", isSet);
	    if(c.element.hasClass("hasTooltip")) {
	    	if(isSet == false) {
	    		c.element.tooltip("enable");
	    	} else {
	    		c.element.tooltip("disable");
	    	}
	    }
	}
};
$.coral.renderComponent = function( context ){
	var component = [];
	var selector = '.coral-no-rendered';
	if ( !context ){ context = 'body'; }
	var init = $( selector, context );
	var rclass = /[\t\r\n]/g;
	if (init.length){
		$.each(init, function(){
			var name = "",
				className = this.className.replace(rclass, " ").split(" "),
				i = 0,
				l = className.length;
			for ( ; i < l; i++ ) {
				name = $( this ).attr( "component-role" );
				rendered = $( this ).prop( "rendered" );
				if ( !rendered ) {
					$( this ).removeClass( "coral-no-rendered" );
					var ins = $(this)[name]("instance");
					$( this ).addClass( "ctrl-init ctrl-init-"+this.componentName );
					ins._create();
					ins._renderComponent();
				}
				break;
			}
		});
	}
	return component;
};
$.coral.parseShortCut = function(options){
	$.coral.addShortCut(options.shortKey,options.callback,options.opts);
}
$.coral.formatOption = function(opts){
	delete opts.xtype;
	var itemsOptStr = JSON.stringify(opts),
		itemsOptStr = itemsOptStr.replace("{",""),
		itemsOptStr = itemsOptStr.substring(0,itemsOptStr.length-1);
	return itemsOptStr;
}
$.coral.customComponent = function(opt){
	var type = opt.xtype,optStr;
	var typeStr = [],item = opt.items;
	switch (type) {
    case "layout":
    	item = opt.regions;
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<div class='coralui-"+ type +"' data-options='"+ optStr +"'>");
    	if(item){
    		for(var j = 0; j< item.length;j++){
    			var subItem = item[j];
    			itemStr = $.coral.formatOption(item[j]);
    			typeStr.push("<div data-options='"+ itemStr +"'>")
    			if(subItem.items){
    				var itemSub = item[j].items;
    				for(var k = 0; k< itemSub.length;k++){
    					var str = $.coral.customComponent(itemSub[k]);
    					typeStr.push(str);
    				}
    			}
    			typeStr.push("</div>");
    		}
    		typeStr.push("</div>");
    	}
    	break;
    case "row": 
    	item = opt.columns;
    	typeStr.push('<div class="row-fluid clearfix">');
    	if(item.length){
    		for(var j = 0; j< item.length;j++){
    			var subItem = item[j];
    			typeStr.push('<div class="span'+ subItem.percent+' column ctrl-init ctrl-init-sortable coral-sortable">');
    			if(subItem.items.length != 0){
    				var itemSub = item[j].items;
    				for(var k = 0; k< itemSub.length;k++){
    					var str = $.coral.customComponent(itemSub[k]);
    					typeStr.push(str);
    				}
    			}
    			typeStr.push("</div>");
    		}
    	}
    	typeStr.push("</div>");
		break;   	
    case "accordion":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<div class='coralui-"+ type +"' data-options='"+ optStr +"'>");
    	if(item){
    		for(var k = 0; k< item.length;k++){
    			var str = $.coral.customComponent(item[k]);
    			typeStr.push(str);
    		}
    	}
    	typeStr.push("</div>");
    	break;
    case "container":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push("<div class='demo ui-sortable ctrl-init ctrl-init-sortable coral-sortable'>");
    	if(item){
    		for(var k = 0; k< item.length;k++){
    			var str = $.coral.customComponent(item[k]);
    			typeStr.push(str);
    		}
    	}
    	typeStr.push("</div>");
    	break;
    case "tree":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push("<ul class='coralui-"+ type +"' data-options='"+ optStr +"'/>");
    	break;
    case "grid":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push("<div class='coralui-"+ type +"' data-options='"+ optStr +"'/>");
    	break;
    case "form":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push("<form class='coralui-form' data-options='"+ optStr +"'>");
    	if(item){
    		typeStr.push('<div class="ui-draggable"><div class="column">')
    		for(var j = 0; j< item.length;j++){
    			var subItem = item[j];
				var str = $.coral.customComponent(item[j]);
				typeStr.push(str);
    		}
    		typeStr.push("</div></div>");
    	}else{
    		typeStr.push('<div class="ui-draggable"><div class="column"></div></div>')
    	}
    	typeStr.push("</form>");
    	break;
    case "textbox":
    case "combobox":
    case "combogrid":
    case "combotree":
    case "radio":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<input class='coralui-"+ type +"' data-options='"+ optStr +"'/>");
    	break;
    case "textarea":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<textarea class='coralui-textbox" + "' data-options='"+ optStr +"'/>");
    	break;
    case "button":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<button class='coralui-"+ type +"' data-options='"+ optStr +"'/>");
    	break;
    case "toolbar":
    case "progressbar":
    	optStr = $.coral.formatOption(opt);
    	typeStr.push( "<div class='coralui-"+ type +"' data-options='"+ optStr +"'/>");
    	break;
    case "view":
    	var items = opt.items;
    	delete opt.items;
    	optStr = $.coral.formatOption(opt);
    	opt.items = items;
    	typeStr.push( "<div class='coralui-"+ type +"' data-options='"+ optStr +"'>");
    	if(item.length){
    		for(var k = 0; k< item.length;k++){
    			var str = $.coral.customComponent(item[k]);
    			typeStr.push(str);
    		}
    	}
    	typeStr.push("</div>");
    	break;
	}
	return typeStr.join("");
};
$.coral.customRender = function(opt){
	var str = "";
	str = $.coral.customComponent(opt);
	var $element = $(opt.renderTo || "body").html(str);
	$.parser.parse($element);
};
$.coral.callFunction = function(shortCut,e,that){
	var shortcut_combination,callback,opt;
	var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
	}
	if(shortCut instanceof Array){
		for(var j = 0; j<shortCut.length; j++){
			shortcut_combination = shortCut[j].shortKey;
			callback = shortCut[j].callback;
			opt = shortCut[j].opts;
			if(!opt) opt = default_options;
			shortKey(shortcut_combination,callback,opt,e,that);
		}
	} else {
		shortcut_combination = shortCut.shortKey;
		callback = shortCut.callback;
		opt = shortCut.opts;
		if(!opt) opt = default_options;
		shortKey(shortcut_combination,callback,opt,e,that);
	}
	function shortKey(shortcut_combination,callback,opt,e,that){
		shortcut_combination = shortcut_combination.toLowerCase();
		e = e || window.event;
		if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
			var element;
			if(e.target) element=e.target;
			else if(e.srcElement) element=e.srcElement;
			if(element.nodeType==3) element=element.parentNode;

			if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
		}
		//Find Which key is pressed
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		var character = String.fromCharCode(code).toLowerCase();
		
		if(code == 188) character=","; //If the user presses , when the type is onkeydown
		if(code == 190) character="."; //If the user presses , when the type is onkeydown

		var keys = shortcut_combination.split("+");
		//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
		var kp = 0;
		
		//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
		var shift_nums = {
			"`":"~",
			"1":"!",
			"2":"@",
			"3":"#",
			"4":"$",
			"5":"%",
			"6":"^",
			"7":"&",
			"8":"*",
			"9":"(",
			"0":")",
			"-":"_",
			"=":"+",
			";":":",
			"'":"\"",
			",":"<",
			".":">",
			"/":"?",
			"\\":"|"
		}
		//Special Keys - and their codes
		var special_keys = {
			'esc':27,
			'escape':27,
			'tab':9,
			'space':32,
			'return':13,
			'enter':13,
			'backspace':8,

			'scrolllock':145,
			'scroll_lock':145,
			'scroll':145,
			'capslock':20,
			'caps_lock':20,
			'caps':20,
			'numlock':144,
			'num_lock':144,
			'num':144,
			
			'pause':19,
			'break':19,
			
			'insert':45,
			'home':36,
			'delete':46,
			'end':35,
			
			'pageup':33,
			'page_up':33,
			'pu':33,

			'pagedown':34,
			'page_down':34,
			'pd':34,

			'left':37,
			'up':38,
			'right':39,
			'down':40,

			'f1':112,
			'f2':113,
			'f3':114,
			'f4':115,
			'f5':116,
			'f6':117,
			'f7':118,
			'f8':119,
			'f9':120,
			'f10':121,
			'f11':122,
			'f12':123
		}

		var modifiers = { 
			shift: { wanted:false, pressed:false},
			ctrl : { wanted:false, pressed:false},
			alt  : { wanted:false, pressed:false},
			meta : { wanted:false, pressed:false}	//Meta is Mac specific
		};
	                
		if(e.ctrlKey)	modifiers.ctrl.pressed = true;
		if(e.shiftKey)	modifiers.shift.pressed = true;
		if(e.altKey)	modifiers.alt.pressed = true;
		if(e.metaKey)   modifiers.meta.pressed = true;
	                
		for(var i=0; k=keys[i],i<keys.length; i++) {
			//Modifiers
			if(k == 'ctrl' || k == 'control') {
				kp++;
				modifiers.ctrl.wanted = true;

			} else if(k == 'shift') {
				kp++;
				modifiers.shift.wanted = true;

			} else if(k == 'alt') {
				kp++;
				modifiers.alt.wanted = true;
			} else if(k == 'meta') {
				kp++;
				modifiers.meta.wanted = true;
			} else if(k.length > 1) { //If it is a special key
				if(special_keys[k] == code) kp++;
				
			} else if(opt['keycode']) {
				if(opt['keycode'] == code) kp++;

			} else { //The special keys did not match
				if(character == k) kp++;
				else {
					if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
						character = shift_nums[character]; 
						if(character == k) kp++;
					}
				}
			}
		}
		
		if(kp == keys.length && 
					modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
					modifiers.shift.pressed == modifiers.shift.wanted &&
					modifiers.alt.pressed == modifiers.alt.wanted &&
					modifiers.meta.pressed == modifiers.meta.wanted) {
			callback.apply(that?that.element:e,[e]);

			if(!opt['propagate']) { //Stop the event
				//e.cancelBubble is supported by IE - this will kill the bubbling process.
				e.cancelBubble = true;
				e.returnValue = false;

				//e.stopPropagation works in Firefox.
				if (e.stopPropagation) {
					e.stopPropagation();
					e.preventDefault();
				}
				return false;
			}
		}
	}
};

var all_shortcuts = {};
function shortCutOuter(shortCut) {
	var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
	}
	var shortcut_combination = shortCut.shortKey,
		opt = shortCut.opts;
	if(!opt) opt = default_options;
	var ele = opt.target;
	if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
	var ths = this;
	var func = function(e) {
		$.coral.callFunction(shortCut);
	}
	all_shortcuts[shortcut_combination] = {
			'callback':func, 
			'target':ele, 
			'event': opt['type']
	};
	//Attach the function with the event
	if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
	else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
	else ele['on'+opt['type']] = func;
}
$.coral.addShortCut = function(shortCut){
	var i;
	if(shortCut instanceof Object){
		for(i = 0; i<shortCut.length; i++){
			shortCutOuter(shortCut[i]);
		}
	}
};
$.coral.removeShortCut = function(shortcut_combination,trigger){
	shortcut_combination = shortcut_combination.toLowerCase();
	var binding = all_shortcuts[shortcut_combination];
	delete(all_shortcuts[shortcut_combination])
	if(!binding) return;
	var type = binding['event'];
	var callback = binding['callback'];
	if(trigger) {
		var ele = $(trigger);
	}else {
		var ele = binding['target'];
	}
	if(ele.detachEvent) ele.detachEvent('on'+type, callback);
	else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
	else ele['on'+type] = false;
};
$.coral.valid = {};
$.coral.valid = function( element/*, hasErrorTips*/ ) {
	validAction = true;
	var count = 0,
		excluded = $.data(element, "excluded"),
		validElements = element.find($("[class*='coral-validation-']")),
		errTipsType = null,
		hasErrorTips = true;
	
	 if ( excluded && "string" === typeof excluded ) {
         // Convert to array first
         excluded = $.map( excluded.split( ',' ), function( item ) {
             // Trim the spaces
             return $.trim( item );
         });
     }
	 if ( "form" === element[0].tagName.toLowerCase() ) {
		 errTipsType = element.form("option", "errTipsType");		 
	 }
	 
	 validElements.each( function () {
		 var className = this.className, 
			 coralType = "",
			 clsArray = className.split(" ");
			 
		 for ( var item in clsArray ) {
			 if ( clsArray[item].indexOf( "coral-validation-" ) >=  0 ) {
				 coralType = clsArray[item].substr( clsArray[item].indexOf( "coral-validation-" ) + 17 );
				 break;
			 }
		 }
		 // 如果在排除范围内，则返回，不校验
		 if ( _isExclud( $( this )[coralType]("component"), excluded) ) {
    		 return ;
    	 }
		 if ( "none" === errTipsType ) {
			 hasErrorTips = false;
		 }
		 if ( !_valid( $( this ), coralType, hasErrorTips ) ) {
			 if ( "first" === errTipsType ) {
				 hasErrorTips = false;
			 }
			 ++ count;
		 }
	 });
	 
	 if ( count > 0 ) {
		 return false;
	 } else {
		 return true;
	 }
	
     function _isExclud( $component, excluded ) {
    	 if ( !excluded ) {
    		 return false;
    	 }
    	 
    	 var length = excluded.length;
         
    	 for ( var i = 0; i < length; i++ ) {
             if ( "string" === typeof excluded[i] && $component.is(excluded[i]) ){
                 return true;
             }
         }
    	 
    	 return false;
     }
     
     function _valid( $element, coralType, hasErrorTips ) {    	 
    	 if ( "datepicker" == coralType ) {
    		 return $element[coralType]( "valid", $element, hasErrorTips );
    	 }
    	 // 如果不在上面的列中，则默认通过校验
    	 if ( $.inArray( coralType, ["textbox", "combobox", "combotree", "radio", "radiolist", "checkbox", "checkboxlist"] ) > -1 ) {
    		 return $element[coralType]( "valid", hasErrorTips );
    	 }
     }      
}

jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

var uuid = 0,
	runiqueId = /^coral-id-\d+$/;

// $.coral might exist from components with no dependencies, e.g., $.coral.position


$.extend( $.coral, {
	version: "4.0.3",
	
	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	},
	zindex : 1000
});
// plugins
$.fn.extend({
	scrollParent: function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	},
	
	uniqueId: function(prefix) {
		return this.each(function() {
			if ( !this.id ) {
				if (prefix) {
					prefix += "-";
				} else {
					prefix = "";
				}
				this.id = prefix + "coral-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	},
	closestComponent: function(selector){
		return this.each(function() {
			$( this ).closest( ".ctrl-init-" + selector );
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.coral.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),
	
	disableSelection: (function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.bind( eventType + ".coral-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	})(),

	enableSelection: function() {
		return this.unbind( ".coral-disableSelection" );
	},
	
	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

$.extend( $.coral, {
	// $.coral.plugin is deprecated. Use $.component() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.coral[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args, allowDisconnected ) {
			var i,
				set = instance.plugins[ name ];
			
			if ( !set ) {
				return;
			}
			if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
				return;
			}
			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	/**
	 * qiucs @2014.7.18
	 * 在window对象中获取指定函数(字符串)
	 */
	toFunction : function (fn) {
		var ns = null, i = 0, _fn = null;//不再设置为function，否则无法判断此function是否是undefined
		if ($.isFunction(fn)) {
			return fn;
		}
		if (typeof fn === "string") {
			// 1. 没有多层命名空间
			if ($.isFunction(window[fn])) {
				return window[fn];
			}
			// 2. 多层命名空间的有运算的
			try {
				_fn = eval("(" + fn + ")");
				if ($.isFunction(_fn)) {
					return _fn;
				}
			} catch (e) {}
			// 3. 多层命名空间无运算的	
			if (fn.indexOf(".") > 0) {
				ns = fn.split(".");
				_fn = window[ns[0]];
				if (!_fn) return null;
				for (i = 1; i < ns.length; i ++) {
					_fn = _fn[ns[i]];
					if (!_fn) return null;
				}
			}
			return _fn;
		}
		
		return fn;
	}
});

$.extend({
	/**
	 * qiucs @2014.7.23
	 * 通过url获取JSON对象
	 */
	loadJson : function (url, params) {
		var data = null;
		$.ajax({
			url : url,
			type: "get",
			dataType : "json",
			async : false,
			data : params,
			success : function(rlt) {
				data = rlt;
			},
			error : function (req, error, errThrow) {
				$.error("function load json error: " + error);
			}
		});
		return data;
	},
	/**
	 * qiucs @2014.9.18
-	 * 判断当元素是否为coral组件
-	 * @param elem 元素
-	 * @param type 组件类型，如 button/comobobox/ panel/ ...
	 */
	isCoral : function (elem, type) {
		if (arguments.length < 2 || !elem) return false;
		if (elem.jquery) elem = elem.get(0);
		return !!$.data(elem, "coral-" + type);
	}
});
function _refreshAllComponent(parent) {
	if( typeof(parent)=="undefined" ) {
		parent = "body";
	}
	var tag = parent.tagName ? parent.tagName.toLowerCase() : "";
	parent = $(parent)[0];
	if (parent.style.display == "none" || 
			tag == "style" ||
			tag == "script") {
		return;
	}
	var children = parent.childNodes;
	var componentId = $(parent).attr("component-id"),
		$ele = $("#" + componentId),
		type = $ele.attr("component-role");
	if (!componentId) {
		for (var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			if (child.nodeType == 1) {
				if (child.parentNode == parent ){
					_refreshAllComponent(child)
				}
			}
		}
	} else {
		if (typeof(type)==='undefined') return;
		if ($.inArray(type, $.coral.formPlugins)!==-1) {
			return;
		}
		if (type == "panel") {
			$ele[type]("resizePanel");
		} else {
			$ele[type]("refresh");
		}
	}
}
function _refreshChild(context) {
	var context = $(context)[0];
	var children = context.childNodes;
	for (var i = 0, l = children.length; i < l; i++) {
		var child = children[i];
		if (child.nodeType == 1) {
			if (child.parentNode == context ){
				_refreshAllComponent(child)
			}
		}
	}
}
$.extend( $.coral, {
	beforeDoOverflow: function(){},
	scriptPath: function(){
		var scripts = document.getElementsByTagName( 'script' );
		var script = scripts[ scripts.length - 1 ];
		var path=script.src.substring(0,script.src.lastIndexOf("/")+1);
		return path;
	}(),
	contextPathFun : function () {
		//获取当前网址，如： http://localhost:8080/coral/meun.jsp
		var curWwwPath=window.document.location.href;
		//获取主机地址之后的目录，如：coral/meun.jsp
 	    var pathName=window.document.location.pathname;
 	    var pos=curWwwPath.indexOf(pathName);
	    //获取主机地址，如： http://localhost:8083
 	    var localhostPaht=curWwwPath.substring(0,pos);
	    //获取带"/"的项目名，如：/coral
 	    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
 	    return projectName;
	},
	adjustedUI : function(element){
		var maxHeight,
		$element = $(element),
		parent = $element.parent();
		
		maxHeight = parent.height();
		$element.siblings( ":visible" ).each(function() {
			var elem = $( this ),
				position = elem.css( "position" );

			if ( position === "absolute" || position === "fixed" ) {
				return;
			}
			maxHeight -= elem.outerHeight( true );
		});
		$element.height( Math.max( 0, maxHeight - $element.innerHeight() + $element.height() ) )
			//.css( "overflow", "auto" );//
			.addClass("coral-scroll");
		var id = $element.uniqueId("coral-adjuested").attr("id");
		$element.attr("component-id", id);
		$element.attr("component-role", "adjusted");
		$.coral.refreshAllComponent(element);
		//$.coral.fitParent(parent, true);
	},
	/***
	 * com: compoent
	 * pCom: parent
	 */
	isFit: function(com, pCom){
		// closetParentComponent
		var closestPCom = $(com).parent().closest(".ctrl-fit-element");
		if (!closestPCom.length) {
			closestPCom = $("body");
		}
		// 如果找到的直接父组件（closestPCom）与传进来的父容器（pCom）相等，
		// 或者父容器（pCom）由直接父组件提供（closestPCom），
		// 则判断为是最佳自适应时机
		var isBestFit = closestPCom.length && ( closestPCom[0] === $(pCom)[0] || closestPCom.find( pCom ).length );
		return isBestFit;
	},
	formPlugins:["button", "menubutton", "textbox", "autocomplete", "autocompletetree","uploader", "splitbutton",
	             "radio","radiolist","checkbox","checkboxlist","spinner","slider","combo","fileuploader",
		         "combobox","combotree","combogrid","datepicker","tree","progressbar"]
	,
	getUI: function(name) {
		if ($.uiplugins[name]) {
			return $.uiplugins[name];
		} else {
			return -1;
		}
	},
	refreshChild: function (context) {
		_refreshChild(context);
	},
	/**
	 * refresh all the coral comonent to adjusted container 
	 **/
	refreshAllComponent : function (parent) {
		_refreshAllComponent(parent);
	}
});
$.coral.contextPath = $.coral.contextPathFun.apply();

$.fn.caret = function(pos) {
    var target = this[0];
	var isContentEditable = target.contentEditable === 'true';
    //get
    if (arguments.length == 0) {
    	//HTML5
    	if (window.getSelection) {
    		//contenteditable
	        if (isContentEditable) {
	        	target.focus();
	        	var range1 = window.getSelection().getRangeAt(0),
	        		range2 = range1.cloneRange();
				range2.selectNodeContents(target);
				range2.setEnd(range1.endContainer, range1.endOffset);
				return range2.toString().length;
	        }
	        //textarea
	        return target.selectionStart;
	      }
    	//IE<9
    	if (document.selection) {
    		target.focus();
    		//contenteditable
    		if (isContentEditable) {
    			var range1 = document.selection.createRange(), 
    		  		range2 = document.body.createTextRange();
	    		  range2.moveToElementText(target);
	    		  range2.setEndPoint('EndToEnd', range1);
	    		  return range2.text.length;
    		}
	    	  //textarea
	    	  var pos = 0,
	    	  	range = target.createTextRange(),
	            range2 = document.selection.createRange().duplicate(),
	            bookmark = range2.getBookmark();
	    	  range.moveToBookmark(bookmark);
	    	  while (range.moveStart('character', -1) !== 0) pos++;
	    	  return pos;
    	}
    	// Addition for jsdom support
    	if (target.selectionStart)
    		return target.selectionStart;
    	//not supported
    	return 0;
    }
    //set
    if (pos == -1)
    	pos = this[isContentEditable? 'text' : 'val']().length;
    //HTML5
    if (window.getSelection) {
    	//contenteditable
    	if (isContentEditable) {
    		target.focus();
    		window.getSelection().collapse(target.firstChild, pos);
    	}
    	//textarea
    	else
    		target.setSelectionRange(pos, pos);
    }
    //IE<9
    else if (document.body.createTextRange) {
    	if (isContentEditable) {
    		var range = document.body.createTextRange();
    	  		range.moveToElementText(target);
	  		range.moveStart('character', pos);
	  		range.collapse(true);
	  		range.select();
    	} else {
	    	  var range = target.createTextRange();
	    	  range.move('character', pos);
	    	  range.select();
    	}
    }
    if (!isContentEditable)
    	target.focus();
    return pos;
}
// noDefinePart
} ) );