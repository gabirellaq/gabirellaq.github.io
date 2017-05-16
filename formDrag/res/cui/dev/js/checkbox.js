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
// noDefinePart
/*!
 * 组件库4.0：下拉框
 * 
 * 依赖JS文件：
 *    jquery.coral.core.js
 *    jquery.coral.component.js
 */

$.component( "coral.checkbox", $.coral.formelement, {
	version: "4.0.1",
	castProperties : ["triggers","showRequiredMark","hideRequiredMark","shortCut"],
	options: {
		showStar: true,
		id: null,
		name: null,
		value: "",
		label: "",
		maxLabelWidth:"auto",
		labelField: null,
		starBefore: false,
		title: "",//只有设置maxLabelWidth属性的时候会显示title
		width: "auto",
		height: null,
		disabled: false,
		required: false,
		readonly: false,
		isLabel: false,
		checked: false,
		errMsg: null,
		errMsgPosition: "leftBottom",
		onValidError: null,
		onKeyDown: null,
		onValidSuccess: null,
		onChange: $.noop,  /* 参数 ( event, { checked: boolean } ) */
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false // true 则不单独校验
	},
    _create: function() {
    	var that = this,
    		options = this.options,
    		maxLabelWidth = options.maxLabelWidth,
    		label = options.label;
    	that.originalValue = "";
    	if ( !that.element.jquery ) {
    		that.element = $(that.element);
    	}    		
    	
    	that.element.addClass("coral-form-element-checkbox tabbable");
    	that.element.addClass("coral-validation-checkbox");

    	typeof that.element.attr("id") == "undefined" && !!that.options.id&&that.element.attr( "id", that.options.id );
    	that.options.id = that.element.uniqueId().attr("id");
    	
    	var name = that.element.attr("name");
    	typeof name != "undefined"?(that.options.name = name):(that.element.attr("name", that.options.name));
    	
    	if ( $.trim(that.element.val()) != "" && $.trim(that.element.val()) != "on" ) {
    		that.options.value = that.element.val();
    	} else if (that.options.value) {
    		that.element.val(that.options.value);
    	}
    	// 便于查找同一个name的所复选框
    	if (that.options.name) {
    		that.nameMark = "coral-checkbox-element-" + that._hashCode(that.options.name);
    		that.element.addClass(that.nameMark);
    	}    	
    	
		that.uiCheckbox = $("<span class=\"coral-checkbox\"></span>");
		that.uiLabel = $("<label class=\"coral-checkbox-label\" for='"+that.options.id+"'></label>");
		that.uiIcon = $("<span class=\"coral-checkbox-icon\"></span>");
		if ( maxLabelWidth == "auto" ){
			that.uiText = $("<span class=\"coral-checkbox-text\"></span>");
		}else{
			that.uiText = $("<span class=\'coral-checkbox-text\'  title=\'"+label+"\' style=\'max-width:"+maxLabelWidth+"px;\'></span>");
		}
			
		that.uiLabel.append(that.uiIcon);		
		that.uiLabel.append(this.uiText);
		if (that.options.label) {
			that.uiText.append(that.options.label);			
		}		
		if (that.options.title) {
			that.uiLabel.attr("title", that.options.title);
		}
		if (that.options.checked) {
			that.uiIcon.addClass("cui-icon-checkbox-checked coral-checkbox-hightlight");
			that.element.prop("checked", true);
		} else {
			that.uiIcon.addClass("cui-icon-checkbox-unchecked");
			that.element.prop("checked", false);
		}
		
		that.element.after(that.uiCheckbox);
		that.uiCheckbox.append(that.element).append(that.uiLabel);
		// add label and required star before function @lhb @2015-04-27 add labelField attribute
		if (options.labelField) {
			this.uiLabelField = $("<label class=\"coral-label\">"+ options.labelField +"</label>");
			this.uiCheckbox.prepend(this.uiLabelField);
			this.uiCheckbox.addClass("coral-hasLabel");
		}
		if((that.element)[0].checked === true){
			that.originalValue = that.options.value;
		}
		// add label and required star before function @lhb @2015-04-27
		that._bindEvent();
		
		that._trigger("onCreate", null, []);
	},
	reset: function() {
		if ( this.originalValue === "") {
			this.uncheck();
		} else {
			this.check();
		}
	},
	// 获取checkbox name相同的list
	_getCheckboxs: function () {
		var that = this,
			form  = that.element.closest("form");
		
		if (!that.nameMark) return that.element;
		
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
			this.uiCheckbox.addClass("coral-state-disabled");			
		} else {
			this.element.prop("disabled", false);
			this.uiCheckbox.removeClass("coral-state-disabled");
			this.element.addClass("tabbable");
		}
		
		this.options.disabled = ( disabled ? true : false );
	},
	_setReadonly: function(readonly) {
		if (readonly) {
			this.element.prop("readonly", true);
			this.uiCheckbox.addClass("coral-readonly");		
			this.element.removeClass("tabbable");
		} else {
			this.element.prop("readonly", false);
			this.uiCheckbox.removeClass("coral-readonly");
			this.element.addClass("tabbable");
		}	
		this.options.readonly = !!readonly;
	},
	_setIsLabel: function(isLabel){
		if (isLabel) {
			this.element.prop("isLabel", true);
			this.uiCheckbox.addClass("coral-isLabel");	
			this.element.removeClass("tabbable");
		} else {
			this.element.prop("isLabel", false);
			this.uiCheckbox.removeClass("coral-isLabel");
			this.element.addClass("tabbable");
		}	
		this.options.isLabel = !!isLabel;
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
		
		this.element.bind("change", function(event){
			if ($(this).prop("checked")) {
				that.uiIcon.removeClass("cui-icon-checkbox-unchecked ").addClass("cui-icon-checkbox-checked coral-checkbox-hightlight");
			} else {
				that.uiIcon.removeClass("cui-icon-checkbox-checked coral-checkbox-hightlight").addClass("cui-icon-checkbox-unchecked");
			}
			that._trigger("onChange", event, [{ checked: !!that.element.prop("checked") }]);
		}).bind( "focus", function(event) {
			that.uiCheckbox.addClass("coral-checkbox-highlight");
		}).bind( "blur", function() {
			that.uiCheckbox.removeClass("coral-checkbox-highlight");
		}).bind( "keydown" + this.eventNamespace, function(e) {
			if(options.shortCut){
				$.coral.callFunction(options.shortCut,event,this);
			}
			that._trigger("onKeyDown", e, {});
		});
		
		this.uiCheckbox.bind("mouseenter" + this.eventNamespace, function() {
			if (that.options.disabled || that.uiCheckbox.hasClass("coral-checkbox-highlight") || that.uiCheckbox.hasClass("coral-checkbox-highlight")) {
				return;
			}
			$(this).addClass("coral-checkbox-hover");
		}).bind("mouseleave" + this.eventNamespace, function() {
			if (that.options.disabled) {
				return;
			}
			$(this).removeClass("coral-checkbox-hover");
		});
		this.uiLabel.bind("click" ,function(e){
			if (that.options.readonly || that.options.isLabel || that.options.disabled ) {
				return false;
			}
			that._trigger("onClick", e, {});
		});
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
		if (key === "disabled") {
			this._setDisabled(value);
		} 
		if (key ===  "isLabel") {
			this._setIsLabel(value);
		}
		if (key === "label") {
			this.uiText.html(value);
		} 
		if (key ==="maxLabelWidth"){
			var maxLabelWidth = value;
			if ( value != "auto" ){
				maxLabelWidth = maxLabelWidth+"px";
				this.uiText.attr("title",this.options.label);
			} else {
				maxLabelWidth = "";
				this.uiText.attr("title","");
			}
			this.uiText.css("max-width",maxLabelWidth);
		}
		/*if (key === "isLabel") {
			this._setIsLabel(value);
			return;
		}*/
		this._super(key, value);
	},
	_destroy : function() {
		this.uiCheckbox.replaceWith( this.element );
		this.uncheck();
		this.element.removeAttr("value");
		this.element.removeClass("coral-form-element-checkbox");
		this.element.removeClass("coral-validation-checkbox");
		this.element.removeClass(this.nameMark);
	},
	// hash code
	_hashCode : function (str) {
		if (!str) return 0;
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
	component : function() {
		return this.uiCheckbox;
	},
	disable : function() {
		this._setDisabled(true);
	},
	readonly: function(){
		this._setReadonly(true);
	},
	enable : function() {
		this._setDisabled(false);
	},
	show : function() {
		this.component().show();
	},
	hide : function() {
		this.component().hide();
	},
	check: function() {
		if (!this.uiIcon.hasClass("coral-checkbox-hightlight")) {
			this.uiIcon.removeClass("cui-icon-checkbox-unchecked").addClass("cui-icon-checkbox-checked coral-checkbox-hightlight");
			this.element.prop("checked", true);
		}		
	},	
	uncheck : function() {
		if (this.uiIcon.hasClass("coral-checkbox-hightlight")) {
			this.uiIcon.removeClass("cui-icon-checkbox-checked coral-checkbox-hightlight").addClass("cui-icon-checkbox-unchecked");
			this.element.prop("checked", false);
		}	
	},
	isChecked: function() {
		return this.element.prop("checked");
	},
	getValue: function() {
		return this.getValues().join(",");
	},
	getValues : function() {
		var that = this,
			valArr = [];
		
		that._getCheckboxs().each(function() {
			var jq = $(this);
			if (jq.checkbox("isChecked")) {
				valArr.push(jq.val());
			}
		});
		return valArr;
	},
	refresh : function() {
		this._destroy();
		this._create();
	}
});
// noDefinePart
} ) );