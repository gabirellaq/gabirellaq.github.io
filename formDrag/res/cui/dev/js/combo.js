( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
            "./textbox",
            "./panel"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
( function() {
"use strict";

$(document).unbind(".coral-combobox").bind("mousedown.coral-combobox mousewheel.coral-combobox",function(e){
	var p = $(e.target).closest(".coral-combo-panel").length;
	var c = $(e.target).closest(".coral-combo").length;
	var b = $(e.target).closest(".coral-button").length;
	if ( p || ( c && !b ) ) {
		return;
	}
	hidePanels();
});
function hidePanels( panel, iframePanel ){
	$( ".coral-combo-wrapper" ).not( panel ).hide();
	$(".coral-combo-iframePanel:visible").not( iframePanel ).hide();
}
$.component("coral.combo", $.coral.inputbase, {
	castProperties : ["triggers","showRequiredMark","hideRequiredMark","shortCut","onBlur"],
	version: "4.0.2",
	options: {
		panelRenderOnShow: false,//设置为true后，不会去data中找到selected值进行初始化
		popupDialog: false,
		showStar: true,
		showDirection: "down",
		labelField: null,
		starBefore: false,
		isInited: false,
		id: null,
		name: null,
		showOnFocus : true,
		iframePanel : false,
		buttons : [],
		forceSelection: true,
		width : "auto",
		height : 22,
		placeholder: "", // 提示消息
		cls: "",
		required : false,
		errMsg: null,
		errMsgPosition: "leftBottom",
		isLabel: false,
		panelWidth: null,
		panelHeight: "auto",
		panelComponentCls: "",
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		maxPanelHeight: 200,
		multiple : false,
		separator : ",",
		valueTextSeparator : "-",
		postMode:"value", // value, text, value-text
		editable : false,
		readonly: false,
		readonlyInput: true,
		disabled : false,
		clearOnLoad : true,
		hasArrow : true,
		value: "",
		text: "",
		delay : 300,
		zIndex: 10000,
		enableHighlight: false,
		enablePinyin: false,
		showClose: false, // 是否显示x图标来清空当前选中的选项
		enableFilter: false,
		enterFilter : true, // 如果enableFilter=true时，是否开启回车时过滤筛选
		//方法
		query : null,
		filter: function(q, row) {
			var type = $(this).attr("component-role"),
				opts = $(this)[type]("option"),
				textField  = opts.textField,
				valueField = opts.valueField,
				text = (row[textField] ).toLowerCase(),
				value = (row[valueField]).toString().toLowerCase();
			q = q.toLowerCase();
		    // 先判断显示值
			if (text.indexOf(q) > -1) {
		    	return 'text';
		    }
			if( opts.enablePinyin === true ){
				if(pinyinEngine.toPinyin(text,false,"").indexOf(q) > -1) {
					return true;
				}
			}
			if(value.indexOf(q)>-1){
				return true;
			 } else {
			    return false;
			 }
		},
		//事件
		onKeyUp  : null,
		onKeyDown: null,
		onEnter  : null,
		onBlur : null,
		onClick : null,
		onValidError: null,
		onValidSuccess: null,
		onShowPanel : $.noop,
		onHidePanel : $.noop,
		onChange : $.noop,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false // true 则不单独校验
	},
	/**
	 * add cacheItem to this.cache
	 * @param item { key:"keyName", value:{} }
	 */
	_addCacheItem: function(item) {
		if (typeof item !== "object") return;
		
		if (typeof this.cache === "undefined") {
			this.cache = {};
		}
		this.cache = $.extend({}, this.cache, item);
	},
	/**
	 * get cacheItem from this.cache
	 * @param key {string}
	 */
	_getCacheItem: function(key) {
		if (typeof key !== "string") return;
		
		if (this.cache && this.cache[key]) {
			return this.cache[key];
		} else {
			return null;
		}
	},
	/**
	 * remove cacheItem form this.cache
	 * @param key {string}
	 */
	_removeCacheItem: function(key) {
		if (this.cache && this.cache[key]) {
			delete this.cache[key];
		}
	},
    _create: function () {
    	this._prepareInit();
    	this._initCombo();
    	this._setDefaultValue();
		this._initState();
		this._initData();
		this._bindEvent();
	},
	/**
	 * prepare the param for the combo
	 */
	_prepareInit: function(){
		this.originalCss = {
			display: this.element[0].style.display,
			width: this.element[0].style.width,
			minHeight: this.element[0].style.minHeight,
			maxHeight: this.element[0].style.maxHeight,
			height: this.element[0].style.height
    	};
		this.panelRendered = false;//初始化的时候肯定是没有渲染的
		this.dataLoaded = false;
		this.search = false;
		this.isInit = false;
		this.isLoaded = false;
		this.isInited = false;
		this.currentValues = [];
		this.cache = {};
		if ( this.options.enableSearch === true ) {
			this.options.readonlyInput = false;
		}
		if ( this.options.popupDialog || this.options.enableFilter ) {
			this.options.readonlyInput = true;
		}
		this.element.hide();
    	// id 冲突处理
		if (this.element.attr("id")) {
			if (this.element.attr("id") != this.options.id) {
				this.options.id = this.element.attr("id");
			}
		} else if (this.options.id) {
			this.element.attr("id", this.options.id);
		}
		// 下拉树:id需要有值
		if (!this.element.attr("id")) {
			this.options.id = this.element.uniqueId().attr("id");
		}
		// 允许初始化的element存在name
		if (this.element.attr("name") && this.options.name) {
			if (this.element.attr("name") != this.options.name) {
				this.options.name = this.element.attr("name");
			}
		} else if (!this.options.name && this.element.attr("name")) {
    		this.options.name = this.element.attr("name");
    	}
		// 允许初始化的element存在value
		if (this.element.attr("value") && this.options.value) {
			if (this.element.attr("value") != this.options.value) {
				this.options.value = this.element.attr("value");
			}
		} else if (!this.options.value && this.element.attr("value")) {
    		this.options.value = this.element.attr("value");
    	}
		if($(this.element)[0].tagName == "SELECT"){
			this.transformData = this._transformData();
		}
	},
	/**
	 * construct the combo
	 */
	_initCombo: function() {
		var textbox = null, 
			valuebox = null;
		this.className = "coral-combo-text coral-combo-default coral-textbox-default tabbable "+this.element[0].className;
		this.classBorder = "coral-combo-border";
		this.compClass = "coral-combo coral-textbox";
		this.hiddenClass = "coral-combo-value";
		// 构造下拉框
		this.uiCombo = {combo: null, panel: null};
		this.previousValue = null;
		this.createInput();
		this.uiCombo.combo = $(this.textboxWrapper);
		this.elementBorder = $(this.elementBorder);
		this.uiCombo.textbox = $(this.textboxInput);
		this.element = $(this.textboxInput);
		
		// 下拉框显示值文本框
		// add label and required star before function @lhb @2015-04-27 add labelField attribute
		if (this.options.labelField) {
//			this.uiLabel = $("<label class=\"coral-label\">"+ this.options.labelField +"</label>");
//			this.elementBorder.before(this.uiLabel);
//			this.uiCombo.combo.addClass("coral-hasLabel");
			this._createLabel();
		}
		// add label and required star before function @lhb @2015-04-27
		if (this.options.name) {
			this.element.removeAttr("name").attr("orgname", this.options.name);
			name = " name='" + this.options.name + "'";
		}
		// 下拉面板
		this.uiCombo.panel = $( "<div class='coral-combo-panel " + this.options.panelComponentCls + "'></div>" ).appendTo( "body" );
		if ( this.options.iframePanel ){
			this.uiCombo.iframePanel = $( "<iframe class='coral-combo-iframePanel' style='position:absolute;display:none;'></iframe>" ).appendTo( "body" );
		}
		this.uiCombo.pContent = $( "<div class='coral-combo-content'></div>" ).appendTo( this.uiCombo.panel );
		if ( this.options.enableFilter ) {
			$( "<div class='coral-combo-filter'><span class='coral-combo-filter-border'><input type='text' class='coral-combo-filterbox'></span>" +
				"<span class='coral-combo-search cui-icon-search2'></span></div>" ).appendTo( this.uiCombo.panel );
		}
		var panelPosition = "absolute";
		if ( this.options.popupDialog ) {
			panelPosition = "";
			// 弹出式对话框
			this.uiCombo.popupDialog = $( "<div class='coral-combo-popup-dialog'></div>" ).appendTo( "body" );
			this.uiCombo.popupInputbox = $( "<input type='text' />" ).appendTo( this.uiCombo.popupDialog );
		}
		if(this.options.hasArrow == false ){
			this.elementBorder.css({
				"padding-right": 0
			})
			this.uiCombo.textbox.css({
				"padding-right":0
			})
			this.uiClose().css({
				"right":0
			})
			
		}
		this.uiCombo.panel.css({
			position : panelPosition
		}).addClass( "coral-combo-wrapper " + this.options.cls + "-panel coral-front" ).hide();
		// handler placeholder @added by@lhb at @20150417 : placeholder
		this.uiCombo.textbox.attr( "placeholder", this.options.placeholder );
		//this.options.placeholder = this.options.placeholder || this.options.emptyText;
		this._showPlaceholder();
		if ( this.options.buttons.length > 0 ) {
			this._createButtonPanel();
		}
	},
	_initState: function(){
		this.options.isLabel === true ? this._setIsLabel(this.options.isLabel) : this._setReadonly(this.options.readonly);
		if ( !this.options.readonly ) {
			this.uiCombo.textbox.prop("readonly", this.options.readonlyInput);
		}
		//this._setDisabled(this.options.disabled);
		this.resize();
	},
	_initData: $.noop,
	_setDefaultValue: function() {
		if (!this.options.value) {
			this.originalValue = "";
			return;
		} else {
			this.setValue(this.options.value);
			this.originalValue = this.getValue();
		}
	},
	/**
	 * 显示 placeholder @added by@lhb at @20150417 : placeholder
	 */
	_showPlaceholder: function ( placeholder ) {
		if ( $.support.placeholder || this.component().find( ".coral-textbox-placeholder-label" ).length) {
			return ;
		}
		placeholder = placeholder ? placeholder : this.options.placeholder;
		var	$placeholder = $("<span class='coral-textbox-placeholder-label'>" + placeholder + "</span>");
		
		$(this.uiCombo.textbox).after( $placeholder );
	},
	/**
	 * 隐藏 placeholder @added by@lhb at @20150417 : placeholder
	 */
	_hidePlaceholder: function () {
		if ( $.support.placeholder ) {
			return ;
		}
		this.component().find( ".coral-textbox-placeholder-label" ).remove();
	},
	/**
	 *
	 */
	_setIsLabel: function(isLabel) {
		var that = this;
		if (true === isLabel) {
			//TODO: hideRequire should be init in the validate ,here just prepare the event for the validate.
			this.component().removeClass("coral-readonly");
			this.component().addClass("coral-isLabel");
			this.uiCombo.textbox.prop("readonly", true);
			if(this.options.emptyText && "" === this.getValue()) {
				this.uiCombo.textbox.val("");
			}
			this.hidePanel();
			this.uiCombo.textbox.removeClass("tabbable");
			this.uiCombo.textbox.removeAttr( "placeholder");
		} else {
			this.component().removeClass("coral-isLabel coral-readonly");
			this.uiCombo.textbox.prop("readonly", this.options.readonlyInput);
			this.options.readonly = false;
			this.uiCombo.textbox.addClass("tabbable");
			this.uiCombo.textbox.attr( "placeholder", this.options.placeholder );
		}
		this.options.isLabel = !!isLabel;
	},
	_setReadonlyInput: function (readonlyInput) {
		if (readonlyInput) {
			this.uiCombo.textbox.prop("readonly", true);
		} else {
			this.uiCombo.textbox.prop("readonly", false);
		}
	},
	_setReadonly: function (readonly) {
		if (readonly) {
			this.element.prop("readonly", true);
			this.uiCombo.textbox.prop("readonly", true);
			this.uiCombo.textbox.removeClass("tabbable");
			this.uiCombo.combo.find(".coral-combo-value").prop("readonly", true);
		} else {
			$(this.element).prop("readonly", false);
			this.uiCombo.textbox.prop("readonly", false);
			this.uiCombo.textbox.addClass("tabbable");
			this.uiCombo.combo.find(".coral-combo-value").prop("readonly", false);
		}
		this.options.readonly = !!readonly;
		this.uiCombo.combo.removeClass( "coral-isLabel" );
		this.uiCombo.combo.toggleClass( "coral-readonly", this.options.readonly );
	},
	_setDisabled: function(disabled) {
		if (disabled) {
			this.element.prop("disabled", true);
			this.uiCombo.combo.find(".coral-combo-value").prop("disabled", true);
			this.uiCombo.combo.find(".coral-combo-text").prop("disabled", true);
			this.uiCombo.textbox.removeClass("tabbable");
		} else {
			$(this.element).prop("disabled", false);
			this.uiCombo.combo.find(".coral-combo-value").prop("disabled", false);
			this.uiCombo.combo.find(".coral-combo-text").prop("disabled", false);
			this.uiCombo.textbox.addClass("tabbable");
		}
		this.options.disabled = !!disabled;
		this.uiCombo.combo.toggleClass( this.componentFullName + "-disabled coral-state-disabled", this.options.disabled );
	},
	_selectPrev: $.noop,
	_selectNext: $.noop,
	_doEnter: $.noop,
	_doQuery: $.noop,
	/**
	 * 将$el中包含keyword的text部分高亮
	 * @param $el {jquery obj} : 需要添加高亮范围的元素
	 * @param keyword {string} : 高亮的关键字
	 */
	_addHighlight: function($el, keyword) {
		if ( keyword === "" || !$el.length || !this.options.enableHighlight  ) return;
		//keyword = keyword == [] ? "":keyword.join(this.options.separator);
		$el = $($el);
		var content = "",
			keywordArr = keyword.replace(/[\s]+/g,' ').split(' '),
			re;
		
		$el.each(function(index, item) {
			var $item = $(item),
				$parent = $(item).parent(),
				content = $(item).html();
				
			if (content == keyword) {
				return;
			}
			if ($item.hasClass(".coral-combobox-item-selected")) {
				$parent.html(that._getTextFromHTML(content));
				return;
			}
			if (!$item.children("input").length) {
				for (var n = 0; n < keywordArr.length; n ++) {
					re = new RegExp("" + keywordArr[n] + "","gmi");
					content = content.replace(re,'<span class="coral-keyword-highlight">' + keywordArr[n] + '</span>');
				}				
				$item.html(content);
			}
		});		
		
	},
	/**
	 * 将html片段中的text提取出来
	 */
	_getTextFromHTML: function(str) {
		if (typeof str === "undefined") return;
	    str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
	    str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
	    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
	    str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
	    return str;
	},
	_clearValues: function(data) {
		var	valueField = this.options.valueField,
		    currentValues = this.currentValues,
		    length = currentValues.length,
		    i,
		    j,
		    numbers = 0;
		for (i = 0; i < length; i++) {
			for (j = 0; j < data.length; j++) {
				if (currentValues[i] == data[j][valueField]) {
					numbers += 1;
					break;
				}
			}
		}
		if (numbers != length) {
			return true;
		} else {
			return false;
		}  
	},
	/**
	 * 移除高亮
	 * @param $el {jquery obj}: 需要移除的高亮元素
	 */
	_removeHighlight: function($el) {
		if (!$el.length || !this.options.enableHighlight) return;
		$el = $($el);
		var that = this;
		$el.each(function(index, item) {
			var $parent = $(item).parent();
			var content = $parent.html();
			$parent.html(that._getTextFromHTML(content));
		});		
	},
	/**
	 * 获取焦点方法
	 */
	focus: function() {
		var that = this;
		if (this.options.disabled || this.options.readonly || this.options.isLabel) return false;
		this.uiCombo.textbox.focus();
		// 如果没加载完，则先缓存，onLoad之后统一执行
		if (!this.dataLoaded) {
			var cacheItem = {
				"focus": {
					param: null
				}
			};
			this._addCacheItem(cacheItem);
			return true;
		}
		//
		return true;
	},

	_bindEvent: function() {
		var that = this,
			opts  = this.options,
		    combo = this.uiCombo.combo,
		    panel = this.uiCombo.panel,
		    iframePanel = this.uiCombo.iframePanel;
		
		if ( this.options.disabled ) {
			this.element.addClass( "coral-state-disabled" );
		}
		this._off( that.component() );
		var suppressBlurs, suppressTT;
		this._on( this.uiCombo.panel.find( ".coral-combo-filterbox" ), {
			"focusin": function(e) {
				suppressTT = true;
			}
		});
		this._on({
			"mouseenter.coral-combo-border" : function(e) {
				if ( that.component().hasClass("coral-isLabel") || that.component().hasClass( "coral-readonly") ) {
					return ;
				}
				//that.uiCombo.combo.addClass( "coral-combo-arrow-hover" );
				that.uiCombo.combo.addClass("coral-textbox-hover");
				this._updateTitle();
			},
			"mouseleave.coral-combo-border" : function(e) {
				if (that.component().hasClass("coral-isLabel") || that.component().hasClass( "coral-readonly")) {
					return ;
				}
				//that.uiCombo.combo.removeClass("coral-combo-arrow-hover");
				that.uiCombo.combo.removeClass("coral-textbox-hover");
			},
			"keydown.coral-combo-text": function(e) {
				this._doKeyDown(e, false);
				var options = this.options;
				if(options.shortCut){
					$.coral.callFunction(options.shortCut,event,this);
				}
			},
			"keyup.coral-combo-text": function(e) {
				if ( this.options.readonly || this.options.isLabel ) return;
				this._trigger("onKeyUp", e, {});
			},
			"blur.coral-combo-text": function(e) {
				this._setHv(e,"blur");
			},
			"focusin.coral-combo-text" : function(e) {
				if ( this.options.readonly || this.options.isLabel ) return;
				this.component().addClass( "coral-state-focus" );
				if ( !suppressBlurs ) {
					this._trigger("onFocus", e);
				}
			},
			"focusout.coral-combo-text" : function(e) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}
				if ( this.options.readonly || this.options.isLabel ) return;
				this._delay(function() {
					if ( suppressBlurs ) {
						suppressBlurs = false;
						return;
					}
					this.component().removeClass( "coral-state-focus" );
					if ( suppressTT ) {
						suppressTT = false;
						return;
					}
					this.hidePanel();
					this._trigger("onBlur", e);
				}, 100);
			},
			"click.coral-combo-text" : function(e) {
				if ( that.component().hasClass("coral-isLabel") || that.component().hasClass( "coral-readonly")) {
					if(this.options.hasArrow == true && !this.options.readOnlyInput){
						return ;
					}
				}
				if ( that.component().hasClass("coral-state-focus") ) {
					if ( this.options.popupDialog && this.options.showOnFocus === true ) {
						this.uiCombo.popupDialog.dialog( "open" );
					} else {
						if ( panel.is( ":visible" ) ) {
							this.hidePanel();
						} else {
							this.showPanel();
						}
					}
				}
				// 如果enableFilter设置为true，showPanel 中有查询框聚焦方法，需要抑制失焦，防止触发onBlur事件。
				if ( this.options.enableFilter ) {
					suppressTT = true;
				}
				
				that._trigger("onClick", e);
			},
			"mousedown.coral-combo-arrow" : function(e) {
				if ( this.component().hasClass("coral-isLabel") || this.component().hasClass( "coral-readonly") ) {
					return;
				}
				if ( this.component().hasClass("coral-state-focus") ) {
					suppressBlurs = true;
				}
			},
			"click.coral-combo-arrow" : function(e) {
				hidePanels( panel, iframePanel );
				if ( that.component().hasClass("coral-isLabel") || that.component().hasClass( "coral-readonly") ) {
					return;
				}
				if ( that.component().hasClass("coral-state-focus") ) {
					suppressBlurs = true;
				}
				// 如果enableFilter设置为true，showPanel 中有查询框聚焦方法，需要抑制失焦，防止触发onBlur事件。
				if ( this.options.enableFilter ) {
					suppressTT = true;
				}
				this.focus();
				if ( that.options.popupDialog ) {
					that.uiCombo.popupDialog.dialog( "open" );
				} else {
					if ( panel.is( ":visible" ) ) {
						that.hidePanel();
					} else {
						that.showPanel();
					}
				}
			},
			"click.coral-input-clearIcon" : function(e) {
				if ( this.component().hasClass("coral-state-focus") ) {
					suppressBlurs = true;
				}
				this.clear();
				// 清空后如果有placeholder则显示 @added by@lhb at @20150417 : placeholder
				if (this.options.placeholder) {
					this._showPlaceholder();
				}
			},
			"combogridonshowpanel": function(e) {
				that._removeGridHighlights();
				that._scrollTo(that.getValue());
				that.grid().grid("refresh");
			}
		});
		this._on( this.uiCombo.panel.find( ".coral-combo-filterbox" ), {
			"keydown": function(e) {
				this._doKeyDown(e, true);
			}
		});
		this._on( this.uiCombo.panel.find( ".coral-combo-search" ), {
			"click": function(e) {
				e.preventDefault();
				this._filter(e, true);
				return false;
			}
		});
		this._on( this.uiCombo.panel.find( ".coral-combo-filterbox" ), {
			"focusout": function(e) {
				//为了兼容ie浏览器点击滚动条时会触发这个focusout事件
				if(this.cancelBlur){
					this.cancelBlur = false;
					return
				}
				this._delay(function() {
					this.hidePanel();
				}, 100);
			}
		});
	},
	 _updateTitle: function(){
		var widthDiv = $("<span style = 'visibility: hidden'>"+ this.getText() +"</span>").appendTo("body");
		if(this.component().outerWidth() < widthDiv.width()){
    		this.component().attr( "title", this.getText());
    	}
		widthDiv.remove();
	 },
	_doKeyDown: function ( e, searchOnly ) {
		var opts  = this.options,
			panel  = this.panel();
		
		this.previousValue = $(e.target).val();
		if ( opts.readonly || opts.isLabel ) return;
		var keyCode = $.coral.keyCode;
		switch (e.keyCode) {
			case keyCode.TAB:
				break;
			case keyCode.ENTER:
				e.preventDefault();
				this._doEnter(e);
				this._setHv(e);
				this._trigger("onEnter", e, {});
				break;
			case keyCode.ESCAPE:
				this.hidePanel();
				break;
			case keyCode.UP:
				e.preventDefault();// 阻止页面滚动事件
				if ( opts.readonly === false ) {
					if ( !panel.is(":visible") ) {
						this.showPanel();
					} else {
						if (opts.onSelectPrev) {
							this._trigger("onSelectPrev", e);
						} else {
							this._selectPrev(e);
						}	
					}
				}
				break;
			case keyCode.DOWN:
				e.preventDefault();// 阻止页面滚动事件
				if ( opts.readonly === false ) {
					if ( !panel.is(":visible") ) {
						this.showPanel();
					} else {
						if (opts.onSelectNext) {
							this._trigger("onSelectNext", e);
						} else {
							this._selectNext(e);
						}
					}
				}
				break;
			default:
				if(this.options.readonlyInput == false){
					this._filter(e, searchOnly);
				}
				break;
		}
		this._hidePlaceholder();
		this._trigger("onKeyDown", e);
	},
	_setHv: function(e, blur){
		var $this = $(e.target),inputVarr = [],
			inputVal = $this.val();
		if ( this.options.multiple ) {
			inputVal = inputVal.split(this.options.separator);
		} else {
			inputVal = [inputVal];
		}
		// 失去焦点后将下拉选项全部显示出来，恢复到查询之前的状态。
		this._showItems();
		var jinru = true;
		if ( blur == "blur" ) {
			jinru = inputVal.toString() != this.previousValue; 
		}
		if ( jinru ) {
			var textFiled = this.options.textField,
				valueField = this.options.valueField;
			var v = this._checkMathch(inputVal,true);
			if ( !v ) {
				$this.val("");
				this.setValues([""]);
			} else {
				this.setValues(v.valarr);
			}
		}
	},
	/**
	 * input search filter
	 */
	_searchFilter: $.noop,
	/**
	 * 过滤操作
	 */
	_filter: function (e, searchOnly) {
		var that = this,
			opts = this.options,
			panel = this.panel();
		if (that.timer) {
			clearTimeout(that.timer);
		}	
		// 需要放在timer外面，不然下拉grid会在隐藏状态下进行reload，grid的高度计算会为0；
		if ( !panel.is(":visible") ) {
			that.showPanel();
		}
		that.timer = setTimeout(function () {
			var q = $(e.target).val();
			if ( searchOnly ) {
				q = panel.find( ".coral-combo-filterbox" ).val();
			}
			// 查询 begin
			if ( that.options.multiple ) {
				q = q.split(opts.separator);
			} else {
				q = [q];
			}
			if ( q == that.previousValue ) {
				return;
			}
			if (opts.query) {
				opts.query.call(that.element, q);
			} else {
				that.search = true;
				that._doQuery(q);
			}
			// 赋值 begin
			var textFiled = that.options.textField,
				valueField = that.options.valueField;
			if ( !searchOnly ) {
				var v = that._checkMathch(q, false);
				that.setValues(v.valarr,true,true);
			}
			// 赋值 end
			that.resizeIframePanel();
		}, opts.delay);
		return false;
	},
	_formatValue: function(value) {
		return value;
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
		if (key === "readonlyInput") {
			this._setReadonlyInput(value);
		}
		if (key === "disabled") {
			this._setDisabled(value);
		}
		if (key === "data") {
			this.data = value;
		}
		this._super(key, value );
		if (key === "isLabel") {
			this._setIsLabel(value);
			return;
		}
		if (key === "labelField") {
			this.labelPanel.html(value);
			
		}
	},
	_destroy : function() {
		this.panel().remove();
		if(this.options.iframePanel){
			this.uiCombo.iframePanel.remove();
		}
		this.component().replaceWith( this.element );
		if (this.options.name) {
			this.element.removeAttr("orgname").attr("name", this.options.name);
		}
		this.element.show();
		this.element.css(this.originalCss);
		//this.element.detach();
	},
	component : function() {
		return this.uiCombo.combo;
	},
	panel : function() {
		return this.uiCombo.panel;
	},
	uiArrow : function() {
		return this.uiCombo.combo.find("span.coral-combo-arrow");
	},
	uiClose : function() {
		return this.uiCombo.combo.find("span.coral-input-clearIcon");
	},
	uiBorder : function () {
		return this.component().find("span.coral-combo-border");
	},
	resize : function(width) {
		var opts  = this.options,
		    combo = this.uiCombo.combo,
		    panel = this.uiCombo.panel,
		    uiBorder = this.elementBorder;
		if (width) {
			opts.width = width;
		}
		if(opts.width== "auto" || opts.width == "item") return;            
		if (isNaN(opts.width)) {
			var parent   = this.element.parent(":first"),
			    pWidth   = null;
		    width = this.element.outerWidth();
			if (parent && parent.get(0).tagName !== "BODY") {
				pWidth = parent.outerWidth();
				if (pWidth < width) width = pWidth;
			}
			opts.width = width;
		}
		combo.outerWidth(opts.width);
	},
	resizeIframePanel : function(){
		var opts  = this.options,height,
	    	combo = this.uiCombo.combo,
	    	panel = this.uiCombo.panel,
		    iframePanel = this.uiCombo.iframePanel || $();
	    height = panel.height();
		iframePanel.css("height",height);
	},
	_initPanel: function(){
		var opts = this.options,
		    combo = this.uiCombo.combo,
		    uiBorder = this.elementBorder,
		    panel = this.uiCombo.panel,
		    tHeight = opts.panelHeight;
		/*if ( !this.panelRendered ) {
		}*/
		this._renderItems( this.options.data );
		//this.uiCombo.pContent.html( this.lazyPanelHtml );
		this.panelRendered = true;
		this.lazyPanelHtml = "";
		// 下拉面板位置大小设置
		panel.css( "width" , (opts.panelWidth ? opts.panelWidth : uiBorder.outerWidth()) );		
		panel.css( "height", tHeight );
		if ( isNaN( tHeight ) ) {
			this.uiCombo.pContent.css( {
				"max-height": opts.maxPanelHeight +"px"
			} );
			this.uiCombo.popupDialogTree && this.uiCombo.popupDialogTree.css( {
				"max-height": opts.maxPanelHeight +"px"
			} );
		}
		if ( this.options.enableFilter && !isNaN( tHeight ) ) {
			this.uiCombo.pContent.height( opts.panelHeight - 30);
		} else {
			if ( tHeight == "auto" ){
				this.uiCombo.pContent.height( "" );
			} else {
				this.uiCombo.pContent.height( tHeight-2 );
			}
		}
		if ( this.options.iframePanel ){
			this.uiCombo.iframePanel.css( "height" , panel.outerHeight() );
		}
	},
	showPanel : function() {
		var that = this,
			opts = this.options,
		    combo = this.uiCombo.combo,
		    uiBorder = this.elementBorder,
		    showDirection = this.options.showDirection,
		    panel = this.uiCombo.panel,
		    iframePanel = this.uiCombo.iframePanel || $();
		// 判断下拉框面板是否关闭，关闭则打开
		if ( panel.is( ":hidden" ) ) {
			var zIndicies = /*panel.siblings*/$( ".coral-front:visible" ).map(function() {
					return +$( this ).css( "z-index" );
				}).get(),
				zIndexMax = Math.max.apply( null, zIndicies );
			if ( zIndexMax >= +panel.css( "z-index" ) ) {
				panel.css( "z-index", zIndexMax + 1 );
				if ( this.options.iframePanel ) {
					iframePanel.css( "z-index", zIndexMax );
				}
			}
			/*if ( !this._PanelInited ) {
			}*/
			this._initPanel();
			this._PanelInited = true;
			panel.show(0, function() {
				that.resizeIframePanel();
				iframePanel.show();
				(function move () {
					if (panel.is(":visible")) {
						panel.css({
							left : $.coral.getLeft( panel, uiBorder ),
							top  : $.coral.getTop( panel, uiBorder, showDirection),
							width: ( opts.panelWidth ? opts.panelWidth : uiBorder.outerWidth() )
						});
						if ( that.options.iframePanel ) {
							iframePanel.css({
								left : $.coral.getLeft( iframePanel, uiBorder ),
								top  : $.coral.getTop( iframePanel, combo, showDirection ),
								width: ( opts.panelWidth ? opts.panelWidth : uiBorder.outerWidth() )
							});
						}
						setTimeout(move, 200);
					}
				})();
				//需要下拉面板调整好位置后再将输入框聚焦，否则聚焦事件会影响页面的滚动；
				that.uiCombo.panel.find( ".coral-combo-filterbox" ).focus();
				that._trigger("onShowPanel", null, {});
				that._scrollTo( that.getValue() );
			});
		}
		if ( opts.enableFilter ) {
			this.setValues(this.getValues());
		}
	},
	hidePanel : function() {
		this.uiCombo.panel.hide();
		if (this.uiCombo.iframePanel){
			this.uiCombo.iframePanel.hide();
		}
		this._trigger("onHidePanel", null, {});
	},
	disable : function() {
		this._setDisabled(true);
	},
	enable : function() {
		this._setDisabled(false);
	},
	show : function() {
		this._super();
	},
	hide : function() {
		this._super();
		this.hidePanel();
	},
	hideErrors: function () {
		$.validate.hideErrors( this.uiBorder() );
		this.component().removeClass("coral-combo-error");
	},
	clear : function() {
		this.setValues( [], true, false );
	},
	/**
	 * 20150121 返回 oldText
	 */
	getOldText: function () {
		return this.oldText;
	},
	reset : function() {
		this.setValue(this.originalValue);
	},
	getText : function() {
		return this.uiCombo.combo.find("input.coral-combo-text").val();
	},
	_setText : function( text ) {
		var $textbox = this.uiCombo.combo.find("input.coral-combo-text");
		$textbox.val(text);
		this.previousValue = text;
	},
	//与grid的编辑功能一起修改，要支持postMode
	setText: function(text) {
		this._setText(text);
	},
	getValues : function() {
		var valArr = [];
		if (!this.dataLoaded) {
			return this.currentValues;
		}
		this.uiCombo.combo.find("input.coral-combo-value").each(function() {
			valArr.push($(this).val());
		});
		return valArr;
	},
	// values必须是数组格式
	// tChange: true(则是用户选择或取消选择的操作)；false(则是开发者代码调用setValues方法)。
	setValues: function(values, tChange, remainText) {
		var oldValues = this.getValues(), comboVal = null,opts = this.options,
		    i = 0, oldTmp = [], eqTmp = [];
		values = values || [];
		this.oldValues = oldValues;
		var itemVal = [],
			name = "",
			value = "";
		this.uiCombo.combo.find("input.coral-combo-value").remove();	
		if(values.length > 1 || values[0] != ""){	
			for (i = 0; i < values.length; i++) {
				name = "";
				value = "";
				if (this.options.name) {
					name = " name='" + this.options.name + "' ";
				}
				itemVal.push("<input type='hidden' " + name + " value='" + 
						this._formatValue(values[i]) + "' class='coral-combo-value' />");
			}
			this.uiCombo.combo.append(itemVal.join(""));
		}
		for (i = 0; i < oldValues.length; i++) {
			oldTmp[i] = oldValues[i];
		}
		for (i = 0; i < values.length; i++) {
			for ( var j = 0; j < oldTmp.length; j++) {
				if (values[i] == oldTmp[j]) {
					eqTmp.push(values[i]);
					oldTmp.splice(j, 1);
					break;
				}
			}
		}
		if ( values.length ) {// 只要是有值，就应该隐藏placeholder
			if (this.options.placeholder) {
				this._hidePlaceholder();
			}
		}
		if (opts.width == "item") {
			var widthDiv = $("<div style = 'visibility:hidden;'><span>"+this.getText()+"</span></div>")
                           .appendTo("body"),
                innerText = this.component().find(".coral-textbox-default");
            var elementPadding = parseInt(innerText.css("padding-left")) +
                                 parseInt(innerText.css("padding-right")),
                arrowWidth = this.uiArrow().outerWidth() + 2*parseInt(this.uiArrow().css("right")),
                width = widthDiv.find("span").outerWidth() + elementPadding + arrowWidth ;
            this.resize(width);
            widthDiv.remove();
            // resize 方法会将options中的width变为数字，这里重新进行设置。
            opts.width = "item";
		}
		if ((eqTmp.length != values.length || values.length != oldValues.length) 
				&& tChange) {
			if (this.options.multiple) {
				this._trigger("onChange", null, {
					value: values, 
					newValue: values, 
					newText: this.getText(),
					text: this.getText(), 
					oldValue: oldValues, 
					oldText: this.getOldText()
				});
			} else {
				this._trigger("onChange", null, {
					value: values[0], 
					newValue: values[0], 
					newText: this.getText(), 
					text: this.getText(), 
					oldValue: oldValues[0], 
					oldText: this.getOldText()
				});
			}
		}
	},
	// 返回字符串形式的值
	getValue: function() {
		return this.getValues().join( this.options.separator );
	},
	// 设置值，多选设置要以分隔符进行分割
	setValue: function(value,tChange,remainText) {
		value = value || "";
		value = value.split( this.options.separator );
		this.setValues( value, tChange);
	},
	// 获得选中的所有项目
	getSelectedItems: function() { 
		var Arr = this.getValues(),
			Arr2 = [];
		var comboData = this.options.data;
		for ( var i=0; i<Arr.length ;i++ ){
			for ( var j=0; j < comboData.length ;j++ ){
				var p = comboData[j];
				if ( Arr[i] == p.id ) {
					for ( var obj in p ) {		
						Arr2.push( obj+"="+p[obj]+"\n" );
					}
				}
			}
		}
		return Arr2;
	},
	// 这个有待优化，，，，refresh只是dom元素发生变化后进行重新渲染，不能调用销毁方法
	refresh : function() {
		this.destroy();
		this.component().remove();
		this._create();
	}
});
})();
// noDefinePart
} ) );