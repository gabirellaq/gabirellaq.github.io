( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./validate"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component("coral.formelement", {
	version: "4.0.2",
	options: {
		inputLabelGutter: 10//textbox和button之间的间距
	},
	getValidateValue: function() {
		return this.getValue();
	},
	clearError: function() {
		this.component().removeClass("hasErrorIcon coral-validate-error");
		this.component().find(".coral-errorIcon").remove();
		this.element.prop("isError", false);
	},
	addField: function() {
		this.element.addClass( "ctrl-form-element coral-validation-" + this.componentName );
		var that = this;
		var $field = this.element,
			form = $field.closest(".coral-form-default"),//form 初始化好才有coral-form-default这个样式
			formOptions =form.length > 0 ? 
				$.extend( {},$.validate.options, form["form"]("option") ): 
				$.extend( {},$.validate.options );
		if ( 
			// 说明form没有初始化好
			$field.closest(".coral-form-default").length === 0 && 
			// 说明存在form
			$field.closest("form").length > 0 ) return;
		
		var opts = this.options,
			required = opts.required,
			name = opts.name,
			showStar = opts.showStar,
			starBefore = opts.starBefore,
			validTypeOptions = opts.validTypeOptions,
			triggers = opts.triggers || formOptions.triggers[this.componentName] || $.validate.options.triggers[this.componentName];
		
		 // 绑定触发校验的事件
		var events = $.map( triggers, function(item) {
			return that.componentEventPrefix + item + ".field";
        }).join(" ");
		// 绑定组件的校验方法
		$field.off(".field").on( events, function( event, ui ) {
			$.validate.validItem($( this ), event, true);
		});
		$field.off(".focuselement").on( that.componentName + "onkeydown" + ".focuselement", function( e, ui ) {
			var keyCode = $.coral.keyCode,record = 0;
			var fbutton = form.find(".coral-button"),
				button;
			$.each (fbutton,function(i) {
				if (fbutton[i].type == "submit") {
					button = fbutton[i];
				}
			});
			var f = form.find(".tabbable"),
				record = 0;
			var activeElement = document.activeElement,
				isActive;
			$.each (f,function(i) {
				isActive = f[i] === activeElement;
				record = i;
				if (isActive) return false;
			});
			if (isActive && f[record].tagName != "TEXTAREA") {
				if (e.shiftKey) {
					switch (e.keyCode) {
					case keyCode.ENTER:
						//e.preventDefault();
						if (record > 0) {
							f[record - 1].focus();
						} else if ( record == 0 ) {
							if (button) {
								button.focus();
							} else {
								f[f.length - 1].focus();
							}
						}
						break;
					}
				} else {
					switch (e.keyCode) {
					case keyCode.ENTER:
						//e.preventDefault();
						if (record < f.length-1 ) {
							f[record + 1].focus();
						} else if(record == f.length-1) {
							if (button) {
								button.focus();
							} else {
								f[0].focus();
							}
						}
						break;
					}
				}
			}
		});
		// 初始化必输项设置 *
		if ( typeof required === "boolean" && required ) {
			$.validate._changeRequiredMark(this.element, required);
		}
	},
	_setOption: function( key, value ) {
		var that = this,
			opts = this.options;
		this._super( key, value );
		switch(key) {
			case "required":
				$.validate._changeRequiredMark(that.element,value);
				that.clearError();
				break;
			case "isLabel":
			case "readonly":
			case "readonlyInput":
				that.clearError();
				break;
			case "maxlength":
				$.validate.showTooltip(that.element, opts.validTypeOptions);
				break;
			}
	},
	_createLabel: function(){
		var pos = this.options.labelPosition || "left" ,
			labelField = this.options.labelField;
		this._initLabel(pos, labelField);
	},
	_initLabel: function(pos , labelField ){
		this.labelPanel = $("<label class='coral-label ' style='width:100px;position:absolute;' data-pos=" 
				+ pos + ">"+ labelField +"</label>");
		this.labelWraper = this.component();
		this.labelWraper["prepend"](this.labelPanel);
		this._positionLabelPanel(pos);
	},
	_positionLabelPanel: function(direction){
		var width = this.labelPanel.outerWidth();
		this.component().css(
			"padding-" + direction, width
		);
		this.labelPanel.css(direction, 0);
	}
});
// noDefinePart
} ) );