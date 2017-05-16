( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./core",
			"./component",
			"./grid.common",
			"./locale-cn",
			"./fmatter"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.grid = $.grid||{};
 var grid = $.component( "coral.grid",{
	version: "4.0.1",
	castProperties : ["rowEditButtons", "data","subGridOptions","initData","subGridRowExpanded","shortCut", "rowList","pager","pagerTemplate", "celloptions","colModel", "picTemplate","rowattr","cellattr"],
	options: {
		
	},
	grid: {
			
	},
	diff: 2,
	getScrollBarWidth: function () {
		var inner = document.createElement('p');
		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild (inner);

		document.body.appendChild (outer);
		var w1 = inner.offsetWidth;
	  	outer.style.overflow = 'scroll';
	  	var w2 = inner.offsetWidth;
	  	if (w1 == w2) w2 = outer.clientWidth;

	  	document.body.removeChild (outer);

	  	return (w1 - w2)+this.diff;
	},
	_destroy: function(){
        var destroyPag = "",
            elementId = $(this.element).attr("id");
        if (this.pagers){
             destroyPag = $(this.pagers).empty().addClass(elementId);
        }
        $(this.element).empty();
		this.element.removeClass( "ctrl-init ctrl-init-grid" );
		this.element.removeClass( "coral-grid" );
		this.element.removeClass( this.options.cls );
        this.component().replaceWith(this.element).append(destroyPag); 
	},
	/***
	 * 第一步：
	 * 初始化生成统一的模型数据
	 * 第二步：
	 * 分离不同表格的构造方法，构造方法基于统一模型，可方便切换
	 * 第三部：
	 * 构造表格，绑定方法
	 * 
	 */
	_create: function() {
		var options = this.options,
			that = this,
			activeClass = "coral-state-active",
			focusClass = "coral-state-focus",
			id = this.element.uniqueId().attr("id");
		options.id = id;
		var p = {
			_index : {},
			altRows:false,
			altclass: " coral-priority-secondary ",
			ajaxGridOptions:{},//grid请求的默认参数
			asyncType: "post",//Ajax 的 http 请求模式
			autoSave: false,//点击表格其他位置是否自动保存编辑状态的单元格。
			autoValid: true,
			autoWidth: true,
			allowSaveOnError: true,//出错的时候是否允许保存，默认是允许的。
			cls: "",
			caption: "",
			colModel: [],//列模型，根据页面html，自动构造
			colNames: [],//列名字，根据页面html，自动构造
			cellLayout: 1,
			cellEdit: false,
			subGridWidth: 22,
			cellsubmit: "clientArray",
			clicksToEdit: 2,
			data : [],
			datatype: "json",
			direction : "ltr",
			allowCellSelect: false,
			deselectAfterSort: true,
			emptyrecords: "无数据",
			expandColumn: null,
			height: 150,//列表默认高度
			idPrefix : "",
			initData: false,
			customPicgrid: $.noop(),
			gridview: false,
			grouping : false,
			groupingView : {groupField:[],groupOrder:[], groupText:[],groupColumnShow:[],groupSummary:[], showSummaryOnHide: false, sortitems:[], sortnames:[], summary:[],summaryval:[], plusicon: 'cui-icon-plus3', minusicon: 'cui-icon-minus3', displayField: [], groupSummaryPos:[], formatDisplayField : [], _locgr : false},
			subGridOptions: {
			      "plusicon"  : "cui-icon-arrow-right3",
			      "minusicon" : "cui-icon-arrow-down3",
			      "openicon"  : ""
			    },
			groupHeaders: [],
			groupHeader: false,
			search: false,
			remoteFilter: false,
			fitStyle: "auto",
			forceFit : false,
			hoverrows : true,
			lastsort: 0,
			loadonce: true,
			loadui: "enable", // lihaibo 20141111
			loadtext: "加载中，请耐心等候 ...", // lihaibo 20141111
			minWidth: false,
			multiselect: false,
			multiselectWidth: 30,
			multiboxonly: false,
			multikey: "",
			clickRowToSelect:true,
			subGridRowExpanded:null,
			model: "grid",
			page: 1,//列表默认页码
			pager: "",
			pagerStyle: "flex",
			pginput: true,
			records: 0,
			rninput: true,
			rowEditButtons: [],
			pgbuttons: true,
			showGridHeader: true,
			enableHighlight: false,
			picTemplate: "picTemplate",
			postData: {},
			prmNames: {page:"P_pageNumber",rows:"P_pagesize", sort: "P_orders",order: "sord", search:"_search", nd:"nd", id:"id",oper:"oper",editoper:"edit",addoper:"add",deloper:"del", subgridid:"id", npage: null, totalrows:"totalrows"},
			rowNum: 20,//默认每页显示行数
			rowNumMax: 200,//默认每页显示最大行数
			rownumbers: false,
			rownumWidth: 35,
			rownumName: "",
			rowList: [10,20,30],
			savedRow: [],
			scrollOffset:this.getScrollBarWidth(),
			selarrrow: [],
			singleselect: false,
			sortorder: "asc",
			treeGrid : false,
			treeGridModel : 'adjacency',
			treeReader : {},
			treeANode : -1,
			tree_root_level : 0,
			generalLevel : false,
			onSortableColumns: false,
			sortableColumnsOptions: {},
			onSortableRows: false,
			beforeSortableRows: false,
			afterSortableRows: false,
			editableRows: false,
			onSortableStart: false,
			onSortableStop: false,
			onSortableReceive: false,
			onSortableRemove: false,
			onSortableLoad: false,
			connectGridId: null,
			containSortOrder: false,
			sortSeparator: " ",
			shrinkToFit: true,
			toppager: false,
			toolbar: [false,""],
			url: "",//grid加载的远程地址
			useProp: true,
			viewsortcols : [false,'vertical',true],
			viewrecords: true,
			minIndex: null,
			maxIndex: null,
			preIndex: null,
			beforePopulate: null
		};
		options = $.extend(true,{},p,$.grid.defaults,this.options);
		// 兼容处理
		if(options.model == "pic"){options.model = "card";}
		this.options = options;
		this.options.isValid = true;
		options.postData = $.coral.toFunction(options.postData);
		options.localReader = $.extend(true,{
			root: "data",
			page: "pageNumber",
			total: "totalPages",
			records: "total",
			repeatitems: false,
			cell: "cell",
			id: "id",
			userData: "userData",
			subgrid: {root:"data", repeatitems: true, cell:"cell"}
		},options.localReader);
		options.jsonReader = $.extend(true,{
			root: "data",
			page: "pageNumber",
			total: "totalPages",
			records: "total",
			repeatitems: false,
			cell: "cell",
			id: "id",
			userData: "userData"
		},options.jsonReader);
		
		if(this.options.pivotData && this.options.pivotData.length){
			this.jqPivot(this.options.pivotData,this.options.pivotOption,this.options.gridOption,this.options.ajaxOption);
		}
	//	jqPivot
		
		if(this.options.data.length) { this.normalizeData(); this.refreshIndex(); }
		this.id = id;
		var grid = {
			groupHeader: [],
			headers:[],
			cols:[],
			footers: [],
			dragStart: function(i,x,y) {//index, event, the offset of column
				var grid = this;
				this.resizing = { idx: i, startX: x.clientX, sOL : y[0]};
				grid.columnsView.style.cursor = "col-resize";
				this.curGbox = $("#rs_m"+$.grid.coralID(that.options.id),"#"+$.grid.coralID(that.options.id));
				this.curGbox.css({display:"block",left:y[0],top:y[1],height:y[2]});
				that._trigger("onResizeStart", x, [{"index":i}]);
				document.onselectstart=function(){return false;};
			},
			dragMove: function(x) {
				if(this.resizing) {
					var diff = x.clientX-this.resizing.startX,
					h = this.headers[this.resizing.idx], //current header
					newWidth = that.options.direction === "ltr" ? h.width + diff : h.width - diff, //new width of current header
					hn, //new header
					nWn; //new width of new header
					$("#test").html(diff);
					if(newWidth > 33) {
						this.curGbox.css({left:this.resizing.sOL+diff});
						if(that.options.forceFit===true ){
							hn = this.headers[this.resizing.idx+options.nv];
							nWn = that.options.direction === "ltr" ? hn.width - diff : hn.width + diff;
							if(nWn >33) {
								h.newWidth = newWidth;
								hn.newWidth = nWn;
							}
						} else {
							this.newWidth = that.options.direction === "ltr" ? that.options.tblwidth+diff : that.options.tblwidth-diff;
							h.newWidth = newWidth;
						}
					}
				}
			},
			dragEnd: function() {
				this.columnsView.style.cursor = "default";
				if(this.resizing) {
					var idx = this.resizing.idx,
					nw = this.headers[idx].newWidth || this.headers[idx].width;
					nw = parseInt(nw,10);
					this.resizing = false;
					$("#rs_m"+$.grid.coralID(that.options.id)).css("display","none");
					that.options.colModel[idx].width = nw;
					this.headers[idx].width = nw;
					this.headers[idx].el.style.width = nw + "px";
					this.cols[idx].style.width = nw+"px";
					if($('table:first',this.rowsView).hasClass("coral-grid-btable-frozen")){//处理冻结行
						$("tr.jqgfirstrow>td:eq("+idx+")", $('table:first',this.rowsView))[0].style.width = nw+"px";
					}
					var groupHeader = $("tr.jqg-first-row-header>th:eq("+idx+")", $('table:first',this.columnsView));
					if(groupHeader.length>0){groupHeader[0].style.width = nw+"px";}
					if(this.footers.length>0) {this.footers[idx].style.width = nw+"px";}
					if(that.options.forceFit===true){
						nw = this.headers[idx+options.nv].newWidth || this.headers[idx+options.nv].width;
						this.headers[idx+options.nv].width = nw;
						this.headers[idx+options.nv].el.style.width = nw + "px";
						this.cols[idx+options.nv].style.width = nw+"px";
						if(this.footers.length>0) {this.footers[idx+options.nv].style.width = nw+"px";}
						that.options.colModel[idx+options.nv].width = nw;
						
						groupHeader = $("tr.jqg-first-row-header>th:eq("+(idx+options.nv)+")", $('table:first',this.columnsView));
						if(groupHeader.length>0){groupHeader[0].style.width = nw+"px";}
					} else {
						that.options.tblwidth = this.newWidth || that.options.tblwidth;
						//$('table:first',this.rowsView).css("width",that.options.tblwidth+"px");
						$('table',this.rowsView).css("width",that.options.tblwidth+"px");//包括冻结行的宽度
						$('table:first',this.columnsView).css("width",that.options.tblwidth+"px");
						this.columnsView.scrollLeft = this.rowsView.scrollLeft;
						if(that.options.footerrow) {
							$('table:first',this.sDiv).css("width",p.tblwidth+"px");
							this.sDiv.scrollLeft = this.rowsView.scrollLeft;
						}
					}
					that._trigger("onResizeStop",null, [{"newWidth":nw,"index":idx,"headers":this.headers}]);
				}
				this.curGbox = null;
				document.onselectstart=function(){return true;};
			},
			selectionPreserver : function(that) {
				var opts = that.options,
				sr = opts.selrow, sra = opts.selarrrow ? $.makeArray(opts.selarrrow) : null,
				left = that.grid.rowsView.scrollLeft,
				restoreSelection = function() {
					var i;
					opts.selrow = null;
					opts.selarrrow = [];
					if(opts.multiselect && sra && sra.length>0) {
						for(i=0;i<sra.length;i++){
							if (sra[i] != sr) {
								$(that.element).grid("setSelection",sra[i],false, null);
							}
						}
					}
					if (sr) {
						$(that.element).grid("setSelection",sr,false,null);
					}
					that.grid.rowsView.scrollLeft = left;
					$(that.element).unbind('.selectionPreserver', restoreSelection);
				};
				$(that.element).bind('gridoncomplete.selectionPreserver', restoreSelection);				
			}
		};
		this.grid = grid;
		
		/* 
		 * 找到页面上定义的列容器
		 * 分页条的class名字包含grid的id，所以查找列的时候需要排除此情况
		 * */
		var gridColumns = this.element.find(">div").filter(function(){
				if($(this).hasClass(that.options.id))return false;
				return true;
			}),
			gridRows = $("<div class='coral-grid-rows'></div>");
		if(gridColumns.length==0){//如果是js初始化需要手动创建列div
			this.element.prepend("<div></div>");
			gridColumns =  this.element.find(">div").filter(function(){
				if($(this).hasClass(that.id))return false;
				return true;
			});
		}
		that.gridRows = gridRows;
		that.gridColumns = gridColumns;
		that._analyzeColumns(gridColumns);
		gridColumns.addClass("coral-grid-columns").after(gridRows);
		//rowsView 表格内容部分的view
		grid.rowsView = document.createElement("div");
		$(grid.rowsView).addClass("coral-grid-rows-view").appendTo(gridRows);
		
	//	$("<div class='coral-grid-loading' id='"+"load_"+$.grid.coralID(that.options.id)+"'>" + that.options.loadtext + "</div>").appendTo( this.element );
		$("<span class='coral-grid-noRecordsTips' id='"+"noRecordsTips_"+$.grid.coralID(that.options.id)+"'>" + that.options.emptyrecords + "</span>").appendTo( $(grid.rowsView) );
		
		//columnsView 表格表头部分的view
		grid.columnsView = document.createElement("div");
		$(grid.columnsView).addClass("coral-state-default coral-grid-columns-view").appendTo(gridColumns)
			.append("<div class='coral-grid-topRightCell'></div>");	
		that.pic = $("<ul class='coral-pic'></ul>");
		gridColumns.addClass("coral-grid-columns").after(that.pic);
		if(that.options.grouping===true) {
			that.options.scroll = false;
			that.options.rownumbers = false;
			//that.options.subGrid = false;
			that.options.treeGrid = false;
			that.options.gridview = true;
		}
		if(this.options.treeGrid === true) {
			try { $(that.element).grid("setTreeGrid");} catch (_) {}
			if(that.options.datatype != "local") { that.options.localReader = {id: "_id_"};	}
		}
		if(this.options.subGrid) {
			try { $(that.element).grid("setSubGrid");} catch (s){}
		}
		
		if(this.options.multiselect) {
			this.options.singleselect = false;
		}
		if (!this.options.keyName) {
			this.options.keyName = false;
		}
		for (var i=0; i<this.options.colModel.length;i++) {
			this.options.colModel[i] = $.extend(true, {}, this.options.cmTemplate, this.options.colModel[i].template || {}, this.options.colModel[i]);
			if (this.options.keyName === false && this.options.colModel[i].key===true) {
				this.options.keyName = this.options.colModel[i].name;
			}
		}
		//设置多选
		if(this.options.multiselect) {
			this.options.colNames.unshift("<input role='checkbox' id='cb_"+this.options.id+"' class='cbox' type='checkbox'/>");
			//this.options.colModel.unshift({name:'cb',width:isSafari ? that.options.multiselectWidth+that.options.cellLayout : that.options.multiselectWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
			this.options.colModel.unshift({name:'cb', width:that.options.multiselectWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}else if(this.options.singleselect){
			this.options.colNames.unshift("");
			this.options.colModel.unshift({name:'cb', width:that.options.multiselectWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		//设置行号
		if(this.options.rownumbers) {
			this.options.colNames.unshift(that.options.rownumName);
			this.options.colModel.unshift({name:'rn',width:that.options.rownumWidth,sortable:false,resizable:false,hidedlg:true,search:false,align:'center',fixed:true});
		}
		that._transToGrid();
		that._transToPicgrid();
		
		that._transPagers();
		that._cvH = $(grid.columnsView).height();//列头的高度不能每次获取，如果切换的时候列头的高度是隐藏的，获得的值是0
		// 20150203 grid 初始化时，数据加载前，先让pager拉下来（假如是自适应的情况下）
		if ( "fill" !== options.fitStyle ) {
		}
		that._setGridHeight(that.options.height);
		// 20150203
		if(options.model == "grid") {
			that.pic.hide();
		}else if(options.model == "card"){
			that.gridRows.hide();
			that.gridColumns.hide();
		}
		// lihaibo 20141111 begin
		that.setFrozenColumns();
		this.component().addClass(options.componentCls);
		this._populate();
		// end
		that._setUpEvent();
		$(window).unload(function () {
			that = null;
		});
		// Clicks outside of a grid cancel any edit row
		this._on( this.document, {
			mousedown: function( event ) {
				if ( this.options.autoSave && this._closeOnDocumentClick( event ) ) {
					this.restoreAll( event );
				}
				if(this._closeOnDocumentClick( event )){
					$(this.rows.namedItem(this.options.selrow)).removeClass("coral-grid-cell-focus");
					for(var i = 0;i<this.rows.length;i++){
						var tdFocused = $(this.rows[i]).find("td");
						if($(tdFocused).hasClass('coral-grid-cell-focus')) {
							$(tdFocused).removeClass("coral-grid-cell-focus");
						}
					}
				}
			}
		});
		if(this.options.showGridHeader == true && that.options.model != "card") {
			this.showGridHeader();
		} else{
			this.hideGridHeader();
		}
//		this.pagers = this.element.find(".coral-grid-pager");
//		if (this.pagers && this.options.width){
//			this.pagers.css({
//				width : this.options.width + "px"
//			})
//		}
	},
	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".coral-grid" ).length;
	},
	_transPagers: function(){
		var that = this;
		// 处理多个分页条
		this.pagers = $("."+this.id);
		if(this.options.pager == true){
			this.options.pager =$("<div id='pager_0_"+ this.id +"'></div>");
			this.options.pager.addClass("coral-grid-pager").removeClass(that.id).appendTo(this.element);
			that._setPager( this.options.pager[0].id, '' );
		}else{
			this.pagers.each(function(ind){
				$(this).addClass("coral-grid-pager").removeClass(that.id).attr("id","pager_"+ ind++ +"_"+that.id);
			});
			if(this.pagers){
				this.pagers.each(function(i){
					that._setPager( that.pagers[i].id, '' );
				});
			}
		}
		that.options.pager = "."+that.id;
	},
	toolbar: function(){
		return $( ".pager-toolbar", this.element );
	},
	_transToPicgrid: function(){
		var that = this;
			
		that.pic.css({height:230,'overflow':'auto'});
	},
	_transToGrid: function(){
		var that = this,
			options = this.options;
		if ($.inArray(that.options.multikey,that._sortkeys) == -1 ) {that.options.multikey = false;}
		that.options.sortorder = that.options.sortorder.toLowerCase();
		
		this.element.addClass("coral-grid");
		this.element.addClass(that.options.cls); // add cls attribute
		
		that._transGridView();
		//$(gv).css("width",grid.width+"px");
		
	},
	_transGridView: function(){
		var that = this,
			options = this.options,
			grid = this.grid,
		    ni = options.rownumbers===true ? 1 :0,
		    gi = options.multiselect ===true ? 1 :(options.singleselect === true ? 1 :0),
		    si = options.subGrid===true ? 1 :0;
		var dir= options.direction,i;
		var thead = "<thead><tr class='coral-grid-labels' role='rowheader'>",
		tdc, idn, w, res, sort,
		td, ptr, tbody, imgs,iac="",idc="";
		// 最后一列不允许拖拽列宽
		if(options.shrinkToFit===true && options.forceFit===true) {
			for (i=options.colModel.length-1;i>=0;i--){
				if(!options.colModel[i].hidden) {
					options.colModel[i].resizable=false;
					break;
				}
			}
		}

		$.each(this.options.colModel, function() {
			if(typeof this.hidden === 'undefined') {this.hidden=false;}
		});
		//if(that.options.viewsortcols[1] == 'horizontal') {iac=" coral-i-asc";idc=" coral-i-desc";}
		//tdc = isMSIE ?  "class='coral-th-div-ie'" :"";
		imgs = "<span class='s-ico' style='display:none'><span sort='asc' class='coral-grid-ico-sort coral-icon-asc"+iac+" coral-state-disabled cui-icon-arrow-up5 coral-sort-"+dir+"'></span>";
		imgs += "<span sort='desc' class='coral-grid-ico-sort coral-icon-desc"+idc+" coral-state-disabled cui-icon-arrow-down5 coral-sort-"+dir+"'></span></span>";
		for(i=0;i<options.colNames.length;i++){
			var tooltip = that.options.headertitles ? (" title=\""+$.grid.stripHtml(that.options.colNames[i])+"\"") :"";
			var coralColumnSortableDisabledClass = options.colModel[i].columnSortable ? "coral-columnSortable-disabled" : "";
			//var tooltip = ""
			thead += "<th id='"+options.id+"_"+options.colModel[i].name+"' role='columnheader' class='coral-state-default " + coralColumnSortableDisabledClass + " coral-th-column coral-th-"+dir+"'"+ tooltip+">";
			idn = options.colModel[i].index || options.colModel[i].name;
			if( i<ni+si+gi ){
				thead += "<div id='jqgh_"+options.id+"_"+options.colModel[i].name+"' "+tdc+">"+options.colNames[i];
			}else{
				thead += "<div id='jqgh_"+options.id+"_"+options.colModel[i].name+"' "+" title='"+options.colNames[i]+"'"+tdc+">"+options.colNames[i];
			}
			if(!options.colModel[i].width)  { options.colModel[i].width = 150; }
			else { options.colModel[i].width = parseInt(options.colModel[i].width,10); }
			if(typeof(options.colModel[i].title) !== "boolean") { options.colModel[i].title = true; }
			if (idn == options.sortname) {
				options.lastsort = i;
			}
			thead += imgs+"</div></th>";
		}
		thead += "</tr></thead>";
		imgs = null;
		var hTable = $("<table class='coral-grid-htable' role='grid' aria-labelledby='gbox_"+this.id+"' cellspacing='0' cellpadding='0' border='0'></table>").append(thead);
		that.gridColumns.find(".coral-grid-columns-view").append(hTable);
		
		$("thead tr:first th",grid.columnsView).hover(function(){$(this).addClass('coral-state-hover');},function(){$(this).removeClass('coral-state-hover');});
		that._setMultiselect();
		var ww;
		if(typeof(options.width)!=='undefined') {
			if(typeof(options.width)=='string' && options.width=='auto'){
				var pw = $(that.element).innerWidth();
				that.options.width = pw > 0?  pw: 'nw';
				ww = pw;
			//	that._setOption('width',pw);
			}else{
				ww = options.width;
			//	that._setOption('width',options.width);
			}
		}
		// beforePopulate里面可能设置了colModel里面的值，所以诸如_setColWidth引用colModel属性的方法都
		// 要放到beforePopulate后面。
		that._trigger("beforePopulate", null, []);
		// 设置宽度 有可能改变colmodel的宽度
		this._setColWidth();
		$(that.element).append("<div class='coral-grid-resize-mark' id='rs_m"+that.options.id+"'>&#160;</div>");
		
		thead = $("thead:first",that.element).get(0);
		
		var	tfoot = "";
		if(that.options.footerrow) { tfoot += "<table role='grid' style='width:"+that.options.tblwidth+"px' class='ui-jqgrid-ftable' cellspacing='0' cellpadding='0' border='0'><tbody><tr role='row' class='ui-widget-content footrow'>"; }
		var thr = $("tr:first",thead),
		firstr = "<tr class='jqgfirstrow' role='row' style='height:auto'>";
		$("th",thr).each(function ( j ) {
			w = options.colModel[j].width;
			if(typeof options.colModel[j].resizable === 'undefined') {options.colModel[j].resizable = true;}
			if(options.colModel[j].resizable){
				res = document.createElement("span");
				$(res).html("&#160;").addClass('coral-grid-resize coral-grid-resize-'+dir);
				$(res).css("cursor","col-resize");
				$(this).addClass(options.resizeclass);
			} else {
				res = "";
			}
			$(this).css("width",w+"px").prepend(res);
			//$(this).prepend(res);
			var hdcol = "";
			if( options.colModel[j].hidden ) {
				$(this).css("display","none");
				hdcol = "display:none;";
			}
			firstr += "<td role='gridcell' style='height:0px;width:"+w+"px;"+hdcol+"'></td>";
			//grid.headers.push({ width: w, el: this });
			grid.headers[j] = { width: w, el: this };
			sort = options.colModel[j].sortable;
			if( typeof sort !== 'boolean') {options.colModel[j].sortable =  true; sort=true;}
			var nm = options.colModel[j].name;
			if( !(nm == 'cb' || nm=='subgrid' || nm=='rn') ) {
				if(options.viewsortcols[2]){
					$(">div",this).addClass('coral-grid-sortable');
				}
			}
			if(sort) {
				if(options.viewsortcols[0]) {$("div span.s-ico",this).show(); if(j==options.lastsort){ $("div span.coral-icon-"+options.sortorder,this).removeClass("coral-state-disabled");}}
				else if( j == options.lastsort) {$("div span.s-ico",this).show();$("div span.coral-icon-"+options.sortorder,this).removeClass("coral-state-disabled");}
			}
			if(options.footerrow) { tfoot += "<td role='gridcell' "+that._formatCol(j,0,'', null, '', false)+">&#160;</td>"; }
		}).mousedown(function(e) {
			if ($(e.target).closest("th>span.coral-grid-resize").length != 1) { return; }
			var ci = that._getColumnHeaderIndex(this);
			if(options.forceFit===true) {options.nv= that._nextVisible(ci);}//options.nv: the interval between current column to the next visible column
			grid.dragStart(ci, e, that._getOffset(ci));
			return false;
		}).click(function(e) {
			if (options.disableClick) {
				options.disableClick = false;
				return false;
			}
			var s = "th>div.coral-grid-sortable",r,d;
			if (!options.viewsortcols[2]) { s = "th>div>span>span.coral-grid-ico-sort"; }
			var t = $(e.target).closest(s);
			if (t.length != 1) { return; }
			var ci = that._getColumnHeaderIndex(this);
			if (!options.viewsortcols[2]) { r=true;d=t.attr("sort"); }
			that._sortData( $('div',this)[0].id, ci, r, d, this);
			return false;
		});
		if (that.options.onSortableColumns && $.fn.sortable) {
			try {
				$(that.element).grid("sortableColumns", thr);
			} catch (e){}
		}
		if(that.options.footerrow) { tfoot += "</tr></tbody></table>"; }
		firstr += "</tr>";
		var bTable = $("<table id='"+that.options.id+"_table' class='coral-grid-btable' role='grid' cellspacing='0' cellpadding='0' border='0'></table>").append(firstr);
		that.gridRows.find(".coral-grid-rows-view").append(bTable);
		this.rows = that.gridRows.find(".coral-grid-btable")[0].rows;
		this.element.prepend("<div class='coral-grid-view'></div>");
		var hb;
		if(that.options.footerrow) {
			grid.sDiv = $("<div class='ui-jqgrid-sdiv'></div>")[0];
			hb = $("<div class='ui-jqgrid-hbox'></div>");
			$(grid.sDiv).append(hb).width(grid.width).insertAfter(that.gridColumns);
			$(hb).append(tfoot);
			grid.footers = $(".ui-jqgrid-ftable",grid.sDiv)[0].rows[0].cells;
			if(that.options.rownumbers) { grid.footers[0].className = 'ui-state-default jqgrid-rownum'; }
			//if(hg) {$(grid.sDiv).hide();}
		}
		hb = null;
		if(that.options.caption.length>0){
			grid.caption = document.createElement("div");
			grid.caption.className = "coral-grid-caption";
			$(grid.caption).html(that.options.caption);
			this.element.prepend(grid.caption);
		}
		$(grid.columnsView).add(grid.rowsView).parent().appendTo(this.element.find(".coral-grid-view"));
		//if(options.width===true) {
		
		if(options.shrinkToFit===true && options.forceFit===true) {
			$('table:first',grid.rowsView).css("width",that.grid.width+"px");//设置表格行宽度
			$('table:first',grid.columnsView).css("width",that.grid.width+"px");//设置表格列宽度
		}
		else if(options.shrinkToFit===false){
			$('table:first',grid.rowsView).css("width",that.options.tblwidth+"px");//设置表格行宽度
			$('table:first',grid.columnsView).css("width",that.options.tblwidth+"px");//设置表格列宽度
		}
		that._setOption('width',ww);
		this.grid.cols = this.rows[0].cells;
		/*if(options.groupHeaders) {
			this.setGroupHeaders(options.groupHeaders);
		}*/
		/*设置表头分组，如果为true则解析表头，如果为false则需要手动分组*/
		if(options.groupHeader){
			this.setGroupHeaders({
				useColSpanStyle :  true,
				groupHeaders:options.groupHeaders
			});
			//分组内部的排序
			var thrThird = $("tr.jqg-third-row-header",thead);
			if (that.options.sortable && $.fn.sortable) {
				try {
					$(that.element).grid("sortableColumns", thrThird);
				} catch (e){}
			}
		}
		
		thead = null;
		hTable = null;
		bTable = null;
	},
	_sortkeys: ["shiftKey","altKey","ctrlKey"],
	_getColumnHeaderIndex: function (th) {
		var that = this;
		var i, headers = that.grid.headers, ci = $.grid.getCellIndex(th);
		if (this.grid.rightfhDiv) {
			ci = headers.length - ci - 1;
		}
		for (i = 0; i < headers.length; i++) {
			if (th === headers[i].el) {
				ci = i;
				break;
			}
		}
		return ci;
	},
	/*解析grid的colModel和colNames*/
	_analyzeColumns:function(columns) {
		var that = this,
			i = 0,
			options = this.options;
		if (this.options.colModel.length <= 0) {
			//解析colModel和colNames
			columns.children().each(function(i){
				var opts = $.parser.parseOptions(this,null,["data"]);
				if(typeof(opts.name)!="undefined"){
					options.colModel.push(opts);
					options.colNames.push(opts.label||$(this).html());
				}else if(typeof(opts.header)!="undefined"){
					var len = 0;
					var inOption;
					$(this).children().each(function(i){
						var opts = $.parser.parseOptions(this,null,["data"]);
						options.colModel.push(opts);
						options.colNames.push(opts.label||$(this).html());
						len++;
						i==0&&(inOption = opts);
					});
					options.groupHeaders.push({startColumnName: inOption.name, numberOfColumns: len, titleText: opts.header});
				}
			});
		}
		for (i=0;i<this.options.colModel.length;i++){
			var model = this.options.colModel[i];
			// 处理formatter
			if ( model.formatter == "combobox" ||
					model.formatter == "combotree" || model.formatter == "combogrid") {
				( model.formatter == "combotree" ) && ( model.formatoptions.dataStructure = "tree" );
				if ( model.revertCode != false ) {//默认设置为true
					model.revertCode = true;
				}
			}
			
			//model.postMode = model.postMode || "value";
			// 处理edit
			if ( model.edittype == "combobox" || 
					model.edittype == "combotree" || 
					model.edittype == "autocomplete" || model.edittype == "combogrid" ) {
				( model.edittype == "combotree" ) && ( model.editoptions.dataStructure = "tree" );
				model.formatter = model.formatter || "convertCode";
				
			}
			this.transTempData(model);
		}
		if ( this.options.colNames.length === 0 ) {
			for (i=0;i<this.options.colModel.length;i++){
				this.options.colNames[i] = this.options.colModel[i].label || this.options.colModel[i].name;
			}
		}
		if ( this.options.colNames.length !== this.options.colModel.length ) {
			alert("errors! colNames not equals to colModel!");
			return;
		}
		/*清除初始化时候的div列模型*/
		columns.children().not(".coral-grid-columns-view").remove();
	},
	_updateMultiSelectIndexsOption: function (options) {
		var min_index = options.minIndex,
			max_index = options.maxIndex,
			pre_index = options.preIndex,
			cur_index = options.curIndex;
		if (null == min_index) {
			min_index = max_index = pre_index = (null == pre_index ? cur_index : pre_index);
		}
	 	if (cur_index <= min_index) {
		   	min_index = cur_index;
		   	max_index = pre_index;
	 	} else if (cur_index > min_index && cur_index < max_index) {
	 		min_index = Math.min (cur_index, pre_index);
	    	max_index = Math.max (cur_index, pre_index);   			
	     } else if (cur_index > max_index) {
			max_index = cur_index;
			min_index = pre_index;
	     }
	 	return {
	 		minIndex: min_index,
	 		maxIndex: max_index,
	 		preIndex: pre_index
	 		
	 	};
	},
	// 添加 shift 多选支持功能
	_addShiftKeySelect: function (e, ui) {
		var that = this,
			opts = that.options;
		// 平稳退化，及变量定义		
		if (!ui.rowId) {
			return ;
		}                                                          
		var $this = $(that.element), 
			isShift = false,
			rows = $this.find(".coral-grid-btable")[0].rows,
			curIndex = rows.namedItem (ui.rowId).rowIndex;	
		// shiftKey 处理代码
		if (e.shiftKey) {
			var indexsOption = that._updateMultiSelectIndexsOption({
				maxIndex:opts.maxIndex, 
				minIndex:opts.minIndex, 
				preIndex:opts.preIndex, 
				curIndex:curIndex});
			opts.minIndex = indexsOption.minIndex;
			opts.maxIndex = indexsOption.maxIndex;
			opts.preIndex = indexsOption.preIndex;
	    	$this.grid('resetSelection');
		    for (var i = opts.minIndex; i <= opts.maxIndex; i++) {
		    	var select = false;
		    	if (i == opts.maxIndex) {
		    		select = true;
		    	}
	            $this.grid('setSelection', rows[i].id, select);
		    }
		    if (document.selection && document.selection.empty) {
		        document.selection.empty();
		    } else if (window.getSelection) {
		        window.getSelection().removeAllRanges();
	   		}
		    isShift = true;
		} else {
			// 其他 Key 处理代码
			opts.minIndex = opts.maxIndex = null;	
			opts.preIndex = curIndex;
		}	
		
		// 非 ctrlKey 并且非 shiftKey 处理代码
		/*if (!e.ctrlKey && !e.shiftKey) {
			$this.grid('resetSelection');
		}	*/
		return isShift;
	},
	_setUpEvent: function(){
		var that = this,
			grid = this.grid,
			options = this.options;
		var ri,ci, tdHtml, td,  ptr;
		if( that.options.cellEdit === false && that.options.hoverrows === true) {
			$(that.element).bind('mouseover',function(e) {
				var isPicgrid = !!(that.options.model == "card");
				if(isPicgrid){
					ptr = $(e.target,that.pic).closest("li.gridPanel").find(".rowgrid");
					if($(ptr).attr("class") !== "coral-subgrid") {
						$(ptr).addClass("coral-state-hover");
					}
				}else{
					ptr = $(e.target,that.rows).closest("tr.jqgrow");
					if($(ptr).attr("class") !== "coral-subgrid" ) {
						$(ptr).addClass("coral-state-hover");
					}
				}
			}).bind('mouseout',function(e) {
				var isPicgrid = !!(that.options.model == "card");
				if(isPicgrid){
					ptr = $(e.target,that.pic).closest("li.gridPanel ").find(".rowgrid");
				}else{
					ptr = $(e.target,that.rows).closest("tr.jqgrow");
				}
				$(ptr).removeClass("coral-state-hover");
			});
		}
		/*监听grid表格内滚动条横向拖动时，滚动表头*/
		$(grid.rowsView).scroll(function(e){
			if(options.scroll) {
				var scrollTop = $(grid.rowsView)[0].scrollTop;
				if(grid.scrollTop === undefined) { grid.scrollTop = 0; }
				if (scrollTop != grid.scrollTop) {
					grid.scrollTop = scrollTop;
					if (grid.timer) { clearTimeout(grid.timer); }
					grid.timer = setTimeout(grid.populateVisible, options.scrollTimeout);
				}
			}
			$(grid.columnsView)[0].scrollLeft = $(grid.rowsView)[0].scrollLeft;
			var top = $(grid.rowsView)[0].scrollTop;
			
			$(".coral-grid-btable-frozen").css(
				'left',-$(grid.rowsView)[0].scrollLeft+"px"
			);
			var b = $( ".row-editable", that.element ),
				editRow = $(that.element).grid("getInd",that.editRowIndex,true);
			
			if (b.length > 0) {
				that.editButtonsPos(that.editRowIndex,b);
			}
			
			if(options.footerrow) {
				grid.sDiv.scrollLeft = $(grid.rowsView)[0].scrollLeft;
			}
		//	if( e ) { e.stopPropagation(); }
		});
		//表格上的单击事件处理
		$(".coral-grid-btable", that.element).add(that.pic).click(function(e) {
			var isPicgrid = !!(that.options.model == "card");
			var rowId;
			td = e.target;
			if(isPicgrid){
				ptr = $(td,that.pic).closest("li.gridPanel");
			}else{
				ptr = $(td,that.rows).closest("tr.jqgrow");
			}
			if(that.options.allowCellSelect){
				for(var i = 0;i<this.rows.length;i++){
					if($(this.rows[i]).find("td").hasClass('coral-grid-cell-focus')) {
						$(this.rows[i]).find("td").removeClass("coral-grid-cell-focus");
					}
				}
				if(td.tagName == 'TD'){
					$(td).addClass("coral-grid-cell-focus");
				} else {
					$(td).closest("td").addClass("coral-grid-cell-focus");
				}
			}
			/*此处需要处理冻结列（行）的情况*/
			if($(ptr).length === 0 || ptr[0].className.indexOf( 'coral-state-disabled' ) > -1 ||
					$(td,that.element).closest("table.coral-grid-btable").length < 0 ) {
				return this;
			}
			var scb = $(td).hasClass("cbox"),
			cSel = $(that.element).triggerHandler("gridBeforeSelectRow", [ptr[0].id, e]);
			cSel = that._trigger("beforeSelectRow", e, [{"rowId":ptr[0].id}]);
			cSel = (cSel === false || cSel === 'stop') ? false : true;

			//if(cSel && $.isFunction(that.options.beforeSelectRow)) { cSel = that.options.beforeSelectRow.call(that.element,ptr[0].id, e); }
			if (td.tagName == 'A' || ((td.tagName == 'INPUT' || td.tagName == 'TEXTAREA' || td.tagName == 'OPTION' || td.tagName == 'SELECT' ) && !scb) ) { return; }
			if(cSel === true) {
				rowId = ptr[0].id;
				tdHtml = $(td).closest("td,th").html();
				if(!isPicgrid){
					ci = $.grid.getCellIndex(td);
					if (that._addShiftKeySelect(e, {"rowId":ptr[0].id})) {
						return;
					}
					that._trigger("onSelectCell",e , [{"rowId":rowId,"rowIndex":ptr[0].rowIndex,"cellIndex":ci,"cellHtml":tdHtml}]);
				}
				if( that.options.editableRows && that.options.clicksToEdit == 1 &&
					options.editrow != rowId ){
					//that.restoreRow(options.editrow);
					that.restoreRow(options.editrow);
					if ( that.rowEditButtons  ) {
						that.rowEditButtons.remove();
					}
				}
				
				if( that.options.editableRows && that.options.clicksToEdit == 1 && !scb ){
					options.editrow = ptr[0].id;
					that.editRow(ptr[0].id, true);
				}
				if( that.options.cellEdit === true && that.options.clicksToEdit == 1 ) {
					
					//如果是多选并且选的是checkbox的情况则触发'setSelection'方法
					//列不可编辑，并且multikey为false时，应该选中；否则，不选中
					var editable = that.options.colModel[ci].editable;
					var mul = that.options.multiselect || that.options.singleselect;
					if( ( mul && scb && that.options.clickRowToSelect) || ( mul && !editable && !that.options.multikey ) ) {
						$(that.element).grid("setSelection", rowId ,true,e);
					} else {
					//	ri = ptr[0].rowIndex;
						if(!isPicgrid){
							try {$(that.element).grid("editCell",ptr[0].rowIndex,ci,true);} catch (_) {}
						}
					}
				} else if ( !that.options.multikey ) {
					that.selectMultikey(that,e,rowId);
				} else { 
					if ( e[ that.options.multikey ] ) {
						$(that.element).grid("setSelection",rowId,true,e);
					} else if( ( that.options.multiselect || that.options.singleselect ) && scb ) {
						/*scb = $("#jqg_"+$.grid.coralID(that.options.id)+"_"+ri).is(":checked");
						$("#jqg_"+$.grid.coralID(that.options.id)+"_"+ri)[that.options.useProp ? 'prop' : 'attr']("checked", scb);*/
						$(that.element).grid("setSelection",rowId,true,e);
						// 如取消选中的选框，则将全选框也取消
						if (!scb) {
							that._cancelCheckAll();
						}
					} else {
						that.options.multiboxonly = true;
						that.selectMultikey(that,e,rowId);
					}
				}
			}
		});
		this._on({
			"keydown": function(e) {
				var keyCode = $.coral.keyCode,pre,next,pt,nextTd,preTd,ci,focusedTd,li;
				var options = that.options;
				if (options.filterToolbar) return;
				switch (e.keyCode) {
					case keyCode.UP:
						e.preventDefault();
						td = $(e.target);
						ptr = $(td,that.rows).closest("tr.jqgrow");
						pt = this.rows.namedItem(ptr[0].id + "");
						if(options.allowCellSelect){
							for(var i = 0; i<$(pt).find("td").length; i++){
								var tdObj = $(pt).find("td")[i];
								if($(tdObj).hasClass("coral-grid-cell-focus")){
									ci = $.grid.getCellIndex(tdObj);
									focusedTd = $(tdObj);
								}
							}
							this.options.iColFocus = ci;
							preTd = $(pt).prevAll(":visible:eq(0)").find("td")[ci];
							pre = $(pt).prevAll(":visible:eq(0):not(.jqgfirstrow)");
							this.options.focusrow = pre[0].id;
							this.options.iRowFocus = pre[0].rowIndex;
							if (pre && pre.length != 0) {
								focusedTd.removeClass("coral-grid-cell-focus");
								$(preTd).addClass("coral-grid-cell-focus");
								pre.focus();
							} else {
								return;
							}
						}
						
						break;
					case keyCode.DOWN:
						e.preventDefault();
						td = $(e.target);
						ptr = $(td,that.rows).closest("tr.jqgrow");
						pt = this.rows.namedItem(ptr[0].id + "");
						if(options.allowCellSelect){
							for(var i = 0; i<$(pt).find("td").length; i++){
								var tdObj = $(pt).find("td")[i];
								if($(tdObj).hasClass("coral-grid-cell-focus")){
									ci = $.grid.getCellIndex(tdObj);
									focusedTd = $(tdObj);
								}
							}
							this.options.iColFocus = ci;
							nextTd = $(pt).nextAll(":visible:eq(0)").find("td")[ci];
							next = $(pt).nextAll(":visible:eq(0)");
							this.options.focusrow = next[0].id;
							this.options.iRowFocus = next[0].rowIndex;
							if (next && next.length != 0) {
								focusedTd.removeClass("coral-grid-cell-focus");
								$(nextTd).addClass("coral-grid-cell-focus");
								next.focus();
							} else {
								return;
							}
						}
						break;
					case keyCode.RIGHT:
						e.preventDefault();
						td = $(e.target);
						ptr = $(td,that.rows).closest("tr.jqgrow");
						pt = this.rows.namedItem(ptr[0].id + "");
						for(var i = 0; i<$(pt).find("td").length; i++){
							var tdObj = $(pt).find("td")[i];
							if($(tdObj).hasClass("coral-grid-cell-focus")){
								li = $.grid.getCellIndex(tdObj);
								focusedTd = $(tdObj);
							}
						}
						nextTd = $(pt).find("td")[li+1];
						this.options.focusrow = ptr[0].id;
						this.options.iRowFocus = ptr[0].rowIndex;
						if ($(nextTd) && $(nextTd).length != 0) {
							while(!$(nextTd).is(":visible") && (li<$(pt).find("td").length)){
								li++;
								nextTd = $(pt).find("td")[li+1];
							}
							this.options.iColFocus = li+1;
							focusedTd.removeClass("coral-grid-cell-focus");
							$(nextTd).addClass("coral-grid-cell-focus");
							$(nextTd).focus();
						} else {
							return;
						}
						break;
					case keyCode.LEFT:
						e.preventDefault();
						td = $(e.target);
						ptr = $(td,that.rows).closest("tr.jqgrow");
						pt = this.rows.namedItem(ptr[0].id + "");
						for(var i = 0; i<$(pt).find("td").length; i++){
							var tdObj = $(pt).find("td")[i];
							if($(tdObj).hasClass("coral-grid-cell-focus")){
								ci = $.grid.getCellIndex(tdObj);
								focusedTd = $(tdObj);
							}
						}
						preTd = $(pt).find("td")[ci-1];
						this.options.focusrow = ptr[0].id;
						this.options.iRowFocus = ptr[0].rowIndex;
						if ($(preTd) && $(preTd).length != 0) {
							while(!$(preTd).is(":visible")){
								if(ci==0) {
									return;
								} else {
									ci--;
									preTd = $(pt).find("td")[ci-1];
								}
							}
							this.options.iColFocus = ci-1;
							focusedTd.removeClass("coral-grid-cell-focus");
							$(preTd).addClass("coral-grid-cell-focus");
							$(preTd).focus();
						} else {
							return;
						}
						break;
				}
				if(that.options.shortCut){
					$.coral.callFunction(options.shortCut,event,this);
				}
			}
		});
		$(that.element)
		// 列表上双击事件
		.dblclick(function(e) {
			td = e.target;
			ptr = $(td,that.rows).closest("tr.jqgrow");
			if( $(ptr).length === 0 ){return;}
			if( that.options.editableRows && options.editrow != ptr[0].id ){
				that.restoreRow(options.editrow);
				if ( that.rowEditButtons ) {
					that.rowEditButtons.remove();
				}
			}
			var ri = ptr[0].rowIndex;
			var ci = $.grid.getCellIndex(td);
			if( that.options.editableRows && that.options.clicksToEdit == 2 ){
				options.editrow = ptr[0].id;
				that.editRow(ptr[0].id, true);
			}
			if( that.options.cellEdit === true && that.options.clicksToEdit == 2 ) {
				ri = ptr[0].rowIndex;
				try {$(that.element).grid("editCell",ri,ci,true);} catch (_) {}
			} 
			that._trigger( "onDblClickRow", null, [{"rowId":ptr[0].id,"rowIndex":ri,"cellIndex":ci}]);
		})
		// 列表上右键菜单
		.bind('contextmenu', function(e) {
			td = e.target;
			ptr = $(td,that.rows).closest("tr.jqgrow");
			if($(ptr).length === 0 ){return;}
			if(!that.options.multiselect) {	$(that.element).grid("setSelection",ptr[0].id,true,e);	}
			ri = ptr[0].rowIndex;
			ci = $.grid.getCellIndex(td);
			that._trigger("onRightClickRow",null,[{"rowId":ptr[0].id,"rowIndex":ri,"cellIndex":ci}]);
			//$(that).triggerHandler("gridRightClickRow", [$(ptr).attr("id"),ri,ci,e]);
			//if ($.isFunction(this.options.onRightClickRow)) { that.options.onRightClickRow.call(ts,$(ptr).attr("id"),ri,ci, e); }
		});
		// 监听鼠标移动
		$(grid.columnsView).mousemove(function (e) {
			// 如果grid列被鼠标按下，则resizing为true，当鼠标移动时调用grid的dragMove方法
			if(grid.resizing){grid.dragMove(e);return false;}
		});
		$(".coral-grid-labels",grid.columnsView).bind("selectstart", function () { return false; });
		// 监听鼠标释放
		$(document).mouseup(function () {
			// 如果grid列被鼠标按下，则resizing为true，当鼠标释放时调用grid的dragEnd方法
			if(grid.resizing) {	grid.dragEnd(); return false;}
			return true;
		});
		// 自定义分页条事件
		this._off($(".coral-paginator-page"));
		this._on({
			"click.coral-paginator-page" : function(e) {
				var cp = that._intNum($(e.target).html(),1);
				that.options.page= cp;
				if(!that._clearVals(this.id)) { return false; }
				that._populate();
				return false;
			}
		});
	},
	selectMultikey:function(that,e,rowId){
		var td = e.target;
		var	scb = $(td).hasClass("cbox");
		if(that.options.multiselect && that.options.multiboxonly) {
			if(scb){$(that.element).grid("setSelection",rowId,true,e);}
			else {
				var frz = that.options.frozenColumns ? that.options.id+"_frozen" : "";
				if(that.options.clickRowToSelect){
					$(that.options.selarrrow).each(function(i,n){
						var ind = that.rows.namedItem(n);
						$(ind).removeClass("coral-state-highlight");
						$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(n))[that.options.useProp ? 'prop': 'attr']("checked", false);
						if(frz) {
							$("#"+$.grid.coralID(n), "#"+$.grid.coralID(frz)).removeClass("coral-state-highlight");
							$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(n), "#"+$.grid.coralID(frz))[that.options.useProp ? 'prop': 'attr']("checked", false);
						}
					});
					that.options.selarrrow = [];
					$(that.element).grid("setSelection",rowId,true,e);
				}
			}
		} else {
			//点击复选框的时候触发选中事件
			if (scb || that.options.clickRowToSelect) {
				$(that.element).grid("setSelection",rowId,true,e);
			}
		}
	},
	restoreAll: function(){
		if ( this.options.editableRows ) {
			this.restoreRow( this.options.editrow );
			if ( this.rowEditButtons ) {
				this.rowEditButtons.remove();
			}
		}
		if ( this.options.savedRow.length > 0 ) {
			// save the cell
			// TODO: 遍历还原
			if( !$(this.element).grid("saveCell",this.options.savedRow[0].id,this.options.savedRow[0].ic) ){
				return;
			}
		}
	},
	setSelectAll: function(checked){
		var that = this,pt,intNumber,
			isPicgrid = (this.options.model === "card");
		if(isPicgrid){
			pt = that.element.find(".coral-pic>li");
		}else{
			pt = that.rows;
		}
		if(this.options.multiselect){
			var emp=[], chk;
			var froz = that.options.frozenColumns === true ? that.options.id + "_frozen" : "";
			if (checked) {
				$(pt).each(function(i) {
					intNumber = isPicgrid ? i >= 0 : i>0;
					if (intNumber > 0) {
						if(!$(this).hasClass("coral-subgrid") && !$(this).hasClass("jqgroup") && !$(this).hasClass('coral-state-disabled')){
							// 全选后已经选中的行不再处理。
							var ia = $.inArray(this.id, that.options.selarrrow);
							if (ia === -1) {
								if(isPicgrid){
									$(pt).find("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(this.id) )[that.options.useProp ? 'prop': 'attr']("checked",true);
									$(pt).find(".rowgrid").addClass("coral-state-highlight").attr("aria-selected","true")
								}else{
									$(pt).find("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(this.id) )[that.options.useProp ? 'prop': 'attr']("checked",true);
									that._setHeadCheckBox( true );
									$(this).addClass("coral-state-highlight").attr("aria-selected","true");  
									if (froz) {
										$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv )[that.options.useProp ? 'prop': 'attr']("checked",true);
										$("#"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv).addClass("coral-state-highlight");
										if (that.grid.fhDiv) {
											$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv )[that.options.useProp ? 'prop': 'attr']("checked",true);
											$("#"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv).addClass("coral-state-highlight");
										} else if (that.grid.rightfhDiv) {
											$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(that.rows[i].id), that.grid.rightfbDiv )[that.options.useProp ? 'prop': 'attr']("checked",true);
											$("#"+$.grid.coralID(that.rows[i].id), that.grid.rightfbDiv).addClass("coral-state-highlight");
										}								
									}
								}
								that.options.selarrrow.push(this.id);
								that.options.selrow = this.id;
							}
						}
					}
				});
				chk=true;
				emp=[];
			}
			else {
				that.options.selarrrow = [];
				$(pt).each(function(i) {
					intNumber = isPicgrid ? i >= 0 : i>0;
					if(intNumber) {
						if(!$(this).hasClass("coral-subgrid") && !$(this).hasClass('coral-state-disabled')){
							if(isPicgrid){ 
								$(pt).find("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(this.id) )[that.options.useProp ? 'prop': 'attr']("checked",false);
								$(pt).find(".rowgrid").removeClass("coral-state-highlight").attr("aria-selected","false")
							}else{
								$(pt).find("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(this.id) )[that.options.useProp ? 'prop': 'attr']("checked", false);
								that._setHeadCheckBox( false );
								$(this).removeClass("coral-state-highlight").attr("aria-selected","false");
								if(froz) {
									if (that.grid.fhDiv) {
										$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv )[that.options.useProp ? 'prop': 'attr']("checked",false);
										$("#"+$.grid.coralID(that.rows[i].id), that.grid.fbDiv).removeClass("coral-state-highlight");
									} else if (that.grid.rightfhDiv) {
										$("#jqg_"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(that.rows[i].id), that.grid.rightfbDiv )[that.options.useProp ? 'prop': 'attr']("checked",false);
										$("#"+$.grid.coralID(that.rows[i].id), that.grid.rightfbDiv).removeClass("coral-state-highlight");
									}
								}
							}
							emp.push(this.id);
						}
					}
				});
				that.options.selrow = null;
				chk=false;
			}
			that._trigger("onSelectAll",null,[{'aRowIds':chk ? that.options.selarrrow :emp, 'status':chk}]);
		}
	},
	_setMultiselect: function(){
		var that = this;
		if(this.options.multiselect) {
			var emp=[], chk;
			$('#cb_'+$.grid.coralID(that.options.id),this.grid.columnsView).bind('click',function(e){
				// 冻结列
				that.setSelectAll(this.checked);
				//$(that).triggerHandler("gridSelectAll", [chk ? that.options.selarrrow : emp, chk]);
				//if($.isFunction(that.options.onSelectAll)) {that.options.onSelectAll.call(that, chk ? that.options.selarrrow : emp,chk);}
			});
		}
	},
	_refresh: function( key, value ){
		
	},
	reload: function(url){
		
		var that = this,
			grid = this.grid,
			opts = {},
	        isUrl = false,
	        data = [];
		
		if (typeof(url) === "undefined") {
			url = this.options.orgdatatype === "json"?this.options.url:this.options.data;
		}
		if (!url && !this.options.url) {
			url = [];
		} else if (!url && this.options.url) {
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
		    	data = this.options.data;
		    } else if ( !opts.url && !opts.data && this.options.url ) {
		    	url = this.options.url ;
		    	isUrl = true;
		    }
		} else {
			isUrl = true;
		}
		
		if(that.options.treeGrid ===true) {	that.options.datatype = that.options.treedatatype;}
		if (opts && opts.current) {
			that.grid.selectionPreserver(that);
		}
		if (that.options.datatype=="local") {
			$(that.element).grid("resetSelection");  
			if (that.options.data.length) { 
				that.normalizeData();
				that.refreshIndex();
			} 
		} else if(!that.options.treeGrid) {
			that.options.selrow=null;
			if(that.options.multiselect) {that.options.selarrrow =[];that._setHeadCheckBox(false);}
			that.options.savedRow = [];
		}
		if(that.options.scroll) {emptyRows(that.grid.rowsView,true, false);}
		
		if (opts && opts.page) {
			var page = opts.page;
			if (page > that.options.lastpage) { page = that.options.lastpage; }
			if (page < 1) { page = 1; }
			that.options.page = page;
			if (that.grid.prevRowHeight) {
				that.grid.rowsView.scrollTop = (page - 1) * that.grid.prevRowHeight * that.options.rowNum;
			} else {
				that.grid.rowsView.scrollTop = 0;
			}
		}
		if (that.grid.prevRowHeight && that.options.scroll) {
			delete that.options.lastpage;
			that._populateVisible();
		} else {
			var search = that.options.search;
			// 本地搜索的时候
			if (that.options.localonce == true) {
				that.options.search = true;
			} else {
				//后台排序的时候不进行filter过滤
				//that.options.search = false;
				if (!isUrl) {
					that.options.datatype = "local";
					delete that.options.orgdatatype;
					that.options.data = data;
				} else {
					that.options.datatype = "json";
					delete that.options.orgdatatype;
					that.options.url = url;
				}
			}
			// 如果是data模式的reload，则设置localonce为true，临时改变datatype。
			that._populate();
			that.options.search = search;
			that.options.localonce = false;
		}
		return false;
	},
	/**
	 * 如果有右浮动列，重置窗体或者重置表格宽度的时候都需要调用此方法来判断是否需要显示右浮动
	 */
	resetFrozen: function(){
		if ( !this._hasHorizontalScrollBar() ) {
			$(this.grid.rightfbDiv).hide();
			$(this.grid.rightfhDiv).hide();
		} else {
			$(this.grid.rightfbDiv).show();
			$(this.grid.rightfhDiv).show();
		}
	},
	refresh: function(opts){	
		var maxHeight,
			that = this,
			options = this.options,
			fitStyle = options.fitStyle,
			parent = this.element.parent();
			maxHeight = parent.height();
		
		that.resetFrozen();
		this.element.siblings( ":visible" ).each(function() {
			var elem = $( this ),
				position = elem.css( "position" );

			if ( position === "absolute" || position === "fixed" ) {
				return;
			}
			maxHeight -= elem.outerHeight( true );
		});
		//setTimeout(function(){
		// 某些动画情况下，grid可能已经被销毁，
		// 但是还是调用了grid的refresh方法，或者去掉延时解决问题；
		// 不能直接用element，因为内存中有此对象，但是dom中没有，所以需要根据id去重新查找；
		if ( !$("#"+that.element[0].id).length ) return;
		if ( fitStyle === "fill" ) {
			$.coral.fitParent(this.component(), true);
			$(that.element).grid("option", "height", maxHeight);
			$(that.element).grid("option", "width", that.element.innerWidth()>0?that.element.innerWidth(): 0);
		} else if ( fitStyle === "width" ) {
			$.coral.fitParent(this.component(), false);//解决noscroll的问题
			$(that.element).grid("option", "width", that.element.innerWidth()>0?that.element.innerWidth(): 0);
			$(that.element).grid("option", "height", that.options.height);
		} else if ( fitStyle === "height" ) {
			$.coral.fitParent(this.component(), true);
			$(that.element).grid("option", "height", maxHeight);
		} else if ( fitStyle === "auto" ) {
			//TODO: so far no extension
			$.coral.fitParent(this.component(), false);//解决noscroll的问题
			$(that.element).grid("option", "height", that.options.height);
		}
		that.refreshPager();
		that._noRecordsTipsPositon();
		if ( that.options.frozenColumns === true ) {
			that.resizeFrozen();
		}
		if ( this.element.find(".loading-overlay").length ) {
			switch(this.options.loadui) {
			case "disable":
				break;
			case "enable":
			case "block":
				$(this.element).loading("refresh");
				break;
			}
		}
		//$.coral.refreshAllComponent(this.element);
	},
	refreshPager: function(){
		var that = this;
		if(this.pagers){
			this.pagers.each(function(i){
				var pagerleftwidth = $( ".paginator-left", that.element ).outerWidth() + 5;//padding 5px;
				var pagerwidth = $("#"+that.pagers[i].id ).width();
				$( ".toolbarpanel", that.element ).css({
					left: pagerleftwidth+"px",
					position: "absolute",
					top: 0,
					width: ( pagerwidth - pagerleftwidth ) + "px"
				});
			});
			that.options.pager = "."+that.id;
			if ( $( ".ctrl-init-toolbar", that.element ).length ) {
				$( ".ctrl-init-toolbar", that.element ).toolbar("refresh");
			}
		}
	},
	setSelectionAll: function() {
		if ( !$( "#cb_"+this.options.id ).prop("checked") ) {
			$( "#cb_"+this.options.id ).trigger('click');
		}
	},
	setSelection: function(selection,onsr, e) {
		var that = this, stat,//行选中状态值 true 或 false
			isPicgrid = (this.options.model === "card"),
			pt, ner, ia, tpsr, fid;
		if(selection === undefined) { return; }
		onsr = onsr === false ? false : true;
		if(isPicgrid){
			pt = this.element.find(".coral-pic #" + selection)[0];
		}else{
			pt = this.rows.namedItem(selection + "");
		}
		if(!pt || !pt.className || pt.className.indexOf( 'coral-state-disabled' ) > -1 ) { return; }
		// scroll grid
		function scrGrid(iR){
			var ch = $(that.grid.rowsView)[0].clientHeight,
				st = $(that.grid.rowsView)[0].scrollTop,
				rpos = that.rows[iR].offsetTop,
				rh = that.rows[iR].clientHeight;
			if(rpos+rh >= ch+st) { $(that.grid.rowsView)[0].scrollTop = rpos-(ch+st)+rh+st; }
			else if(rpos < ch+st) {
				if(rpos < st) {
					$(that.grid.rowsView)[0].scrollTop = rpos;
				}
			}
		}
		if(this.options.scrollrows === true) {//处理滚动刷新
			ner = this.rows.namedItem(selection).rowIndex;
			if(ner >= 0 ){
				scrGrid(ner);
			}
		}
		if(this.options.frozenColumns === true ) {
			fid = this.options.id+"_frozen";
		}
		if(!this.options.multiselect) {	
			if(pt.className !== "coral-subgrid") {
				if( this.options.selrow != pt.id) {//是否二次点击
					if(isPicgrid){
						this.element.find("#"+this.options.selrow+">ul").removeClass("coral-state-highlight").attr({"aria-selected":"false", "tabindex" : "-1"});
						$(pt).find(".rowgrid").addClass("coral-state-highlight").attr({"aria-selected":"true", "tabindex" : "0"});//.focus();
						if(fid) {
							$("#"+$.grid.coralID(this.options.selrow), "#"+$.grid.coralID(fid)).find(".rowgrid").removeClass("coral-state-highlight");
							$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).find(".rowgrid").addClass("coral-state-highlight");
						}
					}else{
						$(this.rows.namedItem(this.options.selrow)).removeClass("coral-state-highlight ").attr({"aria-selected":"false", "tabindex" : "-1"});
						$(pt).addClass("coral-state-highlight").attr({"aria-selected":"true", "tabindex" : "0"});//.focus();
						if(fid) {
							$("#"+$.grid.coralID(this.options.selrow), "#"+$.grid.coralID(fid)).removeClass("coral-state-highlight");
							$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).addClass("coral-state-highlight ");
						}
					}
					
					stat = true;
					$("#jqg_"+$.grid.coralID(this.options.id)+"_"+$.grid.coralID(pt.id),$(pt))[this.options.useProp ? 'prop': 'attr']("checked",stat);
					if(fid) {
						$("#jqg_"+$.grid.coralID(this.options.id)+"_"+$.grid.coralID(selection), "#"+$.grid.coralID(fid))[this.options.useProp ? 'prop': 'attr']("checked",stat);
					}
				} else {
					stat = false;
				}
				this.options.selrow = pt.id;

				//如果onsr为true则触发回调函数
				if(onsr)this._trigger("onSelectRow", e, [{'rowId':pt.id, 'status':stat}]);
				/*$(that).triggerHandler("gridSelectRow", [pt.id, stat, e]);
				if( that.options.onselectrow && onsr) { that.options.onselectrow.call(that, pt.id, stat, e); }*/
			}
		} else {
			//unselect selectall checkbox when deselecting a specific row
			this._setHeadCheckBox( false );
			this.options.selrow = pt.id;
			ia = $.inArray(this.options.selrow,this.options.selarrrow);
			if (  ia === -1 ){
				if(isPicgrid) {
					if(pt.className !== "coral-subgrid") { $(pt).find(".rowgrid").addClass("coral-state-highlight").attr("aria-selected","true");}
				}else {
					if(pt.className !== "coral-subgrid") { $(pt).addClass("coral-state-highlight").attr("aria-selected","true");}
				}
				stat = true;
				this.options.selarrrow.push(this.options.selrow);
			} else {
				if(isPicgrid){
					if(pt.className !== "coral-subgrid") { $(pt).find(".rowgrid").removeClass("coral-state-highlight").attr("aria-selected","false");}
				}else{
					if(pt.className !== "coral-subgrid") { $(pt).removeClass("coral-state-highlight").attr("aria-selected","false");}
				}
				stat = false;
				this.options.selarrrow.splice(ia,1);
				tpsr = this.options.selarrrow[0];
				this.options.selrow = (tpsr === undefined) ? null : tpsr;
			}
			// 如果选中所有行，则设置head checkbox 选中。
			if ( this.rows.length - 1 === this.options.selarrrow.length ) {
				this._setHeadCheckBox( true );
			}
			//此处修改 在$(pt)下寻找checkbox，因为大图列表和table列表中checkbox的id相同
			$("#jqg_"+$.grid.coralID(this.options.id)+"_"+$.grid.coralID(pt.id),$(pt))[this.options.useProp ? 'prop': 'attr']("checked",stat);
			if(fid) {
				if(isPicgrid){
					if(ia === -1) {
						$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).find(".rowgrid").addClass("coral-state-highlight");
					} else {
						$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).find(".rowgrid").removeClass("coral-state-highlight");
					}
				}else{
					if(ia === -1) {
						$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).addClass("coral-state-highlight");
					} else {
						$("#"+$.grid.coralID(selection), "#"+$.grid.coralID(fid)).removeClass("coral-state-highlight");
					}
				}
				
				$("#jqg_"+$.grid.coralID(this.options.id)+"_"+$.grid.coralID(selection), "#"+$.grid.coralID(fid))[this.options.useProp ? 'prop': 'attr']("checked",stat);
			}			
			if( onsr) { 
				this._trigger("onSelectRow", e, [{'rowId':pt.id, 'status':stat}]);
			}
		}
	},
	_setHeadCheckBox: function ( checked ) {
		var that = this;
		$('#cb_'+$.grid.coralID(that.options.id),that.grid.columnsView)[that.options.useProp ? 'prop': 'attr']("checked", checked);
		var fid = that.options.frozenColumns ? that.options.id+"_frozen" : "";
		if(fid) {
			$('#cb_'+$.grid.coralID(that.options.id),that.grid.fhDiv)[that.options.useProp ? 'prop': 'attr']("checked", checked);
		}
	},
	setFrozenRows: function(rowNum){
		var that = this,
			grid = that.grid;
		that.destroyFrozenRows();
		that.rowsView2=$(grid.rowsView);
		if(!that.rowsView2.children("table.coral-grid-btable-frozen").length){
			//that.rowsView1.add(that.rowsView2).prepend("<table class=\"datagrid-btable datagrid-btable-frozen\" cellspacing=\"0\" cellpadding=\"0\"></table>");
			$(that.rowsView2).prepend("<table class=\"coral-grid-btable-frozen\" cellspacing=\"0\" cellpadding=\"0\"></table>");
			that.rowsView2.children("table.coral-grid-btable-frozen").css({
				position: "absolute",
				left: 0,
				top: $(grid.columnsView).height()+"px"
			});
		}
		var vh = that.element.find(".coral-grid-rows-view").height();
		//doWithFrozen(true);
		doWithFirstRow(false);
		doWithFrozen(false);
		var fh = that.rowsView2.find("table.coral-grid-btable-frozen").outerHeight();
		that.rowsView2.css({
			"margin-top": fh+"px",
			"height": (vh - fh)+"px"
		});
		//初始化横向
		that.rowsView2.find(".coral-grid-btable-frozen").css({
			'left':-$(grid.rowsView)[0].scrollLeft+"px",
			'width':that.rowsView2.find(".coral-grid-btable").width()+"px",
			'table-layout':'fixed'//处理safari and chrome浏览器的bug问题
		});
		function doWithFirstRow(isFirst){
			var tr=that.rowsView2.find(".coral-grid-btable")[0].rows[0];
			(isFirst?that.rowsView1:that.rowsView2).children("table.coral-grid-btable-frozen").append($(tr).clone());
		}
		function doWithFrozen(isFirst){
			var trs=that.rowsView2.find(".coral-grid-btable tr").filter(function(i){
				if(i==0){
					return false;
				}
				if(i<=rowNum) return true;
			});
			var tr=that.rowsView2.find(".coral-grid-btable")[0].rows[1];
			(isFirst?that.rowsView1:that.rowsView2).children("table.coral-grid-btable-frozen").append(trs);
		}
	},
	destroyFrozenRows: function(){
		var that = this,
			grid = that.grid;
		
		that.rowsView2=$(grid.rowsView);
		if(!that.rowsView2.children("table.coral-grid-btable-frozen").length){
			//that.rowsView1.add(that.rowsView2).prepend("<table class=\"datagrid-btable datagrid-btable-frozen\" cellspacing=\"0\" cellpadding=\"0\"></table>");
			$(that.rowsView2).prepend("<table class=\"coral-grid-btable-frozen\" cellspacing=\"0\" cellpadding=\"0\"></table>");
			that.rowsView2.children("table.coral-grid-btable-frozen").css({
				position: "absolute",
				left: 0,
				top: 0
			});
		}
		var vh = that.element.find(".coral-grid-rows-view").height();
		var fh = that.rowsView2.find("table.coral-grid-btable-frozen").outerHeight();
		//doWidthFrozen(true);
		doWidthFrozen(false);
		doWidthFirstRow(false);
		that.rowsView2.css({
			"margin-top": 0,
			"height": (vh+fh)+"px"
		});
		//_21(_43);
		function doWidthFrozen(isFirst){
			var rows = that.rowsView2.find("table.coral-grid-btable-frozen tr").filter(function(i){
				if(i==0){
					return false;
				}
				return true;
			});
			var row1 = (isFirst?that.rowsView1:that.rowsView2).children("table.coral-grid-btable-frozen")[0].rows[1];
			$(that.rowsView2.find(".coral-grid-btable tbody:first tr:first")[0]).after(rows);
		}
		function doWidthFirstRow(isFirst){
			(isFirst?that.rowsView1:that.rowsView2).children("table.coral-grid-btable-frozen").remove();
		}
		
	},
	showHideCol : function(colname,show) {
		var that = this, fndh=false, brd=$.support.boxSizing? 0: this._intNum(this.options.cellLayout,0), cw;
		if (!that.grid ) {return;}
		if( typeof colname === 'string') {colname=[colname];}
		show = show != "none" ? "" : "none";
		var sw = show === "" ? true :false,
		gh = that.options.groupHeader && (typeof that.options.groupHeader === 'object' || $.isFunction(that.options.groupHeader) );
		if(gh) { $(that.element).grid('destroyGroupHeader', false); }
		$(this.options.colModel).each(function(i) {
			if ($.inArray(this.name,colname) !== -1 && this.hidden === sw) {
				if(that.options.frozenColumns === true && this.frozen === true) {
					//return true;
				}
				$("tr",that.grid.columnsView).each(function(){
					$(this.cells[i]).css("display", show);
				});
				$(that.rows).each(function(){
					if (!$(this).hasClass("jqgroup")) {
						$(this.cells[i]).css("display", show);
					}
				});
				if(that.options.footerrow) { $("tr.footrow td:eq("+i+")", that.grid.sDiv).css("display", show); }
				cw = this.widthOrg? this.widthOrg: parseInt(this.width,10);
				if ( show === "none" ) {
					that.options.tblwidth -= cw+brd;
				} else {
					that.options.tblwidth += cw+brd;
				}
				this.hidden = !sw;
				fndh=true;
				that._trigger("onShowHideCol", null,[{"show":sw,"name":this.name,"index":i}]);
			}
		});
		if(fndh===true) {
			if ( that.options.shrinkToFit === true && !isNaN( that.options.height ) ) { 
				that.options.tblwidth += parseInt( that.options.scrollOffset, 10 );
			}
			that._setGridWidth(that.options.shrinkToFit === true ? that.options.tblwidth : that.options.width );
		}
		if( gh )  {
			$(that.element).grid('setGroupHeaders',that.options.groupHeader);
		}
	},
	hideCol : function (colname) {
		return $(this.element).grid("showHideCol",colname,"none");
	},
	showCol : function(colname) {
		return $(this.element).grid("showHideCol",colname,"");
	},
	remapColumns : function(permutation, updateCells, keepHeader){
		function resortArray(a) {
			var ac;
			if (a.length) {
				ac = $.makeArray(a);
			} else {
				ac = $.extend({}, a);
			}
			$.each(permutation, function(i) {
				a[i] = ac[this];
			});
		}
		var that = this;
		function resortRows(parent, clobj) {
			$(">tr"+(clobj||""), parent).each(function() {
				var row = this;
				var elems = $.makeArray(row.cells);
				$.each(permutation, function() {
					var e = elems[this];
					if (e) {
						row.appendChild(e);
					}
				});
			});
		}
		resortArray(that.options.colModel);
		resortArray(that.options.colNames);
		resortArray(that.grid.headers);
		resortRows($("thead:first", that.grid.columnsView), keepHeader && ":not(.coral-grid-labels)");
		if (updateCells) {
			resortRows($("#"+$.grid.coralID(that.options.id)+" tbody:first"), ".jqgfirstrow, tr.jqgrow, tr.jqfoot");
		}
		if (that.options.footerrow) {
			resortRows($("tbody:first", that.grid.sDiv));
		}
		if (that.options.remapColumns) {
			if (!that.options.remapColumns.length){
				that.options.remapColumns = $.makeArray(permutation);
			} else {
				resortArray(that.options.remapColumns);
			}
		}
		that.options.lastsort = $.inArray(that.options.lastsort, permutation);
		if(that.options.treeGrid) { that.options.expColInd = $.inArray(that.options.expColInd, permutation); }
		//$(that).triggerHandler("gridRemapColumns", [permutation, updateCells, keepHeader]);
	},
	sortableColumns : function (tblrow){

		var that = this, tid= $.grid.coralID( that.options.id );
		function start() {that.options.disableClick = true;}
		var sortable_opts = {
			"tolerance" : "pointer",
			"axis" : "x",
			"cancel" : ".coral-columnSortable-disabled",
			"scrollSensitivity": "1",
			/*"helper":"clone",*/
			helper: function(event, currentItem) {
                return currentItem.clone();
            },
			"items": '>th:not(:has(#jqgh_'+tid+'_cb'+',#jqgh_'+tid+'_rn'+',#jqgh_'+tid+'_subgrid),:hidden, .coral-columnSortable-disabled)',
			"placeholder": {
				element: function(item) {
					var rowspan = typeof(item.attr("rowspan"))=="undefined"?"1":"2",
						colspan = typeof(item.attr("colspan"))=="undefined"?"1":"2";
					var el = $(document.createElement(item[0].nodeName))
					.addClass(item[0].className+" coral-sortable-placeholder coral-state-highlight")
					.removeClass("coral-sortable-helper").attr("rowspan",rowspan).attr("colspan",colspan)[0];
					return el;
				},
				update: function(self, options) {
					options.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10));
					//options.height($(self.currentItem).outerHeight());
					options.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10));
				}
			},
			"update": function(event, ui) {
				var p = $(ui.item).parent(),
				th = $(">th", p),
				colModel = that.options.colModel,
				cmMap = {}, tid= that.options.id+"_";
				ui.itemId = [];
				$.each(colModel, function(i) { cmMap[this.name]=i; });
				var permutation = [];//需要置换的数组
				var permutationId = [];
				// 分组之后暂时无法处理
				th.each(function() {
					var id = $(">div", this).get(0).id.replace(/^jqgh_/, "").replace(tid,"");
						if (id in cmMap) {
							permutation.push(cmMap[id]);
							permutationId.push(id);
						}
				});
				$.each(ui.item, function(i){
					ui.itemId.push(ui.item[i].id.replace(/^jqgh_/, "").replace(tid,""));
				});
				ui.prevItemId = $(ui.item[0]).prev("th").attr("id").replace(/^jqgh_/, "").replace(tid,"");
				ui.nextItemId = $(ui.item[0]).next("th").attr("id").replace(/^jqgh_/, "").replace(tid,"");
				ui.targetId = ui.position.left>ui.originalPosition.left?ui.prevItemId:ui.nextItemId;
				
				$(that.element).grid("remapColumns",permutation, true, true);
				ui.permutation = permutation;
				ui.permutationOfId = permutationId;
				that._trigger("onSortableColumns",event,[ui]);
				setTimeout(function(){that.options.disableClick=false;}, 50);
			}
		};
		/*if (that.options.sortableColumns.options) {
			$.extend(sortable_opts, that.options.sortableColumns.options);
		} else if ($.isFunction(that.options.sortableColumns)) {
			that.options.sortableColumns = { "update" : that.options.sortableColumns };
		}*/
		$.extend(sortable_opts, that.options.sortableColumnsOptions);
		if (sortable_opts.beforesortablecolumns) {
			var s = sortable_opts.beforesortablecolumns;
			sortable_opts.start = function(e,ui) {
				start();
				s.call(this,e,ui);
			};
		} else {
			sortable_opts.start = start;
		}
		if (that.options.sortableColumnsOptions.exclude) {
			sortable_opts.items += ":not("+that.options.sortableColumnsOptions.exclude+")";
		}
		tblrow.sortable(sortable_opts).data("sortable").floating = true;
		/*});*/
	},
	setCaption : function (newcap){
		this.options.caption=newcap;
		$("span.coral-grid-title, span.coral-grid-title-rtl",this.grid.caption).html(newcap);
		$(this.grid.cDiv).show();
	},
	setLabel : function(colname, nData, prop, attrp ){
		var that = this, pos=-1;
		if(!that.grid) {return;}
		if(typeof(colname) != "undefined") {
			$(that.options.colModel).each(function(i){
				if (this.name == colname) {
					pos = i;return false;
				}
			});
		} else { return; }
		if(pos>=0) {
			var thecol = $("tr.coral-grid-labels th:eq("+pos+")",that.grid.columnsViews);
			if (nData){
				var ico = $(".s-ico",thecol);
				$("[id^=jqgh_]",thecol).empty().html(nData).append(ico);
				that.options.colNames[pos] = nData;
			}
			if (prop) {
				if(typeof prop === 'string') {$(thecol).addClass(prop);} else {$(thecol).css(prop);}
			}
			if(typeof attrp === 'object') {$(thecol).attr(attrp);}
		}
	},
	setCell: function(rowid,colname,nData,cssp,attrp, forceupd) {
		var that = this, pos =-1,v, title;
		if(!that.grid) {return;}
		if(isNaN(colname)) {
			$(that.options.colModel).each(function(i){
				if (this.name == colname) {
					pos = i;return false;
				}
			});
		} else {pos = parseInt(colname,10);}
		if (pos >= 0) {
			var ind = that.rows.namedItem(rowid);
			var rwd = $(that.element).grid("getRowData",rowid);
			if (ind){
				var tcell = $("td:eq("+pos+")",ind);
				if(nData !== "" || forceupd === true) {
					v = that._formatter(rowid, nData, pos,rwd,'edit');
					title = that.options.colModel[pos].title ? {"title":$.grid.stripHtml(v)} : {};
					if(that.options.treeGrid && $(".tree-wrap",$(tcell)).length>0) {
						$("span",$(tcell)).html(v).attr(title);
					} else {
						$(tcell).html(v).attr(title);
					}
					$.fn.afterFmatter.call(that);
					if(that.options.datatype == "local") {
						var cm = that.options.colModel[pos], index;
						/*var _fn = $.coral.toFunction(cm.formatter);
						if($.isFunction(_fn)){
							nData = _fn.apply( this.element[0]);
						}else{
							//nData = cm.formatter && typeof(cm.formatter) === 'string' && cm.formatter == 'date' ? $.unformat.date.call(that,nData,cm) : nData;
							nData = nData;
						}*/
						index = that.options._index[rowid];
						if(typeof index  != "undefined") {
							that.options.data[index][cm.name] = nData;
						}
					}
				}
				if(typeof cssp === 'string'){
					$(tcell).addClass(cssp);
				} else if(cssp) {
					$(tcell).css(cssp);
				}
				if(typeof attrp === 'object') {$(tcell).attr(attrp);}
			}
		}
	},
	sortableDisable : function(){
		$("tbody:first",this.grid.rowsView).sortable("disable");
	},
	sortableEnable : function(){
		$("tbody:first",this.grid.rowsView).sortable("enable");
	},
	getCell : function(rowid,col) {
		var ret = false;
		var $t=this, pos=-1;
		if(!$t.grid) {return;}
		if(isNaN(col)) {
			$($t.options.colModel).each(function(i){
				if (this.name === col) {
					pos = i;return false;
				}
			});
		} else {pos = parseInt(col,10);}
		if(pos>=0) {
			var ind = $t.rows.namedItem(rowid);
			if(ind) {
				try {
					if($t.options.enableHighlight == true) {
						ret = $.unformat.call($t,$("td:eq("+pos+")",ind),{rowId:ind.id, colModel:$t.options.colModel[pos]},pos,true);
					} else {
						ret = $.unformat.call($t,$("td:eq("+pos+")",ind),{rowId:ind.id, colModel:$t.options.colModel[pos]},pos);
					}
				} catch (e){
					ret = $.grid.htmlDecode($("td:eq("+pos+")",ind).html());
				}
			}
		}
		return ret;
	},
	getCol : function (col, obj, mathopr) {
		var ret = [], val, sum=0, min, max, v;
		obj = typeof (obj) != 'boolean' ? false : obj;
		if(typeof mathopr == 'undefined') { mathopr = false; }
		var $t=this, pos=-1;
		if(!$t.grid) {return;}
		if(isNaN(col)) {
			$($t.options.colModel).each(function(i){
				if ($t.options.colModel[i].name === col) {
					pos = i;return false;
				}
			});
		} else {pos = parseInt(col,10);}
		if(pos>=0) {
			var ln = $t.rows.length, i =0;
			if (ln && ln>0){
				while(i<ln){
					if($($t.rows[i]).hasClass('jqgrow')) {
						try {
							if($t.options.enableHighlight == true){
								val = $.unformat.call($t,$($t.rows[i].cells[pos]),{rowId:$t.rows[i].id, colModel:$t.options.colModel[pos]},pos,true);
							}else{
								val = $.unformat.call($t,$($t.rows[i].cells[pos]),{rowId:$t.rows[i].id, colModel:$t.options.colModel[pos]},pos);
							}
						} catch (e) {
							val = $.grid.htmlDecode($t.rows[i].cells[pos].innerHTML);
						}
						if(mathopr) {
							v = parseFloat(val);
							sum += v;
							if(i===0) {
								min = v;
								max = v;
							} else {
								min = Math.min(min, v);
								max = Math.max(max, v);
							}
						}
						else if(obj) { ret.push( {id:$t.rows[i].id,value:val} ); }
						else { ret.push( val ); }
					}
					i++;
				}
				if(mathopr) {
					switch(mathopr.toLowerCase()){
						case 'sum': ret =sum; break;
						case 'avg': ret = sum/ln; break;
						case 'count': ret = ln; break;
						case 'min': ret = min; break;
						case 'max': ret = max; break;
					}
				}
			}
		}
		return ret;
	},
	getCellComponent : function(rowid,colname,nData,cssp,attrp, forceupd) {
		var that = this, pos =-1,v, title;
		if(!that.grid) {return;}
		/*if(isNaN(colname)) {
			$(that.options.colModel).each(function(i){
				if (this.name == colname) {
					pos = i;return false;
				}
			});
		} else {pos = parseInt(colname,10);}
		if(pos>=0) {
			var ind = that.rows.namedItem(rowid);
			if (ind){
				var tcell = $("td:eq("+pos+")",ind);
				return tcell.find(".ctrl-init");
			}
		}*/
		return this.element.find("#"+rowid).find('[aria-describedby$='+colname+']').find('.ctrl-init');
	},
	_formatter: function (rowId, _cellVal , colpos, rwdat, _act){
		var cm = this.options.colModel[colpos],v;
		if(typeof cm.formatter !== 'undefined') {
			var opts= {rowId: rowId, colModel:cm, gid:this.options.id, pos:colpos ,model:this.options.model};
			var _fn = $.coral.toFunction(cm.formatter);
			if($.isFunction(_fn)){
				v = _fn.apply( this.element[0], [_cellVal,opts,rwdat,_act]);
			} else if($.fmatter){
				v = $.fn.fmatter.call(this,cm.formatter,_cellVal,opts,rwdat,_act);
			} else {
				v = this._cellVal(_cellVal);
			}
		} else {
			v = this._cellVal(_cellVal);
		}
		return v;
	},
	_getOffset: function (iCol) {
		var that = this;
	//	var i, ret = {}, brd1 = isSafari ? 0 : that.options.cellLayout;
		var i, ret = {}, brd1 = $.support.boxSizing ? 0 : that.options.cellLayout;
		ret[0] =  ret[1] = ret[2] = 0;
		for(i=0;i<=iCol;i++){
			if(that.options.colModel[i].hidden === false||typeof(that.options.colModel[i].hidden)== 'undefined' ) {
				ret[0] += that.options.colModel[i].width+brd1;
			}
		}
		//if(that.options.direction=="rtl") { ret[0] = that.options.width - ret[0]; }
		ret[0] = ret[0] - that.grid.rowsView.scrollLeft;
		//if($(that.grid.cDiv).is(":visible")) {ret[1] += $(that.grid.cDiv).height() +parseInt($(that.grid.cDiv).css("padding-top"),10)+parseInt($(that.grid.cDiv).css("padding-bottom"),10);}
		//if(that.options.toolbar[0]===true && (that.options.toolbar[1]=='top' || that.options.toolbar[1]=='both')) {ret[1] += $(that.grid.uDiv).height()+parseInt($(that.grid.uDiv).css("border-top-width"),10)+parseInt($(that.grid.uDiv).css("border-bottom-width"),10);}
		//if(that.options.toppager) {ret[1] += $(that.grid.topDiv).height()+parseInt($(that.grid.topDiv).css("border-bottom-width"),10);}
		ret[2] += $(that.grid.rowsView).height() + $(that.grid.columnsView).height();
		return ret;
	},
	_sortData: function (index, idxcol,reload,sor,obj){
		var that = this;
		if(!this.options.colModel[idxcol].sortable) { return; }
		that.options.b_sortdata = true; // modify for custom sort
		var so;
		if(this.options.savedRow.length > 0) {return;}
		if(!reload) {
			if( this.options.lastsort == idxcol ) {
				if( this.options.sortorder == 'asc') {
					this.options.sortorder = 'desc';
				} else if(this.options.sortorder == 'desc') { this.options.sortorder = 'asc';}
			} else { this.options.sortorder = this.options.colModel[idxcol].firstsortorder || 'asc'; }
			this.options.page = 1;
		}
		if(sor) {
			if(this.options.lastsort == idxcol && this.options.sortorder == sor && !reload) { return; }
			else { that.options.sortorder = sor; }
		}
		var previousSelectedTh = this.grid.headers[this.options.lastsort].el, newSelectedTh = this.options.frozenColumns ? obj : this.grid.headers[idxcol].el;

		$("span.coral-grid-ico-sort",previousSelectedTh).addClass('coral-state-disabled');
		$(previousSelectedTh).attr("aria-selected","false");
		if(this.options.frozenColumns) {
			if (this.grid.fhDiv) {
				this.grid.fhDiv.find("span.coral-grid-ico-sort").addClass('coral-state-disabled');
				this.grid.fhDiv.find("th").attr("aria-selected","false");
			} else if (this.grid.rightfhDiv) {
				this.grid.rightfhDiv.find("span.coral-grid-ico-sort").addClass('coral-state-disabled');
				this.grid.rightfhDiv.find("th").attr("aria-selected","false");
			}
		}
		$("span.coral-icon-"+this.options.sortorder,newSelectedTh).removeClass('coral-state-disabled');
		$(newSelectedTh).attr("aria-selected","true");
		if(!this.options.viewsortcols[0]) {
			if(this.options.lastsort != idxcol) {
				if(this.options.frozenColumns){
					if (this.grid.fhDiv) {
						this.grid.fhDiv.find("span.s-ico").hide();
					} else if (this.grid.rightfhDiv) {
						this.grid.rightfhDiv.find("span.s-ico").hide();
					}
				}
				$("span.s-ico",previousSelectedTh).hide();
				$("span.s-ico",newSelectedTh).show();
			}else if (this.options.sortname === "") { // if this.options.lastsort === idxcol but this.options.sortname === ""
				$("span.s-ico",newSelectedTh).show();
			}
		}
		index = index.substring(5 + this.options.id.length + 1); // bad to be changed!?!
		this.options.sortname = this.options.colModel[idxcol].index || index;
		so = this.options.sortorder;
		/*if ($(this).triggerHandler("gridSortCol", [index, idxcol, so]) === 'stop') {
			this.options.lastsort = idxcol;
			return;
		}*/
		if (that._trigger("onSortCol", null, [{"id": index, "colIndex":idxcol, "sortorder":so}]) === 'stop') {
			this.options.lastsort = idxcol;
			return;
		}
		//if($.isFunction(this.options.onSortCol)) {if (this.options.onSortCol.call(this,index,idxcol,so)=='stop') {this.options.lastsort = idxcol; return;}}
		if(this.options.datatype == "local") {
			if(this.options.deselectAfterSort) {$(this.element).grid("resetSelection");}
		} else {
			this.options.selrow = null;
			if(this.options.multiselect){that._setHeadCheckBox( false );}
			this.options.selarrrow =[];
			this.options.savedRow =[];
		}
		if(this.options.scroll) {
			var sscroll = this.grid.rowsView.scrollLeft;
			emptyRows(this.grid.rowsView,true, false);
			this.grid.columnsView.scrollLeft = sscroll;
		}
		if(this.options.subGrid && this.options.datatype=='local') {
			$("td.sgexpanded","#"+$.grid.coralID(this.options.id)).each(function(){
				$(this).trigger("click");
			});
		}
		this._populate();
		this.options.lastsort = idxcol;
		if(this.options.sortname != index && idxcol) {this.options.lastsort = idxcol;}
		that.options.b_sortdata = false; // modify for custom sort
	},
	
	_intNum: function(val,defval) {
		val = parseInt(val,10);
		if (isNaN(val)) { return defval ? defval : 0;}
		else {return val;}
	},
	_beginReq: function() {
		// before load or request url 
		var tipsDom = $("#noRecordsTips_"+$.grid.coralID(this.options.id));
		if ( tipsDom.is(":visible") ) {
			tipsDom.hide();
		}
		this.refresh();
		this.grid.columnsView.loading = true;
		if(this.options.hiddengrid) { return;}
		switch(this.options.loadui) {
			case "disable":
				break;
			case "enable":
				$(this.element).loading({
					position:   "overlay",
					text:       this.options.loadtext
				});
				break;
			case "block":
				$("#lui_"+$.grid.coralID(this.options.id)).show();
				$(this.element).loading({
					position:   "overlay",
					text:       this.options.loadtext
				});
				break;
		}
	},
	_endReq: function() {
		var that = this;
		this._delay(function(){
			that.refreshPager();
		},300);
		this.grid.columnsView.loading = false;
		switch(this.options.loadui) {
			case "disable":
				break;
			case "enable":
				$(this.element).loading("hide");
				break;
			case "block":
				$("#lui_"+$.grid.coralID(this.options.id)).hide();
				$(this.element).loading("hide");
				break;
		}
		//this.element.find(".coral-grid-htable,.coral-grid-btable").css("table-layout","fixed");
		// grid 初始化时，如果列太多，而行数据的单元格太长，则列头挤在一起的问题，与下面的单元格错位的问题。
		this.element.find(".coral-grid-htable,.coral-grid-btable").css({
			"table-layout":"fixed"
		});
		if ( $(that.grid.rowsView).find(".jqgrow").length == 0 ){
			that._noRecordsTipsPositon();
			$("#noRecordsTips_"+$.grid.coralID(that.options.id)).css("display","inline-block");
			$(that.grid.fhDiv).css("display","none");
			$(that.grid.fhDiv).css("display","none");
		} else {
			$("#noRecordsTips_"+$.grid.coralID(that.options.id)).css("display","none");
			$(that.grid.fhDiv).css("display","block");
			$(that.grid.fhDiv).css("display","block");
		}
	},
	_noRecordsTipsPositon:function(){
		var that = this;
		var gridWidth = this.element.width(), // 无数据显示时，计算其定位，居中。
		gridHeight = this.gridRows.height(),
		tipsWidth = $("#noRecordsTips_"+$.grid.coralID(that.options.id)).width(),
		tipsHeight = $("#noRecordsTips_"+$.grid.coralID(that.options.id)).height();
		$("#noRecordsTips_"+$.grid.coralID(that.options.id)).css({
			"margin-top": (gridHeight-tipsHeight)/2 +"px",
			"margin-left": gridWidth/2 + "px"
		});
	},
	_setColWidth: function () {
		var that = this;
		var grid = this.grid;
		
		//var initwidth = 0, brd=isSafari? 0: _intNum(this.options.cellLayout,0), vc=0, lvc, scw=_intNum(this.options.scrollOffset,0),cw,hs=false,aw,gw=0,
		var initwidth = 0, brd=$.support.boxSizing? 0: this._intNum(this.options.cellLayout,0), 
			vc=0, // the number of visible column 
			lvc, // the last number of visible column
			scw=this._intNum(this.options.scrollOffset,0), // scrollbar width
			cw, // column width
			hs=false, // height is scroll
			aw,// actual width
			gw=0,// grid width
			cl = 0, // the length of column (include the checkbox column and rownumber column)
			cr;
		$.each(this.options.colModel, function() {
			//if(typeof this.hidden === 'undefined') {this.hidden=false;}
			if(that.options.grouping && that.options.autowidth) {
				var ind = $.inArray(this.name, that.options.groupingView.groupField);
				if(ind >= 0 && that.options.groupingView.groupColumnShow.length > ind) {
					this.hidden = !that.options.groupingView.groupColumnShow[ind];
				}
			}
			this.widthOrg = cw = that._intNum(this.width,0);
			if((this.hidden === false||typeof(this.hidden) == 'undefined')){
				initwidth += cw+brd;
				if(this.fixed) {
					gw += cw+brd;
				} else {
					vc++;
				}
				cl++;
			}
		});
		if(isNaN(that.options.width)) {that.options.width = grid.width = initwidth;}
		else { grid.width = that.options.width;}
		that.options.tblwidth = initwidth;
		if(that.options.shrinkToFit ===false && that.options.forceFit === true) {that.options.forceFit=false;}
		if(that.options.shrinkToFit===true && vc > 0) {
			aw = grid.width-brd*vc-gw;
			if(!isNaN(this.options.height)) {//如果grid设置高度，则减去滚动条宽度
				aw -= scw;
				hs = true;
			}
			initwidth =0;
			$.each(that.options.colModel, function(i) {
				if((this.hidden === false||typeof(this.hidden)== 'undefined') && !this.fixed){
					cw = Math.round(aw*this.width/(that.options.tblwidth-brd*vc-gw));
					this.width =cw;
					initwidth += cw;
					lvc = i;
				}
			});
			cr =0;//如果grid实际宽度和算出来宽度有差别则将这个差加到最后一列
			if (hs) {
				if(grid.width-gw-(initwidth+brd*vc) !== scw){
					cr = grid.width-gw-(initwidth+brd*vc)-scw;
				}
			} else if(!hs && Math.abs(grid.width-gw-(initwidth+brd*vc)) !== 1) {
				cr = grid.width-gw-(initwidth+brd*vc) -1;//add for chrome
			}
			that.options.colModel[lvc].width += cr;
			that.options.tblwidth = initwidth+cr+brd*vc+gw;
			if(that.options.tblwidth > that.options.width) {
				that.options.colModel[lvc].width -= (that.options.tblwidth - parseInt(that.options.width,10));
				that.options.tblwidth = that.options.width;
			}
			that.options.tblwidth;
		}
	},
	_nextVisible: function(iCol) {
		var ret = iCol, j=iCol, i;
		for (i = iCol+1;i<this.options.colModel.length;i++){
			if(this.options.colModel[i].hidden !== true ) {
				j=i; break;
			}
		}
		return j-ret;
	},
	_formatCol: function (pos, rowInd, tv, rawObject, rowId, rdata){
		var that = this;
		if(that.options.model == "card")return "";
		var grid = that.grid;
		var cm = that.options.colModel[pos],
		ral = cm.align, result="style=\"", clas = cm.cls, nm = cm.name, celp, acp=[], dataOrg = "";
		if(ral) { result += "text-align:"+ral+";"; }
		if(cm.hidden===true) { result += "display:none;"; }
		var _fn = $.coral.toFunction(cm.cellattr);
		if(rowInd===0) {
			result += "width: "+grid.headers[pos].width+"px;";
		} else if ($.isFunction(_fn))
		{
			celp = _fn.apply( that.element[0], [{"rowId":rowId,"value":tv,"rawObject":rawObject,"colModel":cm,"rowData":rdata}]);
			//celp = cm.cellattr.call(that, rowId, tv, rawObject, cm, rdata);
			if(celp && typeof(celp) === "string") {
				celp = celp.replace(/style/i,'style').replace(/title/i,'title');
				if(celp.indexOf('title') > -1) { cm.title=false;}
				if(celp.indexOf('class') > -1) { clas = undefined;}
				acp = celp.split("style");
				if(acp.length === 2 ) {
					acp[1] =  $.trim(acp[1].replace("=",""));
					if(acp[1].indexOf("'") === 0 || acp[1].indexOf('"') === 0) {
						acp[1] = acp[1].substring(1);
					}
					result += acp[1].replace(/'/gi,'"');
				} else {
					result += "\"";
				}
			}
		}
		// 将original value存储在td上，注意动态维护此属性
		if ( rawObject ){
			var rawObjectV = (rawObject[nm] == undefined) ? "" : rawObject[nm];
			rawObjectV = $.grid.htmlEncode(rawObjectV);//需要编码，，不然列上面的属性解析错误
			/*if ( cm.edittype == "combobox" ) { 
				var v = that.findTextByValue(rawObjectV, {"colModel":cm});
				v = $.grid.htmlEncode(v);
				dataOrg += "data-org='"+v+"'"; 
			} else {
				dataOrg += "data-org='"+rawObjectV+"'"; 
			}*/
			
			dataOrg += "data-org='"+rawObjectV+"'"; 
		}
		if ( !acp.length ) { 
			acp[0] = ""; result += "\"";
		} 
		result += (clas !== undefined ? (" class=\""+clas+"\"") :"") + ((cm.title && tv) ? (" title=\""+$.grid.stripHtml(tv)+"\"") :"");
		result += " aria-describedby=\""+that.options.id+"_"+nm+"\"";
		return result + acp[0] + dataOrg;
	},
	/** 根据text找到value*/
	findTextByValue: function(cval, opts) {
		var code = opts.colModel.editoptions.data;
		if ( !code ) return cval;
		for ( var i=0; i<code.length; i++ ){
			if ( code[i].text == cval) {
				return code[i].value;
			} else {
			}
		}
		return cval;
	},
	_cellVal:  function (val) {
		return val === undefined || val === null || val === "" ? "" : (this.options.autoencode ? $.grid.htmlEncode(val) : val+"");
	},
	/* rowId: 行号
	 * cell: 单元格内容
	 * pos: 位置
	 * irow: 当前行
	 * srvr: 当前行数据
	 * */
	_addCell: function(rowId,cell,pos,irow, srvr, rdata) {
		if(this.options.model == "card"){
			var v,prp;
			v = this._formatter(rowId,cell,pos,srvr,'add');
			prp = this._formatCol( pos,irow, v, srvr, rowId, rdata);
			return "<div role=\"gridcell\" "+prp+">"+v+"</div>";
		}
		var v,prp,re;
		v = this._formatter(rowId,cell,pos,srvr,'add');
		prp = this._formatCol( pos,irow, v, srvr, rowId, rdata);
		if(this.options.enableHighlight && this.options.postData.filters){
			var keywordArr =  $.grid.parse(this.options.postData.filters).rules;
			for (var n = 0; n < keywordArr.length; n ++) {
				re = new RegExp("" + keywordArr[n].data + "","gmi");
				if(keywordArr[n].data != ""){
					v = v.replace(re,'<span class="coral-keyword-highlight">' + keywordArr[n].data + '</span>');
				}
			}
		}
		return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
	},
	_orderedCols: function (offset) {
		var that = this;
		var order = that.options.remapColumns;
		if (!order || !order.length) {
			order = $.map(that.options.colModel, function(v,i) { return i; });
		}
		if (offset) {
			order = $.map(order, function(v) { return v<offset?null:v-offset; });
		}
		return order;
	},
	emptyRows: function (parent, scroll, locdata) {
		var that = this,
			isPicgrid = !!(that.options.model == "card");
		if(isPicgrid){
			$("#"+$.grid.coralID(that.options.id)+" .coral-pic").children().remove();
		}else{
			if(that.options.deepempty) {$("#"+$.grid.coralID(that.options.id)+" tbody:first tr:gt(0)").remove();}
			else {
				if (that.options.filterToolbar){
					var trf = that.gridRows.find(".coral-grid-btable")[0].rows.length > 0 ? that.gridRows.find(".coral-grid-btable")[0].rows[0] : null;
					$( "#"+$.grid.coralID(that.options.id+"_table")+" tbody:first").empty().append(trf);
				} else {
				var trf = $("#"+$.grid.coralID(that.options.id)+" tbody:first tr:first")[0];
				$("#"+$.grid.coralID(that.options.id)+" tbody:first").empty().append(trf);
				}
			}
			if (scroll && that.options.scroll) {
				$(">div:first", parent).css({height:"auto"}).children("div:first").css({height:0,display:"none"});
				parent.scrollTop = 0;
			}
			if(locdata === true) {
				if(that.options.treeGrid === true ) {
					that.options.data = []; that.options._index = {};
				}
			}
		}
	},
	normalizeData : function() {
		var p = this.options, data = p.data, dataLength = data.length, i, j, cur, idn, idr, ccur, v, rd,
		localReader = p.localReader,
		colModel = p.colModel,
		cellName = localReader.cell,
		iOffset = (p.multiselect === true ? 1 : 0) + (p.subGrid === true ? 1 : 0) + (p.rownumbers === true ? 1 : 0),
		br = p.scroll ? $.jgrid.randId() : 1,
		arrayReader, objectReader, rowReader;

		if (p.datatype !== "local" || localReader.repeatitems !== true) {
			return; // nothing to do
		}

		arrayReader = this._orderedCols(iOffset);
		objectReader = this._reader("local");
		// read ALL input items and convert items to be read by
		// $.jgrid.getAccessor with column name as the second parameter
		idn = p.keyName === false ?
			($.isFunction(localReader.id) ? localReader.id.call(ts, data) : localReader.id) :
			p.keyName;
		for (i = 0; i < dataLength; i++) {
			cur = data[i];
			// read id in the same way like addJSONData do
			// probably it would be better to start with "if (cellName) {...}"
			// but the goal of the current implementation was just have THE SAME
			// id values like in addJSONData ...
			idr = $.grid.getAccessor(cur, idn);
			if (idr === undefined) {
				if (typeof idn === "number" && colModel[idn + iOffset] != null) {
					// reread id by name
					idr = $.grid.getAccessor(cur, colModel[idn + iOffset].name);
				}
				if (idr === undefined) {
					idr = br + i;
					if (cellName) {
						ccur = $.grid.getAccessor(cur, cellName) || cur;
						idr = ccur != null && ccur[idn] !== undefined ? ccur[idn] : idr;
						ccur = null;
					}
				}
			}
			rd = { };
			rd[localReader.id] = idr;
			if (cellName) {
				cur = $.grid.getAccessor(cur, cellName) || cur;
			}
			rowReader = $.isArray(cur) ? arrayReader : objectReader;
			for (j = 0; j < rowReader.length; j++) {
				v = $.grid.getAccessor(cur, rowReader[j]);
				rd[colModel[j + iOffset].name] = v;
			}
			$.extend(true, data[i], rd);
		}
	},
	refreshIndex: function() {
		var that = this;
		var datalen = that.options.data.length, idname, i, val;

		if(that.options.keyName === false || that.options.loadonce === true) {
			idname = that.options.localReader.id;
		} else {
			idname = that.options.keyName;
		}
		for(i =0;i < datalen; i++) {
			val = $.grid.getAccessor(that.options.data[i],idname);
			that.options._index[val] = i;
		}
	},
	constructPanel: function(id, hide, altClass, rd, cur) {
		var tabindex = '-1', restAttr = '', attrName, style = hide ? 'display:none;' : '',
			classes = 'gridPanel coral-row-' + this.options.direction + altClass;
		//	rowAttrObj = $.isFunction(this.options.rowattr) ? this.options.rowattr.call(that, rd, cur) : {};
		/*if(!$.isEmptyObject( rowAttrObj )) {
			if (rowAttrObj.hasOwnProperty("id")) {
				id = rowAttrObj.id;
				delete rowAttrObj.id;
			}
			if (rowAttrObj.hasOwnProperty("tabindex")) {
				tabindex = rowAttrObj.tabindex;
				delete rowAttrObj.tabindex;
			}
			if (rowAttrObj.hasOwnProperty("style")) {
				style += rowAttrObj.style;
				delete rowAttrObj.style;
			}
			if (rowAttrObj.hasOwnProperty("class")) {
				classes += ' ' + rowAttrObj['class'];
				delete rowAttrObj['class'];
			}
			// dot't allow to change role attribute
			try { delete rowAttrObj.role; } catch(ra){}
			for (attrName in rowAttrObj) {
				if (rowAttrObj.hasOwnProperty(attrName)) {
					restAttr += ' ' + attrName + '=' + rowAttrObj[attrName];
				}
			}
		}*/
		return '<li role="row" id="' + id + '" tabindex="' + tabindex + '" class="' + classes + '"' +
			(style === '' ? '' : ' style="' + style + '"') + restAttr + '>';
	},
	constructTr: function(id, hide, altClass, rd, cur, selected) {
		var tabindex = '-1', restAttr = '', attrName, style = hide ? 'display:none;' : '',
			rowAttrObj,
			classes = 'coral-component-content jqgrow coral-row-' + this.options.direction + altClass+ (selected ? ' coral-state-highlight' : '');
		if(this.options.treeGrid){
			var parent_id = this.options.treeReader.parent_id_field;
			if(cur[parent_id] !== null && String(cur[parent_id]).toLowerCase() != "null"){
				classes += ' treeGridRow ';
			}
		}
		var rowattrFun = $.coral.toFunction(this.options.rowattr);
	//	rowAttrObj = $.isFunction(rowattrFun) ? this.options.rowattr.call(that, rd, cur) : {};
		rowAttrObj = $.isFunction(rowattrFun) ? rowattrFun.apply( this.element[0], [{
			"rowId":id, "rowData":rd, "currentObj":cur
			}]) : {};
		if(!$.isEmptyObject( rowAttrObj )) {
			if (rowAttrObj.hasOwnProperty("id")) {
				id = rowAttrObj.id;
				delete rowAttrObj.id;
			}
			if (rowAttrObj.hasOwnProperty("tabindex")) {
				tabindex = rowAttrObj.tabindex;
				delete rowAttrObj.tabindex;
			}
			if (rowAttrObj.hasOwnProperty("style")) {
				style += rowAttrObj.style;
				delete rowAttrObj.style;
			}
			if (rowAttrObj.hasOwnProperty("class")) {
				classes += ' ' + rowAttrObj['class'];
				delete rowAttrObj['class'];
			}
			// dot't allow to change role attribute
			try { delete rowAttrObj.role; } catch(ra){}
			for (attrName in rowAttrObj) {
				if (rowAttrObj.hasOwnProperty(attrName)) {
					restAttr += ' ' + attrName + '=' + rowAttrObj[attrName];
				}
			}
		}
		return '<tr role="row" id="' + id + '" tabindex="' + tabindex + '" class="' + classes + '"' +
			(style === '' ? '' : ' style="' + style + '"') + restAttr + '>';
	},
	_clearVals: function(onPaging){
		var that = this, ret;
		//if ($.isFunction(that.options.onPaging) ) { ret = that.options.onPaging.call(that,onPaging); }
		ret = that._trigger("onPaging",null,[{pgButton: onPaging}]);
		if (!ret) {return false;}
		that.options.selrow = null;
		that.options.editrow = null;
		if(that.options.multiselect) {that.options.selarrrow =[]; that._setHeadCheckBox( false );}
		that.options.savedRow = [];
		return true;
	},
	_getPagination: function(){
		
	},
	/**
	 * 通过模板模式进行渲染自定义分页条，同时组件库提供两种默认的模板。
	 * TODO: 模板渲染，自定义分页条上面的各个位置
	 */
	_setPager: function (pgid, tp){
		var that = this,
			pagerTemplate1 = "<span class='paginator-left'>{viewrecords}</span><span class='paginator-center'>{prev}{links}{next}{pginput}{navbar}{description}</span><span class='paginator-right'><em>每页</em>{rninput}<em>条</em></span>",
			pagerTemplate2 = "<div class='paginator-left'>{viewrecords}{rowlist}{first}{prev}{pginput}{next}{last}{navbar}{description}</div><div class='toolbarpanel'>{toolbar}</div>";
		tp += "_" + pgid;
	var pagerTemplate = false;
		if ($.isFunction(that.options.pagerTemplate)) { 
			pagerTemplate = that.options.pagerTemplate.call(that);
		}

		var dir= this.options.direction;
		// TBD - consider escaping pgid with pgid = $.grid.coralID(pgid);
		var po=["first"+tp,"prev"+tp, "next"+tp,"last"+tp]; if(dir=="rtl") { po.reverse(); }
		var pginp = "", 
			str="", 
			rninput="", 
			rowlist="",
			viewrecords="", 
			totalPage = "",
			pagers = "",
			pagination="", 
			links = "<span class='coral-paginator-pages'></span>",
			pginput = "<em class='page-item'>第</em><input type='text' class='coral-pg-input'/><em class='page-item'>页</em>",
			reload = "<button class='reload-button' id='_reloadGrid' type='button' " +
					"data-options='customData:{gridId:\""+that.options.id+"\"}," +
					"label:\"刷新\",text: false,icons: \"cui-icon-loop3\",onClick: function( e, ui ){" +
					"$( \"#"+that.options.id+"\" ).grid( \"reload\" );" +
				"}'>reload</button>",
			first = "<span id='"+po[0]+"' class='page-item coral-paginator-first coral-state-default coral-corner-all' tabindex='0'><span class='cui-icon-first2' title='第一页'></span></span>",
			last = "<span id='"+po[3]+"' class='page-item coral-paginator-last coral-state-default coral-corner-all' tabindex='0'><span class='cui-icon-last2' title='最后一页'></span></span>",
			next = "<span id='"+po[2]+"' class='page-item coral-paginator-next coral-corner-all' tabindex='0'><span class='cui-icon-arrow-right3' title='下一页'></span></span>",
			prev = "<span id='"+po[1]+"' class='page-item coral-paginator-prev coral-corner-all' tabindex='0'><span class='cui-icon-arrow-left3' title='前一页'></span></span>",
			sep = "<span>|</span>",
			navbar = "<span class='page-item pager-navbar'></span>",
			toolbar = "<span class='pager-toolbar'></span>",
			description="<span class='pager-description'></span>", paginator, lft, cent, rgt, twd, tdw, i;
		paginator = "pg_"+pgid;
		
		lft = pgid+"_left"; cent = pgid+"_center"; rgt = pgid+"_right";

		rninput +="<input type='text' class='coral-rn-input' val=''/>";
		if( !that.options.rninput ){
		} else if( that.options.rowList.length > 0 ){
			//rowlist = rninput;
		}
		rowlist +="<select class='coral-pg-selbox' role='listbox'>";
		for(i=0;i<that.options.rowList.length;i++){
			rowlist +="<option role=\"option\" value=\""+that.options.rowList[i]+"\""+((that.options.rowNum == that.options.rowList[i])?" selected=\"selected\"":"")+">"+that.options.rowList[i]+"</option>";
		}
		rowlist +="</select>";
		if(that.options.viewrecords){
			viewrecords +="<span class='page-item coral-paging-info'></span>";
			totalPage +="<span class='page-item coral-paging-totalpage'></span>";
		}
		
		if(that.options.pginput===true) { pginp= "<td dir='"+dir+"'>"+$.grid.format(that.options.pgtext || "","<input class='coral-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>","<span id='sp_1_"+$.grid.coralID(pgid)+"'></span>")+"</td>";}
		if ( that.options.pagerStyle == "flex" ){
			if ( pagerTemplate ) {
				pagerTemplate1 = pagerTemplate;
			}
			pagination = "<span id='"+po[1]+"' class='page-item coral-paginator-prev coral-corner-all' tabindex='0'><span class='cui-icon-arrow-left3'>p</span></span>" +
				"<span class='coral-paginator-pages'></span>" +
				"<span id='"+po[2]+"' class='page-item coral-paginator-next coral-corner-all' tabindex='0'><span class='cui-icon-arrow-right3'>p</span></span>" +
				"<em class='page-item'>第</em><input type='text' class='coral-pg-input'/><em class='page-item'>页</em>" ;
			pagers = pagerTemplate1.replace( /\{viewrecords\}/g, viewrecords)
				//.replace( /\{pagination\}/g, pagination)
				.replace( /\{navbar\}/g, navbar)
				.replace( /\{reload\}/g, reload)
				.replace( /\{-\}/g, sep)
				.replace( /\{first\}/g, first)
				.replace( /\{last\}/g, last)
				.replace( /\{next\}/g, next)
				.replace( /\{totalPage\}/g, totalPage)
				.replace( /\{prev\}/g, prev)
				.replace( /\{links\}/g, links)
				.replace( /\{pginput\}/g, pginput)
				.replace( /\{toolbar\}/g, toolbar)
				.replace( /\{description\}/g, description)
				.replace( /\{rowlist\}/g, rowlist)
				.replace( /\{rninput\}/g, rninput);
			 
			$("#"+$.grid.coralID(pgid) ).addClass("coral-pager-flex");
			$("#"+$.grid.coralID(pgid) )
			.append("<div id='" + paginator + "' class='coral-paginator' role='group'>" +
						pagers +
					"</div>");
			that._bindpager( pgid, tp );
		} else if ( that.options.pagerStyle == "tradition" ){
			if ( pagerTemplate ) {
				pagerTemplate2 = pagerTemplate;
			}
			pagination = "<span id='"+po[0]+"' class='page-item coral-paginator-first coral-state-default coral-corner-all' tabindex='0'><span class='cui-icon-first2'></span></span>" +
				"<span id='"+po[1]+"' class='page-item coral-paginator-prev coral-corner-all' tabindex='0'><span class='cui-icon-arrow-left3'></span></span>" +
				"<em class='page-item'>第</em><input type='text' class='coral-pg-input'/><em class='page-item'>页</em>" +
				"<span id='"+po[2]+"' class='page-item coral-paginator-next coral-corner-all' tabindex='0'><span class='cui-icon-arrow-right3'></span></span>" +
				"<span id='"+po[3]+"' class='page-item coral-paginator-last coral-state-default coral-corner-all' tabindex='0'><span class='cui-icon-last2'></span></span>" ;
			pagers = pagerTemplate2.replace( /\{viewrecords\}/g, viewrecords)
				//.replace( /\{pagination\}/g, pagination)
				.replace( /\{navbar\}/g, navbar)
				.replace( /\{reload\}/g, reload)
				.replace( /\{-\}/g, sep)
				.replace( /\{first\}/g, first)
				.replace( /\{last\}/g, last)
				.replace( /\{next\}/g, next)
				.replace( /\{prev\}/g, prev)
				.replace( /\{links\}/g, links)
				.replace( /\{totalPage\}/g, totalPage)
				.replace( /\{pginput\}/g, pginput)
				.replace( /\{toolbar\}/g, toolbar)
				.replace( /\{description\}/g, description)
				.replace( /\{rowlist\}/g, rowlist)
				.replace( /\{rninput\}/g, rninput);
			
			$("#"+$.grid.coralID(pgid) ).addClass("coral-pager-tradition");
			$("#"+$.grid.coralID(pgid) )
			.append("<div id='" + paginator + "' class='coral-paginator' role='group'>" +
						pagers +
					"</div>");
			that._bindpagerTradition( pgid, tp );
		} else {
			//TODO: 自定义pager，自定义事件绑定
		}
		
		var pagerOpts = $.parser.parseOptions( $( "#"+$.grid.coralID(pgid) )[0], null);
		that.options.toolbarOptions = pagerOpts.toolbarOptions;
		that.options.description = pagerOpts.description;
		var navbarOptions = that.options.navbarOptions || {};
		pagerOpts.toolbarOptions = pagerOpts.toolbarOptions || {};
		$(".reload-button", that.element ).button({componentCls: "page-item pg"});
		if ( $( ".pager-toolbar", that.element ).length ) {
			$( ".pager-toolbar", that.element ).toolbar( pagerOpts.toolbarOptions );
		}
		if( that.options.description ){
			$( ".pager-description", that.element ).html( that.options.description );
		}
		
	},
	_bindpagerTradition: function( pgid, tp ){
		var that = this;
		// init page input icon
		$( "input.coral-pg-input", $( "#"+$.grid.coralID(pgid) ) ).textbox({
			componentCls: "page-item pg",
			onKeyPress: function(e,ui){
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if (key == 13) {
					var last = that._intNum(that.options.lastpage,1);
					var cp = that._intNum(ui.text,1);					
					if (cp > last) {
						that.options.page = last;
						$(this).textbox("setValue", that.options.page);
					}else{
						that.options.page = (ui.text > 0) ? ui.text : that.options.page;
					}
					if(!that._clearVals('user')) { return false; }
					that._populate();
					return false;
				}
				return this;
			},
			onBlur:function(){
				// 如果输入页数大于总页数，则返回 @lhb @20150507
				var last = that._intNum(that.options.lastpage,1);
				var cp = $(this).textbox("getValue");				
				if (cp !== that.options.page) {
					$(this).textbox("setValue", that.options.page);
				}
			}
		});
		//if( !that.options.rninput ){
			// init rownum input icon
			$( "input.coral-rn-input", $( "#"+$.grid.coralID(pgid) ) ).textbox({
				componentCls: "page-item rn",
				onKeyPress: function(e,ui){
					var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
					if(key == 13) {
						that.options.rowNum = (ui.text>0) ? (ui.text < that.options.rowNumMax? ui.text:that.options.rowNumMax):that.options.rowNum;
						if(!that._clearVals('records')) { return false; }
						that._populate();
						return false;
					}
					return this;
				}/*,
				texticons: [{
					icon: "条",
					click: function (e,ui) { 
						that.options.rowNum = (ui.value>0) ? (ui.value<that.options.rowNumMax? ui.value:that.options.rowNumMax):that.options.rowNum;
						if(!that._clearVals('user')) { return false; }
						that._populate();
						return false;
					}
				}]*/
			});
		//} else if ( that.options.rowList.length > 0 ) {
			// init rowlist
			$( ".coral-pg-selbox", $( "#"+$.grid.coralID(pgid) ) ).combobox({
				componentCls: "page-item rn",
				panelHeight:'auto',
				showClose: false,
				panelRenderOnShow: false,//如果全局配panelRenderOnShow为true，selected无效
				onChange:function(event,ui){
					that.options.page = Math.round(that.options.rowNum*(that.options.page-1)/ui.value-0.5)+1;
					that.options.rowNum = ui.value;
					//if(that.options.pager) { $('.coral-pg-selbox',that.options.pager).val(ui.newValue); }
					//if(that.options.toppager) { $('.coral-pg-selbox',that.options.toppager).val(ui.newValue); }
					if(!that._clearVals('records')) { return false; }
					that._populate();
					return false;
				}
			});
		//}
		
		$("#first"+$.grid.coralID(tp)+", #prev"+$.grid.coralID(tp)+", #next"+$.grid.coralID(tp)+", #last"+$.grid.coralID(tp)).click( function() {
			var cp = that._intNum(that.options.page,1),
			last = that._intNum(that.options.lastpage,1), selclick = false,
			fp=true, pp=true, np=true,lp=true;
			if(last ===0 || last===1) {fp=false;pp=false;np=false;lp=false; }
			else if( last>1 && cp >=1) {
				if( cp === 1) { fp=false; pp=false; }
				//else if( cp>1 && cp <last){ }
				else if( cp===last){ np=false;lp=false; }
			} else if( last>1 && cp===0 ) { np=false;lp=false; cp=last-1;}
			if( this.id === 'first'+tp && fp ) { that.options.page=1; selclick=true;}
			if( this.id === 'prev'+tp && pp) { that.options.page=(cp-1); selclick=true;}
			if( this.id === 'next'+tp && np) { that.options.page=(cp+1); selclick=true;}
			if( this.id === 'last'+tp && lp) { that.options.page=last; selclick=true;}
			if(selclick) {
				if(!that._clearVals(this.id)) { return false; }
				that._populate();
			}
			return false;
		});
	},
	_bindpager: function( pgid, tp ){
		var that = this;
		// init page input icon
		$( "input.coral-pg-input", $( "#"+$.grid.coralID(pgid) ) ).textbox({
			componentCls: "page-item pg",
			onKeyPress: function(e,ui){
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if(key == 13) {
					// 如果输入页数大于总页数，则返回 @lhb @20150507
					var last = that._intNum(that.options.lastpage,1);
					var cp = that._intNum(ui.text,1);					
					if (cp > last) {
						that.options.page = last;
						$(this).textbox("setValue", that.options.page);
					}else{
						that.options.page = (ui.text > 0) ? ui.text : that.options.page;
					}
					if(!that._clearVals('user')) { return false; }
					that._populate();
					return false;
				}
				return this;
			},
			onBlur:function(){
				// 如果输入页数大于总页数，则返回 @lhb @20150507
				var last = that._intNum(that.options.lastpage,1);
				var cp = $(this).textbox("getValue");				
				if (cp !== that.options.page) {
					$(this).textbox("setValue", that.options.page);
				}
			}
		/*,
			icons: [{
				icon: "icon-enter4",
				click: function (e,ui) { 
					// 如果输入页数大于总页数，则返回 @lhb @20150507
					var last = that._intNum(that.options.lastpage,1);
					var cp = that._intNum(ui.value,1);					
					if (cp > last) return;
					//
					that.options.page = (ui.value>0) ? ui.value:that.options.page;
					if(!that._clearVals('user')) { return false; }
					that._populate();
					return false;
				}
			}]*/
		});
		//if( !that.options.rninput ){
			// init rownum input icon
			$( "input.coral-rn-input", $( "#"+$.grid.coralID(pgid) ) ).textbox({
				componentCls: "page-item rn",
				onKeyPress: function(e,ui){
					var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
					if(key == 13) {
						that.options.rowNum = (ui.text >0) ? (ui.text < that.options.rowNumMax? ui.text:that.options.rowNumMax):that.options.rowNum;
						if(!that._clearVals('records')) { return false; }
						that._populate();
						return false;
					}
					return this;
				}/*,
				texticons: [{
					icon: "条",
					click: function (e,ui) { 
						that.options.rowNum = (ui.value>0) ? ui.value:that.options.rowNum;
						if(!that._clearVals('user')) { return false; }
						that._populate();
						return false;
					}
				}]*/
			});
		//} else if ( that.options.rowList.length > 0 ) {
			// init rowlist
			$( ".coral-pg-selbox", $( "#"+$.grid.coralID(pgid) ) ).combobox({
				componentCls: "page-item rn",
				panelHeight:'auto',
				showClose: false,
				panelRenderOnShow: false,
				onChange:function(event,ui){
					that.options.page = Math.round(that.options.rowNum*(that.options.page-1)/ui.newValue-0.5)+1;
					that.options.rowNum = ui.newValue;
					//if(that.options.pager) { $('.coral-pg-selbox',that.options.pager).val(ui.newValue); }
					//if(that.options.toppager) { $('.coral-pg-selbox',that.options.toppager).val(ui.newValue); }
					if(!that._clearVals('records')) { return false; }
					that._populate();
					return false;
				}
			});
		//}
		
		// init page input keypress
		$( ".coral-textbox-btn-ico-search", $("#"+$.grid.coralID(pgid)) ).click( function(e) {
			that.options.page = ($(this).prev().val()>0) ? $(this).prev().val():that.options.page;
			if(!that._clearVals('user')) { return false; }
			that._populate();
			return false;
		});
		
		this._off($(".coral-paginator-page"));
		this._on({
			"click.coral-paginator-page" : function(e) {
				var _this = e.target;
				if($(_this).hasClass('coral-state-disabled')) {
					_this.style.cursor='default';
				} else {
					$(_this).addClass('coral-state-hover');
					_this.style.cursor='pointer';
				}
			}
		});
		//this._off($(".coral-paginator-page"));
		this._on({
			"mouseenter.coral-paginator-page" : function(e) {
				var _this = e.target;
				if($(_this).hasClass('coral-state-disabled')) {
					_this.style.cursor='default';
				} else {
					$(_this).addClass('coral-state-hover');
					_this.style.cursor='pointer';
				}
			},
			"mouseleave.coral-paginator-page" : function(e) {
				var _this = e.target;
				if(!$(_this).hasClass('coral-state-disabled')) {
					$(_this).removeClass('coral-state-hover');
					_this.style.cursor= "default";
				}
			}
		});
		
		$("#first"+$.grid.coralID(tp)+", #prev"+$.grid.coralID(tp)+", #next"+$.grid.coralID(tp)+", #last"+$.grid.coralID(tp)).click( function() {
			var cp = that._intNum(that.options.page,1),
			last = that._intNum(that.options.lastpage,1), selclick = false,
			fp=true, pp=true, np=true,lp=true;
			if(last ===0 || last===1) {fp=false;pp=false;np=false;lp=false; }
			else if( last>1 && cp >=1) {
				if( cp === 1) { fp=false; pp=false; }
				//else if( cp>1 && cp <last){ }
				else if( cp===last){ np=false;lp=false; }
			} else if( last>1 && cp===0 ) { np=false;lp=false; cp=last-1;}
			if( this.id === 'first'+tp && fp ) { that.options.page=1; selclick=true;}
			if( this.id === 'prev'+tp && pp) { that.options.page=(cp-1); selclick=true;}
			if( this.id === 'next'+tp && np) { that.options.page=(cp+1); selclick=true;}
			if( this.id === 'last'+tp && lp) { that.options.page=last; selclick=true;}
			if(selclick) {
				if(!that._clearVals(this.id)) { return false; }
				that._populate();
			}
			return false;
		});
	},
	_updatepager: function(rn, dnd) {
		var that = this;
		var cp, last, base, from,to,tot,fmt, pgboxes = "", sppg, topa, totalp,
		tspg = that.options.pager ? "_"+$.grid.coralID(that.options.pager.substr(1)) : "",
		tspg_t = that.options.toppager ? "_"+that.options.toppager.substr(1) : "";
		base = parseInt(that.options.page,10)-1;
		if(base < 0) { base = 0; }
		base = base*parseInt(that.options.rowNum,10);
		to = base + that.options.reccount;
		if ( that.options.scroll ) {
			var rows = $("tbody:first > tr:gt(0)", that.grid.rowsView);
			base = to - rows.length;
			that.options.reccount = rows.length;
			var rh = rows.outerHeight() || that.grid.prevRowHeight;
			if (rh) {
				var top = base * rh;
				var height = parseInt(that.options.records,10) * rh;
				$(">div:first",that.grid.rowsView).css({height : height}).children("div:first").css({height:top,display:top?"":"none"});
			}
			that.grid.rowsView.scrollLeft = that.grid.columnsView.scrollLeft;
		}
		if (that.options.treeGrid) {
			var rows = $("tbody:first > tr:not(.treeGridRow,.jqgfirstrow)", that.grid.rowsView);
			that.options.reccount = rows.length;
			to = base + that.options.reccount;
		}
		//pgboxes = that.options.pager ? that.options.pager : "";
		//pgboxes += that.options.toppager ?  (pgboxes ? "," + that.options.toppager : that.options.toppager) : "";
		pgboxes = $(that.element).find(".coral-grid-pager");
		if( pgboxes.length > 0 ) {
			fmt = $.grid.formatter.integer || {};
			cp = that._intNum(that.options.page);
			last = that._intNum(that.options.lastpage);
			$(".selbox",pgboxes)[ this.options.useProp ? 'prop' : 'attr' ]("disabled",false);
			if ( $('.coral-pg-input',pgboxes).length>0 ) {
				$( '.coral-pg-input',pgboxes ).val(that.options.page);
				sppg = that.options.toppager ? '#sp_1'+tspg+",#sp_1"+tspg_t : '#sp_1'+tspg;
				$(sppg).html($.fmatter ? $.fmatter.util.NumberFormat(that.options.lastpage,fmt):that.options.lastpage);
			}
			if(that.options.rninput===true) {
				$('.coral-rn-input',pgboxes).val(that.options.rowNum);
			}
			/*
			//
			if(that.options.reccount === 0) {
				$(".coral-grid-noRecordsTips").show();
			}			
			//
*/			if (that.options.viewrecords){
				if(that.options.reccount === 0) {
					$(".coral-paging-info",pgboxes).html("");
					$(".coral-paging-totalpage",pgboxes).html("");
				} else {
					from = base+1;
					tot = that.options.records;
					topa = that.options.reccount;
					if (tot % topa == 0){
						totalp = parseInt(tot/topa);
					} else {
						totalp = parseInt(tot/topa) + 1;
					}
					if ($.fmatter) {
						from = $.fmatter.util.NumberFormat(from,fmt);
						to = $.fmatter.util.NumberFormat(to,fmt);
						tot = $.fmatter.util.NumberFormat(tot,fmt);// 总记录数
						topa = $.fmatter.util.NumberFormat(topa,fmt);// 每页条数
						totalp = $.fmatter.util.NumberFormat(totalp,fmt);
					}
					$(".coral-paging-info",pgboxes).html($.grid.format(that.options.recordtext,from,to,tot));
					$(".coral-paging-totalpage",pgboxes).html($.grid.format(that.options.pagetext,totalp));
				}
			}
			if(that.options.pgbuttons===true ) {
				var pre = [], next = [];
				that.pagers.each(function(){
					pre.push("#first_"+this.id);
					pre.push("#prev_"+this.id);
					next.push("#next_"+this.id);
					next.push("#last_"+this.id);
				});
				if(cp<=0) {cp = last = 0;}
				if(cp==1 || cp === 0) {
					//$("#first"+tspg+", #prev"+tspg).addClass('coral-state-disabled').removeClass('coral-state-hover');
					$(pre.join(",")).addClass('coral-state-disabled').removeClass('coral-state-hover');
					if(that.options.toppager) { $("#first_t"+tspg_t+", #prev_t"+tspg_t).addClass('coral-state-disabled').removeClass('coral-state-hover'); }
				} else {
					$(pre.join(",")).removeClass('coral-state-disabled');
					if(that.options.toppager) { $("#first_t"+tspg_t+", #prev_t"+tspg_t).removeClass('coral-state-disabled'); }
				}
				if(cp==last || cp === 0) {
					$(next.join(",")).addClass('coral-state-disabled').removeClass('coral-state-hover');
					if(that.options.toppager) { $("#next_t"+tspg_t+", #last_t"+tspg_t).addClass('coral-state-disabled').removeClass('coral-state-hover'); }
				} else {
					$(next.join(",")).removeClass('coral-state-disabled');
					if(that.options.toppager) { $("#next_t"+tspg_t+", #last_t"+tspg_t).removeClass('coral-state-disabled'); }
				}
				// 如果无数据，则将分页条向右的箭头也禁用
				if (0 == last) {
					$(next.join(",")).addClass('coral-state-disabled').removeClass('coral-state-hover');
				}
			}
			that._paginators();
		}
		if(rn===true && that.options.rownumbers === true) {
			$("td.grid-rownum",that.rows).each(function(i){
				$(this).html(base+1+i);
			});
		}
		if(dnd && that.options.jqgdnd) { $(that.element).grid('gridDnD','updateDnD');}
	//	$( ".pager-toolbar", that.element ).toolbar( "option", "disabled", false );
		that._trigger("onComplete", null, []);
		that._trigger("afterComplete", null, []);
	},
	_paginators: function(){
		var that = this;
		var cp = that._intNum(that.options.page,1), last = that._intNum(that.options.lastpage,1), selclick = false;
		var le = 3, begin = cp>2?cp+2-le:1, end, pages="";
		
		end = le+begin>last?last+1:le+begin;
		if(begin>3&&end<=last+2)begin = end -le;
		
		if(cp>2&&last>le){
			if(begin>=2)
				pages += "<span class='coral-paginator-page coral-state-default coral-corner-all'  tabindex='0'>1</span>";
			if(begin>=3)
				pages += "<span class='coral-paginator-page coral-state-default coral-corner-all'  tabindex='0'>2</span>";
			if(begin!=3&&begin!=1&&begin!=2)
				pages += "<span class='coral-page-pointer'>...</span>";
		}
		
		for(var i=begin;i<end;i++){
			if(cp==i)
				pages += "<span class='coral-paginator-page coral-state-default coral-state-active coral-corner-all'  tabindex='0'>"+i+"</span>";
			else
				pages += "<span class='coral-paginator-page coral-state-default coral-corner-all'  tabindex='0'>"+i+"</span>";
		}
		if(end==last)
			pages += "<span class='coral-paginator-page coral-state-default coral-corner-all'>"+last+"</span>";
		else if(end<=last)
			pages += "<span class='coral-page-pointer'>...</span><span class='coral-paginator-page coral-state-default coral-corner-all'>"+last+"</span>";
		$( ".coral-paginator-pages", that.element ).html( pages );
	},
	_populate: function (npage) {
		var that = this,
			isPicgrid = !!(that.options.model == "card");
		var grid = that.grid;
		if(true) {//上次请求未完成则不能继续
			var pvis = that.options.scroll && npage === false,
			prm = {}, dt, dstr, pN = that.options.prmNames;
			if(that.options.page <=0) { that.options.page = 1; }
			if(pN.search !== null) {prm[pN.search] = that.options.search;} if(pN.nd !== null) {prm[pN.nd] = new Date().getTime();}
			if(pN.rows !== null) {prm[pN.rows]= that.options.rowNum;} if(pN.page !== null) {prm[pN.page]= that.options.page;}
			if(pN.sort !== null) {prm[pN.sort]= that.options.sortname;} if(pN.order !== null) {prm[pN.order]= that.options.sortorder;}
			if(that.options.rowTotal !== null && pN.totalrows !== null) { prm[pN.totalrows]= that.options.rowTotal; }
			//var lcf = $.isFunction(that.options.onload), lc = lcf ? that.options.onload : null;
			var lc = function(req){
				that._trigger("onLoad", null, [ req ]);
				if (that.options.afterSortableRows && $.fn.sortable) {
					try {
						$(that.element).grid("sortableRows");
					} catch (e){}
				}
				if (that.options.onSortableLoad && $.fn.sortable) {
					try {
						var connectItem = [];
						if( that.options.connectGridId == null) {
							connectItem = ("#"+that.element[0].id+" tbody:first");
						} else {
							var connectGridId = that.options.connectGridId.split(",");
							for(var i=0;i<connectGridId.length;i++) {
								var id = connectGridId[i];
								connectItem.push("#"+id+" tbody:first");
							}
							connectItem = connectItem.join(", ");
						}
						$("#" + that.element[0].id).grid("sortableGrid",{connectWith:connectItem});
					} catch (e){}
				}
			};
			var adjust = 0;
			npage = npage || 1;
			if (npage > 1) {
				if(pN.npage !== null) {
					prm[pN.npage] = npage;
					adjust = npage - 1;
					npage = 1;
				} else {
					lc = function(req) {
						that.options.page++;
						grid.columnsView.loading = false;
						/*if (lcf) {
							that.options.onload.call(that,req);
						}*/
						that._trigger("onLoad", null, [ req ]);
						that._populate(npage-1);
					};
				}
			} else if (pN.npage !== null) {
				delete that.options.postData[pN.npage];
			}
			if(that.options.grouping) {
				this.groupingSetup();
				var grp = that.options.groupingView, gi, gs="";
				for(gi=0;gi<grp.groupField.length;gi++) {
					var index = grp.groupField[gi];
					$.each(that.options.colModel, function(cmIndex, cmValue) {
						if (cmValue.name === index && cmValue.index){
							index = cmValue.index;
						}
					} );
					gs += index +" "+grp.groupOrder[gi]+", ";
				}
				prm[pN.sort] = gs + prm[pN.sort];
			}
			// TODO: 如果是多列的时候，需要把sortSeparator拓展进去。
			if ( that.options.containSortOrder && prm[pN.sort] && prm[pN.order]) {
				prm[pN.sort] = prm[pN.sort] + that.options.sortSeparator + prm[pN.order]
			}
			$.extend(that.options.postData,prm);
			var rcnt = !that.options.scroll ? 1 : that.rows.length-1;
			var bfr = that._trigger("beforeRequest", null, [ ]);
			if (bfr === false || bfr === 'stop') { return; }
			if ($.isFunction(that.options.datatype)) { that.options.datatype.call(that,that.options.postData,"load_"+that.options.id); return;}
			/*else if($.isFunction(that.options.beforeRequest)) {
				bfr = that.options.beforeRequest.call(that);
				if(bfr === undefined) { bfr = true; }
				if ( bfr === false ) { return; }
			}*/
			dt = that.options.datatype.toLowerCase();
			if (!(that.options.b_sortdata && that.options.b_sortdata === true) && that.options.orgdatatype) {//modify for custom sort
				dt = that.options.orgdatatype;
				that.options.datatype = dt;
			}
			if (!that.options.remoteFilter && that.isFilterAction) {
				dt = "local";
			}
			if (that.options.localonce) {
				dt = "local";
			}
			if ( that.options.initData ) {
				dt = "initinlocal";
			}
			var success = function ( content, st, xhr ){
				
				//if( that.options.loadonce) {that.options.orgdatatype = dt;}// modify for custom sort
				that.options.orgdatatype = dt;// modify for custom sort
				var dReader, drows;
				if(that.options.orgdatatype == "local") {
					dReader =  that.options.localReader;
				} else {
					dReader =  that.options.jsonReader;
				}
				drows = $.grid.getAccessor(content,dReader.root);
				if( that.options.generalLevel === true || that.options.generalLevel == "true") {
					var data1 = that.transformToTreeFormat(drows);
					that.options.data = that.recurrenceNode(data1);
					that.options.data = that.transformToArrayFormat(that.options.data);
					drows = that.options.data;
				}
				// when initInLocal then st and xhr are undefined
				// 如果当前页没有数据，则刷新到前一页
				if ( !that._trigger("beforeProcessing", null, [{content: content, state: st, xhr: xhr}]) ) {
					that._endReq();
					return;
				} else {
					that._addJSONData(content,grid.rowsView,rcnt,npage>1,adjust);
				}
				if( that.options.loadonce || that.options.treeGrid) {
					that.options.datatype = "local";
					that.options.orgpage = that.options.page; // modify for custom sort
				}
				//$(that.element).loading("refresh");
				if( !isPicgrid ) { that._hasScrollOffset(); }
				if( lc ) { lc.call( that,content ); }
				that._trigger("afterLoad", null, [{content:content}]);
				if ( pvis ) { grid.populateVisible(); }
				if (npage === 1) { that._endReq(); }
				
				if ( drows.length == 0 && 
					parseInt(that.options.page) != 1 &&
					parseInt(that.options.lastpage) < parseInt(that.options.page) ) {
					$(that.element).grid("reload",{page:that.options.lastpage});
				}
				content=null;
				that.refresh();
			}
			/*if ( $( ".pager-toolbar", that.element ).length > 0 ) {
				$( ".pager-toolbar", that.element ).toolbar( "option", "disabled", true );
			}*/
			switch(dt)
			{
			case "initinlocal":
				dt = "json";
				success( that.options.initData, null, null );
				this.options.initData = false;
				break;
			case "json":
			case "jsonp":
				if ( this.xhr ){
					this.xhr.abort();
				}
				this.xhr = $.ajax(this._ajaxSettings( ));
				this.xhr
					.success(function(content, st, xhr) {
						success( content, st, xhr );
					}).error(function(xhr,st,err) {						
						that._trigger ("onLoadError", null, [{xhr:xhr,st:st,err:err}]);
						if (npage === 1) { that._endReq(); }
						xhr=null;
						that.refresh();
					}).complete(function( jqXHR, status ) {
						if ( jqXHR === that.xhr ) {
						    that.xhr = null;
						}
					});
			break;
			case "local":
			case "clientside":
				that._beginReq();
				that.options.datatype = "local";
				var req = that._addLocalData();
				this._addJSONData(req,grid.rowsView,rcnt,npage>1,adjust);
				if(!that.options.b_sortdata){
					that.refresh();
					if(lc) { lc.call(that,req); }
					that._trigger("AfterLoad", null,[req]);
					if (pvis) { grid.populateVisible(); }
				}
				that._endReq();
				if (that.options.frozenColumns) {
					that._setFrozenHeight();
				}
			break;
			}
		}
	},
	_setFrozenHeight : function () {
		var that = this,
		    rowId = "",
		    headHeight = 0,
		    frozenHeight = 0,
		    normalHeight = 0;
		if (this.grid.fhDiv){
			headHeight = this.grid.fhDiv.height();
			this.grid.fbDiv.css("top",headHeight);
			$("tr",that.grid.fbDiv).slice(1).each(function(){
				rowId = $(this).attr("id");
				frozenHeight = parseFloat($('td:first', this).height());
				normalHeight = parseFloat($("#"+rowId,that.gridRows).find('td:first').height());
				if (frozenHeight < normalHeight) {
					$("td",this).each(function(){
						$(this).height(normalHeight);
					})
				}else if (frozenHeight > normalHeight) {
					$("td",$("#"+rowId,that.gridRows)).each(function(){
						$(this).height(frozenHeight);
					})
				}
			})  
		}
		if (this.grid.rightfhDiv){
			headHeight = this.grid.rightfhDiv.height();
			this.grid.rightfbDiv.css("top",headHeight);
			$("tr",that.grid.rightfbDiv).slice(1).each(function(){
				rowId = $(this).attr("id");
				frozenHeight = parseFloat($('td:first', this).height());
				normalHeight = parseFloat($("#"+rowId,that.gridRows).find('td:first').height());
				if (frozenHeight < normalHeight) {
					$("td",this).each(function(){
						$(this).height(normalHeight);
					})
				}else if (frozenHeight > normalHeight) {
					$("td",$("#"+rowId,that.gridRows)).each(function(){
						$(this).height(frozenHeight);
					})
				}
			})
		}
	},
	_ajaxSettings :function(){
		var that = this,
			opts = this.options;
		return $.extend({
			url: opts.url,
			type: opts.asyncType,
			beforeSend: function(xhr, settings ){
				var gotoreq = true;
				gotoreq = that._trigger("beforeSend", null, {xhr:xhr, settings:settings});
				if(gotoreq === undefined) { gotoreq = true; }
				if(gotoreq === false) {
					return false;
				} else {
					that._beginReq();
				}
			},
			data: $.isFunction(opts.serializeGridData)? opts.serializeGridData.call(this,opts.postData) : opts.postData,
			dataType: "json"
		}, $.grid.ajaxOptions, opts.ajaxGridOptions);
	},
	_reader: function (datatype) {
		var that = this;
		var field, f=[], j=0, i;
		for(i =0; i<this.options.colModel.length; i++){
			field = this.options.colModel[i];
			if (field.name !== 'cb' && field.name !=='subgrid' && field.name !=='rn') {
				f[j]= datatype == "local" ?
				field.name :
				( (datatype=="xml" || datatype === "xmlstring") ? field.xmlmap || field.name : field.jsonmap || field.name );
				if(that.options.keyName !== false && field.key===true ) {
					that.options.keyName = f[j];
				}
				j++;
			}
		}
		return f;
	},
	_addMulti: function(rowid,pos,irow,checked){
		var that = this,
			isPicgrid = !!(that.options.model == "card"),
			v = "<input role=\"checkbox\" type=\"checkbox\""+" id=\"jqg_"+that.options.id+"_"+rowid+"\" class=\"cbox\" name=\"jqg_"+that.options.id+"_"+rowid+"\"" + (checked ? "checked=\"checked\"" : "")+"/>",
			prp = that._formatCol( pos,irow,'',null, rowid, true);
		if(isPicgrid)return v;
		return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
	},
	_addSingle: function(rowid,pos,irow){
		var that = this,
			isPicgrid = !!(that.options.model == "card"),
			v = "<input role=\"radio\" type=\"radio\""+" id=\"jqg_"+that.options.id+"_"+rowid+"\" class=\"cbox\" name=\"jqg_"+that.options.id+"\"/>",
			prp = that._formatCol( pos,irow,'',null, rowid, true);
		if(isPicgrid)return v;
		return "<td role=\"gridcell\" "+prp+">"+v+"</td>";
	},
	_addRowNum: function (pos,irow,pG,rN) {
		var v =  (parseInt(pG,10)-1)*parseInt(rN,10)+1+irow,
		prp = this._formatCol( pos,irow,v, null, irow, true);
		return "<td role=\"gridcell\" class=\"coral-state-default grid-rownum\" "+prp+">"+v+"</td>";
	},
	_customPanel: function(rd,ni,muti){
		var that = this,
			itemJson = {},
			coreData = "",
			itemData = "",
			toolbarsData = "",
			buttonsData = "";
		
//		if ( typeof( that.options.gridItem ) === "string" ) {
//			that.options.gridItem = window[that.options.gridItem];
//		}
//		if($.isFunction( that.options.gridItem )) {
//			itemJson = that.options.gridItem.call(this, rd);
//		}
		
		//var fun = $.coral.toFunction( that.options.picTemplate );
		
		itemJson = $.coralApply($.coral.toFunction(that.options.picTemplate), that.element[0], [{"rowData":rd,"ni":ni,"muti":muti,"getData":true}]);
		/*if($.isFunction(fun)){
			itemJson = fun.apply(that.element[0],[{"rowData":rd,"ni":ni,"muti":muti,"getData":true}]);
		}*/
		if(typeof(itemJson)=='undefined')return "";
		
		var src = itemJson['src'];
		if(!src)src = "src";
		coreData = itemJson['coreData']||(rd.src ? "<img src='"+rd['src']+"'/>" : "");
		itemData = itemJson['itemData']||"";
		toolbarsData = itemJson['toolbarsData']||"";
		buttonsData = itemJson['buttonsData']||"";
		var ui = []; 
		//ui.push("<div class='rowgridWraper'>");
		ui.push("<ul class='rowgrid coral-component-content coral-corner-all'>");
		if(coreData != ""){
			ui.push("<li class='gridModel1 gridModel'>");
			ui.push(coreData);
			ui.push("<div class='valigh-fix'></div>");
			if(toolbarsData.length>0){
				ui.push("<div class='gridtoolbars'><div class='bgopacity'>&#160;</div>"+toolbarsData+"</div>");
				}
			ui.push("</li>");
		}
		if(itemData.length>0){
			ui.push("<li class='gridModel2 gridModel'>");
			ui.push("<div class='griditem'>"+itemData+"</div>");
			ui.push("</li>");
		}
		if(itemJson.muti && muti.length>0||buttonsData.length>0){
			ui.push("<li class='gridModel3 gridModel'>");
			if(itemData.length>0||buttonsData.length>0){
				ui.push("<ul class='griditem'>");
				if(muti.length>0 && itemJson.muti){
					ui.push("<li class='gridCheckbox'>"+muti+"</li>");
				}
				if(buttonsData.length>0){
					ui.push("<li class='gridbuttons'>"+buttonsData+"</li>");
				}
			ui.push("</ul>");
			}
		ui.push("</li>");
		}
		ui.push("</ul>");
		//ui.push("</div>");
		
		return ui.join("");
		
	},
	_addJSONData: function(data,t, rcnt, more, adjust) {
		var that = this,
			isPicgrid = !!(that.options.model == "card");
		var startReq = new Date();
		if(data) {
			if(that.options.treeANode === -1 && !that.options.scroll) {
				that.emptyRows(t,false, true);
				rcnt=1;
			} else { rcnt = rcnt > 1 ? rcnt :1; }
		} else { return; }

		var dReader, locid = "_id_", frd,
		locdata = (that.options.datatype != "local" && that.options.loadonce) || that.options.datatype == "jsonstring";
		if(locdata) { that.options.data = []; that.options._index = {}; that.options.localReader.id = locid;}
		that.options.reccount = 0;
		if(that.options.datatype == "local") {
			dReader =  that.options.localReader;
			frd= 'local';
		} else {
			dReader =  that.options.jsonReader;
			frd='json';
		}
		var self = this,ir=0,v,i,j,f=[],F,cur,gi=that.options.multiselect?1:0,si=that.options.subGrid?1:0,
			ni=that.options.rownumbers===true?1:0,len,drows,idn,rd={}, fpos, idr,
			rowData=[],orgRowData=[],buttonsData=[],
			cn=(that.options.altRows === true) ? " "+that.options.altclass:"",cn1,lp;
		if(gi==0){//multi 优先
			gi=that.options.singleselect?1:0;
		}
		that.options.page = $.grid.getAccessor(data,dReader.page) || 0;
		lp = $.grid.getAccessor(data,dReader.total);
		that.options.lastpage = lp === undefined ? 1 : lp;
		that.options.records = $.grid.getAccessor(data,dReader.records) || 0;
		that.options.total = $.grid.getAccessor(data,dReader.total) || 0;
		that.options.userData = $.grid.getAccessor(data,dReader.userData) || {};
		if(!dReader.repeatitems) {
			F = f = that._reader(frd);
		}
		if( that.options.keyName===false ) {
			idn = $.isFunction(dReader.id) ? dReader.id.call(that, data) : dReader.id; 
		} else {
			idn = that.options.keyName;
		}
		if(f.length>0 && !isNaN(idn)) {
			if (that.options.remapColumns && that.options.remapColumns.length) {
				idn = $.inArray(idn, that.options.remapColumns);
			}
			idn=f[idn];
		}
		drows = $.grid.getAccessor(data,dReader.root);
		if (!drows) { drows = []; }
		len = drows.length; i=0;
		if (len > 0 && that.options.page <= 0) { that.options.page = 1; }
		var rn = parseInt(that.options.rowNum,10),br=that.options.scroll?$.grid.randId():1, altr, selected=false, selr;
		if (adjust) { rn *= adjust+1; }
		if(that.options.datatype === "local" && !that.options.deselectAfterSort) {
			selected = true;
		}
		var afterInsRow = $.isFunction(that.options.afterInsertRow), grpdata=[], hiderow=false,groupingPrepare;
		if(that.options.grouping)  {
			hiderow = that.options.groupingView.groupCollapse === true;
			//groupingPrepare = $.grid.getMethod("groupingPrepare");
			groupingPrepare = this.groupingPrepare;
		}
		while (i<len) {
			cur = drows[i];
			idr = $.grid.getAccessor(cur,idn);// 行id
			if(idr === undefined) {
				idr = br+i;
				if(f.length===0){
					if(dReader.cell){
						var ccur = $.grid.getAccessor(cur,dReader.cell);
						idr = ccur !== undefined ? ccur[idn] || idr : idr;
						ccur=null;
					}
				}
			}
			idr  = that.options.idPrefix + idr;
			altr = rcnt === 1 ? 0 : rcnt;
			cn1 = (altr+i)%2 == 1 ? cn : '';
			if (selected) {
				if (that.options.multiselect) {
					selr = ($.inArray(idr, that.options.selarrrow) !== -1);
				} else {
					selr = (idr === that.options.selrow);
				}
			}
			var iStartTrTag = rowData.length;
			var iStartPicTag = orgRowData.length;
			
			rowData.push("");
			if( ni ) {// ni为行号
				rowData.push( that._addRowNum(0,i,that.options.page,that.options.rowNum) );
			//	orgRowData.push("rowNum");
			}
			if( gi ){//如果是多选
				if(that.options.singleselect){
					rowData.push( that._addSingle(idr,ni,i,selr) );
					buttonsData.push( that._addSingle(idr,ni,i,selr) );
				}else{
					rowData.push( that._addMulti(idr,ni,i,selr) );
					buttonsData.push( that._addMulti(idr,ni,i,selr) );
				}
			}
			if( si ) {
				rowData.push( $(that.element).grid("addSubGridCell",gi+ni,i+rcnt) );
				//orgRowData.push("SubGrid");
			}
			if (dReader.repeatitems) {
				if(dReader.cell) {cur = $.grid.getAccessor(cur,dReader.cell);}
				if (!F) { F=this._orderedCols(gi+si+ni); }
			}
			for (j=0;j<F.length;j++) {
				v = $.grid.getAccessor(cur,F[j]);
				rd[that.options.colModel[j+gi+si+ni].name] = v;
				rowData.push( this._addCell(idr,v,j+gi+si+ni,i+rcnt,cur, rd) );
			}
			if(that.options.model == "card"){
				orgRowData[iStartTrTag] = that.constructPanel(idr, hiderow, cn1, rd, cur);
				orgRowData.push(that._customPanel(rd,ni,buttonsData));
				orgRowData.push( "</li>" );
			}else{
				rowData[iStartTrTag] = that.constructTr(idr, hiderow, cn1, rd, cur, selr);
				rowData.push( "</tr>" );
			}
			
			if(that.options.grouping) {
				grpdata.push( rowData );
				if(!that.options.groupingView._locgr) {
					groupingPrepare.call(self, rd, i);
				}
				rowData = [];
			}
			if(locdata || that.options.treeGrid===true) {
				rd[locid] = idr;
				that.options.data.push(rd);
				that.options._index[idr] = that.options.data.length-1;
			}
			if(that.options.gridview === false ) {//一次构造一行
				//var customRowData = [];
				if(isPicgrid){
				//	$("#"+$.grid.coralID(that.options.id)+" .coral-pic").append(rowData.join(''));
					$("#"+$.grid.coralID(that.options.id)+" .coral-pic").append(orgRowData.join(''));
				}else{
					$("#"+$.grid.coralID(that.options.id)+" .coral-grid-btable tbody:first").append(rowData.join(''));
				}
				$(that).triggerHandler("gridAfterInsertRow", [idr, rd, cur]);
				if(afterInsRow) {that.options.afterInsertRow.call(that,idr,rd,cur);}
				rowData=[];//ari=0;
				orgRowData=[];
				buttonsData=[];
			}
			rd={};
			ir++;
			i++;
			if(ir==rn) { break; }
		}
		if(that.options.gridview === true ) {//一次全部构造
			fpos = that.options.treeANode > -1 ? that.options.treeANode: 0;
			if(that.options.grouping) {
				if(!locdata) {
					this.groupingRender(grpdata, that.options.colModel.length, that.options.page, rn);
					grpdata = null;
				}f
			} else if(that.options.treeGrid === true && fpos > 0) {
				$(that.rows[fpos]).after(rowData.join(''));
			} else if (that.options.filterToolbar) {
				$("#"+$.grid.coralID(that.options.id+"_table")+" tbody:first").append(rowData.join(''));
			} else {
				$("#"+$.grid.coralID(that.options.id)+" tbody:first").append(rowData.join(''));
			}
		}
		$.fn.afterFmatter.call(that);
		if(that.options.subGrid === true ) {
			try { $(that.element).grid("addSubGrid",gi+ni);} catch (_){}
		}
		that.options.totaltime = new Date() - startReq;
		if(ir>0) {
			if(that.options.records===0) { that.options.records=len; }
		}
		rowData = null;
		if( that.options.treeGrid === true) {
			try {$(that.element).grid("setTreeNode", fpos+1, ir+fpos+1);} catch (e) {}
		}
		if(!that.options.treeGrid && !that.options.scroll&&!isPicgrid) {that.grid.rowsView.scrollTop = 0;}
		that.options.reccount=ir;
		that.options.treeANode = -1;
		if(that.options.userDataOnFooter) { $(that.element).grid("footerData", that.options.userData,true); }
		if(locdata && !that.options.orgdatatype){//modify for custom sort
			that.options.records = len;
			that.options.lastpage = Math.ceil(len/ rn);
		}
		if (!more) { that._updatepager(false,true); }
		if(locdata) {
			while (ir<len && drows[ir]) {
				cur = drows[ir];
				idr = $.grid.getAccessor(cur,idn);
				if(idr === undefined) {
					idr = br+ir;
					if(f.length===0){
						if(dReader.cell){
							var ccur2 = $.grid.getAccessor(cur,dReader.cell);
							idr = ccur2[idn] || idr;
							ccur2=null;
						}
					}
				}
				if(cur) {
					idr  = that.options.idPrefix + idr;
					if (dReader.repeatitems) {
						if(dReader.cell) {cur = $.grid.getAccessor(cur,dReader.cell);}
						if (!F) { F=that._orderedCols(gi+si+ni); }
					}

					for (j=0;j<F.length;j++) {
						v = $.grid.getAccessor(cur,F[j]);
						rd[that.options.colModel[j+gi+si+ni].name] = v;
					}
					rd[locid] = idr;
					if(that.options.grouping) {
						groupingPrepare.call(self, rd, ir );
					}
					that.options.data.push(rd);
					that.options._index[idr] = that.options.data.length-1;
					rd = {};
				}
				ir++;
			}
			if(that.options.grouping) {
				//that.options.groupingView._locgr = true;
				this.groupingRender(grpdata, that.options.colModel.length, that.options.page, rn);
				grpdata = null;
			}
		}
	},
	_addLocalData: function() {
		var that = this;
		var st, fndsort=false, cmtypes={}, grtypes=[], grindexes=[], srcformat, sorttype, newformat;
		if(!$.isArray(that.options.data)) {
			return;
		}
		var grpview = that.options.grouping ? that.options.groupingView : false,lengrp, gin;
		$.each(that.options.colModel,function(){
			sorttype = this.sorttype || "text";
			if(sorttype == "date" || sorttype == "datetime") {
				if(this.formatter && typeof(this.formatter) === 'string' && this.formatter == 'date') {
					if(this.formatoptions && this.formatoptions.srcformat) {
						srcformat = this.formatoptions.srcformat;
					} else {
						srcformat = $.grid.formatter.date.srcformat;
					}
					if(this.formatoptions && this.formatoptions.newformat) {
						newformat = this.formatoptions.newformat;
					} else {
						newformat = $.grid.formatter.date.newformat;
					}
				} else {
					srcformat = newformat = this.datefmt || "Y-m-d";
				}
				cmtypes[this.name] = {"stype": sorttype, "srcfmt": srcformat,"newfmt":newformat};
			} else {
				cmtypes[this.name] = {"stype": sorttype, "srcfmt":'',"newfmt":''};
			}
			if(that.options.grouping) {
				for(gin =0, lengrp = grpview.groupField.length; gin< lengrp; gin++) {
					if( this.name === grpview.groupField[gin]) {
						var grindex = this.name;
						if (this.index) {
							grindex = this.index;
						}
						grtypes[gin] = cmtypes[grindex];
						grindexes[gin]= grindex;
					}
				}
			}
			if(!fndsort && (this.index == that.options.sortname || this.name == that.options.sortname)){
				st = this.name; // ???
				fndsort = true;
			}
		});
		if(that.options.treeGrid) {
			$(that.element).grid("sortTree", st, that.options.sortorder, cmtypes[st].stype, cmtypes[st].srcfmt);
			return;
		}
		var compareFnMap = {
			'eq':function(queryObj) {return queryObj.equals;},
			'ne':function(queryObj) {return queryObj.notEquals;},
			'lt':function(queryObj) {return queryObj.less;},
			'le':function(queryObj) {return queryObj.lessOrEquals;},
			'gt':function(queryObj) {return queryObj.greater;},
			'ge':function(queryObj) {return queryObj.greaterOrEquals;},
			'cn':function(queryObj) {return queryObj.contains;},
			'nc':function(queryObj,op) {return op === "OR" ? queryObj.orNot().contains : queryObj.andNot().contains;},
			'bw':function(queryObj) {return queryObj.startsWith;},
			'bn':function(queryObj,op) {return op === "OR" ? queryObj.orNot().startsWith : queryObj.andNot().startsWith;},
			'en':function(queryObj,op) {return op === "OR" ? queryObj.orNot().endsWith : queryObj.andNot().endsWith;},
			'ew':function(queryObj) {return queryObj.endsWith;},
			'ni':function(queryObj,op) {return op === "OR" ? queryObj.orNot().equals : queryObj.andNot().equals;},
			'in':function(queryObj) {return queryObj.equals;},
			'nu':function(queryObj) {return queryObj.isNull;},
			'nn':function(queryObj,op) {return op === "OR" ? queryObj.orNot().isNull : queryObj.andNot().isNull;}

		},
		query = $.grid.from(that.options.data);
		if (that.options.ignoreCase) { query = query.ignoreCase(); }
		function tojLinq ( group ) {
			var s = 0, index, gor, ror, opr, rule;
			if (group.groups !== undefined) {
				gor = group.groups.length && group.groupOp.toString().toUpperCase() === "OR";
				if (gor) {
					query.orBegin();
				}
				for (index = 0; index < group.groups.length; index++) {
					if (s > 0 && gor) {
						query.or();
					}
					try {
						tojLinq(group.groups[index]);
					} catch (e) {alert(e);}
					s++;
				}
				if (gor) {
					query.orEnd();
				}
			}
			if (group.rules !== undefined) {
				if(s>0) {
					var result = query.select();
					query = $.grid.from( result);
					if (that.options.ignoreCase) { query = query.ignoreCase(); } 
				}
				try{
					ror = group.rules.length && group.groupOp.toString().toUpperCase() === "OR";
					if (ror) {
						query.orBegin();
					}
					for (index = 0; index < group.rules.length; index++) {
						rule = group.rules[index];
						opr = group.groupOp.toString().toUpperCase();
						if (compareFnMap[rule.op] && rule.field ) {
							if(s > 0 && opr && opr === "OR") {
								query = query.or();
							}
							query = compareFnMap[rule.op](query, opr)(rule.field, rule.data, cmtypes[rule.field]);
						}
						s++;
					}
					if (ror) {
						query.orEnd();
					}
				} catch (g) {alert(g);}
			}
		}

		if (that.options.search === true) {
			var srules = that.options.postData.filters;
			if(srules) {
				if(typeof srules == "string") { srules = $.grid.parse(srules);}
				tojLinq( srules );
			} else {
				try {
					query = compareFnMap[that.options.postData.searchOper](query)(that.options.postData.searchField, that.options.postData.searchString,cmtypes[that.options.postData.searchField]);
				} catch (se){}
			}
		}
		if(that.options.grouping) {
			for(gin=0; gin<lengrp;gin++) {
				query.orderBy(grindexes[gin],grpview.groupOrder[gin],grtypes[gin].stype, grtypes[gin].srcfmt);
			}
		}
		if (st && that.options.sortorder && fndsort && that.options.sortname) {//如果没有指定sortname，使用默认的顺序
			if(that.options.sortorder.toUpperCase() == "DESC") {
				query.orderBy(that.options.sortname, "d", cmtypes[st].stype, cmtypes[st].srcfmt);
			} else {
				query.orderBy(that.options.sortname, "a", cmtypes[st].stype, cmtypes[st].srcfmt);
			}
		}
		
		var queryResults = query.select(), 
			ret = that._trigger("afterFilter",null,[{"queryResults":query.select(),"getData":true}])['result'];
		
		
		if(ret)queryResults = ret;
		var recordsperpage = parseInt(that.options.rowNum,10),
		total = queryResults.length,
		page = parseInt(that.options.page,10),
		totalpages = Math.ceil(total / recordsperpage),
		retresult = {};
		if((that.options.search || that.options.resetsearch) && that.options.grouping && that.options.groupingView._locgr) {
			that.options.groupingView.groups =[];
			var j, grPrepare = that.groupingPrepare, key, udc;
			if(that.options.footerrow && that.options.userDataOnFooter) {
				for (key in that.options.userData) {
					if(that.options.userData.hasOwnProperty(key)) {
						that.options.userData[key] = 0;
					}
				}
				udc = true;
			}
			for(j=0; j<total; j++) {
				if(udc) {
					for(key in that.options.userData){
						that.options.userData[key] += parseFloat(queryResults[j][key] || 0);
					}
				}
				grPrepare.call($(this),queryResults[j],j, recordsperpage );
			}
		}
		if(that.options.rowNum == -1){
			queryResults = queryResults.slice( (page-1)*recordsperpage , page*total );
		}else{
			queryResults = queryResults.slice( (page-1)*recordsperpage , page*recordsperpage );
		}
		query = null;
		cmtypes = null;
		if (that.options.orgdatatype) {//modify for custom sort
			retresult[that.options.localReader.total] = that.options.lastpage;
			retresult[that.options.localReader.page] = that.options.orgpage;
			retresult[that.options.localReader.records] = that.options.records;
		} else {
			retresult[that.options.localReader.total] = totalpages;
			retresult[that.options.localReader.page] = page;
			retresult[that.options.localReader.records] = total;
		}
		retresult[that.options.localReader.root] = queryResults;
		retresult[that.options.localReader.userData] = that.options.userData;
		queryResults = null;
		return  retresult;
	},
	getColProp : function(colname){
		var ret ={}, that = this;
		if ( !that.grid ) { return false; }
		var cM = that.options.colModel;
		for ( var i =0;i<cM.length;i++ ) {
			if ( cM[i].name == colname ) {
				ret = cM[i];
				break;
			}
		}
		return ret;
	},
	transTempData: function(obj) {
		var textField,
			valueField;
		function convtree(node, opts){
			for ( var j=0; j<node.length; j++ ) {
				if ( node[j].children ) {
					convtree(node[j].children, opts);
				}
				opts.tempData[node[j].id] = node[j];
			}
		}
		
		if (obj.editoptions && obj.editoptions.data && obj.editoptions.dataStructure === "tree") {
			obj.editoptions.tempData = {};
			textField = obj.editoptions.textField || "name";
			valueField = obj.editoptions.valueField || "id";
			convtree(obj.editoptions.data, obj.editoptions);
		}
		if (obj.formatoptions && obj.formatoptions.data && obj.formatoptions.dataStructure === "tree") {
			obj.formatoptions.tempData = {};
			textField = obj.formatoptions.textField || "name";
			valueField = obj.formatoptions.valueField || "id";
			convtree(obj.formatoptions.data, obj.formatoptions);
		} 
		if (obj.formatoptions && obj.formatoptions.data && obj.formatoptions.dataStructure !== "tree") {
			obj.formatoptions.tempData = {};
			textField = obj.formatoptions.textField || "text";
			valueField = obj.formatoptions.valueField || "value";
			for(var k =0; k< obj.formatoptions.data.length;k++){
				obj.formatoptions.tempData[obj.formatoptions.data[k][valueField]] = obj.formatoptions.data[k];
			}
		}
		if (obj.editoptions && obj.editoptions.data && obj.editoptions.dataStructure !== "tree") {
			obj.editoptions.tempData = {};
			textField = obj.editoptions.textField || "text";
			valueField = obj.editoptions.valueField || "value";
			for(var k =0; k< obj.editoptions.data.length;k++){
				obj.editoptions.tempData[obj.editoptions.data[k][valueField]] = obj.editoptions.data[k];
			}
		}
		return obj;
	},
	setColProp : function(colname, obj){
		//do not set width will not work
		obj = this.transTempData(obj);
		if ( this.grid ) {
			if ( obj ) {
				var cM = this.options.colModel;
				for ( var i =0;i<cM.length;i++ ) {
					if ( cM[i].name == colname ) {
						$.extend(this.options.colModel[i],obj);
						break;
					}
				}
			}
		}
	},
	destroyGroupHeader: function(nullHeader){
		if(typeof(nullHeader) == 'undefined') {
			nullHeader = true;
		}
		var that = this, $tr, i, l, headers, $th, $resizing, grid = that.grid,
		thead = $("table.coral-grid-htable thead", grid.columnsView), cm = that.options.colModel, hc;
		if(!grid) { return; }

		$(this.element).unbind('.setGroupHeaders');
		$tr = $("<tr>", {role: "rowheader"}).addClass("coral-grid-labels");
		headers = grid.headers;
		for (i = 0, l = headers.length; i < l; i++) {
			hc = cm[i].hidden ? "none" : "";
			$th = $(headers[i].el)
				.width(headers[i].width)
				.css('display',hc);
			try {
				$th.removeAttr("rowSpan");
			} catch (rs) {
				//IE 6/7
				$th.attr("rowSpan",1);
			}
			$tr.append($th);
			$resizing = $th.children("span.coral-grid-resize");
			if ($resizing.length>0) {// resizable column
				$resizing[0].style.height = "";
			}
			$th.children("div")[0].style.top = "";
		}
		$(thead).children('tr.coral-grid-labels').remove();
		$(thead).prepend($tr);

		if(nullHeader === true) {
			$(that.element).grid('option',{ 'groupHeader': null});
		}
	},
	setGroupHeaders: function ( o ) {
		o = $.extend({
			useColSpanStyle :  false,
			groupHeaders: []
		},o  || {});
		/*return this.each(function(){*/
		this.options.groupHeader = o;
		var that = this,
		i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
		iCol,
		cghi,
		//startColumnName,
		numberOfColumns,
		titleText,
		cVisibleColumns,
		colModel = that.options.colModel,
		cml = colModel.length,
		ths = that.grid.headers,
		$htable = $("table.coral-grid-htable", that.grid.columnsView),
		$trLabels = $htable.children("thead").children("tr.coral-grid-labels:last").addClass("jqg-second-row-header"),
		$thead = $htable.children("thead"),
		$theadInTable,
		$firstHeaderRow = $htable.find(".jqg-first-row-header");
		if($firstHeaderRow[0] === undefined) {
			$firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
		} else {
			$firstHeaderRow.empty();
		}
		var $firstRow,
		inColumnHeader = function (text, columnHeaders) {
			var i = 0, length = columnHeaders.length;
			for (; i < length; i++) {
				if (columnHeaders[i].startColumnName === text) {
					return i;
				}
			}
			return -1;
		};
		
		that.element.find(".coral-grid-columns-view>table").prepend($thead);
		$tr = $('<tr>', {role: "rowheader"}).addClass("coral-gird-labels jqg-third-row-header");
		for (i = 0; i < cml; i++) {
			th = ths[i].el;
			$th = $(th);
			cmi = colModel[i];
			// build the next cell for the first header row
			thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
			$("<th>", {role: 'gridcell'}).css(thStyle).addClass("coral-first-th-"+that.options.direction).appendTo($firstHeaderRow);

			th.style.width = ""; // remove unneeded style
			iCol = inColumnHeader(cmi.name, o.groupHeaders);
			if (iCol >= 0) {
				cghi = o.groupHeaders[iCol];
				numberOfColumns = cghi.numberOfColumns;
				titleText = cghi.titleText;

				// caclulate the number of visible columns from the next numberOfColumns columns
				for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
					if (!colModel[i + iCol].hidden) {
						cVisibleColumns++;
					}
				}

				// The next numberOfColumns headers will be moved in the next row
				// in the current row will be placed the new column header with the titleText.
				// The text will be over the cVisibleColumns columns
				$colHeader = $('<th>').attr({role: "columnheader"})
					.addClass("coral-state-default coral-th-column-header coral-th-"+that.options.direction)
					.css({/*'height':'22px', */'border-top': '0px none'})
					.html(titleText);
				if(cVisibleColumns > 0) {
					$colHeader.attr("colspan", String(cVisibleColumns));
				}
				if (that.options.headertitles) {
					$colHeader.attr("title", $colHeader.text());
				}
				// hide if not a visible cols
				if( cVisibleColumns === 0) {
					$colHeader.hide();
				}

				$th.before($colHeader); // insert new column header before the current
				$tr.append(th);         // move the current header in the next row

				// set the coumter of headers which will be moved in the next row
				skip = numberOfColumns - 1;
			} else {
				if (skip === 0) {
					if (o.useColSpanStyle) {
						// expand the header height to two rows
						$th.attr("rowspan", "2");
					} else {
						$('<th>', {role: "columnheader"})
							.addClass("coral-state-default coral-th-column-header coral-th-"+that.options.direction)
							.css({"display": cmi.hidden ? 'none' : '', 'border-top': '0px none'})
							.insertBefore($th);
						$tr.append(th);
					}
				} else {
					// move the header to the next row
					//$th.css({"padding-top": "2px", height: "19px"});
					$tr.append(th);
					skip--;
				}
			}
		}
		$theadInTable = $(that.element).find(".coral-grid-htable").children("thead");
		$theadInTable.prepend($firstHeaderRow);
		$tr.insertAfter($trLabels);
		$htable.append($theadInTable);

		if (o.useColSpanStyle) {
			// Increase the height of resizing span of visible headers
			$htable.find("span.coral-gird-resize").each(function () {
				var $parent = $(this).parent();
				if ($parent.is(":visible")) {
					this.style.cssText = 'height: ' + $parent.height() + 'px !important; cursor: col-resize;';
				}
			});

			// Set position of the sortable div (the main lable)
			// with the column header text to the middle of the cell.
			// One should not do this for hidden headers.
			$htable.find("div.coral-gird-sortable").each(function () {
				var $that = $(this), $parent = $that.parent();
				if ($parent.is(":visible") && $parent.is(":has(span.coral-gird-resize)")) {
					$that.css('top', ($parent.height() - $that.outerHeight()) / 2 + 'px');
				}
			});
		}

		$firstRow = $theadInTable.find("tr.jqg-first-row-header");
		$(that.element).bind('gridonresizestop.setGroupHeaders', function (e, nw, idx) {
			$firstRow.find('th').eq(idx).width(nw);
		});
		/*});	*/
	},
	getGridParam : function(pName) {
		var that = this;
		if (!that || !that.grid) {return;}
		if (!pName) { return that.p; }
		else {return typeof(that.options[pName]) != "undefined" ? that.options[pName] : null;}
	},
	setGridParam : function (newParams){
		//return this.each(function(){
			if (this.grid && typeof(newParams) === 'object') {$.extend(true,this.options,newParams);}
		//});
	},
	_setOption: function(key, value) {
		var that = this,
			options = this.options;
		if (this.grid) {$.extend(true,options[key],value);}
		if(key=="height"){
			that._setGridHeight(value);
			that._hasScrollOffset();
		}
		
		if(key=="width"){
			that._setGridWidth(value);
			that._hasScrollOffset();
		}
		if(key=="model"){
			if(value == "grid"){
				that.pic.hide();
				that.gridRows.show();
				that.gridColumns.show();
			}else if(value == "card"){
				that.gridRows.hide();
				that.gridColumns.hide();
				that.pic.show();
			}
		}
		if (key=="datatype") {
			this.options.orgdatatype = value;
		}
		
		this._super(key, value );
	},
	// 改变列表高度的时候判断是否应该为滚动条留出位置
	_hasScrollOffset: function(){
		var that = this,
			grid = this.grid;
		if(grid.rowsView.style.overflow!="hidden"&&grid.rowsView.scroll!="no"&&
				grid.rowsView.scrollHeight>grid.rowsView.offsetHeight){
			$(grid.columnsView).css("padding-right", that.options.scrollOffset+"px");
			return true;
		}else { 
			$(grid.columnsView).css("padding-right","");
			$(grid.rowsView).css("padding-right","");
			return false;
		}
	},
	_hasHorizontalScrollBar: function(){
		var that = this,
			grid = this.grid;
		var fw = that.rightFrozenWidth;
		if(grid.rowsView.style.overflow!="hidden"&&grid.rowsView.scroll!="no"&&
				(grid.rowsView.scrollWidth - grid.rowsView.clientWidth)>0){
			return true;
		}else { 
			return false;
		}
	},
	_setGridWidth : function(nwidth, shrink) {
		// 如果在beforePopulate里面设置了显示隐藏列，那么this.rows还没有生成，宽度统一由grid初始化后去处理。
		if ( !this.grid || nwidth == 0 || !this.rows ) {return;}
		var that = this, 
			grid = this.grid,
			cw,// column width
			initwidth = 0, 
			brd=$.support.boxSizing? 0: that.options.cellLayout, 
			//brd=$.browser.webkit||$.browser.safari? 0: that.options.cellLayout, 
			lvc, // the last number of visible column
			vc=0, // the number of visible column
			hs=false, // has scroll
			scw=that.options.scrollOffset,  // scrollbar width
			aw, // actual width
			gw=0,// grid width
			cl = 0,// the length of column (include the checkbox column and rownumber column)
			cr;
		if(typeof shrink != 'boolean') {
			shrink=that.options.shrinkToFit;
		}
		if(isNaN(nwidth)) {return;}
		else { nwidth = parseInt(nwidth,10); that.grid.width = that.options.width = nwidth;}
		/*if(that.options.pager ) {$(that.options.pager).css("width",nwidth+"px");}
		if(that.options.toppager ) {$(that.options.toppager).css("width",nwidth+"px");}
		if(that.options.toolbar[0] === true){
			$(that.grid.uDiv).css("width",nwidth+"px");
			if(that.options.toolbar[1]=="both") {$(that.grid.ubDiv).css("width",nwidth+"px");}
		}*/
		if(that.options.footerrow) { $(that.grid.sDiv).css("width",nwidth+"px"); }
		if(shrink ===false && that.options.forceFit === true) {that.options.forceFit=false;}
		$.each(that.options.colModel, function() {
			if((this.hidden === false||typeof(this.hidden)=='undefined')){
				cw = this.widthOrg? this.widthOrg: parseInt(this.width,10);
				initwidth += cw+brd;
				if(this.fixed) {
					gw += cw+brd;
				} else {
					vc++;
				}
				cl++;
			}
		});
		var useMinWidth = false;
		if ( that.options.minWidth && initwidth > $(that.element).width() ) {
			useMinWidth = true;
		}
		if(shrink===true || useMinWidth) {
			//if ( useMinWidth ) {
				if(vc  === 0) { return; }
				that.options.tblwidth = initwidth;
				aw = nwidth-brd*vc-gw;
				if(!isNaN(that.options.height)) {
					if($(that.grid.rowsView)[0].clientHeight < $(that.grid.rowsView)[0].scrollHeight || that.rows.length === 1){
						hs = true;
						aw -= scw;
					}
				}
				initwidth =0;
				var cle = that.grid.cols.length >0;
				$.each(that.options.colModel, function(i) {
					if((this.hidden === false||typeof(this.hidden)=='undefined') && !this.fixed){
						cw = this.widthOrg? this.widthOrg: parseInt(this.width,10);
						// 如果设置了最小宽度后，则不进行缩放，cw 按照widthOrg来计算
						if ( !useMinWidth ) {
							// 缩放计算公式
							cw = Math.round(aw*cw/(that.options.tblwidth-brd*vc-gw));
						}
						if (cw < 0) { return; }
						this.width =cw;
						initwidth += cw;
						that.grid.headers[i].width=cw;
						that.grid.headers[i].el.style.width=cw+"px";
						//处理分组的时候列头的宽度
						var groupHeader = $("tr.jqg-first-row-header>th:eq("+i+")", $('table:first',that.grid.columnsView));
						if(groupHeader.length>0){groupHeader[0].style.width = cw+"px";}
						
						if(that.options.footerrow) { that.grid.footers[i].style.width = cw+"px"; }
						if(cle) { that.grid.cols[i].style.width = (cw)+"px"; }
						lvc = i;
					}
				});
				
				if (!lvc) { return; }
				
				cr =0;
				// 设置最后一列的列模型宽度
				if ( !useMinWidth ) {
					if (hs) {
						if(nwidth-gw-(initwidth+brd*vc) !== scw){
							cr = nwidth-gw-(initwidth+brd*vc)-scw;
						}
					} else if( Math.abs(nwidth-gw-(initwidth+brd*vc)) !== 1) {
						cr = nwidth-gw-(initwidth+brd*vc);
					}
					that.options.colModel[lvc].width += (cr - 1);//add for chrome
				} else {
					cr = that.options.colModel[lvc].width;
				}
				that.options.tblwidth = initwidth+cr+brd*vc+gw;
				if(that.options.tblwidth > nwidth) {
					var delta = that.options.tblwidth - parseInt(nwidth,10);
					that.options.tblwidth = nwidth;
					cw = that.options.colModel[lvc].width = that.options.colModel[lvc].width-delta;
				} else {
					cw= that.options.colModel[lvc].width;
				}
				that.grid.headers[lvc].width = cw;
				that.grid.headers[lvc].el.style.width=cw+"px";
				if(cle) { that.grid.cols[lvc].style.width = cw+"px"; }
				if(that.options.footerrow) {
					that.grid.footers[lvc].style.width = cw+"px";
				}
			//}
		}
		$(grid.rowsView).width(nwidth);
		$(grid.columnsView).width(nwidth);
		if(that.options.tblwidth) {
			$('table:first',grid.rowsView).css("width",that.options.tblwidth+"px");//设置表格行宽度
			$('table:first',grid.columnsView).css("width",that.options.tblwidth+"px");//设置表格列宽度
			that.grid.columnsView.scrollLeft = that.grid.rowsView.scrollLeft;
			if(that.options.footerrow) {
				$('table:first',that.grid.sDiv).css("width",that.options.tblwidth+"px");
			}
		}
	},
	_setGridHeight : function (nh) {
		var that = this,
			grid= that.grid,
			isPicgrid = !!(that.options.model == "card");
		if(!that.grid) {return;}
		var rowsView = $(that.grid.rowsView);
		//rowsView.css({height: nh+(isNaN(nh)?"":"px")});
		if(that.options.frozenColumns === true){
			//follow the original set height to use 16, better scrollbar width detection
			$('#'+$.grid.coralID(that.options.id)+"_frozen").parent().height(rowsView.height() - 16);
		}
		// 设置表格高度
		var tblHeight = "auto";
		if(String(nh).toLowerCase() === "auto") { 
			nh = "auto";
			tblHeight = "auto";
			
			that.pic.css({ height: "auto"});//设置大图列表行高度
			rowsView.css({ height: "auto"});//设置表格行高度
		}else{//$(grid.columnsView).height() 隐藏的时候为0
			tblHeight = nh - that.element.find(".coral-grid-pager").height() 
				- $(grid.caption).height();
			that.pic.css({ height: tblHeight+(isNaN(tblHeight)?"":"px")});//设置大图列表行高度
			tblHeight = nh - $(grid.columnsView).outerHeight(true) 
				- that.element.find(".coral-grid-pager").outerHeight(true)
				- $(grid.caption).height();
			rowsView.css({ height: tblHeight+(isNaN(tblHeight)?"":"px")});//设置表格行高度
		}
		
		that.options.height = nh;
		if (that.options.scroll) { that.grid.populateVisible(); }
	},
	getDataIDs : function () {
		var ids=[], i=0, len, j=0;
		var isPicgrid = !!(this.options.model == "card");
		if (isPicgrid) {
			var pic = this.element.find("ul.coral-pic").children("li.gridPanel");
			len = pic.length;
			if (len && len>0) {
				while (i<len) {
					ids[i] = pic[i].id;
					i++;
				}
			}
		}else {
			len = this.rows.length;
			if(len && len>0){
				while(i<len) {
					if($(this.rows[i]).hasClass('jqgrow')) {
						ids[j] = this.rows[i].id;
						j++;
					}
					i++;
				}
			}
		}
		return ids;
	},
	setRowData : function(rowid, data, cssp) {
		var that = this, nm, success=true, title;
		if(!this.grid) {return false;}
		var t = this, vl, ind, cp = typeof cssp, lcdata={};
		ind = t.rows.namedItem(rowid);
		if(!ind) { return false; }
		if( data ) {
			try {
				$(this.options.colModel).each(function(i){
					nm = this.name;
					if( data[nm] !== undefined) {
						/*var _fn = $.coral.toFunction(this.formatter);
						if($.isFunction(_fn)){
							lcdata[nm] = _fn.apply( that.element[0]);
						}else{}*/
						lcdata[nm] = this.formatter && typeof(this.formatter) === 'string' && this.formatter == 'date' ? $.unformat.date.call(t,data[nm],this) : data[nm];
						vl = t._formatter( rowid, data[nm], i, data, 'edit');
						title = this.title ? {"title":$.grid.stripHtml(vl)} : {};
						if(t.options.treeGrid===true && nm == t.options.expandColumn) {
							$("td:eq("+i+") > span:first",ind).html(vl).attr(title);
						} else {
							$("td:eq("+i+")",ind).html(vl).attr(title);
						}
						$.fn.afterFmatter.call(that);
					}
				});
				if(t.options.datatype == 'local') {
					var id = $.grid.stripPref(t.options.idPrefix, rowid),
					pos = t.options._index[id];
					if(t.options.treeGrid) {
						for(var key in t.options.treeReader ){
							if(lcdata.hasOwnProperty(t.options.treeReader[key])) {
								delete lcdata[t.options.treeReader[key]];
							}
						}
					}
					if(typeof(pos) != 'undefined') {
						t.options.data[pos] = $.extend(true, t.options.data[pos], lcdata);
					}
					lcdata = null;
				}
			} catch (e) {
				success = false;
			}
		}
		if(success) {
			if(cp === 'string') {$(ind).addClass(cssp);} else if(cp === 'object') {$(ind).css(cssp);}
			t._trigger("aftercomplete");
		}
		
		return success;
	},
	delRowData : function(rowid) {
		var success = false, rowInd, ia, ri;
		var that = this;
		var isPicgrid = !!(that.options.model == "card");
		if ( isPicgrid ) {
			rowInd = that.pic.children("#"+ rowid)[0];
			if(!rowInd) {return false;}
			else {
				//ri = rowInd.rowIndex;
				$(rowInd).remove();
				that.options.records--;
				that.options.reccount--;
				that._updatepager(true,false);
				success = true;
				if(that.options.multiselect) {
					ia = $.inArray(rowid,that.options.selarrrow);
					if(ia != -1) { that.options.selarrrow.splice(ia,1);}
				}
				if(rowid == that.options.selrow) {that.options.selrow=null;}
			}
			if(that.options.datatype == 'local') {
				var id = $.grid.stripPref(that.options.idPrefix, rowid),
				pos = that.options._index[id];
				if(typeof(pos) != 'undefined') {
					that.options.data.splice(pos,1);
					that.refreshIndex();
				}
			}
		} else {
			rowInd = that.rows.namedItem(rowid);
			if(!rowInd) {return false;}
			else {
				ri = rowInd.rowIndex;
				$(rowInd).remove();
				that.options.records--;
				that.options.reccount--;
				that._updatepager(true,false);
				success=true;
				if(that.options.multiselect) {
					ia = $.inArray(rowid,that.options.selarrrow);
					if(ia != -1) { that.options.selarrrow.splice(ia,1);}
				}
				if(rowid == that.options.selrow) {that.options.selrow=null;}
				if(rowid == that.options.editrow) {
					that.options.editrow=null;
					if (that.rowEditButtons) {
						that.rowEditButtons.remove();
					}
				}
				var sRowArr = $.each( that.options.savedRow, function( i, sRow ) {
					// TODO: 是否有错误？本地和远程数据的判断
					if( sRow.id == ri ) {
						ia = i;
						return true;
					}
				});
				if(sRowArr.length) {
					if(ia != -1) { that.options.savedRow.splice(ia,1);}
				}
			}
			if(that.options.datatype == 'local') {
				var id = $.grid.stripPref(that.options.idPrefix, rowid),
				pos = that.options._index[id];
				if(typeof(pos) != 'undefined') {
					that.options.data.splice(pos,1);
					that.refreshIndex();
				}
			}
			if( that.options.altRows === true && success ) {
				var cn = that.options.altclass;
				$(that.rows).each(function(i){
					if(i % 2 ==1) { $(this).addClass(cn); }
					else { $(this).removeClass(cn); }
				});
			}
			// 如果已经删除完则取消全选框
			if (!that.getDataIDs().length) {
				that._cancelCheckAll();
			}
			if (this.options.frozenColumns) {
				this._setFrozenHeight();
			}
			return success;
		}		
	},
	/**
	 * 若存在选框，则将之取消选中
	 */
	_cancelCheckAll: function() {
		var that = this;
		
		if (that.options.multiselect) {
			$('#cb_'+$.grid.coralID(that.options.id),that.grid.columnsView)[that.options.useProp ? 'prop' : 'attr']("checked", false);
		}
	},
	resetSelection : function( rowid ){
		var t = this, ind, sr, fid;
		if( t.options.frozenColumns === true ) {
			fid = t.options.id+"_frozen";
		}
		if(typeof(rowid) !== "undefined" ) {
			sr = rowid === t.options.selrow ? t.options.selrow : rowid;
			$("#"+$.grid.coralID(t.options.id)+" tbody:first tr#"+$.grid.coralID(sr)).removeClass("coral-state-highlight").attr("aria-selected","false");
			if (fid) { $("#"+$.grid.coralID(sr), "#"+$.grid.coralID(fid)).removeClass("coral-state-highlight"); }
			if(t.options.multiselect) {
				$("#jqg_"+$.grid.coralID(t.options.id)+"_"+$.grid.coralID(sr), "#"+$.grid.coralID(t.options.id))[t.options.useProp ? 'prop': 'attr']("checked",false);
				if(fid) { $("#jqg_"+$.grid.coralID(t.options.id)+"_"+$.grid.coralID(sr), "#"+$.grid.coralID(fid))[t.options.useProp ? 'prop': 'attr']("checked",false); }
				t._setHeadCheckBox( false);
			}
			sr = null;
		} else if(!t.options.multiselect) {
			if(t.options.selrow) {
				$("#"+$.grid.coralID(t.options.id)+" tbody:first tr#"+$.grid.coralID(t.options.selrow)).removeClass("coral-state-highlight").attr("aria-selected","false");
				if(fid) { $("#"+$.grid.coralID(t.options.selrow), "#"+$.grid.coralID(fid)).removeClass("coral-state-highlight"); }
				t.options.selrow = null;
			}
		} else {
			$(t.options.selarrrow).each(function(i,n){
				ind = t.rows.namedItem(n);
				$(ind).removeClass("coral-state-highlight").attr("aria-selected","false");
				$("#jqg_"+$.grid.coralID(t.options.id)+"_"+$.grid.coralID(n))[t.options.useProp ? 'prop': 'attr']("checked",false);
				if(fid) { 
					$("#"+$.grid.coralID(n), "#"+$.grid.coralID(fid)).removeClass("coral-state-highlight"); 
					$("#jqg_"+$.grid.coralID(t.options.id)+"_"+$.grid.coralID(n), "#"+$.grid.coralID(fid))[t.options.useProp ? 'prop': 'attr']("checked",false);
				}
			});
			t._setHeadCheckBox( false );
			t.options.selarrrow = [];
		}
		if(t.options.cellEdit === true) {
			if(parseInt(t.options.iCol,10)>=0  && parseInt(t.options.iRow,10)>=0) {
				$("td:eq("+t.options.iCol+")",t.rows[t.options.iRow]).removeClass("edit-cell coral-state-highlight");
				$(t.rows[t.options.iRow]).removeClass("selected-row coral-state-hover");
			}
		}
		t.options.savedRow = [];
	},
	getRowData : function( rowid ) {
		var res = {}, resall, getall=false, len, j=0;
		var that = this,nm,ind;
		var isPicgrid = !!(that.options.model == "card");
		if( isPicgrid ) {
			if(typeof(rowid) == 'undefined') {
				getall = true;
				resall = [];
				len = that.pic.children("li").length;
			} else {
				ind = that.pic.children("#"+ rowid)[0];
				if(!ind) { return res; }
				len = 2;
			}
			var localKey = "_id_";
			while(j<len){
				if(getall) { ind = that.pic.children("li")[j]; }
				if( $(ind).hasClass('gridPanel') ) {
					for ( var k = 0; k < that.options.data.length; k++ ){
						if ( that.options.data[k][localKey] == ind.id ) {
							res = that.options.data[k];
						}
					}
					if(getall) { resall.push(res); res={}; }
				}
				j++;
			}
		} else {
			if(typeof(rowid) == 'undefined') {
				getall = true;
				resall = [];
				len = that.rows.length;
			} else {
				ind = that.rows.namedItem(rowid);
				if(!ind) { return res; }
				len = 2;
			}
			while(j<len){
				if(getall) { ind = that.rows[j]; }
				if( $(ind).hasClass('jqgrow') ) {
					$('td[role="gridcell"]',ind).each( function(i) {
						nm = that.options.colModel[i].name;
						if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn') {
							if(that.options.treeGrid===true && nm == that.options.expandColumn) {
								res[nm] = $.grid.htmlDecode($("span:first",this).html());
							} else {
								try {
									if(that.options.enableHighlight == true){
										res[nm] = $.unformat.call(that,this,{rowId:ind.id, colModel:that.options.colModel[i]},i,true);	
									}else{
										res[nm] = $.unformat.call(that,this,{rowId:ind.id, colModel:that.options.colModel[i]},i,"get");								
									}
								} catch (e){
									res[nm] = $.grid.htmlDecode($(this).html());
								}
							}
						}
					});
					if(getall) { resall.push(res); res={}; }
				}
				j++;
			}
		}
		return resall ? resall: res;
	},
	/**
	 * rowid: 行号
	 * rdata: 行数据
	 * pos: 插入数据的位置
	 * src: pos为after的目标行id
	 * */
	addRowData: function(rowid,rdata,pos,src) {
		if(!pos) {pos = "last";}
		var success = false, nm, row, picRow, buttonsData, gi, si, ni,sind, i, v, prp="", aradd, cnm, cn, data, cm, id;
		if(rdata) {
			if($.isArray(rdata)) {
				aradd=true;
				//pos = "last";
				cnm = rowid;
			} else {
				rdata = [rdata];
				aradd = false;
			}
			//this.each(function() {
			var t = this, datalen = rdata.length;
			var isPicgrid = !!(t.options.model == "card");
			ni = t.options.rownumbers===true ? 1 :0;
			gi = t.options.multiselect ===true ? 1 :(t.options.singleselect === true ? 1 :0);
			si = t.options.subGrid===true ? 1 :0;
			/*if(gi == 0){
				gi = t.options.singleselect === true ? 1 :0;
			}*/
			if(!aradd) {
				if(typeof(rowid) != 'undefined') { rowid = rowid+"";}
				else {
					rowid = $.grid.randId();
					if(t.options.keyName !== false) {
						cnm = t.options.keyName;
						if(typeof rdata[0][cnm] != "undefined") { rowid = rdata[0][cnm]+""; }
					}
				}
			}
			cn = t.options.altclass;
			var k = 0, cna ="", lcdata = {},
			air = $.isFunction(t.options.afterInsertRow) ? true : false;
			while(k < datalen) {
				data = rdata[k];
				row=[];
				buttonsData = [];
				picRow = [];
				if(aradd) {
					try {rowid = data[cnm]+"";}
					catch (e) {rowid = $.grid.randId();}
					cna = t.options.altRows === true ?  (t.rows.length-1)%2 === 0 ? cn : "" : "";
				}
				cna += " new-row ";
				id = rowid;
				rowid  = t.options.idPrefix + rowid;
				if(ni){
					prp = t._formatCol(0,1,'',null,rowid, true);
					row[row.length] = "<td role=\"gridcell\" aria-describedby=\""+t.options.id+"_rn\" class=\"coral-state-default grid-rownum\" "+prp+">0</td>";
				}
				if(gi) {
					if(this.options.singleselect){
						v = "<input role=\"radio\" type=\"radio\""+" id=\"jqg_"+t.options.id+"_"+rowid+"\" name=\"jqg_"+t.options.id+"\" class=\"cbox\"/>";
					}else{
						v = "<input role=\"checkbox\" type=\"checkbox\""+" id=\"jqg_"+t.options.id+"_"+rowid+"\" name=\"jqg_"+t.options.id+"_"+rowid+"\" class=\"cbox\"/>";
					}
					prp = t._formatCol(ni,1,'', null, rowid, true);
					row[row.length] = "<td role=\"gridcell\" aria-describedby=\""+t.options.id+"_cb\" "+prp+">"+v+"</td>";
					buttonsData.push(v);
				}
				if(si) {
					row[row.length] = $(t).grid("addSubGridCell",gi+ni,1);
				}
				
				for(i = gi+si+ni; i < t.options.colModel.length;i++){
					cm = t.options.colModel[i];
					nm = cm.name;
					//lcdata[nm] = cm.formatter && typeof(cm.formatter) === 'string' && cm.formatter == 'date' ? $.unformat.date.call(t,data[nm],cm) : data[nm];
					lcdata[nm] = data[nm];
					v = t._formatter( rowid, $.grid.getAccessor(data,nm), i, data);
					prp = t._formatCol(i,1,v, data, rowid, true);
					row[row.length] = "<td role=\"gridcell\" aria-describedby=\""+t.options.id+"_"+nm+"\" "+prp+">"+v+"</td>";
				}
				if(isPicgrid){
					picRow.unshift( t.constructPanel( rowid, false, cna, lcdata, lcdata ) );
					picRow.push(t._customPanel(lcdata,ni,buttonsData));
					picRow.push( "</li>" );
				}else{
					row.unshift( t.constructTr( rowid, false, cna, lcdata, lcdata ,false) );
					row[row.length] = "</tr>";
				}
				if(isPicgrid){
					$("#"+$.grid.coralID(t.options.id)+" .coral-pic").append(picRow.join(''));
				}else{
					if(t.rows.length === 0){
						$("table:first",t.grid.rowsView).append(row.join(''));
					} else {
						switch (pos) {
						case 'last':
							$(t.rows[t.rows.length-1]).after(row.join(''));
							sind = t.rows.length-1;
							break;
						case 'first':
							$(t.rows[0]).after(row.join(''));
							sind = 1;
							break;
						case 'after':
							sind = t.rows.namedItem(src);
							if (sind) {
								if($(t.rows[sind.rowIndex+1]).hasClass("coral-subgrid")) { $(t.rows[sind.rowIndex+1]).after(row); }
								else { $(sind).after(row.join('')); }
							}
							sind++;
							break;
						case 'before':
							sind = t.rows.namedItem(src);
							if(sind) {$(sind).before(row.join(''));sind=sind.rowIndex;}
							sind--;
							break;
						}
					}
				}
				if(t.options.subGrid===true) {
					$(t).grid("addSubGrid",gi+ni, sind);
				}
				t.options.records++;
				t.options.reccount++;
				t._trigger("afterInsertRow", null,  [{"rowId":rowid,"data":data}]);
				if(air) { t.options.afterInsertRow.call(t,rowid,data,data); }
				k++;
				if(t.options.datatype == 'local') {
					lcdata[t.options.localReader.id] = id;
					t.options._index[id] = t.options.data.length;
					t.options.data.push(lcdata);
					lcdata = {};
				}
			}
			if( t.options.altRows === true && !aradd) {
				if (pos == "last") {
					if ((t.rows.length-1)%2 == 1)  {$(t.rows[t.rows.length-1]).addClass(cn);}
				} else {
					$(t.rows).each(function(i){
						if(i % 2 ==1) { $(this).addClass(cn); }
						else { $(this).removeClass(cn); }
					});
				}
			}
			t._updatepager(true,true);
			success = true;
			$("#noRecordsTips_"+$.grid.coralID(t.options.id)).hide();
			$.fn.afterFmatter.call(t);
			//});
		}
		if (this.options.frozenColumns) {
			this._setFrozenHeight();
		}
		return success;
	},
	footerData: function(data, format) {
		var nm, action = "set", success=false, res={}, title;
		function isEmpty(obj) {
			var i;
			for(i in obj) {
				if (obj.hasOwnProperty(i)) { return false; }
			}
			return true;
		}
		if(data == undefined) { action = "get"; }
		if(typeof format !== "boolean") { format  = true; }
		action = action.toLowerCase();
		//this.each(function(){
			var t = this, vl;
			if(!t.grid || !t.options.footerrow) {return false;}
			if(action === "set") { if(isEmpty(data)) { return false; } }
			success=true;
			$(this.options.colModel).each(function(i){
				nm = this.name;
				if(action === "set") {
					if( data[nm] !== undefined) {
						vl = format ? t._formatter( "", data[nm], i, data, 'edit') : data[nm];
						title = this.title ? {"title":$.grid.stripHtml(vl)} : {};
						$("tr.footrow td:eq("+i+")",t.grid.sDiv).html(vl).attr(title);
						success = true;
					}
				} else if(action === "get") {
					res[nm] = $("tr.footrow td:eq("+i+")",t.grid.sDiv).html();
				}
			});
			$.fn.afterFmatter.call(t);
		//});
		return action === "get" ? res : success;
	},
	clearGridData : function(clearfooter) {
		var that = this;
		var isPicgrid = !!(that.options.model == "card");
		if(!that.grid) {return;}
		if(typeof clearfooter != 'boolean') { clearfooter = false; }
		if(isPicgrid){
			$("#"+$.grid.coralID(that.options.id)+" .coral-pic").empty();
		}else{
			if(that.options.deepempty) {$("#"+$.grid.coralID(that.options.id)+" tbody:first tr:gt(0)").remove();}
			else {
				var trf = $(" tbody:first tr:first",that.element)[0];
				$(" tbody:first",that.element).empty().append(trf);
			}
		}
		
		if(that.options.footerrow && clearfooter) { $(".coral-grid-ftable td",that.grid.sDiv).html("&#160;"); }
		that.options.selrow = null; that.options.selarrrow= []; that.options.savedRow = [];
		that.options.records = 0;that.options.page=1;that.options.lastpage=0;that.options.reccount=0;
		that.options.data = []; that.options._index = {};
		that._updatepager(true,false);
		
		that._cancelCheckAll();
	},
	sortableRows : function () {
		var opts = {}, t = 0;
		if (opts.sortableRowsOptions) {
			$.extend(opts, opts.sortableRowsOptions);
		}
		// Can accept all sortable options and events
		var that = this;
		if(!that.grid) { return; }
		// Currently we disable a treeGrid sortable
		if(that.options.treeGrid) { return; }
		if($.fn.sortable) {
			opts = $.extend({
				"cursor":"move",
				"axis" : "y",
				"items": ".jqgrow"
				},
			opts || {});
			opts.change = function( e, ui ){
				ui.prevItemId = $(ui.placeholder[0]).prev("tr").attr("id");
				ui.nextItemId = $(ui.placeholder[0]).next("tr").attr("id");
				ui.targetId = ui.position.top>ui.originalPosition.top?ui.prevItemId:ui.nextItemId;
				$( "#"+that.id+" #"+ui.targetId ).siblings().removeClass( "coral-state-target" );
				$( "#"+that.id+" #"+ui.targetId ).addClass( "coral-state-target" );
				that._trigger("onSortableRows", e, [ui]);
			};
			opts.start = function(e,ui) {
				$(ui.item).css("border-width","0px");
				ui.originalPermutation = [];
				if ( ui.item.is("tr" )){
					$("td",ui.item).each(function(i){
						this.style.width = that.grid.cols[i].style.width;
					});
				} else {
					$("td",ui.item.find("tr:first")).each(function(i){
						this.style.width = that.grid.cols[i].style.width;
					});
				}
				if( that.options.subGrid ) {
					var subgid = $(ui.item).attr("id");
					try {
						$(that).grid('collapseSubGridRow',subgid);
					} catch (e) {}
				}	
				$("tr.jqgrow",that.element.find(".coral-grid-btable")).each(function(){
					this.id!==""&& ui.originalPermutation.push(this.id);
				});	
				that.sortableRowOriginalPermutation = ui.originalPermutation;
				that._trigger("beforeSortableRows", e, [ui]);
			};
			
			opts.update = function ( e, ui ) {
				$(ui.item).css("border-width","");
				ui.itemId = [];
				ui.permutation = [];
				ui.originalPermutation = that.sortableRowOriginalPermutation||[];

				if(that.options.rownumbers === true) {
					$("td.grid-rownum",that.rows).each(function(i){
						$(this).html( i+1+(parseInt(that.options.page,10)-1)*parseInt(that.options.rowNum,10) );
						ui.permutation.push(that.rows[i+1].id);
					});	
				}else{
					$("tr.jqgrow", that.grid.rowsView).each(function( i ){
						ui.permutation.push(this.id);
					});
				}
				$.each(ui.item, function(i){
					ui.itemId.push(ui.item[i].id);
				});
				ui.prevItemId = $(ui.item[0]).prev("tr").attr("id");
				ui.nextItemId = $(ui.item[0]).next("tr").attr("id");
				ui.targetId = ui.position.top>ui.originalPosition.top?ui.prevItemId:ui.nextItemId;
				var dr = $.data(that.element[0], "dns-ref");
				if ( dr ){
					var opts = $.data( dr,"dns" );
					if(opts.dragToSort){
						ui.item.remove();
						opts.dragToSort = false;
						var i=0;
						if(ui.targetId){
							for(;i<opts.dataItems.length;i++){
								$(dr).grid("delRowData", opts.dataItems[i].id);
							}
							that.element.grid("addRowData", opts.rowid, opts.dataItems, "after", ui.targetId);
							//$.message("添加到条目: "+ui.targetId)
						} 
					}
				}
				$( "#"+that.id+" #"+ui.targetId ).removeClass( "coral-state-target" );
				that._trigger("afterSortableRows", e, [ui]);
			};
			$("tbody:first",that.grid.rowsView).sortable(opts);
			//$("tbody:first",that.grid.rowsView).disableSelection();
		}
	},
	destroySortableRows : function (opts) {
		var that = this;
		if(!that.grid) { return; }
		if($.fn.sortable)
			$("tbody:first",that.grid.rowsView).sortable( 'destroy' );
	},
	
	sortableGrid: function(opts) {
		var itemId, selectData, deleteData, prevItemId, grid, originalPermutation, originalPermutationlInnerListId,
			that = this;
		$("tbody:first",that.element).sortable({
			appendTo: 'body',
			connectWith: opts.connectWith,
			helper: function(e ,ui) {
				itemId = $(e.target).parent("tr")[0].id;
				var i = 0,
					html = $("<div></div>");
				html.append($(e.target).parent("tr").clone());
				var originalGrid = $("#"+itemId).closest(".ctrl-init-grid ")[0].id;
				originalPermutationlInnerListId = $("#" + originalGrid).grid("getCol","id");
				return html;
				return itemId;
			},
			start: function(e, ui) {
				itemId = ui.item[0].id;
				prevItemId = $(ui.placeholder[0]).prev("tr").attr("id");
				nextItemId = $(ui.placeholder[0]).next("tr").attr("id");
				grid = this.closest(".ctrl-init-grid ").id;
				grid1 =$("#"+ prevItemId).closest(".ctrl-init-grid ")[0].id;
				deleteData = $("#"+ grid).grid("getRowData", itemId);
				if (prevItemId == itemId) {
					prevItemId = $("#"+prevItemId).prev("tr").attr("id");
				}
				if (prevItemId) {
					prevItem = $("#"+ grid).grid("getRowData", prevItemId);
				} else {
					prevItemId = null;
					prevItem = null;
				}
				if (nextItemId) {
					nextItem = $("#"+ grid).grid("getRowData", nextItemId);
				} else {
					nextItemId = null;
					nextItem = null;
				}
				that._trigger("onSortableStart", e, {originalPermutation:originalPermutationlInnerListId});
			},
			stop: function(e ,ui) {
				itemId = ui.item[0].id;
				var grid2,
					prevItemId = $("#"+itemId).prev("tr").attr("id"),
					nextItemId = $("#"+itemId).next("tr").attr("id");
				if (prevItemId) {
					grid2 = $("#"+prevItemId).closest(".ctrl-init-grid ")[0].id;
					prevItem = $("#"+ grid2).grid("getRowData", prevItemId);
				} else {
					prevItemId = null;
					prevItem = null;
				}
				if (nextItemId) {
					grid2 =$("#"+nextItemId).closest(".ctrl-init-grid ")[0].id;
					nextItem = $("#"+ grid2).grid("getRowData", nextItemId);
				} else {
					nextItemId = null;
					nextItem = null;
				}
				if (grid2 == grid1) {
					var sel = $("#" + grid2).grid("getCol","id");
					that._trigger("onSortableStop", e, {datafrom:grid1, currentGrid:grid2, itemId:itemId, prevItemId:prevItemId, nextItemId:nextItemId, originalPermutation:originalPermutationlInnerListId, permutation:sel, prevItem:prevItem, nextItem:nextItem});
				}
			},
			activate: function(e, ui) {
				itemId = ui.item[0].id;
				grid = this.closest(".ctrl-init-grid ").id;
				originalPermutation = $("#" + grid).grid("getCol","id");
			},
			remove: function(e, ui) {
				grid = this.closest(".ctrl-init-grid ").id;
				$("#"+ grid + " tbody:first").append(ui.item.clone());
				$("#"+ grid1).grid("delRowData", itemId);
				var permutation = $("#" + grid).grid("getCol","id");
				if (prevItemId) {
					prevItem = $("#"+ grid1).grid("getRowData", prevItemId);
				} else {
					prevItemId = null;
					prevItem = null;
				}
				if (nextItemId) {
					nextItem = $("#"+ grid1).grid("getRowData", nextItemId);
				} else {
					nextItemId = null;
					nextItem = null;
				}
					that._trigger("onSortableRemove", e,{datafrom:grid1, deleteData:deleteData, itemId:itemId, originalPrevItemId:prevItemId, originalNextItemId:nextItemId, originalPermutation:originalPermutationlInnerListId, permutation:permutation, originalPrevItem:prevItem, originalNextItem:nextItem});
				},
			receive: function(e, ui) {
				itemId = ui.item[0].id;
				grid = this.closest(".ctrl-init-grid ").id;
				selectData = $("#"+ grid).grid("getRowData", itemId);
				$("#"+ grid).grid("addRowData", itemId, selectData, "first");
				$("#" + itemId).remove();
				var permutation = $("#" + grid).grid("getCol","id"),
					prevItemId = $("#"+itemId).prev("tr").attr("id"),
					nextItemId = $("#"+itemId).next("tr").attr("id");
				if (prevItemId) {
					prevItem = $("#"+ grid).grid("getRowData", prevItemId);
				} else {
					prevItemId = null;
					prevItem = null;
				}
				if (nextItemId) {
					nextItem = $("#"+ grid).grid("getRowData", nextItemId);
				} else {
					nextItemId = null;
					nextItem = null;
				}
					that._trigger("onSortableReceive", e, {datafrom:grid1, currentGrid:grid, itemId:itemId, item:selectData, prevItemId:prevItemId, nextItemId:nextItemId, originalPermutation:originalPermutation, permutation:permutation, prevItem:prevItem, nextItem:nextItem});
				}
		});
	},
	gridDnS : function(opts) {
		var that = this,
			t = 0,
			items = [];
		if(!that.grid) { return; }
		// Currently we disable a treeGrid drag and drop
		if(that.options.treeGrid) { return; }
		if(!$.fn.draggable || !$.fn.droppable) { return; }
		var appender = "<table id='grid_dns' class='coral-grid-dns'></table>";
		if($("#grid_dns")[0] === undefined) {
			$('body').append(appender);
		}
		if(!opts.connectWith) { return; }
		opts.connectWith = opts.connectWith.split(",");
		opts.connectWith = $.map(opts.connectWith,function(n){return $.trim(n);});
		var connectToSortableOpts = opts.connectWith.join(" .coral-grid-btable>tbody, ")+" .coral-grid-btable>tbody";
		opts = $.extend({
			"onstart" : null,
			"onstop" : null,
			"beforedrop": null,
			"ondrop" : null,
			"dragcopy": false,
			"dropbyname" : false,
			"droppos" : "first",
			"autoid" : true,
			"rowid" : "id",
			"dataItems" : [],
			"autoidprefix" : "dns_"
		}, opts || {});
		
		$.data(that.element[0],"dns",opts);
		
		if(that.options.reccount != "0" && !that.options.jqgdns) {
			var datadns = $.data(that.element,"dns");
		    $("tr.jqgrow:not(.coral-sortable)",that.element).draggable({
		    	"revert": "invalid",
				"helper": function( e, ui ){
					 var tId = $(e.target).parent("tr")[0].id,
					 	 i = 0,
					 	 html = $("<div></div>"),
					 	 sel = that.element.grid("option", "selarrrow").concat();
					 $.data(that.element[0],"dns").dataItems = [];
					 if($.inArray(tId, sel)>-1){
						 for( i;i<sel.length;i++ ){
							 $.data(that.element[0],"dns").dataItems.push($( that.element ).grid("getRowData", sel[i]));
							 html.append($( ".coral-grid-btable>tbody #"+sel[i], that.element ).clone());
						 }
						 return html;
					 }else{
						 $.data(that.element[0],"dns").dataItems.push( that.element.grid("getRowData", tId) );
						 html.append($(e.target).parent("tr").clone());
						 return html;
					 }
				 },
				"connectToSortable": connectToSortableOpts,
				"cursor": "move",
				"appendTo" : "#grid_dns",
				"zIndex": 5000,
		    	"start" : function (ev, ui) {
					// if we are in subgrid mode try to collapse the node
					if(that.options.subGrid) {
						var subgid = $(ui.helper).attr("id");
						try {
							$(that.element).grid('collapseSubGridRow',subgid);
						} catch (e) {}
					}
					$.data(that.element[0],"dns").dragToSort = true;
					// hack
					// drag and drop does not insert tr in table, when the table has no rows
					// we try to insert new empty row on the target(s)
					for (var i=0;i<$.data(that.element[0],"dns").connectWith.length;i++){
						if($($.data(that.element[0],"dns").connectWith[i]).grid('option','reccount') == "0" ){
							$($.data(that.element[0],"dns").connectWith[i]).grid('addRowData','jqg_empty_row',{});
						}
					}
					ui.helper.addClass("coral-state-highlight");
					$("td",ui.helper.find("tr:first")).each(function(i) {
						this.style.width = that.grid.headers[i].width+"px";
					});
					if(opts.onstart && $.isFunction(opts.onstart) ) { opts.onstart.call($($t),ev,ui); }
				},
				"stop" :function(ev,ui) {
					if(ui.helper.dropped && !opts.dragcopy) {
						var ids = $(ui.helper).attr("id");
						if(ids === undefined) { ids = $(this).attr("id"); }
						$(that.element).grid('delRowData',ids );
					}
					// if we have a empty row inserted from start event try to delete it
					for (var i=0;i<$.data(that.element[0],"dns").connectWith.length;i++){
						$($.data(that.element[0],"dns").connectWith[i]).grid('delRowData','jqg_empty_row');
					}
					if(opts.onstop && $.isFunction(opts.onstop) ) { opts.onstop.call($($t),ev,ui); }
					
					
				}
		    });
		}
		that.options.jqgdns = true;
		for (var i=0;i<opts.connectWith.length;i++){
			var cn =opts.connectWith[i];
			$.data( $(cn)[0],"dns-ref", that.element[0] );
		}
	},
	gridDnD : function(opts) {
		var that = this;
		if(!that.grid) { return; }
		// Currently we disable a treeGrid drag and drop
		if(that.options.treeGrid) { return; }
		if(!$.fn.draggable || !$.fn.droppable) { return; }
		function updateDnD ()
		{
			var datadnd = $.data(that.element,"dnd");
		    $("tr.jqgrow:not(.coral-draggable)",that.element).draggable($.isFunction(datadnd.drag) ? datadnd.drag.call($(that.element),datadnd) : datadnd.drag);
		}
		var appender = "<table id='jqgrid_dnd' class='coral-grid-dnd'></table>";
		if($("#jqgrid_dnd")[0] === undefined) {
			$('body').append(appender);
		}

		if(typeof opts == 'string' && opts == 'updateDnD' && that.options.jqgdnd===true) {
			updateDnD();
			return;
		}
		if(!opts.connectWith) { return; }
		opts.connectWith = opts.connectWith.split(",");
		opts.connectWith = $.map(opts.connectWith,function(n){return $.trim(n);});
		var connectToSortableOpts = opts.connectWith.join(" .coral-grid-btable>tbody, ")+" .coral-grid-btable>tbody";
		
		opts = $.extend({
			"drag" : function (opts) {
				return $.extend({
					start : function (ev, ui) {
						// if we are in subgrid mode try to collapse the node
						if(that.options.subGrid) {
							var subgid = $(ui.helper).attr("id");
							try {
								$(that.element).grid('collapseSubGridRow',subgid);
							} catch (e) {}
						}
						// hack
						// drag and drop does not insert tr in table, when the table has no rows
						// we try to insert new empty row on the target(s)
						for (var i=0;i<$.data(that.element,"dnd").connectWith.length;i++){
							if($($.data(that.element,"dnd").connectWith[i]).grid('option','reccount') == "0" ){
								$($.data(that.element,"dnd").connectWith[i]).grid('addRowData','jqg_empty_row',{});
							}
						}
						ui.helper.addClass("coral-state-highlight");
						$("td",ui.helper).each(function(i) {
							this.style.width = that.grid.headers[i].width+"px";
						});
						if(opts.onstart && $.isFunction(opts.onstart) ) { opts.onstart.call($($t),ev,ui); }
					},
					stop :function(ev,ui) {
						if(ui.helper.dropped && !opts.dragcopy) {
							var ids = $(ui.helper).attr("id");
							if(ids === undefined) { ids = $(this).attr("id"); }
							$(that.element).grid('delRowData',ids );
						}
						// if we have a empty row inserted from start event try to delete it
						for (var i=0;i<$.data(that.element,"dnd").connectWith.length;i++){
							$($.data(that.element,"dnd").connectWith[i]).grid('delRowData','jqg_empty_row');
						}
						if(opts.onstop && $.isFunction(opts.onstop) ) { opts.onstop.call($($t),ev,ui); }
					}
				},opts.drag_opts || {});
			},
			"drop" : function (opts) {
				return $.extend({
					accept: function(d) {
						if (!$(d).hasClass('jqgrow')) { return d;}
						var tid = $(d).closest("table.coral-grid-btable");
						if(tid.length > 0 && $.data(that.element,"dnd") !== undefined) {
						    var cn = $.data(that.element,"dnd").connectWith;
						    return $.inArray('#'+$.grid.coralID(this.id),cn) != -1 ? true : false;
						}
						return false;
					},
					drop: function(ev, ui) {
						if (!$(ui.draggable).hasClass('jqgrow')) { return; }
						var accept = $(ui.draggable).attr("id");
						var getdata = ui.draggable.parents(".coral-grid").grid('getRowData',accept);
						if(!opts.dropbyname) {
							var j =0, tmpdata = {}, nm;
							var dropmodel = $("#"+$.grid.coralID(this.id)).grid('option','colModel');
							try {
								for (var key in getdata) {
									if (getdata.hasOwnProperty(key)) {
										nm = dropmodel[j].name;
										if( !(nm == 'cb' || nm =='rn' || nm == 'subgrid' )) {
											if(getdata.hasOwnProperty(key) && dropmodel[j]) {
												tmpdata[nm] = getdata[key];
											}
										}else{
											j++;
										}
										j++;
									}
								}
								getdata = tmpdata;
							} catch (e) {}
						}
						ui.helper.dropped = true;
						if(opts.beforedrop && $.isFunction(opts.beforedrop) ) {
							//parameters to this callback - event, element, data to be inserted, sender, reciever
							// should return object which will be inserted into the reciever
							var datatoinsert = opts.beforedrop.call(this,ev,ui,getdata,$('#'+$.grid.coralID(that.options.id)),$(this));
							if (typeof datatoinsert != "undefined" && datatoinsert !== null && typeof datatoinsert == "object") { getdata = datatoinsert; }
						}
						if(ui.helper.dropped) {
							var grid;
							if(opts.autoid) {
								if($.isFunction(opts.autoid)) {
									grid = opts.autoid.call(this,getdata);
								} else {
									grid = Math.ceil(Math.random()*1000);
									grid = opts.autoidprefix+grid;
								} 
							}
							// NULL is interpreted as undefined while null as object
							$("#"+$.grid.coralID(this.id)).grid('addRowData',grid,getdata,opts.droppos);
						}
						if(opts.ondrop && $.isFunction(opts.ondrop) ) { opts.ondrop.call(this,ev,ui, getdata); }
					}}, opts.drop_opts || {});
			},
			"onstart" : null,
			"onstop" : null,
			"beforedrop": null,
			"ondrop" : null,
			"drop_opts" : {
				"activeClass": "coral-state-active",
				"hoverClass": "coral-state-hover"
			},
			"drag_opts" : {
				"revert": "invalid",
				"helper": "clone",
				"connectToSortable": connectToSortableOpts,
				"cursor": "move",
				"appendTo" : "#jqgrid_dnd",
				"zIndex": 5000
			},
			"dragcopy": false,
			"dropbyname" : false,
			"droppos" : "first",
			"autoid" : true,
			"autoidprefix" : "dnd_"
		}, opts || {});
		
		$.data(that.element,"dnd",opts);
		
		if(that.options.reccount != "0" && !that.options.jqgdnd) {
			updateDnD();
		}
		that.options.jqgdnd = true;
		for (var i=0;i<opts.connectWith.length;i++){
			var cn =opts.connectWith[i];
			$(cn).droppable($.isFunction(opts.drop) ? opts.drop.call($(that),opts) : opts.drop);
		}
	},
	getInd : function(rowid,rc){
		var ret =false,rw;
		/*this.each(function(){*/
			rw = this.rows.namedItem(rowid);
			if(rw) {
				ret = rc===true ? rw: rw.rowIndex;
			}
		/*});*/
		return ret;
	}
});

/*grid的所有的通用方法，与对象无关*/
$.extend($.grid,{
	htmlDecode : function(value){
		if(value && (value=='&nbsp;' || value=='&#160;' || (value.length===1 && value.charCodeAt(0)===160))) { return "";}
		return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\'/g, "&acute;");		
	},
	htmlEncode : function (value){
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&acute;");
	},
	format : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1);
		if(format===undefined) { format = ""; }
		return format.replace(/\{(\d+)\}/g, function(m, i){
			return args[i];
		});
	},
	getCellIndex : function (cell) {
		var c = $(cell);
		if (c.is('tr')) { return -1; }
		c = (!c.is('td') && !c.is('th') ? c.closest("td,th") : c)[0];
		/*暂时注释，到时候再ie6、7下测试，找到解决办法*/
		//if ($.browser.msie) { return $.inArray(c, c.parentNode.cells); }
		return c.cellIndex;
	},
	stripHtml : function(v) {
		v = v+"";
		var regexp = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
		if (v) {
			v = v.replace(regexp,"");
			return (v && v !== '&nbsp;' && v !== '&#160;') ? v.replace(/\"/g,"'") : "";
		} else {
			return v;
		}
	},
	stripPref : function (pref, id) {
		var obj = $.type( pref );
		if( obj == "string" || obj =="number") {
			pref =  String(pref);
			id = pref !== "" ? String(id).replace(String(pref), "") : id;
		}
		return id;
	},
	stringToDoc : function (xmlString) {
		var xmlDoc;
		if(typeof xmlString !== 'string') { return xmlString; }
		try	{
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(xmlString,"text/xml");
		}
		catch(e) {
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(xmlString);
		}
		return (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.tagName != 'parsererror') ? xmlDoc : null;
	},
	parse : function(jsonString) {
		var js = jsonString;
		if (js.substr(0,9) == "while(1);") { js = js.substr(9); }
		if (js.substr(0,2) == "/*") { js = js.substr(2,js.length-4); }
		if(!js) { js = "{}"; }
		return ($.grid.useJSON===true && typeof (JSON) === 'object' && typeof (JSON.parse) === 'function') ?
			JSON.parse(js) :
			eval('(' + js + ')');
	},
	parseDate : function(format, date) {
		var tsp = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0, u:0},k,hl,dM, regdate = /[\\\/:_;.,\t\T\s-]/;
		if(date && date !== null && date !== undefined){
			date = $.trim(date);
			date = date.split(regdate);
			if ($.grid.formatter.date.masks[format] !== undefined) {
				format = $.grid.formatter.date.masks[format];
			}
			format = format.split(regdate);
			var dfmt  = $.grid.formatter.date.monthNames;
			var afmt  = $.grid.formatter.date.AmPm;
			var h12to24 = function(ampm, h){
				if (ampm === 0){ if (h === 12) { h = 0;} }
				else { if (h !== 12) { h += 12; } }
				return h;
			};
			for(k=0,hl=format.length;k<hl;k++){
				if(format[k] == 'M') {
					dM = $.inArray(date[k],dfmt);
					if(dM !== -1 && dM < 12){
						date[k] = dM+1;
						tsp.m = date[k];
					}
				}
				if(format[k] == 'F') {
					dM = $.inArray(date[k],dfmt);
					if(dM !== -1 && dM > 11){
						date[k] = dM+1-12;
						tsp.m = date[k];
					}
				}
				if(format[k] == 'a') {
					dM = $.inArray(date[k],afmt);
					if(dM !== -1 && dM < 2 && date[k] == afmt[dM]){
						date[k] = dM;
						tsp.h = h12to24(date[k], tsp.h);
					}
				}
				if(format[k] == 'A') {
					dM = $.inArray(date[k],afmt);
					if(dM !== -1 && dM > 1 && date[k] == afmt[dM]){
						date[k] = dM-2;
						tsp.h = h12to24(date[k], tsp.h);
					}
				}
				if(date[k] !== undefined) {
					tsp[format[k].toLowerCase()] = parseInt(date[k],10);
				}
			}
			tsp.m = parseInt(tsp.m,10)-1;
			var ty = tsp.y;
			if (ty >= 70 && ty <= 99) {tsp.y = 1900+tsp.y;}
			else if (ty >=0 && ty <=69) {tsp.y= 2000+tsp.y;}
			if(tsp.j !== undefined) { tsp.d = tsp.j; }
			if(tsp.n !== undefined) { tsp.m = parseInt(tsp.n,10)-1; }
		}
		return new Date(tsp.y, tsp.m, tsp.d, tsp.h, tsp.i, tsp.s, tsp.u);
	},
	coralID : function(sid){
		return String(sid).replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/g,"\\$&");
	},
	guid : 1,
	uidPref: 'coralg',
	randId : function( prefix )	{
		return (prefix? prefix: $.grid.uidPref) + ($.grid.guid++);
	},
	getAccessor : function(obj, expr) {
		var ret,p,prm = [], i;
		if( typeof expr === 'function') { return expr(obj); }
		ret = obj[expr];
		if(ret===undefined) {
			try {
				if ( typeof expr === 'string' ) {
					prm = expr.split('.');
				}
				i = prm.length;
				if( i ) {
					ret = obj;
					while (ret && i--) {
						p = prm.shift();
						ret = ret[p];
					}
				}
			} catch (e) {}
		}
		return ret;
	},
	ajaxOptions: {},
	from : function(source){
		// Original Author Hugo Bonacci
		// License MIT http://jlinq.codeplex.com/license
		var QueryObject=function(d,q){
		if(typeof(d)=="string"){
			d=$.data(d);
		}
		var self=this,
		_data=d,
		_usecase=true,
		_trim=false,
		_query=q,
		_stripNum = /[\$,%]/g,
		_lastCommand=null,
		_lastField=null,
		_orDepth=0,
		_negate=false,
		_queuedOperator="",
		_sorting=[],
		_useProperties=true,
		_usePinyin=true;
		if(typeof(d)=="object"&&d.push) {
			if(d.length>0){
				if(typeof(d[0])!="object"){
					_useProperties=false;
				}else{
					_useProperties=true;
				}
			}
		}else{
			throw "data provides is not an array";
		}
		this._hasData=function(){
			return _data===null?false:_data.length===0?false:true;
		};
		this._getStr=function(s){
			var phrase=[];
			if(_trim){
				phrase.push("jQuery.trim(");
			}
			phrase.push("String("+s+")");
			if(_trim){
				phrase.push(")");
			}
			if(!_usecase){
				phrase.push(".toLowerCase()");
			}
			return phrase.join("");
		};
		this._strComp=function(val){
			if(typeof(val)=="string"){
				return".toString()";
			}else{
				return"";
			}
		};
		this._group=function(f,u){
			return({field:f.toString(),unique:u,items:[]});
		};
		this._toStr=function(phrase){
			if(_trim){
				phrase=$.trim(phrase);
			}
			phrase=phrase.toString().replace(/\\/g,'\\\\').replace(/\"/g,'\\"');
			return _usecase ? phrase : phrase.toLowerCase();
		};
		this._funcLoop=function(func){
			var results=[];
			$.each(_data,function(i,v){
				results.push(func(v));
			});
			return results;
		};
		this._append=function(s){
			var i;
			if(_query===null){
				_query="";
			} else {
				_query+=_queuedOperator === "" ? " && " :_queuedOperator;
			}
			for (i=0;i<_orDepth;i++){
				_query+="(";
			}
			if(_negate){
				_query+="!";
			}
			_query+="("+s+")";
			_negate=false;
			_queuedOperator="";
			_orDepth=0;
		};
		this._setCommand=function(f,c){
			_lastCommand=f;
			_lastField=c;
		};
		this._resetNegate=function(){
			_negate=false;
		};
		this._repeatCommand=function(f,v){
			if(_lastCommand===null){
				return self;
			}
			if(f!==null&&v!==null){
				return _lastCommand(f,v);
			}
			if(_lastField===null){
				return _lastCommand(f);
			}
			if(!_useProperties){
				return _lastCommand(f);
			}
			return _lastCommand(_lastField,f);
		};
		this._equals=function(a,b){
			return(self._compare(a,b,1)===0);
		};
		this._compare=function(a,b,d){
			var toString = Object.prototype.toString;
			if( d === undefined) { d = 1; }
			if(a===undefined) { a = null; }
			if(b===undefined) { b = null; }
			if(a===null && b===null){
				return 0;
			}
			if(a===null&&b!==null){
				return 1;
			}
			if(a!==null&&b===null){
				return -1;
			}
			if (toString.call(a) === '[object Date]' && toString.call(b) === '[object Date]') {
				if (a < b) { return -d; }
				if (a > b) { return d; }
				return 0;
			}
			if(!_usecase && typeof(a) !== "number" && typeof(b) !== "number" ) {
				a=String(a).toLowerCase();
				b=String(b).toLowerCase();
			}
			if(a<b){return -d;}
			if(a>b){return d;}
			return 0;
		};
		this._performSort=function(){
			if(_sorting.length===0){return;}
			_data=self._doSort(_data,0);
		};
		this._doSort=function(d,q){
			var by=_sorting[q].by,
			dir=_sorting[q].dir,
			type = _sorting[q].type,
			dfmt = _sorting[q].datefmt;
			if(q==_sorting.length-1){
				return self._getOrder(d, by, dir, type, dfmt);
			}
			q++;
			var values=self._getGroup(d,by,dir,type,dfmt);
			var results=[];
			for(var i=0;i<values.length;i++){
				var sorted=self._doSort(values[i].items,q);
				for(var j=0;j<sorted.length;j++){
					results.push(sorted[j]);
				}
			}
			return results;
		};
		this._getOrder=function(data,by,dir,type, dfmt){
			var sortData=[],_sortData=[], newDir = dir=="a" ? 1 : -1, i,ab,j,
			findSortKey;

			if(type === undefined ) { type = "text"; }
			if (type == 'float' || type== 'number' || type== 'currency' || type== 'numeric') {
				findSortKey = function($cell) {
					var key = parseFloat( String($cell).replace(_stripNum, ''));
					return isNaN(key) ? 0.00 : key;
				};
			} else if (type=='int' || type=='integer') {
				findSortKey = function($cell) {
					return $cell ? parseFloat(String($cell).replace(_stripNum, '')) : 0;
				};
			} else if(type == 'date' || type == 'datetime') {
				findSortKey = function($cell) {
					return $.grid.parseDate(dfmt,$cell).getTime();
				};
			} else if($.isFunction(type)) {
				findSortKey = type;
			} else {
				findSortKey = function($cell) {
					if(!$cell) {$cell ="";}
					return $.trim(String($cell).toUpperCase());
				};
			}
			$.each(data,function(i,v){
				ab = by!=="" ? $.grid.getAccessor(v,by) : v;
				if(ab === undefined) { ab = ""; }
				ab = findSortKey(ab, v);
				_sortData.push({ 'vSort': ab,'index':i});
			});

			_sortData.sort(function(a,b){
				a = a.vSort;
				b = b.vSort;
				return self._compare(a,b,newDir);
			});
			j=0;
			var nrec= data.length;
			// overhead, but we do not change the original data.
			while(j<nrec) {
				i = _sortData[j].index;
				sortData.push(data[i]);
				j++;
			}
			return sortData;
		};
		this._getGroup=function(data,by,dir,type, dfmt){
			var results=[],
			group=null,
			last=null, val;
			$.each(self._getOrder(data,by,dir,type, dfmt),function(i,v){
				val = $.grid.getAccessor(v, by);
				if(val === undefined) { val = ""; }
				if(!self._equals(last,val)){
					last=val;
					if(group !== null){
						results.push(group);
					}
					group=self._group(by,val);
				}
				group.items.push(v);
			});
			if(group !== null){
				results.push(group);
			}
			return results;
		};
		this.ignoreCase=function(){
			_usecase=false;
			return self;
		};
		this.useCase=function(){
			_usecase=true;
			return self;
		};
		this.trim=function(){
			_trim=true;
			return self;
		};
		this.noTrim=function(){
			_trim=false;
			return self;
		};
		this.execute=function(){
			var match=_query, results=[];
			if(match === null){
				return self;
			}
			$.each(_data,function(){
				if(eval(match)){
					results.push(this);
				}
			});
			_data=results;
			return self;
		};
		this.data=function(){
			return _data;
		};
		this.select=function(f){
			self._performSort();
			if(!self._hasData()){ return[]; }
			self.execute();
			if($.isFunction(f)){
				var results=[];
				$.each(_data,function(i,v){
					results.push(f(v));
				});
				return results;
			}
			return _data;
		};
		this.hasMatch=function(){
			if(!self._hasData()) { return false; }
			self.execute();
			return _data.length>0;
		};
		this.andNot=function(f,v,x){
			_negate=!_negate;
			return self.and(f,v,x);
		};
		this.orNot=function(f,v,x){
			_negate=!_negate;
			return self.or(f,v,x);
		};
		this.not=function(f,v,x){
			return self.andNot(f,v,x);
		};
		this.and=function(f,v,x){
			_queuedOperator=" && ";
			if(f===undefined){
				return self;
			}
			return self._repeatCommand(f,v,x);
		};
		this.or=function(f,v,x){
			_queuedOperator=" || ";
			if(f===undefined) { return self; }
			return self._repeatCommand(f,v,x);
		};
		this.orBegin=function(){
			_orDepth++;
			return self;
		};
		this.orEnd=function(){
			if (_query !== null){
				_query+=")";
			}
			return self;
		};
		this.isNot=function(f){
			_negate=!_negate;
			return self.is(f);
		};
		this.is=function(f){
			self._append('this.'+f);
			self._resetNegate();
			return self;
		};
		this._compareValues=function(func,f,v,how,t){
			var fld;
			if(_useProperties){
				fld='jQuery.grid.getAccessor(this,\''+f+'\')';
			}else{
				fld='this';
			}
			if(v===undefined) { v = null; }
			//var val=v===null?f:v,
			var val =v,
			swst = t.stype === undefined ? "text" : t.stype;
			if(v !== null) {
			switch(swst) {
				case 'int':
				case 'integer':
					val = (isNaN(Number(val)) || val==="") ? '0' : val; // To be fixed with more inteligent code
					fld = 'parseInt('+fld+',10)';
					val = 'parseInt('+val+',10)';
					break;
				case 'float':
				case 'number':
				case 'numeric':
					val = String(val).replace(_stripNum, '');
					val = (isNaN(Number(val)) || val==="") ? '0' : val; // To be fixed with more inteligent code
					fld = 'parseFloat('+fld+')';
					val = 'parseFloat('+val+')';
					break;
				case 'date':
				case 'datetime':
					val = String($.grid.parseDate(t.newfmt || 'Y-m-d',val).getTime());
					fld = 'jQuery.grid.parseDate("'+t.srcfmt+'",'+fld+').getTime()';
					break;
				default :
					fld=self._getStr(fld);
					val=self._getStr('"'+self._toStr(val)+'"');
			}
			}
			//self._append(fld+' '+how+' '+val + ' || pinyinEngine.toPinyin('+fld+', false, "")' +' '+how+' '+val);
			self._append(fld+' '+how+' '+val);
			self._setCommand(func,f);
			self._resetNegate();
			return self;
		};
		this.equals=function(f,v,t){
			return self._compareValues(self.equals,f,v,"==",t);
		};
		this.notEquals=function(f,v,t){
			return self._compareValues(self.equals,f,v,"!==",t);
		};
		this.isNull = function(f,v,t){
			return self._compareValues(self.equals,f,null,"===",t);
		};
		this.greater=function(f,v,t){
			return self._compareValues(self.greater,f,v,">",t);
		};
		this.less=function(f,v,t){
			return self._compareValues(self.less,f,v,"<",t);
		};
		this.greaterOrEquals=function(f,v,t){
			return self._compareValues(self.greaterOrEquals,f,v,">=",t);
		};
		this.lessOrEquals=function(f,v,t){
			return self._compareValues(self.lessOrEquals,f,v,"<=",t);
		};
		this.startsWith=function(f,v){
			var val = (v===undefined || v===null) ? f: v,
			length=_trim ? $.trim(val.toString()).length : val.toString().length;
			if(_useProperties){
				self._append(self._getStr('jQuery.grid.getAccessor(this,\''+f+'\')')+'.substr(0,'+length+') == '+self._getStr('"'+self._toStr(v)+'"'));
			}else{
				length=_trim?$.trim(v.toString()).length:v.toString().length;
				self._append(self._getStr('this')+'.substr(0,'+length+') == '+self._getStr('"'+self._toStr(f)+'"'));
			}
			self._setCommand(self.startsWith,f);
			self._resetNegate();
			return self;
		};
		this.endsWith=function(f,v){
			var val = (v===undefined || v===null) ? f: v,
			length=_trim ? $.trim(val.toString()).length:val.toString().length;
			if(_useProperties){
				self._append(self._getStr('jQuery.grid.getAccessor(this,\''+f+'\')')+'.substr('+self._getStr('jQuery.grid.getAccessor(this,\''+f+'\')')+'.length-'+length+','+length+') == "'+self._toStr(v)+'"');
			} else {
				self._append(self._getStr('this')+'.substr('+self._getStr('this')+'.length-"'+self._toStr(f)+'".length,"'+self._toStr(f)+'".length) == "'+self._toStr(f)+'"');
			}
			self._setCommand(self.endsWith,f);self._resetNegate();
			return self;
		};
		this.contains=function(f,v){
			if(_useProperties){
				if(_usePinyin){
					self._append(self._getStr('jQuery.grid.getAccessor(this,\''+f+'\')')+'.indexOf("'+self._toStr(v)+'",0) > -1'
							+ ' || ' + self._getStr('pinyinEngine.toPinyin(jQuery.grid.getAccessor(this,\''+f+'\'), false, "")')+'.indexOf("'+self._toStr(v)+'",0) > -1');
				}else{
					self._append(self._getStr('jQuery.grid.getAccessor(this,\''+f+'\')')+'.indexOf("'+self._toStr(v)+'",0) > -1');
				}
				
			}else{
				if(_usePinyin){
					self._append(self._getStr('this')+'.indexOf("'+self._toStr(f)+'",0) > -1'
							+ ' || ' + pinyinEngine.toPinyin(self._getStr('this'), false, "")+'.indexOf("'+self._toStr(v)+'",0) > -1');
				}else{
					self._append(self._getStr('this')+'.indexOf("'+self._toStr(f)+'",0) > -1');
				}
			}
			self._setCommand(self.contains,f);
			self._resetNegate();
			return self;
		};
		this.groupBy=function(by,dir,type, datefmt){
			if(!self._hasData()){
				return null;
			}
			return self._getGroup(_data,by,dir,type, datefmt);
		};
		this.orderBy=function(by,dir,stype, dfmt){
			dir =  dir === undefined || dir === null ? "a" :$.trim(dir.toString().toLowerCase());
			if(stype === null || stype === undefined) { stype = "text"; }
			if(dfmt === null || dfmt === undefined) { dfmt = "Y-m-d"; }
			if(dir=="desc"||dir=="descending"){dir="d";}
			if(dir=="asc"||dir=="ascending"){dir="a";}
			_sorting.push({by:by,dir:dir,type:stype, datefmt: dfmt});
			return self;
		};
		return self;
		};
	return new QueryObject(source,null);
	},
	getMethod: function (name) {
        return this.getAccessor($.fn.grid, name);
	},
	extend : function(methods) {
		$.extend($.fn.grid,methods);
		if (!this.no_legacy_api) {
			$.fn.extend(methods);
		}
	}
});
grid = $.component( "coral.grid", $.coral.grid, {
	_isArray: function(arr) {
		return Object.prototype.toString.apply(arr) === "[object Array]";
	},
	transformToArrayFormat: function(sNodes) {
		var childKey = "children",
			r = [];
		if (this._isArray(sNodes)) {
			for (var i=0, l=sNodes.length; i<l; i++) {
				r.push(sNodes[i]);
				if (sNodes[i][childKey])
					r = r.concat(this.transformToArrayFormat(sNodes[i][childKey]));
			}
		}else{
			r.push(sNodes);
			if (sNodes[childKey])
				r = r.concat(this.transformToArrayFormat(sNodes[childKey]));
		}
		return r;
	},
	transformToTreeFormat: function(sNodes) {
		var i, l, level,
			key = "id",
			parentKey = this.options.treeReader.parent_id_field,
			childKey = "children";
		if (this._isArray(sNodes)) {
			var r = [],
			    tmpMap = [];
			for (i=0, l=sNodes.length; i<l; i++) {
				sNodes[i][this.options.treeReader.loaded] = true;
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
		} else {
			return [sNodes];
		}
	},
	setSonNodeLevel: function(node, level) {
		var that = this;
		if (node.children) {
			var length = node.children.length;
			for (var i = 0; i < length; i++) {
				var childlevel = level + 1;
				node.children[i].level = childlevel;
				that.setSonNodeLevel(node.children[i], childlevel);
			}
		}
	},
	getNodeLevel: function(node, level) {
		var that = this;
		for(var i=0; i<node.length; i++) {
			node[i].level = level;
			that.setSonNodeLevel(node[i], level)
		}
		return node;
	},
	recurrenceNode: function(data) {
		var that = this;
		var node = that.getNodeLevel(data, 0);
		return node;
	},
	setTreeNode : function(i, len){
		var that = this;
		if( !that.grid || !that.options.treeGrid ) {return;}
		var expCol = that.options.expColInd,
		expanded = that.options.treeReader.expanded_field,
		isLeaf = that.options.treeReader.leaf_field,
		level = that.options.treeReader.level_field,
		icon = that.options.treeReader.icon_field,
		loaded = that.options.treeReader.loaded,  lft, rgt, curLevel, ident,lftpos, twrap,
		ldat, lf;
		/*if( that.options.generalLevel === true || that.options.generalLevel == "true") {
			var data1 = that.transformToTreeFormat(that.options.data);
			that.options.data = that.recurrenceNode(data1);
			that.options.data = that.transformToArrayFormat(that.options.data);
		}*/
		while(i<len) {
			var ind = that.rows[i].id, dind = that.options._index[ind], expan;
			ldat = that.options.data[dind];
			//that.rows[i].level = ldat[level];
			if(that.options.treeGridModel == 'nested') {
				if(!ldat[isLeaf]) {
				lft = parseInt(ldat[that.options.treeReader.left_field],10);
				rgt = parseInt(ldat[that.options.treeReader.right_field],10);
				// NS Model
					ldat[isLeaf] = (rgt === lft+1) ? 'true' : 'false';
					that.rows[i].cells[that.options._treeleafpos].innerHTML = ldat[isLeaf];
				}
			}
			//else {
				//row.parent_id = rd[that.options.treeReader.parent_id_field];
			//}
			curLevel = parseInt(ldat[level], 10);
			if(that.options.tree_root_level === 0) {
				ident = curLevel+1;
				lftpos = curLevel;
			} else {
				ident = curLevel;
				lftpos = curLevel -1;
			}
			twrap = "<div class='tree-wrap tree-wrap-"+that.options.direction+"' style='width:"+(ident*18)+"px;'>";
			twrap += "<div style='"+(that.options.direction=="rtl" ? "right:" : "left:")+(lftpos*18)+"px;' class=' ";
			if(ldat[loaded] !== undefined) {
				if(ldat[loaded]=="true" || ldat[loaded]===true) {
					ldat[loaded] = true;
				} else {
					ldat[loaded] = false;
				}
			}
			if(ldat[isLeaf] == "true" || ldat[isLeaf] === true) {
				twrap += ((ldat[icon] !== undefined && ldat[icon] !== "") ? ldat[icon] : that.options.treeIcons.leaf)+" tree-leaf treeclick";
				ldat[isLeaf] = true;
				lf="leaf";
			} else {
				ldat[isLeaf] = false;
				lf="";
			}
			ldat[expanded] = ((ldat[expanded] == "true" || ldat[expanded] === true) ? true : false) && ldat[loaded];
			if(ldat[expanded] === false) {
				twrap += ((ldat[isLeaf] === true) ? "'" : that.options.treeIcons.plus+" tree-plus treeclick'");
			} else {
				twrap += ((ldat[isLeaf] === true) ? "'" : that.options.treeIcons.minus+" tree-minus treeclick'");
			}
			twrap += "></div></div>";
			$(that.rows[i].cells[expCol]).wrapInner("<span class='cell-wrapper"+lf+"'></span>").prepend(twrap);
			if(curLevel !== parseInt(that.options.tree_root_level,10)) {
				var pn = $(that.element).grid('getNodeParent',ldat);
				expan = pn && pn.hasOwnProperty(expanded) ? pn[expanded] : true;
				if( !expan ){
					$(that.rows[i]).css("display","none");
				}
			}
			$(that.rows[i].cells[expCol])
				.find("div.treeclick")
				.bind("click",function(e){
					var target = e.target || e.srcElement,
					ind2 =$(target,that.rows).closest("tr.jqgrow")[0].id,
					pos = that.options._index[ind2];
					if(!that.options.data[pos][isLeaf]){
						if(that.options.data[pos][expanded]){
							$(that.element).grid("collapseRow",that.options.data[pos]);
							$(that.element).grid("collapseNode",that.options.data[pos]);
						} else {
							$(that.element).grid("expandRow",that.options.data[pos]);
							$(that.element).grid("expandNode",that.options.data[pos]);
						}
					}
					return false;
				});
			if(that.options.ExpandColClick === true) {
				$(that.rows[i].cells[expCol])
					.find("span.cell-wrapper")
					.css("cursor","pointer")
					.bind("click",function(e) {
						var target = e.target || e.srcElement,
						ind2 =$(target,that.rows).closest("tr.jqgrow")[0].id,
						pos = that.options._index[ind2];
						if(!that.options.data[pos][isLeaf]){
							if(that.options.data[pos][expanded]){
								$(that.element).grid("collapseRow",that.options.data[pos]);
								$(that.element).grid("collapseNode",that.options.data[pos]);
							} else {
								$(that.element).grid("expandRow",that.options.data[pos]);
								$(that.element).grid("expandNode",that.options.data[pos]);
							}
						}
						$(that.element).grid("setSelection",ind2);
						return false;
					});
			}
			i++;
		}
	},
	setTreeGrid : function() {
		var that = this, i=0, pico, ecol = false, nm, key, dupcols=[];
		if(!that.options.treeGrid) {return;}
		if(!that.options.treedatatype ) {$.extend(that.options,{treedatatype: that.options.datatype});}
		that.options.subGrid = false;that.options.altRows =false;
		//that.options.pgbuttons = false;that.options.pginput = false;
		that.options.gridview =  true;
		if(that.options.rowTotal === null ) { that.options.rowNum = 10000; }
		that.options.multiselect = false;that.options.rowList = [];
		that.options.expColInd = 0;
		pico = 'coral-icon-triangle-1-' + (that.options.direction=="rtl" ? 'w' : 'e');
		that.options.treeIcons = $.extend({plus:"cui-icon-arrow-right3",minus:'cui-icon-arrow-down3',leaf:'cui-icon-file-empty2'},that.options.treeIcons || {});
		if(that.options.treeGridModel == 'nested') {
			that.options.treeReader = $.extend({
				level_field: "level",
				left_field:"lft",
				right_field: "rgt",
				leaf_field: "isLeaf",
				expanded_field: "expanded",
				loaded: "loaded",
				icon_field: "icon"
			},that.options.treeReader);
		} else if(that.options.treeGridModel == 'adjacency') {
			that.options.treeReader = $.extend({
					level_field: "level",
					parent_id_field: "parent",
					leaf_field: "isLeaf",
					expanded_field: "expanded",
					loaded: "loaded",
					icon_field: "icon"
			},that.options.treeReader );
		}
		for ( key in that.options.colModel){
			if(that.options.colModel.hasOwnProperty(key)) {
				nm = that.options.colModel[key].name;
				if( nm == that.options.expandColumn && !ecol ) {
					ecol = true;
					that.options.expColInd = i;
				}
				i++;
				//
				for(var tkey in that.options.treeReader) {
					if(that.options.treeReader[tkey] == nm) {
						dupcols.push(nm);
					}
				}
			}
		}
		$.each(that.options.treeReader,function(j,n){
			if(n && $.inArray(n, dupcols) === -1){
				if(j==='leaf_field') { that.options._treeleafpos= i; }
			i++;
				that.options.colNames.push(n);
				that.options.colModel.push({name:n,width:1,hidden:true,sortable:false,resizable:false,hidedlg:true,editable:true,search:false});
			}
		});			
	},
	expandRow: function (record){
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		var childern = $(that.element).grid("getNodeChildren",record),
		//if ($(that.element).grid("isVisibleNode",record)) {
		expanded = that.options.treeReader.expanded_field,
		rows = that.rows;
		$(childern).each(function(){
			var id  = $.grid.getAccessor(this,that.options.localReader.id);
			$(rows.namedItem(id)).css("display","");
			if(this[expanded]) {
				$(that.element).grid("expandRow",this);
			}
		});
	},
	collapseRow : function (record) {
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		var childern = $(that.element).grid("getNodeChildren",record),
		expanded = that.options.treeReader.expanded_field,
		rows = that.rows;
		$(childern).each(function(){
			var id  = $.grid.getAccessor(this,that.options.localReader.id);
			$(rows.namedItem(id)).css("display","none");
			if(this[expanded]){
				$(that.element).grid("collapseRow",this);
			}
		});
	},
	// NS ,adjacency models
	getRootNodes : function() {
		var result = [];
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		switch (that.options.treeGridModel) {
			case 'nested' :
				var level = that.options.treeReader.level_field;
				$(that.options.data).each(function(){
					if(parseInt(this[level],10) === parseInt(that.options.tree_root_level,10)) {
						result.push(this);
					}
				});
				break;
			case 'adjacency' :
				var parent_id = that.options.treeReader.parent_id_field;
				$(that.options.data).each(function(){
					if(this[parent_id] === null || String(this[parent_id]).toLowerCase() == "null") {
						result.push(this);
					}
				});
				break;
		}
		return result;
	},
	getNodeDepth : function(rc) {
		var ret = null;
		this.each(function(){
			if(!this.grid || !this.options.treeGrid) {return;}
			var $t = this;
			switch (that.options.treeGridModel) {
				case 'nested' :
					var level = that.options.treeReader.level_field;
					ret = parseInt(rc[level],10) - parseInt(that.options.tree_root_level,10);
					break;
				case 'adjacency' :
					ret = $($t).grid("getNodeAncestors",rc).length;
					break;
			}
		});
		return ret;
	},
	getNodeParent : function(rc) {
		var result = null;
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		switch (that.options.treeGridModel) {
			case 'nested' :
				var lftc = that.options.treeReader.left_field,
				rgtc = that.options.treeReader.right_field,
				levelc = that.options.treeReader.level_field,
				lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
				$(that.options.data).each(function(){
					if(parseInt(this[levelc],10) === level-1 && parseInt(this[lftc],10) < lft && parseInt(this[rgtc],10) > rgt) {
						result = this;
						return false;
					}
				});
				break;
			case 'adjacency' :
				var parent_id = that.options.treeReader.parent_id_field,
				dtid = that.options.localReader.id;
				$(that.options.data).each(function(){
					if(this[dtid] == rc[parent_id] ) {
						result = this;
						return false;
					}
				});
				break;
		}
		return result;
	},
	getNodeChildren : function(rc) {
		var result = [];
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		switch (that.options.treeGridModel) {
			case 'nested' :
				var lftc = that.options.treeReader.left_field,
				rgtc = that.options.treeReader.right_field,
				levelc = that.options.treeReader.level_field,
				lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
				$(this.options.data).each(function(){
					if(parseInt(this[levelc],10) === level+1 && parseInt(this[lftc],10) > lft && parseInt(this[rgtc],10) < rgt) {
						result.push(this);
					}
				});
				break;
			case 'adjacency' :
				var parent_id = that.options.treeReader.parent_id_field,
				dtid = that.options.localReader.id;
				$(this.options.data).each(function(){
					if(this[parent_id] == rc[dtid]) {
						result.push(this);
					}
				});
				break;
		}
		return result;
	},
	getFullTreeNode : function(rc) {
		var result = [];
		this.each(function(){
			var $t = this, len;
			if(!$t.grid || !that.options.treeGrid) {return;}
			switch (that.options.treeGridModel) {
				case 'nested' :
					var lftc = that.options.treeReader.left_field,
					rgtc = that.options.treeReader.right_field,
					levelc = that.options.treeReader.level_field,
					lft = parseInt(rc[lftc],10), rgt = parseInt(rc[rgtc],10), level = parseInt(rc[levelc],10);
					$(this.options.data).each(function(){
						if(parseInt(this[levelc],10) >= level && parseInt(this[lftc],10) >= lft && parseInt(this[lftc],10) <= rgt) {
							result.push(this);
						}
					});
					break;
				case 'adjacency' :
					if(rc) {
					result.push(rc);
					var parent_id = that.options.treeReader.parent_id_field,
					dtid = that.options.localReader.id;
					$(this.options.data).each(function(i){
						len = result.length;
						for (i = 0; i < len; i++) {
							if (result[i][dtid] == this[parent_id]) {
								result.push(this);
								break;
							}
						}
					});
					}
					break;
			}
		});
		return result;
	},	
	// End NS, adjacency Model
	getNodeAncestors : function(rc) {
		var ancestors = [];
		this.each(function(){
			if(!this.grid || !this.options.treeGrid) {return;}
			var parent = $(this).grid("getNodeParent",rc);
			while (parent) {
				ancestors.push(parent);
				parent = $(this).grid("getNodeParent",parent);	
			}
		});
		return ancestors;
	},
	isVisibleNode : function(rc) {
		var result = true;
		this.each(function(){
			var $t = this;
			if(!$t.grid || !that.options.treeGrid) {return;}
			var ancestors = $($t).grid("getNodeAncestors",rc),
			expanded = that.options.treeReader.expanded_field;
			$(ancestors).each(function(){
				result = result && this[expanded];
				if(!result) {return false;}
			});
		});
		return result;
	},
	isNodeLoaded : function(rc) {
		var result;
		var that = this;
		if(!that.grid || !that.options.treeGrid) {return;}
		var isLeaf = that.options.treeReader.leaf_field;
		if(rc !== undefined ) {
			if(rc.loaded !== undefined) {
				result = rc.loaded;
			} else if( rc[isLeaf] || $(that.element).grid("getNodeChildren",rc).length > 0){
				result = true;
			} else {
				result = false;
			}
		} else {
			result = false;
		}
		return result;
	},
	expandNode : function(rc) {
		if(!this.grid || !this.options.treeGrid) {return;}
		var expanded = this.options.treeReader.expanded_field,
		parent = this.options.treeReader.parent_id_field,
		loaded = this.options.treeReader.loaded,
		level = this.options.treeReader.level_field,
		lft = this.options.treeReader.left_field,
		rgt = this.options.treeReader.right_field;

		if(!rc[expanded]) {
			var id = $.grid.getAccessor(rc,this.options.localReader.id);
			var rc1 = $("#"+$.grid.coralID(id),this.grid.rowsView)[0];
			var position = this.options._index[id];
			if( $(this.element).grid("isNodeLoaded",this.options.data[position]) ) {
				rc[expanded] = true;
				$("div.treeclick",rc1).removeClass(this.options.treeIcons.plus+" tree-plus").addClass(this.options.treeIcons.minus+" tree-minus");
			} else if (!this.grid.columnsView.loading) {
				rc[expanded] = true;
				$("div.treeclick",rc1).removeClass(this.options.treeIcons.plus+" tree-plus").addClass(this.options.treeIcons.minus+" tree-minus");
				this.options.treeANode = rc1.rowIndex;
				this.options.datatype = this.options.treedatatype;
				if(this.options.treeGridModel == 'nested') {
					$(this.element).grid("option",{postData:{nodeid:id,n_left:rc[lft],n_right:rc[rgt],n_level:rc[level]}});
				} else {
					$(this.element).grid("option",{postData:{nodeid:id,parentid:rc[parent],n_level:rc[level]}} );
				}
				$(this.element).grid("reload");
				rc[loaded] = true;
				if(this.options.treeGridModel == 'nested') {
					$(this.element).grid("option",{postData:{nodeid:'',n_left:'',n_right:'',n_level:''}});
				} else {
					$(this.element).grid("option",{postData:{nodeid:'',parentid:'',n_level:''}}); 
				}
			}
		}
	},
	collapseNode : function(rc) {
		if(!this.grid || !this.options.treeGrid) {return;}
		var expanded = this.options.treeReader.expanded_field;
		if(rc[expanded]) {
			rc[expanded] = false;
			var id = $.grid.getAccessor(rc,this.options.localReader.id);
			var rc1 = $("#"+$.grid.coralID(id),this.grid.rowsView)[0];
			$("div.treeclick",rc1).removeClass(this.options.treeIcons.minus+" tree-minus").addClass(this.options.treeIcons.plus+" tree-plus");
		}
	},
	sortTree : function( sortname, newDir, st, datefmt) {
		if(!this.grid || !this.options.treeGrid) {return;}
		var i, len,
		rec, records = [], that = this, query, roots,
		rt = $(that.element).grid("getRootNodes");
		// Sorting roots
		query = $.grid.from(rt);
		query.orderBy(sortname,newDir,st, datefmt);
		roots = query.select();

		// Sorting children
		for (i = 0, len = roots.length; i < len; i++) {
			rec = roots[i];
			records.push(rec);
			$(that.element).grid("collectChildrenSortTree",records, rec, sortname, newDir,st, datefmt);
		}
		$.each(records, function(index) {
			var id  = $.grid.getAccessor(this,that.options.localReader.id);
			$('#'+$.grid.coralID(that.options.id)+ ' tbody tr:eq('+index+')').after($('tr#'+$.grid.coralID(id),that.grid.rowsView));
		});
		query = null;roots=null;records=null;
	},
	collectChildrenSortTree : function(records, rec, sortname, newDir,st, datefmt) {
		if(!this.grid || !this.options.treeGrid) {return;}
		var i, len,
		child, ch, query, children;
		ch = $(this.element).grid("getNodeChildren",rec);
		query = $.grid.from(ch);
		query.orderBy(sortname, newDir, st, datefmt);
		children = query.select();
		for (i = 0, len = children.length; i < len; i++) {
			child = children[i];
			records.push(child);
			$(this.element).grid("collectChildrenSortTree",records, child, sortname, newDir, st, datefmt); 
		}
	},
	// experimental 
	setTreeRow : function(rowid, data) {
		var success=false;
		this.each(function(){
			var t = this;
			if(!t.grid || !t.options.treeGrid) {return;}
			success = $(t).grid("setRowData",rowid,data);
		});
		return success;
	},
	delTreeNode : function (rowid) {
		return this.each(function () {
			var $t = this, rid = that.options.localReader.id,
			left = that.options.treeReader.left_field,
			right = that.options.treeReader.right_field, myright, width, res, key;
			if(!$t.grid || !that.options.treeGrid) {return;}
			var rc = that.options._index[rowid];
			if (rc !== undefined) {
				// nested
				myright = parseInt(that.options.data[rc][right],10);
				width = myright -  parseInt(that.options.data[rc][left],10) + 1;
				var dr = $($t).grid("getFullTreeNode",that.options.data[rc]);
				if(dr.length>0){
					for (var i=0;i<dr.length;i++){
						$($t).grid("delRowData",dr[i][rid]);
					}
				}
				if( that.options.treeGridModel === "nested") {
					// ToDo - update grid data
					res = $.grid.from(that.options.data)
						.greater(left,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = parseInt(res[key][left],10) - width ;
							}
						}
					}
					res = $.grid.from(that.options.data)
						.greater(right,myright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][right] = parseInt(res[key][right],10) - width ;
							}
						}
					}
				}
			}
		});
	},
	addChildNode : function( nodeid, parentid, data ) {
		//return this.each(function(){
		var $t = this[0];
		if(data) {
			// we suppose tha the id is autoincremet and
			var expanded = that.options.treeReader.expanded_field,
			isLeaf = that.options.treeReader.leaf_field,
			level = that.options.treeReader.level_field,
			//icon = that.options.treeReader.icon_field,
			parent = that.options.treeReader.parent_id_field,
			left = that.options.treeReader.left_field,
			right = that.options.treeReader.right_field,
			loaded = that.options.treeReader.loaded,
			method, parentindex, parentdata, parentlevel, i, len, max=0, rowind = parentid, leaf, maxright;

			if ( typeof nodeid === 'undefined' || nodeid === null ) {
				i = that.options.data.length-1;
				if(	i>= 0 ) {
					while(i>=0){max = Math.max(max, parseInt(that.options.data[i][that.options.localReader.id],10)); i--;}
				}
				nodeid = max+1;
			}
			var prow = $($t).grid('getInd', parentid);
				leaf = false;
				// if not a parent we assume root
				if ( parentid === undefined  || parentid === null || parentid==="") {
					parentid = null;
					rowind = null;
					method = 'last';
					parentlevel = that.options.tree_root_level;
					i = that.options.data.length+1;
				} else {
					method = 'after';
					parentindex = that.options._index[parentid];
					parentdata = that.options.data[parentindex];
					parentid = parentdata[that.options.localReader.id];
					parentlevel = parseInt(parentdata[level],10)+1;
					var childs = $($t).grid('getFullTreeNode', parentdata);
					// if there are child nodes get the last index of it
					if(childs.length) {
						i = childs[childs.length-1][that.options.localReader.id];
						rowind = i;
						i = $($t).grid('getInd',rowind)+1;
					} else {
						i = $($t).grid('getInd', parentid)+1;
					}
					// if the node is leaf
					if(parentdata[isLeaf]) {
						leaf = true;
						parentdata[expanded] = true;
						//var prow = $($t).grid('getInd', parentid);
						$($t.rows[prow])
							.find("span.cell-wrapperleaf").removeClass("cell-wrapperleaf").addClass("cell-wrapper")
							.end()
							.find("div.tree-leaf").removeClass(that.options.treeIcons.leaf+" tree-leaf").addClass(that.options.treeIcons.minus+" tree-minus");
						that.options.data[parentindex][isLeaf] = false;
						parentdata[loaded] = true;
					}
				}
				len = i+1;

			data[expanded] = false;
			data[loaded] = true;
			data[level] = parentlevel;
			data[isLeaf] = true;
			if( that.options.treeGridModel === "adjacency") {
				data[parent] = parentid;
			}
			if( that.options.treeGridModel === "nested") {
				// this method requiere more attention
				var query, res, key;
				//maxright = parseInt(maxright,10);
				// ToDo - update grid data
				if(parentid !== null) {
					maxright = parseInt(parentdata[right],10);
					query = $.grid.from(that.options.data);
					query = query.greaterOrEquals(right,maxright,{stype:'integer'});
					res = query.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = res[key][left] > maxright ? parseInt(res[key][left],10) +2 : res[key][left];
								res[key][right] = res[key][right] >= maxright ? parseInt(res[key][right],10) +2 : res[key][right];
							}
						}
					}
					data[left] = maxright;
					data[right]= maxright+1;
				} else {
					maxright = parseInt( $($t).grid('getCol', right, false, 'max'), 10);
					res = $.grid.from(that.options.data)
						.greater(left,maxright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][left] = parseInt(res[key][left],10) +2 ;
							}
						}
					}
					res = $.grid.from(that.options.data)
						.greater(right,maxright,{stype:'integer'})
						.select();
					if(res.length) {
						for( key in res) {
							if(res.hasOwnProperty(key)) {
								res[key][right] = parseInt(res[key][right],10) +2 ;
							}
						}
					}
					data[left] = maxright+1;
					data[right] = maxright + 2;
				}
			}
			if( parentid === null || $($t).grid("isNodeLoaded",parentdata) || leaf ) {
					if( that.options.generalLevel === true || that.options.generalLevel == "true") {
						var data1 = that.transformToTreeFormat(data);
						that.options.data = that.recurrenceNode(data1);
						that.options.data = that.transformToArrayFormat(that.options.data);
					}
					$($t).grid('addRowData', nodeid, data, method, rowind);
					$($t).grid('setTreeNode', i, len);
			}
			if(parentdata && !parentdata[expanded]) {
				$($t.rows[prow])
					.find("div.treeclick")
					.click();
			}
		}
		//});
	},
	refreshDescription: function( html ){
		if ( this.options.toolbarOptions ) {
			if( this.options.description ){
				$( ".pager-description", this.element ).html(html);
			}
		}
	},
	hideGridHeader: function(){
		this.element.find(".coral-grid-columns").hide();
	},
	showGridHeader: function(){
		this.element.find(".coral-grid-columns").show();
	},
	//grid校验模块
	// 校验模块 校验单元格内容，如果是编辑状态，则先要保存这一行。
	valid: function( rowid, colname ) {
		var res = {}, resall, getall=false, len, j=0;
		var that = this,nm,editable,ind;
		that.errorResults = [];
		var state;
		if(typeof(rowid) == 'undefined' || !rowid) {
			getall = true;
			resall = [];
			len = that.rows.length;
		} else {
			ind = that.rows.namedItem(rowid);
			if(!ind) { return res; }
			len = 2;//TODO: getRowData方法一直设置为2，，
		}
		while(j<len){
			if(getall) { ind = that.rows[j]; }
			if( $(ind).hasClass('jqgrow') ) {
				$('td[role="gridcell"]',ind).each( function(i) {
					var error;
					nm = that.options.colModel[i].name;
					editable = that.options.colModel[i].editable;
					if ( !colname || ( colname && nm == colname ) ) {
						if ( nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn') {
							if(that.options.treeGrid===true && nm == that.options.expandColumn) {
								res[nm] = $.grid.htmlDecode($("span:first",this).html());
							} else {
								try {
									var sRowArr = $.grep( that.options.savedRow, function( sRow ) {
										// TODO: 是否有错误？本地和远程数据的判断
										return sRow.id == ind.id || that.rows[sRow.id].id == ind.id;
									});
									if ( that.options.savedRow.length && sRowArr.length && editable ) {
										state = "edittype";
									} else {
										state = null;
									}
									res[nm] = $.unformat.call(that,this,{rowId:ind.id, colModel:that.options.colModel[i]},i,"get",state);								
								} catch (e){
									res[nm] = $.grid.htmlDecode($(this).html());
								}
							}
							var validateopitons = $.extend( that.options.colModel[i].formatoptions||{},
								that.options.colModel[i].editoptions||{} );
							var event = $.Event();
							event.target = this;
							var isElement = $(this).find(".ctrl-form-element");
							if(isElement.length > 0){
								for(var i =0;i<isElement.length; i++){
									var data = {
										validoptions: validateopitons,
										notComponent: false,
										showRequiredMark: $.noop,
										hasTips: false,
										component: that.getCellComponent( ind.id, nm ),
										element: $(isElement[i]),
										value: res[nm]
									};
									error = $.validate.validateField( event, data );
								}
							} else{
								var data = {
									validoptions: validateopitons,
									notComponent: true,
									showRequiredMark: $.noop,
									hasTips: false,
									component: $(this),
									element: $(this),
									value: res[nm]
								};
								error = $.validate.validateField( event, data );
							}
							if ( error.length ) {
								if ( that.options.allowSaveOnError ) {
									$(this).addClass( "coral-gridcell-error" ).attr("data-errors", error);
								} else {
									$(this).addClass( "coral-gridcell-error" );
								}
								// 会有添加两遍的bug
								that.errorResults.push({"rowId":ind.id,"rowIndex":j,"cellIndex":i,"errors": error});
							} else {
								$(this).removeClass( "coral-gridcell-error" )
								.removeAttr("data-errors");
							}
						}
					}
				});
				if(getall) { resall.push(res); res={}; }
			}
			j++;
		}
		this.options.isValid = !(this.errorResults.length>0);
		return this.options.isValid;
	},
	clearErrors: function( rowid, colname ) {
		var res = {}, resall, getall=false, len, j=0;
		var that = this,nm,editable,ind;
		this.errorResults = this.errorResults || [];
		if(typeof(rowid) == 'undefined' || !rowid) {
			getall = true;
			resall = [];
			len = that.rows.length;
			that.errorResults = [];
		} else {
			ind = that.rows.namedItem(rowid);
			if(!ind) { return res; }
			len = 2;
			var k = that.errorResults.length;
			for(k ; k>0; k--) {
				if ( that.errorResults[k-1].rowId == ind.id ) {
					that.errorResults.splice(k-1, 1);
				}
			}
		}
		while(j<len){
			if(getall) { ind = that.rows[j]; }
			if( $(ind).hasClass('jqgrow') ) {
				$('td[role="gridcell"]',ind).each( function(i) {
					$(this).removeClass( "coral-gridcell-error coral-validate-error" )
					.removeAttr("data-errors");
				});
			}
			j++;
		}
		this.options.isValid = !(this.errorResults.length>0);
	},
	getCellErrors: function(){
		return that.errorResults;
	},
	resizeFrozen: function(){
		var top = this.options.caption ? $(this.grid.cDiv).outerHeight() : 0,
			hth = $(".coral-grid-htable","#"+$.grid.coralID(this.options.id)).outerHeight();
			//headers
			if(this.options.toppager) {
				top = top + $($t.grid.topDiv).outerHeight();
			}
			if(this.options.toolbar[0] === true) {
				if(this.options.toolbar[1] != "bottom") {
					top = top + $(this.grid.uDiv).outerHeight();
				}
			}
			if( this.grid.fhDiv ) {
				var columsHeight = $("th",this.grid.columnsView).height();
				$(this.grid.fhDiv).css({"top": top}); 
				$("th",this.grid.fhDiv).each(function(){
					$(this).height(columsHeight);
				});
				$(this.grid.fbDiv).css({"top": (parseInt(top,10)+parseInt(hth,10))}); 
				$(this.grid.fbDiv).height( $(this.grid.rowsView).height()-this.getScrollBarWidth()+2);
			}
			if( this.grid.rightfhDiv ) {
				var columsHeight = $("th",this.grid.columnsView).height();
				$("th",this.grid.rightfhDiv).each(function(){
					$(this).height(columsHeight);
				});
				$(this.grid.rightfhDiv).css({"top": top}); 
				$(this.grid.rightfbDiv).css({"top": (parseInt(top,10)+parseInt(hth,10))}); 
				$(this.grid.rightfbDiv).height( $(this.grid.rowsView).height()-this.getScrollBarWidth()+2);
			}
	},
	setFrozenColumns : function () {
		if ( !this.grid ) {return;}
		var $t = this, cm = $t.options.colModel,i=0, len = cm.length, j = len - 1, rightmaxfrozen = -1, maxfrozen = -1, frozen= false;
		// TODO treeGrid and grouping  Support
		if($t.options.subGrid === true || $t.options.treeGrid === true || $t.options.cellEdit === true || $t.options.sortable || $t.options.scroll || $t.options.grouping )
		{
			return;
		}
		if($t.options.rownumbers) { i++; }
		if($t.options.multiselect||$t.options.singleselect) { i++; }
		
		// get the max index of frozen col
		while(i<len)
		{
			// from left, no breaking frozen
			if(cm[i].frozen === true)
			{
				frozen = true;
				maxfrozen = i;
			} else {
				break;
			}
			i++;
		}
		while( j > 0 )
		{
			// from left, no breaking frozen
			if(cm[j].frozen === true)
			{
				frozen = true;
				rightmaxfrozen = j;
			} else {
				break;
			}
			j--;
		}
		
		if (rightmaxfrozen>0){
			maxfrozen = -1;
		}
		if( frozen) {
			var top = $t.options.caption ? $($t.grid.cDiv).outerHeight() : 0,
			hth = $(".coral-grid-htable","#"+$.grid.coralID($t.options.id)).outerHeight();
			//headers
			if($t.options.toppager) {
				top = top + $($t.grid.topDiv).outerHeight();
			}
			if($t.options.toolbar[0] === true) {
				if($t.options.toolbar[1] != "bottom") {
					top = top + $($t.grid.uDiv).outerHeight();
				}
			}
			if( maxfrozen>=0 ) {
				$t.grid.fhDiv = $('<div style="position:absolute;left:0px;top:'+top+'px;" class="frozen-div-left coral-state-default coral-grid-columns coral-grid-columns-view"></div>');
				$t.grid.fbDiv = $('<div style="position:absolute;left:0px;top:'+(parseInt(top,10)+parseInt(hth,10))+'px;overflow-y:hidden" class="frozen-bdiv coral-grid-rows coral-grid-rows-view"></div>');
				$("#"+$.grid.coralID($t.options.id)).append($t.grid.fhDiv);
			}
			if( rightmaxfrozen>=0 ) {
				$t.grid.rightfhDiv = $('<div style="position:absolute;right:0;top:'+top+'px;" class="frozen-div-right coral-state-default coral-grid-columns coral-grid-columns-view"></div>');
				$t.grid.rightfbDiv = $('<div style="position:absolute;right:0;top:'+(parseInt(top,10)+parseInt(hth,10))+'px;overflow-y:hidden" class="frozen-bdiv coral-grid-rows coral-grid-rows-view"></div>');
				$("#"+$.grid.coralID($t.options.id)).append($t.grid.rightfhDiv);
			}
			var htbl = $(".coral-grid-htable","#"+$.grid.coralID($t.options.id)).clone(true);
			var righthtbl = $(".coral-grid-htable","#"+$.grid.coralID($t.options.id)).clone(true);
			// groupheader support - only if useColSpanstyle is false
			$t.rightFrozenWidth = 0;
			if($t.options.groupHeader) {
				//TODO: group frozen on right col
				if( maxfrozen>=0 ) {
					$("tr.jqg-first-row-header, tr.jqg-third-row-header", htbl).each(function(){
						$("th:gt("+maxfrozen+")",this).remove();
					});
				}
				if( rightmaxfrozen>=0 ) {
					$("tr.jqg-first-row-header, tr.jqg-third-row-header", righthtbl).each(function(){
						/*$("th:gt("+ (rightmaxfrozen-1) +")",this).each(function(){
							$t.rightFrozenWidth = $t.rightFrozenWidth + $(this).width();
						});*/
						$("th:lt("+ rightmaxfrozen +")",this).remove();
					});
				}
				var swapfroz = -1, fdel = -1;
				$("tr.jqg-second-row-header th", htbl).each(function(){
					var cs= parseInt($(this).attr("colspan"),10);
					if(cs) {
						swapfroz = swapfroz+cs;
						fdel++;
					}
					if(swapfroz === maxfrozen) {
						return false;
					}
				});
				if(swapfroz !== maxfrozen) {
					fdel = maxfrozen;
				}
				$("tr.jqg-second-row-header", htbl).each(function(){
					$("th:gt("+fdel+")",this).remove();
				});
			} else {
				if( maxfrozen>=0 ) {
					$("tr",htbl).each(function(){
						$("th:gt("+maxfrozen+")",this).remove();
					});
				}
				if( rightmaxfrozen>=0 ) {
					$("tr",righthtbl).each(function(){
						/*$("th:gt("+ (rightmaxfrozen-1) +")",this).each(function(){
							$t.rightFrozenWidth = $t.rightFrozenWidth + $(this).width();
						});*/
						$("th:lt("+ rightmaxfrozen +")",this).remove();
						var scrollWidth = $t.getScrollBarWidth() -2;
						$(this).append("<th style='width:"+ scrollWidth +"px;' class='coral-state-default'>&nbsp;</th>");
					});
				}
			}
			$(htbl).width(1);
			$(righthtbl).width(1);
			// resizing stuff
			if( maxfrozen>=0 ) {
				$($t.grid.fhDiv).append(htbl).mousemove(function (e) {
					if($t.grid.resizing){ $t.grid.dragMove(e);return false; }
				});
			}
			if( rightmaxfrozen>=0 ) {
				$($t.grid.rightfhDiv).append(righthtbl).mousemove(function (e) {
					if($t.grid.resizing){ $t.grid.dragMove(e);return false; }
				});
			}
			$($t.element).bind('gridonresizestop.setFrozenColumns', function (e, ui) {
				var index = ui.index,
					w = ui.newWidth;
				if( maxfrozen>=0 ) {
					var rhth = $(".coral-grid-htable",$t.grid.fhDiv);
					$("th:eq("+index+")",rhth).width( w ); 
					var btd = $(".coral-grid-btable",$t.grid.fbDiv);
					$("tr:first td:eq("+index+")",btd).width( w ); 
				}
				if( rightmaxfrozen>=0 ) {
					var rhth = $(".coral-grid-htable",$t.grid.rightfhDiv);
					$("th:eq("+(len-index - 1)+")",rhth).width( w ); 
					var btd = $(".coral-grid-btable",$t.grid.rightfbDiv);
					$("tr:first td:eq("+(len-index - 1)+")",btd).width( w ); 
					$t.resetFrozen();
				}
			});
			// sorting stuff
			$($t.element).bind('gridonsortcol.setFrozenColumns', function (event, ui) {
				var index = ui.id, idxcol = ui.colIndex;
				if( maxfrozen>=0 ) {
					var previousSelectedTh = $("tr.coral-grid-labels:last th:eq("+$t.options.lastsort+")",$t.grid.fhDiv), newSelectedTh = $("tr.coral-grid-labels:last th:eq("+idxcol+")",$t.grid.fhDiv); 
					$("span.coral-grid-ico-sort",previousSelectedTh).addClass('coral-state-disabled');
					$(previousSelectedTh).attr("aria-selected","false");
					$("span.coral-icon-"+$t.options.sortorder,newSelectedTh).removeClass('coral-state-disabled');
					$(newSelectedTh).attr("aria-selected","true");
					if(!$t.options.viewsortcols[0]) {
						if($t.options.lastsort != idxcol) {
							$("span.s-ico",previousSelectedTh).hide();
							$("span.s-ico",newSelectedTh).show();
						}
					}
				}
				if( rightmaxfrozen>=0 ) {
					idxcol =  $t.grid.headers.length - idxcol - 1;
					var previousSelectedTh = $("tr.coral-grid-labels:last th:eq("+$t.options.lastsort+")",$t.grid.rightfhDiv), newSelectedTh = $("tr.coral-grid-labels:last th:eq("+idxcol+")",$t.grid.rightfhDiv);

					$("span.coral-grid-ico-sort",previousSelectedTh).addClass('coral-state-disabled');
					$(previousSelectedTh).attr("aria-selected","false");
					$("span.coral-icon-"+$t.options.sortorder,newSelectedTh).removeClass('coral-state-disabled');
					$(newSelectedTh).attr("aria-selected","true");
					if(!$t.options.viewsortcols[0]) {
						if($t.options.lastsort != idxcol) {
							$("span.s-ico",previousSelectedTh).hide();
							$("span.s-ico",newSelectedTh).show();
						}
					}
				}
				
			});
			
			// data stuff
			// TODO support for setRowData
			if( maxfrozen>=0 ) {
				$("#"+$.grid.coralID($t.options.id)).append($t.grid.fbDiv);
			}
			if( rightmaxfrozen>=0 ) {
				$("#"+$.grid.coralID($t.options.id)).append($t.grid.rightfbDiv);
			}
			
			jQuery($t.grid.rowsView).scroll(function () {
				if( maxfrozen>=0 ) {
					jQuery($t.grid.fbDiv).scrollTop(jQuery(this).scrollTop());
				}
				if( rightmaxfrozen>=0 ) {
					jQuery($t.grid.rightfbDiv).scrollTop(jQuery(this).scrollTop());
				}
				
			});
			var tlength = 0,//总的滚轮滚动距离
			    bscrolltop = 0,//滚动之前的grid.rowsView滚轮距离顶端的距离
			    ascrolltop = 0;//滚动之后的grid.rowsView滚轮距离顶端的距离
			if (maxfrozen>=0) {
				$($t.grid.fbDiv).mousewheel(function (event,delta) {
					var length = -(event.deltaY * event.deltaFactor);
					bscrolltop = $($t.grid.rowsView).scrollTop();
					tlength = bscrolltop;
					tlength = tlength + length;
                    $($t.grid.rowsView).scrollTop(tlength);	
                    ascrolltop = $($t.grid.rowsView).scrollTop();
                    if (ascrolltop == bscrolltop) {
                    	tlength = tlength - length;
                    } else event.preventDefault();
				})
			} 
			if (rightmaxfrozen>=0) {
				$($t.grid.rightfbDiv).mousewheel(function (event,delta) {
					var length = -(event.deltaY * event.deltaFactor);
					bscrolltop = $($t.grid.rowsView).scrollTop();
					tlength = bscrolltop;
					tlength = tlength + length;
                    $($t.grid.rowsView).scrollTop(tlength);	
                    ascrolltop = $($t.grid.rowsView).scrollTop();
                    if (ascrolltop == bscrolltop) {
                    	tlength = tlength - length;
                    } else event.preventDefault();
				})
			}
			if($t.options.hoverrows === true) {
				$("#"+$.grid.coralID($t.options.id)).unbind('mouseover').unbind('mouseout');
			}
			$($t.element).bind('gridaftercomplete.setFrozenColumns', function () {
				$("#"+$.grid.coralID($t.options.id)+"_frozen").remove();
				var btbl, rightbtbl;
				if( maxfrozen>=0 ) {
					btbl = $("#"+$.grid.coralID($t.options.id)+"_table").clone(true);
					jQuery($t.grid.fbDiv).height( jQuery($t.grid.rowsView).height()-$t.getScrollBarWidth()+2);
					$("tr",btbl).each(function(){
						$("td:gt("+maxfrozen+")",this).remove();
						// when singleselect, the name of radio in frozen table can not be same as the original radio
						!$t.options.singleselect||$("td:eq(0)>input",this).attr("name",$("td:eq(0)>input",this).attr("name")+"_forzen");
					});
					$(btbl).width(1).attr("id",$t.options.id+"_frozen");
					$($t.grid.fbDiv).append(btbl);
					if($t.options.hoverrows === true) {
						$("tr.jqgrow", btbl).hover(
							function(){ $(this).addClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)).addClass("coral-state-hover"); },
							function(){ $(this).removeClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)).removeClass("coral-state-hover"); }
						);
						$("tr.jqgrow", "#"+$.grid.coralID($t.options.id)).hover(
							function(){ $(this).addClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)+"_frozen").addClass("coral-state-hover");},
							function(){ $(this).removeClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)+"_frozen").removeClass("coral-state-hover"); }
						);
					}
					btbl=null;
				}
				
				if( rightmaxfrozen>=0 ) {
					if( ( $($t.grid.rowsView)[0].scrollHeight - $($t.grid.rowsView)[0].clientHeight ) > 0 ) {
						//$t.grid.rightfhDiv.css({"right": ($t.getScrollBarWidth() -2) + "px"});
						$t.grid.rightfbDiv.css({"right": ($t.getScrollBarWidth() -2) + "px"});
					}
					rightbtbl = $("#"+$.grid.coralID($t.options.id)+"_table").clone(true);
					jQuery($t.grid.rightfbDiv).height( jQuery($t.grid.rowsView).height()-$t.getScrollBarWidth()+2);
					$("tr",rightbtbl).each(function(){
						$("td:lt("+ rightmaxfrozen +")",this).remove();
						// when singleselect, the name of radio in frozen table can not be same as the original radio
						!$t.options.singleselect||$("td:eq(0)>input",this).attr("name",$("td:eq(0)>input",this).attr("name")+"_forzen");
					});
					$(rightbtbl).width(1).attr("id",$t.options.id+"_frozen");
					$($t.grid.rightfbDiv).append(rightbtbl);
					if($t.options.hoverrows === true) {
						$("tr.jqgrow", rightbtbl).hover(
							function(){ $(this).addClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)).addClass("coral-state-hover"); },
							function(){ $(this).removeClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)).removeClass("coral-state-hover"); }
						);
						$("tr.jqgrow", "#"+$.grid.coralID($t.options.id)).hover(
							function(){ $(this).addClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)+"_frozen").addClass("coral-state-hover");},
							function(){ $(this).removeClass("coral-state-hover"); $("#"+$.grid.coralID(this.id), "#"+$.grid.coralID($t.options.id)+"_frozen").removeClass("coral-state-hover"); }
						);
					}
					rightbtbl=null;
				}
				
				
			});
			$t.options.frozenColumns = true;
		}
	},
	destroyFrozenColumns :  function() {
		if ( !this.grid ) {return;}
		if(this.options.frozenColumns === true) {
			var $t = this;
			$($t.grid.fhDiv).remove();
			$($t.grid.fbDiv).remove();
			$($t.grid.rightfhDiv).remove();
			$($t.grid.rightfbDiv).remove();
			$t.grid.fhDiv = null; $t.grid.fbDiv=null;
			$t.grid.rightfhDiv = null; $t.grid.rightfbDiv=null;
			$(this.element).unbind('.setFrozenColumns');
			if($t.options.hoverrows === true) {
				var ptr;
				$("#"+$.grid.coralID($t.options.id)).bind('mouseover',function(e) {
					ptr = $(e.target).closest("tr.jqgrow");
					if($(ptr).attr("class") !== "coral-subgrid") {
					$(ptr).addClass("coral-state-hover");
				}
				}).bind('mouseout',function(e) {
					ptr = $(e.target).closest("tr.jqgrow");
					$(ptr).removeClass("coral-state-hover");
				});
			}
			this.options.frozenColumns = false;
		}
	}
});

/**
 * jquery.coral.grouping.js
 */
$.extend($.grid,{
	template : function(format){ //jqgformat
		var args = $.makeArray(arguments).slice(1), j, al = args.length;
		if(format==null) { format = ""; }
		return format.replace(/\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, function(m,i){
			if(!isNaN(parseInt(i,10))) {
				return args[parseInt(i,10)];
			}
			for(j=0; j < al;j++) {
				if($.isArray(args[j])) {
					var nmarr = args[ j ],
					k = nmarr.length;
					while(k--) {
						if(i===nmarr[k].nm) {
							return nmarr[k].v;
						}
					}
				}
			}
		});
	}
});
grid = $.component( "coral.grid", $.coral.grid, {
	groupingSetup : function () {
		var that = this, i, j, cml, cm = that.options.colModel, grp = that.options.groupingView;
		if(grp !== null && ( (typeof grp === 'object') || $.isFunction(grp) ) ) {
			if(!grp.groupField.length) {
				that.options.grouping = false;
			} else {
				if (grp.visibiltyOnNextGrouping === undefined) {
					grp.visibiltyOnNextGrouping = [];
				}

				grp.lastvalues=[];
				if(!grp._locgr) {
					grp.groups =[];
				}
				grp.counters =[];
				for(i=0;i<grp.groupField.length;i++) {
					if(!grp.groupOrder[i]) {
						grp.groupOrder[i] = 'asc';
					}
					if(!grp.groupText[i]) {
						grp.groupText[i] = '{0}';
					}
					if( typeof grp.groupColumnShow[i] !== 'boolean') {
						grp.groupColumnShow[i] = true;
					}
					if( typeof grp.groupSummary[i] !== 'boolean') {
						grp.groupSummary[i] = false;
					}
					if( !grp.groupSummaryPos[i]) {
						grp.groupSummaryPos[i] = 'footer';
					}
					if(grp.groupColumnShow[i] === true) {
						grp.visibiltyOnNextGrouping[i] = true;
						$(this.element).grid('showCol',grp.groupField[i]);
					} else {
						grp.visibiltyOnNextGrouping[i] = $("#"+$.grid.coralID(that.options.id+"_"+grp.groupField[i])).is(":visible");
						$(this.element).grid('hideCol',grp.groupField[i]);
					}
				}
				grp.summary =[];
				if(grp.hideFirstGroupCol) {
					grp.formatDisplayField[0] = function (v) { return v;};
				}
				for(j=0, cml = cm.length; j < cml; j++) {
					if(grp.hideFirstGroupCol) {
						if(!cm[j].hidden && grp.groupField[0] === cm[j].name) {
							cm[j].formatter = function(){return '';};
						}
					}
					if(cm[j].summaryType ) {
						if(cm[j].summaryDivider) {
							grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sd:cm[j].summaryDivider, vd:'', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
						} else {
							grp.summary.push({nm:cm[j].name,st:cm[j].summaryType, v: '', sr: cm[j].summaryRound, srt: cm[j].summaryRoundType || 'round'});
						}
					}
				}
			}
		} else {
			this.options.grouping = false;
		}
	},
	groupingPrepare : function ( record, irow ) {
		var that = this,
			grp = this.options.groupingView, i,
			grlen = grp.groupField.length, 
			fieldName,
			v,
			displayName,
			displayValue,
			changed = 0;
		for(i=0;i<grlen;i++) {
			fieldName = grp.groupField[i];
			displayName = grp.displayField[i];
			v = record[fieldName];
			displayValue = displayName == null ? null : record[displayName];

			if( displayValue == null ) {
				displayValue = v;
			}
			if( v !== undefined ) {
				if(irow === 0 ) {
					// First record always starts a new group
					grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
					grp.lastvalues[i] = v;
					grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
					$.each(grp.counters[i].summary,function() {
						if ($.isFunction(this.st)) {
							this.v = this.st.call(this, this.v, this.nm, record);
						} else {
							this.v = that.groupingCalculations.handler(this.st, this.v, this.nm, this.sr, this.srt, record);
							if(this.st.toLowerCase() === 'avg' && this.sd) {
								this.vd = that.groupingCalculations.handler(this.st, this.vd, this.sd, this.sr, this.srt, record);
							}
						}
					});
					grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
				} else {
					if (typeof v !== "object" && ($.isArray(grp.isInTheSameGroup) && $.isFunction(grp.isInTheSameGroup[i]) ? ! grp.isInTheSameGroup[i].call(this, grp.lastvalues[i], v, i, grp): grp.lastvalues[i] !== v)) {
						// This record is not in same group as previous one
						grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
						grp.lastvalues[i] = v;
						changed = 1;
						grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
						$.each(grp.counters[i].summary,function() {
							if ($.isFunction(this.st)) {
								this.v = this.st.call(this, this.v, this.nm, record);
							} else {
								this.v = that.groupingCalculations.handler(this.st, this.v, this.nm, this.sr, this.srt, record);
								if(this.st.toLowerCase() === 'avg' && this.sd) {
									this.vd = that.groupingCalculations.handler(this.st, this.vd, this.sd, this.sr, this.srt, record);
								}
							}
						});
						grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
					} else {
						if (changed === 1) {
							// This group has changed because an earlier group changed.
							grp.groups.push({idx:i,dataIndex:fieldName,value:v, displayValue: displayValue, startRow: irow, cnt:1, summary : [] } );
							grp.lastvalues[i] = v;
							grp.counters[i] = {cnt:1, pos:grp.groups.length-1, summary: $.extend(true,[],grp.summary)};
							$.each(grp.counters[i].summary,function() {
								if ($.isFunction(this.st)) {
									this.v = this.st.call(this, this.v, this.nm, record);
								} else {
									this.v = that.groupingCalculations.handler(this.st, this.v, this.nm, this.sr, this.srt, record);
									if(this.st.toLowerCase() === 'avg' && this.sd) {
										this.vd = that.groupingCalculations.handler(this.st, this.vd, this.sd, this.sr, this.srt, record);
									}
								}
							});
							grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
						} else {
							grp.counters[i].cnt += 1;
							grp.groups[grp.counters[i].pos].cnt = grp.counters[i].cnt;
							$.each(grp.counters[i].summary,function() {
								if ($.isFunction(this.st)) {
									this.v = this.st.call(this, this.v, this.nm, record);
								} else {
									this.v = that.groupingCalculations.handler(this.st, this.v, this.nm, this.sr, this.srt, record);
									if(this.st.toLowerCase() === 'avg' && this.sd) {
										this.vd = that.groupingCalculations.handler(this.st, this.vd, this.sd, this.sr, this.srt, record);
									}
								}
							});
							grp.groups[grp.counters[i].pos].summary = grp.counters[i].summary;
						}
					}
				}
			}
		}
		//gdata.push( rData );
		return this;
	},
	groupingToggle : function(hid){
		var that = this,
		grp = that.options.groupingView,
		strpos = hid.split('_'),
		num = parseInt(strpos[strpos.length-2], 10);
		strpos.splice(strpos.length-2,2);
		var uid = strpos.join("_"),
		minus = grp.minusicon,
		plus = grp.plusicon,
		tar = $("#"+$.grid.coralID(hid)),
		r = tar.length ? tar[0].nextSibling : null,
		tarspan = $("#"+$.grid.coralID(hid)+" span."+"tree-wrap-"+that.options.direction),
		getGroupingLevelFromClass = function (className) {
			var nums = $.map(className.split(" "), function (item) {
				if (item.substring(0, uid.length + 1) === uid + "_") {
					return parseInt(item.substring(uid.length + 1), 10);
				}
			});
			return nums.length > 0 ? nums[0] : undefined;
		},
		itemGroupingLevel,
		showData,
		collapsed = false,
		frz = that.options.frozenColumns ? that.options.id+"_frozen" : false,
		tar2 = frz ? $("#"+$.grid.coralID(hid), "#"+$.grid.coralID(frz) ) : false,
		r2 = (tar2 && tar2.length) ? tar2[0].nextSibling : null;
		if( tarspan.hasClass(minus) ) {
			if(grp.showSummaryOnHide) {
				if(r){
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						if (itemGroupingLevel !== undefined && itemGroupingLevel <= num) {
							break;
						}
						$(r).hide();
						r = r.nextSibling;
						if(frz) {
							$(r2).hide();
							r2 = r2.nextSibling;
						}
					}
				}
			} else  {
				if(r){
					while(r) {
						itemGroupingLevel = getGroupingLevelFromClass(r.className);
						if (itemGroupingLevel !== undefined && itemGroupingLevel <= num) {
							break;
						}
						$(r).hide();
						r = r.nextSibling;
						if(frz) {
							$(r2).hide();
							r2 = r2.nextSibling;
						}
					}
				}
			}
			tarspan.removeClass(minus).addClass(plus);
			collapsed = true;
		} else {
			if(r){
				showData = undefined;
				while(r) {
					itemGroupingLevel = getGroupingLevelFromClass(r.className);
					if (showData === undefined) {
						showData = itemGroupingLevel === undefined; // if the first row after the opening group is data row then show the data rows
					}
					if (itemGroupingLevel !== undefined) {
						if (itemGroupingLevel <= num) {
							break;// next item of the same lever are found
						}
						if (itemGroupingLevel === num + 1) {
							$(r).show().find(">td>span."+"tree-wrap-"+ that.options.direction).removeClass(minus).addClass(plus);
							if(frz) {
								$(r2).show().find(">td>span."+"tree-wrap-"+ that.options.direction).removeClass(minus).addClass(plus);
							}
						}
					} else if (showData) {
						$(r).show();
						if(frz) {
							$(r2).show();
						}
					}
					r = r.nextSibling;
					if(frz) {
						r2 = r2.nextSibling;
					}
				}
			}
			tarspan.removeClass(plus).addClass(minus);
		}
		this._trigger("onClickGroup", null, [{"headId":hid , "collapsed":collapsed}]);
		return false;
	},
	groupingRender : function (grdata, colspans, page, rn ) {
		var that = this,
		grp = that.options.groupingView,
		str = "", icon = "", hid, clid, pmrtl = grp.groupCollapse ? grp.plusicon : grp.minusicon, gv, cp=[], len =grp.groupField.length;
		pmrtl += " tree-wrap-"+that.options.direction; 
		$.each(that.options.colModel, function (i,n){
			var ii;
			for(ii=0;ii<len;ii++) {
				if(grp.groupField[ii] === n.name ) {
					cp[ii] = i;
					break;
				}
			}
		});
		var toEnd = 0;
		function findGroupIdx( ind , offset, grp) {
			var ret = false, i;
			if(offset===0) {
				ret = grp[ind];
			} else {
				var id = grp[ind].idx;
				if(id===0) { 
					ret = grp[ind]; 
				}  else {
					for(i=ind;i >= 0; i--) {
						if(grp[i].idx === id-offset) {
							ret = grp[i];
							break;
						}
					}
				}
			}
			return ret;
		}
		function buildSummaryTd(i, ik, grp, foffset) {
			var fdata = findGroupIdx(i, ik, grp),
			cm = that.options.colModel,
			vv, grlen = fdata.cnt, str="", k;
			for(k=foffset; k<colspans;k++) {
				var tmpdata = "<td "+ that._formatCol(k,1,'')+">&#160;</td>",
				tplfld = "{0}";
				$.each(fdata.summary,function(){
					if(this.nm === cm[k].name) {
						if(cm[k].summaryTpl)  {
							tplfld = cm[k].summaryTpl;
						}
						if(typeof this.st === 'string' && this.st.toLowerCase() === 'avg') {
							if(this.sd && this.vd) { 
								this.v = (this.v/this.vd);
							} else if(this.v && grlen > 0) {
								this.v = (this.v/grlen);
							}
						}
						try {
							this.groupCount = fdata.cnt;
							this.groupIndex = fdata.dataIndex;
							this.groupValue = fdata.value;
							vv = this.formatter('', this.v, k, this);
						} catch (ef) {
							vv = this.v;
						}
						tmpdata= "<td "+ that._formatCol(k,1,'')+">"+$.grid.format(tplfld,vv)+ "</td>";
						return false;
					}
				});
				str += tmpdata;
			}
			return str;
		}
		var sumreverse = $.makeArray(grp.groupSummary), mul;
		sumreverse.reverse();
		mul = that.options.multiselect ? " colspan=\"2\"" : "";
		$.each(grp.groups,function(i,n){
			if(grp._locgr) {
				if( !(n.startRow +n.cnt > (page-1)*rn && n.startRow < page*rn)) {
					return true;
				}
			}
			toEnd++;
			clid = that.options.id+"ghead_"+n.idx;
			hid = clid+"_"+i;
			icon = "<span style='cursor:pointer;' class='icon "+pmrtl+"' onclick=\"jQuery('#"+$.grid.coralID(that.options.id)+"').grid('groupingToggle','"+hid+"');return false;\"></span>";
			try {
				if ($.isArray(grp.formatDisplayField) && $.isFunction(grp.formatDisplayField[n.idx])) {
					n.displayValue = grp.formatDisplayField[n.idx].call(this, n.displayValue, n.value, that.options.colModel[cp[n.idx]], n.idx, grp);
					gv = n.displayValue;
				} else {
					gv = this.formatter(hid, n.displayValue, cp[n.idx], n.value );
				}
			} catch (egv) {
				gv = n.displayValue;
			}
			if(grp.groupSummaryPos[n.idx] === 'header')  {
				str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"coral-component-content jqgroup coral-row-"+that.options.direction+" "+clid+"\"><td style=\"padding-left:"+(n.idx * 12) + "px;"+"\"" + mul +">"+icon+$.grid.template(grp.groupText[n.idx], gv, n.cnt, n.summary)+"</td>";
				str += buildSummaryTd(i, 0, grp.groups, grp.groupColumnShow[n.idx] === false ? (mul ==="" ? 2 : 3) : ((mul ==="") ? 1 : 2) );
				str += "</tr>";
			} else {
				str += "<tr id=\""+hid+"\"" +(grp.groupCollapse && n.idx>0 ? " style=\"display:none;\" " : " ") + "role=\"row\" class= \"coral-component-content jqgroup coral-row-"+that.options.direction+" "+clid+"\"><td style=\"padding-left:"+(n.idx * 12) + "px;"+"\" colspan=\""+(grp.groupColumnShow[n.idx] === false ? colspans-1 : colspans)+"\">"+icon+$.grid.template(grp.groupText[n.idx], gv, n.cnt, n.summary)+"</td></tr>";
			}
			var leaf = len-1 === n.idx; 
			if( leaf ) {
				var gg = grp.groups[i+1], kk, ik, offset = 0, sgr = n.startRow,
				end = gg !== undefined ?  gg.startRow : grp.groups[i].startRow + grp.groups[i].cnt;
				if(grp._locgr) {
					offset = (page-1)*rn;
					if(offset > n.startRow) {
						sgr = offset;
					}
				}
				for(kk=sgr;kk<end;kk++) {
					if(!grdata[kk - offset]) { break; }
					str += grdata[kk - offset].join('');
				}
				if(grp.groupSummaryPos[n.idx] !== 'header') {
					var jj;
					if (gg !== undefined) {
						for (jj = 0; jj < grp.groupField.length; jj++) {
							if (gg.dataIndex === grp.groupField[jj]) {
								break;
							}
						}
						toEnd = grp.groupField.length - jj;
					}
					for (ik = 0; ik < toEnd; ik++) {
						if(!sumreverse[ik]) { continue; }
						var hhdr = "";
						if(grp.groupCollapse && !grp.showSummaryOnHide) {
							hhdr = " style=\"display:none;\"";
						}
						str += "<tr"+hhdr+" jqfootlevel=\""+(n.idx-ik)+"\" role=\"row\" class=\"coral-component-content jqfoot coral-row-"+that.options.direction+"\">";
						str += buildSummaryTd(i, ik, grp.groups, 0);
						str += "</tr>";
					}
					toEnd = jj;
				}
			}
		});
		$("#"+$.grid.coralID(that.options.id)+" tbody:first").append(str);
		// free up memory
		str = null;
	},
	groupingGroupBy : function (name, options ) {
		var that = this;
		if(typeof name === "string") {
			name = [name];
		}
		var grp = that.options.groupingView;
		that.options.grouping = true;

		//Set default, in case visibilityOnNextGrouping is undefined 
		if (grp.visibiltyOnNextGrouping === undefined) {
			grp.visibiltyOnNextGrouping = [];
		}
		var i;
		// show previous hidden groups if they are hidden and weren't removed yet
		for(i=0;i<grp.groupField.length;i++) {
			if(!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
			$(this).grid('showCol',grp.groupField[i]);
			}
		}
		// set visibility status of current group columns on next grouping
		for(i=0;i<name.length;i++) {
			grp.visibiltyOnNextGrouping[i] = $("#"+$.grid.coralID(that.options.id)+"_"+$.grid.coralID(name[i])).is(":visible");
		}
		that.options.groupingView = $.extend(that.options.groupingView, options || {});
		grp.groupField = name;
		$(this).trigger("reloadGrid");
	},
	groupingRemove: function (current) {
		var that = this;
		if(current === undefined) {
			current = true;
		}
		that.options.grouping = false;
		if(current===true) {
			var grp = that.options.groupingView, i;
			// show previous hidden groups if they are hidden and weren't removed yet
			for(i=0;i<grp.groupField.length;i++) {
			if (!grp.groupColumnShow[i] && grp.visibiltyOnNextGrouping[i]) {
					$(this).grid('showCol', grp.groupField);
				}
			}
			$("tr.jqgroup, tr.jqfoot","#"+$.grid.coralID(that.options.id)+" tbody:first").remove();
			$("tr.jqgrow:hidden","#"+$.grid.coralID(that.options.id)+" tbody:first").show();
		} else {
			$(this).trigger("reloadGrid");
		}
	},
	groupingCalculations: {
		handler: function(fn, v, field, round, roundType, rc) {
			var funcs = {
				sum: function() {
					return parseFloat(v||0) + parseFloat((rc[field]||0));
				},
				min: function() {
					if(v==="") {
						return parseFloat(rc[field]||0);
					}
					return Math.min(parseFloat(v),parseFloat(rc[field]||0));
				},
				max: function() {
					if(v==="") {
						return parseFloat(rc[field]||0);
					}
					return Math.max(parseFloat(v),parseFloat(rc[field]||0));
				},

				count: function() {
					if(v==="") {v=0;}
					if(rc.hasOwnProperty(field)) {
						return v+1;
					}
					return 0;
				},
				avg: function() {
					// the same as sum, but at end we divide it
					// so use sum instead of duplicating the code (?)
					return funcs.sum();
				}
			};
			if(!funcs[fn]) {
				throw ("grid Grouping No such method: " + fn);
			}
			var res = funcs[fn]();
			if (round != null) {
				if (roundType === 'fixed') {
					res = res.toFixed(round);
				} else {
					var mul = Math.pow(10, round);
					res = Math.round(res * mul) / mul;
				}
			}
			return res;
		}	
	}
});
grid = $.component("coral.grid",$.coral.grid,{
	setSubGrid : function () {
		var that = this, cm, i,
		suboptions = {
			plusicon : "coral-icon-plus",
			minusicon : "coral-icon-minus",
			openicon: "coral-icon-carat-1-sw",
			expandOnLoad:  false,
			delayOnLoad : 50,
			selectOnExpand : false,
			selectOnCollapse : false,
			reloadOnExpand : true
		};
		that.options.subGridOptions = $.extend(suboptions, that.options.subGridOptions || {});
		that.options.colNames.unshift("");
		that.options.colModel.unshift({name:'subgrid',width: $.grid.cell_width ?  that.options.subGridWidth+$t.options.cellLayout :that.options.subGridWidth,sortable: false,resizable:false,hidedlg:true,search:false,fixed:true});
		cm = that.options.subGridModel;
		if(cm[0]) {
			cm[0].align = $.extend([],cm[0].align || []);
			for(i=0;i<cm[0].name.length;i++) { cm[0].align[i] = cm[0].align[i] || 'left';}
		}
	},
	addSubGridCell :function (pos,iRow) {
		var prp='',ic,sid;
			prp = this._formatCol(pos,iRow);
			sid= this.options.id;
			ic = this.options.subGridOptions.plusicon;
		return "<td role=\"gridcell\" aria-describedby=\""+sid+"_subgrid\" class=\"coral-sgcollapsed sgcollapsed\" "+prp+"><a style='cursor:pointer;'><span class='coral-icon "+ic+"'></span></a></td>";
	},
	addSubGrid : function( pos, sind ) {
		var ts = this;
		if (!ts.grid ) { return; }
		//-------------------------
		var subGridCell = function(trdiv,cell,pos)
		{
			var tddiv = $("<td align='"+ts.options.subGridModel[0].align[pos]+"'></td>").html(cell);
			$(trdiv).append(tddiv);
		};
		var subGridXml = function(sjxml, sbid){
			var tddiv, i,  sgmap,
			dummy = $("<table cellspacing='0' cellpadding='0' border='0'><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<ts.options.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='coral-state-default coral-th-subgrid coral-th-column coral-th-"+ts.options.direction+"'></th>");
				$(tddiv).html(ts.options.subGridModel[0].name[i]);
				$(tddiv).width( ts.options.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = ts.options.xmlReader.subgrid;
				$(sgmap.root+" "+sgmap.row, sjxml).each( function(){
					trdiv = $("<tr class='coral-component-content coral-subtblcell'></tr>");
					if(sgmap.repeatitems === true) {
						$(sgmap.cell,this).each( function(i) {
							subGridCell(trdiv, $(this).text() || '&#160;',i);
						});
					} else {
						var f = ts.options.subGridModel[0].mapping || ts.options.subGridModel[0].name;
						if (f) {
							for (i=0;i<f.length;i++) {
								subGridCell(trdiv, $(f[i],this).text() || '&#160;',i);
							}
						}
					}
					$(dummy).append(trdiv);
				});
			}
			var pID = $("table:first",ts.grid.bDiv).attr("id")+"_";
			$("#"+$.grid.coralID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+$.grid.coralID(ts.options.id)).hide();
			return false;
		};
		var subGridJson = function(sjxml, sbid){
			var tddiv,result,i,cur, sgmap,j,
			dummy = $("<table cellspacing='0' cellpadding='0' border='0'><tbody></tbody></table>"),
			trdiv = $("<tr></tr>");
			for (i = 0; i<ts.options.subGridModel[0].name.length; i++) {
				tddiv = $("<th class='coral-state-default coral-th-subgrid coral-th-column coral-th-"+ts.options.direction+"'></th>");
				$(tddiv).html(ts.options.subGridModel[0].name[i]);
				$(tddiv).width( ts.options.subGridModel[0].width[i]);
				$(trdiv).append(tddiv);
			}
			$(dummy).append(trdiv);
			if (sjxml){
				sgmap = ts.options.jsonReader.subgrid;
				result = $.grid.getAccessor(sjxml, sgmap.root);
				if ( result !== undefined ) {
					for (i=0;i<result.length;i++) {
						cur = result[i];
						trdiv = $("<tr class='coral-component-content coral-subtblcell'></tr>");
						if(sgmap.repeatitems === true) {
							if(sgmap.cell) { cur=cur[sgmap.cell]; }
							for (j=0;j<cur.length;j++) {
								subGridCell(trdiv, cur[j] || '&#160;',j);
							}
						} else {
							var f = ts.options.subGridModel[0].mapping || ts.options.subGridModel[0].name;
							if(f.length) {
								for (j=0;j<f.length;j++) {
									subGridCell(trdiv, cur[f[j]] || '&#160;',j);
								}
							}
						}
						$(dummy).append(trdiv);
					}
				}
			}
			var pID = $("table:first",ts.grid.bDiv).attr("id")+"_";
			$("#"+$.grid.coralID(pID+sbid)).append(dummy);
			ts.grid.hDiv.loading = false;
			$("#load_"+$.grid.coralID(ts.options.id)).hide();
			return false;
		};
		var populatesubgrid = function( rd )
		{
			var sid,dp, i, j;
			sid = $(rd).attr("id");
			dp = {nd_: (new Date().getTime())};
			dp[ts.options.prmNames.subgridid]=sid;
			if(!ts.options.subGridModel[0]) { return false; }
			if(ts.options.subGridModel[0].params) {
				for(j=0; j < ts.options.subGridModel[0].params.length; j++) {
					for(i=0; i<ts.options.colModel.length; i++) {
						if(ts.options.colModel[i].name === ts.options.subGridModel[0].params[j]) {
							dp[ts.options.colModel[i].name]= $("td:eq("+i+")",rd).text().replace(/\&#160\;/ig,'');
						}
					}
				}
			}
			if(!ts.grid.hDiv.loading) {
				ts.grid.hDiv.loading = true;
				$("#load_"+$.grid.coralID(ts.options.id)).show();
				if(!ts.options.subgridtype) { ts.options.subgridtype = ts.options.datatype; }
				if($.isFunction(ts.options.subgridtype)) {
					ts.options.subgridtype.call(ts, dp);
				} else {
					ts.options.subgridtype = ts.options.subgridtype.toLowerCase();
				}
				switch(ts.options.subgridtype) {
					case "xml":
					case "json":
					$.ajax($.extend({
						type:ts.options.mtype,
						url: $.isFunction(ts.options.subGridUrl) ? ts.options.subGridUrl.call(ts, dp) : ts.options.subGridUrl,
						dataType:ts.options.subgridtype,
						data: $.isFunction(ts.options.serializeSubGridData)? ts.options.serializeSubGridData.call(ts, dp) : dp,
						complete: function(sxml) {
							if(ts.options.subgridtype === "xml") {
								subGridXml(sxml.responseXML, sid);
							} else {
								subGridJson($.grid.parse(sxml.responseText),sid);
							}
							sxml=null;
						}
					}, $.grid.ajaxOptions, ts.options.ajaxSubgridOptions || {}));
					break;
				}
			}
			return false;
		};
		var _id, pID,atd, nhc=0, bfsc, $r;
		$.each(ts.options.colModel,function(){
			if(this.hidden === true || this.name === 'rn' || this.name === 'cb') {
				nhc++;
			}
		});
		var len = ts.rows.length, i=1;
		if( sind !== undefined && sind > 0) {
			i = sind;
			len = sind+1;
		}
		while(i < len) {
			if($(ts.rows[i]).hasClass('jqgrow')) {
				if(ts.options.scroll) {
					$(ts.rows[i].cells[pos]).unbind('click');
				}
				$(ts.rows[i].cells[pos]).bind('click', function() {
					var tr = $(this).parent("tr")[0];
					pID = ts.options.id;
					_id = tr.id;
					$r = $("#" + pID + "_" + _id + "_expandedContent");
					if($(this).hasClass("sgcollapsed")) {
						bfsc = $(ts).triggerHandler("jqGridSubGridBeforeExpand", [pID + "_" + _id, _id]);
						bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
						if(bfsc && $.isFunction(ts.options.subGridBeforeExpand)) {
							bfsc = ts.options.subGridBeforeExpand.call(ts, pID+"_"+_id,_id);
						}
						if(bfsc === false) {return false;}

						if(ts.options.subGridOptions.reloadOnExpand === true || ( ts.options.subGridOptions.reloadOnExpand === false && !$r.hasClass('coral-subgrid') ) ) {
							atd = pos >=1 ? "<td colspan='"+pos+"'>&#160;</td>":"";
							$(tr).after( "<tr role='row' id='" + pID + "_" + _id + "_expandedContent" + "' class='coral-subgrid coral-sg-expanded'>"+atd+"<td class='coral-component-content subgrid-cell'><span class='coral-icon "+ts.options.subGridOptions.openicon+"'></span></td><td colspan='"+parseInt(ts.options.colNames.length-1-nhc,10)+"' class='coral-component-content subgrid-data'><div id="+pID+"_"+_id+" class='tablediv'></div></td></tr>" );
							$(ts).triggerHandler("jqGridSubGridRowExpanded", [pID + "_" + _id, _id]);
							if( $.isFunction(ts.options.subGridRowExpanded)) {
								ts.options.subGridRowExpanded.call(ts, pID+"_"+ _id,_id);
							} else {
								populatesubgrid(tr);
							}
						} else {
							$r.show().removeClass("coral-sg-collapsed").addClass("coral-sg-expanded");
						}
						$(this).html("<a style='cursor:pointer;'><span class='coral-icon "+ts.options.subGridOptions.minusicon+"'></span></a>").removeClass("sgcollapsed").addClass("sgexpanded");
						if(ts.options.subGridOptions.selectOnExpand) {
							$(ts).jqGrid('setSelection',_id);
						}
					} else if($(this).hasClass("sgexpanded")) {
						bfsc = $(ts).triggerHandler("jqGridSubGridRowColapsed", [pID + "_" + _id, _id]);
						bfsc = (bfsc === false || bfsc === 'stop') ? false : true;
						if( bfsc &&  $.isFunction(ts.options.subGridRowColapsed)) {
							bfsc = ts.options.subGridRowColapsed.call(ts, pID+"_"+_id,_id );
						}
						if(bfsc===false) {return false;}
						if(ts.options.subGridOptions.reloadOnExpand === true) {
							$r.remove(".coral-subgrid");
						} else if($r.hasClass('coral-subgrid')) { // incase of dynamic deleting
							$r.hide().addClass("coral-sg-collapsed").removeClass("coral-sg-expanded");;
						}
						$(this).html("<a style='cursor:pointer;'><span class='coral-icon "+ts.options.subGridOptions.plusicon+"'></span></a>").removeClass("sgexpanded").addClass("sgcollapsed");
						if(ts.options.subGridOptions.selectOnCollapse) {
							$(ts).jqGrid('setSelection',_id);
						}
					}
					return false;
				});
			}
			i++;
		}
		if(ts.options.subGridOptions.expandOnLoad === true) {
			//先判断subgrid图标所在的是第几列
			var options = ts.options,
		    ni = options.rownumbers===true ? 1 :0,
		    gi = options.multiselect ===true ? 1 :(options.singleselect === true ? 1 :0),
		    subCell = ni + gi;
			$(ts.rows).filter('.jqgrow').each(function(index,row){
				$(row.cells[subCell]).click();
			});
		}
		ts.subGridXml = function(xml,sid) {subGridXml(xml,sid);};
		ts.subGridJson = function(json,sid) {subGridJson(json,sid);};
	},
	expandSubGridRow : function(rowid) {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.options.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	},
	collapseSubGridRow : function(rowid) {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.options.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgexpanded",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				}
			}
		}
	},
	toggleSubGridRow : function(rowid) {
		var $t = this;
		if(!$t.grid && !rowid) {return;}
		if($t.options.subGrid===true) {
			var rc = $(this).jqGrid("getInd",rowid,true);
			if(rc) {
				var sgc = $("td.sgcollapsed",rc)[0];
				if(sgc) {
					$(sgc).trigger("click");
				} else {
					sgc = $("td.sgexpanded",rc)[0];
					if(sgc) {
						$(sgc).trigger("click");
					}
				}
			}
		}
	}
});
grid = $.component( "coral.grid", $.coral.grid, {
	filterToolbar : function(p){
		var regional =  $.grid.search;
		options = $.extend({
			autosearch: true,
			autosearchDelay: 500,
			searchOnEnter : true,
			beforeSearch: null,
			afterSearch: null,
			beforeClear: null,
			afterClear: null,
			searchurl : '',
			stringResult: false,
			groupOp: 'AND',
			defaultSearch : "bw",
			searchOperators : false,
			resetIcon : "x",
			operands : { "eq" :"==", "ne":"!","lt":"<","le":"<=","gt":">","ge":">=","bw":"^","bn":"!^","in":"=","ni":"!=","ew":"|","en":"!@","cn":"~","nc":"!~","nu":"#","nn":"!#"}
		}, regional , p  || {});
		var that = this;
		if(that.options.filterToolbar) { return; }
		if(!$(that).data('filterToolbar')) {
			$(that).data('filterToolbar', options);
		}
		if(that.options.force_regional) {
			options = $.extend(options, regional);
		}
		var triggerToolbar = function() {
			var sdata={}, j=0, v, nm, sopt={},so;
			$.each(that.options.colModel,function(){
				var type = this.stype == "text"?"textbox":this.stype;
				var $elem = $("#gsh_"+ that.options.idPrefix+ that.element[0].id+"_"+ $.grid.coralID(this.name)+" .ctrl-init", (this.frozen===true && that.options.frozenColumns === true) ?  that.grid.fhDiv : that.grid.columnsView);
				nm = this.index || this.name;
				if(options.searchOperators ) {
					so = $elem[type]("component").parent().prev().children("a").attr("soper") || options.defaultSearch;
				} else {
					so  = (this.searchoptions && this.searchoptions.sopt) ? this.searchoptions.sopt[0] : this.stype==='select'?  'eq' : options.defaultSearch;
				}
				v = this.stype === "custom" && $.isFunction(this.searchoptions.custom_value) && $elem.length > 0 && $elem[0].nodeName.toUpperCase() === "SPAN" ?
					this.searchoptions.custom_value.call(that, $elem.children(".customelement:first"), "get") :
					$elem.hasClass("ctrl-init")? $elem[type]("getValue") : undefined;
				if(v || so==="nu" || so==="nn") {
					sdata[nm] = v;
					sopt[nm] = so;
					j++;
				} else {
					try {
						delete that.options.postData[nm];
					} catch (z) {}
				}
			});
			var sd =  j>0 ? true : false;
			if(options.stringResult === true || that.options.datatype === "local" || options.searchOperators === true) {
				var ruleGroup = "{\"groupOp\":\"" + options.groupOp + "\",\"rules\":[";
				var gi=0;
				$.each(sdata,function(i,n){
					if (gi > 0) {ruleGroup += ",";}
					ruleGroup += "{\"field\":\"" + i + "\",";
					ruleGroup += "\"op\":\"" + sopt[i] + "\",";
					n+="";
					ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
					gi++;
				});
				ruleGroup += "]}";
				$.extend(that.options.postData,{filters:ruleGroup});
				$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
					if(that.options.postData.hasOwnProperty(n)) { delete that.options.postData[n];}
				});
			} else {
				$.extend(that.options.postData,sdata);
			}
			var saveurl;
			if(that.options.searchurl) {
				saveurl = that.options.url;
				$(that).grid("option",{url:that.options.searchurl});
			}
			var bsr = $(that).triggerHandler("jqGridToolbarBeforeSearch") === 'stop' ? true : false;
			if(!bsr && $.isFunction(options.beforeSearch)){bsr = options.beforeSearch.call(that);}
			if(!bsr) { 
				that.isFilterAction = that.isFilterAction === false ? false : true;
				$(that.element[0]).grid("option",{search:sd}).grid("reload"); 
				that.isFilterAction = false;
				}
			if(saveurl) {$(that.element[0]).grid("option",{url:saveurl});}
			//$(that).triggerHandler("jqGridToolbarAfterSearch");
			if($.isFunction(options.afterSearch)){options.afterSearch.call(that);}
		},
		clearToolbar = function (trigger) {
			var sdata={}, j=0, nm;
			trigger = (typeof trigger !== 'boolean') ? true : trigger;
			$.each(that.options.colModel,function(){
				var v, $elem = $("#gs_"+that.options.idPrefix+$.grid.coralID(this.name),(this.frozen===true && that.options.frozenColumns === true) ?  that.grid.fhDiv : that.grid.columnsView);
				if(this.searchoptions && this.searchoptions.defaultValue !== undefined) { v = this.searchoptions.defaultValue; }
				nm = this.index || this.name;
				switch (this.stype) {
					case 'select' :
						$elem.find("option").each(function (i){
							if(i===0) { this.selected = true; }
							if ($(this).val() === v) {
								this.selected = true;
								return false;
							}
						});
						if ( v !== undefined ) {
							// post the key and not the text
							sdata[nm] = v;
							j++;
						} else {
							try {
								delete that.options.postData[nm];
							} catch(e) {}
						}
						break;
					case 'text':
						$elem.val(v || "");
						if(v !== undefined) {
							sdata[nm] = v;
							j++;
						} else {
							try {
								delete that.options.postData[nm];
							} catch (y){}
						}
						break;
					case 'custom':
						if ($.isFunction(this.searchoptions.custom_value) && $elem.length > 0 && $elem[0].nodeName.toUpperCase() === "SPAN") {
							this.searchoptions.custom_value.call(that, $elem.children(".customelement:first"), "set", v || "");
						}
						break;
				}
			});
			var sd =  j>0 ? true : false;
			that.options.resetsearch =  true;
			if(options.stringResult === true || that.options.datatype === "local") {
				var ruleGroup = "{\"groupOp\":\"" + options.groupOp + "\",\"rules\":[";
				var gi=0;
				$.each(sdata,function(i,n){
					if (gi > 0) {ruleGroup += ",";}
					ruleGroup += "{\"field\":\"" + i + "\",";
					ruleGroup += "\"op\":\"" + "eq" + "\",";
					n+="";
					ruleGroup += "\"data\":\"" + n.replace(/\\/g,'\\\\').replace(/\"/g,'\\"') + "\"}";
					gi++;
				});
				ruleGroup += "]}";
				$.extend(that.options.postData,{filters:ruleGroup});
				$.each(['searchField', 'searchString', 'searchOper'], function(i, n){
					if(that.options.postData.hasOwnProperty(n)) { delete that.options.postData[n];}
				});
			} else {
				$.extend(that.options.postData,sdata);
			}
			var saveurl;
			if(that.options.searchurl) {
				saveurl = that.options.url;
				$(that).grid("option",{url:that.options.searchurl});
			}
			var bcv = $(that).triggerHandler("jqGridToolbarBeforeClear") === 'stop' ? true : false;
			if(!bcv && $.isFunction(options.beforeClear)){bcv = options.beforeClear.call(that);}
			if(!bcv) {
				if(trigger) {
					$(that).grid("option",{search:sd}).trigger("reload",[{page:1}]);
				}
			}
			if(saveurl) {$(that).grid("option",{url:saveurl});}
			//$(that).triggerHandler("jqGridToolbarAfterClear");
			if($.isFunction(options.afterClear)){options.afterClear();}
		},
		toggleToolbar = function(){
			var trow = $("tr.coral-search-toolbar",that.grid.columnsView),
			trow2 = that.options.frozenColumns === true ?  $("tr.coral-search-toolbar",that.grid.fhDiv) : false;
			if(trow.css("display") === 'none') {
				trow.show(); 
				if(trow2) {
					trow2.show();
				}
			} else { 
				trow.hide(); 
				if(trow2) {
					trow2.hide();
				}
			}
		},
		buildRuleMenu = function( elem, left, top ){
			$("#sopt_menu").remove();

			left=parseInt(left,10);
			top=parseInt(top,10) + 18;

			var fs =  $('.coral-grid-view').css('font-size') || '11px';
			var str = '<ul id="sopt_menu" class="coral-search-menu" role="menu" tabindex="0" style="font-size:'+fs+';left:'+left+'px;top:'+top+'px; cursor:pointer;">',
			selected = $(elem).attr("soper"), selclass,
			aoprs = [], ina;
			var i=0, nm =$(elem).attr("colname"),len = that.options.colModel.length;
			while(i<len) {
				if(that.options.colModel[i].name === nm) {
					break;
				}
				i++;
			}
			var cm = that.options.colModel[i],
				opts = $.extend({}, cm.searchoptions);
			if(!opts.sopt) {
				opts.sopt = [];
				opts.sopt[0]= cm.stype==='select' ?  'eq' : options.defaultSearch;
			}
			$.each(options.odata, function() { aoprs.push(this.oper); });
			for ( i = 0 ; i < opts.sopt.length; i++) {
				ina = $.inArray(opts.sopt[i],aoprs);
				if(ina !== -1) {
					selclass = selected === options.odata[ina].oper ? "coral-state-highlight" : "";
					str += '<li class="coral-menu-item '+selclass+'" role="presentation"><a class="coral-corner-all coral-menu-item" tabindex="0" role="menuitem" value="'+options.odata[ina].oper+'" oper="'+options.operands[options.odata[ina].oper]+'"><table cellspacing="0" cellpadding="0" border="0"><tr><td width="25px">'+options.operands[options.odata[ina].oper]+'</td><td>'+ options.odata[ina].text+'</td></tr></table></a></li>';
				}
			}
			str += "</ul>";
			$('body').append(str);
			$("#sopt_menu").addClass("coral-menu coral-component coral-component-content coral-corner-all");
			$("#sopt_menu > li > a").hover(
				function(){ $(this).addClass("coral-state-hover"); },
				function(){ $(this).removeClass("coral-state-hover"); }
			).click(function() {
				var v = $(this).attr("value"),
				oper = $(this).attr("oper");
				//$(that).triggerHandler("jqGridToolbarSelectOper", [v, oper, elem]);
				$("#sopt_menu").hide();
				$(elem).text(oper).attr("soper",v);
				if(options.autosearch===true){
					var inpelm = $(elem).parent().next().children()[0].firstChild.firstChild;
					if( $(inpelm).val() || v==="nu" || v ==="nn") {
						triggerToolbar();
					}
				}
			});
		};
		// create the row
		var tr = $("<tr class='coral-search-toolbar' role='row'></tr>");
		var timeoutHnd;
		$.each(that.options.colModel,function(ci){
			var cm=this, soptions, select = "", sot="=", so, i, st, csv, df, elem,
			th = $("<th role='columnheader' class='coral-state-default coral-th-"+that.options.direction+"' id='gsh_" + that.options.id + "_" + cm.name + "' ></th>"),
			thd = $("<div></div>"),
			stbl = $("<table class='coral-search-table' cellspacing='0'><tr><td class='coral-search-oper' headers=''></td><td class='coral-search-input' headers=''></td><td class='coral-search-clear' headers=''></td></tr></table>");
			if(this.hidden===true) { $(th).css("display","none");}
			this.search = this.search === false ? false : true;
			if(this.stype === undefined) {this.stype='text';}
			soptions = $.extend({},this.searchoptions || {}, {name:cm.index || cm.name, id: "gs_"+that.options.idPrefix+cm.name, oper:'search'});
			if(this.search){
				if(options.searchOperators) {
					so  = (soptions.sopt) ? soptions.sopt[0] : cm.stype==='select' ?  'eq' : options.defaultSearch;
					for(i = 0;i<options.odata.length;i++) {
						if(options.odata[i].oper === so) {
							sot = options.operands[so] || "";
							break;
						}
					}
					st = soptions.searchtitle != null ? soptions.searchtitle : options.operandTitle;
					select = "<a title='"+st+"' style='padding-right: 0.5em;cursor:pointer;' soper='"+so+"' class='soptclass' colname='"+this.name+"'>"+sot+"</a>";
				}
				$("td:eq(0)",stbl).attr("colindex",ci).append(select);
				if(soptions.clearSearch === undefined) {
					soptions.clearSearch = true;
				}
				if(soptions.clearSearch) {
					csv = options.resetTitle || 'Clear Search Value';
					$("td:eq(2)",stbl).append("<a title='"+csv+"' style='padding-right: 0.3em;padding-left: 0.3em;cursor:pointer;' class='clearsearchclass'>"+options.resetIcon+"</a>");
				} else {
					$("td:eq(2)", stbl).hide();
				}
				if(this.surl) {
					soptions.dataUrl = this.surl;
				}
				df="";
				if(soptions.defaultValue ) {
					df = $.isFunction(soptions.defaultValue) ? soptions.defaultValue.call(that) : soptions.defaultValue;
				}
				elem = $.grid.createEl.call(that, cm.stype, soptions , df, false, $.extend({},$.grid.ajaxOptions, that.options.ajaxSelectOptions || {}));
				$(elem).css({width: "100%"}).addClass("coral-widget-content coral-corner-all");
				$("td:eq(1)",stbl).append(elem);
				$(thd).append(stbl);
				$.extend(options,{
					'onKeyPress': function(e, ui){
						var key = e.charCode || e.keyCode || 0;
						if(key === 13){
							triggerToolbar();
							return false;
						}
					},
					'onKeyDown': function(e, ui){
						var key = e.which;
						switch (key) {
							case 13:
								return false;
							case 9 :
							case 16:
							case 37:
							case 38:
							case 39:
							case 40:
							case 27:
								break;
							default :
								if(timeoutHnd) { clearTimeout(timeoutHnd); }
								timeoutHnd = setTimeout(function(){triggerToolbar();},500);
						}
					},
					'onChange': function() {
						triggerToolbar(this);
					}
				});
				switch (this.stype)
				{
				case "combobox":
					var data= this.searchoptions ,opts;
					opts = $.extend(options, data);
					$(elem)[ this.stype ](opts);
					var _onClick = options.onClick;
					options = $.extend({}, options, {"onClick":function(e, ui){
						_onClick&&_onClick.apply(elem, [e, ui]);
					}});
					break;
				case "text":
					options.valueChangedOnKeyUp = true;
					$(elem)[ "textbox" ](options);
				}
			}
			$(th).append(thd);
			$(tr).append(th);
			if(!options.searchOperators) {
				$("td:eq(0)",stbl).hide();
			}
		});
		$("table thead",that.grid.columnsView).append(tr);
		if(options.searchOperators) {
			$(".soptclass",tr).click(function(e){
				var offset = $(this).offset(),
				left = ( offset.left ),
				top = ( offset.top);
				buildRuleMenu(this, left, top );
				e.stopPropagation();
			});
			$("body").on('click', function(e){
				if(e.target.className !== "soptclass") {
					$("#sopt_menu").hide();
				}
			});
		}
		$(".clearsearchclass",tr).click(function() {
			var ptr = $(this).parents("tr:first"),
			coli = parseInt($("td.coral-search-oper", ptr).attr('colindex'),10),
			sval  = $.extend({},that.options.colModel[coli].searchoptions || {}),
			dval = sval.defaultValue ? sval.defaultValue : "";
			if(that.options.colModel[coli].stype === "select") {
				if(dval) {
					$("td.coral-search-input select", ptr).val( dval );
				} else {
					$("td.coral-search-input select", ptr)[0].selectedIndex = 0;
				}
			} else {
				$("td.coral-search-input input", ptr).val( dval );
			}
			// ToDo custom search type
			if(options.autosearch===true){
				triggerToolbar();
			}

		});
		this.options.filterToolbar = true;
		this.triggerToolbar = triggerToolbar;
		this.clearToolbar = clearToolbar;
		this.toggleToolbar = toggleToolbar;
	},
	destroyFilterToolbar: function () {
		if (!this.options.filterToolbar) {
			return;
		}
		this.triggerToolbar = null;
		this.clearToolbar = null;
		this.toggleToolbar = null;
		this.options.filterToolbar = false;
		$(this.grid.columnsView).find("table thead tr.coral-search-toolbar").remove();
	}
});
//noDefinePart
//module end
} ) ); 