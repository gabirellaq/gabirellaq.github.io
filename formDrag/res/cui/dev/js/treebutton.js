( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./button",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.component( "coral.treebutton", $.coral.button, {
	version: $.coral.version,
	castProperties: ["treeOptions"],
	options: {
		/* default options */
		id: null,
		name: null,
		label: null,
		cls: null,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		width: null,
		text: true,
		disabled: false,
		multiple: false,
		//position:
		// tree options
		treeOptions: {
			id:null,
			name:null,
			data:null,
			showLine:false,
			showIcon:false,
			checkable:true
		},
		/* default events */
		onCreate: null,
		onClick: null,
		onCheck:null,
		onSelect:null
	},
	/**
	 * get tree - dom element
	 */
	tree: function() {
		return this.uiTree;
	},
	/**
	 * begin create a treebutton
	 */
    _create: function() {
    	var that = this;
    	this._super();
    	this._initElements();
	},	
	_initElements: function() {
		var that = this,
			opts = this.options,
			treeOpts = this.options.treeOptions;
    	
    	this.element.addClass("coral-treebutton-element").uniqueId();
    	
    	this.uiTree = $("<ul>")
    		.attr( "id", $(this.element).attr('id')+"_tree" )
    		.addClass( "coral-treebutton-panel coral-front" )
    		.appendTo ( "body" );
    	// init buttons
    	/*this.element.button({
    		label: opts.label,
    		icons: opts.icons,
    		text: opts.text,
    		width: opts.width,
    		disabled: opts.disabled
    	});*/
    	// listen tree's click event and trigger the default click event
    	this.element.on( "click", function( e, ui ) {
    		that._showtree();
    	});
    	
    	this._on( this.document, {
    		mousedown: function( event ) {
				if(event.isDefaultPrevented())return;
				that._hidetree();
			}
		});
    	this.uiTree.unbind().bind("mousedown", function(e){
			e.preventDefault();
    	});
    	// listen tree's click event and trigger the default click event
    	var setting = {
			checkable : this.options.multiple			
    	};
    	// init 
    	treeOpts = $.extend({},  setting, opts.treeOptions, {
    		id: $(this.element).attr('id')+"_tree"
    	});
    	
    	this.uiTree.tree(treeOpts);
	},
	_bindEvents: function() {
		
	},
	/**
	 * set options
	 */
	_setOption: function (key, value) {
		var that = this;
		
		/*if (key === "id" || key === "name") {
			return;
		}
		if (key == "disabled") {
			this.element.button("option", "disabled", value);
		}*/
		this._super (key, value );
	},
	_showtree: function( items ) {
		var ul = this.uiTree;
		ul.show();
		var zIndicies = ul.siblings( ".coral-front:visible" ).map(function() {
			return +$( this ).css( "z-index" );
		}).get(),
		zIndexMax = Math.max.apply( null, zIndicies );
		if ( zIndexMax >= +ul.css( "z-index" ) ) {
			ul.css( "z-index", zIndexMax + 1 );
		}
		
		ul.position( $.extend({
			of: this.element
		}, this.options.position ) );
	},
	_hidetree: function(){
		this.uiTree.hide();	
	},
	disabledNode: function(id){
		var nodes = this.uiTree.tree("getNodesByParam", "id", id);
		for (var i=0, l=nodes.length; i < l; i++) {
			this.uiTree.tree("setChkDisabled", nodes[0], true);
		}
	},
	undisabledNode:function(id){
		var nodes = this.uiTree.tree("getNodesByParam", "id", id);
		for (var i=0, l=nodes.length; i < l; i++) {
			this.uiTree.tree("setChkDisabled", nodes[0], false);
		}
	},
	/**
	 * destroy
	 */
	_destroy : function() {
		this.uiTree.remove();
		this.element.removeClass("ctrl-init ctrl-init-treebutton coral-treebutton-element");
	}
});
// noDefinePart
} ) );