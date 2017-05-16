( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./formelement"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*
 * 组件库 4.0 ： 单选框
 * 
 * 依赖 JS 文件 ：
 *    jquery.coral.core.js
 *    jquery.coral.component.js
 */

$.component( "coral.radio", $.coral.formelement , {
	version: "4.0.1",
	castProperties : ["triggers","showRequiredMark","hideRequiredMark","shortCut"],
	options: {
		showStar: true,
		id: null,
		name: null,
		width: "auto",
		height: 24,
		label: "",
		starBefore: false,
		labelField: null,
		disabled: false,
		readonly:false,
		isLabel:false,
		allowCancel: false,
		checked: false,
		required: false,
		isCheck: false,
		value: "",
		errMsg: null,
		errMsgPosition: "leftBottom",
		onValidError: null,
		onValidSuccess: null,
		onClick: null,
		onKeyDown: null,
		onChange: $.noop,  // 参数(event, { checked })
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false // true 则不单独校验
	},
    _create: function() {
    	var that = this,
    		options = this.options;
    	if ( !that.element.jquery ) {
    		that.element = $(that.element);
    	}
    	
    	that.element.addClass("coral-form-element-radio tabbable");
    	that.element.addClass("coral-validation-radio");
    	
    	typeof that.element.attr("id") == "undefined" && !!that.options.id&&that.element.attr( "id", that.options.id );
    	that.options.id = that.element.uniqueId().attr("id");
    	
    	var name = that.element.attr("name");
    	typeof name != "undefined"?(that.options.name = name):(that.element.attr("name", that.options.name));

    	if ( $.trim( that.element.val() ) != "" && $.trim(that.element.val()) != "on" ) {
    		that.options.value = that.element.val();
    	} else if (that.options.value) {
    		that.element.val(that.options.value);
    	}
    	// 便于查找同一个 name 的所单选框
    	that.nameMark = "coral-radio-element-" + that._hashCode( that.options.name );
		that.element.addClass(that.nameMark);
		
		that.uiRadio = $("<span class=\"coral-radio\"></span>");
		that.uiLabel = $("<label class=\"coral-radio-label\" for="+that.options.id+"></label>");
		that.uiIcon = $("<span class=\"coral-radio-icon\"></span>");
		
		that.uiLabel.append(that.uiIcon);		
		if (that.options.label) {
			that.uiLabel.append(that.options.label);
		}
		
		if (that.options.checked) {
			that._getRadios().not(that.element).radio("uncheck");
			that.uiIcon.addClass("cui-icon-radio-checked coral-radio-hightlight");
			that.element.prop("checked", true);
		} else {
			that.uiIcon.addClass("cui-icon-radio-unchecked");
			that.element.prop("checked", false);
		}		
		that.element.after(that.uiRadio);
		that.uiRadio.append(that.element).append(that.uiLabel);
		
		// add label and required star before function @lhb @2015-04-27 add labelField attribute
		if (options.labelField) {
			this.uiLabelField = $("<label class=\"coral-label\">"+ options.labelField +"</label>");
			this.uiRadio.prepend(this.uiLabelField);
			this.uiRadio.addClass("coral-hasLabel");
		}
		// add label and required star before function @lhb @2015-04-27
		if((that.element)[0].checked === true){
			that.originalValue = this.getValue();
		} 
		that._bindEvent();
	},
	reset : function() {
		if ( this.originalValue === "off" || this.originalValue === "") {
			this.uncheck();
		} else {
			this.check();
		}
	},
	// 获取radio name相同的list
	_getRadios: function () {
		var that = this,
			form  = that.element.closest("form");
		
		if ( form.length > 0 ) {
			return form.find($("."+that.nameMark)); 
		} else {
			return $("."+that.nameMark);
		}
	},
	_setDisabled: function(disabled) {
		//this._setOption("disabled", disabled);
		
		if (disabled) {
			this.element.prop("disabled", true);
			this.element.removeClass("tabbable");
			this.uiRadio.addClass("coral-state-disabled");
		} else {
			this.element.prop("disabled", false);
			this.element.addClass("tabbable");
			this.uiRadio.removeClass("coral-state-disabled");
		}
		
		this.options.disabled = (disabled ? true : false);
	},
	_setIsLabel:function(isLabel){
		if (isLabel) {
			this.element.prop("isLabel", true);
			this.uiRadio.addClass("coral-isLabel");
			this.element.removeClass("tabbable");
		} else {
			this.element.prop("isLabel", false);
			this.uiRadio.removeClass("coral-isLabel");
			this.element.addClass("tabbable");
		}	
		this.options.isLabel = !!isLabel;
	},
	_setReadonly:function(readonly){
		if (readonly) {
			this.element.prop("reaonly", true);
			this.uiRadio.addClass("coral-readonly");
			this.element.removeClass("tabbable");
		} else {
			this.element.prop("readonly", false);
			this.uiRadio.removeClass("coral-readonly");
			this.element.addClass("tabbable");
		}	
		this.options.readonly = !!readonly;
	},
	/**
	 * 获取焦点方法
	 */
	focus: function() {
		var that = this;
		if (this.options.disabled || this.options.readonly || this.options.isLabel) return false;
		
		this.element.focus();
		return true;
	},
	_bindEvent: function() {
		var that = this,options = that.options;		
		if ( this.options.disabled ) {
			this._setDisabled(this.options.disabled);
		}
		if (this.options.readonly) {
			this._setReadonly(this.options.readonly)
		}
		if (this.options.isLabel) {
			this._setIsLabel(this.options.isLabel)
		}
		var suppressClick;
		this.element.bind( "focus", function() {
			that.uiRadio.addClass("coral-radio-highlight");
		}).bind( "blur", function() {
			that.uiRadio.removeClass("coral-radio-highlight");
		}).bind( "click", function(event) {
			if (that.options.disabled || that.options.readonly || that.options.isLabel) {
				return ;
			}
			
			if ( suppressClick ) {
				suppressClick = false;
				return ;
			}
			that._clearCheckedState();
			that.uiIcon.removeClass("cui-icon-radio-unchecked");
			that.uiIcon.addClass("cui-icon-radio-checked coral-radio-hightlight");
			that._trigger("onChange", null, [{ checked: !!that.element.prop("checked") }]);
			that._trigger("onClick", null, { checked: !!that.element.prop("checked") });
		}).bind( "keydown" + this.eventNamespace, function(e) {
			if(that.options.allowCancel){
				var keyCode = $.coral.keyCode;
				switch (e.keyCode) {
					case keyCode.SPACE:
						e.preventDefault();
						that._selectItem(e);
						break;
				}
			}
			if(options.shortCut){
				$.coral.callFunction(options.shortCut,event,this);
			}
			that._trigger("onKeyDown", e, {});
		});
		this.uiRadio.bind("mouseenter" + this.eventNamespace, function() {
			if (that.options.disabled) {
				return;
			}
			$(this).addClass("coral-radio-hover");
		}).bind("mouseleave" + this.eventNamespace, function() {
			if (that.options.disabled) {
				return;
			}
			$(this).removeClass("coral-radio-hover");
		});
		this.uiLabel.bind("click" ,function(e){
			//e.preventDefault();
			that._selectItem(e);
		})
	},
	_selectItem: function(e){
		var that = this;
		if ( that.options.readonly || that.options.disabled || that.options.isLabel) {
			return false;
		}
		suppressClick = true;
		that.options.isCheck = $(that.element).prop("checked");
		if ( !that.options.isCheck ) {
			that._clearCheckedState();
			that.uiIcon.removeClass("cui-icon-radio-unchecked");
			that.uiIcon.addClass("cui-icon-radio-checked");
			that.element.prop("checked", true);
			that._trigger("onChange", null, [{ checked: !!that.element.prop("checked") }]);	
		} else {
			if ( !that.options.allowCancel ) {
				//e.preventDefault();
				return ;
			}
			that._clearCheckedState();
			that.uiIcon.addClass("cui-icon-radio-unchecked");
			that.element.prop("checked", false);
			that._trigger("onChange", null, [{ checked: !!that.element.prop("checked") }]);	
		}
	},
	clear: function(){
		
	},
	_clearCheckedState: function(){
		this._getRadios().each(function(){
			$(this).radio("component").find(".coral-radio-icon").removeClass("cui-icon-radio-checked coral-radio-hightlight").addClass(" cui-icon-radio-unchecked");
		});
	},
	// hash code
	_hashCode : function(str) {
		if ( !str ) {
			return 0;
		}	
		str = "" + str;		
		var h = 0, off = 0, len = str.length;        
		for (var i = 0; i < len; i++) { 
        	h = 31 * h  + str.charCodeAt(off++);
        	if ( h > 0x7fffffff || h < 0x80000000) {  
        		h=h & 0xffffffff; 
        	}
        }
		
        return h; 
	},		
	//设置属性处理
	_setOption: function(key, value) {
		//默认属性不允许更改
		if (key === "id" || key === "name") {
			return;
		}
		if (key === "readonly") {
			this._setReadonly(value);
		} 
		if (key ==="isLabel") {
			this._setIsLabel(value);
		}
		if (key === "disabled") {
			this._setDisabled(value);
		} 
		this._super(key, value );
	},
	_destroy: function() {
		this.uiRadio.replaceWith( this.element );
		this.uncheck();// just uncheck not remove the attr value
		this.element.removeClass("coral-form-element-radio");
		this.element.removeClass("coral-validation-radio");
		this.element.removeClass(this.nameMark);
	},
	component: function() {
		return this.uiRadio;
	},
	disable: function() {
		this._setDisabled(true);
	},
	enable: function() {
		this._setDisabled(false);
	},
	show: function() {
		this.component().show();
	},
	hide: function() {
		this.component().hide();
	},
	check: function() {
		var that = this;
		
		if (this.uiIcon.hasClass("cui-icon-radio-unchecked")) {
			that._getRadios().each(function(){
				$(this).radio("component").find(".coral-radio-icon").removeClass("cui-icon-radio-checked coral-radio-hightlight").addClass(" cui-icon-radio-unchecked");
			});
			this.uiIcon.removeClass("cui-icon-radio-unchecked").addClass("cui-icon-radio-checked coral-radio-hightlight");
			this.element.prop("checked", true);
		}		
	},
	uncheck: function() {
		if (this.uiIcon.hasClass("coral-radio-hightlight")) {
			this.uiIcon.removeClass("cui-icon-radio-checked coral-radio-hightlight").addClass("cui-icon-radio-unchecked");
			this.element.prop("checked", false);
		}	
	},
	isChecked: function() {
		return this.element.prop("checked");
	},
	/**
	 * TODO: 待验证是否合理
	 */
	setValue: function(value) {
		if ( "on" === value ) {
			this.check();
		} else {
			this.uncheck();
		}
	},
	getValue: function() {
		return this.getValues().join(",");
	},
	getValues: function() {
		var that = this,
			valArr = [];

		that._getRadios().each(function() {
			var jq = $(this);
			if (jq.radio("isChecked")) {
				valArr.push(jq.val());
			}
		});
		
		return valArr;
	},
	refresh: function() {
		this._destroy();
		this._create();
	}
});
// noDefinePart
} ) );