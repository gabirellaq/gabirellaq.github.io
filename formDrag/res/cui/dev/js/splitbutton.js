( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./button"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.component( "coral.splitbutton", $.coral.button, {
	version: "4.0.2",
	componentName: "splitbutton",
	castProperties: ["menuOptions", "dataCustom"],
	options: {
		/* default options */
		id: null,
		name: null,
		label: null,
		cls: null,
		icons: {
			primary: null,
			secondary: null
		},
		width: null,
		text: true,
		disabled: false,
		// menu options
		menuOptions: {
			autoDisplay: false,
			popup: true
		},
		data: null, // menu data
		url: null, // menu url
		
		/* default events */
		onCreate: null,
		onClick: null,
		onDblClick: null
	},
	/**
	 * get splitbutton waper box
	 */
	component : function() {
		var that = this;
		
		return this.uiBox;
	},
	/**
	 * get splitbutton border - dom element
	 */
	uiBorder: function() {
		return this.uiBorder;
	},
	/**
	 * get the right button - dom element
	 */
	uiDropdownButton: function() {
		return this.dropdownButton;
	},
	/**
	 * get menu - dom element
	 */
	menu: function() {
		return this.uiMenu;
	},
	/**
	 * begin create a splitbutton
	 */
    _create: function() {
    	var that = this;
    	
    	this._initElements();
    	this._super();
	},	
	/**
	 * initialize relevant doms and attributes
	 */
	_initElements: function() {
		var that = this,
			opts = this.options,
			menuOpts = this.options.menuOptions,
			data = this.options.data,
			url = this.options.url;
    	
    	this.element.addClass("ctrl-init ctrl-init-splitbutton coral-splitbutton-element");
    	this.dropdownButton = $("<button class='coral-splitbutton-dropdownbutton' type='button'></button>").uniqueId();    	
    	this.uiBorder = $("<span class=\"coral-splitbutton-border\"></span>");
    	this.uiBox = $("<span class=\"coral-splitbutton\"></span>");
    	this.uiBox.append(this.uiBorder);
    	this.uiMenu = $("<ul class=\"coral-splitbutton-menu\"></ul>");    	
    	this.uiBox.insertAfter( this.element );
    	this.uiBorder.append( this.element ).append( this.dropdownButton );
    	this.uiMenu.appendTo( $(document.body) );
    	// set width and cls
    	if ( opts.width ) {
			this.uiBox.css({ width:opts.width });
		}
    	if ( typeof this.element.attr("id") != "undefined" ) {
    		this.options.id = this.element.attr("id");
    	} else if ( this.options.id ) {
    		this.element.attr("id", this.options.id);
    	} else {
    		this.options.id = this.element.uniqueId();
    	}
    	if ( typeof this.element.attr("name") != "undefined" ) {
    		this.options.name = this.element.attr("name");
    	} else if ( this.options.name ) {
    		this.element.attr("name", this.options.name);
    	}
    	this.triggerId = this.dropdownButton.attr("id");
    	// listen menu's click event and trigger the default click event
    	this._on( this.element, {
    		buttononclick: function(e, ui) {
    			that._trigger("onClick", e, ui);
    		}
    	});
    	this.dropdownButton.button({
    		label: "下拉按钮",
    		text: false,
    		icons: "cui-icon-arrow-down3",
    		onClick: function(e, ui) {
    			if ( !that._getToolbar().length || that._getToolbar().toolbar("option", "clickToDisplay") == 0 ) return;
    			if ( !that._getToolbar().length || !that._getToolbar().toolbar("option", "autoDisplay") ) return ;

    			var $toolbarComponent = that._getToolbar(true);
    			
    			if ($toolbarComponent.length) {
    				$toolbarComponent.toggleClass("coral-toolbar-click-active");
    			}
    		},
    		onMouseEnter: function(e, ui) {  
    			if ( !that._getToolbar().length || !that._getToolbar().toolbar("option", "autoDisplay") ) return ;
    					
    			var $toolbarComponent = that._getToolbar(true);

    			if ($toolbarComponent.hasClass("coral-toolbar-click-active")) {
    				if ($(".coral-tieredmenu:visible").length) {
	    				that._hideMenus();			
	    			}
    				that.uiMenu.tieredmenu("show");
    			}
    		}
    	});    	
    	// init menu
    	var dataOrUrl = {};
    	if (null != data) {
    		dataOrUrl["data"] = data;
    	}
    	if (null != url) {
    		dataOrUrl["url"] = url;
    	}
    	menuOpts = $.extend({}, dataOrUrl, opts.menuOptions, {
    		id: this.element.attr("id")+"_tieredmenu",
    		trigger: this.dropdownButton,
    		of: this.element
    	});
    	this.uiMenu.tieredmenu( menuOpts );

    	if ( that._getToolbar().length && that._getToolbar().toolbar("option", "autoDisplay") ) {
	    	// 鼠标离开 menu 时，隐藏所有的 同类 menu
	    	this.uiMenu.tieredmenu("component").bind("mouseleave", function() {
	    		that._hideMenus();
	    	});
	    	// 鼠标离开 menu 时，隐藏所有的 同类 menu
    	}
    	// listen menu's click event and trigger the default click event
    	this._on( this.uiMenu, {
    		tieredmenuonclick: function(e,ui) {
    			that._trigger("onClick", e, ui);
    		}
    	});
	},
	/**
		获取自身所属的工具条元素，如果没有则返回 $()
	**/
	_getToolbar: function(isComponent) {
		var that = this,
			opts = this.options,
			$toolbar = $();

		if ( this.element.hasClass("ctrl-toolbar-element") ) {
			$toolbar = isComponent ? this.element.parents(".coral-toolbar:eq(0)") : this.element.parents(".ctrl-init-toolbar:eq(0)");
		}

		return $toolbar;
	},
	/**
	 *	hide all tieredmenus
	**/
	_hideMenus: function() {
		$(".coral-tieredmenu").hide();
	},
	hideAllMenus: function(){
		$(".coral-tieredmenu").hide();
	},
	showMenu: function(){
		this.uiMenu.tieredmenu("show");
	},
	/**
	 * set options
	**/
	_setOption: function (key, value) {
		if ( key === "id" || key === "name" ) {
			return ;
		}

		var that = this;
		
		if ( key === "disabled" ) {
			this.element.toggleClass("coral-state-disabled", value);
			this.dropdownButton.button("option", "disabled", value);
		}

		this._super (key, value );
	},
	/**
	 * destroy
	**/
	_destroy : function() {		
		this.uiBox.replaceWith( this.element );
		this.uiMenu.parent().remove();
		//this.element.children().remove();
		this.element.removeClass("ctrl-init ctrl-init-splitbutton coral-splitbutton-element");
	}
});
// noDefinePart
} ) );