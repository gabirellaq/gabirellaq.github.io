( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*!
 * 组件库4.0：分栏符
 * 
 * 依赖JS文件：
 *    jquery.coral.core.js
 *    jquery.coral.component.js
 */

$.component("coral.subfield", {
	version: "4.0.1",
	options: {
		title : "",
		lineCls : null,
		textCls : null,
		onClick : null
	},
    _create: function () {
    	if (!this.element.jquery) this.element = $(this.element);
    	
    	this.element.addClass("coral-subfield");
    	
    	this.fieldset = $("<fieldset class=\"coral-subfield-fieldset\"></fieldset>").appendTo(this.element);
    	
    	if (this.options.lineCls) {
    		this.fieldset.addClass(this.options.lineCls);
    	}
    	
    	this.legend   = $("<legend class=\"coral-subfield-legend\">" + this.options.title + "</legend>").appendTo(this.fieldset);
    	
    	if (this.options.textCls) {
    		this.legend.addClass(this.options.textCls);
    	}
    	// 
    	this._bindEvent();
	},
	//
	_bindEvent : function () {
		var _this = this;
		this.legend.bind( "click" + this.eventNamespace, function( event ) {
			if ( _this.options.disabled ) {
				event.preventDefault();
				event.stopImmediatePropagation();
			} else {					
				_this._trigger("onClick");
			}
		});
	},
	//设置属性处理
	_setOption: function(key, value) {
		if (key === "title") {
			this.setTitle(value);
		}
	},
	// 
	_destroy : function() {
		this.uiTitle.remove();
	},
	
	component : function() {
		return this.element;
	},
	show : function() {
		this.component().show();
	},
	hide : function() {
		this.component().hide();
	},
	setTitle: function(title) {
		$("legend", this.fieldset).html(title);
		this.options.title = title;
	},
	getTitle : function() {
		return this.options.title;
	}
});
// noDefinePart
} ) );