( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./combo",
            "./grid"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.combogrid", $.coral.combo, {
	version: "4.0.3",
	castProperties : ["colNames", "colModel", "data", "buttonOptions", "gridOptions","buttons","shortCut", "searchColumns"],
	options: {
		colNames: [],
		colModel : [],
		valueField: "id",
		textField: "name",
		panelRenderOnShow: false,
		multiple : false,
		selarrrow: [],
		buttons:[],
		searchColumns: [],
		url       : null,
		panelWidth : 500,
		panelHeight : 220,
		sortable : false,
		data      : [],
		onSelectAll : null,
		onSortableColums : null,
		onLoad     : $.noop, /*数据加载成功*/
		onComplete : null,
		pager: false,
		// add sub button options
		buttonOptions: null,
		gridOptions: {
			loadonce:"false"
		} // grid 额外的参数添加
	}, 
	grid: function () {
		return $("#combo_grid_"+$(this.element).attr('id'));
	},
	/**
	 * 获取combogrid的button组件
	 */
	button: function () {
		if (null !== this.options.buttonOptions) {
			return this.$button;
		}
	},
	_destroy : function () {
		this.element.removeClass("coral-validation-combogrid");
		this.element.removeClass("coral-form-element-combogrid");
		this.grid().grid("destroy");
		this._super();
	},
	_showItems:function(){
		var grepArr = [],valarr = [],textarr = [],new_arr = [];
		var textField = this.options.textField,
			valueField = this.options.valueField,
			sdata = {};
		var $grid = this.grid();
		sdata['filters'] = '{}';
		$grid.grid("option", "localonce", true);
		$.extend($grid.grid("option", "postData"),sdata);
		$grid.grid("reload", {page:1});
	},
	_doQuery:function(q){
		var opts = this.options,
			$grid = this.grid();
		var textField = opts.textField;
		var fields = $grid.grid("option", "colModel"),
			sdata = [],
			fieldsRules = [];
		for (var i in fields) {
			var item = fields[i];
			if ("cb" == item.name || "rn" == item.name) continue;
		}
		for(var j = 0;j< q.length;j++){
			q[j] = pinyinEngine.toPinyin(q[j], false, "");
			if(opts.searchColumns.length > 0){
				for(var i = 0;i < opts.searchColumns.length;i++){
					fieldsRules.push('{"field":"'+ opts.searchColumns[i] +'","op":"cn","data":"'+q[j]+'"}');
				}
			}else{
				fieldsRules.push('{"field":"'+ textField +'","op":"cn","data":"'+q[j]+'"}');
			}
		}
		sdata['filters'] = '{"groupOp":"OR","rules":['+ fieldsRules.join(",") +']}';
		$grid.grid("option", "localonce", true);
		$.extend($grid.grid("option", "postData"),sdata);
		$grid.grid("reload", {page:1});
	},
	_checkMathch:function(text, noSearchFlag){
		var grepArr = [],valarr = [],textarr = [],new_arr = [];
		var textField = this.options.textField,
			valueField = this.options.valueField,
			sdata = {},
			repeatIndex = 0,// 选中的值
			i,
			j;
		var $grid = this.grid();
		if ( noSearchFlag ) {
			this._showItems();
		}
		var data = this.grid().grid("option", "data");
		var matched = false;
		var exsit = {};
		if ( this.options.multiple ) {
			// 检测当前页里面的值是否有匹配
			for( i = 0; i < text.length; i++ ){
				for( j = 0; j < data.length; j++ ){
					if( data[j][textField] != text[i] && data[j][valueField] != text[i] ){
						exsit[i.toString()] = true;
					}
					if ( data[j][textField] == text[i] ){
						valarr.push(data[j][valueField]);
						textarr.push(data[j][textField]);
						matched = true;
						break;
					}
				}
				if ( !matched && !this.options.forceSelection ) {
					if ( ( !exsit[i.toString()] && !noSearchFlag ) || noSearchFlag ) {
							valarr.push(text[i]);
							textarr.push(text[i]);
						}
				}
				matched = false;
			}
			// 检测缓存里面的值是否有匹配
			var valarrCache = this._getOnlyValues();
			var textarrCache = this._getOnlyTexts();
			for( i = 0; i < text.length; i++ ){
				for( j = 0; j < textarrCache.length; j++ ){
					if(textarrCache[j] == text[i] && 
						$.inArray(textarrCache[j], textarr) === -1){
						valarr.push(valarrCache[j]);
						textarr.push(textarrCache[j]);
					}
				}
			}
		} else {
			var index = -1;
			// 检测当前页里面的值是否有匹配
			for( i = 0; i < data.length; i++ ){
				if ( data[i][textField] == text[0] ){
					index = index===-1?i:index;// 单选的时候，只保留地一个匹配的选项
					matched = true;
				}
			}
			if ( matched ) {
				valarr.push(data[index][valueField]);
				textarr.push(data[index][textField]);
			}
			if ( !matched && !this.options.forceSelection ) {
				if ( ( !exsit["0"] && !noSearchFlag ) 
						|| noSearchFlag ) {
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
	/**
	 * reload
	 */
	reload: function( url ) {
		this.cache.isReload = true;
		var $grid = this.grid(),
		    that = this,
		    opts = {},
	        isUrl = false,
	        data = [];
		if ( !url && !this.options.url ) {
			url = [];
		} else if ( !url && this.options.url ) {
			url = this.options.url;
		}
		if ( typeof( url ) !== "string" ) {
			opts = url;
			if ( opts.data ) {
				data = opts.data;
			} else if ( opts.url ) {
				url = opts.url;
				isUrl = true;
			} else if ( url instanceof Array ) {
				data = url;
			} else if ( !opts.url && !opts.data && !this.options.url ) {
		    	data = [];
		    } else if ( !opts.url && !opts.data && this.options.url ) {
		    	url = this.options.url ;
		    	isUrl = true;
		    }
		} else {
			this.options.url = url;
			isUrl = true;
		}
		if ( $.isFunction( opts.onLoad ) ) {
			this.cache.onLoad = opts.onLoad;
		}
		if ( opts.postData ) {
			//this.cache.postData = opts.postData;
		}
		//现在都在grid的reload()里面处理
		$grid.grid("reload", url);
	},
	_removeGridHighlights: function() {		
		this._removeHighlight(
			this.grid().find(".coral-grid-btable tr td > span.coral-keyword-highlight"));
	},
	_renderItems: function( data ){
		
	},
	/**
	 * 给搜索到的grid结果集上加高亮显示
	 */
	_addGridHighlights: function() {
		this._addHighlight(this.grid().find(".coral-grid-btable .jqgrow").children("td"), 
			this.uiCombo.textbox.val());
	},
	/**
	** 每次选择一行时，更新缓存的value，text，rowId
	**/
	_updateGridData: function (ui) {
		var that = this;
		var rowData = this.grid().grid("getRowData", ui.rowId);
		var value = this._getTextFromHTML( rowData[this.options.valueField] );
		var text = this._getTextFromHTML( rowData[this.options.textField] );
		var index = $.inArray(value, this.gridValueArr);
		//单选时，不缓存值。
		if ( !this.options.multiple ) {
			this.gridValueArr = [value];
			this.gridTextArr = [text];
			this.gridRowIdArr = [ui.rowId];
			return ;
		}
		//多选时，缓存值。
		if ( !ui.status ) {
			if ( index != -1 ) {
				this.gridValueArr.splice(index, 1);
				this.gridTextArr.splice(index, 1);
				this.gridRowIdArr.splice(index, 1);
			}
		} else {
			if ( index == -1 ) {
				this.gridValueArr.push(value);
				this.gridTextArr.push(text);
				this.gridRowIdArr.push(ui.rowId);
			}
		}
	},
	_create : function() {
		var that = this, 
		    showPanelEvent = null, 
		    goptions;

    	this.element.addClass("coral-form-element-combogrid coral-validation-combogrid");
    	this._super();
		this.panelRendered = true;
		// add button code
		if (null !== this.options.buttonOptions) {
			this.$button = this._getButtonEl();
			this.component().append(this.$button).addClass("coral-combogrid-hasButton");
			this.$button.button(this.options.buttonOptions);
		}
		this.uiCombo.panel.unbind().bind('mousedown', function(e) {
			that.cancelBlur = true;
			that._delay(function() {
				delete that.cancelBlur;
			});
			var p = $(e.target).closest(".coral-grid-pager").length;
			if (p==1) {
				return true;
			} else {
				return false;
			}
		});
	}, 
	_initCombo: function() {
		this._super();
		var $grid = $();
		
		if ( this.options.pager ) {
			grid = $('<div id="combo_grid_'+$(this.element).attr('id')+'"><div class="combo_grid_'+$(this.element).attr('id')+'"></div></div>').appendTo(this.uiCombo.pContent);	
		} else {
			grid = $('<div id="combo_grid_'+$(this.element).attr('id')+'"></div>').appendTo(this.uiCombo.pContent);	
		}
		
		// 缓存value，text，rowId数组，用以设置值
		this.gridValueArr = [];
		this.gridTextArr = [];
		this.gridRowIdArr = [];

		goptions = {
			fitStyle: "fill",
			keyName: this.options.valueField,
			sortable: this.options.sortable,
			colModel : this.options.colModel,
		    colNames : this.options.colNames,
			multiselect: this.options.multiple,
			sortname : this.options.sortname,
			width : "auto"
		};
		goptions = $.extend({}, goptions, this.options.gridOptions);
		
		if (null != this.options.url) {
			goptions.url = this.options.url;
			goptions.datatype = "json";
		} else {
			goptions.data = this.options.data;
			goptions.datatype = "local";
		}
		
		this._on(grid, {
			gridonselectrow: function(e, ui) {
				var value = this._getOnlyValues();
				if (this.options.multiple) {
					if ( $.inArray(ui.rowId,value)==-1 ){
						value.push(ui.rowId);
					} else {
						value.splice( $.inArray( ui.rowId, value ), 1 );
					}
				} else {
					value = [ ui.rowId ];
				}
				this.setValues(value, true, false);
				if (!this.options.multiple && e.originalEvent && e.originalEvent.type == "click" ) {
					this.hidePanel();
				}
				this._trigger("onSelectRow", e, [{'rowId':ui.rowId, 'status':ui.status}]);
			},
			gridonselectall: function(e, ui) {
				var tvalue = ui.status ? ui.aRowIds.concat():[];
				this.setValues(tvalue, true, false);
			},
			gridonload: function(e, ui) {
				var t = this,
					clearValues = false,
				    data = ui.data;
				if (t.options.clearOnLoad){
					clearValues = t._clearValues(data);
				}
				this._addGridHighlights();
				this.dataLoaded = true;
				var selarrrow = this.grid().grid("option", "selarrrow").concat();
				for(var i =0;i< selarrrow.length;i++){
					this.grid().grid("setSelection", selarrrow[i], false);
				}
				var value = this._getOnlyValues();
				// 点击分页码时，reload，设置缓存的值
				$.each(value, function(i, v) {
					t.grid().grid("setSelection", v, false, null);					
				});
				if (clearValues == true) {
					this.currentValues = [];
				}
				if(!this.search){
					this.setValues(this.currentValues);
					this.search = false;
				}
				if (this.cache.isReload) {
					this.cache.isReload = false;
					this._trigger(this.cache.onLoad || "onLoad", null, [ui]);
					delete this.cache.onLoad;
				}
			}
		});
		grid.grid(goptions);
		grid.grid("refresh");
	},
	_getButtonEl: function () {
		return $("<button type='button'></button>").addClass("coral-combogrid-button");
	},
	/**
	 * 根据colName获取grid所有行集合数据
	 * @param colNameArr {array,string} : 列名name数组
	 * @return rowData {array} : 行集合数据
	 */
	_getRowDataByColName: function(colNameArr) {
		var that = this,
			opts = this.options,
			$grid = this.grid(),
			gridData = $grid.grid("option", "data"),
			rowData = [];
		
		if (typeof colNameArr === "string") {
			colNameArr = [colNameArr];
		}
		
		$.each(gridData, function(index, item) {
			var rowObj = {};
			for (var i in colNameArr) {
				var colName = colNameArr[i];
				rowObj[colName] = item[colName];
			}
			rowData.push(rowObj);
		});

		return rowData;
	},
	/**
	 * grid根据value数组，获取对应的text数组
	 * @param valueArr {array} : value 集合数组
	 * @returns textArr {array} : text 集合数组
	 */
	_getTextArrByValueArr: function (valueArr) {
		var that = this,
			opts = this.options,
			valueField = this.options.valueField,
			textField = this.options.textField,
			dataObj = this._getRowDataByColName( [valueField, textField] ),
			textArr = [];
		
		for (var i in valueArr) {
			var valueItem = valueArr[i],
				hasText = false;
			
			$.each(dataObj, function(index, item) {
				if (valueItem == item[valueField]) {
					textArr.push(item[textField]);
					hasText = true;
				}
			});
			// 如果没找到对应的text，则将value作为一个textItem
			if (!hasText) {
				textArr.push(valueArr[i]);
			}
		}
		
		return textArr;
	},	
	//给文本框赋值
	setValues: function (values, triggerOnChange, text) {
		// 清除下拉列表的选中
		var $grid = this.grid();
		var selarrrow = $grid.grid("option", "selarrrow").concat();
		for(var i =0;i< selarrrow.length;i++){
			$grid.grid("setSelection", selarrrow[i], false);
		}
		// 如果没加载完，则先缓存，onLoad之后统一执行
		if (!this.dataLoaded) {
			var cacheItem = {
				"setValues": {
					values: values,
					text: text,
					triggerOnChange: triggerOnChange
				}
			};
			this._addCacheItem(cacheItem);
		}
		var opts  = this.options;
		var textArr = [];
		textArr = this._getTextArrByValueArr(values);
		text = typeof text == "boolean" ? text: false;
		if (!text) {
			this._setText(textArr.join(opts.separator));
		} 
		this.currentValues = values;
		this.currentTexts = textArr;
		var tvalues = values.concat();
		tvalues.sort();
		for(var i =0;i < tvalues.length;i++){
			if ( tvalues[i] !== tvalues[i+1] && i != tvalues.length ||
					i == tvalues.length ) {
				$grid.grid("setSelection", tvalues[i], false);
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
		this._super(values, triggerOnChange, false);
	},
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
			    row = null;
			
			if ( "value-text" === opts.postMode ) {
				valArr.push(value.split(opts.valueTextSeparator)[0]);
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
	_getOnlyTexts: function(){
		return this.currentTexts || [];
	},
	getData: function() {
		return this.grid().grid("option", "data") || [];
	},
	_selectPrev : function(){
		 var that = this,
		 	 selected = null,
		 	 index = 0,
		 	 rows = that.grid().grid("getDataIDs");
			 selarrrow = that.grid().grid("option","selarrrow").concat();
			 valueFirst = that.getValues()[0];
			 that.selectedRow = that.selectedRow || valueFirst;
		 if(that.options.multiple){
			 if ( that.selectedRow ) {
					// that.selectedRow 在rows中的第几个 得到下一个
					for(var i=rows.length;i>=0;i--){
						if ( that.selectedRow == rows[i] ) {
							index = (i==0? (rows.length-1) : ( i - 1 ));
							that.selectedRow = rows[ index ];
							break;
						}//下一个
					}
					if ( $.inArray( that.selectedRow, selarrrow ) == -1){//没选中的情况
						that.grid().grid("setSelection", that.selectedRow);
					} 
					// 判断当前项目(selectedRow)是否选中
					// that.selectedRow 在selarrrow中是否存在	
				} else {
					that.selectedRow = rows.length;
					that.grid().grid("setSelection",rows.length);
				}
				that._scrollTo(that.selectedRow);
		 }else{
		  //取得选中行	
			selected = that.grid().grid("option","selrow");
			if (selected) {
				//取得选中行的rowIndex
				index = that.grid().grid("getInd",selected);   
				//向上移动到第一行为止
				if (index >= 0) {
					that.grid().grid("setSelection",rows[index-2]);
				}
			} else {	
				that.grid().grid("setSelection", rows.length);	
			}
		 }
			that._scrollTo(selected);
	},
	_selectNext : function(){
		var that = this, 
			selected = null,
			index = 0,
			rows = that.grid().grid("getDataIDs");
			selarrrow = that.grid().grid("option","selarrrow").concat();
			valueFirst = that.getValues()[0];
			that.selectedRow = that.selectedRow || valueFirst;
		if ( that.options.multiple ) {		
			if ( that.selectedRow ) {
				// that.selectedRow 在rows中的第几个 得到下一个
				for(var i=0;i<rows.length;i++){
					if ( that.selectedRow == rows[i] ) {
						index = (i==rows.length-1? 0 : ( i + 1 ));
						that.selectedRow = rows[ index ];
						break;
					}//下一个
				}
				if ( $.inArray( that.selectedRow, selarrrow ) == -1){//没选中的情况
					that.grid().grid("setSelection", that.selectedRow);
				} 
				// 判断当前项目(selectedRow)是否选中
				// that.selectedRow 在selarrrow中是否存在	
			} else {
				that.selectedRow = rows[0];
				that.grid().grid("setSelection",rows[0]);
			}
			that._scrollTo(that.selectedRow);
		} else {		
			selected = that.grid().grid("option","selrow");
			//$.inArray
			if ( selected ) {
				//取得选中行的rowIndex
				index = that.grid().grid("getInd",selected);		
				//向下移动到当页最后一行为止	
				if (index < rows.length) {	
					that.grid().grid("setSelection",rows[index]);
				}
			} else {
				that.grid().grid("setSelection",rows[0]);
			}
			that._scrollTo(selected);
		}
	},
	_doEnter: function() {
		if (!this.uiCombo.panel.is(":visible")) return;
		if ( this.options.multiple ) {
			this.grid().grid("setSelection", this.selectedRow);
		} else {
			this.hidePanel();
		}
	},
	_scrollTo : function(value) {
		var panel = this.panel();
		var item = panel.find(".coral-row-ltr[id=\"" + value + "\"]");
		if (item.length){
			if (item.position().top <= 0){
				var h = panel.find(".coral-grid-rows-view").scrollTop() + item.position().top - item.outerHeight();
				panel.find(".coral-grid-rows-view").scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.find(".coral-grid-rows-view").height()){
				var h = panel.find(".coral-grid-rows-view").scrollTop() + item.position().top + item.outerHeight() - panel.find(".coral-grid-rows-view").height();
				panel.find(".coral-grid-rows-view").scrollTop(h);
			}
		}
	}
});
// noDefinePart
} ) );