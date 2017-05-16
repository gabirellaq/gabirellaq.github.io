( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./autocomplete"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.autocompletetree", $.coral.autocomplete, {
	requestIndex: 0,
	pending: 0,
	options: {
		allowPushParent: false,
		rootNode: false,
		multiLineLabel: false,
		radioType: "level",
		showRootNode: true,
		showClose: false,
		cascadeCheck: false,
		multiple : false,
        triggers: null, // 覆盖 validate 里的 triggers
        excluded: false // true 则不单独校验
	},
	_create: function() {
		this.options.render = "tree";
		this._super();
	},
	_filter: function( array, request, response  ){
		$( this.menu.element ).tree("reload", array);
		$( this.menu.element ).tree("filterNodesByParam", {"name": request.term} );
		response( array );
	},
	
	_initData: function(){
		var that = this;
		this.menu = {};
		var u = $( "<ul>" )[0];
		$( u )
		.uniqueId()
		.addClass( "coral-autocomplete-panel coral-front" )
		.appendTo( this._appendTo() )
		.tree({
			showLine: false,
			showIcon: true,
			radioType: this.options.radioType,
			checkable : this.options.chkStyle != null ? true : false,
			chkStyle : this.options.chkStyle,	
			showRootNode:this.options.showRootNode,
			rootNode:this.options.rootNode,
			componentCls: "coral-autocomplete-tree",
			beforeClick : function ( treeId, treeNode ) {
				if ( !that.options.allowPushParent && treeNode.isParent ) return false;
				var fn = $.coral.toFunction( that.options.beforeClick );
				if(!that.options.checkable){
					if ( $.isFunction(fn) ) {
						return fn(treeId, treeNode);
					}
					return true;
				} else {
					return false;
				}
			},
			onClick: function( event, treeId, treeNode ){
				var item = treeNode,
					previous = that.previous;
				// only trigger when focus was lost (click on menu)
				if ( that.element[ 0 ] !== that.document[ 0 ].activeElement ) {
					that.element.focus();
					that.previous = previous;
					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					that._delay(function() {
						that.previous = previous;
						that.selectedItem = item;
					});
				}

				if ( false !== that._trigger( "beforeNodeClick", event, { item: item ,value: that.getValue() } ) ) {
					that.selectedItem = item;
					that.selectedItems.push( item );
					var value = that.getValue(),
					text = that.getText(),
					vv = value==""?[]:value.split(that.options.separator),
					vt = text==""?[]:text.split(that.options.separator);
					if ( that.options.multiple ) {
						if ( !that.options.allowRepeat && $.inArray(treeNode.id , vv) > -1 ) {
							return ;
						}
						vv.push( treeNode.id );
						vt.push( treeNode.name );
					} else {
						vv = [ treeNode.id ];
						vt = [ treeNode.name ];
					}
					that.setText( vt.join(that.options.separator) );
					that.setValue( vv.join(that.options.separator), true );
				}
				that._trigger( "onNodeClick", event, { item: item ,value: that.getValue() } );
				// reset the term after the select event
				// this allows custom select handling to work properly
				//that.term = that._text();
				that.term = that._text();
				that.close( event );
			},
			onCheck : function(e, treeId, treeNode){
				var textArr = [];
				var valueArr = [];
				var nodes = $('#'+treeId).tree("getCheckedNodes",true);
				var value = that.getValue(),
					text = that.getText(),
					valueArr = value==""?[]:value.split(that.options.separator),
					textArr = text==""?[]:text.split(that.options.separator);
				for (var i=0, l=nodes.length; i<l; i++) {
					//在关联父子节点时,半选状态节点不作为下拉框的值
					if(that.options.cascadeCheck || !nodes[i].getCheckStatus().half){
						if (!that.options.allowPushParent && nodes[i].isParent) {
							continue;
						}
						if ( that.options.allowRepeat || $.inArray(nodes[i].id , valueArr) == -1 ) {
							textArr.push(nodes[i].name);
							valueArr.push(nodes[i].id);
						}
					}
				}
				//给下拉框赋值
				that.setValue(valueArr.join(that.options.separator), true);
				that._trigger("onNodeCheck", e, {treeId:treeId, node:treeNode});
			}
		})
		.hide();
		this.menu.element = $( u );
		if ( isNaN( this.options.panelHeight ) ) {
			$(".coral-autocomplete-panel").css( {
				"max-height": this.options.maxPanelHeight +"px"
			} );
		}
	}
});
// noDefinePart
} ) );