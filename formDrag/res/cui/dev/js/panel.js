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

var _timer = false, _resizable = true;
$(window).unbind(".coral-panel").bind("resize.coral-panel",	function() {
	if (!_resizable) {
		return;
	}
	if (_timer !== false) {
		clearTimeout(_timer);
	}
	_timer = setTimeout(function() {
		_resizable = false;
		$.coral.refreshAllComponent("body");
		_timer = false;
		_resizable = true;
	}, 200);
});

$.component( "coral.panel", {
	version: "4.0.2",
	options: {
		id: null,
		title: null,
		iconCls: null, 
		width: "auto", 
		height: "auto", 
		left:null, 
		top: null, 
		cls: null,
		headerCls: null,
		bodyCls: null,
		style: {},
		href:  null,
		cache: true,
		fit:   false,
		border: true,
		doSize: true,
		showHeader: true,
		showTitle: true,
		content: null,
		collapsible: false,
		showNavButton:false,
		minimizable: false,
		maximizable: false,
		closable:  false,
		collapsed: false,
		minimized: false,
		maximized: false,
		closed:false,
		tools: null,
		url:  null,
		loadtext:"加载中，请耐心等候...",
		loadingMessage:"Loading...",
		extractor: function(content) {
			var reg = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
			var match = reg.exec(content);
			if(match) {
				return match[1];
			} else {
				return content;
			}
		},
		// 事件
		beforeOpen: $.noop,
		beforeClose: $.noop,
		beforeDestroy: $.noop,
		beforeCollapse: $.noop,
		beforeExpand: $.noop,
		
		onLoad: $.noop, 
		onOpen: $.noop,
		onClose: $.noop,
		onDestroy: $.noop,
		onResize: $.noop, /*参数(envent, {width, height})*/
		onMove: $.noop,   /*参数(envent, {left, top})*/
		onMaximize: $.noop,
		onRestore: $.noop,
		onMinimize: $.noop,
		onCollapse: $.noop,
		onExpand: $.noop
	},
	
	_create: function() {

		this.originalTitle = this.element.attr("title");
		this.element.removeAttr("title").addClass("ctrl-init ctrl-init-panel");
		this._createWrapper();
		this.isLoaded = false;
		
		this.element.appendTo(this.uiPanel);
		this._addHeader();
		this._setBorder();
		if (this.options.doSize == true) {
			this.uiPanel.css("display", "block");
			this.resizePanel();
		}
		if (this.options.closed == true || this.options.minimized == true) {
			this.close();
		} else {
			this.open();
		}
	},
	
	_createWrapper: function() {
		var that = this;
		this.element.addClass("coral-panel-body");
		this.uiPanel = $("<div class=\"coral-panel\"></div>").insertBefore(this.element);
	},
	
	_fit: function(fit) {
		return $.coral.panel.fit(this.uiPanel, fit);
	},
	
	resizePanel: function(resizeOpts){
		var opts  = this.options,
		    panel = this.uiPanel,
		    header = panel.children("div.coral-panel-header"),
		    body   = panel.children("div.coral-panel-body");
		if (resizeOpts) {
			$.extend(opts, {
				width: resizeOpts.width,
				height: resizeOpts.height,
				left: resizeOpts.left,
				top: resizeOpts.top
			});
		}
		opts.fit ? $.extend(opts, this._fit()) : this._fit(false);
		panel.css({
			left : opts.left,
			top : opts.top
		});
		if (!isNaN(opts.width)) {
			panel.outerWidth(opts.width);
		} else {
			panel.width("auto");
		}
		header.add(body).outerWidth(panel.width());
		if (!isNaN(opts.height)) {
			panel.outerHeight(opts.height);
			body.outerHeight(panel.height() - header.outerHeight());
		} else {
			body.height("auto");
			panel.css("height", "");
		}
		this._doResize();
		if (this.toolbarEl) {
			this.toolbarEl.toolbar("refresh");
		}
		this._trigger("onResize", null, { width: opts.width, height: opts.height });
	},
	
	_setBorder: function() {
		var opts   = this.options,
		    panel  = this.uiPanel,
		    header = this.header(),
		    body   = this.body();
		if (!$.isEmptyObject(opts.style)) {
			panel.css(opts.style);
		}
		if (opts.border) {
			header.removeClass("coral-panel-header-noborder");
			body.removeClass("coral-panel-body-noborder");
		} else {
			header.addClass("coral-panel-header-noborder");
			body.addClass("coral-panel-body-noborder");
		}
		header.addClass(opts.headerCls);
		body.addClass(opts.bodyCls);
		/*if (opts.id) {
			$(this.element).attr("id", opts.id);
		} else {
			$(this.element).attr("id", "");
		}//*/
	},
	
	_addHeader: function() {
		var opts  = this.options,
		    panel = this.uiPanel,
		    that  = this;
		if (opts.tools && typeof opts.tools == "string") {
			panel.find(">div.coral-panel-header>div.coral-panel-tool .coral-panel-tool-a")
				.appendTo(opts.tools);
		}
		panel.children("div.coral-panel-header").remove();
		if (opts.title && opts.showHeader) {
			var header = $("<div class=\"coral-panel-header\"></div>").prependTo(panel);
			this.toolbarEl = $("<div></div>");
			this.toolbarEl.appendTo(header);
			var toolData = [];
			var _title = {
					type: "html",
					content: opts.title
				},
				_collapse = {
					type: "button",
					icons: "cui-icon-arrow-up3 coral-panel-tool-collapse",
					label: "collapse",
					text: false,
					onClick: function() {
						if (opts.collapsed === true) {
							that.expand(true);
						} else {
							that.collapse(true);
						}
					}
				},
				_minimize = {
					type: "button",
					icons: "cui-icon-minus3 coral-panel-tool-min",
					label: "minimize",
					text: false,
					onClick: function() {
						that.minimize();
					}
				},
				_maximize = {
					type: "button",
					icons: "cui-icon-enlarge7 coral-panel-tool-max",
					label: "maximize",
					text: false,
					onClick: function() {
						if (opts.maximized === true) {
							that.restore();
						} else {
							that.maximize();
						}
					}
				},
				_close = {
					type: "button",
					icons: "cui-icon-cross2 coral-panel-tool-close",
					label: "close",
					text: false,
					onClick: function() {
						that.close();
					}
				};
			var toolOpts = {
					data: toolData
				};
			if (opts.toolbarOptions) {
				$.each(opts.toolbarOptions.data, function(i, value){
					if (value === "title") {
						opts.toolbarOptions.data[i] = _title;
					}
					if (value === "collapse") {
						opts.toolbarOptions.data[i] = _collapse;
					}
					if (value === "minimize") {
						opts.toolbarOptions.data[i] = _minimize;
					}
					if (value === "maximize") {
						opts.toolbarOptions.data[i] = _maximize;
					}
					if (value === "close") {
						opts.toolbarOptions.data[i] = _close;
					}
				});
				$.extend(true, toolOpts, opts.toolbarOptions);
			} else {
				if (opts.showTitle) {
					toolData.push(_title);
				}
				toolData.push("->");
				if ( opts.collapsible ) {
					toolData.push(_collapse);
				}
				if ( opts.minimizable ) {
					toolData.push(_minimize);
				}
				if ( opts.maximizable ) {
					toolData.push(_maximize);
				}
				if ( opts.closable ) {
					toolData.push(_close);
				}
			}
			this.toolbarEl.toolbar(toolOpts);
			panel.children("div.coral-panel-body").removeClass("coral-panel-body-noheader");
		} else {
			panel.children("div.coral-panel-body").addClass("coral-panel-body-noheader");
		}
	},
	toolbar: function(){
		return this.toolbarEl;
	},
	_loadData: function() {
		var opts = this.options,
		    that = this;
		if ( opts.url ) {
			if ( !that.isLoaded || !opts.cache ) {
				that.isLoaded = false;
				that.element.html("");
				$(this.element).loading({
					position:   "inside",
					text:       this.options.loadtext
				});
				// 如果重复刷新panel，需要将上一次的请求终止。
				if ( this.xhr ){
					this.xhr.abort();
				}
				this.xhr = $.ajax(this._ajaxSettings( ));
				this.xhr
					.success(function( content ) {
						that.setContent( opts.extractor.call( that.element, content ) );
						that._trigger( "onLoad", null, arguments );
						that.isLoaded = true;
					}).complete(function( jqXHR, status ) {
						if ( jqXHR === that.xhr ) {
						    that.xhr = null;
						}
					});
			}
		} else {
			if (opts.content) {
				if (!that.isLoaded) {
					that.setContent(opts.content);
					that.isLoaded = true;
				}
			}
		}
	},
	_ajaxSettings:function(){
		var opts = this.options,
	        that = this;
		return {
			url : opts.url,
			cache : false,
			dataType : "html"
		};
	},
	_doResize: function() {
		$.coral.refreshChild(this.element);
	},
	_destroy: function(forceDestroy) {
		if (forceDestroy != true) {
			if (this._trigger("beforeDestroy") == false) {
				return;
			}
		}
		if (this.originalTitle) {
			this.element.attr("title", this.originalTitle);
		}
		this.element.removeClass("coral-panel-body").detach();
		this.element.insertAfter(this.component());
		this.component().remove();
		this._trigger("onDestroy");
	},
	component: function() {
		return this.uiPanel;
	},
	panel: function() {
		return this.uiPanel;
	},
	getOptions: function() {
		return this.options;
	},
	header: function() {
		return this.uiPanel.find(">div.coral-panel-header");
	},
	body: function() {
		return this.uiPanel.find(">div.coral-panel-body");
	},
	setTitle: function(title) {
		this.options.title = title;
		this.header().find("div.coral-panel-title").html(title);
	},
	// 设置内容
	setContent: function(content) {
		this.element.children().remove();
		this.element.html(content);
		if ($.parser) {
			$.parser.parse(this.element);
		}
	},
	open: function(forceOpen) {
		var opts    = this.options,
		    restore = null;
		if (forceOpen != true) {
			if (this._trigger("beforeOpen", null) === false) {
				return;
			}
		}
		this.uiPanel.show();
		opts.closed = false;
		opts.minimized = false;
		restore = this.uiPanel
			.children(".coral-panel-header")
			.find("a.coral-panel-tool-restore");
		if (restore.length) {
			opts.maximized = true;
		}
		this._trigger("onOpen");
		if (opts.maximized === true) {
			opts.maximized = false;
			this.maximize();
		}
		if (opts.collapsed === true) {
			opts.collapsed = false;
			this.collapse();
		}
		if (!opts.collapsed) {
			this._loadData();
			this._doResize();
		}
	},
	close: function(forceClose) {
		var opts = this.options;
		var panel = this.uiPanel;
		if (forceClose != true) {
			if (this._trigger("beforeClose", null) == false) {
				return;
			}
		}
		this._fit(false);
		panel.hide();
		opts.closed = true;
		this._trigger("onClose");
	},
	refresh: function(url) {
		this.isLoaded = false;
		if (url) {
			this.options.url = url;
		}
		this._loadData();
	},
	reload: function(url) {
		this.refresh(url);	
	},
	resize: function(options) {
		this.resizePanel(options);
	},
	move: function(options) {
		var opts = this.options;
		if (options) {
			if (options.left != null) {
				opts.left = options.left;
			}
			if (options.top != null) {
				opts.top = options.top;
			}
		}
		this.uiPanel.css({
			left : opts.left,
			top : opts.top
		});
		this._trigger("onMove", null, { left: opts.left, top: opts.top });
	},
	maximize: function() {
		var opts = this.options;
		if (opts.maximized === true) {
			return;
		}
		this.uiPanel.children("div.coral-panel-header")
		            .find("a.coral-panel-tool-max")
		            .addClass("coral-panel-tool-restore")
		            .addClass("cui-icon-shrink7")
		            .removeClass("cui-icon-enlarge7");
		if (!this.original) {
			this.original = {
				width : opts.width,
				height : opts.height,
				left : opts.left,
				top : opts.top,
				fit : opts.fit
			};
		}
		opts.left = 0;
		opts.top = 0;
		opts.fit = true;
		this.resizePanel();
		opts.minimized = false;
		opts.maximized = true;
		this._trigger("onMaximize");
	},
	minimize : function() {
		this._fit(false);
		this.uiPanel.hide();
		this.options.minimized = true;
		this.options.maximized = false;
		this._trigger("onMinimize");
	},
	restore: function() {
		if (this.options.maximized === false) {
			return;
		}
		this.uiPanel.show();
		this.uiPanel.children("div.coral-panel-header")
		            .find("a.coral-panel-tool-max")
		            .removeClass("coral-panel-tool-restore")
				    .addClass("cui-icon-enlarge7")
				    .removeClass("cui-icon-shrink7");
		$.extend(this.options, this.original);
		this.resizePanel();
		this.options.minimized = false;
		this.options.maximized = false;
		this.original = null;
		this._trigger("onRestore");
	},
	collapse: function(animate) {
		var opts = this.options,
		    body = this.body(),
		    that = this;
		if (opts.collapsed === true) {
			return;
		}
		body.stop(true, true);
		if (that._trigger("beforeCollapse") === false) {
			return;
		}
		this.header().find("a.coral-panel-tool-collapse").addClass("coral-panel-tool-expand");
		//this.header().find("a.cui-icon-arrow-down3").removeClass("cui-icon-arrow-down3").addClass("cui-icon-arrow-up3");
		if (animate === true) {
			body.slideUp("normal", function() {
				opts.collapsed = true;
				that._trigger("onCollapse");
			});
		} else {
			body.hide();
			opts.collapsed = true;
			that._trigger("onCollapse");
		}
	},
	expand: function(animate) {
		var opts = this.options,
		    body = this.body(),
		    that = this;
		if (opts.collapsed === false) {
			return;
		}
		body.stop(true, true);
		if (that._trigger("beforeExpand") === false) {
			return;
		}
		this.header().find("a.coral-panel-tool-collapse").removeClass("coral-panel-tool-expand");
		//$(this.header().find("a.cui-icon-arrow-up3")).removeClass("cui-icon-arrow-up3").addClass("cui-icon-arrow-down3");
		if (animate === true) {
			body.slideDown("normal", function() {
				opts.collapsed = false;
				that._trigger("onExpand");
				that._loadData();
				that._doResize();
			});
		} else {
			body.show();
			opts.collapsed = false;
			that._trigger("onExpand");
			that._loadData();
			that._doResize();
		}
	}
});

/**
 * 面板自适应
 */
$.coral.panel.fit = function ($ele, fit) {
	fit = (fit == undefined ? true : fit);
	var parent = $ele.parent()[0];
	parent = $(parent);
	if (fit) {
		if (!parent.hasClass("coral-noscroll")) {
			parent.addClass("coral-noscroll");
			if (parent.attr("tagName") == "BODY") {
				$("html").addClass("coral-panel-fit");
			}
		}
	} else {
		if (parent.hasClass("coral-noscroll")) {
			parent.removeClass("coral-noscroll");
			if (parent.attr("tagName") == "BODY") {
				$("html").removeClass("coral-panel-fit");
			}
		}
	}
	return {
		width: parent.width(),
		height: parent.height()
	};
};
// noDefinePart
} ) );