( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./combo",
            "./tree"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.combotree", $.coral.combo, {
	version: "4.0.3",
	castProperties : ["data", "rootNode","buttons","shortCut"],
	options: {
		valueField: 'id',
		textField : 'name',
		panelRenderOnShow: false,
		mode      : 'local',	// or 'remote'
		method    : 'post',
		url       : null,
		dialogMaxHeight: 500,
		data      : null,
		buttons   : [],
		postMode  : "value",    // value, text, value-text
		multiple  : null,		// 可多选树
		simpleDataEnable: false,
		simpleDataIdKey: "id",
		simpleDataPIdKey: "pId",
		simpleDataRootPId: null,
		rootNode: false,
		radioType: "level",
		showRootNode: true,
		allowPushParent: true,
		traversal : false,		// 是否遍历其父子节点
		cascadeCheck : false,	// 多选时不关联父子节点
		formatter: function(row) {
			var textField = $(this).combotree("option", "textField");
			return row[textField];
		},
		loader: function(param, success, error) {
			var that = this,
			    instance = $(this),
			    url = instance.combotree("option", "url");
			if (!url) return false;
			$.ajax({
				type: instance.combotree("option", "method"),
				url:  url,
				data: param,
				dataType: 'json',
				success: function(data) {
					success(data);
				},
				error: function(e){
					error.apply(this, arguments);
				}
			});
			/*$.ajax({
				type: "get",
				url:  url,
				data: {},
				dataType: 'json',
				success: function(data) {
					success(data);
				},
				error: function(){
					error.apply(this, arguments);
				}
			});*/
			//return false;
		},
		
		beforeClick: null,   /*下拉树 beforeClick(treeId, treeNode)事件*/
		beforeLoad : $.noop, /*参数(event, param)*/
		onLoad     : $.noop, /*数据加载成功*/ 
		onError    : $.noop, /*数据加载失败*/
		onSelect   : $.noop, /*参数(event, {valueField, textField})*/
		unSelect : $.noop,  /*参数(event, {valueField, textField})*/	
		onExpand: null,		
		onClick : null
	}, 	
	/**
	 * return $tree
	 */
	tree: function () {
		return $("#"+$(this.element).attr('id')+"_tree");
	},
	/**
	 * keysObj ({id:testId, name:testName, ... })
	 */
	_filterLocalTree: function (keysObj) {
		var that = this,
			treeObj = $("#"+$(this.element).attr('id')+"_tree");
		// 支持拼音搜索
		treeObj.tree ("filterNodesByParam", keysObj);	
	},
	_create : function() {
		var that = this,
		    showPanelEvent = null;
    	this.element.addClass("coral-form-element-combotree coral-validation-combotree coral-combobox-f ctrl-form-element");
    	
		showPanelEvent = function(){
			
		};
		this.options.onShowPanel = showPanelEvent;
		this._super();
		//lihaibo
		if ( this.options.popupDialog ) {
			this.uiCombo.popupInputbox = this.uiCombo.popupInputbox.textbox({
				componentCls: "coral-combo-popup-input",
				icons: [ {
					icon: "cui-icon-search2",
					click: function (e, data) {						
						that._filterLocalTree({"name": data.value});
					}
				}],
				onKeyUp: function (e, data) {					
					that._filterLocalTree({"name": data.value});
					
					e.stopPropagation();
				}
			});
			
			this.uiCombo.popupDialog.dialog({
				autoOpen : false,
				title: "下拉树",
				maxHeight: typeof this.options.dialogMaxHeight === "string" ? parseInt(this.options.dialogMaxHeight) : this.options.dialogMaxHeight,
				height : 'auto',
				width : 'auto',
				modal : true,
				resizable: false,
				buttons: {
					"确定" : function(e) {
						var valueArr = $.data( that.uiCombo.popupInputbox, "value"),
							textArr = $.data( that.uiCombo.popupInputbox, "text");
						if ( valueArr ) {
							that.setValues(valueArr, true, textArr);
						}
						$(this).dialog("close");
					},
					"关闭" : function(e) {
						$(this).dialog("close");
					}
				}		
			});		
		}
		this.uiCombo.panel.unbind().bind('mouseover', function(e){
			$(e.target).closest('.coral-combobox-item').addClass('coral-combobox-item-hover');
		}).bind('mouseout', function(e){
			$(e.target).closest('.coral-combobox-item').removeClass('coral-combobox-item-hover');
		}).bind('mousedown', function(e) {
			that.cancelBlur = true;
			that._delay(function() {
				delete that.cancelBlur;
			}, 100);
			return false;
		});	
	}, 
	_getSetting: function(){
		var that = this;
		var setting = {
			simpleDataEnable: this.options.simpleDataEnable,
			simpleDataIdKey: this.options.simpleDataIdKey,
			simpleDataPIdKey: this.options.simpleDataPIdKey,
			simpleDataRootPId: this.options.simpleDataRootPId,
			checkable : this.options.multiple == null ? this.options.checkable : this.options.multiple,
			chkStyle : this.options.chkStyle,	
			radioType: this.options.radioType,
			showRootNode:this.options.showRootNode,
			rootNode:this.options.rootNode,
			chkboxType  : this.options.cascadeCheck ? { "Y" : "", "N" : "" } : { "Y" : "ps", "N" : "ps" },
			beforeClick : function ( treeId, treeNode ) {
				if ( !that.options.allowPushParent && treeNode.isParent ) return false;
				var fn = $.coral.toFunction( that.options.beforeClick );
				if ( !that.options.multiple ) {
					if(!that.options.checkable){
						if ( $.isFunction(fn) ) {
							return fn(treeId, treeNode);
						}
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			},
			onClick : function( e, treeId, treeNode, clickFlag ) {
				var textArr = [];
				var valueArr = [];
				textArr.push( treeNode.name );
				valueArr.push( treeNode.id );
				if( that.options.traversal ){
					var pNode = treeNode.getParentNode();
					while( !!pNode ) {
						textArr.push(pNode.name);
						//valueArr.push(pNode.id);
					    pNode = pNode.getParentNode();
					}
				}

				if ( that.options.popupDialog ) {
					$.data( that.uiCombo.popupInputbox, "value", valueArr.reverse() );
					$.data( that.uiCombo.popupInputbox, "text", textArr.reverse() );
				} else {
					//给下拉框赋值
					that.setValues(valueArr.reverse(), true,textArr.reverse());
				}	
				if ( !that.options.multiple && !treeNode.isParent ||
						!that.options.multiple && that.options.allowPushParent ) {
					that.hidePanel();
				} 
				//that._trigger("onClick", e, {treeId:treeId, treeNode:treeNode, clickFlag:clickFlag});
				that._trigger("onNodeClick", e, {treeId:treeId, node:treeNode, treeNode:treeNode, clickFlag:clickFlag});
				// 添加onSelect事件
				//that._trigger("onSelect", e, {treeId:treeId, treeNode:treeNode});
				return false;
			},
			beforeCheck: function( treeId, treeNode ){
				//if ( !that.options.parentNodeAllowCheck && treeNode.isParent ) return false;
				var ret = that._trigger("beforeNodeCheck", null, {treeId: treeId, node:treeNode});
				if ( !ret ) return false;
			},
			onCheck : function(e, treeId, treeNode){
				var textArr = [];
				var valueArr = [];
				var nodes = $('#'+treeId).tree("getCheckedNodes",true);
				for (var i=0, l=nodes.length; i<l; i++) {
					//在关联父子节点时,半选状态节点不作为下拉框的值
					if(that.options.cascadeCheck || !nodes[i].getCheckStatus().half){
						if (!that.options.allowPushParent && nodes[i].isParent) {
							continue;
						}
						textArr.push(nodes[i].name);
						valueArr.push(nodes[i].id);
					}
				}
				
				if ( that.options.popupDialog ) {
					$.data( that.uiCombo.popupInputbox, "value", valueArr);
					$.data( that.uiCombo.popupInputbox, "text", textArr);
				} else {
					//给下拉框赋值
					that.setValues(valueArr, true,textArr);
				}									
				that._trigger("onNodeCheck", e, {treeId:treeId, node:treeNode});
			},
			onLoad : function (e, treeId, treeNode, msg) {
				var textArr = [],
				 	valueArr = [],
				 	i,
				 	nodes = [],
				 	clearValues = false,
				 	$cbTree = $('#'+treeId),
				 	data = $cbTree.tree("getNodes"),
				    dataJson = $cbTree.tree("transformToArray",data);
				if (  that.options.clearOnLoad ){
					clearValues = that._clearValues( dataJson );
				}
				
				if ($cbTree.tree("option", "checkable") == true) {
					nodes = $cbTree.tree("getCheckedNodes",true);
					for (i=0, l=nodes.length; i<l; i++) {
						//在关联父子节点时,半选状态节点不作为下拉框的值
						if (that.options.cascadeCheck || !nodes[i].getCheckStatus().half) {
							if (!that.options.allowPushParent && nodes[i].isParent) {
								continue;
							}
							textArr.push(nodes[i].name);
							valueArr.push(nodes[i].id);
						}
					}
				} else {
					textArr = false;
				}
				if (that.currentValues.length && !clearValues) {
					valueArr = that.currentValues;
				}
				if (!that.isInit) {
					that.isInit = true;
					that.originalValue = valueArr.join(",");
				}
				that.isLoaded = true;
				that.dataLoaded = true;
				//给下拉框赋值
				that.setValues(valueArr, false,textArr);	
				// 添加onLoad事件
				that._trigger("onLoad", e, {treeId:treeId, treeNode:treeNode, msg:msg});
			},
			onExpand: function (e, treeId, node) {
				that._trigger("onExpand", e, [{treeId: treeId, node: node}]);
			}
		};
		return setting;
	},
	// 设置 popupDialog input 的值
	setPopupInput: function ( text ) {
		this.uiCombo.popupInputbox.textbox("setValue", text.join(this.options.separator) );
	},
	_initData : function() {
		var tree = $("<ul id=\""+$(this.element).attr('id')+"_tree\"></ul>");
		if ( this.options.popupDialog ) {
			tree.appendTo(this.uiCombo.popupDialog);
			this.uiCombo.popupDialogTree  = tree;
		} else {
			tree.appendTo(this.uiCombo.pContent);
		}
		this.uiCombo.panel.unbind().bind('mousedown', function(e){
			e.preventDefault();
		});
		
		var setting = this._getSetting();
		//异步树setting
		if ( typeof this.options.url == 'string' && this.options.url !== '' ) {
			$.extend(setting,{asyncEnable : true,asyncUrl : this.options.url,asyncAutoParam : 'id,name'});
		}
		//初始化tree
		tree.tree(setting, this.options.data);
	},	
	_renderItems: function( data ){
		
	},
	_scrollTo : function(value) {
		var panel = this.panel();
		var item = panel.find("div.coral-combobox-item[value=\"" + value + "\"]");
		if ( item.length ){
			if (item.position().top <= 0){
				var h = panel.scrollTop() + item.position().top;
				panel.scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.height()){
				var h = panel.scrollTop() + item.position().top + item.outerHeight() - panel.height();
				panel.scrollTop(h);
			}
		}
	}, 
	_request : function(url, param, remainText) {
	/*	var $tree = $("#"+$(this.element).attr('id')+"_tree");
		var opts = this.options, 
		    that = this,
		    loaderEvent = this.options.loader;
		if ( $.isArray( url ) ) {
			that.loadData(url, remainText);
		} else {
			if (url) {
				opts.url = url;
			}
			param = param || {};
			if (this._trigger("beforeLoad", null, [param]) == false) return;
			loaderEvent.apply(this.element, [param, function(data) {
				that.loadData(data, remainText);
			}, function() {
				that._trigger("onError", null, arguments);
			}]);
		}*/
		var that = this,
	        opts = {}, 
	        data = [], 
	        loaderEvent = this.options.loader,
	        isUrl = false;
		if ( !url && !that.options.url ){
			url = [];
		}else if (!url && that.options.url){
			url = that.options.url;
		}
        if ( typeof( url ) !== "string" ) {
	     // 传过来的是object，需要区别是data还是options
	    // 如果是options，可能是options.data或者options.url ，否则才为data
	         opts = url;
	         if ( opts.data ) { //传进来的是options对象
		          data = opts.data;			    
	          } else if ( opts.url ) {// 传进来的是data对象
		          url = opts.url
		          that.options.url = opts.url;
		          isUrl = true;
	          } else if( opts instanceof Array ) {
		          data = url;
	          }else if ( !opts.url && !opts.data && !that.options.url ){
			      data = [];
			  }else if ( !opts.url && !opts.data && that.options.url ){
			      url = that.options.url ;
			      isUrl = true;
			  }
        } else {
    	    that.options.url=url
	        isUrl = true;
        }
        if ( isUrl ){
    	     param = param || {};
		     if (this._trigger("beforeLoad", null, [param]) == false) return;
		     loaderEvent.apply(this.element, [param, function(data) {
			      that.loadData(data, remainText);
			      that._trigger( $.isFunction( opts.onLoad )?opts.onLoad:"onLoad", null, [data]);
		      }, function() {
			      that._trigger("onError", null, arguments);
		      }]);
        } else{
    	    that.loadData(data, remainText);
    	    that._trigger($.isFunction( opts.onLoad )?opts.onLoad:"onLoad", null, [data]);
        }

	},
	getTree: function(){
		return $("#"+$(this.element).attr('id')+"_tree");
	},
	/**
	 * handle
	 */
	loadData: function (data, remainText) {
		var $tree = this.getTree();
		$tree.tree("reload", data);
		var nodes = $tree.tree("getNodes");
		// expand root node defaultly
		$.each( nodes, function( i, node ) {
			$tree.tree("expandNode", node, true);
		});
		this.dataLoaded = true;
		this.setValues(this.currentValues);
	},
	getData: function() {
		return this.getTree().tree("getNodes") || [];
	},	
	/**
	 * 加载后执行缓存的方法
	 */
	setComboValues: function(values, remainText) {
		this.setValues(values,false, remainText); // 20150121 不触发change，不校验
	},
	// 设置combo中的tree在不同状态下的选中状态。
	_setTreeNodeState: function(values, remainText) {
		var opts  = this.options,
			nodeName = [],
			$cbTree = $("#"+$(this.element).attr('id')+"_tree");
		// 清除selected状态
		$cbTree.tree("cancelSelectedNode");
		if ($cbTree.tree("option", "checkable") == true) {
			// 清空checked状态
			$cbTree.tree("checkAllNodes", false);
			// 设置checkbox
			for(i in values){
				var node = $cbTree.tree("getNodeByParam", "id", values[i]);
				if (node) {
					$cbTree.tree("checkNode", node, true, !opts.cascadeCheck);
				}
				// 获得value对应的text值
				if (!remainText) {
					if (node) {
						nodeName.push(node.name);
					} else {
						nodeName.push(values[i]);
					}
				}
			}
		} else {
			for(i in values){
				var node = $cbTree.tree("getNodeByParam","id",values[i]);
				$cbTree.tree("selectNode",node);
				// 获得value对应的text值
				if (!remainText) {
					if (node) {
						nodeName.push(node.name);
					} else {
						nodeName.push(values[i]);
					}
				}
			}
		}
		if (!remainText) {
			remainText = nodeName;
		}
		return remainText;
	},
	//给下拉树赋值并赋值文本
	/**
	 *  isSelect : true(则是用户选择或取消选择的操作)；false(则是开发者代码调用setValues方法)。
	 */
	setValues: function(values, triggerOnChange, remainText) {
		var treeNodeText;
		// 当前值缓存，防止异步加载下拉选项时，设值不起作用
		this.currentValues = values;
		treeNodeText = this._setTreeNodeState(values, remainText).join(this.options.separator);
		remainText = typeof remainText == "boolean" ? remainText: false;
		if ( !remainText ) {
			this._setText(treeNodeText);
		} 
		this._super(values, triggerOnChange, remainText);
	},
	//赋值
	setValue: function(value, triggerOnChange, remainText){
		value = value.split( this.options.separator );
		this.setValues(value, false, remainText);
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
			var value = this.currentValues[i];
			if ( "value" === opts.postMode ) {
				valArr.push(value);
			}
		}
		/*for (; i < this.currentValues.length; i++) {
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
			
		}*/
		return valArr;
	},
	_showItems : function(){
		var allNodes = this.tree().tree("getNodes");
		var allNodesData = this.tree().tree("transformToArray",allNodes);
		this.tree().tree("showNodes", allNodesData,{showParents: true});
	},
	//下拉框查询方法
	_doQuery : function(q) {	
		if(q=='') return;
		var opts = this.options,
			dataArr = [],
			textField = opts.textField,
			valueField = opts.valueField,
		    filterEvent = this.options.filter;
		if (opts.mode == "remote") {
			this._request(null, {q:q}, true);
		} else {
			var nodes = this.tree().tree("getNodes");
			var data = this.tree().tree("transformToArray",nodes);
			this.tree().tree("hideNodes",data);
			for(var i = 0; i < data.length; i++) {
				var spell = pinyinEngine.toPinyin(data[i][textField],false,"");
				for(var j = 0;j< q.length;j++){
					var r = filterEvent.apply(this.element, [q[j],data[i]]);
					if (r) {
						var v = data[i][valueField];// 匹配的value
						var t = data[i][textField];// 匹配的text
						
						if (t.indexOf(q[j]) > -1 || spell.indexOf(q[j]) > -1) {
							dataArr.push(data[i]);
							this.tree().tree("showNodes",dataArr,{showParents: true});
							this.tree().tree("expandNode", dataArr[0].getParentNode(), true, false, false);
						}
					}
				}
			}
		}
	},
	_checkMathch:function(text, noSearchFlag){
		var valarr = [],
			textarr = [],
		 	tvalarr = [],
		 	ttextarr = [],
			nodes=[],
			i,
			j,
			k,
			h,
			options = this.options,
			textField = options.textField,
			valueField = options.valueField;
		if ( noSearchFlag ) {
			this._showItems();
		}
		var matched = false;
		var exsit = {};
		if ( options.multiple ) {
			this.tree().tree("checkAllNodes", false);
			for(i = 0; i < text.length; i++){
				if ( noSearchFlag ) {
					if ( this.options.forceSelection && $.trim( text[i] ) === "" ) {
						continue;
					}
				}
				var nodes = this.tree().tree("getNodesByParam", textField, text[i], null);
				if( !nodes.length ){
					exsit[i.toString()] = true;
				}
				for(j=0;j<nodes.length;j++){
					// cascadeCheck为true，说明父节点是可以单独选的
					if ( options.cascadeCheck || !nodes[j].isParent ) {
						valarr.push(nodes[j][valueField]);
						textarr.push(nodes[j][textField]);
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
			for(h=0;h<valarr.length;h++){
				var nodes = this.tree().tree("getNodesByParam", valueField, valarr[h], null);
				if ( nodes.length ) {
					this.tree().tree("checkNode", nodes[0], true, !options.cascadeCheck);
				}
			}
			// 为了获取选中父节点的所有子节点，必须要等上面的checkNode方法执行后才有效。
			var nodes = this.tree().tree("getCheckedNodes",true);
			for (k=0, l=nodes.length; k<l; k++) {
				//在关联父子节点时,半选状态节点不作为下拉框的值
				if( options.cascadeCheck || !nodes[k].getCheckStatus().half ){
					if ( !options.allowPushParent && nodes[k].isParent ) {
						continue;
					}
					if ( $.inArray(nodes[k][valueField], valarr) == -1 ) {
						textarr.push(nodes[k][textField]);
						valarr.push(nodes[k][valueField]);
					}
				}
			}
		} else {
			var nodes = this.tree().tree("getNodesByParam", textField, text[0], null);
			var index = -1;
			for (i = 0; i < nodes.length; i++ ) {
				index = index===-1?i:index;// 单选的时候，只保留地一个匹配的选项
				matched = true;
			}
			if ( matched ) {
				valarr.push(nodes[index][valueField]);
				textarr.push(nodes[index][textField]);
			}
			if ( !matched && !this.options.forceSelection ) {
				valarr.push(text[0]);
				textarr.push(text[0]);
			}
		}
		return {
			valarr:valarr,
			textarr:textarr
		}
	},
	//清除下拉框值
	clear: function(){
		this._super();
		//清除多选框选中
		if(this.options.multiple){
			$("#"+$(this.element).attr('id')+"_tree").tree("checkAllNodes",false);
		}
	},
	_formatValue: function(value) {
		var data;
		if ( this.options.multiple ) {
			data = this.getTree().tree("getCheckedNodes",true);
		} else {
			data = this.getTree().tree("getSelectedNodes");
		}
		var opts = this.options,
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
	reload: function(url) {
		this._request(url);
	},
	_destroy : function () {
		var that = this;
		
		this.element.removeClass("coral-validation-combotree");
		this.element.removeClass("coral-form-element-combotree");
		if (this.options.popupDialog) {
			this.uiCombo.popupDialog.dialog("forceDestroy");
		}
		this._super();
	}	
});
// noDefinePart
} ) );