( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/**
 * 组件库4.0：树
 * 
 * 依赖JS文件:
 * jquery.parser.js
 * 
 * 
 */	
var _final = {
	className: {
		BUTTON: "button",
		LEVEL: "level",
		ICO_LOADING: "ico_loading",
		SWITCH: "switch"
	},
	editIcon: "cui-icon-pencil7",
	removeIcon: "cui-icon-cross2",
	event: {
		NODECREATED: "tree_nodeCreated",
		CLICK: "tree_click",
		EXPAND: "tree_expand",
		COLLAPSE: "tree_collapse",
		ASYNC_SUCCESS: "tree_async_success",
		ASYNC_ERROR: "tree_async_error",
		REMOVE: "tree_remove",
		CHECK: "tree_check",
		DRAG: "tree_drag",
		DROP: "tree_drop",
		RENAME: "tree_rename",
		DRAGMOVE:"tree_dragmove"
	},
	id: {
		A: "_a",
		ICON: "_ico",
		SPAN: "_span",
		SWITCH: "_switch",
		UL: "_ul",
		CHECK: "_check",
		EDIT: "_edit",
		INPUT: "_input",
		REMOVE: "_remove"
	},
	line: {
		CENTER: "centerDottedLine",
		BOTTOM: "bottomDottedLine",
		ROOTS: "topDottedLine",
		NOLINE: "noline",
		LINE: "dottedLine"
	},
	folder: {
		OPEN: "folderOpen",
		CLOSE: "folderClose",
		FILE: "file",
		DOCU: "docu"
	},
	arrow: {
		RIGHT: "arrowRight1",
		DOWN: "arrowDown1"
	},
	node: {
		CURHOVER: "coral-state-hover",
		CURSELECTED: "curSelectedNode",
		CURSELECTED_EDIT: "curSelectedNode_Edit",
		TMPTARGET_TREE: "tmpTargetTree",
		TMPTARGET_NODE: "tmpTargetNode"
	},		
	checkbox: {
		STYLE: "checkbox",
		DEFAULT: "coral-state-default",
		DISABLED: "coral-state-disabled",
		FALSE: "false",
		TRUE: "true",
		UNCHECKED:"unchecked",
		CHECKED: "checked",
		PARTIAL: "Partical",
		FOCUS: "coral-state-focus"
	},
	radio: {
		STYLE: "radio",
		TYPE_ALL: "all",
		TYPE_LEVEL: "level"
	},
	move: {
		TYPE_INNER: "inner",
		TYPE_PREV: "prev",
		TYPE_NEXT: "next"
	},
};
var settings = {}, roots = {}, caches = {};
//树组件静态常量
$.component("coral.tree",{
	castProperties : ['data','fontCss', 'rootNode', 'chkboxType','formatter','showIcon','addDiyDom','beforeDrag','onDrag','onDrop'],
	version: "4.0.2",
	componentName: "tree",
	componentFullName: "coral-tree",	
//树组件属性
	options : {
		treeId: "",//Tree的唯一标识，初始化后，等于 用户定义的 Tree 容器的 id 属性值。
		treeObj: null,//Tree 容器的 jQuery 对象
		//view
		clickExpand: false,
		disabledMessage : "the node is disabled",
		disabled: false,
		addDiyDom: null,//用于在节点上固定显示用户自定义控件
		autoCancelSelected: true,//点击节点时，按下 Ctrl 或 Cmd 键是否允许取消选择操作
		dblClickExpand: true,//双击节点时，是否自动展开父节点的标识
		expandSpeed: "fast",//节点展开、折叠时的动画速度，设置方法同 JQuery 动画效果中 speed 参数
		fontCss: {},//个性化文字样式，只针对 Tree 在节点上显示的<A>对象。
		iconUrl: true,//自定义图标是用url还是用fonts里的图标
		nameIsHTML: false,//设置 name 属性是否支持 HTML 脚本
		selectedMulti: true,//设置是否允许同时选中多个节点
		showIcon: true,//设置 Tree 是否显示节点的图标
		showLine: false,//设置 Tree 是否显示节点之间的连线
		showTitle: true,//设置 Tree 是否显示节点的 title 提示信息(即节点 DOM 的 title 属性)
		txtSelectedEnable: false,//设置 Tree 是否允许可以选择 Tree DOM 内的文本
		rootInNode : false,//是否在data属性中提取根节点
		showRootNode : true,//是否显示根节点
		rootNode: false,//设置根节点 boolean或者json节点类型 如果是true则将树的nodes的根作为根节点，如果是json，则将传进来的node作为根节点
		//this._key
		keyChildren: "children",//Tree 节点数据中保存子节点数据的属性名称
		keyName: "name",//Tree 节点数据保存节点名称的属性名称
		keyTitle: "",//Tree 节点数据保存节点提示信息的属性名称
		keyUrl: "url",//Tree 节点数据保存节点链接的目标 URL 的属性名称
		//this._simpleData
		simpleDataEnable: false,//Nodes 数据是否采用简单数据模式
		simpleDataIdKey: "id",//节点数据中保存唯一标识的属性名称
		simpleDataPIdKey: "pId",//节点数据中保存其父节点唯一标识的属性名称
		simpleDataRootPId: null,//用于修正根节点父节点数据，即 pIdKey 指定的属性值
		//this._keep
		keepParent: false,//Tree 的节点父节点属性锁，是否始终保持 isParent = true
		keepLeaf: false,//Tree 的节点叶子节点属性锁，是否始终保持 isParent = false
		//async
		asyncEnable: false,//设置 Tree 是否开启异步加载模式
		asyncContentType: "application/x-www-form-urlencoded",//Ajax 提交参数的数据类型
		asyncType: "post",//Ajax 的 http 请求模式
		asyncDataType: "text",//Ajax 获取的数据类型
		asyncUrl: "",//Ajax 获取数据的 URL 地址
		asyncAutoParam: [],//异步加载时需要自动提交父节点属性的参数
		asyncOtherParam: [],//Ajax 请求提交的静态参数键值对
		asyncDataFilter: null,//用于对 Ajax 返回数据进行预处理的函数
		
		//多选树属性
		checkable: false,//设置 Tree 的节点上是否显示 checkbox / radio
		autoCheckTrigger: false,//设置自动关联勾选时是否触发 beforeCheck / onCheck 事件回调函数
		chkStyle: _final.checkbox.STYLE,//勾选框类型(checkbox 或 radio）
		nocheckInherit: false,//当父节点设置 nocheck = true 时，设置子节点是否自动继承 nocheck = true 
		chkDisabledInherit: false,//当父节点设置 chkDisabled = true 时，设置子节点是否自动继承 chkDisabled = true 
		radioType: _final.radio.TYPE_LEVEL,//radio 的分组范围 level / all
		chkboxType: {//勾选 checkbox 对于父子节点的关联关系
			"Y": "ps",
			"N": "ps"
		},
		//this._key
		keyChecked: "checked",//Tree 节点数据中保存 check 状态的属性名称
		//可编辑状态的属性
		editable: false,//设置 Tree 是否处于编辑状态
		editNameSelectAll: false,//节点编辑名称 input 初次显示时,设置 txt 内容是否为全选状态
		showRemoveBtn: true,//设置是否显示删除按钮
		showRenameBtn: true,//设置是否显示编辑名称按钮
		removeTitle: "remove",//删除按钮的 Title 辅助信息
		renameTitle: "rename",//编辑名称按钮的 Title 辅助信息
		//edit.drag
		dragStyle: "line", //"line" 拖动节点时的提示方式，是箭头提示还是线形提示
		dragAutoExpandTrigger: false,//拖拽时父节点自动展开是否触发 onExpand 事件回调函数
		dragIsCopy: true,//拖拽时, 设置是否允许复制节点
		dragIsMove: true,//拖拽时, 设置是否允许移动节点
		dragPrev: true,//拖拽到目标节点时，设置是否允许移动到目标节点前面的操作
		dragNext: true,//拖拽到目标节点时，设置是否允许移动到目标节点后面的操作
		dragInner: true,//拖拽到目标节点时，设置是否允许成为目标节点的子节点
		dragMinMoveSize: 5,//判定是否拖拽操作的最小位移值 (单位：px)
		dragBorderMax: 10,//拖拽节点成为根节点时的 Tree 内边界范围 (单位：px)
		dragBorderMin: -5,//拖拽节点成为根节点时的 Tree 外边界范围 (单位：px)
		dragMaxShowNodeNum: 5,//拖拽多个兄弟节点时，浮动图层中显示的最大节点数
		dragAutoOpenTime: 500,//拖拽时父节点自动展开的延时间隔
		//view
		addHoverDom: null,//用于当鼠标移动到节点上时，显示用户自定义控件
		removeHoverDom: null,//用于当鼠标移出节点时，隐藏用户自定义控件
		//回调函数
		beforeDrag:null,//用于捕获节点被拖拽之前的事件回调函数，并且根据返回值确定是否允许开启拖拽操作
		beforeDragOpen:null,//用于捕获拖拽节点移动到折叠状态的父节点后，即将自动展开该父节点之前的事件回调函数，并且根据返回值确定是否允许自动展开操作
		beforeDrop:null,//用于捕获节点拖拽操作结束之前的事件回调函数，并且根据返回值确定是否允许此拖拽操作
		beforeEditName:null,//用于捕获节点编辑按钮的 click 事件，并且根据返回值确定是否允许进入名称编辑状态
		beforeReName:null,//用于捕获节点编辑名称结束,更新节点名称数据之前的事件回调函数
		onDrag:null,//用于捕获节点被拖拽的事件回调函数
		onDragMove:null,//用于捕获节点被拖拽过程中移动的事件回调函数
		onDrop:null,//用于捕获节点拖拽操作结束的事件回调函数
		onReName:null,//用于捕获节点编辑名称结束之后的事件回调函数		
		//callback
		beforeCheck:null,//用于捕获 勾选 或 取消勾选 之前的事件回调函数，并且根据返回值确定是否允许 勾选 或 取消勾选 
		onCheck:null,//用于捕获 checkbox / radio 被勾选 或 取消勾选的事件回调函数		
		//callback
		beforeAsync:null,//用于捕获异步加载之前的事件回调函数，Tree 根据返回值确定是否允许进行异步加载
		beforeClick:null,//用于捕获单击节点之前的事件回调函数，并且根据返回值确定是否允许单击操作
		beforeDblClick:null,//用于捕获 Tree 上鼠标双击之前的事件回调函数，并且根据返回值确定触发 onDblClick 事件回调函数
		beforeRightClick:null,//用于捕获 Tree 上鼠标右键点击之前的事件回调函数，并且根据返回值确定触发 onRightClick 事件回调函数
		beforeMouseDown:null,//用于捕获 Tree 上鼠标按键按下之前的事件回调函数，并且根据返回值确定触发 onMouseDown 事件回调函数
		beforeMouseUp:null,//用于捕获 Tree 上鼠标按键松开之前的事件回调函数，并且根据返回值确定触发 onMouseUp 事件回调函数
		beforeExpand:null,//用于捕获父节点展开之前的事件回调函数，并且根据返回值确定是否允许展开操作
		beforeCollapse:null,//用于捕获父节点折叠之前的事件回调函数，并且根据返回值确定是否允许折叠操作
		beforeRemove:null,//用于捕获节点被删除之前的事件回调函数，并且根据返回值确定是否允许删除操作	
		onLoadError:null,//用于捕获异步加载出现异常错误的事件回调函数
		onLoad:null,//用于捕获异步加载正常结束的事件回调函数
		onNodeCreated:null,//用于捕获节点生成 DOM 后的事件回调函数
		onClick:null,//用于捕获节点被点击的事件回调函数
		onDblClick:null,//用于捕获 Tree 上鼠标双击之后的事件回调函数
		onRightClick:null,//用于捕获 Tree 上鼠标右键点击之后的事件回调函数
		onMouseDown:null,//用于捕获 Tree 上鼠标按键按下后的事件回调函数
		onMouseUp:null,//用于捕获 Tree 上鼠标按键松开后的事件回调函数
		onExpand:null,//用于捕获节点被展开的事件回调函数
		onCollapse:null,//用于捕获节点被折叠的事件回调函数
		onRemove:null//用于捕获删除节点之后的事件回调函数			
	},
	 _create: function () {
		 var settings = {}, roots = {}, caches = {};
		 var options = this.options,
		     obj = this.element;
		 var returnValue = this;
		 this._initTree();
		 
	},
	_getTreeObj: function(treeId) {
		var o = this._getTreeTools(treeId);
		return o ? o : null;
	},
	_initTree: function() {
		
		var obj = this.element;
		var nodeData = this.options.data;
			//添加tree组件样式
		if(!obj.hasClass("coral-tree")) obj.addClass("coral-tree");
		obj.attr("component-role", "tree");
	    var opts = this.options;
		opts.treeId = obj.uniqueId().attr("id");
		opts.treeObj = obj;
		opts.treeObj.empty();
		settings[opts.treeId] = opts;
		if ( opts.cls ) {
			obj.addClass( opts.cls );
		}
		if ( opts.componentCls ){
			obj.addClass( opts.componentCls );
		}
			//For some older browser,(e.g., ie6)
		if(typeof document.body.style.maxHeight === "undefined") {
			opts.expandSpeed = "";
		}
		this._initNodeBind = {
				bind: [this._coreBindEvent,this._checkBindEvent,this._editBindEvent],
				unbind: [this._coreUnbindEvent,this._checkUnbindEvent,this._editUnbindEvent],
				caches: [this._coreInitCache,this._checkInitCache,this._editInitCache],
				nodes: [this._coreInitNode,this._checkInitNode,this._editInitNode],
				proxys: [this._checkEventProxy,this._coreEventProxy,this._editEventProxy],
				roots: [this._coreInitRoot,this._checkInitRoot,this._editInitRoot],
				beforeA: [this._beforeA],
				afterA: [],
				innerBeforeA: [],
				innerAfterA: [],
				treeTools: [this._checkTreeTools,this._editTreeTools]
		};
		this._initRoot(opts);
		var root = this._getRoot(opts),
		childKey = opts.keyChildren;
		nodeData = nodeData ? this._clone(this._isArray(nodeData)? nodeData : [nodeData]) : [];
		nodeData = this._createRootNodes(opts, nodeData );
		if (opts.simpleDataEnable) {
			root[childKey] = this._transformToTreeFormat(opts, nodeData);
		} else {
			root[childKey] = nodeData;
		}
		this._initCache(opts);
		this._unbindTree(opts);
		this._bindTree(opts);
		this._unbindEvent(opts);
		this._bindEvent(opts);
		if ( opts.disabled ) {
			this.disable();
		} else{
			this.enable();
		}
		// // 20140108 lihaibo added
		opts.isInit = true;
		opts.dataLoaded = false;
		opts.rootReload = true;
		// // 20140108 lihaibo added
		if (root[childKey] && root[childKey].length > 0) {
			this._createNodes(opts, 0, root[childKey]);
			opts.treeObj.trigger(_final.event.ASYNC_SUCCESS, [opts.treeId, null, root[childKey]]);
		} else if (opts.asyncEnable && opts.asyncUrl && opts.asyncUrl !== '') {
			this._asyncNode(opts);	
		}
	},
	_setOption: function( key, value ) {
			//treeTools.opts[ key ] = value;
		var options = key,
			opts = this.options;
		this._super(key, value );
		if ( key === "disabled" ) {
			if ( value ) {
				$("#"+opts.treeId).prepend("<div class='coral-state-disabled tree-disabled'></div>");
			} else {
				$("#"+opts.treeId+" .tree-disabled").remove();
			}
		}
	},
	// 初始化搜索引擎，创建拼音搜索索引
	/**
	 * key 如： 
	 * dataArr 如： [{id:'1', name:'节点1'},{id:'2', name:'节点2'}]
	 */
	_pinyinEngine: function () {
		return new pinyinEngine();
	},
	_pinyinSetCache: function (engine, key, dataArr) {
		for (var i in dataArr) {
			// @param	{Array}	标签
			// @param	{Any}	被索引的内容
			engine.setCache ([dataArr[i][key]], dataArr[i]);
		}	
		return engine;
	},
	_pinyinSearch: function (engine, keyword, callback) {
		var dataResult = [];	
		engine.search (keyword, function (data) {
			dataResult.push (data);
		});	
		callback (dataResult);
	},
	// lihaibo add  exhide.js
	/**
	 * keysObj ({id:testId, name:testName, ... })
	 */			
	filterNodesByParam:  function (keysObj) {
		var that = this,
			nodes = that.getNodes(),
			nodesArr = [],
			nodesFilter = [];		
		that.expandAll (true);
		nodesArr = that.transformToArray (nodes);	
		var engine = that._pinyinEngine ();
			engine = that._pinyinSetCache (engine, "name", nodesArr);						
		that.hideNodes (nodesArr);	
		if ( typeof keysObj === "object" ) {
			$.each( keysObj, function (k, v) {
				//nodesFilter = nodesFilter.concat( that.getNodesByParamFuzzy (k, v) );
				if (k == "name") {
					that._pinyinSearch(engine, v, function (dataFilter) { that.showNodes (dataFilter, {showParents: true});	});
				}  
			});
		}
	},
	disable: function(){
		return this._setOption("disabled", true );
	},
	enable: function(){
		return this._setOption("disabled", false );
	},
	showNodes: function(nodes, options) {
		var opts = this.options;
		this._showNodes(opts, nodes, options);
	},
	showNode: function(node) {
		var opts = this.options;
		if (!node) {
			return;
		}
		this._showNodes(opts, [node], opts);
	},
	hideNodes: function(nodes) {
		var opts = this.options;
		this._hideNodes(opts, nodes, opts);
	},
	hideNode: function(node) {
		var opts = this.options;
		if (!node) {
			return;
		}
		this._hideNodes(opts, [node], opts);
	},
	// lihaibo add end
	//删除节点
	removeNode: function(node, callbackFlag) {
		var opts = this.options;
		if (!node) return;
		callbackFlag = !!callbackFlag;
		if (callbackFlag && this._apply(opts.beforeRemove, [opts.treeId, node, opts], true) == false) return;
		this._removeNode(opts, node);
		if (callbackFlag) {
			opts.treeObj.trigger(_final.event.REMOVE, [opts.treeId, node]);
		}
	},
	//选中指定节点
	selectNode: function(node, addFlag) {
		var opts = this.options;
		if (!node) return;
		if (this._uCanDo(opts)) {
			addFlag = opts.selectedMulti && addFlag;
			if (node.parentTId) {
				this._expandCollapseParentNode(opts, node.getParentNode(), true, false, function() {
					try{this._$(node, opts).focus().blur();}catch(e){}
				});
			} else {
				try{this._$(node, opts).focus().blur();}catch(e){}
			}
			this._selectNode(opts, node, addFlag);
		}
	},
	//将简单 Array 格式数据转换为 Tree 使用的标准 JSON 嵌套数据格式
	transformToTreeNodes: function(simpleNodes) {
		var opts = this.options;
		return this._transformToTreeFormat(opts, simpleNodes);
	},
	//将 Tree 使用的标准 JSON 嵌套格式的数据转换为简单 Array 格式
	transformToArray: function(nodes) {
		var opts = this.options;
		return this._transformToArrayFormat(opts, nodes);
	},
	//添加节点
	addNodes: function(parentNode, newNodes, isSilent) {
		var opts = this.options;
		var that = this;
		var oldLevel = parentNode != null ? (typeof(parentNode.level)=="undefined" ? 0 : parentNode.level) : null;
		if (!newNodes) return null;
		if (!parentNode) parentNode = null;
		if (parentNode && !parentNode.isParent && opts.keepLeaf) return null;
		var xNewNodes = that._clone(that._isArray(newNodes)? newNodes: [newNodes]);
		function addCallback() {
			that._addNodes(opts, parentNode, xNewNodes, (isSilent==true));
		}

		if (that._canAsync(opts, parentNode)) {
			that._asyncNode(opts, parentNode, isSilent, addCallback);
		} else {
			addCallback();
		}
		this._addLine(opts, parentNode,oldLevel);
		return xNewNodes;
	},
	//取消节点的选中状态
	cancelSelectedNode: function(node) {
		var opts = this.options;
		this._cancelPreSelectedNode(opts, node);
	},
	//销毁 Tree 的方法
	destroy: function() {
		var opts = this.options;
		this._destroy(opts);
	},	
	//展开 / 折叠 全部节点
	expandAll: function(expandFlag) {
		var opts = this.options;
		expandFlag = !!expandFlag;
		this._expandCollapseSonNode(opts, null, expandFlag, true);
		return expandFlag;
	},
	//展开 / 折叠 指定的节点
	expandNode: function(node, expandFlag, sonSign, focus, callbackFlag) {
		var opts = this.options;
		if (!node || !node.isParent) return null;
		if (expandFlag !== true && expandFlag !== false) {
			expandFlag = !node.open;
		}
		callbackFlag = !!callbackFlag;

		if (callbackFlag && expandFlag && (this._apply(opts.beforeExpand, [opts.treeId, node, opts], true) == false)) {
			return null;
		} else if (callbackFlag && !expandFlag && (this._apply(opts.beforeCollapse, [opts.treeId, node, opts], true) == false)) {
			return null;
		}
		if (expandFlag && node.parentTId) {
			this._expandCollapseParentNode(opts, node.getParentNode(), expandFlag, false);
		}
		if (expandFlag === node.open && !sonSign) {
			return null;
		}
		this._getRoot(opts).expandTriggerFlag = callbackFlag;
		if (!this._canAsync(opts, node) && sonSign) {
			this._expandCollapseSonNode(opts, node, expandFlag, true, function() {
				if (focus !== false) {try{this._$(node, opts).focus().blur();}catch(e){}}
			});
		} else {
			node.open = !expandFlag;
			this._switchNode(opts, node);
			if (focus !== false) {try{this._$(node, opts).focus().blur();}catch(e){}}
		}
		return expandFlag;
	},
	//获取 Tree 的全部节点数据
	getNodes: function() {
		var opts = this.options;
		return this._getNodes(opts);
	},
	//根据节点数据的属性搜索，获取条件完全匹配的节点数据 JSON 对象
	getNodeByParam: function(key, value, parentNode) {
		var opts = this.options;
		if (!key) return null;
		return this._getNodeByParam(opts, parentNode?parentNode[opts.keyChildren]:this._getNodes(opts), key, value);
	},
	//根据 Tree 的唯一标识 tId 快速获取节点 JSON 数据对象
	getNodeByTId: function(tId) {
		var opts = this.options;
		return this._getNodeCache(opts, tId);
	},
	//根据节点数据的属性搜索，获取条件完全匹配的节点数据 JSON 对象集合
	getNodesByParam: function(key, value, parentNode) {
		var opts = this.options;
		if (!key) return null;
		return this._getNodesByParam(opts, parentNode?parentNode[opts.keyChildren]:this._getNodes(opts), key, value);
	},
	//根据节点数据的属性搜索，获取条件模糊匹配的节点数据 JSON 对象集合
	getNodesByParamFuzzy: function(key, value, parentNode) {
		var opts = this.options;
		if (!key) return null;
		return this._getNodesByParamFuzzy(opts, parentNode?parentNode[opts.keyChildren]:this._getNodes(opts), key, value);
	},
	//根据自定义规则搜索节点数据 JSON 对象集合 或 单个节点数据
	getNodesByFilter: function(filter, isSingle, parentNode, invokeParam) {
		var opts = this.options;
		isSingle = !!isSingle;
		if (!filter || (typeof filter != "function")) return (isSingle ? null : []);
		return this._getNodesByFilter(opts, parentNode?parentNode[opts.keyChildren]:this._getNodes(opts), filter, isSingle, invokeParam);
	},
	//获取某节点在同级节点中的序号（从0开始）
	getNodeIndex: function(node) {
		var opts = this.options;
		if (!node) return null;
		var childKey = opts.keyChildren,
		parentNode = (node.parentTId) ? node.getParentNode() : this._getRoot(opts);
		for (var i=0, l = parentNode[childKey].length; i < l; i++) {
			if (parentNode[childKey][i] == node) return i;
		}
		return -1;
	},
	//获取 Tree 当前被选中的节点数据集合
	getSelectedNodes: function() {
		var opts = this.options;
		var r = [], list = this._getRoot(opts).curSelectedList;
		for (var i=0, l=list.length; i<l; i++) {
			r.push(list[i]);
		}
		return r;
	},
	//是否选中节点
	isSelectedNode: function(node) {
		var opts = this.options;
		return this._isSelectedNode(opts, node);
	},
	//强行异步加载父节点的子节点
	reAsyncChildNodes: function(parentNode, reloadType, isSilent, opts) {
		var options = this.options;
		if (!this.options.asyncEnable) return;
		var isRoot = !parentNode;
		if (isRoot) {
			parentNode = this._getRoot(options);
		}
		if (reloadType=="refresh") {
			var childKey = this.options.keyChildren;
			for (var i = 0, l = parentNode[childKey] ? parentNode[childKey].length : 0; i < l; i++) {
				this._removeNodeCache(options, parentNode[childKey][i]);
			}
			this._removeSelectedNode(options);
			parentNode[childKey] = [];
			if (isRoot) {
				this.options.treeObj.empty();
			} else {
				var ulObj = this._$(parentNode, _final.id.UL, options);
				ulObj.empty();
			}
		}
		this._asyncNode(this.options, isRoot? null:parentNode, !!isSilent, null, opts);
	},
	// 是reAsyncChildNodes的数组reload版
	reLoadChildNodes: function(parentNode, reloadType, isSilent, newNodes) {
		var opts = this.options;
		//if (this.setting.asyncEnable) return;
		var isRoot = !parentNode;
		if (isRoot) {
			parentNode = this._getRoot(opts);
		}
		if (reloadType=="refresh") {
			var childKey = opts.keyChildren;
			for (var i = 0, l = parentNode[childKey] ? parentNode[childKey].length : 0; i < l; i++) {
				this._removeNodeCache(opts, parentNode[childKey][i]);
			}
			this._removeSelectedNode(opts);
			parentNode[childKey] = [];
			if (isRoot) {
				this.element.empty();
			} else {
				var ulObj = this._$(parentNode, _final.id.UL, opts);
				ulObj.empty();
			}
		}
		if (opts.isInit ){
			newNodes = this._createRootNodes(opts,newNodes);
		}
		this.addNodes(isRoot? null:parentNode, newNodes, !!isSilent);
	},
	//刷新 Tree 
	refresh: function() {
		var opts = this.options;
		opts.treeObj.empty();
		var root = this._getRoot(opts),
		nodes = root[opts.keyChildren]
		this._initRoot(opts);
		root[opts.keyChildren] = nodes
		this._initCache(opts);
		this._createNodes(opts, 0, root[opts.keyChildren]);
	},
	/**
	 * 重载 Tree，支持数组
	 * 
	 * url不能传进来，因为如果是异步树，点击节点的时候则会请求之前的url
	 */
	reload: function(opts) {
		var options = this.options;
		this.options.isInit = true;
		if(opts){// 有参数的时候
			opts = opts || {};
			var that = this,
				nodes = [], 
				isUrl = false;
			if ( typeof( opts ) !== "string" ) {
				// 传过来的是object，需要区别是data还是options
				// 如果是options，可能是options.data或者options.url ，否则才为data
				if ( opts.data ) { //传进来的是options对象
					nodes = opts.data;
				} else {
					if(opts instanceof Array){
						nodes = opts;
					} else {
						if ( opts.asyncUrl ) {
							this.options.asyncUrl = opts.asyncUrl;
						}
						isUrl = true;
					}
				}
			} else {
				isUrl = true;
				this.options.asyncUrl = opts;
			}
			if ( isUrl && this.options.asyncEnable) {
				this.reAsyncChildNodes( null, "refresh", null, opts );
			} else {
				this.reLoadChildNodes( null, "refresh", null, nodes );
				this._apply(options.onLoad, [null, this.options.treeId]);
				if ( opts.onLoad ) {
					this._apply(options.onLoad, [options.treeId, null, nodes]);
				} else {
					options.treeObj.trigger(_final.event.ASYNC_SUCCESS, [options.treeId, null, nodes]);
				}
			}
		} else if ( this.options.asyncEnable ){// 无参数的时候
			opts = opts || {};
			this.reAsyncChildNodes( null, "refresh", null, opts );
		}
	},
	//清空某父节点的子节点
	removeChildNodes: function(node) {
		var opts = this.options;
		if (!node) return null;
		var childKey = opts.keyChildren,
		nodes = node[childKey];
		this._removeChildNodes(opts, node);
		return nodes ? nodes : null;
	},	
	//树组件使用root来保存全部数据
	//普通树初始化root
	_coreInitRoot : function (opts) {
		var opts = this.options;
		var root = this._getRoot(opts);
		if (!root) {
			root ={};
			this._setRoot(opts, root);
		}
		root[opts.keyChildren] = [];
		root.expandTriggerFlag = false;
		root.curSelectedList = [];
		root.noSelection = true;
		root.createdNodes = [];
		root.zId = 0;
		root._ver = (new Date()).getTime();
	},
	//多选树初始化root
	_checkInitRoot : function (opts) {
		var opts = this.options;
		var root = this._getRoot(opts);
		root.radioCheckedList = [];
	},
	//可编辑树初始化root
	_editInitRoot : function (opts) {
		var opts = this.options;
		var root = this._getRoot(opts), roots = this._getRoots();
		root.curEditNode = null;
		root.curEditInput = null;
		root.curHoverNode = null;
		root.dragFlag = 0;
		root.dragNodeShowBefore = [];
		root.dragMaskList = new Array();
		roots.showHoverDom = true;
	},
	//普通树初始化cache
	_coreInitCache : function(opts) {
		var opts = this.options;
		var cache = this._getCache(opts);
		if (!cache) {
			cache = {};
			this._setCache(opts, cache);
		}
		cache.nodes = [];
		cache.doms = [];
	},
	//多选树初始化cache
	_checkInitCache : function(treeId) {},
	//可编辑树初始化cache
	_editInitCache : function(treeId) {},
	//普通树绑定事件
	_coreBindEvent : function(opts) {
		var opts = this.options;
		var that = this;
		//bind = this._init.bind;
		var treeObj = opts.treeObj,
		cache = _final.event;
		treeObj.bind(cache.NODECREATED, function (event, treeId, node) {
			that._trigger("onNodeCreated", null, [treeId, node, opts]);
		});

		treeObj.bind(cache.CLICK, function (event, srcEvent, treeId, node, clickFlag) {
			if (node.nodeDisabled==true)return false;
			that._trigger("onClick", null, [treeId, node, clickFlag, opts]);
		});

		treeObj.bind(cache.EXPAND, function (event, treeId, node) {
			that._trigger("onExpand", null, [treeId, node, opts]);
		});

		treeObj.bind(cache.COLLAPSE, function (event, treeId, node) {
			that._trigger("onCollapse", null, [treeId, node, opts]);
		});

		treeObj.bind(cache.ASYNC_SUCCESS, function (event, treeId, node, msg) {
			that._trigger("onLoad", null,[treeId, node, msg, opts]);
		});

		treeObj.bind(cache.ASYNC_ERROR, function (event, treeId, node, XMLHttpRequest, textStatus, errorThrown) {
			that._trigger("onLoad", null, [treeId, node, XMLHttpRequest, textStatus, errorThrown, opts]);
		});

		treeObj.bind(cache.REMOVE, function (event, treeId, treeNode) {
			that._trigger("onRemove", null, [treeId, treeNode, opts]);
		});
	},
	//多选树绑定事件
	_checkBindEvent : function(opts) {
		var treeObj = this.element,
			that = this;
		cache = _final.event;
		treeObj.bind(cache.CHECK, function (event, srcEvent, treeId, node) {
			event.srcEvent = srcEvent;
			that._trigger("onCheck", null, [treeId, node, opts]);
		});
	},
	//可编辑树绑定事件
	_editBindEvent : function(opts) {
		var treeObj = this.element;
		var cache = _final.event;
		var that = this;
		treeObj.bind(cache.RENAME, function (event, treeId, treeNode, isCancel) {
			that._trigger("onReName", null, [treeId, treeNode, isCancel, opts]);
		});

		treeObj.bind(cache.DRAG, function (event, srcEvent, treeId, treeNodes) {
			that._trigger("onDrag", null, [treeId, treeNodes, opts]);
		});

		treeObj.bind(cache.DRAGMOVE,function(event, srcEvent, treeId, treeNodes){
			that._trigger("onDragMove", null, [treeId, treeNodes, opts]);
		});

		treeObj.bind(cache.DROP, function (event, srcEvent, treeId, treeNodes, targetNode, moveType, isCopy) {
			that._trigger("onDrop", null, [treeId, treeNodes, targetNode, moveType, isCopy, opts]);
		});
	},
	//普通树松绑事件
	_coreUnbindEvent : function(opts) {
		var treeObj = this.element,
		cache = _final.event;
		treeObj.unbind(cache.NODECREATED)
		.unbind(cache.CLICK)
		.unbind(cache.EXPAND)
		.unbind(cache.COLLAPSE)
		.unbind(cache.ASYNC_SUCCESS)
		.unbind(cache.ASYNC_ERROR)
		.unbind(cache.REMOVE);
	},
	//多选树松绑事件
	_checkUnbindEvent : function(opts) {
		var treeObj = this.element;
		var cache = _final.event;
		treeObj.unbind(cache.CHECK);
	},
	//可编辑树松绑事件
	_editUnbindEvent : function(opts) {
		var treeObj = this.element;
		var cache = _final.event;
		treeObj.unbind(cache.RENAME);
		treeObj.unbind(cache.DRAG);
		treeObj.unbind(cache.DRAGMOVE);
		treeObj.unbind(cache.DROP);
	},
	//普通树代理事件
	_coreEventProxy : function(event) {
		var target = event.target,
		opts = this._getSetting(this.options.treeId),
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null,
		tmp = null;

		if (this._eqs(event.type, "mousedown")) {
			treeEventType = "mousedown";
		} else if (this._eqs(event.type, "mouseup")) {
			treeEventType = "mouseup";
		} else if (this._eqs(event.type, "contextmenu")) {
			treeEventType = "contextmenu";
		} else if (this._eqs(event.type, "click")) {
			if (this._eqs(target.tagName, "span") && target.getAttribute("treeNode"+ _final.id.SWITCH) !== null) {
				tId = this._getNodeMainDom(target).id;
				nodeEventType = "switchNode";
			} else {
				tmp = this._getMDom(opts, target, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
				if (tmp) {
					tId = this._getNodeMainDom(tmp).id;
					nodeEventType = "clickNode";
				}
			}
		} else if (this._eqs(event.type, "dblclick")) {
			treeEventType = "dblclick";
			tmp = this._getMDom(opts, target, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
			if (tmp) {
				tId = this._getNodeMainDom(tmp).id;
				nodeEventType = "switchNode";
			}
		}
		if (treeEventType.length > 0 && tId.length == 0) {
			tmp = this._getMDom(opts, target, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
			if (tmp) {tId = this._getNodeMainDom(tmp).id;}
		}
		// event to node
		if (tId.length>0) {
			node = this._getNodeCache(opts, tId);
			switch (nodeEventType) {
				case "switchNode" :
					if (!node.isParent) {
						nodeEventType = "";
					} else if (this._eqs(event.type, "click")
						|| (this._eqs(event.type, "dblclick") && this._apply(opts.dblClickExpand, [opts.treeId, node, opts], opts.dblClickExpand))) {
						nodeEventCallback = this._onSwitchNode;
					} else {
						nodeEventType = "";
					}
					break;
				case "clickNode" :
					nodeEventCallback = this._onClickNode;
					break;
			}
		}
		// event to Tree
		switch (treeEventType) {
			case "mousedown" :
				treeEventCallback = this._onTreeMousedown;
				break;
			case "mouseup" :
				treeEventCallback = this._onTreeMouseup;
				break;
			case "dblclick" :
				treeEventCallback = this._onTreeDblclick;
				break;
			case "contextmenu" :
				treeEventCallback = this._onTreeContextmenu;
				break;
		}
		var proxyResult = {
			stop: false,
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//多选树代理事件
	_checkEventProxy : function(e) {
		var target = e.target,
		opts = this._getSetting(this.options.treeId),
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null;
		if (this._eqs(e.type, "mouseover")) {
			if (opts.checkable && this._eqs(target.tagName, "span") && target.getAttribute("treeNode"+ _final.id.CHECK) !== null) {
				tId = this._getNodeMainDom(target).id;
				nodeEventType = "mouseoverCheck";
			}
		} else if (this._eqs(e.type, "mouseout")) {
			if (opts.checkable && this._eqs(target.tagName, "span") && target.getAttribute("treeNode"+ _final.id.CHECK) !== null) {
				tId = this._getNodeMainDom(target).id;
				nodeEventType = "mouseoutCheck";
			}
		} else if (this._eqs(e.type, "click")) {
			if (opts.checkable && this._eqs(target.tagName, "span") && target.getAttribute("treeNode"+ _final.id.CHECK) !== null) {
				tId = this._getNodeMainDom(target).id;
				nodeEventType = "checkNode";
			}
		}
		if (tId.length>0) {
			node = this._getNodeCache(opts, tId);
			switch (nodeEventType) {
				case "checkNode" :
					nodeEventCallback = this._onCheckNode;
					break;
				case "mouseoverCheck" :
					nodeEventCallback = this._onMouseoverCheck;
					break;
				case "mouseoutCheck" :
					nodeEventCallback = this._onMouseoutCheck;
					break;
			}
		}
		var proxyResult = {
			stop: nodeEventType === "checkNode",
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//可编辑树代理事件
	_editEventProxy : function(e) {
		var target = e.target,
		opts = this._getSetting(this.options.treeId),
		relatedTarget = e.relatedTarget,
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null,
		tmp = null;
		if (this._eqs(e.type, "mouseover")) {
			tmp = this._getMDom(opts, target, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
			if (tmp) {
				tId = this._getNodeMainDom(tmp).id;
				nodeEventType = "hoverOverNode";
			}
		} else if (this._eqs(e.type, "mouseout")) {
			tmp = this._getMDom(opts, relatedTarget, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
			if (!tmp) {
				tId = "remove";
				nodeEventType = "hoverOutNode";
			}
		} else if (this._eqs(e.type, "mousedown")) {
			tmp = this._getMDom(opts, target, [{tagName:"a", attrName:"treeNode"+_final.id.A}]);
			if (tmp) {
				tId = this._getNodeMainDom(tmp).id;
				nodeEventType = "mousedownNode";
			}
		}
		if (tId.length>0) {
			node = this._getNodeCache(opts, tId);
			switch (nodeEventType) {
				case "mousedownNode" :
					nodeEventCallback = this._onMousedownNode;
					break;
				case "hoverOverNode" :
					nodeEventCallback = this._onHoverOverNode;
					break;
				case "hoverOutNode" :
					nodeEventCallback = this._onHoverOutNode;
					break;
			}
		}
		var proxyResult = {
			stop: false,
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//多选树节点前插入dom元素
	_beforeA : function(opts, node, html) {
		var checkedKey = opts.keyChecked;
		if (opts.checkable) {
			this._makeChkFlag(opts, node);
			html.push("<span ID='", node.tId, _final.id.CHECK, "' class='", this._makeChkClass(opts, node), "' treeNode", _final.id.CHECK, (node.nocheck === true?" style='display:none;'":""),"></span>");
		}
	},	
	//普通树初始化节点
	_coreInitNode : function(opts, level, node, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!node) return;
		var r = this._getRoot(opts),
		    that = this,
		    childKey = opts.keyChildren;
		node.level = level;
		node.tId = opts.treeId + "_" + (++r.zId);
		node.parentTId = parentNode ? parentNode.tId : null;
		node.open = (typeof node.open == "string") ? that._eqs(node.open, "true") : !!node.open;
		if (node[childKey] && node[childKey].length > 0) {
			node.isParent = true;
			node.zAsync = true;
		} else {
			node.isParent = (typeof node.isParent == "string") ? that._eqs(node.isParent, "true") : !!node.isParent;
			node.open = (node.isParent && !opts.asyncEnable) ? node.open : false;
			node.zAsync = !node.isParent;
		}
		node.isFirstNode = isFirstNode;
		node.isLastNode = isLastNode;
		node.getParentNode = function() {return that._getNodeCache(opts, node.parentTId);};
		node.getPreNode = function() {return that._getPreNode(opts, node);};
		node.getNextNode = function() {return that._getNextNode(opts, node);};
		node.isAjaxing = false;
		that._fixPIdKeyValue(opts, node);
	},	
	//多选树初始化节点
	_checkInitNode : function(opts, level, node, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!node) return;
		if (node.nodeDisabled == true){
			node.chkDisabled = true
		}
		var checkedKey = opts.keyChecked;
		var that = this;
		if (typeof node[checkedKey] == "string") node[checkedKey] = that._eqs(node[checkedKey], "true");
		node[checkedKey] = !!node[checkedKey];
		node.checkedOld = node[checkedKey];
		if (typeof node.nocheck == "string") node.nocheck = that._eqs(node.nocheck, "true");
		node.nocheck = !!node.nocheck || (opts.nocheckInherit && parentNode && !!parentNode.nocheck);
		if (typeof node.chkDisabled == "string") node.chkDisabled = that._eqs(node.chkDisabled, "true");
		node.chkDisabled = !!node.chkDisabled || (opts.chkDisabledInherit && parentNode && !!parentNode.chkDisabled);
		if (typeof node.halfCheck == "string") node.halfCheck = that._eqs(node.halfCheck, "true");
		node.halfCheck = !!node.halfCheck;
		node.check_Child_State = -1;
		node.check_Focus = false;
		node.getCheckStatus = function() {return that._getCheckStatus(opts, node);};
		if (opts.chkStyle == _final.radio.STYLE && opts.radioType == _final.radio.TYPE_ALL && node[checkedKey] ) {
			var r = that._getRoot(opts);
			r.radioCheckedList.push(node);
		}
	},
	//可编辑树初始化节点
	_editInitNode : function(opts, level, node, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!node) return;
		node.isHover = false;
		node.editNameFlag = false;
	},
	//更新 TreeObj, 增加部分多选树的工具方法
	_checkTreeTools : function(opts, treeTools) {
	},
	checkNode: function(node, checked, checkTypeFlag, callbackFlag) {
		var checkedKey = this.options.keyChecked;
		var that = this,opts = this.options;
		if (node.chkDisabled === true) return;
		if (checked !== true && checked !== false) {
			checked = !node[checkedKey];
		}
		callbackFlag = !!callbackFlag;

		if (node[checkedKey] === checked && !checkTypeFlag) {
			return;
		} else if (callbackFlag && that._apply(opts.beforeCheck, [opts.treeId, node,opts], true) == false) {
			return;
		}
		if (this._uCanDo(opts) && opts.checkable && node.nocheck !== true) {
			node[checkedKey] = checked;
			var checkObj = this._$(node, _final.id.CHECK, opts);
			if (checkTypeFlag || opts.chkStyle === _final.radio.STYLE) this._checkNodeRelation(opts, node);
			this._setChkClass(opts, checkObj, node);
			this._repairParentChkClassWithSelf(opts, node);
			if (callbackFlag) {
				opts.treeObj.trigger(_final.event.CHECK, [null, opts.treeId, node]);
			}
		}
	},
	//更新 TreeObj, 增加部分可编辑树的工具方法
	_editTreeTools : function(opts, treeTools) {
		treeTools.cancelEditName = function(newName) {
			var root = this._getRoot(this.opts);
			if (!root.curEditNode) return;
			this._cancelCurEditNode(this.opts, newName?newName:null, true);
		}
		
	},
	copyNode: function(targetNode, node, moveType, isSilent) {
		if (!node) return null;
		var opts = this.options,that = this;
		if (targetNode && !targetNode.isParent && opts.keepLeaf && moveType === _final.move.TYPE_INNER) return null;
		var newNode = this._clone(node);
		if (!targetNode) {
			targetNode = null;
			moveType = _final.move.TYPE_INNER;
		}
		if (moveType == _final.move.TYPE_INNER) {
			function copyCallback() {
				this._addNodes(opts, targetNode, [newNode], isSilent);
			}

			if (this._canAsync(opts, targetNode)) {
				this._asyncNode(opts, targetNode, isSilent, copyCallback);
			} else {
				copyCallback();
			}
		} else {
			this._addNodes(opts, targetNode.parentNode, [newNode], isSilent);
			this._moveNode(opts, targetNode, newNode, moveType, false, isSilent);
		}
		return newNode;
	},
	editName: function(node) {
		var opts = this.options;
		if (!node || !node.tId || node !== this._getNodeCache(opts, node.tId)) return;
		if (node.parentTId) this._expandCollapseParentNode(opts, node.getParentNode(), true);
		this._editNode(opts, node)
	},
	moveNode: function(targetNode, node, moveType, isSilent) {
		if (!node) return node;
		var opts = this.options;
		if (targetNode && !targetNode.isParent && opts.keepLeaf && moveType === _final.move.TYPE_INNER) {
			return null;
		} else if (targetNode && ((node.parentTId == targetNode.tId && moveType == _final.move.TYPE_INNER) || this._$(node, opts).find("#" + targetNode.tId).length > 0)) {
			return null;
		} else if (!targetNode) {
			targetNode = null;
		}
		function moveCallback() {
			this._moveNode(opts, targetNode, node, moveType, false, isSilent);
		}
		if (this._canAsync(opts, targetNode) && moveType === _final.move.TYPE_INNER) {
			this._asyncNode(opts, targetNode, isSilent, moveCallback);
		} else {
			moveCallback();
		}
		return node;
	},
	setEditable: function(editable) {
		var opts = this.options;
		opts.editable = editable;
		return this.refresh();
	},
	checkAllNodes: function(checked) {
		this._repairAllChk(this.options, !!checked);
	},
	getCheckedNodes: function(checked) {
		var childKey = this.options.keyChildren;
		checked = (checked !== false);
		return this._getTreeCheckedNodes(this.options, this._getRoot(this.options)[childKey], checked);
	},
	getChangeCheckedNodes: function() {
		var childKey = this.options.keyChildren;
		return this._getTreeChangeCheckedNodes(this.options, this._getRoot(this.options)[childKey]);
	},
	setChkDisabled: function(node, disabled, inheritParent, inheritChildren) {
		disabled = !!disabled;
		inheritParent = !!inheritParent;
		inheritChildren = !!inheritChildren;
		this._repairSonChkDisabled(this.options, node, disabled, inheritChildren);
		this._repairParentChkDisabled(this.options, node.getParentNode(), disabled, inheritParent);
	},
	updateNode: function(node, checkTypeFlag) {
		var _updateNode = this.options.updateNode;
		var opts = this.options;
		if (!node) return;
		var nObj = this._$(node, opts);
		if (nObj.get(0) && this._uCanDo(opts)) {
			this._setNodeName(opts, node);
			this._setNodeTarget(opts, node);
			this._setNodeUrl(opts, node);
			this._setNodeLineIcos(opts, node);
			this._setNodeFontCss(opts, node);
		}
		if (!node || !this.options.checkable) return;
		var nObj = this._$(node, this.options);
		if (nObj.get(0) && this._uCanDo(this.options)) {
			var checkObj = this._$(node, _final.id.CHECK, this.options);
			if (checkTypeFlag == true || this.options.chkStyle === _final.radio.STYLE) this._checkNodeRelation(this.options, node);
			this._setChkClass(this.options, checkObj, node);
			this._repairParentChkClassWithSelf(this.options, node);
		}
	},
	//method of operate data
	_addNodeCache: function(opts, node) {
		this._getCache(opts).nodes[this._getNodeCacheId(node.tId)] = node;
	},
	_getNodeCacheId: function(tId) {
		return tId.substring(tId.lastIndexOf("_")+1);
	},
	_addNodesData: function(opts, parentNode, nodes) {
		var childKey = opts.keyChildren;
		if (!parentNode[childKey]) parentNode[childKey] = [];
		if (parentNode[childKey].length > 0) {
			parentNode[childKey][parentNode[childKey].length - 1].isLastNode = false;
			this._setNodeLineIcos(opts, parentNode[childKey][parentNode[childKey].length - 1]);
		}
		parentNode.isParent = true;
		// rootNode根节点设置了为true，并且不显示根节点的时候需要处理node
		// TODO: rootNode 为数组的时候reload是否会报错
		/*if( setting.isInit && !setting.showRootNode && setting.rootNode ){
			var children = (nodes.length&&nodes[0][childKey])?nodes[0][childKey]:[];
			if ( children.length > 0 )
				parentNode[childKey] = parentNode[childKey].concat(children);
		} else {
			parentNode[childKey] = parentNode[childKey].concat(nodes);
		}*/
		parentNode[childKey] = parentNode[childKey].concat(nodes);
	},
	_addSelectedNode: function(opts, node) {
		var root = this._getRoot(opts);
		if (!this._isSelectedNode(opts, node)) {
			root.curSelectedList.push(node);
		}
	},
	_addCreatedNode: function(opts, node) {
		if (!!opts.onNodeCreated || !!opts.addDiyDom) {
			var root = this._getRoot(opts);
			root.createdNodes.push(node);
		}
	},

	_fixPIdKeyValue: function(opts, node) {
		if (opts.simpleDataEnable) {
			node[opts.simpleDataPIdKey] = node.parentTId ? node.getParentNode()[opts.simpleDataIdKey] : opts.simpleDataRootPId;
		}
	},
	_getAfterA: function(opts, node, array) {
		for (var i=0, j=this._initNodeBind.afterA.length; i<j; i++) {
			this._initNodeBind.afterA[i].apply(this, arguments);
		}
	},
	_getBeforeA: function(opts, node, array) {
		for (var i=0, j=this._initNodeBind.beforeA.length; i<j; i++) {
			this._initNodeBind.beforeA[i].apply(this, arguments);
		}
	},
	_getInnerAfterA: function(opts, node, array) {
		for (var i=0, j=this._initNodeBind.innerAfterA.length; i<j; i++) {
			this._initNodeBind.innerAfterA[i].apply(this, arguments);
		}
	},
	_getInnerBeforeA: function(opts, node, array) {
		for (var i=0, j=this._initNodeBind.innerBeforeA.length; i<j; i++) {
			this._initNodeBind.innerBeforeA[i].apply(this, arguments);
		}
	},
	_getCache: function(opts) {
		return caches[opts.treeId];
	},
	_getNextNode: function(opts, node) {
		if (!node) return null;
		var childKey = opts.keyChildren,
		p = node.parentTId ? node.getParentNode() : this._getRoot(opts);
		for (var i=0, l=p[childKey].length-1; i<=l; i++) {
			if (p[childKey][i] === node) {
				return (i==l ? null : p[childKey][i+1]);
			}
		}
		return null;
	},
	_getNodeByParam: function(opts, nodes, key, value) {
		if (!nodes || !key) return null;
		var childKey = opts.keyChildren;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (nodes[i][key] == value) {
				return nodes[i];
			}
			var tmp = this._getNodeByParam(opts, nodes[i][childKey], key, value);
			if (tmp) return tmp;
		}
		return null;
	},
	_getNodeCache: function(opts, tId) {
		if (!tId) return null;
		var n = caches[opts.treeId].nodes[this._getNodeCacheId(tId)];
		return n ? n : null;
	},
	_getNodeName: function(opts, node) {
		var nameKey = opts.keyName;
		return "" + node[nameKey];
	},
	_getNodeTitle: function(opts, node) {
		var t = opts.keyTitle === "" ? opts.keyName : opts.keyTitle;
		return "" + node[t];
	},
	_getNodes: function(opts) {
		return this._getRoot(opts)[opts.keyChildren];
	},
	_getNodesByParam: function(opts, nodes, key, value) {
		if (!nodes || !key) return [];
		var childKey = opts.keyChildren,
		result = [];
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (nodes[i][key] == value) {
				result.push(nodes[i]);
			}
			result = result.concat(this._getNodesByParam(opts, nodes[i][childKey], key, value));
		}
		return result;
	},
	_getNodesByParamFuzzy: function(opts, nodes, key, value) {
		if (!nodes || !key) return [];
		var childKey = opts.keyChildren,
		result = [];
		value = value.toLowerCase();
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (typeof nodes[i][key] == "string" && nodes[i][key].toLowerCase().indexOf(value)>-1) {
				result.push(nodes[i]);
			}
			result = result.concat(this._getNodesByParamFuzzy(opts, nodes[i][childKey], key, value));
		}
		return result;
	},
	_getNodesByFilter: function(opts, nodes, filter, isSingle, invokeParam) {
		if (!nodes) return (isSingle ? null : []);
		var childKey = opts.keyChildren,
		result = isSingle ? null : [];
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (this._apply(filter, [nodes[i], invokeParam], false)) {
				if (isSingle) {return nodes[i];}
				result.push(nodes[i]);
			}
			var tmpResult = this._getNodesByFilter(opts, nodes[i][childKey], filter, isSingle, invokeParam);
			if (isSingle && !!tmpResult) {return tmpResult;}
			result = isSingle ? tmpResult : result.concat(tmpResult);
		}
		return result;
	},
	_getPreNode: function(opts, node) {
		if (!node) return null;
		var childKey = opts.keyChildren,
		p = node.parentTId ? node.getParentNode() : this._getRoot(opts);
		for (var i=0, l=p[childKey].length; i<l; i++) {
			if (p[childKey][i] === node) {
				return (i==0 ? null : p[childKey][i-1]);
			}
		}
		return null;
	},
	_getRadioCheckedList: function(opts) {
		var checkedList = this._getRoot(opts).radioCheckedList;
		for (var i=0, j=checkedList.length; i<j; i++) {
			if(!this._getNodeCache(opts, checkedList[i].tId)) {
				checkedList.splice(i, 1);
				i--; j--;
			}
		}
		return checkedList;
	},
	_getCheckStatus: function(opts, node) {
		if (!opts.checkable || node.nocheck || node.chkDisabled) return null;
		var checkedKey = opts.keyChecked,
		r = {
			checked: node[checkedKey],
			half: node.halfCheck ? node.halfCheck : (opts.chkStyle == _final.radio.STYLE ? (node.check_Child_State === 2) : (node[checkedKey] ? (node.check_Child_State > -1 && node.check_Child_State < 2) : (node.check_Child_State > 0)))
		};
		return r;
	},
	_getTreeCheckedNodes: function(opts, nodes, checked, results) {
		if (!nodes) return [];
		var childKey = opts.keyChildren,
		checkedKey = opts.keyChecked,
		onlyOne = (checked && opts.chkStyle == _final.radio.STYLE && opts.radioType == _final.radio.TYPE_ALL);
		results = !results ? [] : results;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] == checked) {
				results.push(nodes[i]);
				if(onlyOne) {
					break;
				}
			}
			this._getTreeCheckedNodes(opts, nodes[i][childKey], checked, results);
			if(onlyOne && results.length > 0) {
				break;
			}
		}
		return results;
	},
	_getTreeChangeCheckedNodes: function(opts, nodes, results) {
		if (!nodes) return [];
		var childKey = opts.keyChildren,
		checkedKey = opts.keyChecked;
		results = !results ? [] : results;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] != nodes[i].checkedOld) {
				results.push(nodes[i]);
			}
			this._getTreeChangeCheckedNodes(opts, nodes[i][childKey], results);
		}
		return results;
	},
	_getRoot: function(opts) {
		return opts ? roots[opts.treeId] : null;
	},
	_getRoots: function() {
		return roots;
	},
	_getSetting: function(treeId) {
		return settings[treeId];
	},
	_getSettings: function() {
		return settings;
	},
	_getTreeTools: function(treeId) {
		var r = this._getRoot(this._getSetting(treeId));
		return r ? r.treeTools : null;
	},
	_initCache: function(opts) {
		for (var i=0, j=this._initNodeBind.caches.length; i<j; i++) {
			this._initNodeBind.caches[i].apply(this, arguments);
		}
	},
	_initNode: function(opts, level, node, parentNode, preNode, nextNode) {
		for (var i=0, j=this._initNodeBind.nodes.length; i<j; i++) {
			this._initNodeBind.nodes[i].apply(this, arguments);
		}
	},
	_initRoot: function(opts) {
		for (var i=0, j=this._initNodeBind.roots.length; i<j; i++) {
			this._initNodeBind.roots[i].apply(this, arguments);
		}
	},
	_isSelectedNode: function(opts, node) {
		var root = this._getRoot(opts);
		for (var i=0, j=root.curSelectedList.length; i<j; i++) {
			if(node === root.curSelectedList[i]) return true;
		}
		return false;
	},
	_removeNodeCache: function(opts, node) {
		var childKey = opts.keyChildren;
		if (node[childKey]) {
			for (var i=0, l=node[childKey].length; i<l; i++) {
				this._removeNodeCache(opts, node[childKey][i]);
			}
		}
		this._getCache(opts).nodes[this._getNodeCacheId(node.tId)] = null;
	},
	_removeSelectedNode: function(opts, node) {
		var root = this._getRoot(opts);
		for (var i=0, j=root.curSelectedList.length; i<j; i++) {
			if(node === root.curSelectedList[i] || !this._getNodeCache(opts, root.curSelectedList[i].tId)) {
				root.curSelectedList.splice(i, 1);
				i--;j--;
			}
		}
	},
	_setCache: function(opts, cache) {
		caches[opts.treeId] = cache;
	},
	_setRoot: function(opts, root) {
		roots[opts.treeId] = root;
	},
	_setTreeTools: function(opts, treeTools) {
		for (var i=0, j=this._initNodeBind.treeTools.length; i<j; i++) {
			this._initNodeBind.treeTools[i].apply(this, arguments);
		}
	},
	_makeChkFlag: function(opts, node) {
		if (!node) return;
		var childKey = opts.keyChildren,
		checkedKey = opts.keyChecked,
		chkFlag = -1;
		if (node[childKey]) {
			for (var i = 0, l = node[childKey].length; i < l; i++) {
				var cNode = node[childKey][i];
				var tmp = -1;
				if (opts.chkStyle == _final.radio.STYLE) {
					if (cNode.nocheck === true || cNode.chkDisabled === true) {
						tmp = cNode.check_Child_State;
					} else if (cNode.halfCheck === true) {
						tmp = 2;
					} else if (cNode[checkedKey]) {
						tmp = 2;
					} else {
						tmp = cNode.check_Child_State > 0 ? 2:0;
					}
					if (tmp == 2) {
						chkFlag = 2; break;
					} else if (tmp == 0){
						chkFlag = 0;
					}
				} else if (opts.chkStyle == _final.checkbox.STYLE) {
					if (cNode.nocheck === true || cNode.chkDisabled === true) {
						tmp = cNode.check_Child_State;
					} else if (cNode.halfCheck === true) {
						tmp = 1;
					} else if (cNode[checkedKey] ) {
						tmp = (cNode.check_Child_State === -1 || cNode.check_Child_State === 2) ? 2 : 1;
					} else {
						tmp = (cNode.check_Child_State > 0) ? 1 : 0;
					}
					if (tmp === 1) {
						chkFlag = 1; break;
					} else if (tmp === 2 && chkFlag > -1 && i > 0 && tmp !== chkFlag) {
						chkFlag = 1; break;
					} else if (chkFlag === 2 && tmp > -1 && tmp < 2) {
						chkFlag = 1; break;
					} else if (tmp > -1) {
						chkFlag = tmp;
					}
				}
			}
		}
		node.check_Child_State = chkFlag;
	},
	_setSonNodeLevel: function(opts, parentNode, node) {
		if (!node) return;
		var childKey = opts.keyChildren;
		node.level = (parentNode)? parentNode.level + 1 : 0;
		if (!node[childKey]) return;
		for (var i = 0, l = node[childKey].length; i < l; i++) {
			if (node[childKey][i]) this._setSonNodeLevel(opts, node, node[childKey][i]);
		}
	},
	_transformToArrayFormat: function (opts, nodes) {
		if (!nodes) return [];
		var childKey = opts.keyChildren,
		r = [];
		if (this._isArray(nodes)) {
			for (var i=0, l=nodes.length; i<l; i++) {
				r.push(nodes[i]);
				if (nodes[i][childKey])
					r = r.concat(this._transformToArrayFormat(opts, nodes[i][childKey]));
			}
		} else {
			r.push(nodes);
			if (nodes[childKey])
				r = r.concat(this._transformToArrayFormat(opts, nodes[childKey]));
		}
		return r;
	},
	_transformToTreeFormat: function(opts, sNodes) {
		var i,l,
		key = opts.simpleDataIdKey,
		parentKey = opts.simpleDataPIdKey,
		childKey = opts.keyChildren;
		if (!key || key=="" || !sNodes) return [];

		if (this._isArray(sNodes)) {
			var r = [];
			var tmpMap = [];
			for (i=0, l=sNodes.length; i<l; i++) {
				tmpMap[sNodes[i][key]] = sNodes[i];
			}
			for (i=0, l=sNodes.length; i<l; i++) {
				if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
					if (!tmpMap[sNodes[i][parentKey]][childKey])
						tmpMap[sNodes[i][parentKey]][childKey] = [];
					tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
				} else {
					r.push(sNodes[i]);
				}
			}
			return r;
		}else {
			return [sNodes];
		}
	},
	//以下是事件代理方法
	_bindEvent: function(opts) {
		for (var i=0, j=this._initNodeBind.bind.length; i<j; i++) {
			this._initNodeBind.bind[i].apply(this, arguments);
		}
	},
	_unbindEvent: function(opts) {
		for (var i=0, j=this._initNodeBind.unbind.length; i<j; i++) {
			this._initNodeBind.unbind[i].apply(this, arguments);
		}
	},
	_bindTree: function(opts) {
		var eventParam = {
			treeId: opts.treeId
		},
		    that = this;
		treeObj = this.element;
		if (!opts.txtSelectedEnable) {
			// for can't select text
			treeObj.bind('selectstart', function(e){
				var node
				var n = e.originalEvent.srcElement.nodeName.toLowerCase();
				return (n === "input" || n === "textarea" );
			}).css({
				"-moz-user-select":"-moz-none"
			});
		}
		this._on(treeObj, {
			//debugger;
			"click" : function(event) {
				that._proxy(event);
			},
			'dblclick': function(event) {
				that._proxy(event);
			},
			'mouseover': function(event) {
				that._proxy(event);
			},
			'mouseout': function(event) {
				that._proxy(event);
			},
			'mousedown': function(event) {
				that._proxy(event);
			},
			'mouseup': function(event) {
				that._proxy(event);
			},
			'contextmenu': function(event){
				that._proxy(event);
			}
		})
	},
	_unbindTree: function(opts) {
		var treeObj = this.element;
		treeObj.unbind('click', this._proxy);
		treeObj.unbind('dblclick', this._proxy);
		treeObj.unbind('mouseover', this._proxy);
		treeObj.unbind('mouseout', this._proxy);
		treeObj.unbind('mousedown', this._proxy);
		treeObj.unbind('mouseup', this._proxy);
		treeObj.unbind('contextmenu', this._proxy);
	},
	_doProxy: function(e) {
		var results = [];
		for (var i=0, j=this._initNodeBind.proxys.length; i<j; i++) {
			var proxyResult = this._initNodeBind.proxys[i].apply(this, arguments);
			results.push(proxyResult);
			if (proxyResult.stop) {
				break;
			}
		}
		return results;
	},
	_proxy: function(e) {
		var opts = this._getSetting(this.options.treeId);
		var that = this;
		if (!this._uCanDo(opts, e)) return true;
		var results = this._doProxy(e),
		r = true, x = false;
		for (var i=0, l=results.length; i<l; i++) {
			var proxyResult = results[i];
			if (proxyResult.nodeEventCallback) {
				x = true;
				r = proxyResult.nodeEventCallback.apply(proxyResult, [that, proxyResult.node, e]) && r;
			}
			if (proxyResult.treeEventCallback) {
				x = true;
				r = proxyResult.treeEventCallback.apply(proxyResult, [that, proxyResult.node,e]) && r;
			}
		}
		return r;
	},
	//method of event handler
	_onSwitchNode: function (that, node) {
		var opts = that.options;
		var setting = that._getSetting(opts.treeId);
		if (node.open) {
			if (that._apply(setting.beforeCollapse,[setting.treeId, node, setting], true) == false) return true;
			that._getRoot(setting).expandTriggerFlag = true;
			that._switchNode(setting, node);
		} else {
			if (that._apply(setting.beforeExpand, [setting.treeId, node, setting]) == false) return true;
			that._getRoot(setting).expandTriggerFlag = true;
			that._switchNode(setting, node);
		}
		return true;
	},
	_onClickNode: function (that, node) {
		var opts = that.options;
		//var that = this;
		//var setting = opts._getSetting(opts.treeId),
		clickFlag = ( (opts.autoCancelSelected && (event.ctrlKey || event.metaKey)) && that._isSelectedNode(opts, node)) ? 0 : (opts.autoCancelSelected && (event.ctrlKey || event.metaKey) && opts.selectedMulti) ? 2 : 1;
		if (that._apply(opts.beforeClick, [opts.treeId, node, clickFlag, opts], true) == false) return true;
		if (clickFlag === 0) {
			that._cancelPreSelectedNode(opts, node);
		} else {
			that._selectNode(opts, node, clickFlag === 2);
		}
		opts.treeObj.trigger(_final.event.CLICK, [event, opts.treeId, node, clickFlag]);
		if ( opts.clickExpand ){
			$(opts.treeObj).tree("expandNode", node, null, null, null, true);
		}
		return true;
	},
	_onTreeMousedown: function(that, node) {
		var opts = that._getSetting(that.options.treeId);
		if (that._apply(opts.beforeMouseDown, [opts.treeId, node, opts], true)) {
			that._trigger("onMouseDown", null, [opts.treeId, node, opts]);
		}
		return true;
	},
	_onTreeMouseup: function(that, node) {
		var opts = that._getSetting(that.options.treeId);
		if (that._apply(opts.beforeMouseUp, [opts.treeId, node, opts], true)) {
			that._trigger("onMouseUp", null, [opts.treeId, node, opts]);
		}
		return true;
	},
	_onTreeDblclick: function(that, node) {
		var opts = that._getSetting(that.options.treeId);
		if (that._apply(opts.beforeDblClick, [opts.treeId, node, opts], true)) {
			that._trigger("onDblClick", null, [opts.treeId, node, opts]);
		}
		return true;
	},
	_onTreeContextmenu: function(that, node) {
		var opts = that._getSetting(that.options.treeId);
		if (that._apply(opts.beforeRightClick, [opts.treeId, node, opts], true)) {
			that._trigger("onRightClick", null, [opts.treeId, node, opts]);
		}
		return (typeof opts.onRightClick) != "function";
	},
	_onCheckNode: function (that, node) {
		var opts = that.options;
		if (node.chkDisabled === true) return false;
		var setting = that._getSetting(opts.treeId),
		checkedKey = setting.keyChecked;
		if (that._apply(setting.beforeCheck, [setting.treeId, node, setting], true) == false) return true;
		node[checkedKey] = !node[checkedKey];
		that._checkNodeRelation(setting, node);
		var checkObj = that._$(node, _final.id.CHECK, setting);
		that._setChkClass(setting, checkObj, node);
		that._repairParentChkClassWithSelf(setting, node);
		that.element.trigger(_final.event.CHECK, [event, setting.treeId, node]);
		return true;
	},
	_onMouseoverCheck: function(that, node) {
		var opts = that.options;
		if (node.chkDisabled === true) return false;
		var setting = that._getSetting(opts.treeId),
		checkObj = that._$(node, _final.id.CHECK, setting);
		node.check_Focus = true;
		that._setChkClass(setting, checkObj, node);
		return true;
	},
	_onMouseoutCheck: function(that, node) {
		var opts = that.options;
		if (node.chkDisabled === true) return false;
		var setting = that._getSetting(opts.treeId),
		checkObj = that._$(node, _final.id.CHECK, setting);
		node.check_Focus = false;
		that._setChkClass(setting, checkObj, node);
		return true;
	},
	_onHoverOverNode: function(that, node) {
		var opts = that.options;
		var setting = that._getSetting(opts.treeId),
		root = that._getRoot(setting);
		if (root.curHoverNode != node) {
			that._onHoverOutNode(that);
		}
		root.curHoverNode = node;
		that._addHoverDom(setting, node);
	},
	_onHoverOutNode: function(that, node) {
		var opts = that.options;
		var setting = that._getSetting(opts.treeId),
		root = that._getRoot(setting);
		if (root.curHoverNode && !that._isSelectedNode(setting, root.curHoverNode)) {
			that._removeTreeDom(setting, root.curHoverNode);
			root.curHoverNode = null;
		}
	},
	_onMousedownNode: function(that, _node, e) {
		var opts = that.options;
		event = e;
		var i,l,
		setting = that._getSetting(opts.treeId),
		root = that._getRoot(setting), roots = that._getRoots();
		//右击鼠标不能拖、拽
		if (event.button == 2 || !setting.editable || (!setting.dragIsCopy && !setting.dragIsMove)) return true;

		//节点名称处于可编辑状态下不能拖、拽
		var target = event.target,
		_nodes = that._getRoot(setting).curSelectedList,
		nodes = [];
		if (!that._isSelectedNode(setting, _node)) {
			nodes = [_node];
		} else {
			for (i=0, l=_nodes.length; i<l; i++) {
				if (_nodes[i].editNameFlag && that._eqs(target.tagName, "input") && target.getAttribute("treeNode"+_final.id.INPUT) !== null) {
					return true;
				}
				nodes.push(_nodes[i]);
				if (nodes[0].parentTId !== _nodes[i].parentTId) {
					nodes = [_node];
					break;
				}
			}
		}
		that._editNodeBlur = true;
		that._cancelCurEditNode(setting);
		var doc = $(that.element.get(0).ownerDocument),
		body = $(that.element.get(0).ownerDocument.body), curNode, tmpArrow, tmpTarget,
		isOtherTree = false,
		targetSetting = setting,
		sourceSetting = setting,
		preNode, nextNode,
		preTmpTargetNodeId = null,
		preTmpMoveType = null,
		tmpTargetNodeId = null,
		moveType = _final.move.TYPE_INNER,
		mouseDownX = that.clientX,
		mouseDownY = that.clientY,
		startTime = (new Date()).getTime();
		if (that._uCanDo(setting)) {
			doc.bind("mousemove", _docMouseMove);
		}
		function _docMouseMove(event) {
			//避免拖拽节点后，再次点击节点
			if (root.dragFlag == 0 && Math.abs(mouseDownX - event.clientX) < setting.dragMinMoveSize
				&& Math.abs(mouseDownY - event.clientY) < setting.dragMinMoveSize) {
				return true;
			}
			var i, l, tmpNode, tmpDom, tmpNodes,
			childKey = setting.keyChildren;
			body.css("cursor", "pointer");

			if (root.dragFlag == 0) {
					if (that._apply(setting.beforeDrag, [setting.treeId, nodes, setting], true) == false) {
					_docMouseUp(event);
					return true;
				}

				for (i=0, l=nodes.length; i<l; i++) {
					if (i==0) {
						root.dragNodeShowBefore = [];
					}
					tmpNode = nodes[i];
					if (tmpNode.isParent && tmpNode.open) {
						that._expandCollapseNode(setting, tmpNode, !tmpNode.open);
						root.dragNodeShowBefore[tmpNode.tId] = true;
					} else {
						root.dragNodeShowBefore[tmpNode.tId] = false;
					}
				}
				root.dragFlag = 1;
				roots.showHoverDom = false;
				that._showIfameMask(setting, true);
				//sort
				var isOrder = true, lastIndex = -1;
				if (nodes.length>1) {
					var pNodes = nodes[0].parentTId ? nodes[0].getParentNode()[childKey] : that._getNodes(setting);
					tmpNodes = [];
					for (i=0, l=pNodes.length; i<l; i++) {
						if (root.dragNodeShowBefore[pNodes[i].tId] !== undefined) {
							if (isOrder && lastIndex > -1 && (lastIndex+1) !== i) {
								isOrder = false;
							}
							tmpNodes.push(pNodes[i]);
							lastIndex = i;
						}
						if (nodes.length === tmpNodes.length) {
							nodes = tmpNodes;
							break;
						}
					}
				}
				if (isOrder) {
					preNode = nodes[0].getPreNode();
					nextNode = nodes[nodes.length-1].getNextNode();
				}
				//设置节点为选中状态
				//curNode = that._$("<ul class='treeDragUL'></ul>", setting);
				for (i=0, l=nodes.length; i<l; i++) {
					tmpNode = nodes[i];
					tmpNode.editNameFlag = false;
					that._selectNode(setting, tmpNode, i>0);
					that._removeTreeDom(setting, tmpNode);

					if (i > setting.dragMaxShowNodeNum-1) {
						continue;
					}

					tmpDom = that._$("<li id='"+ tmpNode.tId +"_tmp'></li>", setting);
					tmpDom.append(that._$(tmpNode, _final.id.A, setting).clone());
					tmpDom.css("padding", "0");
					tmpDom.children("#" + tmpNode.tId + _final.id.A).removeClass(_final.node.CURSELECTED);
					//curNode.append(tmpDom);
					if (i == setting.dragMaxShowNodeNum-1) {
						tmpDom = that._$("<li id='"+ tmpNode.tId +"_moretmp'><a>  ...  </a></li>", setting);
						//curNode.append(tmpDom);
					}
				}
				//curNode.attr("id", nodes[0].tId + _final.id.UL + "_tmp");
				//curNode.addClass(that.element.attr("class"));
				//curNode.appendTo(body);

				tmpArrow = that._$("<span class='tmpTreeMove_arrow'></span>", setting);
				tmpArrow.attr("id", "treeMove_arrow_tmp");
				tmpArrow.appendTo(body);
				that.element.trigger(_final.event.DRAG, [event, setting.treeId, nodes]);
			}
			if (root.dragFlag == 1) {
				if (tmpTarget && tmpArrow.attr("id") == event.target.id && tmpTargetNodeId && (event.clientX + doc.scrollLeft()+2) > ($("#" + tmpTargetNodeId + _final.id.A, tmpTarget).offset().left)) {
					var xT = $("#" + tmpTargetNodeId + _final.id.A, tmpTarget);
					event.target = (xT.length > 0) ? xT.get(0) : event.target;
				} else if (tmpTarget) {
					tmpTarget.removeClass(_final.node.TMPTARGET_TREE);
					if (tmpTargetNodeId) $("#" + tmpTargetNodeId + _final.id.A, tmpTarget).removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_PREV)
						.removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_NEXT).removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_INNER);
				}
				tmpTarget = null;
				tmpTargetNodeId = null;

				//在多选树中判断拖、拽
				isOtherTree = false;
				targetSetting = setting;
				var settings = that._getSettings();
				for (var s in settings) {
					if (settings[s].treeId && settings[s].editable && settings[s].treeId != setting.treeId
						&& (event.target.id == settings[s].treeId || $(event.target).parents("#" + settings[s].treeId).length>0)) {
						isOtherTree = true;
						targetSetting = settings[s];
					}
				}
				var docScrollTop = doc.scrollTop(),
				docScrollLeft = doc.scrollLeft(),
				treeOffset = targetSetting.treeObj.offset(),
				scrollHeight = targetSetting.treeObj.get(0).scrollHeight,
				scrollWidth = targetSetting.treeObj.get(0).scrollWidth,
				dTop = (event.clientY + docScrollTop - treeOffset.top),
				dBottom = (targetSetting.treeObj.height() + treeOffset.top - event.clientY - docScrollTop),
				dLeft = (event.clientX + docScrollLeft - treeOffset.left),
				dRight = (targetSetting.treeObj.width() + treeOffset.left - event.clientX - docScrollLeft),
				isTop = (dTop < setting.dragBorderMax && dTop > setting.dragBorderMin),
				isBottom = (dBottom < setting.dragBorderMax && dBottom > setting.dragBorderMin),
				isLeft = (dLeft < setting.dragBorderMax && dLeft > setting.dragBorderMin),
				isRight = (dRight < setting.dragBorderMax && dRight > setting.dragBorderMin),
				isTreeInner = dTop > setting.dragBorderMin && dBottom > setting.dragBorderMin && dLeft > setting.dragBorderMin && dRight > setting.dragBorderMin,
				isTreeTop = (isTop && targetSetting.treeObj.scrollTop() <= 0),
				isTreeBottom = (isBottom && (targetSetting.treeObj.scrollTop() + targetSetting.treeObj.height()+10) >= scrollHeight),
				isTreeLeft = (isLeft && targetSetting.treeObj.scrollLeft() <= 0),
				isTreeRight = (isRight && (targetSetting.treeObj.scrollLeft() + targetSetting.treeObj.width()+10) >= scrollWidth);
				if (event.target && that._isChildOrSelf(event.target, targetSetting.treeId)) {
					//获取树节点中  <li> 元素dom
					var targetObj = event.target;
					while (targetObj && targetObj.tagName && !that._eqs(targetObj.tagName, "li") && targetObj.id != targetSetting.treeId) {
						targetObj = targetObj.parentNode;
					}
					var canMove = true;
					//不能移动到自身，或自身的子节点中
					for (i=0, l=nodes.length; i<l; i++) {
						tmpNode = nodes[i];
						if (targetObj.id === tmpNode.tId) {
							canMove = false;
							break;
						} else if (that._$(tmpNode, setting).find("#" + targetObj.id).length > 0) {
							canMove = false;
							break;
						}
					}
					if (canMove && event.target && that._isChildOrSelf(event.target, targetObj.id + _final.id.A)) {
						tmpTarget = $(targetObj);
						tmpTargetNodeId = targetObj.id;
					}
				}
				//鼠标移动到树组件区域
				tmpNode = nodes[0];
				if (isTreeInner && that._isChildOrSelf(event.target, targetSetting.treeId)) {
					//判断鼠标移动至根节点
					if (!tmpTarget && (event.target.id == targetSetting.treeId || isTreeTop || isTreeBottom || isTreeLeft || isTreeRight) && (isOtherTree || (!isOtherTree && tmpNode.parentTId))) {
						tmpTarget = targetSetting.treeObj;
					}
					//自动滚动到顶部
					if (isTop) {
						targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()-10);
					} else if (isBottom)  {
						targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()+10);
					}
					if (isLeft) {
						targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()-10);
					} else if (isRight) {
						targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+10);
					}
					//auto scroll left
					if (tmpTarget && tmpTarget != targetSetting.treeObj && tmpTarget.offset().left < targetSetting.treeObj.offset().left) {
						targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+ tmpTarget.offset().left - targetSetting.treeObj.offset().left);
					}
				}
				/*curNode.css({
					"top": (event.clientY + docScrollTop + 3) + "px",
					"left": (event.clientX + docScrollLeft + 3) + "px"
				});*/
				var dX = 0;
				var dY = 0;
				if (tmpTarget && tmpTarget.attr("id")!=targetSetting.treeId) {
					var tmpTargetNode = tmpTargetNodeId == null ? null: that._getNodeCache(targetSetting, tmpTargetNodeId),
					isCopy = ((event.ctrlKey || event.metaKey) && setting.dragIsMove && setting.dragIsCopy) || (!setting.dragIsMove && setting.dragIsCopy),
					isPrev = !!(preNode && tmpTargetNodeId === preNode.tId),
					isNext = !!(nextNode && tmpTargetNodeId === nextNode.tId),
					isInner = (tmpNode.parentTId && tmpNode.parentTId == tmpTargetNodeId),
					canPrev = (isCopy || !isNext) && that._apply(targetSetting.dragPrev, [targetSetting.treeId, nodes, tmpTargetNode, targetSetting], !!targetSetting.dragPrev),
					canNext = (isCopy || !isPrev) && that._apply(targetSetting.dragNext, [targetSetting.treeId, nodes, tmpTargetNode, targetSetting], !!targetSetting.dragNext),
					canInner = (isCopy || !isInner) && !(targetSetting.keepLeaf && !tmpTargetNode.isParent) && that._apply(targetSetting.dragInner, [targetSetting.treeId, nodes, tmpTargetNode, targetSetting], !!targetSetting.dragInner);
					if (!canPrev && !canNext && !canInner) {
						tmpTarget = null;
						tmpTargetNodeId = "";
						moveType = _final.move.TYPE_INNER;
						/*tmpArrow.css({
							"display":"none"
						});*/
						if (window.TreeMoveTimer) {
							clearTimeout(window.TreeMoveTimer);
							window.TreeMoveTargetNodeTId = null
						}
					} else {
						var tmpTargetA = $("#" + tmpTargetNodeId + _final.id.A, tmpTarget),
						tmpNextA = tmpTargetNode.isLastNode ? null : $("#" + tmpTargetNode.getNextNode().tId + _final.id.A, tmpTarget.next()),
						tmpTop = tmpTargetA.offset().top,
						tmpLeft = tmpTargetA.offset().left,
						prevPercent = canPrev ? (canInner ? 0.25 : (canNext ? 0.5 : 1) ) : -1,
						nextPercent = canNext ? (canInner ? 0.75 : (canPrev ? 0.5 : 0) ) : -1,
						dY_percent = (event.clientY + docScrollTop - tmpTop)/tmpTargetA.height();
						if ((prevPercent==1 ||dY_percent<=prevPercent && dY_percent>=-.2) && canPrev) {
							dX = 1 - tmpArrow.width();
							dY = tmpTop - tmpArrow.height()/2;
							moveType = _final.move.TYPE_PREV;
						} else if ((nextPercent==0 || dY_percent>=nextPercent && dY_percent<=1.2) && canNext) {
							dX = 1 - tmpArrow.width();
							dY = (tmpNextA == null || (tmpTargetNode.isParent && tmpTargetNode.open)) ? (tmpTop + tmpTargetA.height() - tmpArrow.height()/2) : (tmpNextA.offset().top - tmpArrow.height()/2);
							moveType = _final.move.TYPE_NEXT;
						}else {								
							dX = 5 - tmpArrow.width();
							dY = tmpTop;
							moveType = _final.move.TYPE_INNER;								
						}
						tmpArrow.css({
							"display":"block",
							"top": dY + "px",
							"left": (tmpLeft + dX) + "px"
						});
						// 如果dragStyle配置为线形的提示，则显示线性 begin lihaibo added
						if (setting.dragStyle == "line") {
							if ( _final.move.TYPE_INNER == moveType) {
								tmpArrow.removeClass("preNext_line").addClass("inner_line");
							} else {
								tmpArrow.removeClass("inner_line").addClass("preNext_line");
							}
						}
						// 如果dragStyle配置为线形的提示，则显示线性 end
						tmpTargetA.addClass(_final.node.TMPTARGET_NODE + "_" + moveType);

						if (preTmpTargetNodeId != tmpTargetNodeId || preTmpMoveType != moveType) {
							startTime = (new Date()).getTime();
						}
						if (tmpTargetNode && tmpTargetNode.isParent && moveType == _final.move.TYPE_INNER) {
							var startTimer = true;
							if (window.TreeMoveTimer && window.TreeMoveTargetNodeTId !== tmpTargetNode.tId) {
								clearTimeout(window.TreeMoveTimer);
								window.TreeMoveTargetNodeTId = null;
							}else if (window.TreeMoveTimer && window.TreeMoveTargetNodeTId === tmpTargetNode.tId) {
								startTimer = false;
							}
							if (startTimer) {
								window.TreeMoveTimer = setTimeout(function() {
									if (moveType != _final.move.TYPE_INNER) return;
									if (tmpTargetNode && tmpTargetNode.isParent && !tmpTargetNode.open && (new Date()).getTime() - startTime > targetSetting.dragAutoOpenTime
										&& that._apply(targetSetting.beforeDragOpen, [targetSetting.treeId, tmpTargetNode, targetSetting], true)) {
										that._switchNode(targetSetting, tmpTargetNode);
										if (targetSetting.dragAutoExpandTrigger) {
											targetSetting.treeObj.trigger(_final.event.EXPAND, [targetSetting.treeId, tmpTargetNode]);
										}
									}
								}, targetSetting.dragAutoOpenTime+50);
								window.TreeMoveTargetNodeTId = tmpTargetNode.tId;
							}
						}
					}
				} else {
					moveType = _final.move.TYPE_INNER;
					if (tmpTarget && that._apply(targetSetting.dragInner, [targetSetting.treeId, nodes, null, targetSetting], !!targetSetting.dragInner)) {
						tmpTarget.addClass(_final.node.TMPTARGET_TREE);
					} else {
						tmpTarget = null;
					}
					tmpArrow.css({
						"display":"none"
					});
					if (window.TreeMoveTimer) {
						clearTimeout(window.TreeMoveTimer);
						window.TreeMoveTargetNodeTId = null;
					}
				}
				preTmpTargetNodeId = tmpTargetNodeId;
				preTmpMoveType = moveType;

				that.element.trigger(_final.event.DRAGMOVE, [event, setting.treeId, nodes]);
			}
			return false;
		}
		doc.bind("mouseup", _docMouseUp);
		function _docMouseUp(event) {
			if (window.TreeMoveTimer) {
				clearTimeout(window.TreeMoveTimer);
				window.TreeMoveTargetNodeTId = null;
			}
			preTmpTargetNodeId = null;
			preTmpMoveType = null;
			doc.unbind("mousemove", _docMouseMove);
			doc.unbind("mouseup", _docMouseUp);
			doc.unbind("selectstart", _docSelect);
			body.css("cursor", "auto");
			if (tmpTarget) {
				tmpTarget.removeClass(_final.node.TMPTARGET_TREE);
				if (tmpTargetNodeId) $("#" + tmpTargetNodeId + _final.id.A, tmpTarget).removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_PREV)
						.removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_NEXT).removeClass(_final.node.TMPTARGET_NODE + "_" + _final.move.TYPE_INNER);
			}
			that._showIfameMask(setting, false);

			roots.showHoverDom = true;
			if (root.dragFlag == 0) return;
			root.dragFlag = 0;

			var i, l, tmpNode;
			for (i=0, l=nodes.length; i<l; i++) {
				tmpNode = nodes[i];
				if (tmpNode.isParent && root.dragNodeShowBefore[tmpNode.tId] && !tmpNode.open) {
					that._expandCollapseNode(setting, tmpNode, !tmpNode.open);
					delete root.dragNodeShowBefore[tmpNode.tId];
				}
			}
			//if (curNode) curNode.remove();
			if (tmpArrow) tmpArrow.remove();
			var isCopy = ((event.ctrlKey || event.metaKey) && setting.dragIsMove && setting.dragIsCopy) || (!setting.dragIsMove && setting.dragIsCopy);
			if (!isCopy && tmpTarget && tmpTargetNodeId && nodes[0].parentTId && tmpTargetNodeId==nodes[0].parentTId && moveType == _final.move.TYPE_INNER) {
				tmpTarget = null;
			}
			if (tmpTarget) {
				var dragTargetNode = tmpTargetNodeId == null ? null: that._getNodeCache(targetSetting, tmpTargetNodeId);
				if (that._apply(opts.beforeDrop, [targetSetting.treeId, nodes, dragTargetNode, moveType, isCopy,setting], true) == false) {
					that._selectNodes(sourceSetting, nodes);
					return;
				}
				var newNodes = isCopy ? that._clone(nodes) : nodes;

				function dropCallback() {
					if (isOtherTree) {
						if (!isCopy) {
							for(var i=0, l=nodes.length; i<l; i++) {
								that._removeNode(setting, nodes[i]);
							}
						}
						if (moveType == _final.move.TYPE_INNER) {
							that._addNodes(targetSetting, dragTargetNode, newNodes);
						} else {
							that._addNodes(targetSetting, dragTargetNode.getParentNode(), newNodes);
							if (moveType == _final.move.TYPE_PREV) {
								for (i=0, l=newNodes.length; i<l; i++) {
									that._moveNode(targetSetting, dragTargetNode, newNodes[i], moveType, false);
								}
							} else {
								for (i=-1, l=newNodes.length-1; i<l; l--) {
									that._moveNode(targetSetting, dragTargetNode, newNodes[l], moveType, false);
								}
							}
						}
					} else {
						if (isCopy && moveType == _final.move.TYPE_INNER) {
							that._addNodes(targetSetting, dragTargetNode, newNodes);
						} else {
							if (isCopy) {
								that._addNodes(targetSetting, dragTargetNode.getParentNode(), newNodes);
							}
							if (moveType != _final.move.TYPE_NEXT) {
								for (i=0, l=newNodes.length; i<l; i++) {
									that._moveNode(targetSetting, dragTargetNode, newNodes[i], moveType, false);
								}
							} else {
								for (i=-1, l=newNodes.length-1; i<l; l--) {
									that._moveNode(targetSetting, dragTargetNode, newNodes[l], moveType, false);
								}
							}
						}
					}
					that._selectNodes(targetSetting, newNodes);
					that._$(newNodes[0], setting).focus().blur();

					that.element.trigger(_final.event.DROP, [event, targetSetting.treeId, newNodes, dragTargetNode, moveType, isCopy]);
				}
				if (moveType == _final.move.TYPE_INNER && that._canAsync(targetSetting, dragTargetNode)) {
					that._asyncNode(targetSetting, dragTargetNode, false, dropCallback);
				} else {
					dropCallback();
				}
			} else {
				that._selectNodes(sourceSetting, nodes);
				that.element.trigger(_final.event.DROP, [event, setting.treeId, nodes, null, null, null]);
			}
		}
		doc.bind("selectstart", _docSelect);
		function _docSelect() {
			return false;
		}
		//Avoid FireFox's Bug
		//If Tree Div CSS set 'overflow', so drag node outside of Tree, and event.target is error.
		if(that.preventDefault) {
			that.preventDefault();
		}
		return true;
	},	
	//以下是树组件工具方法
	_apply: function(fun, param, defaultValue) {	
		if( fun == defaultValue && !$.isFunction(fun) ) {
			return defaultValue;
		}
		
		
		if( typeof(fun) =="undefined" || fun == null){
			return defaultValue;
		}
		var _fn,ret,t;
		 _fn = $.coral.toFunction(fun);
		
		if (!$.isFunction(_fn)) {
			return defaultValue;
		}
		ret = _fn.apply(t||this,param ? param : []);
		
		return typeof(ret)=="undefined"?defaultValue:ret;
	},
	_canAsync: function(opts, node) {
		var childKey = opts.keyChildren;
		return (opts.asyncEnable && node && node.isParent && !(node.zAsync || (node[childKey] && node[childKey].length > 0)));
	},
	_clone: function (obj){
		var that = this;
		if (obj === null) return null;
		var o = that._isArray(obj) ? [] : {};
		for(var i in obj){
			o[i] = (obj[i] instanceof Date) ? new Date(obj[i].getTime()) : (typeof obj[i] === "object" ? this._clone(obj[i]) : obj[i]);
		}
		return o;
	},
	_eqs: function(str1, str2) {
		return str1.toLowerCase() === str2.toLowerCase();
	},
	_isArray: function(arr) {
		return Object.prototype.toString.apply(arr) === "[object Array]";
	},
	_$: function(node, exp, opts) {
		if (!!exp && typeof exp != "string") {
			opts = exp;
			exp = "";
		}
		if (typeof node == "string") {
			return $(node, opts ? this.element.get(0).ownerDocument : null);
		} else {
			return $("#" + node.tId + exp, opts ? this.element : null);
		}
	},
	_getMDom: function (opts, curDom, targetExpr) {
		if (!curDom) return null;
		while (curDom && curDom.id !== opts.treeId) {
			for (var i=0, l=targetExpr.length; curDom.tagName && i<l; i++) {
				if (this._eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
					return curDom;
				}
			}
			curDom = curDom.parentNode;
		}
		return null;
	},
	_getNodeMainDom: function(target) {
		return ($(target).parent("li").get(0) || $(target).parentsUntil("li").parent().get(0));
	},
	_isChildOrSelf: function(dom, parentId) {
		return ( $(dom).closest("#" + parentId).length> 0 );
	},
	/*_uCanDo: function(setting, e) {
		return true;
	},*/
	_getAbs: function (obj) {
		var oRect = obj.getBoundingClientRect(),
		scrollTop = document.body.scrollTop+document.documentElement.scrollTop,
		scrollLeft = document.body.scrollLeft+document.documentElement.scrollLeft;
		return [oRect.left+scrollLeft,oRect.top+scrollTop];
	},
	_inputFocus: function(inputObj) {
		if (inputObj.get(0)) {
			inputObj.focus();
			this._setCursorPosition(inputObj.get(0), inputObj.val().length);
		}
	},
	_inputSelect: function(inputObj) {
		if (inputObj.get(0)) {
			inputObj.focus();
			inputObj.select();
		}
	},
	_setCursorPosition: function(obj, pos){
		if(obj.setSelectionRange) {
			obj.focus();
			obj.setSelectionRange(pos,pos);
		} else if (obj.createTextRange) {
			var range = obj.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	},
	_showIfameMask: function(opts, showSign) {
		var root = this._getRoot(opts);
		//clear full mask
		while (root.dragMaskList.length > 0) {
			root.dragMaskList[0].remove();
			root.dragMaskList.shift();
		}
		if (showSign) {
			//show mask
			var iframeList = this._$("iframe", opts);
			for (var i = 0, l = iframeList.length; i < l; i++) {
				var obj = iframeList.get(i),
				r = this._getAbs(obj),
				dragMask = this._$("<div id='treeMask_" + i + "' class='treeMask' style='top:" + r[1] + "px; left:" + r[0] + "px; width:" + obj.offsetWidth + "px; height:" + obj.offsetHeight + "px;'></div>", opts);
				dragMask.appendTo(this._$("body", opts));
				root.dragMaskList.push(dragMask);
			}
		}
	},
	//以下是操作树形结构中dom元素的方法
	_addNodes: function(opts, parentNode, newNodes, isSilent) {
		if (opts.keepLeaf && parentNode && !parentNode.isParent) {
			return;
		}
		if (!this._isArray(newNodes)) {
			newNodes = [newNodes];
		}
		if (opts.simpleDataEnable) {
			newNodes = this._transformToTreeFormat(opts, newNodes);
		}
		if (parentNode) {
			var target_switchObj = this._$(parentNode, _final.id.SWITCH, opts),
			target_icoObj = this._$(parentNode, _final.id.ICON, opts),
			target_ulObj = this._$(parentNode, _final.id.UL, opts);

			if (!parentNode.open) {
				this._replaceSwitchClass(parentNode, target_switchObj, _final.arrow.RIGHT);
				this._replaceIcoClass(parentNode, target_icoObj, _final.folder.CLOSE );
				parentNode.open = false;
				target_ulObj.css({
					"display": "none"
				});
			}

			this._addNodesData(opts, parentNode, newNodes);
			this._createNodes(opts, parentNode.level + 1, newNodes, parentNode);
			if (!isSilent) {
				this._expandCollapseParentNode(opts, parentNode, true);
			}
		} else {
			this._addNodesData(opts, this._getRoot(opts), newNodes);
			this._createNodes(opts, 0, newNodes, null);
		}
	},
	_appendNodes1: function(opts, level, nodes, parentNode, initFlag, openFlag) {
		if (!nodes) return [];
		var html = [],
		childKey = opts.keyChildren;
		for (var i = 0, l = nodes.length; i < l; i++) {
			var node = nodes[i];
			if (initFlag) {
				var tmpPNode = (parentNode) ? parentNode: this._getRoot(opts),
				tmpPChild = tmpPNode[childKey],
				isFirstNode = ((tmpPChild.length == nodes.length) && (i == 0)),
				isLastNode = (i == (nodes.length - 1));
				this._initNode(opts, level, node, parentNode, isFirstNode, isLastNode, openFlag);
				this._addNodeCache(opts, node);
			}			
			var childHtml = [];
			if (node[childKey] && node[childKey].length > 0) {
				//make child html first, because checkType
				childHtml = this._appendNodes(opts, level + 1, node[childKey], node, initFlag, openFlag && node.open);
			}
			if (openFlag) {
				this._makeDOMNodeMainBefore(html, opts, node);
				this._makeDOMNodeNameBefore(html, opts, node);
				this._addDiyDom(html, opts, node);
				this._makeDOMNodeLine(html, opts, node);
				this._getBeforeA(opts, node, html);
				this._getInnerBeforeA(opts, node, html);
				this._makeDOMNodeIcon(html, opts, node);
				this._getInnerAfterA(opts, node, html);
				this._makeDOMNodeNameAfter(html, opts, node);
				this._getAfterA(opts, node, html);
				if (node.isParent && node.open) {
					this._makeUlHtml(opts, node, html, childHtml.join(''));
				}
				this._makeDOMNodeMainAfter(html, opts, node);
				this._addCreatedNode(opts, node);
			}
		}
		return html;
	},
	_appendParentULDom: function(opts, node) {
		var html = [],
		nObj = this._$(node, opts);
		if (!nObj.get(0) && !!node.parentTId) {
			this._appendParentULDom(opts, node.getParentNode());
			nObj = this._$(node, opts);
		}
		var ulObj = this._$(node, _final.id.UL, opts);
		if (ulObj.get(0)) {
			ulObj.remove();
		}
		var childKey = opts.keyChildren,
		childHtml = this._appendNodes(opts, node.level+1, node[childKey], node, false, true);
		this._makeUlHtml(opts, node, html, childHtml.join(''));
		nObj.append(html.join(''));
	},
	/**
	 * :TODO: 为了不改变结构，临时添加opts参数，待以后改进。
	 */
	_asyncNode: function(setting, node, isSilent, callback, opts) {
		var opts = opts || {};
		var that = this;
		var i, l;
		var isInit = setting.isInit;
		if (node && !node.isParent) {
			this._apply(callback);
			return false;
		} else if (node && node.isAjaxing) {
			return false;
		} else if (that._apply(setting.beforeAsync, [setting.treeId, node, setting], true) == false) {
			this._apply(callback);
			return false;
		}
		if (node) {
			node.isAjaxing = true;
			var icoObj = that._$(node, _final.id.ICON, setting);
			icoObj.attr({"style":"", "class":_final.className.BUTTON + " " + _final.className.ICO_LOADING});
		}
		var tmpParam = {},
			asyncOtherParam = opts.asyncOtherParam || setting.asyncOtherParam;
		//通过标签传递的参数为字符串类型，需要转换为一个数组对象
		//var autoParams = (new Function('return ' + setting.asyncAutoParam))();
		var autoParams = setting.asyncAutoParam.split(",");
		var isInit = setting.isInit;
		for (i = 0, l = autoParams.length; node && i < l; i++) {
			var pKey = autoParams[i].split("="), spKey = pKey;
			if (pKey.length>1) {
				spKey = pKey[1];
				pKey = pKey[0];
			}
			tmpParam[spKey] = node[pKey];
		}
		if (this._isArray(asyncOtherParam)) {
			for (i = 0, l = asyncOtherParam.length; i < l; i += 2) {
				tmpParam[asyncOtherParam[i]] = asyncOtherParam[i + 1];
			}
		} else {
			for (var p in asyncOtherParam) {
				tmpParam[p] = asyncOtherParam[p];
			}
		}
		var _tmpV = this._getRoot(setting)._ver,
			asyncUrl = this._apply(setting.asyncUrl, [setting.treeId, node, opts], setting.asyncUrl);
		$.ajax({
			contentType: setting.asyncContentType,
			type: setting.asyncType,
			url: asyncUrl,
			data: tmpParam,
			dataType: setting.asyncDataType,
			success: function(msg) {
				if (_tmpV != that._getRoot(setting)._ver) {
					return;
				}
				var newNodes = [];
				try {
					if (!msg || msg.length == 0) {
						newNodes = [];
					} else if (typeof msg == "string") {
						newNodes = eval("(" + msg + ")");
					} else {
						newNodes = msg;
					}
				} catch(err) {
					newNodes = msg;
				}

				if (node) {
					node.isAjaxing = null;
					node.zAsync = true;
				}
				that._setNodeLineIcos(setting, node);
				if (newNodes && newNodes !== "") {
					if ( isInit ){
						newNodes = that._createRootNodes(setting,newNodes);
					}
					newNodes = that._apply(setting.asyncDataFilter, [setting.treeId, node, newNodes, setting], newNodes);
					that._addNodes(setting, node, !!newNodes ? that._clone(newNodes) : [], !!isSilent);
				} else {
					if ( isInit ){
						newNodes = that._createRootNodes(setting,newNodes);
					}
					that._addNodes(setting, node, rootNodes, !!isSilent);
				}
				if ( opts.onLoad ) {
					that._apply( opts.onLoad, [setting.treeId, node, msg]);
				} else {
					that.element.trigger(_final.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
				}
				that._apply(callback);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				if (_tmpV != that._getRoot(setting)._ver) {
					return;
				}
				if (node) node.isAjaxing = null;
				that._setNodeLineIcos(setting, node);
				that.element.trigger(_final.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
			}
		});
		return true;
	},
	_addEditBtn: function(opts, node) {
		var that = this;
		if (node.editNameFlag || this._$(node, _final.id.EDIT, opts).length > 0) {
			return;
		}
		if (!this._apply(opts.showRenameBtn, [opts.treeId, node, opts], opts.showRenameBtn)) {
			return;
		}
		var aObj = this._$(node, _final.id.A, opts),
		editStr = "<span class='" + _final.className.BUTTON + " " + _final.editIcon +" edit' id='" + node.tId + _final.id.EDIT + "' title='"+this._apply(opts.renameTitle, [opts.treeId, node, opts], opts.renameTitle)+"' treeNode"+_final.id.EDIT+" style='display:none;'></span>";
		aObj.append(editStr);

		this._$(node, _final.id.EDIT, opts).bind('click',
			function() {
				if (!that._uCanDo(opts) || that._apply(opts.beforeEditName, [opts.treeId, node, opts], true) == false) return false;
				that._editNode(opts, node);
				return false;
			}
			).show();
	},
	_addRemoveBtn: function(opts, node) {
		var that = this;
		if (node.editNameFlag || this._$(node, _final.id.REMOVE, opts).length > 0) {
			return;
		}
		if (!this._apply(opts.showRemoveBtn, [opts.treeId, node, opts], opts.showRemoveBtn)) {
			return;
		}
		var aObj = this._$(node, _final.id.A, opts),
		removeStr = "<span class='" + _final.className.BUTTON + " " + _final.removeIcon + " remove' id='" + node.tId + _final.id.REMOVE + "' title='"+this._apply(opts.removeTitle, [opts.treeId, node, opts], opts.removeTitle)+"' treeNode"+_final.id.REMOVE+" style='display:none;'></span>";
		aObj.append(removeStr);

		this._$(node, _final.id.REMOVE, opts).bind('click',
			function() {
				if (!that._uCanDo(opts) || that._apply(opts.beforeRemove, [opts.treeId, node, opts], true) == false) return false;
				that._removeNode(opts, node);
				that.element.trigger(_final.event.REMOVE, [opts.treeId, node]);
				return false;
			}
			).bind('mousedown',
			function(that) {
				return true;
			}
			).show();
	},
	_addHoverDom: function(opts, node) {
		if (this._getRoots().showHoverDom) {
			node.isHover = true;
			if (opts.editable) {
				this._addEditBtn(opts, node);
				this._addRemoveBtn(opts, node);
			}
			this._$(node, _final.id.A, opts).addClass(_final.node.CURHOVER);
			this._apply(opts.addHoverDom, [opts.treeId, node, opts]);
		}
	},	
	_cancelPreSelectedNode1: function (opts, node) {
		var list = this._getRoot(opts).curSelectedList;
		for (var i=0, j=list.length-1; j>=i; j--) {
			if (!node || node === list[j]) {
				this._$(list[j], _final.id.A, opts).removeClass(_final.node.CURSELECTED);
				if (node) {
					this._removeSelectedNode(opts, node);
					break;
				}
			}
		}
		if (!node) this._getRoot(opts).curSelectedList = [];
	},
	_createNodeCallback: function(opts) {
		if (!!opts.onNodeCreated || !!opts.addDiyDom) {
			var root = this._getRoot(opts);
			while (root.createdNodes.length>0) {
				var node = root.createdNodes.shift();
				this._apply(opts.addDiyDom, [opts.treeId, node, opts]);
				if (!!opts.onNodeCreated) {
					this.element.trigger(_final.event.NODECREATED, [opts.treeId, node]);
				}
			}
		}
	},
	/**
	 * @param setting
	 * @param nodes
	 * 
	 * @returns nodes 新构造的树节点（可能带有根节点）
	 */
	_createRootNodes: function( opts, nodes ) {
		if (opts.simpleDataEnable) {
			nodes = this._transformToTreeFormat(opts, nodes);
		}
		//if ( setting.isInit ) {
		if(opts.showRootNode == true){
			//指定根节点的情况
			if ( opts.rootNode && typeof ( opts.rootNode ) !== "boolean" ) {
				opts.rootNode.children = nodes;
				nodes = [opts.rootNode];		
			}
		} else //showRootNode == false: 隐藏根节点
		{
			//如果rootNode为true，则根节点在nodes中取得
			//且根节点只有一层的时候 
			//且children必须大于1
			if ( typeof ( opts.rootNode ) == "boolean" && 
				opts.rootNode ) {
				if ( nodes.length >= 1 ) {
					if ( nodes[0].children && nodes[0].children.length > 0 ) {
						nodes = nodes[0].children;
					} else {
						nodes = [];
					}
				}
			}
		}		
		return nodes;
	},
	/**
	 * @param setting
	 * @param level
	 * @param nodes
	 * @param parentNode
	 * 
	 */
	_createNodes1: function( opts, level, nodes, parentNode ) {
		//初始化的时候处理根节点的显示或者隐藏
		//nodes = this._createRootNodes(setting, nodes );		
		if (!nodes || nodes.length == 0) return;
		var root = this._getRoot(opts),
		childKey = opts.keyChildren,
		openFlag = !parentNode || parentNode.open || !!this._$(parentNode[childKey][0], opts).get(0);
		root.createdNodes = [];
		var treeHtml = this._appendNodes(opts, level, nodes, parentNode, true, openFlag);
		if (!parentNode) {
			this.element.append(treeHtml.join(''));
		} else {
			var ulObj = this._$(parentNode, _final.id.UL, opts);
			if (ulObj.get(0)) {
				ulObj.append(treeHtml.join(''));
			}
		}
		// // 20140108 lihaibo added
		opts.isInit = false;
		// // 20140108 lihaibo added
		this._createNodeCallback(opts);
	},
	_checkNodeRelation: function(opts, node) {
		var pNode, i, l,
		childKey = opts.keyChildren,
		checkedKey = opts.keyChecked,
		r = _final.radio;
		if (opts.chkStyle == r.STYLE) {
			var checkedList = this._getRadioCheckedList(opts);
			if (node[checkedKey]) {
				if (opts.radioType == r.TYPE_ALL) {
					for (i = checkedList.length-1; i >= 0; i--) {
						pNode = checkedList[i];
						if (pNode[checkedKey] && pNode != node) {
							pNode[checkedKey] = false;
							checkedList.splice(i, 1);
							this._setChkClass(opts, this._$(pNode, _final.id.CHECK, opts), pNode);
							if (pNode.parentTId != node.parentTId) {
								this._repairParentChkClassWithSelf(opts, pNode);
							}
						}
					}
					checkedList.push(node);
				} else {
					var parentNode = (node.parentTId) ? node.getParentNode() : this._getRoot(opts);
					for (i = 0, l = parentNode[childKey].length; i < l; i++) {
						pNode = parentNode[childKey][i];
						if (pNode[checkedKey] && pNode != node) {
							pNode[checkedKey] = false;
							this._setChkClass(opts, this._$(pNode, _final.id.CHECK, opts), pNode);
						}
					}
				}
			} else if (opts.radioType == r.TYPE_ALL) {
				for (i = 0, l = checkedList.length; i < l; i++) {
					if (node == checkedList[i]) {
						checkedList.splice(i, 1);
						break;
					}
				}
			}

		} else {
			if (node[checkedKey] && (!node[childKey] || node[childKey].length==0 || opts.chkboxType.Y.indexOf("s") > -1)) {
				this._setSonNodeCheckBox(opts, node, true);
			}
			if (!node[checkedKey] && (!node[childKey] || node[childKey].length==0 || opts.chkboxType.N.indexOf("s") > -1)) {
				this._setSonNodeCheckBox(opts, node, false);
			}
			if (node[checkedKey] && opts.chkboxType.Y.indexOf("p") > -1) {
				this._setParentNodeCheckBox(opts, node, true);
			}
			if (!node[checkedKey] && opts.chkboxType.N.indexOf("p") > -1) {
				this._setParentNodeCheckBox(opts, node, false);
			}
		}
	},
	_cancelCurEditNode: function (opts, forceName, isCancel) {
		var root = this._getRoot(opts),
		nameKey = opts.keyName,
		node = root.curEditNode;
		if (node) {
			var inputObj = root.curEditInput,
			newName = forceName ? forceName:(isCancel ? node[nameKey]: inputObj.val());
			if (this._apply(opts.beforeReName, [opts.treeId, node, newName, isCancel, opts], true) === false) {
				return false;
			} else {
				node[nameKey] = newName;
				this.element.trigger(_final.event.RENAME, [opts.treeId, node, isCancel]);
			}
			var aObj = this._$(node, _final.id.A, opts);
			aObj.removeClass(_final.node.CURSELECTED_EDIT);
			inputObj.unbind();
			this._setNodeName(opts, node);
			node.editNameFlag = false;
			root.curEditNode = null;
			root.curEditInput = null;
			this._selectNode(opts, node, false);
		}
		root.noSelection = true;
		return true;
	},
	_editNode: function(opts, node) {
		var that = this;
		var root = this._getRoot(opts);
		this._editNodeBlur = false;
		if (this._isSelectedNode(opts, node) && root.curEditNode == node && node.editNameFlag) {
			setTimeout(function() {this._inputFocus(root.curEditInput);}, 0);
			return;
		}
		var nameKey = opts.keyName;
		node.editNameFlag = true;
		this._removeTreeDom(opts, node);
		this._cancelCurEditNode(opts);
		this._selectNode(opts, node, false);
		this._$(node, _final.id.SPAN, opts).html("<input type=text class='rename' id='" + node.tId + _final.id.INPUT + "' treeNode" + _final.id.INPUT + " >");
		var inputObj = this._$(node, _final.id.INPUT, opts);
		inputObj.attr("value", node[nameKey]);
		if (opts.editNameSelectAll) {
			this._inputSelect(inputObj);
		} else {
			this._inputFocus(inputObj);
		}

		inputObj.bind('blur', function(event) {
			if (!that._editNodeBlur) {
				that._cancelCurEditNode(opts);
			}
		}).bind('keydown', function(event) {
			if (event.keyCode=="13") {
				that._editNodeBlur = true;
				that._cancelCurEditNode(opts);
			} else if (event.keyCode=="27") {
				that._cancelCurEditNode(opts, null, true);
			}
		}).bind('click', function(event) {
			return false;
		}).bind('dblclick', function(event) {
			return false;
		});
		this._$(node, _final.id.A, opts).addClass(_final.node.CURSELECTED_EDIT);
		root.curEditInput = inputObj;
		root.noSelection = false;
		root.curEditNode = node;
	},
	_destroy: function(opts) {
		if (!opts) return;
		this._initCache(opts);
		this._initRoot(opts);
		this._unbindTree(opts);
		this._unbindEvent(opts);
		this.element.empty();
		delete settings[opts.treeId];
	},
	_expandCollapseNode: function(opts, node, expandFlag, animateFlag, callback) {
		var that = this;
		var root = this._getRoot(opts),
		childKey = opts.keyChildren;
		if (!node) {
			that._apply(callback, []);
			return;
		}
		if (root.expandTriggerFlag) {
			var _callback = callback;
			callback = function(){
				if (_callback) _callback();
				if (node.open) {
					that.element.trigger(_final.event.EXPAND, [opts.treeId, node]);
				} else {
					that.element.trigger(_final.event.COLLAPSE, [opts.treeId, node]);
				}
			};
			root.expandTriggerFlag = false;
		}
		if (!node.open && node.isParent && ((!this._$(node, _final.id.UL, opts).get(0)) || (node[childKey] && node[childKey].length>0 && !this._$(node[childKey][0], opts).get(0)))) {
			this._appendParentULDom(opts, node);
			this._createNodeCallback(opts);
		}
		if (node.open == expandFlag) {
			this._apply(callback, []);
			return;
		}
		var ulObj = this._$(node, _final.id.UL, opts),
		switchObj = this._$(node, _final.id.SWITCH, opts),
		icoObj = this._$(node, _final.id.ICON, opts);
		if (node.isParent) {
			node.open = !node.open;
			if (node.iconOpen && node.iconClose) {
				icoObj.attr("style", this._makeNodeIcoStyle(opts, node));
			}
			if (node.open) {
				this._replaceSwitchClass(node, switchObj, _final.arrow.DOWN);
				this._replaceIcoClass(node, icoObj, _final.folder.OPEN);
				if (animateFlag == false || opts.expandSpeed == "") {
					ulObj.show();
					this._apply(callback, []);
				} else {
					if (node[childKey] && node[childKey].length > 0) {
						ulObj.slideDown(opts.expandSpeed, callback);
					} else {
						ulObj.show();
						this._apply(callback, []);
					}
				}
			} else {
				this._replaceSwitchClass(node, switchObj, _final.arrow.RIGHT);
				this._replaceIcoClass(node, icoObj, _final.folder.CLOSE );
				if (animateFlag == false || opts.expandSpeed == "" || !(node[childKey] && node[childKey].length > 0)) {
					ulObj.hide();
					this._apply(callback, []);
				} else {
					ulObj.slideUp(opts.expandSpeed, callback);
				}
			}
		} else {
			this._apply(callback, []);
		}
	},
	_expandCollapseParentNode: function(opts, node, expandFlag, animateFlag, callback) {
		if (!node) return;
		if (!node.parentTId) {
			this._expandCollapseNode(opts, node, expandFlag, animateFlag, callback);
			return;
		} else {
			this._expandCollapseNode(opts, node, expandFlag, animateFlag);
		}
		if (node.parentTId) {
			this._expandCollapseParentNode(opts, node.getParentNode(), expandFlag, animateFlag, callback);
		}
	},
	_expandCollapseSonNode: function(opts, node, expandFlag, animateFlag, callback) {
		var root = this._getRoot(opts),
		childKey = opts.keyChildren,
		treeNodes = (node) ? node[childKey]: root[childKey],
		selfAnimateSign = (node) ? false : animateFlag,
		expandTriggerFlag = this._getRoot(opts).expandTriggerFlag;
		this._getRoot(opts).expandTriggerFlag = false;
		if (treeNodes) {
			for (var i = 0, l = treeNodes.length; i < l; i++) {
				if (treeNodes[i]) this._expandCollapseSonNode(opts, treeNodes[i], expandFlag, selfAnimateSign);
			}
		}
		this._getRoot(opts).expandTriggerFlag = expandTriggerFlag;
		this._expandCollapseNode(opts, node, expandFlag, animateFlag, callback );
	},
	_makeDOMNodeIcon: function(html, opts, node) {
		var nameStr = this._getNodeName(opts, node),
		name = opts.nameIsHTML ? nameStr : nameStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		if ( opts.formatter ) {
			name = this._apply(opts.formatter, [opts,node,name, opts],opts.formatter);
		}
		html.push("<span id='", node.tId, _final.id.ICON,
			"' title='' treeNode", _final.id.ICON," class='", this._makeNodeIcoClass(opts, node),
			"' style='", this._makeNodeIcoStyle(opts, node), "'></span><span id='", node.tId, _final.id.SPAN, 
			"' class='coral-tree-node-name'>",name,"</span>");
	},
	_makeDOMNodeLine: function(html, opts, node) {
		html.push("<span id='", node.tId, _final.id.SWITCH,	"' title='' class='", this._makeNodeLineClass(opts, node), "' treeNode", _final.id.SWITCH,"></span>");
	},
	_makeDOMNodeMainAfter: function(html, opts, node) {
		html.push("</li>");
	},
	/*_makeDOMNodeMainBefore: function(html, setting, node) {
		html.push("<li id='", node.tId, "' class='", _final.className.LEVEL, node.level,"' tabindex='0' hidefocus='true' treenode>");
	},*/
	_makeDOMNodeMainBefore: function(html, opts, node) {
		html.push("<li ", (node.hidden ? "style='display:none;' " : ""), "id='", node.tId, "' class='", _final.className.LEVEL, node.level,"' tabindex='0' hidefocus='true' treenode>");
	},
	_makeDOMNodeNameAfter: function(html, opts, node) {
		html.push("</a>");
	},
	_makeDOMNodeNameBefore: function(html, opts, node) {
		var title = this._getNodeTitle(opts, node),
		url = this._makeNodeUrl(opts, node),
		fontcss = this._makeNodeFontCss(opts, node),
		fontStyle = [];
		for (var f in fontcss) {
			fontStyle.push(f, ":", fontcss[f], ";");
		}
		html.push("<a id='", node.tId, _final.id.A, "' class='", _final.className.LEVEL, node.level, (node.nodeDisabled===true?" coral-state-disabled":""),"' treeNode", _final.id.A," onclick=\"", (node.click || ''),
			"\" ",(node.nodeDisabled==true ? "title='" + opts.disabledMessage + "'" : ""), ((url != null && url.length > 0) ? "href='" + url + "'" : ""), " target='",this._makeNodeTarget(node),"' style='", fontStyle.join(''),
			"'");
		if (this._apply(node.nodeDisabled==true||opts.showTitle, [opts.treeId, node, opts], opts.showTitle) && title) {
			html.push("title='", title.replace(/'/g,"&#39;").replace(/</g,'&lt;').replace(/>/g,'&gt;'),"'");
		}
		html.push(">");
	},
	_addDiyDom : function( html,opts,node ) {
		if (node.level > 0) {
			html.push(this._getIndent(opts,node));
		}
	},
	_getIndent: function(opts, node){
		var spaceWidth = 16;
		if (node.getParentNode()) {
			var html = "", lineCss, lineClass = ["cui-icon"];
			if (node.getParentNode().getNextNode()) {
				if (opts.showLine) {
					lineClass.push(_final.line.LINE);
				} else {
					lineClass.push(_final.line.NOLINE);
				}
				html = "<span class='treeLine "+ lineClass.join("-") + "' style='width:" + spaceWidth + "px;'></span>";	
			} else {
				html = "<span class='treeIndent' style='width:" + spaceWidth + "px;'></span>";
			}
			return this._getIndent(opts,node.getParentNode()) + html;
		} else {
			return "";
		}
	},
	_makeNodeFontCss: function(opts, node) {
		var fontCss = this._apply(opts.fontCss, [opts.treeId, node, opts], opts.fontCss);
		return (fontCss && ((typeof fontCss) != "function")) ? fontCss : {};
	},
	_makeNodeIcoClass: function(opts, node) {
		var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node.icon,
			nodeIcon = node.isParent ? " coral-tree-icon-parent" : " coral-tree-icon-leaf";
		if( !icon ){
			var icoCss = ["cui-icon"];
			if (!node.isAjaxing) {
				icoCss[0] = (node.iconSkin ? node.iconSkin + "-" : "") + icoCss[0];
				if (opts.showIcon) {
					if (node.isParent) {
						icoCss.push(node.open ? _final.folder.OPEN : _final.folder.CLOSE);
					} else {
						icoCss.push(_final.folder.FILE);
					}
				}
			} 
			return _final.className.BUTTON + nodeIcon + " " + icoCss.join('-');
		} else {
			if(opts.iconUrl == true){
				return _final.className.BUTTON;
			} else {
				return _final.className.BUTTON + " " + icon;
			}
		}
	},
	_makeNodeIcoStyle: function(opts, node) {
		var icoStyle = [];
		if (!node.isAjaxing) {
			var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node.icon;
			if (icon) {
				if (opts.iconUrl == true) {
					icoStyle.push("background:url(", icon, ") 0 0 no-repeat;");
				} else {
					this._makeNodeIcoClass(opts,node);
				}
			}
				
			if (opts.showIcon == false || !this._apply(opts.showIcon, [opts.treeId, node, opts], true)) {
				icoStyle.push("width:0px;height:0px;display:none");
			}
		}
		return icoStyle.join('');
	},
	_makeNodeLineClass: function(opts, node) {
		var lineClass = [],	classPix = "cui-icon-";
		if (opts.showLine == true) {
			if (node.isParent) {
				lineClass.push(node.open ? _final.arrow.DOWN : _final.arrow.RIGHT );
			} else if(node.isLastNode) {
				lineClass.push(_final.line.BOTTOM);
				classPix = "cui-icon-";
			} else {
				lineClass.push(_final.line.CENTER);
				classPix = "cui-icon-";
			}
		} else {
			if (node.isParent) {
				lineClass.push(node.open ? _final.arrow.DOWN : _final.arrow.RIGHT );
			} else {
				lineClass.push(_final.folder.DOCU);
			}
		}
		return this._makeNodeLineClassEx(node) + classPix + lineClass.join('-');
	},
	_makeNodeLineClassEx: function(node) {
		return _final.className.BUTTON + " " + _final.className.LEVEL + node.level + " " + _final.className.SWITCH + " ";
	},
	_makeNodeTarget: function(node) {
		return (node.target || "_blank");
	},
	_makeNodeUrl1: function(opts, node) {
		var urlKey = opts.keyUrl;
		return node[urlKey] ? node[urlKey] : null;
	},
	_makeUlHtml: function(opts, node, html, content) {
		html.push("<ul id='", node.tId, _final.id.UL, "' class='", _final.className.LEVEL, node.level, " ", this._makeUlLineClass(opts, node), "' style='display:", (node.open ? "block": "none"),"'>");
		html.push(content);
		html.push("</ul>");
	},
	_makeUlLineClass: function(opts, node) {
		return ((opts.showLine && !node.isLastNode) ? _final.line.LINE : "");
	},
	_makeChkClass: function(opts, node) {
		var checkedKey = opts.keyChecked,chkName,
		c = _final.checkbox, r = _final.radio,
		fullStyle = "", stateCls = "";
		if (opts.chkStyle == r.STYLE) {
			fullStyle = (node.check_Child_State < 1)? c.CHECKED:c.PARTIAL;
			chkName = "cui-icon-" + opts.chkStyle + "-" + (node[checkedKey] ? c.CHECKED : c.UNCHECKED);
			chkName += fullStyle == c.PARTIAL ? c.PARTIAL : "";
		} else {
			if (node.halfCheck) {
				fullStyle = c.PARTIAL;
			} else {
				fullStyle = node[checkedKey] ? ((node.check_Child_State === 2 || node.check_Child_State === -1) ? c.CHECKED:c.PARTIAL) : ((node.check_Child_State < 1)? c.UNCHECKED:c.PARTIAL);
			}
			chkName = "cui-icon-" + opts.chkStyle + "-" + (fullStyle == c.PARTIAL ? ((node[checkedKey] ? c.CHECKED : c.UNCHECKED) + c.PARTIAL ) : fullStyle);
		}
		stateCls = (node.check_Focus && node.chkDisabled !== true) ? c.FOCUS : (node.chkDisabled == true ? c.DISABLED : c.DEFAULT);
		return _final.className.BUTTON + " " + stateCls  + " " + chkName;
	},
	//增加treeLine上的线
	_addLine: function(opts, node, oldLevel) {
		var i= typeof(oldLevel)=="undefined" ? 1: 0 ; 
		var diff = "";
		var arr = this._transformToArrayFormat(opts, node);
		if (oldLevel != null && node.level != null) {
			diff = (typeof(oldLevel)=="undefined" ? 0: oldLevel) - (typeof(node.level)=="undefined" ? 0: node.level);
		} 
		for (i; i < arr.length; i++) {
			this._$(arr[i], _final.id.A, opts).find("span:lt("+ (arr[i].level + diff) +")").remove();
			this._$(arr[i], _final.id.A, opts).prepend(this._getIndent(opts, arr[i]));
		}
	},
	//判断switchClass的类型
	_lineClass: function(node,showLine){
		var lineClass = [];
		if (node.isParent) {
			lineClass = node.open ? _final.arrow.DOWN : _final.arrow.RIGHT;
		} else {
			if (showLine) {
				if (node.level == 0 && node.isLastNode && node.isFirstNode) {
					lineClass = _final.line.NOLINE;
				} else if (node.level == 0 && node.isFirstNode && !node.isLastNode) {
					lineClass = _final.line.ROOTS;
				} else if (node.isLastNode) {
					lineClass = _final.line.BOTTOM;
				} else {
					lineClass = _final.line.CENTER;
				}
			} else {
				lineClass = _final.line.NOLINE;
			}
		}
		return lineClass;
	},
	_moveNode: function(opts, targetNode, node, moveType, animateFlag, isSilent) {
		var root = this._getRoot(opts),html=[],
		childKey = opts.keyChildren;
		if (targetNode == node) return;
		if (opts.keepLeaf && targetNode && !targetNode.isParent && moveType == _final.move.TYPE_INNER) return;
		var oldParentNode = (node.parentTId ? node.getParentNode(): root),
			oldLevelP = oldParentNode.level;
		targetNodeIsRoot = (targetNode === null || targetNode == root);
		if (targetNodeIsRoot && targetNode === null) targetNode = root;
		if (targetNodeIsRoot) moveType = _final.move.TYPE_INNER;
		var targetParentNode = (targetNode.parentTId ? targetNode.getParentNode() : root);

		if (moveType != _final.move.TYPE_PREV && moveType != _final.move.TYPE_NEXT) {
			moveType = _final.move.TYPE_INNER;
		}

		if (moveType == _final.move.TYPE_INNER) {
			if (targetNodeIsRoot) {
				//根节点的父TId是 null
				node.parentTId = null;
			} else {
				if (!targetNode.isParent) {
					targetNode.isParent = true;
					targetNode.open = !!targetNode.open;
					this._setNodeLineIcos(opts, targetNode);
				}
				node.parentTId = targetNode.tId;
			}
		}
		//移动节点 Dom元素
		var targetObj, target_ulObj;
		if (targetNodeIsRoot) {
			targetObj = this.element;
			target_ulObj = targetObj;
		} else {
			if (!isSilent && moveType == _final.move.TYPE_INNER) {
				this._expandCollapseNode(opts, targetNode, true, false);
			} else if (!isSilent) {
				this._expandCollapseNode(opts, targetNode.getParentNode(), true, false);
			}
			targetObj = this._$(targetNode, opts);
			target_ulObj = this._$(targetNode, _final.id.UL, opts);
			if (!!targetObj.get(0) && !target_ulObj.get(0)) {
				var ulstr = [];
				this._makeUlHtml(opts, targetNode, ulstr, '');
				targetObj.append(ulstr.join(''));
			}
			target_ulObj = this._$(targetNode, _final.id.UL, opts);
		}
		var nodeDom = this._$(node, opts);
		if (!nodeDom.get(0)) {
			nodeDom = this._appendNodes(opts, node.level, [node], null, false, true).join('');
		} else if (!targetObj.get(0)) {
			nodeDom.remove();
		}
		if (target_ulObj.get(0) && moveType == _final.move.TYPE_INNER) {
			target_ulObj.append(nodeDom);
		} else if (targetObj.get(0) && moveType == _final.move.TYPE_PREV) {
			targetObj.before(nodeDom);
		} else if (targetObj.get(0) && moveType == _final.move.TYPE_NEXT) {
			targetObj.after(nodeDom);
		}
		//移动节点后，更新相关节点的数据
		var i,l,
		lineClass = [],
		tmpSrcIndex = -1,
		tmpTargetIndex = 0,
		oldNeighbor = null,
		newNeighbor = null,
		oldNeighborLevel = null,
		newNeighborLevel = null,
		oldLevel = node.level;
		if (node.isFirstNode) {
			tmpSrcIndex = 0;
			if (oldParentNode[childKey].length > 1 ) {
				oldNeighbor = oldParentNode[childKey][1];
				oldNeighbor.isFirstNode = true;
				oldNeighborLevel = oldNeighbor.level;
			}
		} else if (node.isLastNode) {
			tmpSrcIndex = oldParentNode[childKey].length -1;
			oldNeighbor = oldParentNode[childKey][tmpSrcIndex - 1];
			oldNeighbor.isLastNode = true;
			oldNeighborLevel = oldNeighbor.level;
		} else {
			for (i = 0, l = oldParentNode[childKey].length; i < l; i++) {
				if (oldParentNode[childKey][i].tId == node.tId) {
					tmpSrcIndex = i;
					break;
				}
			}
		}
		if (tmpSrcIndex >= 0) {
			oldParentNode[childKey].splice(tmpSrcIndex, 1);
		}
		if (moveType != _final.move.TYPE_INNER) {
			for (i = 0, l = targetParentNode[childKey].length; i < l; i++) {
				if (targetParentNode[childKey][i].tId == targetNode.tId) tmpTargetIndex = i;
			}
		}
		if (moveType == _final.move.TYPE_INNER) {
			if (!targetNode[childKey]) targetNode[childKey] = new Array();
			if (targetNode[childKey].length > 0) {
				newNeighbor = targetNode[childKey][targetNode[childKey].length - 1];
				newNeighbor.isLastNode = false;
				newNeighborLevel = newNeighbor.level;
			}
			targetNode[childKey].splice(targetNode[childKey].length, 0, node);
			node.isLastNode = true;
			node.isFirstNode = (targetNode[childKey].length == 1);
		} else if (targetNode.isFirstNode && moveType == _final.move.TYPE_PREV) {
			targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
			newNeighbor = targetNode;
			newNeighbor.isFirstNode = false;
			newNeighborLevel = newNeighbor.level;
			node.parentTId = targetNode.parentTId;
			node.isFirstNode = true;
			node.isLastNode = false;
		} else if (targetNode.isLastNode && moveType == _final.move.TYPE_NEXT) {
			targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
			newNeighbor = targetNode;
			newNeighbor.isLastNode = false;
			newNeighborLevel = newNeighbor.level;
			node.parentTId = targetNode.parentTId;
			node.isFirstNode = false;
			node.isLastNode = true;
		} else {
			if (moveType == _final.move.TYPE_PREV) {
				targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
			} else {
				targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
			}
			node.parentTId = targetNode.parentTId;
			node.isFirstNode = false;
			node.isLastNode = false;
		}
		this._fixPIdKeyValue(opts, node);
		this._setSonNodeLevel(opts, node.getParentNode(), node);
		//更新被移动的节点数据
		var nodeObj = this._$(node, _final.id.SWITCH, opts);
		this._setNodeLineIcos(opts, node);
		this._repairNodeLevelClass(opts, node, oldLevel);
		this._addLine(opts, node,oldLevel);
		lineClass = this._lineClass(node, opts.showLine);
		this._replaceSwitchClass(node, nodeObj, lineClass);
		//更新被移动节点的原来父节点的 dom 元素
		if (!opts.keepParent && oldParentNode[childKey].length < 1) {
			//如果原来的父节点没有子节点元素
			oldParentNode.isParent = false;
			oldParentNode.open = false;
			var tmp_ulObj = this._$(oldParentNode, _final.id.UL, opts),
			tmp_switchObj = this._$(oldParentNode, _final.id.SWITCH, opts),
			tmp_icoObj = this._$(oldParentNode, _final.id.ICON, opts);
			lineClass = this._lineClass(oldParentNode, opts.showLine);
			this._replaceSwitchClass(oldParentNode, tmp_switchObj, lineClass);
			this._replaceIcoClass(oldParentNode, tmp_icoObj, _final.folder.FILE);
			tmp_ulObj.css("display", "none");
			this._addLine(opts, oldParentNode,oldLevelP);
		} else if (oldNeighbor) {
			//原来的相邻节点
			this._setNodeLineIcos(opts, oldNeighbor);
			this._addLine(opts, oldNeighbor,oldNeighborLevel);
		}
		//新的相邻节点
		if (newNeighbor) {
			tmp_switchObj = this._$(newNeighbor, _final.id.SWITCH, opts);
			this._setNodeLineIcos(opts, newNeighbor);
			this._addLine(opts, newNeighbor,newNeighborLevel);
			lineClass = this._lineClass(newNeighbor, opts.showLine);
			this._replaceSwitchClass(newNeighbor, tmp_switchObj, lineClass);
		}
		//移动后更新 checkbox / radio
		if (!!opts.check && opts.checkable && this._repairChkClass) {
			this._repairChkClass(opts, oldParentNode);
			this._repairParentChkClassWithSelf(opts, oldParentNode);
			if (oldParentNode != node.parent)
				this._repairParentChkClassWithSelf(opts, node);
		}
		//移动后展开父节点
		if (!isSilent) {
			this._expandCollapseParentNode(opts, node.getParentNode(), true, animateFlag);
		}
	},
	_removeChildNodes: function(opts, node) {
		if (!node) return;
		var childKey = opts.keyChildren,
		nodes = node[childKey];
		if (!nodes) return;

		for (var i = 0, l = nodes.length; i < l; i++) {
			this._removeNodeCache(opts, nodes[i]);
		}
		this._removeSelectedNode(opts);
		delete node[childKey];
		if (!opts.keepParent) {
			node.isParent = false;
			node.open = false;
			var tmp_switchObj = this._$(node, _final.id.SWITCH, opts),
			tmp_icoObj = this._$(node, _final.id.ICON, opts);
			this._replaceSwitchClass(node, tmp_switchObj, _final.line.CENTER);
			this._replaceIcoClass(node, tmp_icoObj, _final.line.CENTER);
			this._$(node, _final.id.UL, opts).remove();
		} else {
			this._$(node, _final.id.UL, opts).empty();
		}
	},
	// lihaibo add
	_showNode: function(opts, node, options) {
		node.hidden = false;
		this._initShowForExCheck(opts, node);
		this._$(node, opts).show();		
		if ( typeof options !== "undefined" && typeof options.showParents !== "undefined" && options.showParents && null !== node.getParentNode() ) {
			this._showNode (opts, node.getParentNode(), options);
		}
	},
	_initShowForExCheck: function(opts, n) {
		if (!n.hidden && opts.checkable) {
			if(typeof n._nocheck != "undefined") {
				n.nocheck = n._nocheck;
				delete n._nocheck;
			}
			if (this._setChkClass) {
				var checkObj = this._$(n, _final.id.CHECK, opts);
				this._setChkClass(opts, checkObj, n);
			}
			if (this._repairParentChkClassWithSelf) {
				this._repairParentChkClassWithSelf(opts, n);
			}
		}
	},
	_showNodes: function(opts, nodes, options) {
		if (!nodes || nodes.length == 0) {
			return;
		}
		var pList = {}, i, j;
		for (i=0, j=nodes.length; i<j; i++) {
			var n = nodes[i];
			if (!pList[n.parentTId]) {
				var pn = n.getParentNode();
				pList[n.parentTId] = (pn === null) ? this._getRoot(opts) : n.getParentNode();
			}
			this._showNode(opts, n, options);
		}
		for (var tId in pList) {
			var children = pList[tId][opts.keyChildren];
			this._setFirstNodeForShow(opts, children);
			this._setLastNodeForShow(opts, children);
		}
	},
	_setFirstNodeForShow: function(opts, nodes) {
		var n,i,j, first, old;
		for(i=0, j=nodes.length; i<j; i++) {
			n = nodes[i];
			if (!first && !n.hidden && n.isFirstNode) {
				first = n;
				break;
			} else if (!first && !n.hidden && !n.isFirstNode) {
				n.isFirstNode = true;
				first = n;
				this._setNodeLineIcos(opts, n);
			} else if (first && n.isFirstNode) {
				n.isFirstNode = false;
				old = n;
				this._setNodeLineIcos(opts, n);
				break;
			} else {
				n = null;
			}
		}
		return {"new":first, "old":old};
	},
	_setLastNodeForShow: function(opts, nodes) {
		var n,i,j, last, old;
		for (i=nodes.length-1; i>=0; i--) {
			n = nodes[i];
			if (!last && !n.hidden && n.isLastNode) {
				last = n;
				break;
			} else if (!last && !n.hidden && !n.isLastNode) {
				n.isLastNode = true;
				last = n;
				this._setNodeLineIcos(opts, n);
			} else if (last && n.isLastNode) {
				n.isLastNode = false;
				old = n;
				this._setNodeLineIcos(opts, n);
				break;
			} else {
				n = null;
			}
		}
		return {"new":last, "old":old};
	},
	_hideNode: function(opts, node, options) {
		node.hidden = true;
		node.isFirstNode = false;
		node.isLastNode = false;
		this._initHideForExCheck(opts, node);
		this._cancelPreSelectedNode(opts, node);
		this._$(node, opts).hide();
	},
	_initHideForExCheck: function(opts, n) {
		if (n.hidden && opts.checkable) {
			if(typeof n._nocheck == "undefined") {
				n._nocheck = !!n.nocheck
				n.nocheck = true;
			}
			n.check_Child_State = -1;
			if (this._repairParentChkClassWithSelf) {
				this._repairParentChkClassWithSelf(opts, n);
			}
		}
	},
	_hideNodes: function(opts, nodes, options) {
		if (!nodes || nodes.length == 0) {
			return;
		}
		var pList = {}, i, j;
		for (i=0, j=nodes.length; i<j; i++) {
			var n = nodes[i];
			if ((n.isFirstNode || n.isLastNode) && !pList[n.parentTId]) {
				var pn = n.getParentNode();
				pList[n.parentTId] = (pn === null) ? this._getRoot(opts) : n.getParentNode();
			}
			this._hideNode(opts, n, options);
		}
		for (var tId in pList) {
			var children = pList[tId][opts.keyChildren];
			this._setFirstNodeForHide(opts, children);
			this._setLastNodeForHide(opts, children);
		}
	},
	_setFirstNodeForHide: function(opts, nodes) {
		var n,i,j;
		for (i=0, j=nodes.length; i<j; i++) {
			n = nodes[i];
			if (n.isFirstNode) {
				break;
			}
			if (!n.hidden && !n.isFirstNode) {
				n.isFirstNode = true;
				this._setNodeLineIcos(opts, n);
				break;
			} else {
				n = null;
			}
		}
		return n;
	},
	_setLastNodeForHide: function(opts, nodes) {
		var n,i;
		for (i=nodes.length-1; i>=0; i--) {
			n = nodes[i];
			if (n.isLastNode) {
				break;
			}
			if (!n.hidden && !n.isLastNode) {
				n.isLastNode = true;
				this._setNodeLineIcos(opts, n);
				break;
			} else {
				n = null;
			}
		}
		return n;
	},
	// lihaibo add end
	_setFirstNode: function(opts, parentNode) {
		var childKey = opts.keyChildren, childLength = parentNode[childKey].length;
		if ( childLength > 0) {
			parentNode[childKey][0].isFirstNode = true;
		}
	},
	_setLastNode: function(opts, parentNode) {
		var childKey = opts.keyChildren, childLength = parentNode[childKey].length;
		if ( childLength > 0) {
			parentNode[childKey][childLength - 1].isLastNode = true;
		}
	},
	_removeNode2: function(opts, node) {
		var root = this._getRoot(opts),lineClass=[],
		childKey = opts.keyChildren,
		oldLevel = node.level,
		prevNode = node.getPreNode(),
		nextNode = node.getNextNode(),
		parentNode = (node.parentTId) ? node.getParentNode() : root,
		parentNodeOldlevel = parentNode.level;
		node.isFirstNode = false;
		node.isLastNode = false;
		node.getPreNode = function() {return null;};
		node.getNextNode = function() {return null;};
		if (!this._getNodeCache(opts, node.tId)) {
			return;
		}
		this._$(node, opts).remove();
		this._removeNodeCache(opts, node);
		this._removeSelectedNode(opts, node);

		for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
			if (parentNode[childKey][i].tId == node.tId) {
				parentNode[childKey].splice(i, 1);
				break;
			}
		}
		this._setFirstNode(opts, parentNode);
		this._setLastNode(opts, parentNode);
		var tmp_ulObj,tmp_switchObj,tmp_icoObj,
		childLength = parentNode[childKey].length;
		//删除节点后更新原来的父节点
		if (!opts.keepParent && childLength == 0) {
			//如果原来的父节点没有子节点
			parentNode.isParent = false;
			parentNode.open = false;
			tmp_ulObj = this._$(parentNode, _final.id.UL, opts);
			tmp_switchObj = this._$(parentNode, _final.id.SWITCH, opts);
			tmp_icoObj = this._$(parentNode, _final.id.ICON, opts);
			lineClass = this._lineClass(parentNode, opts.showLine);
			this._replaceSwitchClass(parentNode, tmp_switchObj, lineClass);
			this._replaceIcoClass(parentNode, tmp_icoObj, _final.folder.FILE);
			tmp_ulObj.css("display", "none");
		} else if (opts.showLine && childLength > 0) {
			//如果原来的父节点有子节点
			var newLast = parentNode[childKey][childLength - 1];
			tmp_ulObj = this._$(newLast, _final.id.UL, opts);
			tmp_switchObj = this._$(newLast, _final.id.SWITCH, opts);
			tmp_icoObj = this._$(newLast, _final.id.ICON, opts);
			if (parentNode == root) {
				if (parentNode[childKey].length == 1) {
					//如果移除的是树的根节点，并且该树只有这一个根节点时
					this._replaceSwitchClass(newLast, tmp_switchObj, _final.arrow.DOWN);
				} else {
					var tmp_first_switchObj = this._$(parentNode[childKey][0], _final.id.SWITCH, opts);
					this._replaceSwitchClass(parentNode[childKey][0], tmp_first_switchObj, (parentNode[childKey][0].isParent ? (parentNode[childKey][0].open == true ? _final.arrow.DOWN: _final.arrow.RIGHT) : _final.line.ROOTS));
					if( !newLast.isParent){
						this._replaceSwitchClass(newLast, tmp_switchObj, _final.line.BOTTOM);
					} else {
						this._replaceSwitchClass(newLast, tmp_switchObj,(node.open == true ? _final.arrow.DOWN: _final.arrow.RIGHT) );
					}
				}
			} else {
				if (newLast.isParent) {
					this._replaceSwitchClass(newLast, tmp_switchObj, (newLast.open ? _final.arrow.DOWN: _final.arrow.RIGHT ));
				} else {
					this._replaceSwitchClass(newLast, tmp_switchObj, _final.line.BOTTOM);
				}
			}
			this._addLine(opts, parentNode, parentNodeOldlevel);
			tmp_ulObj.removeClass(_final.line.LINE);
		}
	},
	_replaceIcoClass: function(node, obj, newName) {
		var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node.icon;
		if (!obj || node.isAjaxing) return;
		var tmpName = obj.attr("class");
		if (tmpName == undefined) return;
		var tmpList = tmpName.split("-");
		switch (newName) {
			case _final.folder.OPEN:
			case _final.folder.CLOSE:
			case _final.folder.FILE:
			case _final.line.CENTER:
			case _final.line.BOTTOM:
			case _final.line.LINE:
				if (icon) {
					obj.attr("class", tmpList);
				} else {
					tmpList[tmpList.length-1] = newName
					obj.attr("class", tmpList.join("-"));
				}
				break;
		}
	},
	_replaceSwitchClass: function(node, obj, newName) {
		if (!obj) return;
		var tmpName = obj.attr("class");
		if (tmpName == undefined) return;
		var tmpList = tmpName.split("-");
		switch (newName) {
			case _final.arrow.DOWN:
			case _final.arrow.RIGHT:
			case _final.line.NOLINE:
				tmpList[tmpList.length-1] = newName;
				break;
			case _final.folder.OPEN:
			case _final.folder.CLOSE:
			case _final.line.ROOTS:
			case _final.line.CENTER:
			case _final.line.BOTTOM:
			case _final.folder.DOCU:
			case _final.line.LINE:
				tmpList[tmpList.length-1] = newName;
				break;
		}
		obj.attr("class", tmpList.join("-"));
		if (newName !== _final.folder.DOCU) {
			obj.removeAttr("disabled");
		} else {
			obj.attr("disabled", "disabled");
		}
	},	
	_repairAllChk: function(opts, checked) {
		if (opts.checkable && opts.chkStyle === _final.checkbox.STYLE) {
			var checkedKey = opts.keyChecked,
			childKey = opts.keyChildren,
			root = this._getRoot(opts);
			for (var i = 0, l = root[childKey].length; i<l ; i++) {
				var node = root[childKey][i];
				if (node.nocheck !== true && node.chkDisabled !== true) {
					node[checkedKey] = checked;
				}
				this._setSonNodeCheckBox(opts, node, checked);
			}
		}
	},
	_repairChkClass: function(opts, node) {
		if (!node) return;
		this._makeChkFlag(opts, node);
		if (node.nocheck !== true) {
			var checkObj = this._$(node, _final.id.CHECK, opts);
			this._setChkClass(opts, checkObj, node);
		}
	},
	_repairParentChkClass: function(opts, node) {
		if (!node || !node.parentTId) return;
		var pNode = node.getParentNode();
		this._repairChkClass(opts, pNode);
		this._repairParentChkClass(opts, pNode);
	},
	_repairParentChkClassWithSelf: function(opts, node) {
		if (!node) return;
		var childKey = opts.keyChildren;
		if (node[childKey] && node[childKey].length > 0) {
			this._repairParentChkClass(opts, node[childKey][0]);
		} else {
			this._repairParentChkClass(opts, node);
		}
	},
	_repairSonChkDisabled: function(opts, node, chkDisabled, inherit) {
		if (!node) return;
		var childKey = opts.keyChildren;
		if (node.chkDisabled != chkDisabled) {
			node.chkDisabled = chkDisabled;
		}
		this._repairChkClass(opts, node);
		if (node[childKey] && inherit) {
			for (var i = 0, l = node[childKey].length; i < l; i++) {
				var sNode = node[childKey][i];
				this._repairSonChkDisabled(opts, sNode, chkDisabled, inherit);
			}
		}
	},
	_repairParentChkDisabled: function(opts, node, chkDisabled, inherit) {
		if (!node) return;
		if (node.chkDisabled != chkDisabled && inherit) {
			node.chkDisabled = chkDisabled;
		}
		this._repairChkClass(opts, node);
		this._repairParentChkDisabled(opts, node.getParentNode(), chkDisabled, inherit);
	},	
	_selectNode1: function(opts, node, addFlag) {
		if (!addFlag) {
			this._cancelPreSelectedNode(opts);
		}
		//$$(node, _final.id.A, setting).addClass(_final.node.CURSELECTED);
		this._$(node, _final.id.A, opts).addClass(_final.node.CURSELECTED);
		this._addSelectedNode(opts, node);
	},
	_setNodeFontCss: function(opts, treeNode) {
		var aObj = this._$(treeNode, _final.id.A, opts),
		fontCss = this._makeNodeFontCss(opts, treeNode);
		if (fontCss) {
			aObj.css(fontCss);
		}
	},
	_setNodeLineIcos: function(opts, node) {
		if (!node) return;
		var switchObj = this._$(node, _final.id.SWITCH, opts),
		ulObj = this._$(node, _final.id.UL, opts),
		icoObj = this._$(node, _final.id.ICON, opts),
		ulLine = this._makeUlLineClass(opts, node);
		if (ulLine.length==0) {
			ulObj.removeClass(_final.line.LINE);
		} else {
			ulObj.addClass(ulLine);
		}
		switchObj.attr("class", this._makeNodeLineClass(opts, node));
		if (node.isParent) {
			switchObj.removeAttr("disabled");
		} else {
			switchObj.attr("disabled", "disabled");
		}
		icoObj.removeAttr("style");
		icoObj.attr("style", this._makeNodeIcoStyle(opts, node));
		icoObj.attr("class", this._makeNodeIcoClass(opts, node));
	},
	_setNodeName: function(opts, node) {
		var title = this._getNodeTitle(opts, node),
		nObj = this._$(node, _final.id.SPAN, opts);
		nObj.empty();
		var names = "";
		if ( opts.formatter ) {
			names = this._apply(opts.formatter, [opts,node, opts],opts.formatter);
		} else {
			names = this._getNodeName(opts, node);
		}
		if (opts.nameIsHTML) {
			nObj.html(names);
		} else {
			nObj.text(names);
		}
		if (this._apply(opts.showTitle, [opts.treeId, node, opts], opts.showTitle)) {
			var aObj = this._$(node, _final.id.A, opts);
			aObj.attr("title", !title ? "" : title);
		}
	},
	_setNodeTarget: function(opts, node) {
		var aObj = this._$(node, _final.id.A, opts);
		aObj.attr("target", this._makeNodeTarget(node));
	},
	_setNodeUrl: function(opts, node) {
		var aObj = this._$(node, _final.id.A, opts),
		url = this._makeNodeUrl(opts, node);
		if (url == null || url.length == 0) {
			aObj.removeAttr("href");
		} else {
			aObj.attr("href", url);
		}
	},
	_switchNode: function(opts, node) {
		if (node.open || !this._canAsync(opts, node)) {
			this._expandCollapseNode(opts, node, !node.open);
		} else if (opts.asyncEnable) {
			if (!this._asyncNode(opts, node)) {
				this._expandCollapseNode(opts, node, !node.open);
				return;
			}
		} else if (node) {
			this._expandCollapseNode(opts, node, !node.open);
		}
	},
	_setChkClass: function(opts, obj, node) {
		if (!obj) return;
		if (node.nocheck === true) {
			obj.hide();
		} else {
			obj.show();
		}
        obj.attr('class', this._makeChkClass(opts, node));
	},
	_setParentNodeCheckBox: function(opts, node, value, srcNode) {
		var childKey = opts.keyChildren,
		checkedKey = opts.keyChecked,
		checkObj = this._$(node, _final.id.CHECK, opts);
		if (!srcNode) srcNode = node;
		this._makeChkFlag(opts, node);
		if (node.nocheck !== true && node.chkDisabled !== true) {
			node[checkedKey] = value;
			this._setChkClass(opts, checkObj, node);
			if (opts.autoCheckTrigger && node != srcNode) {
				this.element.trigger(_final.event.CHECK, [null, opts.treeId, node]);
			}
		}
		if (node.parentTId) {
			var pSign = true;
			if (!value) {
				var pNodes = node.getParentNode()[childKey];
				for (var i = 0, l = pNodes.length; i < l; i++) {
					if ((pNodes[i].nocheck !== true && pNodes[i].chkDisabled !== true && pNodes[i][checkedKey])
					|| ((pNodes[i].nocheck === true || pNodes[i].chkDisabled === true) && pNodes[i].check_Child_State > 0)) {
						pSign = false;
						break;
					}
				}
			}
			if (pSign) {
				this._setParentNodeCheckBox(opts, node.getParentNode(), value, srcNode);
			}
		}
	},
	_setSonNodeCheckBox: function(opts, node, value, srcNode) {
		if (!node) return;
		var childKey = opts.keyChildren,
		checkedKey = opts.keyChecked,
		checkObj = this._$(node, _final.id.CHECK, opts);
		if (!srcNode) srcNode = node;
		var hasDisable = false;
		if (node[childKey]) {
			for (var i = 0, l = node[childKey].length; i < l && node.chkDisabled !== true; i++) {
				var sNode = node[childKey][i];
				this._setSonNodeCheckBox(opts, sNode, value, srcNode);
				if (sNode.chkDisabled === true) hasDisable = true;
			}
		}
		if (node != this._getRoot(opts) && node.chkDisabled !== true) {
			if (hasDisable && node.nocheck !== true) {
				this._makeChkFlag(opts, node);
			}
			if (node.nocheck !== true && node.chkDisabled !== true) {
				node[checkedKey] = value;
				if (!hasDisable) node.check_Child_State = (node[childKey] && node[childKey].length > 0) ? (value ? 2 : 0) : -1;
			} else {
				node.check_Child_State = -1;
			}
			this._setChkClass(opts, checkObj, node);
			if (opts.autoCheckTrigger && node != srcNode && node.nocheck !== true && node.chkDisabled !== true) {
				this.element.trigger(_final.event.CHECK, [null, opts.treeId, node]);
			}
		}

	},
	_removeEditBtn: function(opts, node) {
		this._$(node, _final.id.EDIT, opts).unbind().remove();
	},
	_removeRemoveBtn: function(opts, node) {
		this._$(node, _final.id.REMOVE, opts).unbind().remove();
	},
	_removeTreeDom: function(opts, node) {
		node.isHover = false;
		this._removeEditBtn(opts, node);
		this._removeRemoveBtn(opts, node);
		this._$(node, _final.id.A, opts).removeClass(_final.node.CURHOVER);
		this._apply(opts.removeHoverDom, [opts.treeId, node, opts]);
	},
	_repairNodeLevelClass: function(opts, node, oldLevel) {
		if (oldLevel === node.level) return;
		var liObj = this._$(node, opts),
		aObj = this._$(node, _final.id.A, opts),
		ulObj = this._$(node, _final.id.UL, opts),
		oldClass = _final.className.LEVEL + oldLevel,
		newClass = _final.className.LEVEL + node.level;
		liObj.removeClass(oldClass);
		liObj.addClass(newClass);
		aObj.removeClass(oldClass);
		aObj.addClass(newClass);
		ulObj.removeClass(oldClass);
		ulObj.addClass(newClass);
	},
	_selectNodes : function(opts, nodes) {
		for (var i=0, l=nodes.length; i<l; i++) {
			this._selectNode(opts, nodes[i], i>0);
		}
	},
	_createNodes: function(opts, level, nodes, parentNode) {
		var _createNodes = this._createNodes1;
		if (_createNodes) _createNodes.apply(this, arguments);
		if (!nodes) return;
		//checkTree
		//this._repairParentChkClassWithSelf(setting, parentNode);
		//editTree
		if (this._repairParentChkClassWithSelf) {
			this._repairParentChkClassWithSelf(opts, parentNode);
		}
	},
	_removeNode1: function(opts, node) {
		var _removeNode2 = this._removeNode2;
		var parentNode = node.getParentNode();
		if (_removeNode2) _removeNode2.apply(this, arguments);
		if (!node || !parentNode) return;
		this._repairChkClass(opts, parentNode);
		this._repairParentChkClass(opts, parentNode);
	},	
	_appendNodes: function(opts, level, nodes, parentNode, initFlag, openFlag) {
		var _appendNodes = this._appendNodes1;
		var html = "";
		if (_appendNodes) {
			html = _appendNodes.apply(this, arguments);
		}
		if (parentNode) {
			this._makeChkFlag(opts, parentNode);
		}
		return html;
	},	
	//override 可编辑树复写部分普通树的方法
	_cancelPreSelectedNode: function (opts, node) {
		_cancelPreSelectedNode = this._cancelPreSelectedNode1;
		var list = this._getRoot(opts).curSelectedList;
		for (var i=0, j=list.length; i<j; i++) {
			if (!node || node === list[i]) {
				this._removeTreeDom(opts, list[i]);
				if (node) break;
			}
		}
		if (_cancelPreSelectedNode) _cancelPreSelectedNode.apply(this, arguments);
	},	
	_makeNodeUrl: function(opts, node) {
		var _makeNodeUrl = this._makeNodeUrl1;
		return opts.editable ? null : (_makeNodeUrl.apply(this, arguments));
	},	
	_removeNode: function(opts, node) {
		var _removeNode1 = this._removeNode1;
		var root = this._getRoot(opts);
		if (root.curEditNode === node) root.curEditNode = null;
		if (_removeNode1) {
			_removeNode1.apply(this, arguments);
		}
	},	
	_selectNode: function(opts, node, addFlag) {
		var _selectNode = this._selectNode1;
		var root = this._getRoot(opts);
		if (this._isSelectedNode(opts, node) && root.curEditNode == node && node.editNameFlag) {
			return false;
		}
		if (_selectNode) _selectNode.apply(this, arguments);
		this._addHoverDom(opts, node);
		return true;
	},
	_uCanDo1: function(opts, e) {
		return true;
	},
	_uCanDo: function(opts, e) {
		var _uCanDo = this._uCanDo1;
		var root = this._getRoot(opts);
		if (e && (this._eqs(e.type, "mouseover") || this._eqs(e.type, "mouseout") || this._eqs(e.type, "mousedown") || this._eqs(e.type, "mouseup"))) {
			return true;
		}
		if (root.curEditNode) {
			this._editNodeBlur = false;
			root.curEditInput.focus();
		}
		return (!root.curEditNode) && (_uCanDo ? _uCanDo.apply(this, arguments) : true);
	}
})		
// noDefinePart
} ) );
	