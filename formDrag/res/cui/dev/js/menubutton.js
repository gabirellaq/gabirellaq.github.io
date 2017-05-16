( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./button",
			"./menu",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*!
 * 组件库4.0：下拉按钮
 * 
 * 依赖JS文件：
 *    jquery.coral.core.js
 *    jquery.coral.component.js
 */


$(document).unbind(".coral-menubutton").bind("mousedown.coral-menubutton mousewheel.coral-menubutton",function(e){
	if ( $(e.target).closest("span.coral-menubutton,.coral-menubutton-buttons").length ) return;
	$(".coral-menubutton-buttons").hide();
	
});

$.component( "coral.menubutton", $.coral.button, {
	version: "4.0.2",
	castProperties: ["menuOptions"],
	options: {
		/* default options */
		id: null,
		name: null,
		label: null,
		cls: null,
		icons: {
			primary: null,
			secondary: "cui-icon-arrow-down3"
		},
		width: null,
		text: true,
		disabled: false,
		renderType: "menu", // "menu"（渲染成菜单项，可嵌套）, "button"（渲染成按钮，只有一层）
		// menu options
		menuOptions: {
			autoDisplay: false,
			popup: true
		},
		data: null, // data（menu data 或者自己的data）
		url: null, // url（menu url 或者自己的url）
		method: "get",
		// 定义弹出面板的弹出位置，仅限 renderType 为 "button"
		position: {
			my: "left top",
			at: "left bottom"
		},
		/* default events */
		onCreate: null,
		onClick: null,
		onDblClick: null,
		onLoad: null
	},
	/**
		显示buttons弹出面板，仅限当renderType为"button"时
	 */
	showPanel: function() {
		var that = this,
			opts = this.options;

		var position = $.extend(opts.position, {
			of: this.element
		});
		
		var zIndicies = this.uiButtons.siblings( ".coral-front:visible" ).map(function() {
				return +$( this ).css( "z-index" );
			}).get(),
			zIndexMax = Math.max.apply( null, zIndicies );
		if ( zIndexMax >= +this.uiButtons.css( "z-index" ) ) {
			this.uiButtons.css( "z-index", zIndexMax + 1 );
		}

		this.uiButtons.css({
			position: "absolute",
			left: "",
			top: "",
			"max-height":"300px",
			overflow:"auto"
		})
		.position(position)
		.show();
	},
	/**
		隐藏buttons弹出面板，仅限当renderType为"button"时
	 */
	hidePanel: function() {
		this.uiButtons.hide();
	},
	/**
	 * begin create a menubutton
	 */
    _create: function() {    	
    	this._initElements();
    	this._super();
	},	
	/**
		获取自身所属的工具条元素，如果没有则返回 $()
	**/
	_getToolbar: function(isComponent) {
		var that = this,
			opts = this.options,
			$toolbar = $();

		if (this.element.hasClass("ctrl-toolbar-element")) {
			$toolbar = isComponent ? this.element.parents(".coral-toolbar:eq(0)") : this.element.parents(".ctrl-init-toolbar:eq(0)");
		}

		return $toolbar ;
	},
	/**
		hide all tieredmenus
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
	 * initialize relevant doms and attributes
	 */
	_initElements: function() {
		var that = this,
			opts = this.options;
    	
    	this.element.addClass("ctrl-init ctrl-init-menubutton coral-menubutton-element");    	
    	this.uiBorder = $("<span class=\"coral-menubutton-border\"></span>");
    	this.uiBox = $("<span class=\"coral-menubutton\"></span>");
    	this.uiBox.append(this.uiBorder);    	
    	this.uiBox.insertAfter (this.element );
    	this.uiBorder.append (this.element);
    	
    	if (typeof this.element.attr("id") != "undefined") {
    		this.options.id = this.element.attr("id");
    	} else if (this.options.id) {
    		this.element.attr("id", this.options.id);
    	} else {
    		this.options.id = this.element.uniqueId().attr("id");
    	}
    	if (typeof this.element.attr("name") != "undefined") {
    		this.options.name = this.element.attr("name");
    	} else if (this.options.name){
    		this.element.attr("name", this.options.name);
    	}

    	this.options.onClick = function (e, ui) {
    		if (opts.renderType == "button") {
				if ( !that.uiButtons.is(":visible") ) {
					that.showPanel();
				} else {
					that.hidePanel();
				}
			}
			if ( !that._getToolbar().length || !that._getToolbar().toolbar("option", "autoDisplay") ) return ;

			var $toolbarComponent = that._getToolbar(true);
			
			if ($toolbarComponent.length) {
				$toolbarComponent.toggleClass("coral-toolbar-click-active");
			}
    	},
    	this.options.onMouseEnter = function (e, ui) {
    		if ( !that._getToolbar().length || !that._getToolbar().toolbar("option", "autoDisplay") ) return ;
			if (opts.renderType == "button") return ;
			var $toolbarComponent = that._getToolbar(true);

			if ($toolbarComponent.hasClass("coral-toolbar-click-active")) {
				if ($(".coral-tieredmenu:visible").length) {
    				that._hideMenus();    				
    			}
				that.uiMenu.tieredmenu("show");
			}
    	};
    	
    	// listen menu's click event and trigger the default click event
    	this._on( this.element, {
    		buttononclick: function(e,ui) {
    			that._trigger("onClick", e, ui);
    		}
    	});

    	if (opts.renderType == "button") {
    		this.uiButtons = $("<div class='coral-menubutton-buttons coral-front'></div>").appendTo( $(document.body) );
    		this._loadData();
    	} else {
    		this.uiMenu = $("<ul class=\"coral-menubutton-menu\"></ul>").appendTo( $(document.body) );
    		this._renderMenu();
    	}
	},	
	/**
		渲染成menu
	*/
	_renderMenu: function() {
		var that = this,
			opts = this.options,
			menuOpts = this.options.menuOptions,
			data = this.options.data,
			url = this.options.url;

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
    		trigger: this.element,
    		of: this.element
    	});
    	
    	this.uiMenu.tieredmenu(menuOpts);
    	// listen menu's click event and trigger the default click event
    	if (that._getToolbar().length && that._getToolbar().toolbar("option", "autoDisplay")) {
	    	// 鼠标离开 menu 时，隐藏所有的 同类 menu
	    	this.uiMenu.tieredmenu("component").bind("mouseleave", function() {
	    		that._hideMenus();
	    	});
	    	// 鼠标离开 menu 时，隐藏所有的 同类 menu
    	}
    	this._on( this.uiMenu, {
    		tieredmenuonclick: function(e,ui) {
    			that._trigger("onClick", e, ui);
    		}
    	});
	},
	/**
	 * load data，当renderType为button时
	 */
	_loadData: function () {
		var that = this,
			options = this.options;

		if (options.url) {
			$.ajax({
				type: options.method,
				url: options.url,
				data: {},
				dataType: "json",
				success: function (data) {
					that._initData(data);
				},
				error: function () {
			        $.alert( "Json Format Error!" );
				}
			});
		} else if (options.data) {
			this._initData(options.data);	
		}
	},	
	/**
	 * initialize data，当renderType为button时
	 */
	_initData: function (data) {
		var that = this;
		
		if (typeof data === "object") {
			this._addItems(null, data); // index = null 代表尾部直接添加
		}

		that._trigger("onLoad", null, {});
	},
	_addItems: function (index, data) {
		if (typeof data !== "object") return ;
		
		var that = this,
			items = [],
			len = data.length;
		
		for (var i = 0; i < len; i++) {
			var itemData = data[i];
			
			if ( !$.isEmptyObject( itemData ) ) {
				items.push( that._createButton(itemData) );
			}
		}
		
		this._appendItems(index, items);
		this._initItems(items);
	},	
	_createButton: function (options) {
		return {
			button: $("<button type='button'></button>").addClass("coral-menubutton-button-item"),
			options: options // coral init options
		};
	},
	_appendItems: function (index, items) {
		for (var i in items) {	
			items[i].button.appendTo(this.uiButtons);
		}
	},
	_initItems: function ( items ) {
		var that = this;
		
		for (var i in items) {
			var $el = items[i].button,
				opts = items[i].options;

			$el["button"](opts);
			// listen item's click event and trigger the default click event
			var _opts = {} ;				
			_opts["button" + "onclick"] = function(e,ui) {
    			that._trigger("onClick", e, ui);
    		};
			that._on( $el, _opts);
		}
	},
	/**
		add items
		@param $elements {jquery dom elements} : 要添加的 dom jquery 对象集合
	**/
	add: function ( $elements ) {
		/* */
	},
	/**
		prepend $elements
		@param $elements {jquery dom elements} : 要添加的 dom jquery 对象集合
	**/
	prepend: function($elements) {
		if (!$elements instanceof jQuery) return ;
		var that = this,
			len = $elements.length;
		if ( !($elements instanceof Array) ) {
			$elements = [$elements];
		}
		for(var i = len-1; i > -1; i--) {
			var $element = $elements[i];
			$element.css({
				"margin": "",
				"left": "",
				"right": ""
			})
			.removeClass("coral-menubutton-button-item")
			.addClass("coral-menubutton-button-item")
			.prependTo(that.uiButtons);
		}
	},
	/**
		append $elements
		@param $elements {jquery dom elements} : 要添加的 dom jquery 对象集合
	**/
	append: function($elements) {
		if (!$elements instanceof jQuery) return ;
		var that = this,
			len = $elements.length;
		if ( !($elements instanceof Array) ) {
			$elements = [$elements];
		}
		for(var i = len-1; i > -1; i--) {
			var $element = $elements[i];
			$element.css({
				"margin": "",
				"left": "",
				"right": ""
			})
			.removeClass("coral-menubutton-button-item")
			.addClass("coral-menubutton-button-item")
			.prependTo(that.uiButtons);
		}
	},
	pop: function () {
		var that = this,
			opts = this.options;

		if ( "button" != opts.renderType ) return $();

		var $elementPop = this.uiButtons.find(".coral-menubutton-button-item:eq(0)");

		if ($elementPop.length) {
			return $elementPop.removeClass("coral-menubutton-button-item");
		} else {
			return $();
		}
	},
	/**
	 * 返回 uiBox 元素
	 */
	component : function() {
		/*var that = this;*/
		
		return this.uiBox;
	},
	/**
	 * 返回 uiBorder 元素
	 */
	border: function() {
		/*var that = this;*/

		return this.uiBorder;
	},
	/**
		返回 buttons 面板，仅限 renderType 为 "button" 时
	**/
	buttons: function() {
		return this.uiButtons;
	},
	/**
		返回 buttons 面板下的所有子 $dom
	**/
	buttonElements: function() {
		return this.uiButtons.children();
	},
	/**
	 * 返回 mainButton 元素
	 */
	/*button: function() {
		return this.mainButton;
	},*/
	/**
	 *  返回 uiMenu，仅限renderType 为 "menu" 时
	 */
	menu: function() {
		return this.uiMenu;
	},
	/**
	 * !-- extend api: 绑定事件
	 */
	_bindEvents: function() {
		// add code here ...
	},
	/**
	 * 设置属性
	 */
	_setOption: function (key, value) {
		var that = this;
		
		if (key === "id" || key === "name") {
			return ;
		}
		if (key === "disabled") {
			this.element.toggleClass("coral-state-disabled", value);
		}

		this._super(key, value);
	},
	/**
	 * 销毁组件
	 */
	_destroy : function() {
		var opts = this.options;
		
		this.uiBox.replaceWith(this.element);

		if (opts.renderType == "buttons") {
			this.uiButtons.remove();
		} else {
			this.uiMenu.parent().remove();
		}

		this.element.children().remove();
		this.element.removeClass("ctrl-init ctrl-init-menubutton coral-menubutton-element");
	}
});
// noDefinePart
} ) );