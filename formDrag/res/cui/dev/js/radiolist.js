( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./formelement",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.component("coral.radiolist", $.coral.formelement,{
	version: "4.0.1",
	castProperties : ["data", "triggers","showRequiredMark","hideRequiredMark","shortCut"],
	options: {
		id: null,
		name: null,
		valueField: "value",
		textField : "text",
		//width : "auto",
		//height : 22,
		required : false,
		labelField: null, // 表单元素前面的文本
		starBefore: false, // 必输项 * 是否前面
		showStar: true,
		column : null, // 每行放几个单选框
		disabled : false,
		readonly:false,
		isLabel : false,
		isCheck: false,
		allowCancel:false,
		value : "",
		valueIndex: null, // number
		data  : [], // 数组形式: [{value:,text:},...]或者 字符串形式: "cn:中国;us:美国;..."
		url   : null,
		termSplit : ";", // 如果data是字符串，则termSplit作为复选框组的分隔符
		itemSplit : ":", // 如果data是字符串，则每个复选框隐藏值与显示值的分隔符
		repeatLayout: "table", // "table", "flow" // flow 时自适应
		itemWidth: "auto", // repeatLayout 为 flow 时，radio item 控制宽度，用于对齐

		errMsg: null,
		errMsgPosition: "leftBottom",
		onLoad: null, // url
		onValidError: null,
		onKeyDown: null,
		onValidSuccess: null,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false, // true 则不单独校验
		onChange : $.noop /*参数(event, {value: string, checked: boolean})*/
	},
    _create: function () {
    	var that = this,
    	    textbox = null, 
    	    valuebox = null,
    	    uiArrow = null,
    	    options = this.options;
    	
    	this._prepareInit();
    	this._initComponent();
    	this._setDefaultValue();
		// 数据处理
		this._initData();
		this._bindEvent();
		
		if ( this.options.url || this.options.data) {
			this._trigger("onLoad", null, [{data: this.getData()}]);
		}
	},
	_prepareInit: function(){
		this.isInit = false;
	},
	_initComponent: function(){
		this.element.addClass("coral-form-element-radiolist coral-validation-radiolist ctrl-init ctrl-form-element ctrl-init-radiolist");

    	typeof this.element.attr("id") == "undefined" && !!this.options.id&&that.element.attr( "id", this.options.id );
    	this.options.id = this.element.uniqueId().attr("id");
    	
    	var htmlValue = this.element.attr("value");
    	if (htmlValue){
    		this.options.value=htmlValue;
    	}
    	
    	var name = this.element.attr("name");
    	typeof name != "undefined" ? (this.options.name = name) : (this.element.attr("name", this.options.name));

    	this.uiBoxlist = $("<span class=\"coral-radiolist\"></span>");
		this.uiInput   = $("<input type=\"hidden\">");
		if (this.options.name) {
			this.uiInput.attr("name", this.options.name);
			this.element.removeAttr("name").attr("orgname", this.options.name);
		}
		this.uiInput.appendTo(this.uiBoxlist);
		// add label before function @lhb @2015-04-27 add labelField attribute
		if (this.options.labelField) {
			this.uiLabel= $("<label class=\"coral-label\">"+ this.options.labelField +"</label>");
			this.uiBoxlist.prepend(this.uiLabel);
			this.uiBoxlist.addClass("coral-hasLabel");
		}
		this.uiBoxlist.insertAfter(this.element);
		this.element.hide();
	},
	_setDefaultValue: function() {
		
	},
	reload: function(url){
		var that = this,
	    opts = {}, 
	    data = [], 
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
	    this.uiBoxlist.empty();
	    if (isUrl){
	    	if ( this.xhr ){
				this.xhr.abort();
			}
			this.xhr = $.ajax(this._ajaxSettings( ));
			this.xhr
				.success(function( data ) {
					that._loadData(data);
				}).complete(function( jqXHR, status ) {
					if ( jqXHR === that.xhr ) {
						that.xhr = null;
					}
				}).error(function(){
					 $.alert( "Json Format Error!" );
				});
	     } else{
			 that._loadData(data);
	     }
	},
	/**
	 * 获取生成筛选框的数据
	 * @returns
	 */
	_initData: function() {
		var that = this,
			options = this.options;

		if (options.url) {
			if ( this.xhr ){
				this.xhr.abort();
			}
			this.xhr = $.ajax(this._ajaxSettings( ));
			this.xhr
				.success(function( data ) {
					that._loadData(data);
				}).complete(function( jqXHR, status ) {
					if ( jqXHR === that.xhr ) {
					    that.xhr = null;
					}
				}).error(function(){
					 $.alert( "Json Format Error!" );
				});
		} else if (options.data) {
			this._loadData(options.data);
		}
	},
	_ajaxSettings :function(){
		var opts = this.options,
	        that = this;
		return {
			type: "get",
			url: opts.url,
			data: {},
			async: false,
			dataType: "json"
		};
	},
	_loadData : function (data) {
		var tmpArr = null, row,checked,
	        i = 0, option = null, 
	        tmpRow = null, rowArr = null;
		if (typeof data === "string") {
			tmpArr = data.split(this.options.termSplit);
			data = [];
			for (; i < tmpArr.length; i++) {
				tmpRow = tmpArr[i];
				rowArr = tmpRow.split(this.options.itemSplit);
				option = {};
				option[this.options.valueField] = rowArr[0];
				option[this.options.textField]  = rowArr[1];
				data.push(option);
			}
		}
		this.data = data;
		for(i;i<data.length;i++){
			row = data[i];
			if(row['checked']){
				checked=row[this.options.valueField];
			}
		}
		if (this.options.value) {
			checked = this.options.value;
		}
		if ( !this.isInit ) {
			this.isInit = true;
			this.originalValue = checked;
		}
		this._renderRadioItem();
		this.setValue(checked);
	},
	_renderRadioItem: function(){
		// 创建复选框组
		if (this.options.repeatLayout == "table") {
			if (this.options.column == null ) {
				this.options.column = 3;
			} 
			this._renderTableItem();
			this.uiTable.appendTo(this.uiBoxlist);
		} else if (this.options.repeatLayout == "flow") {
			if (this.options.column == null ) {
				this.options.column = this.data.length;
			} 
			this._renderFlowItem();
			this.uiBorder.appendTo(this.uiBoxlist);
		}		
		
	},
	reset: function(){
		this.setValue(this.originalValue);
	},
	/**
	 * 返回data ( url / data )
	 */
	getData: function () {
		return this.data;
	},
	_renderFlowItem: function () {
		var that = this,
			opts = this.options,
			column = this.options.column,
			data = this.data;
		
		that.uiBorder = $("<span class=\"coral-radiolist-border\"></span>");
		
		for (var i in data) {
			if ( i > (column-1) && i%(column) === 0) {
				$("<br/>").appendTo(that.uiBorder);
			}
			that._renderItem(data[i]).css("width", opts.itemWidth).appendTo(that.uiBorder);
		}
	},
	_renderTableItem: function () {
		this.uiTable = $("<table></table>");
		
		var i = 0, j = 0, 
		    data = this.data, 
		    len  = data.length || 0, 
		    column = this.options.column,
		    rows = 0, uiTr = null, uiTd = null;
		
		if (!data || data.length < 1) return;
		
		rows = Math.ceil(len/column);
		
		for (; i < rows; i++) {
			uiTr = $("<tr></tr>");
			for (j = 0; j < column ; j++) {
				uiTd = $("<td></td>");
				if ((i*column + j) < len) {
					this._renderItem(data[(i*column + j)]).appendTo(uiTd);
				}
				uiTd.appendTo(uiTr);
			}
			uiTr.appendTo(this.uiTable);
		}
	},
	_renderItem : function (cellData) {
		var data = this.data,uiRadio,isHidden,isTabIndex,isTabbable,
			isChecked = false;
		for (var i=0 ; i<data.length ; i++) {
			if(data[i]['checked'] == true){
				isChecked = true
			}
			//isChecked = data[i]['checked'] === true;
		}
		if(!isChecked){
			//data[0]['checked'] = true;
			this.tabIndex = 0;
		} else {
			this.tabIndex = i;
		}
		isHidden = cellData.hidden === true?"hidden":"";
		isTabIndex = cellData.checked === true ? "tabindex = 0" : "";
		isTabbable = cellData.checked === true ? "tabbable" : "";
		if(!isChecked && cellData[this.options.valueField] == data[0].value){
			isTabIndex = "tabindex = 0";
			uiRadio = $("<span class='coral-radio "+ isHidden + "tabbable '"+ isTabIndex +"></span>");
		}else{
			uiRadio = $("<span class='coral-radio "+ isHidden + isTabbable +"'"+ isTabIndex +"></span>");
		}
	    uiLabel    = $("<label class='coral-radio-label'></label>"),
	    uiIcon = $("<span class='coral-radio-icon'></span>"),
	    value      = cellData[this.options.valueField],
	    text       = cellData[this.options.textField];
		uiRadio.attr("value", value);	
		uiLabel.append(uiIcon).append(text);
		uiLabel.appendTo(uiRadio);
		uiIcon.addClass("cui-icon-radio-unchecked");
		
		return uiRadio;
	}, 
	_bindEvent: function() {
		var that = this;
		
		if ( this.options.disabled ) {
			this._setDisabled ( this.options.disabled );
		}
		if ( this.options.readonly ) {
			this._setReadonly(this.options.readonly);
		}
		if ( this.options.isLabel ) {
			this._setIsLabel(this.options.isLabel);
		}
		this._on( {
			"mouseenter .coral-radio": function( e ){
				if ( that.options.readonly || that.options.isLabel ) {
					return false;
				}
				var radio = $( e.target ).closest( ".coral-radio" );
				if ( $( radio ).hasClass( "coral-state-disabled" ) ) {
					return;
				}
				$( radio ).addClass( "coral-radio-hover" );
			},
			"mouseleave .coral-radio": function( e ){
				if ( that.options.readonly || that.options.isLabel ) {
					return false;
				}
				var radio = $( e.target ).closest( ".coral-radio" );
				if ( $( radio ).hasClass( "coral-state-disabled" ) ) {
					return;
				}
				$( radio ).removeClass( "coral-radio-hover" );
			},
			"focus .coral-radio": function( e ){
				var radio = $( e.target ).closest( ".coral-radio" );
				$( radio ).addClass("coral-radio-highlight");
			},
			"blur .coral-radio": function( e ){
				var radio = $( e.target ).closest( ".coral-radio" );
				$( radio ).removeClass("coral-radio-highlight");
			},
			"keydown .coral-radio": function( e ){
				var keyCode = $.coral.keyCode,options = this.options;
				var radioList = $( e.target ).closest( ".coral-radiolist" ),
					radio = radioList.find(".coral-radio");
					record = 0,
					isChecked = true;
				$.each (radio , function(i) {
					if (radio[i] == document.activeElement) {
						record = i;
					}
					isChecked = $(radio[i]).attr("checked") === true;
				});
				switch (e.keyCode) {
					case keyCode.SPACE:
						e.preventDefault();
//						if(!isChecked){
//							var value  = $(radio[i]).attr( "value" );
//							that.setValue( value );
//						}
						that._selectItem(e);
						break;
					case keyCode.LEFT:
						e.preventDefault();
						if ( that.options.readonly || that.options.isLabels ) {
							return false;
						}				
						if (record == 0) {
							record = radio.length;
						}
						var uiRadio = $(radio[record - 1]),
							uiIcon = uiRadio.find( ".coral-radio-icon" ),
							value   = uiRadio.attr( "value" );
						uiRadio.attr("tabindex","0");
						$(radio[record]).removeAttr("tabindex");
						uiRadio.addClass("tabbable");
						$(radio[record]).removeClass("tabbable");
						that.setValue( value );
						setTimeout(function(){
							uiRadio.focus();
						});
					    that._trigger( "onChange", null, {value: value, checked: uiIcon.hasClass( "coral-radiolist-item-hightlight" )} );
						break;
					case keyCode.RIGHT:
						e.preventDefault();
						if ( that.options.readonly || that.options.isLabel ) {
							return false;
						}		
						if(record == radio.length -1){
							record = -1;
						}
						var uiRadio = $(radio[record + 1]),
							uiIcon = uiRadio.find( ".coral-radio-icon" ),
							value   = uiRadio.attr( "value" );
						uiRadio.attr("tabindex","0");
						$(radio[record]).removeAttr("tabindex");
						uiRadio.addClass("tabbable");
						$(radio[record]).removeClass("tabbable coral-radio-highlight");
						that.setValue( value );
						setTimeout(function(){
							uiRadio.focus();
						});
						that._trigger( "onChange", null, {value: value, checked: uiIcon.hasClass( "coral-radiolist-item-hightlight" )} );
						break;
				}
				if(options.shortCut){
					$.coral.callFunction(options.shortCut,event,this);
				}
				that._trigger( "onKeyDown", e, {} );
			},
			"click .coral-radio": function( e ){
				if (that.options.disabled || that.options.readonly) {
					return ;
				}
				that._selectItem(e);
				e.stopPropagation();
			}
		} );
	},
	_selectItem: function(e) {
		var that = this;
		var radioList = $(".coral-radiolist").find(".coral-radio");;
		var radio = $( e.target ).closest( ".coral-radio" );
		if ( that.options.readonly || that.options.isLabel) {
			return false;
		}	
		var uiRadio = radio,
			uiIcon = uiRadio.find( ".coral-radio-icon" ),
		    value   = uiRadio.attr( "value" ),
		    oldValue = that.getValue();
		$.each (radioList , function(i) {
			if ($(radioList[i]).hasClass("tabbable")) {
				$(radioList[i]).removeClass("tabbable");
				$(radioList[i]).removeAttr("tabindex");
			}
		})
		uiRadio.addClass("tabbable");
		uiRadio.attr("tabindex","0");
		uiRadio.focus();
		if ( value == oldValue ){
			if ( !this.options.allowCancel ) return false;
			uiIcon.removeClass( "cui-icon-radio-checked coral-radiolist-item-hightlight " ).addClass( "cui-icon-radio-unchecked" );
			radioList.removeClass("coral-radio-highlight")
			that.uiInput.val( "" );
		} else {
		    that.setValue( value );
		    that._trigger( "onChange", null, {value: value, checked: uiIcon.hasClass( "coral-radiolist-item-hightlight" )} );
		}
	},
	_setDisabled: function(disabled) {
		disabled = !!disabled;
		
		this.uiBoxlist.find(".coral-radio").each(function() {
			$(this).toggleClass( "coral-state-disabled", disabled );
			$(this).toggleClass( "tabbable", !disabled );
		});
		
		this.options.disabled = disabled;
	},	
	_setReadonly: function(readonly) {
		readonly = !!readonly;
		
		this.uiBoxlist.find(".coral-radio").each(function() {
			$(this).toggleClass( "coral-readonly", readonly );
			$(this).toggleClass( "tabbable", !readonly );
		});
		
		this.options.readonly = readonly;
	},
	_setIsLabel : function(isLabel){
		isLabel = !!isLabel;
		
		this.uiBoxlist.find(".coral-radio").each(function() {
			$(this).toggleClass( "coral-isLabel", isLabel );
			$(this).toggleClass( "tabbable", !isLabel );
		});
		
		this.options.isLabel = isLabel;
	},
	_setOption: function(key, value) {
		if (key === "id" || key === "name") {
			return ;
		}

		if (key === "disabled") {
			this._setDisabled(value);
		}
		if (key === "readonly") {
			this._setReadonly(value);
		}
		if (key === "isLabel") {
			this._setIsLabel(value);
		}
		this._super(key, value );
	},
	_destroy: function() {
		// ??
		this.component().remove();
		
		if (this.options.name) {
			this.element.removeAttr("orgname").attr("name", this.options.name);
		}
		this.element.removeClass("coral-form-element-radiolist");
		this.element.removeClass("coral-validation-radiolist");
		this.element.show();
	},
	focus: function(){
		//TODO: focus 
	},
	component: function() {
		return this.uiBoxlist;
	},
	disable: function() {
		this._setDisabled(true);
	},
	readonly: function(){
		this._setReadonly(true);
	},
	enable: function() {
		this._setDisabled(false);
	},
	disableItem: function (value) {
		this.uiBoxlist.find( ".coral-radio[value=\"" + value + "\"]" ).toggleClass( "coral-state-disabled", true );
	},
	enableItem: function (value) {
		this.options.disabled = false;
		this.uiBoxlist.find( ".coral-radio[value=\"" + value + "\"]" ).toggleClass( "coral-state-disabled", false );
	},
	show: function() {
		this.component().show();
	},
	hide: function() {
		this.component().hide();
	},	
	getValue: function() {
		return this.uiInput.val();
	},
	setValue: function( value ) {
		value = value || "";
		this.uiBoxlist.find(".coral-radiolist-item-hightlight").each(function() {
			$(this).removeClass("cui-icon-radio-checked coral-radiolist-item-hightlight").addClass("cui-icon-radio-unchecked");
		});
		
		var item = this.uiBoxlist.find(".coral-radio[value=\"" + value + "\"]").find(".coral-radio-icon")
			.removeClass("cui-icon-radio-unchecked").addClass("cui-icon-radio-checked coral-radiolist-item-hightlight");
//		this.uiBoxlist.find(".coral-radio").removeClass("coral-radio-highlight");
//		this.uiBoxlist.find(".coral-radio[value=\"" + value + "\"]").addClass("coral-radio-highlight");
		
		this.uiInput.val( value );	
	},
	// 获取指定项的显示名称
	getText: function (value) {
		var i    = 0, 
		    data = this.data,
		    val  = null,
		    txtArr = [];
		if (!value) {
			value = this.getValue();
		}
		for (; i < data.length; i++) {
			val = data[i][this.options.valueField];
			if (val == value) return (data[i][this.options.textField]);
		}
		return "";
	}
});
// noDefinePart
} ) );