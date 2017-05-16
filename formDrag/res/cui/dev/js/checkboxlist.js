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
/*!
 * 组件库4.0：复选框组
 * 
 * 依赖JS文件：
 *    jquery.coral.core.js
 *    jquery.coral.component.js
 *    jquery.validatehelper.js
 */

$.component("coral.checkboxlist", $.coral.formelement, {
	version: "4.0.1",
	castProperties : ["data", "triggers","showRequiredMark","hideRequiredMark","shortCut"],
	options: {
		id:null,
		name:null,
		valueField:"value",
		textField :"text",
		//width : "auto",
		//height : 22,
		required: false,
		showStar: true,
		maxLabelWidth : "auto",
		labelField: null, // 表单元素前面的文本
		starBefore: false, // 必输项 * 是否前面
		column: null, // 每行放几个复选框
		disabled: false,
		readonly:false,
		isLabel:false,
		value: "",
		data:null, // 数组形式: [{value:,text:},...]或者 字符串形式: "cn:中国;us:美国;..."
		url: null,
		termSplit : ";", // 如果data是字符串，则termSplit作为复选框组的分隔符
		itemSplit : ":", // 如果data是字符串，则每个复选框隐藏值与显示值的分隔符
		errMsg: null,
		errMsgPosition: "leftBottom",
		repeatLayout: "table", // "table", "flow" // flow 时自适应
		itemWidth: "auto", // repeatLayout 为 flow 时，radio item 控制宽度，用于对齐
		
		onValidError: null,
		onKeyDown: null,
		onValidSuccess: null,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false, // true 则不单独校验
		onChange: $.noop /*参数(event, {value:string,checked:boolean})*/
	},
    _create: function () {
    	var that = this,
    	    textbox = null, 
    	    valuebox = null,
    	    uiArrow = null,
    	    options = this.options;
    	if (!this.element.jquery) {
    		this.element = $(this.element);
    	}
    	
    	this.element.addClass("coral-form-element-checkboxlist  ctrl-init ctrl-form-element ctrl-init-checkboxlist coral-validation-checkboxlist");

    	typeof that.element.attr("id") == "undefined" && !!that.options.id&&that.element.attr( "id", that.options.id );
    	that.options.id = that.element.uniqueId().attr("id");    	
    	var name = that.element.attr("name");
    	typeof name != "undefined" ? (that.options.name = name) : (that.element.attr("name", that.options.name));
		this.uiBoxlist = $("<span class=\"coral-checkboxlist\"></span>");
		this.uiInput   = $("<input type=\"hidden\">");
		if (this.options.name) {
			this.uiInput.attr("name", this.options.name);
		}
		if (this.options.value) {
			this.uiInput.val(this.options.value);
		}
		
		this._initData();	
		this._bindEvent();
		this.uiInput.appendTo(this.uiBoxlist);
		// add label and required star before function @lhb @2015-04-27 add labelField attribute
		if (options.labelField) {
			this.uiLabel = $("<label class=\"coral-label\">"+ options.labelField +"</label>");
			this.uiBoxlist.prepend(this.uiLabel);
			this.uiBoxlist.addClass("coral-hasLabel");
		}
		// add label and required star before function @lhb @2015-04-27
		this.uiBoxlist.insertAfter(this.element);		
		this.element.hide();		
		
	},
	reload: function( url ){
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
		this._bindEvent();
	},
	/**
	 * 获取生成筛选框的数据
	 * @returns
	 */
	_initData : function () {
		var that = this,
			options = this.options;
		if (this.options.url) {
			//data = $.loadJson(this.options.url);
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
		}else if (this.options.data) {
			this._loadData(this.options.data);
		}
		/*data = data || this.options.data;
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
		}*/
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
		var tmpArr = null, checked=[],row,useData = [],arrayData=[],
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
				checked.push(row[this.options.valueField]);
			}
			arrayData.push(row[this.options.valueField]);
		}
		if(this.options.value) {
			checked = this.options.value.split(",");
		}
		if(this.options.clearOnLoad){
			for(var j = 0; j < checked.length; j++){
				if($.inArray(checked[j],arrayData) > -1){
					useData.push(checked[j]);
				}
			}
			checked = useData;
		}
		if ( !this.isInit ) {
			this.isInit = true;
			this.originalValue = checked.join(",");
		}
		this._renderChkItem();
		this.setValue(checked);
	},
	_renderChkItem: function(){
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
			this._renderBorderItem();
			this.uiBorder.appendTo(this.uiBoxlist);
		}		
	},
	reset: function(){
		this.setValue(this.originalValue);
	},
	_renderBorderItem: function () {
		var that = this,
			opts = this.options,
			column = this.options.column,
			data = this.data;
		
		that.uiBorder = $("<span class=\"coral-checkboxlist-border\"></span>");
		
		for (var i in data) {
			if ( i > (column-1) && i%(column) == 0) {
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
		var isHidden = cellData.hidden == true?"hidden":"";
		var uiCheckbox = $("<span class='coral-checkbox tabbable "+isHidden+"'tabindex=0></span>"),
		    uiLabel    = $("<span class='coral-checkbox-label'></span>"),
		    uiIcon = $("<span class='coral-checkbox-icon'></span>"),
		    maxLabelWidth = this.options.maxLabelWidth,
		    uiText = $(),
		    value      = cellData[this.options.valueField],
		    text       = cellData[this.options.textField];
		
		//uiCheckbox.val( value );	
		if ( maxLabelWidth == "auto" ){
			uiText = $("<span class=\"coral-checkbox-text\"></span>");
		}else{
			uiText = $("<span class=\'coral-checkbox-text\'  title=\'"+text+"\' style=\'max-width:"+maxLabelWidth+"px;\'></span>");
		}
		uiCheckbox.attr( "data-value", value );	
		
		uiLabel.append(uiIcon).append(uiText);
		uiLabel.appendTo(uiCheckbox);
		uiIcon.addClass("cui-icon-checkbox-unchecked");
		uiText.append(text);
		
		return uiCheckbox;
	}, 
	_bindEvent: function() {
		var that = this;
		
		if ( this.options.disabled ) {
			this._setDisabled(this.options.disabled);
		}
		if ( this.options.readonly ) {
			this._setReadonly(this.options.readonly);
		}
		if ( this.options.isLabel ) {
			this._setIsLabel(this.options.isLabel);
		}
		this.uiBoxlist.find(".coral-checkbox").each(function() {
			$(this).bind("click" + that.eventNamespace, function( event ) {
				that._selectItems(event)
				event.stopPropagation();
			});
		});
		this._on( {
			"keydown .coral-checkbox": function( e ) {
				var keyCode = $.coral.keyCode,options = that.options;
				switch (e.keyCode) {
					case keyCode.SPACE:
						e.preventDefault();
						that._selectItems(e);
						break;
				}
				if(options.shortCut){
					$.coral.callFunction(options.shortCut,event,this);
				}
				that._trigger( "onKeyDown", e, {} );
			},
			"focus .coral-checkbox": function(e) {
				var uiCheckbox = $(e.target).closest( ".coral-checkbox" );
				uiCheckbox.addClass("coral-checkbox-highlight");
			},
			"blur .coral-checkbox": function(e) {
				var uiCheckbox = $(e.target).closest( ".coral-checkbox" );
				uiCheckbox.removeClass("coral-checkbox-highlight");
			},
			"mouseenter .coral-checkbox": function(e) {
				var uiCheckbox = $(e.target).closest( ".coral-checkbox" );
				if (uiCheckbox.hasClass("coral-state-disabled")) {
					return;
				}
				uiCheckbox.addClass("coral-checkbox-hover");
			},
			"mouseleave .coral-checkbox": function(e) {
				var uiCheckbox = $(e.target).closest( ".coral-checkbox" );
				if (uiCheckbox.hasClass("coral-state-disabled")) {
					return;
				}
				uiCheckbox.removeClass("coral-checkbox-hover");
			}
		});
		this.uiBoxlist.find(".coral-checkbox-label").each(function() {
			$(this).bind("click" + that.eventNamespace, function( event ) {
				if (that.options.readonly || that.options.isLabel) {
					return false;
				}				
			})
		});	
	},
	_selectItems: function(e) {
		var that = this;
		if (that.options.disabled) {
			return;
		}
		if (that.options.readonly ){
			return;
		}
		if (that.options.isLabel) {
			return;
		}
		var uiCheckbox = $( e.target ).closest( ".coral-checkbox" ),
			  uiIcon = uiCheckbox.find(".coral-checkbox-icon");
		
		if (uiCheckbox.hasClass("coral-state-disabled")||uiCheckbox.hasClass("coral-readonly")||uiCheckbox.hasClass("coral-isLabel")) {
			event.stopPropagation();
			return;
		}
		if (uiIcon.hasClass("coral-checkboxlist-item-highlight")) {
			uiIcon.removeClass("cui-icon-checkbox-checked coral-checkboxlist-item-highlight").addClass("cui-icon-checkbox-unchecked");
			uiCheckbox.removeClass("coral-checkbox-highlight");
		} else {
			uiIcon.removeClass("cui-icon-checkbox-unchecked").addClass("coral-checkboxlist-item-highlight cui-icon-checkbox-checked");
			uiCheckbox.addClass("coral-checkbox-highlight");
		}
		var oldValue = that.getValue();
		that._changeValue();
		that._trigger("onChange", null, {value: that.uiInput.val(),oldValue:oldValue, checked: uiIcon.hasClass("coral-checkboxlist-item-highlight")});
	},
	_changeValue: function() {
		var that = this, valArr = [];

		this.uiBoxlist.find(".coral-checkbox").each(function() {
			if ($(this).find(".coral-checkbox-icon").hasClass("coral-checkboxlist-item-highlight")) {				
				valArr.push( $(this).attr("data-value") );
			}			
		});
		
		this.uiInput.val(valArr.toString());
	},
	_setDisabled: function(disabled) {
		disabled = !!disabled;

		this.uiBoxlist.find(".coral-checkbox").each(function() {
			$(this).toggleClass( "coral-state-disabled", disabled );
			$(this).toggleClass( "tabbable", !disabled );
		});
		
		this.options.disabled = disabled;
	},
	_setReadonly: function(readonly) {
		readonly = !!readonly;

		this.uiBoxlist.find(".coral-checkbox").each(function() {
			$(this).toggleClass( "coral-readonly", readonly );
			$(this).toggleClass( "tabbable",!readonly );
		});
		
		this.options.readonly = readonly;
	},	
	_setIsLabel:function(isLabel){
		isLabel = !!isLabel;

		this.uiBoxlist.find(".coral-checkbox").each(function() {
			$(this).toggleClass( "coral-isLabel", isLabel );
			$(this).toggleClass( "tabbable",!isLabel );
		});
		
		this.options.isLabel = isLabel;
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
		if (key === "isLabel") {
			this._setIsLabel(value);
		}
		if (key === "disabled") {
			this._setDisabled(value);
			return;
		}
		if (key ==="maxLabelWidth"){
			var maxLabelWidth = value;
			if ( value != "auto" ){
				maxLabelWidth = maxLabelWidth+"px";
                var array = this.component().find(".coral-checkbox-text");
                for( var i=0;i<array.length;i++){
                	var text = $(array[i]).html();
                	$(array[i]).attr("title",text);
                }
			} else {
				maxLabelWidth = "";
				this.component().find(".coral-checkbox-text").attr("title","");
			}
			this.component().find(".coral-checkbox-text").css("max-width",maxLabelWidth);
		}
		this._super(key, value );
	},
	_destroy : function() {
		this.component().remove();
		if (this.options.name) {
			this.element.removeAttr("orgname").attr("name", this.options.name);
		}
		this.element.removeClass("coral-form-element-checkboxlist");
		this.element.removeClass("coral-validation-checkboxlist");
		this.element.show();
	},
	focus: function() {
		//TODO:focus
	},
	component : function() {
		return this.uiBoxlist;
	},
	disable : function() {
		this._setOption("disabled", true);
		this._setDisabled(true);
	},
	readonly : function(){
		this._setReadonly("readonly",true);
	},
	enable : function() {
		this._setOption("disabled", false);
		this._setDisabled(false);
	},
	disableItem : function (value) {
		this.uiBoxlist.find(".coral-checkbox[data-value=\"" + value + "\"]").toggleClass( "coral-state-disabled", true );
	},
	enableItem : function (value) {
		this.options.disabled = false;
		
		var item = this.uiBoxlist.find(".coral-checkbox[data-value=\"" + value + "\"]").toggleClass( "coral-state-disabled", false );		
	},
	show : function() {
		this.component().show();
	},
	hide : function() {
		this.component().hide();
	},
	getValue : function() {
		return this.uiInput.val();
	},
	setValue : function(value, force) {
		var oldValue = this.getValue() || [];
		this.uiBoxlist.find(".coral-checkboxlist-item-highlight").each(function() {
			$(this).removeClass("cui-icon-checkbox-checked coral-checkboxlist-item-highlight").addClass("cui-icon-checkbox-unchecked");
		});
		value = value || "";
		var i = 0, valArr = $.isArray(value) ? value 
				: ((!value || typeof value !== "string" || "" === $.trim(value)) ? [] : value.split(","));
		for (; i < valArr.length; i++) {
			this.uiBoxlist.find(".coral-checkbox[data-value=\"" + valArr[i] + "\"]").find(".coral-checkbox-icon")
							   .removeClass("cui-icon-checkbox-unchecked").addClass("cui-icon-checkbox-checked coral-checkboxlist-item-highlight");
		}
		
		this.uiInput.val(valArr.toString());
		
		/*if (force !== true) {
			this.valid();
		}*/
	},
	// 反选 force 的意义同 setValue 中的 force
	invertCheck : function (force) {
		var valArr = [];
		
		this.uiBoxlist.find(".coral-checkboxlist-item-highlight").each(function() {
			$(this).removeClass("cui-icon-checkbox-checked coral-checkboxlist-item-highlight").addClass("coral-checkbox-temp");
		});
		this.uiBoxlist.find(".cui-icon-checkbox-unchecked").each(function() {
			$(this).removeClass("cui-icon-checkbox-unchecked").addClass("cui-icon-checkbox-checked coral-checkboxlist-item-highlight");
		});
		this.uiBoxlist.find(".coral-checkbox-temp").each(function() {
			$(this).removeClass("coral-checkbox-temp").addClass("cui-icon-checkbox-unchecked");
		});
		
		this.uiBoxlist.find(".coral-checkbox").each(function() {
			if ($(this).find(".coral-checkbox-icon").hasClass("coral-checkboxlist-item-highlight")) {
				valArr.push( $(this).attr("data-value") );
			}			
		});
		
		this.setValue(valArr, force);		
	},
	// 全选；若要反选请使用 setValue(null)
	checkAll : function () {
		var valArr = [], i = 0, row = null, data = this.data;
		for (; i < data.length; i++ ) {
			row = data[i];
			valArr.push(row[this.options.valueField]);
		}
		this.setValue(valArr);
	},
	// 获取指定项的显示名称
	getText : function (values/*String:"CN,US,EN" or Array:["CN","US","EN"]*/) {
		var i    = 0, 
		    data = this.data,
		    val  = null,
		    txtArr = [];
		if (!values) {
			values = this.getValue().split(",");
		} else if (typeof values) {
			values = values.split(",");
		}
		for (; i < data.length; i++) {
			val = data[i][this.options.valueField];
			if ($.inArray(val, values) > -1) txtArr.push(data[i][this.options.textField]);
		}
		return txtArr.toString();
	}
});
// noDefinePart
} ) );