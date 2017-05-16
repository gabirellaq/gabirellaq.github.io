( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./button",
			"./formelement"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component("coral.inputbase", $.coral.formelement, {
	version: "4.0.2",
	options: {
		inputButtonGutter: 5//textbox和button之间的间距
	},
	setAtrr: function() {
		var attrs = [ "id", "name", "value", "component-role", "data-options"];
		for(var i=0; i<attrs.length; i++){
			if (this.element.attr(attrs[i])) {
				this.textboxInput.setAttribute(attrs[i], this.element.attr(attrs[i]));
			}
		}
	},
	createInput: function() {
		
		var comboArrow = "", clearIcon="", name="", type="";
		if(this.options.hasArrow == true){
			if (this.options.showDirection == "down") {
				comboArrow = "<span class='coral-combo-arrow coral-icon-arrow cui-icon-arrow-down3'></span>";
			} 
			if (this.options.showDirection == "up") {
				comboArrow = "<span class='coral-combo-arrow coral-icon-arrow cui-icon-arrow-up3'></span>";
			} 
		}
		if ("hidden" !== this.element.attr("type") && 
				"file" !== this.element.attr("type") && 
				"password" !== this.element.attr("type") && 
				"text" !== this.element.attr("type") && 
				"INPUT" == this.element[0].tagName.toUpperCase() ) {
			type = "text";
		} else {
			type = this.element.attr("type");
			if(!type){
				type = "text";
			}
		}
		// 删除图标
		if ( this.options.showClose && !this.options.required) {
			clearIcon = "<span class='coral-input-clearIcon cui-icon-cross2'></span>";
		}
		var ele = "<input type=\""+ type +"\" class=\""+ this.className +"\" autocomplete=\"off\"/>";
		if (this.element[0].tagName == "TEXTAREA"){
			ele = "<textarea type='textarea' class='"+ this.className+"'/>"+this.element.text()+"</textarea>";
		}
		ele = "<span class='coral-textbox-border coral-corner-all "+ this.classBorder +"'>"+ ele + clearIcon + comboArrow +"</span>"
		ele += "<input name=\"" + name + "\" type='hidden'  class=\"" + this.hiddenClass + "\"/>";
		
		this.textboxWrapper = document.createElement("span");
		this.textboxWrapper.className = this.compClass;
		this.textboxWrapper.innerHTML = ele;
		this.elementBorder = this.textboxWrapper.firstChild;
		this.textboxInput = this.elementBorder.firstChild;
		this.clearIcon = $(this.textboxInput.nextSibling);
		this.setAtrr();
		this.cloneCopyEvent(this.element[0], this.textboxInput);
		var parent = this.element[0].parentNode;
		if (parent && this.textboxWrapper != this.element[0])
			parent.replaceChild(this.textboxWrapper, this.element[0]);
		//this.element.replaceWith(this.textboxWrapper);
		//this.prepareCreate(this.textboxInput);
	},
	cloneCopyEvent: function( src, dest ) {

		if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
			return;
		}

		var type, i, l,
			oldData = jQuery._data( src ),
			curData = jQuery._data( dest, oldData ),
			events = oldData.events;

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}

		// make the cloned public data object a copy from the original
		if ( curData.data ) {
			curData.data = jQuery.extend( {}, curData.data );
		}
	},
	_setOption: function( key, value ) {
		var that = this;
		this._super( key, value );
		this.component().find(".button").each(function(){
			var type = $(this).attr("data-pos");
			var arr = type.split("_");
			// 设置isLabel后，需要控制附带按钮的隐藏与显示，输入框的padding的控制。
			if ( key === "isLabel" ) {
				if (value) {
					$(this).hide();
					if (arr[0] == "outer") {
						that.component().css("padding-" + arr[1], 0);
					} else {
						that.component().find(".coral-textbox-border").css("padding-" + arr[1],0);
					}
				} else {
					$(this).show();
					var width = $(this).outerWidth();
					if (arr[0] == "outer") {
						that.component().css("padding-" + arr[1], width + that.options.inputButtonGutter );
					} else {
						that.component().find(".coral-textbox-border").css("padding-" + arr[1], width);
					}
				}
			}
			// readonly disable isLabel需要控制按钮的禁用与启用
			if ( key === "readonly" || key === "disable" || key==="isLabel"){
				var $buttons = $(this).find(".ctrl-init-button");
				if(value){
					$buttons.button("disable");
				} else {
					$buttons.button("enable");
				}
			}
		});
	},
	_outerButtons: function() {
		this.uiDialogOuterButtonPanel = $("<span class='coral-outerbuttonset coral-outer coral-corner-all'></span>");
		this.component().append(this.uiDialogOuterButtonPanel);
		this._createtoolPanelItems(this.options.buttonOptions, null, this.uiDialogOuterButtonPanel, null, "button");
		this.component().css("padding-right", this.uiDialogOuterButtonPanel.outerWidth() + 8);
	},
	_createButtonPanel: function() {
		var is = false,
			i,
			direction = "right",
			pos = "inner",
			key = "innerRight",
			opermethod = "prepend",
			buttons = this.options.buttons;
		for (i=0; i < this.options.buttons.length;i++) {
			if (buttons[i]["innerLeft"]) {
				key = "innerLeft";
				direction = "left";
				is = true;
			}
			if (buttons[i]["innerRight"]) {
				key = "innerRight";
				direction = "right";
				opermethod = "append";
				is = true;
			}
			if (buttons[i]["outerRight"]) {
				key = "outerRight";
				direction = "right";
				pos = "outer";
				opermethod = "append";
				is = true;
			}
			if (buttons[i]["outerLeft"]) {
				key = "outerLeft";
				direction = "left";
				pos = "outer";
				is = true;
			}
			if (buttons[i]["floatRight"]) {
				key = "floatRight";
				pos = "float";
				opermethod = "append";
				is = true;
			}
			if (buttons[i]["floatLeft"]) {
				key = "floatLeft";
				direction = "left";
				pos = "float";
				is = true;
			}
			var button = buttons[i][key]?buttons[i][key][0]:buttons[i];
			if (button.type && button.type == "combobox") {
				this._initToolPanel(pos, key, direction, opermethod, i, "combobox");
			} else if (is) {
				this._initToolPanel(pos, key, direction, opermethod, i, "button");
			}
		}
		// 兼容buttons的旧的构造方法
		if (!is) {
			this.uiDialogButtonPanel = $("<span class='button " + key + " coral-textbox-btn-icons coral-buttonset coral-corner-" 
				+ direction+ "' data-pos=" + pos + "_" + direction + "></span>"); 
			this._createtoolPanelItems(this.options.buttons, direction , this.uiDialogButtonPanel, pos, "button");
			this.elementBorder.append(this.uiDialogButtonPanel);
			this.elementBorder.css("padding-right", this.uiDialogButtonPanel.outerWidth());
			this.uiDialogButtonPanel.css("right", 0);
			this.rightPos = this.uiDialogButtonPanel.outerWidth();
		}
	},
	_initToolPanel: function(pos, key, direction, opermethod, i, addType) {
		var that = this;
		if (pos == "inner") {
			this.uiButtonPanel = $("<span class='button " + key + " coral-buttonset coral-inner coral-corner-"
				+ direction + "' data-pos=" + pos + "_" + direction + "></span>");
			this.buttonPanelWraper = this.elementBorder;
		} else {
			this.uiButtonPanel = $("<span class='button " + key + " coral-outerbuttonset coral-outer coral-corner-all' data-pos=" 
				+ pos + "_" + direction + "></span>");
			this.buttonPanelWraper = this.component();
		}
		this.buttonPanelWraper[opermethod](this.uiButtonPanel);
		this._createtoolPanelItems(this.options.buttons[i][key], direction, this.uiButtonPanel, pos, addType);
		this._positionToolPanel(pos, direction);
	},
	_positionToolPanel: function(pos, direction){
		// 由于宽度计算会出现小数的情况，外层的面板+1px像素，避免里面按钮的文字出现换行。
		var width = this.uiButtonPanel.outerWidth() + 1;
		if (pos === "inner") {
			this.elementBorder.css("padding-" + direction, width);
			this.uiButtonPanel.css(direction, 0);
		} else if (pos === "float") {
			this.uiButtonPanel.css(
				direction, -(width + this.options.inputButtonGutter)
			);
		} else if (pos === "outer") {
			this.component().css(
				"padding-" + direction, width + this.options.inputButtonGutter
			);
			this.uiButtonPanel.css(direction, 0);
		}
		// 左侧按钮面板需要加宽度，否则会撑满整行，遮挡输入框，右侧按钮面板不会遮挡输入框。
		if (direction === "left") {
			this.uiButtonPanel.css("width", width);
		}
		if (pos + direction === "innerright") {
			this.rightPos = this.uiButtonPanel.outerWidth();
		}
	},
	_createtoolPanelItems: function(items , direction , appendTo , pos, itemType) {
		var that = this;
		if ($.isEmptyObject(items)) items = {};
		if (items instanceof Array == false) {
			items = [items];
		}
		$.each( items, function(i) {
			var addCls = "",
				removeCls = "coral-corner-all";
			if (pos=="inner" && direction == "left") {
				if(i == 0){
					addCls = "coral-corner-left";
				}
			} else if (pos=="inner" && direction == "right") {
				if (i==(items.length-1)) {
					addCls = "coral-corner-right";
				}
			} else {
				removeCls = "";
			}
			if (itemType === "button") {
				var click,
					props = $.extend({type: "button"}, {click: this.click});
				this.click = this.onClick || this.click;
				delete this.onClick;
				click = this.click || $.noop;
				props.click = function() {
					click.apply(that.element[0], arguments);
				};
				delete this.click;
				var button = $( "<button></button>", props ).button(this);
				button.button("component")
				.addClass(addCls)
				.removeClass(removeCls)
				.appendTo(appendTo);
				this.click = click;
			} else if (itemType === "combobox") {
				delete this.type;
				this.width = "item";
				// 必须先初始化，然后再添加到appendTo里面，否则会因为没有初始化好，造成下拉框会垂直排列。
				var combobox1 = $("<input type='text'/>").appendTo("body");
				// 数据加载好和值发生变化后需要动态改变输入框的长度。
				combobox1
					.off(".changeLength")
					.on("comboboxonload.changeLength", {target: combobox1}, function(e){
						that.resizeCombo.apply(e.data.target.combobox("instance"));
					})
					.on("comboboxonchange.changeLength", {target: combobox1}, function(e){
						that.resizeCombo.apply(e.data.target.combobox("instance"));
					})
					.combobox(this);
				combobox1
					.combobox("component")
					.addClass(addCls)
					.removeClass(removeCls)
					.appendTo(appendTo)
				    .addClass("coral-DropDownButton");
			}
		});
	},
	resizeCombo: function() {
		var that = this,
			opts = this.options,
	        totalWitdh = 0;// total width of items
		function resizeComboOuter(pos, direction) {
			var gutter = that.options.inputButtonGutter,
				totalWitdh = 0;// total width of items
			if (pos === "outer") {
				$(".coral-outer").children(".coral-DropDownButton").each(function(){
					totalWitdh += $(this).width();
				})
				that.component().closest(".coral-outer").css("width", totalWitdh);
				that.component()
					.closest(".coral-outer")
					.closest(".coral-textbox")
					.css(
						"padding-" + direction, totalWitdh + gutter
					);
			}
			if (pos === "inner") {
				if (that.component().hasClass("coral-inner-left")) {
					$(".coral-inner").find(".coral-inner-left").each(function() {
						totalWitdh += $(this).width();
					})
					that.component().closest(".coral-textbox-border").css("padding-left", totalWitdh);
				}
				// TODO: 暂时不支持innerRight的下拉模式
			}
		}
		// 重新计算内部按钮的尺寸和边距
		if (this.component().closest(".coral-inner").length) {
			resizeComboOuter("inner", "left");
		}
		var outer = this.component().closest(".coral-outer");
		// 重新计算外部按钮的尺寸和边距
		if (outer.length) {
			if (outer.attr("data-pos") == "outer_right") {
				resizeComboOuter("outer", "right");
			}
			if (outer.attr("data-pos") == "outer_left") {
				resizeComboOuter("outer", "left");
			}
		}
	}
});
// noDefinePart
} ) );