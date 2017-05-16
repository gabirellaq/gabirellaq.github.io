( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./combo"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
( function() {
"use strict";
var COMBOBOX_SERNO = 0;
$.component( "coral.combobox", $.coral.combo, {
	version: "4.0.3",
	castProperties : ["data","buttons","formatter","shortCut","onShowPanel","onBlur"],
	options: {
		cls       : "",
		valueField: "value",
		textField : "text",
		panelRenderOnShow: false,
		mode      : "local",	// or "remote"
		method    : "post",
		url       : null,
		data      : [],
		selectedIndex: null,
		buttons   : [],
		width  : "auto",
		showText  : true, // 
		emptyText : null,       // value为空的option，显示值（text）
		postMode  : "value",    // value, text, value-text
		formatter: function(item) {
			var textField = $(this).combobox("option", "textField");
			return item[textField];
		},
		loader: function(param, success, error) {
			var that = this,
			    instance = $(this),
			    url = instance.combobox("option", "url");
			if (!url) return false;
			$.ajax({
				type: instance.combobox("option", "method"),
				url:  url,
				data: param,
				dataType: "json",
				success: function(data){
					success(data);
				},
				error: function(){
					error.apply(this, arguments);
				}
			});
			return false;
		},
		
		beforeLoad : $.noop, /*参数(event, param)*/
		onLoad     : $.noop, /*数据加载成功*/ 
		onError    : $.noop, /*数据加载失败*/
		onShowPanel: $.noop,
		beforeSelect   : $.noop, /*参数(event, {valueField, textField})*/
		onSelect   : $.noop, /*参数(event, {valueField, textField})*/
		unSelect : $.noop  /*参数(event, {valueField, textField})*/		
	}, 
	_create : function() {
		var that = this,
		    showPanelEvent = null;
		var date1 = new Date();
		
		this.data = this.data || [];//this.data默认不能undefined
		COMBOBOX_SERNO++;
		that.options.itemIdPrefix = "combobox_i" + COMBOBOX_SERNO;
    	this.element.addClass( "coral-form-element-combobox coral-validation-combobox ctrl-form-element" );
    	var onShowPanel = $.coral.toFunction( this.options.onShowPanel );
		showPanelEvent = function(e) {
			if(onShowPanel){
				onShowPanel.apply( that.element, [e] );
			}
		};
		this.options.onShowPanel = showPanelEvent;
		this._super();
		this._on( this.uiCombo.panel, {
			mouseover: function( e ) {
				$(e.target).closest('.coral-combobox-item').addClass('coral-combobox-item-hover');	
			},
			mouseout: function( e ) {
				$(e.target).closest('.coral-combobox-item').removeClass('coral-combobox-item-hover');
			},
			mousedown: function( e ) {
				this.cancelBlur = true;
				this._delay(function() {
					delete this.cancelBlur;
				});
				var item = $(e.target).closest('.coral-combobox-item'),
				value = item.attr("value");
				// 点击面板上面的查询框的时候，不能返回false，否则不能选中查询框里面的内容。
				if ( $(e.target).closest('.coral-combo-filterbox').length ) return;
				// 如果判断点击的不是选项，可能是点击的滚动条，返回false才能阻止事件冒泡；
				if (!item.length || item.hasClass('coral-combobox-item-disabled')){return false;}
				var i = this.getRowIndex( value );
				if ( false === this._trigger("beforeSelect", null, [ {"item":this.options.data[i]},{"data":this.options.data[i]} ]) ) {
					return false;
				} 
				if (this.options.multiple) {
					this.oldText = this.uiCombo.textbox.val();// 20150121重新设置之前保存下text
					if ("" === value) {
						this.clear();
						this.hidePanel();
						this.select(value);
					} else {
						if (this.options.emptyText) {
							this.unselect("");
						}
						if (item.hasClass("coral-combobox-item-selected")) {
							this.unselect(value);
							item.removeClass("coral-combobox-item-selected");
						} else {
							this.select(value);
						}
					}
				} else {
					this.oldText = this.uiCombo.textbox.val();// 20150121重新设置之前保存下text
					this.hidePanel();
					this.select(value);
				}
				return false;
			}
			
		});
		if(this.options.isLabel && this.options.emptyText && "" === this.getValue()) {
			this.uiCombo.textbox.val("");
		}
	}, 
	_initData : function() {
		if (this.options.url) {
			return this._request(this.options.url);
		}
		
		if ( this.options.data.length ) {
			return this.loadData(this.options.data);
		}
		
		return this.loadData(this.transformData);
	},
	_renderItems: function( data ){
		var opts     = this.options,
		    panel    = this.panel(),
		    that     = this,
			defaultOption = {},
			selected = [],
			itemStr = [],
			i,
			restAttr = '',
			formatterEvent = $.coral.toFunction(this.options.formatter),
			itemattrFun = $.coral.toFunction(this.options.itemattr);
		for (i = 0; i < data.length; i++) {
			var row = data[i],
				v = row[opts.valueField],
				s = row[opts.textField],
				classes = !! row.hidden == true ? "hidden" : "",
				style = "",
				fmt = s;
			if (formatterEvent) {
				fmt = formatterEvent.call(this.element, data[i]);
			}
			if ($.isFunction(itemattrFun)) {
				var itemAttrObj = itemattrFun.apply( this.element[0], [{"item":data[i]}]);
				if (!$.isEmptyObject( itemAttrObj )) {
					if (itemAttrObj.hasOwnProperty("style")) {
						style += itemAttrObj.style;
						delete itemAttrObj.style;
					}
					if (itemAttrObj.hasOwnProperty("class")) {
						classes += ' ' + itemAttrObj['class'];
						delete itemAttrObj['class'];
					}
					try { delete itemAttrObj.role; } catch(ra){}
					for (attrName in itemAttrObj) {
						if (itemAttrObj.hasOwnProperty(attrName)) {
							restAttr += ' ' + attrName + '=' + itemAttrObj[attrName];
						}
					}
				}
				itemStr.push("<div class='coral-combobox-item "+ classes + restAttr +"' style='"+ style +"' id='"+this.options.itemIdPrefix+"_"+ i + "' value='"+v+"'>"+fmt+"</div>");
				
			}else{
				itemStr.push("<div class='coral-combobox-item "+ classes +" ' id='"+this.options.itemIdPrefix+"_"+i+"' value='"+v+"'>"+fmt+"</div>");
			}
			if ( row['selected'] && $.inArray(v, selected) === -1 ) {
				selected.push(this.getModeValue(v, s));
			}
		}
		this.lazyPanelHtml = itemStr.join("");
		this.uiCombo.pContent.html( this.lazyPanelHtml );
		return selected;
	},
	loadData: function(data, remainText, loadEvent) {
		var opts     = this.options,
		    panel    = this.panel(),
		    that     = this,
		    loadevent = loadEvent ||"onLoad",
			formatterEvent = $.coral.toFunction(this.options.formatter),
			defaultOption = {},
			selected = [], 
			clearValues = false,
			values   = null;
		if (!(data instanceof Array)) data = [];
		this.data = (data || []);
		this.options.data = (data || []);
		if ( opts.clearOnLoad ){
			clearValues = that._clearValues(this.data);
		}
		this.uiCombo.pContent.empty();	// clear old data
		if (this.options.emptyText) {
			if (!(data.length > 0 && "" === data[0][this.options.valueField])) {
				defaultOption[this.options.valueField] = "";
				defaultOption[this.options.textField] = this.options.emptyText;
				data.unshift(defaultOption);
			}
		}
		var itemStr = [];
		selected = this._renderItems(this.data);
		if (selected.length == 0 && !this.currentValues.length && this.options.selectedIndex && data[this.options.selectedIndex]) {
			selected = [data[this.options.selectedIndex].value];
		}
		if (!this.options.panelRenderOnShow) {
			this.uiCombo.pContent.html(this.lazyPanelHtml);
			this.panelRendered = true;
		}
		
		// option.value有值，则优先
		if (this.currentValues.length && !clearValues) {
			selected = this.currentValues;
		}
		// 已设值且不为空，则优先级别为最高
		/*values = this.currentValues;
		if ("" !== values.toString()) {
			selected = values;
		}*/
		if (!this.isInit) {
			this.isInit = true;
			this.originalValue = selected.join(",");
		}
		this.dataLoaded = true;
		if (opts.multiple) {
			this.setValues(selected, false, remainText);
		} else {
			selected = selected.length?[selected[0]]:[];
			this.setValues(selected, false, remainText);
		}
		this._trigger(loadevent, null, [data]);
	},
	localFilter: function(filterEvent) {
		var data = this.getData() , 
			item = this.panel().find(".coral-combobox-item");
		for(var i = 0; i < data.length; i++) {
			$(item[i]).hide();
			if (filterEvent.apply(this.element, [data[i]])) {
				var v = data[i][this.options.valueField];
				var s = data[i][this.options.textField];
				$(item[i]).show();//此处注意不能移除选项上的class hidden
			}
		}
	},
	_scrollTo : function(value) {
		var panel = this.panel().find(".coral-combo-content"),
			h;
		var item = this.getEl( value );
		if (item.length) {
			if (item.position().top <= 0) {
				h = panel.scrollTop() + item.position().top;
				panel.scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.height()) {
				h = panel.scrollTop() + item.position().top + item.outerHeight() - panel.height();
				panel.scrollTop(h);
				//panel.children(".coral-combo-content").scrollTop(h);
				//: TODO bug 有maxheight或者搜索框的时候，滚动条出现在content上而不是panel上
			}
		}
	}, 
	_transformData : function() {
		var opts = this.options;
		var data = [];
		$(">option", this.element).each(function() {
			var item = {};
			item[opts.valueField] = $(this).attr("value") !== undefined ? $(this).attr("value") : $(this).html();
			item[opts.textField]  = $(this).html();
			item["selected"]      = $(this).attr("selected");
			data.push(item);
		});
		return data;
	},
	_showItems : function(){
		this.uiCombo.panel.find(".coral-combobox-item").show();
	},
	_doQuery : function(q) {
		var opts = this.options,
		    filterEvent = this.options.filter;
		if (opts.mode == "remote") {
			this._request(null, {q:q}, true);
		} else {
			var panel  = this.panel();
			var data = this.getData() , item = panel.find(".coral-combobox-item");
			item.hide();
			//重新查询前，将之前的高亮标签删除
			this._removeHighlight(this.uiCombo.pContent.find("span.coral-keyword-highlight"));
			this.uiCombo.pContent.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected");
			this.uiCombo.pContent.find(".coral-item-focus").removeClass("coral-item-focus");
			//
			for(var i = 0; i < data.length; i++) {
				var spell = pinyinEngine.toPinyin(data[i][opts.textField],false,"");
				for(var j = 0;j< q.length;j++){
					var r = filterEvent.apply(this.element, [q[j], data[i]]);
					if (r) {
						var v = data[i][opts.valueField].toString();// 匹配的value
						var t = data[i][opts.textField];// 匹配的text
						
						if (t.indexOf(q[j]) > -1 || v.indexOf(q[j]) > -1 || spell.indexOf(q[j]) > -1) {
							//被隐藏的值不在搜索结果中
							if($.inArray($(item[i]).attr("value"),this.hideValueArr) != -1){
								$(item[i]).hide();
							} else {
								$(item[i]).show();//此处注意不能移除选项上的class hidden
								if( t == q[j] ){
									$(item[i]).addClass("coral-combobox-item-selected");
									this._removeHighlight( $(item[i]).find("span.coral-keyword-highlight") );
								} else if (r == "text") {
									// 如何是匹配的text，则高亮其中的关键字
									this._addHighlight( $(item[i]), q[j] );
								}
							}
						}
					}
				}
			}
		}
	}, 
	// checkTypeFlag 为false的时候（查询），不应该将所有项目显示出来
	_checkMathch: function(text, noSearchFlag){
		var valarr = [],
			textarr = [];
		var opts = this.options,
			textField = opts.textField,
			valueField = opts.valueField;
		var matchedIndex = 0;
		if ( noSearchFlag ) {
			this._showItems();
		}
		var matched = false;
		var data = this.data,
			modevalue = "",
			exsit = {},
			repeatIndex = 0,// 选中的值
			i,
			j;
		if ( opts.multiple ) {
			for(i = 0; i < text.length; i++){
				for(j = 0; j < data.length; j++){
					if( data[j][textField] != text[i] && data[j][valueField] != text[i] ){
						exsit[i.toString()] = true;
					}
					if( data[j][textField] == text[i] ){
						modevalue = this.getModeValue(data[j][valueField], data[j][textField]);
						valarr.push( modevalue );
						matched = true;
						break;
					}
				}
				if ( !matched && !opts.forceSelection ) {
					// 如果查询的文本与data中的value匹配，查询的时候，不能进行选中，失去焦点的时候才可以选中
					if ( ( !exsit[i.toString()] && !noSearchFlag ) || noSearchFlag ) {
						valarr.push(text[i]);
						textarr.push(text[i]);
					}
				}
				matched = false;
			}
		} else {
			var index = -1;
			// 检测当前页里面的值是否有匹配
			for( i = 0; i < data.length; i++ ){
				if ( data[i][textField] == text[0] ){
					index = index===-1?i:index;// 单选的时候，只保留地一个匹配的选项
					matched = true;
				}
				if( data[i][textField] != text[0] && data[i][valueField] != text[0] ){
					exsit["0"] = true;
				}
			}
			if ( matched ) {
				modevalue = this.getModeValue(data[index][valueField], data[index][textField]);
				valarr.push( modevalue );
			}
			if ( !matched && !opts.forceSelection ) {
				// 如果查询的文本与data中的value匹配，查询的时候，不能进行选中，失去焦点的时候才可以选中
				if ( ( !exsit["0"] && !noSearchFlag ) || noSearchFlag ) {
					valarr.push(text[0]);
					textarr.push(text[0]);
				}
			}
		}
		return {
			valarr:valarr,
			textarr:textarr
		};
	},
	_request : function(url, param, remainText) {
		var that = this,
		    opts = {}, 
		    data = [], 
		    loaderEvent = this.options.loader,
		    isUrl = false;
		if ( !url && !that.options.url ){
			url = [];
		} else if (!url && that.options.url){
			url = that.options.url;
		}
	    if ( typeof( url ) !== "string" ) {
	    	
		// 传过来的是object，需要区别是data还是options
		// 如果是options，可能是options.data或者options.url ，否则才为data
		    opts = url;
		    if (opts.data) { //传进来的是options对象
			    data = opts.data;			    
		    } else if (opts.url) {// 传进来的是data对象
			    url = opts.url;
			    that.options.url = opts.url;
			    isUrl = true;
		    } else if (opts instanceof Array) {
			    data = url;
		    } else if (!opts.url && !opts.data && !that.options.url) {
		    	data = [];
		    } else if (!opts.url && !opts.data && that.options.url) {
		    	url = that.options.url ;
		    	isUrl = true;
		    }
	    } else {
	    	that.options.url = url;
		    isUrl = true;
	    }
	    if (isUrl){
	    	param = param || {};
			if (this._trigger("beforeLoad", null, [param]) == false) return;
			loaderEvent.apply(this.element, [param, function(data) {
				var loadEvent =  opts.onLoad;
				that.loadData(data, remainText , loadEvent);
//				that._trigger($.isFunction( opts.onLoad ) ? opts.onLoad:"onLoad", null, [data]);
				that._loadedHandler();
			}, function() {
				that._trigger("onError", null, arguments);
			}]);
	     } else{
	    	 var loadEvent = opts.onLoad ;
			 that.loadData(data, remainText , loadEvent);
	     }
	},
	/**
	 * 加载后执行缓存的方法
	 */
	_loadedHandler: function() {
		var that = this;
		/** setValues **/
		var item_setValues = this._getCacheItem("setValues");
		if (item_setValues) {
			this.setValues(item_setValues.values, item_setValues.triggerOnChange, item_setValues.remainText);
			this._removeCacheItem("setValues");
		}
		/** focus **/
		var item_focus = this._getCacheItem("focus");
		if (item_focus) {
			//this.focus();
			this._removeCacheItem("focus");
		}		
	},
	_selectItems: function(isFirst,direction) {
		var panel = this.panel(),
		    item  = null, value = null,
		    focus = panel.find(".coral-item-focus:visible"),
		    position = ":last";
		if (isFirst) {
			position = ":first";
		}
		focus.removeClass("coral-item-focus");
		if ( focus.length ) {
			value = focus.attr("value");
		} else {
			focus = item = panel.find(".coral-combobox-item-selected:visible" + position);
			if (item.length) value = item.attr("value");
		}
		if(direction == "prev"){
			if(focus.prevAll(":visible").length === 0){
				focus = panel.find(".coral-combobox-item:visible:last") ;
				focus.addClass("coral-item-focus");
			}else{
				focus.prevAll(":visible:eq(0)").addClass("coral-item-focus");
			}
		}else{
			if(focus.nextAll(":visible").length === 0){
				focus = panel.find(".coral-combobox-item:visible:first") ;
				focus.addClass("coral-item-focus");
			}else{
				focus.nextAll(":visible:eq(0)").addClass("coral-item-focus");
			}
		}
		return value;
	},
	_selectPrev : function() {
		var panel  = this.panel(),
		   targetValue = this._selectItems(true,"prev"),
		   item = panel.find(".coral-combobox-item[value=\"" + targetValue + "\"]"),
		    prev = null, value= null;
		if (item.length){
			prev = item.prevAll(":visible:eq(0)");
		} else {
			item = panel.find(".coral-combobox-item:visible:last");
		}
		if (null !== prev && prev.length === 0) {
			prev = panel.find(".coral-combobox-item:visible:last");
		}
		value = !!prev ? prev.attr("value") : item.attr("value");
		this.select(value);
		//item.focus();
		this._scrollTo(value);
	},
	_selectNext: function() {
		var panel  = this.panel(),
		    targetValue = this._selectItems(true,"next"),
		    item = panel.find(".coral-combobox-item[value=\"" + targetValue + "\"]"),
		    next = null,
		    value= null;
		if (item.length) {
			next = item.nextAll(":visible:eq(0)");
		} else {
			item = panel.find(".coral-combobox-item:visible:first");
		}
		if (next && next.length == 0) {
			next = panel.find(".coral-combobox-item:visible:first");
		};
		value = next ? next.attr("value") : item.attr("value");
		this.select(value);
		//item.focus();
		this._scrollTo(value);
	},

	_doEnter : function (e) {
		var panel  = this.panel(),
			values = this.getValues(),
			item = panel.find(".coral-item-focus:visible"),
			i,
			data = this.getData(),
			opts = this.options,
			value = item.attr("value");
		if ( value ) {
			var modeValue = "", matchedIndex = 0;
			for(i=0;i < data.length;i++){
				if(value == data[i][opts.valueField]){
					matchedIndex = i;
				}
			}
			modeValue = this.getModeValue(value, data[matchedIndex][opts.textField]);
			if ( this.options.multiple ) {
				if ($.inArray(modeValue, values) == -1) {
					this.select(value);
				} else {
					this.unselect(value);
				}
			} else {
				this.hidePanel();
			}
		}
	},	
	_formatValue: function(value) {
		var data = this.getData(), opts = this.options,
		    valueField = opts.valueField, textField  = opts.textField,
		    i = 0, row = null;
		if ("text" === opts.postMode || "value-text" === opts.postMode) {
			for (i = 0; i < data.length; i++) {
				row = data[i];
				if ("" != value && value == row[valueField]) {
					if ("text" === opts.postMode )	return row[textField];
					if ("value-text" === opts.postMode) return value + opts.valueTextSeparator + row[textField];
				}
			}
		}
		return value;
	},
	_destroy : function () {
		this.element.removeClass("coral-validation-combobox");
		this.element.removeClass("coral-form-element-combobox");
		this._super();
	}, 
	/**
	 * postMode有多种形式，此方法只获得value部分
	 */
	_getOnlyValues: function() {
		var data = this.getData(),
		    opts = this.options,
		    valArr = [],
		    i = 0;
		if ( !this.currentValues || 
			( !this.currentValues[0] && 
			this.currentValues.length === 1) ) return valArr;
		for (; i < this.currentValues.length; i++) {
			var value = this.currentValues[i],
			    j     = 0,
			    valueField = opts.valueField,
			    textField  = opts.textField,
			    row        = null;
			if ("value-text" === opts.postMode) {
				value = value.split(opts.valueTextSeparator)[0];
				valArr.push(value);
			}
			if ( "value" === opts.postMode ) {
				valArr.push(value);
			}
			if ( "text" === opts.postMode ) {
				for (;data && j < data.length; j++) {
					row = data[j];
					if ( row[textField] == value ) {
						valArr.push(row[valueField]);
						break;
					}
				}
			}
		}
		return valArr;
	},
	_getCurrentValues: function() {
		var data = this.getData(),
		    opts = this.options,
		    valArr = [],
		    i = 0;
		if ( !this.currentValues || 
			( !this.currentValues[0] && 
			this.currentValues.length === 1) ) return valArr;
		return this.currentValues;
	},
	getData: function() {
		return this.data || [];
	},
	/**
	 *  triggerOnChange : true(则是用户选择或取消选择的操作)；false(则是开发者代码调用setValues方法)。
	 */
	setValues: function( values, triggerOnChange, remainText ) {
		var opts  = this.options,
		    data  = this.getData(),
			panel = this.panel(),
			mOptions = remainText,
		    i = 0, j = 0,
		    oldValues = this.getValues() || [],
			valueArr = [], textArr = [],valArr = null,
			value = null, text = null;
		
		if ( typeof ( mOptions ) == "object" ){
			remainText = mOptions.remainText;
			triggerOnChange = mOptions.triggerOnChange;
		}
		// 当前值缓存，防止异步加载下拉选项时，设值不起作用
		this.currentValues = values;
		if(!this.dataLoaded){
			return;
		}
		panel.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected");
		for(i = 0; i < values.length; i++){
			value = values[i];
			text = value;
			
			var index = this.getRowIndex( value );
			if ( index > -1 ) {
				text = data[ index ][ opts.textField ];
				valArr = data[ index ][ opts.valueField ];
				var row = this._getItemByIndex( index ).addClass("coral-combobox-item-selected");
				// 如果emptyText存在 并且被选中的时候，设置placeholder
				if ( opts.emptyText && "" == value ) {
					this.uiCombo.textbox.attr( "placeholder", opts.emptyText );
					this._showPlaceholder(opts.emptyText);
					text = "";
				} else {
					this._hidePlaceholder();
				}
				// 如果emptyText存在 并且被选中的时候，设置placeholder
				textArr.push( text );
				valueArr.push( value );
			} else if ( index < 0 && !opts.forceSelection ) {
				textArr.push( text );
				valueArr.push( value );
			} 
		}
		
		if (!remainText) {
			this._setText( textArr.join(opts.separator));
		}
		// added by @lhb @20150414 : 如果没有对应值，则设置传进的值
		var noValueArr = this._getMinus(valueArr, values);
		if ( (noValueArr.length && valueArr.length) || !valueArr.length ) {
			textArr = textArr.concat(noValueArr);
			if (!remainText) {
				this._setText( textArr.join(opts.separator) );
			}
			valueArr = values;
		}
		this._super( valueArr,triggerOnChange, remainText);	
	},
	/**
	 * 获取第一个数组中没有，第二个数组中有的项，返回一个数组
	 * @param a,b {Array} : 两个数组
	 * @return b_a {Array} : 第二个数组减去第一个数组的结果
	 */
	_getMinus: function(a, b) {
		var b_a = [];
		
		$.each(b, function(i, o) {
			if ( $.inArray(o, a) == -1 ) {
				b_a.push(o);
			}
		});	
		
		return b_a;
	},
	getEl:function( value ){
		var index = this.getRowIndex( value );
		var id = index;
		return $( '#'+this.options.itemIdPrefix+"_"+id );
	},
	_getItemByIndex:function( index ){
		var id = index;
		return $( '#'+this.options.itemIdPrefix+"_"+id );
	},
	getRowIndex: function( value ){
		var opts = this.options,
			data = this.getData(),
			postMode = opts.postMode;
		for(var i=0; i<data.length; i++){
			if ( postMode == "value") {
				if (data[i][opts.valueField] == value){
					return i;
				}
			} 
			if ( postMode == "text") {
				if (data[i][opts.textField] == value){
					return i;
				}
			}
			if ( postMode == "value-text") {
				if (data[i][opts.valueField] == value.split(opts.valueTextSeparator)[0]){
					return i;
				}
			}
		}
		return -1;
	},
	clear: function() {
		var panel = this.panel();
		this._super();
		panel.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected");
		panel.find(".coral-item-focus").removeClass("coral-item-focus");
	},
	reload: function(url) {
		this._request(url);
	},
	select: function(value) {
		var opts = this.options,
	    	data = this.getData(),
	    	i,
	    	values;
		value = $.trim( value );// enter的时候有空格
		if (opts.multiple) {
			values = this.getValues();
		} else {
			values = [];
		}
		
		var modeValue = "", matchedIndex = 0;
		for (i = 0 ; i < data.length ; i++) {
			if (value == data[i][opts.valueField]) {
				matchedIndex = i;
			}
		}
		modeValue = this.getModeValue(value, data[matchedIndex][opts.textField]);
		// 如果点击的是重复的则返回
		for(i = 0; i < values.length; i++) {
			if (values[i] == modeValue) return;
		}
		values.push(modeValue);
		this.setValues(values, true, false);
		this._trigger("onSelect", null, [{
			"item": data[matchedIndex],
			"value":value,
			"text":data[matchedIndex][opts.textField]
		}]);
	},
	getModeValue: function(value, text){
		var modeValue;
		if (this.options.postMode == "value") {
			modeValue = value;
		} 
		if (this.options.postMode == "text") {
			modeValue = text;
		}
		if (this.options.postMode == "value-text") {
			modeValue = value + "-" + text;
		}
		return modeValue;
	},
	unselect: function(value) {
		var opts  = this.options,
		    data  = this.getData(),
		    values= this.getValues(),
		    i;
		var matchedIndex = 0;
		for (i = 0 ; i < data.length ; i++) {
			if (value == data[i][opts.valueField]) {
				matchedIndex = i;
			}
		}
		if (this.options.postMode == "value") {
			value = value;
		} 
		if (this.options.postMode == "text") {
			value = data[matchedIndex][opts.textField];
		}
		if (this.options.postMode == "value-text") {
			value = value + "-" + data[matchedIndex][opts.textField];
		}
		for(i = 0; i < values.length; i++) {
			if (values[i] == value) {
				values.splice(i, 1);
				this.setValues(values, true, false);
				this._trigger("onSelect", null, [{
					"item" : data[matchedIndex],
					"value" : value,
					"text" : data[matchedIndex][opts.textField]
				}]);
				break;
			}
		}
	},
	showPanel: function() {
		//openPanel，将之前的高亮标签删除
		this._removeHighlight(this.uiCombo.pContent.find("span.coral-keyword-highlight"));
		var i = 0, value;
		this._super();
		if (!this.hideValueArr) return ;
		// 隐藏选项处理
		for (; i < this.hideValueArr.length; i++) {
			value = this.hideValueArr[i];
			this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + value + "\"]").addClass("hidden");
			//this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + value + "\"]").hide();
		}
	},
	// 添加下拉选项
	addOption: function(option) {		
		var that = this, i = 0, item = null,
		    valueField = this.options.valueField,
		    textField  = this.options.textField,
		    v = option[valueField],
		    s = option[textField];
		// 判断数据格式
		if (!(valueField in option) || !(textField in option)) {
			if ($.message) { 
				$.message("JSON格式不正确!");
			}
			return false;
		}
		// 检查valueField值是否重复
		for (i = 0; i < this.data.length; i++) {
			if ((option[valueField] == this.data[i][valueField]) || (option[textField] == this.data[i][textField]) ) {
				if ($.message) $.message("当前选项已存在!");
				return false;
			}
		}
		// 同步缓存 并 向下拉面板添加相应的选项
		item = $("<div class=\"coral-combobox-item\"></div>");
		item.attr("value", v);
		if (this.options.formatter) {
			item.html(this.options.formatter.call(this.element, option));
		} else {
			item.html(s);
		}
		if (this.data.length > 0 && "" == this.data[0][valueField]) {
			this.data.splice(1, 0, option);
			item.insertAfter(this.uiCombo.pContent.find(":first-child"));
		} else {
			this.data.unshift(option);
			item.prependTo(this.uiCombo.pContent);
		}
		// 事件绑定
		/*item.hover(
				function() { $(this).addClass("coral-combobox-item-hover");   },
				function() { $(this).removeClass("coral-combobox-item-hover");}
			).click(function() {
				var item = $(this), value = item.attr("value");
				
				if (that.options.multiple) {
					if ("" == value) {
						that.clear();
						that.select(value);
						that.hidePanel();
						return ;
					} else {
						if (that.options.emptyText) {
							that.unselect("");
						}
						if (item.hasClass("coral-combobox-item-selected")) {
							that.unselect(value);
						} else {
							that.select(value);
						}
					}
				} else {
					that.select(value);
					that.hidePanel();
				}
			});	*/	
		return true;
	},
	// 删除下拉选项
	removeOption: function(option/*索引值 隐藏值 或下拉选项JSON格式*/) {
		var _option = null, value = null, i = 0,
		    valueField = this.options.valueField,
		    pos = null;
		// 索引值 
		if (typeof option === "number") {
			if (option > this.data.length) return ;
			_option = this.data[i];
			pos    = option;
		}
		// 隐藏值
		if (typeof option === "string") {
			value = option;
		}
		// 下拉选项JSON格式
		if (typeof option === "object") {
			if (!(valueField in option)) return;
			value = option[valueField];
		}
		// 查找对应的位置
		if (value !== null) {
			for (; i < this.data.length; i++) {
				 if (value == this.data[i][valueField]) {
					 _option = this.data[i];
					 pos     = i;
					 break;
				 }
			}
		}
		// 删除下拉选项相应信息
		if (pos !== null) {
			this.data.splice(pos, 1);
			this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + value + "\"]").remove();
		}
	},
	// 清除下拉框所有选项，病清除 value && text
	clearOptinons: function() {
		this.uiCombo.pContent.empty();
		this.clear();		
	},
	// 显示下拉选项
	showOption: function (option/*索引值 隐藏值 或下拉选项JSON格式*/) {
		var jq;
		if (typeof option === "number") {
			jq = this.uiCombo.pContent.find(".coral-combobox-item:eq(" + option + ")");
		} else if (typeof option === "string") {
			jq = this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + option + "\"]");
		} else if (typeof option === "object") {
			if (!(this.options.valueField in option)) return;
			jq = this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + option[this.options.valueField] + "\"]");
		} else {
			this.uiCombo.pContent.find(".coral-combobox-item").removeClass("hidden");
			this.hideValueArr = null;
		}
		if (jq && jq.length > 0) {
			jq.removeClass("hidden");// 此处不能通过hide方法，，必须removeClass hidden
			if (this.hideValueArr) {
				if($.inArray(jq.attr("value"), this.hideValueArr) > -1){
					this.hideValueArr.splice($.inArray(jq.attr("value"), this.hideValueArr), 1);
				}
			}
		}
	},
	// 隐藏下拉选项
	hideOption : function (option/*索引值 隐藏值 或下拉选项JSON格式*/) {
		if (!this.hideValueArr) this.hideValueArr = [];
		var jq;
		if (typeof option === "number") {
			jq = this.uiCombo.pContent.find(".coral-combobox-item:eq(" + option + ")");
		} else if (typeof option === "string") {
			jq = this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + option + "\"]");
		} else {
			if (!(this.options.valueField in option)) return;
			jq = this.uiCombo.pContent.find(".coral-combobox-item[value=\"" + option[this.options.valueField] + "\"]");
		}
		if (jq && jq.length > 0) {
			jq.addClass("hidden");//此处必须通过class hidden来控制，否则会和过滤的功能冲突
			if($.inArray(jq.attr("value"),this.hideValueArr) == -1){
				this.hideValueArr.push(jq.attr("value"));
			}
		}
	}
});
})();
// noDefinePart
} ) );