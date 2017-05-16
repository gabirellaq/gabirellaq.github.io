( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./panel",
			"./toolbar",
			"./tree"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component("coral.splitcontainer", {
	version: "4.1.4",
	options:{
		minWidth:"600"
	},
	_create: function() {
		var that = this,
			childId,
			opts = this.options,
			el = this.element,
			element = $(this.element),
			elementId = $(this.element).attr('id');
		element.addClass("coral-splitcontainer coral-splitcontainer-showhide");
		var tree = $("<ul id=\""+ elementId +"_tree\" style='display:none'></ul>").appendTo("body");
		tree.tree({}, [{
			"id" : "appRoot",
			"name" : "appRoot",
			"children" : [{
				"id" : "appMaster",
				"name" : "appMaster",
				"children" : []
			},{
				"id" : "appDetails",
				"name" : "appDetails",
				"children" : []
			}]
		}]);
		this.curDetailNode;
		this.pageIdArray = [];
		this.historyIdArray = [];
		this.arr = [];
		var splitMasterId = $("#" + elementId).children("div")[0],
			splitDetailId = $("#" + elementId).children("div")[1];
		if (splitMasterId.id == "") {
			splitMasterId.id = "splitContainer-Master";
		}
		if (splitDetailId.id == "") {
			splitDetailId.id = "splitContainer-Detail";
		}
		$("#" + splitMasterId.id).addClass("coral-nav coral-splitcontainer-master coral-splitcontainer-mastervisible");
		$("#" + splitDetailId.id).addClass("coral-nav coral-splitcontainer-detail");
		var nodeMaster = that.getTree().tree("getNodeByParam", "id", "appMaster"),
			nodeDetail = that.getTree().tree("getNodeByParam", "id", "appDetails");
		this.curDetailNode = nodeDetail;
		$("#" + splitMasterId.id).children("div").each(function(i) {
			opts = $.parser.parseOptions(this,[]);
			var newNodes = that._createView(this.id, opts, $("#" + splitMasterId.id), nodeMaster);
			that.getTree().tree("addNodes",nodeMaster,newNodes);
			if (!that.options.initialMaster && i == 0) {
				that.options.initialMaster = this.id;
			}
			that.initialMaster = $("#"+that.options.initialMaster);
		});
		$("#" + splitDetailId.id).children("div").each(function(i) {
			opts = $.parser.parseOptions(this,[]);
			var newNodes = that._createView(this.id, opts, $("#" + splitDetailId.id), nodeDetail);
			that.getTree().tree("addNodes",nodeDetail,newNodes);
			if (!that.options.initialDetail && i == 0) {
				that.options.initialDetail = this.id;
			}
			if (opts.title) {
				
			}
			that.initialDetail = $("#"+that.options.initialDetail);
		});
		childId = nodeDetail.children[0].id;
		nodeDetail.viewId = "view_"+childId;
		this.addView(childId, $("#"+childId));
		this.toDetail(childId);
		this.pageIdArray.push(childId);
		this.historyIdArray.push(childId);
		this._bindEvent();
	},
	addView: function(id, opts) {
		var elementId = $(this.element).attr("id"),
			that = this,
			splitDetailId = $("#" + elementId).children("div")[1];
		var node = this.getTree().tree("getNodeByParam", "id", id);
		if (node) {
			if (opts && typeof opts === "object") {
				if(opts.url){
					$("#"+node.id).panel("reload", opts.url);
				} else if(opts.content){
					$("#"+node.id).panel("setContent", opts.content);
					var toolbaroptionsData = this.initToolbar(opts);
					$("#"+node.id).prev().find(".ctrl-init-toolbar").toolbar("reload",toolbaroptionsData);
				}
			}
		} else {
			var newNode = this._createView(id, opts, $("#" + splitDetailId.id), this.curDetailNode);
			this.getTree().tree("addNodes", this.curDetailNode, newNode);
			node = this.getTree().tree("getNodeByParam", "id", id);
		}
		this.curDetailNode = node;
		this.pageIdArray.push(node.id);
		this.historyIdArray.push(node.id);
		if (node.level-2 === this.arr.length) {
			this.arr.push(node);
		}
		return $("#"+node.id);
	},
	getCurrentView: function(id){
		return $("#" + this.curDetailNode.id);
	},
	toDetail: function(id,data) {
		var opts = this.options,
			elementId = $(this.element).attr("id"),
			splitDetailId = $("#" + elementId).children("div")[1];
		var node = this.getTree().tree("getNodeByParam", "id", id);
		if (node) {
			$("#" + node.viewId).siblings().hide();
			$("#" + node.viewId).show();
		}
		node.data = data;
		$.coral.refreshAllComponent($("#" + id).parent());
		this._trigger("onDetailNavigate", null, [{'from':this.curDetailNode,
			'fromId':this.curDetailNode.id,'to':node,'toId':id,'direction':'to'}] );
	},
	NodeRadio: function (id, pId, isParent,open,icon,nocheck){  
        var node = {};
        node.id = id;    
        node.pId = pId;    
        node.name = id;
        node.isParent = isParent; 
        node.open =  open;
        node.icon = icon;
        node.nocheck = nocheck;
        return node;
    },
	_createView: function(id, opts, viewPos, pNode) {
		var that = this,
			dir = "",
			divPanel = $("#"+id),
			node = {},
			view,
			viewId,
			preNode,
			pageIndex = $.inArray(id, this.pageIdArray);
		if (divPanel.length == 0) {
			divPanel = $("<div id='"+ id +"'></div>");	
		}
		// 当前node的level
		if (pageIndex > -1) {
			preNode = this.getTree().tree("getNodeByParam", "id", this.pageIdArray[pageIndex - 1]);
			viewId = preNode.viewId;
			view = $("#"+viewId);
		} else {
			viewId = "view_"+id;
			view = $("<div id='"+ viewId +"' class='coral-nav-item' style='width:100%'></div>").appendTo(viewPos);
		}
		divPanel.appendTo(view);
		this.initToolbar(opts);
		var setting = $.extend( {}, {
			fit: true,
			componentCls: "coral-page",
			collapsible: false
		}, opts);
		divPanel.panel(setting);
		
		var rNode = this.NodeRadio(id, pNode.id, false,true,null,false);
		rNode.viewId = viewId;
		return rNode;
	},
	initToolbar: function(opts) {
		var that = this;
		var _navbtn = {
				type: "button",
				icons: "cui-icon-arrow-left3",
				label: "back",
				text: false,
				onClick: function() {
					that.backDetail();
				}
			},
			_title = {
				type: "html",
				content: opts.title
			};
		opts.toolbarOptions = opts.toolbarOptions || {};
		opts.toolbarOptions.data = opts.toolbarOptions.data || [];
		if (opts.title) {
			opts.toolbarOptions.data.unshift("->");
			opts.toolbarOptions.data.unshift(_title);
		}
		if (opts.showNavButton) {
			opts.toolbarOptions.data.unshift("->");
			opts.toolbarOptions.data.unshift(_navbtn);
		}
		$.each(opts.toolbarOptions.data, function(i, value){
			if (this === "navBtn") {
				opts.toolbarOptions.data[i] = _navbtn;
			}
		});
		return opts.toolbarOptions.data;
	},
	_bindEvent: function() {
		var that = this;
		var elementId = $(this.element).attr('id'),
			splitMasterId = $("#" + elementId).children("div")[0];
		this._on( this.document, {
			click: function( e ) {
				var target = $(e.target);
				var elementId = $(that.element).attr('id'),
				 	splitMasterId = $("#" + elementId).children("div")[0];
				var popup = that.element.find('.coral-splitcontainer-master'); 
				var offset = popup.offset();
	            if (e.pageX < offset.left || e.pageX > offset.left + popup.width() ||
	                e.pageY < offset.top || e.pageY > offset.top + popup.height()) {
	            	if (!target.parent().is("button") && $("#" + splitMasterId.id).hasClass("showMaster")) {
	            		 that.hideMaster();
	            	}
	             }
			}
		});
	},
	showMaster: function() {
		var elementId = $(this.element).attr('id');
		var splitMasterId = $("#" + elementId).children("div")[0],
			splitDetailId = $("#" + elementId).children("div")[1];
		$("#" + splitMasterId.id).addClass("showMaster");
	},
	hideMaster: function() {
		var elementId = $(this.element).attr('id');
		var splitMasterId = $("#" + elementId).children("div")[0],
			splitDetailId = $("#" + elementId).children("div")[1];
		$("#" + splitMasterId.id).removeClass("showMaster");
	},
	maxDetail: function(minMax) {
		var elementId = $(this.element).attr('id');
		var splitMasterId = $("#" + elementId).children("div")[0],
			splitDetailId = $("#" + elementId).children("div")[1];
		if (minMax == "max"){
			$("#" + elementId).removeClass("coral-splitcontainer-showhide").addClass("coral-splitcontainer-hidemode");
		} else {
			$("#" + elementId).removeClass("coral-splitcontainer-hidemode").addClass("coral-splitcontainer-showhide");
		}
		$("#" + splitMasterId.id).removeClass("coral-splitcontainer-mastervisible showMaster").addClass("coral-splitcontainer-masterhidden");
		$.coral.refreshAllComponent($("#" +splitDetailId.id).parent());
	},
	refresh: function() {
		var that = this, 
			elementId = $(this.element).attr('id'),
			toolbar, 
			title, 
			isExistMenu,
			splitMasterId = $("#" + elementId).children("div")[0],
			splitDetailId = $("#" + elementId).children("div")[1];
		
		if (this.initialDetail) {
			title = $("#"+this.options.initialDetail).panel("option", "title");
			if (title) {
				toolbar = $("#"+this.options.initialDetail).panel("toolbar");
			}
		}
		if ($(window).width() < this.options.minWidth) {
			$("#" + elementId).addClass("coral-splitcontainer-portrait");
			if (toolbar) {
				isExistMenu = toolbar.toolbar("isExist", this.options.id+"_detailMenu");
				if (!isExistMenu) {
					toolbar.toolbar("add", 0 ,{
						"id": this.options.id+"_detailMenu",
						"type": "button",
						"onClick": function(){
							that.showMaster();
						},
						"icons": "cui-icon-menu7",
						"text": false,
						"label": "菜单"
					});
				}
			}
			$("#" + splitMasterId.id).removeClass("coral-splitcontainer-mastervisible showMaster").addClass("coral-splitcontainer-masterhidden");
		} else {
			$("#" + elementId).removeClass("coral-splitcontainer-portrait");
			$("#" + splitMasterId.id).removeClass("coral-splitcontainer-masterhidden showMaster").addClass("coral-splitcontainer-mastervisible");
			if (toolbar) {
				isExistMenu = toolbar.toolbar("isExist", this.options.id+"_detailMenu");
				if (isExistMenu) {
					toolbar.toolbar("remove", 0);
				}
			}
		}
		$.coral.refreshAllComponent($("#" + splitMasterId.id));
		$.coral.refreshAllComponent($("#" +splitDetailId.id));
	},
	backDetail: function (backData) {
		var index = $.inArray(this.curDetailNode.id,this.historyIdArray);
		if(index <= 0){
			return;
		}
		var preNode = this.getTree().tree("getNodeByParam", "id", this.historyIdArray[index-1]);
		$("#" + preNode.viewId).siblings().hide();
		$("#" + preNode.viewId).show();
		preNode.backData = backData;
		if(index>-1){
			var length = this.historyIdArray.length,
			number = length - index;
			this.historyIdArray.splice(index,number);
		}
		$.coral.refreshAllComponent($("#" + preNode.id).parent());
		this._trigger( "onDetailNavigate", null, [{'from':this.curDetailNode,
			'fromId':this.curDetailNode.id,'to':preNode,'toId':preNode.id,'direction':'back'}]);
		this.curDetailNode = preNode;
	},
	backToView: function(id,backData) {
		var index = $.inArray(id,this.historyIdArray);
		if(index < 0){
			return;
		}
		var toNode = this.getTree().tree("getNodeByParam", "id", id);
		$("#" + toNode.viewId).siblings().hide();
		$("#" + toNode.viewId).show();
		toNode.backData = backData;
		$.coral.refreshAllComponent($("#" + id).parent());
		this._trigger( "onDetailNavigate", null, [{'from':this.curDetailNode,
			'fromId':this.curDetailNode.id,'to':toNode,'toId':toNode.id,'direction':'backToView'}]);
	},
	backToTopDetail: function (backData) {
		var topNode = this.getTree().tree("getNodeByParam", "id", "appDetails");
		$("#" + topNode.viewId).siblings().hide();
		$("#" + topNode.viewId).show();
		topNode.backData = backData;
		$.coral.refreshAllComponent($("#" + topNode.id).parent());
		this._trigger( "onDetailNavigate", null, [{'from':this.curDetailNode,
			'fromId':this.curDetailNode.id,'to':topNode,'toId':topNode.id,'direction':'backToTop'}]);
	},
	reload: function(id,pId) {
		var pNode;
		if (pId) {
		
		} else {
			this.curDetailNode = pNode = this.getTree().tree("getNodeByParam", "id", "appDetails");
		}
		this.toDetail(id);
	},
	getTree: function() {
		return $("#"+$(this.element).attr('id')+"_tree");
	}
});
// noDefinePart
} ) );