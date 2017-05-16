( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
		    "./component",
			"./mouse",
		    "./button",
			"./draggable",
			"./position",
			"./resizable"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*!
 * 组件库4.0： 窗体
 *
 * 依赖JS文件:
 *	jquery.coral.core.js
 *	jquery.coral.component.js
 *	jquery.coral.mouse.js
 *  jquery.coral.button.js
 *	jquery.coral.draggable.js
 *	jquery.coral.position.js
 *	jquery.coral.resizable.js
 */
(function() {

var sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},
	timer = null;

$.component("coral.dialog", {
	version: "@version",
	castProperties : ["buttons","position"],
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		closeOnEscape: true,
		closeText: "关闭",
		closeButtonClass: "cui-icon-cross2",
		closable: true,// 是否可关闭，出现关闭图标
		loadtext: "加载中，请耐心等候 ...", // 20141230 - haibo lee
		maximumText: "最大化",
		maximizable: false,// 是否出现最大化按钮
		maximized: false, // default maxized or not
		minimizable: false,// 是否出现最小化按钮
		minimized: false, // default maxized or not
		minimizText: "最小化",
		restoreWidth: 200,
		restoreHeight: 200,
		dialogClass: "",
		iframePanel: false,
		draggable: true,
		animateType:null,
		hide: null,
		delay:"800",
		height: "auto",
		percent: false,
		manualResize: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		zIndex: null,
		timeOut: 0,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			using: function(pos) {
				var topOffset = $(this).css(pos).offset().top;
				if (topOffset < 0) {
					$(this).css("top", pos.top - topOffset);
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		subTitle:null,
		type: null, //消息类型："info" "warn" "error" "question"
		wtype: "dialog", //窗体类型："dialog" "message" "alert" "confirm"
		message: null,
		width: 300,
		url: "",
		contentType: "",
		reLoadOnOpen: false,
		postData: [],
		asyncType: "post",//Ajax 的 http 请求模式
		/*titleFormat: function(titles) {
			var title = titles.split('-');
			var title1 = "<span class='coral-dialog-mainTitle'>"+title[0]+"</span>";
			var title2 = "<span class='coral-dialog-subTitle'>"+title[1]+"</span>";
			return title1+title2;
		},*/
		// 事件
		beforeClose: null,
		onCreate: null,
		onClose: null,
		onDrag: null,
		onDragStart: null,
		onDragStop: null,
		onFocus: null,
		onLoad: null,
		onLoadError: null,
		onOpen: null,
		onResize: null,
		onResizeStart: null,
		onResizeStop: null,
		onConfirm: null,
		onCancel : null,
		focusInput : false
		
	},
	_compatible: function() {
		this.options.reloadOnOpen = this.options.reLoadOnOpen;
	},
	_create: function() {
		this._compatible();
		var that = this, animateArr = [];
		var re =/^(\d|[1-9]\d|100)%$/;
		if (re.test(this.options.height)) {
			this.options.percent = this.options.height;
			this.options.height = this._percentToPx();
		}
		
		if ($.inArray(this.options.wtype, ["dialog", "message", "alert", "confirm"]) < 0) {
			this.options.wtype = "dialog";
		}
		
		if (this.options.wtype !== "dialog") {
			this.options.minHeight = null;
		}
		this.originalCss = {
			display: this.element[0].style.display,
			width: this.element[0].style.width,
			minHeight: this.element[0].style.minHeight,
			maxHeight: this.element[0].style.maxHeight,
			height: this.element[0].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr("title");
		this.options.title = this.options.title || this.originalTitle;
		this.originalsubTitle = this.element.attr("subTitle");
		this.options.subTitle = this.options.subTitle || this.originalsubTitle;
		animateArr = ["slideTop","slideBottom","slideLeft","slideRight"];
		if($.inArray(this.options.animateType, animateArr) > -1) {
			this.animate = true;
		}
		this._createWrapper();
		var contentCls = this.options.isMessage ? "alert-box" : "coral-dialog-content";
		this.element
			.show()
			.removeAttr("title")
			.addClass(contentCls + " coral-component-content")
			.appendTo(this.uiDialog);
		
		if (this.options.wtype !== "dialog") {
			this.uiDialog.addClass("coral-messager");
		}

		switch (this.options.wtype) {
			case "alert":
				this._createTitlebar();
				this._createButtonPanel();
				break;
			case "message":
				break;
			case "confirm":
				this._createTitlebar();
				this._createButtonPanel();
				break;
			case "dialog":
				this._createTitlebar();
				this._createButtonPanel();
		}
		
		if (this.options.draggable && $.fn.draggable) {
			this._makeDraggable();
		}
		if (this.options.resizable && $.fn.resizable) {
			this._makeResizable();
		}
		this._isOpen = false;
		this._trackFocus();
	},

	_init: function() {
		if (this.options.autoOpen) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if (typeof element == "string" && element == "parent"){
			return this.originalPosition.parent;
		}
		if (element && (element.jquery || element.nodeType)) {
			return $(element);
		}
		return this.document.find(element || "body").eq(0);
	},
	/**
	 * 强制销毁dialog
	 */
	forceDestroy: function() {
		var that = this;
		this._destroy(true);
	},
	_destroy: function(forceDestroy) {
		var next,
			originalPosition = this.originalPosition;
		this._destroyOverlay();
		this.element
			.removeUniqueId()
			.removeClass("coral-dialog-content coral-component-content")
			.css(this.originalCss)
			.detach();

		this.uiDialog.stop(true, true).remove();
		if (this.options.iframePanel) {
			this.iframePanel.stop(true, true).remove();
		}
		if (!forceDestroy) {
			if (this.originalTitle) {
				this.element.attr("title", this.originalTitle);
			}
			next = originalPosition.parent.children().eq(originalPosition.index);
			if (next.length && next[0] !== this.element[0]) {
				next.before(this.element);
			} else {
				originalPosition.parent.append(this.element);
			}
		}
	},

	component: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,
	minimize: function() {
		var activeElement,
			that = this,
			next,
			originalPosition = this.originalPosition;
		
		// hide first, or it will influence the auto fit
		// it must be hide first, then move the dialog to the original position
		// or it will be overflow the parent dom, and chrome will has scroll bar
		this._hide(this.uiDialog, this.options.hide, function() {
			next = originalPosition.parent.children().eq(originalPosition.index);
			if (next.length && next[0] !== that.element[0]) {
				next.before(that.uiDialog);
			} else {
				originalPosition.parent.append(that.uiDialog);
			}
			
			that._isOpen = false;
			that._focusedElement = null;
			that._destroyOverlay();
			that._untrackInstance();
			if ($.inArray(that.options.wtype, ["dialog","alert","confirm"]) > -1) {
				if (that.opener.length && that.opener[0].tagName.toLowerCase() != "object" && 
						!that.opener.filter(":focusable").focus().length) {
					// support: IE9
					// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
					try {
						activeElement = that.document[0].activeElement;
						
						// Support: IE9, IE10
						// If the <body> is blurred, IE will switch windows, see #4520
						if (activeElement && activeElement.nodeName.toLowerCase() !== "body") {
							
							// Hiding a focused element doesn't trigger blur in WebKit
							// so in case we have nothing to focus on, explicitly blur the active element
							// https://bugs.webkit.org/show_bug.cgi?id=47182
							$(activeElement).blur();
						}
					} catch (error) {}
				}
			}
	
			if ("dialog" !== that.options.wtype) {
				that.element.remove();
			}
			that._trigger("onMinimize", event);
		});	
		if(this.options.iframePanel){
			this.iframePanel.hide();
		}
	},
	close: function(event) {
		var activeElement,
			that = this,
			next,
			optsHide = this.options.hide,
			originalPosition = this.originalPosition;
		if(this.animate){
			if(that.uiDialog.hasClass("in")){
				that.uiDialog.removeClass("in");
//				setTimeout(function(){
//					that.uiDialog.removeClass(that.options.animateType);
//				},800)
			}
			optsHide = this.options;
		}
		if (this.options.reLoadOnOpen) {
			this.loaded = false;
		}
		if (!this._isOpen || this._trigger("beforeClose", event) === false) {
			return;
		}
		// dialog must remove first then clear the content
		// or the flash method call is undefined, the flash can not be destroy.
		//关闭就销毁
		if (that.options.destroyOnClose) {
			that.element.html("");
		}
		//有url的情况下才销毁 autoDestroy为true说明
		if (that.options.url != "" && that.options.reLoadOnOpen && that.options.autoDestroy) {
			that.element.html("");
		}
		// hide first, or it will influence the auto fit
		// it must be hide first, then move the dialog to the original position
		// or it will be overflow the parent dom, and chrome will has scroll bar
		this._hide(this.uiDialog, optsHide, function() {
			next = originalPosition.parent.children().eq(originalPosition.index);
			if (next.length && next[0] !== that.element[0]) {
				next.before(that.uiDialog);
			} else {
				originalPosition.parent.append(that.uiDialog);
			}
			
			that._isOpen = false;
			that._focusedElement = null;
			that._destroyOverlay();
			that._untrackInstance();
			if ($.inArray(that.options.wtype, ["dialog","alert","confirm"]) > -1) {
				if (that.opener.length && that.opener[0].tagName.toLowerCase() != "object" && 
						!that.opener.filter(":focusable").focus().length) {
					// support: IE9
					// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
					try {
						activeElement = that.document[0].activeElement;
						
						// Support: IE9, IE10
						// If the <body> is blurred, IE will switch windows, see #4520
						if (activeElement && activeElement.nodeName.toLowerCase() !== "body") {
							
							// Hiding a focused element doesn't trigger blur in WebKit
							// so in case we have nothing to focus on, explicitly blur the active element
							// https://bugs.webkit.org/show_bug.cgi?id=47182
							$(activeElement).blur();
						}
					} catch (error) {}
				}
			}
			
			if ("dialog" !== that.options.wtype) {
				that.element.remove();
			}
			that._trigger("onClose", event);
		});	
		if(this.options.iframePanel){
			this.iframePanel.hide();
		}
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function(event, silent) {
		var moved = false,
		zIndicies = this.uiDialog.siblings(".coral-front:visible").map(function() {
			return +$( this ).css("z-index");
		}).get(),
		zIndexMax = Math.max.apply(null, zIndicies);
		
		if (zIndexMax >= +this.uiDialog.css("z-index")) {
			this.uiDialog.css("z-index", zIndexMax + 1);
			if(this.options.iframePanel){
				this.iframePanel.css("z-index", zIndexMax + 1);
			}
			moved = true;
		}
		
		if (moved && !silent) {
			this._trigger("onFocus", event);
		}
		return moved;
	},
	reload: function() {
		var that = this,
			eventData = {
				panel: that.element
			};
		var canRequest = this.options.url;
		if (canRequest) {
			$(that.element).loading({
				position:   "overlay",
				text:       "加载中，请耐心等候！"
			});
			that.loaded = true;
			$.ajax({
				url: this.options.url,
				type: this.options.asyncType,
				dataType: "html" ,
				data: this.options.postData,
				success: function(data, st, xhr) {
					$(that.element).loading("hide");
					that.element.html(data);
					$(that.element).loading({
						text:       "渲染中，请耐心等候！",
						position:   "overlay"
					});
					/*if ($.coral.openTag == true) {
					}*/
					$.parser.parse(that.element);
					$(that.element).loading("hide");
					//that.hideLoading(); // loading end
					that._trigger ("onLoad", null, eventData);
					//$.coral.refreshAllComponent(that.element);
				},
				error: function(xhr,st,err) {
					that._trigger ("onLoadError", null, [{xhr:xhr,st:st,err:err}]);
				},
				beforeSend: function(xhr, settings ) {
					
				}
			});
		}
	},
	open: function() {
		var that = this,
			eventData = {
				panel: that.element
			};
		this.uiDialog.appendTo(this._appendTo());
		var canRequest = this.options.url && !that.loaded;
		if (canRequest) {
			$(that.element).loading({
				position:   "overlay",
				text:       "加载中，请耐心等候！"
			});
			that.loaded = true;
			$.ajax({
				contentType: this.options.contentType,
				url: this.options.url,
				type: this.options.asyncType,
				dataType: "html" ,
				data: this.options.postData,
				success: function(data, st, xhr) {
					$(that.element).loading("hide");
					that.element.html(data);
					$(that.element).loading({
						text:       "渲染中，请耐心等候！",
						position:   "overlay"
					});
					/*if ($.coral.openTag == true) {
					}*/
					$.parser.parse(that.element);
					$(that.element).loading("hide");
					//that.hideLoading(); // loading end
					that._trigger ("onLoad", null, eventData);
					//$.coral.refreshAllComponent(that.element);
				},
				error: function(xhr,st,err) {
					that._trigger ("onLoadError", null, [{xhr:xhr,st:st,err:err}]);
				},
				beforeSend: function(xhr, settings ) {
					
				}
			});
		}
		timer = null;
		if (this._isOpen) {
			if (this._moveToTop()) {
				if ($.inArray(that.options.wtype, ["dialog","alert", "confirm"]) > -1) {
					this._focusTabbable();
				}
			}
			return;
		}
		this._isOpen = true;
		this.opener = $(this.document[0].activeElement);

		this._size();
		if(this.animate){
			setTimeout(function(){
				that.uiDialog.addClass("in");
			},0)
		} else {
			this._position();
		}
		this._createOverlay();
		this._moveToTop(null, true);
		
		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if (this.overlay) {
			this.overlay.css("z-index", this.uiDialog.css("z-index") - 1);
			if(this.options.iframePanel){
				this.overlay.css("z-index", this.iframePanel.css("z-index") - 1);
			}
		}
		
		this._show (this.uiDialog, this.options.show, function() {
			if ($.inArray(that.options.wtype, ["dialog","alert", "confirm"]) > -1) {
				that._focusTabbable();
			}
			if (!canRequest) {
				$.coral.refreshAllComponent(that.element);//added 
			} else {
				$(that.element).loading("refresh");// 打开后重新设置对话框里面的loading的高度。
			}
			if(that.options.iframePanel){
				that.iframePanel.show();
				that.iframePanel.css("width",that.uiDialog.outerWidth());
			}
			that._trigger("onFocus");
		});
		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();
		
		this._trigger("onOpen");
		
		if (!isNaN(this.options.timeOut) && this.options.timeOut > 0) {
			timer = setTimeout(_close, that.options.timeOut);
			
			this.uiDialog.hover(function() {
				if (timer) {
					clearTimeout(timer);
				}
			}, function() {
				timer = setTimeout(_close, that.options.timeOut);
			});
		}
		
		function _close () {
			that.close();
		}
	},

	_focusTabbable: function() {
		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		
		var hasFocus = this._focusedElement;
		if (this.options.focusInput === true) {
			this._focusFirst();
			return;
		}
		if (!hasFocus) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if (!hasFocus.length) {
			hasFocus = this.element.find(":tabbable");
		}
		if (!hasFocus.length && this.uiDialogButtonPane) {
			hasFocus = this.uiDialogButtonPane.find(":tabbable");
		}
		if (!hasFocus.length && this.uiDialogTitlebarClose) {
			hasFocus = this.uiDialogTitlebarClose.filter(":tabbable");
		}
		if (!hasFocus.length) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq(0).focus();
	},
	_findFields : function(){
		return $.coral.findComponent(".ctrl-form-element", this.element);
	},
	_focusFirst: function() {
		var that = this,
			fields = this._findFields();
		
		for (var i in fields) {
			var instance = fields[i];
			if (instance.focus && true == instance.focus()) return;		
		}
	},
	_keepFocus: function(event) {
		function checkFocus() {
			var activeElement = this.document[0].activeElement,
				isActive = this.uiDialog[0] === activeElement ||
					$.contains(this.uiDialog[0], activeElement);
			if (!isActive) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call(this);
		this._delay(checkFocus);
	},

	_createWrapper: function() {
		this.uiDialog = $("<div>")
			.addClass("coral-dialog coral-component coral-component-content coral-corner-all coral-front " +
				this.options.dialogClass)
			.hide()
			.attr({
				tabIndex: -1,
				role: "dialog"
			})
			//.appendTo( this._appendTo() );
			.appendTo( this.element.parent() );
		if(this.animate){
			this.uiDialog.addClass(this.options.animateType);
		}
		if (this.options.iframePanel) {
			this.iframePanel = $("<iframe class='coral-dialog-iframePanel' style='position:absolute;'></iframe>")
			.hide()
			.appendTo(this._appendTo());
		}
		if (this.options.zIndex) {
			this.uiDialog.css("z-index", this.options.zIndex);
			if (this.options.iframePanel) {
				this.iframePanel.css("z-index", this.options.zIndex);
			}
		}

		this._on(this.uiDialog, {
			keydown: function(event) {
				if (this.options.closeOnEscape && !event.isDefaultPrevented() && 
						event.keyCode && event.keyCode === $.coral.keyCode.ESCAPE) {
					event.preventDefault();
					this.close(event);
					return;
				}

				if (event.keyCode !== $.coral.keyCode.TAB || event.isDefaultPrevented()) {
					return;
				}
				var tabbables = this.uiDialog.find(":tabbable"),
					first = tabbables.filter(":first"),
					last  = tabbables.filter(":last");

				if ((event.target === last[0] || event.target === this.uiDialog[0] ) && 
						!event.shiftKey) {
					this._delay(function() {
						first.focus();
					});
					event.preventDefault();
				} else if ((event.target === first[0] || event.target === this.uiDialog[0]) && 
						event.shiftKey) {
					this._delay(function() {
						last.focus();
					});
					event.preventDefault();
				}
			},
			mousedown: function (event) {
				if ( this._moveToTop(event)) {
					this._focusTabbable();
				}
			}
		});

		if (!this.element.find("[aria-describedby]").length) {
			this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr("id")
			});
		}
	},
	_createTitlebar: function() {
		var options = this.options,
			uiDialogTitle;
			
		this.uiDialogTitlebar = $("<div>")
			.addClass ("coral-dialog-titlebar coral-component-header coral-corner-all coral-helper-clearfix")
			.prependTo(this.uiDialog);
		this.uiDialogToolbar = $("<div>")
			.addClass ("coral-dialog-toolbar coral-corner-all coral-helper-clearfix")
			.appendTo (this.uiDialogTitlebar);
		this._on(this.uiDialogTitlebar, {
			mousedown: function(event) {
				if (!$(event.target).closest(".coral-dialog-toolbar-close") && 
					!$( event.target ).closest(".coral-dialog-toolbar-maximum")) {
					this.uiDialog.focus();
				}
			}
		});
		
		if (this.options.minimizable) {
			// 添加 最大化 功能
			this.uiDialogTitlebarMaximum = $("<button type='button'></button>")
				.button({
					label: "&nbsp;",
					icons: {
						primary: "cui-icon-minus3"
					},
					text: false
				})
				.addClass("coral-dialog-toolbar-minimize")
				.appendTo(this.uiDialogToolbar);
			/*this._on(this.uiDialogTitlebarMaximum, {
				click: function(event) {
					event.preventDefault();
					this.minimize();
				}
			});*/
		}
		
		if (this.options.maximizable) {
			// 添加 最大化 功能
			this.uiDialogTitlebarMaximum = $("<button type='button'></button>")
				.button({
					label: this.options.maximumText,
					icons: {
						primary: "cui-icon-enlarge7"
					},
					text: false
				})
				.addClass("coral-dialog-toolbar-maximum")
				.appendTo(this.uiDialogToolbar);
			/*this._on(this.uiDialogTitlebarMaximum, {
				click: function(event) {
					event.preventDefault();
					if (!this.uiDialog.hasClass( "coral-dialog-maximum")) {
						this.maximize();
					} else {
						this.restore();	
					}
					$.coral.refreshAllComponent(this.element);
				}
			});*/
		}
		
		// support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)	
		if (this.options.closable) {
			this.uiDialogTitlebarClose = $("<button type='button'></button>")
				.button({
					label: this.options.closeText,
					icons: {
						primary: this.options.closeButtonClass
					},
					text: false
				})
				.addClass("coral-dialog-toolbar-close")
				.appendTo(this.uiDialogToolbar);
			/*this._on(this.uiDialogTitlebarClose, {
				click: function(event) {
					var $this = $(event.target); 
					$this.removeClass("coral-state-hover");
					event.preventDefault();
					this.close( event );
				}
			});*/
		}
		this._on(this.uiDialogTitlebar, {
			click: function(event) {
				if ($(event.target).closest(".coral-dialog-toolbar-minimize").length) {
					this.minimize();
				}
				if ($(event.target).closest(".coral-dialog-toolbar-close").length) {
					var $this = $(event.target); 
					$this.removeClass("coral-state-hover");
					event.preventDefault();
					this.close( event );
				}
				if ($(event.target).closest(".coral-dialog-toolbar-maximum").length) {
					if (!this.uiDialog.hasClass( "coral-dialog-maximum")) {
						this.maximize();
					} else {
						this.restore();	
					}
					$.coral.refreshAllComponent(this.element);
				}
			}
		});
		uiDialogTitle = $("<span>")
			.uniqueId()
			.addClass("coral-dialog-title")
			.prependTo( this.uiDialogTitlebar );
		this._title( uiDialogTitle );
		
		uiDialogsubTitle = $("<span>")
			.uniqueId()
			.addClass("coral-dialog-subTitle")
			.prependTo( this.uiDialogTitlebar );
	
		this._subTitle( uiDialogsubTitle );
		this.uiDialog.attr({
			"aria-labelledby": uiDialogTitle.attr("id")
		});
		// 初始化时，最大化 dialog
		if (this.options.maximizable && this.options.maximized) {
			this.maximize();
			$.coral.refreshAllComponent( this.element );
		}
	},
	
	maximize: function(isInit){
		var options = this.options;
		options.restoreHeight = options.height;
		options.restoreWidth = options.width;
		$(this.element).dialog("option", "width", $(window).width());
		$(this.element).dialog("option", "height", $(window).height());
		this.uiDialog.addClass("coral-dialog-maximum");
		this.uiDialogTitlebarMaximum
			.find(".cui-icon-enlarge7")
			.removeClass("cui-icon-enlarge7")
			.addClass("cui-icon-shrink7");
		if (this.options.iframePanel) {
			this.iframePanel.css({
				"width": $(window).width(),
				"height": $(window).height()
			})
		}
		this._trigger("onMaximize", null, {
			"width": $(window).outerWidth(),
			"height": $(window).outerHeight()
		} );
	},
	
	restore: function(){
		var that = this,
		options = this.options;
		
		$(that.element).dialog("option", "width", options.restoreWidth);
		$(that.element).dialog("option", "height", options.restoreHeight);
		that.uiDialog.removeClass("coral-dialog-maximum");
		if (this.options.iframePanel) {
			this.iframePanel.css({
				"width": options.restoreWidth,
				"height": options.restoreHeight
			});
			this.iframePanel.position(options.position);
		}
		this._resetMaximizeIcon();
		this._trigger("onRestore", null, {
			"width": $(window).outerWidth(),
			"height": $(window).outerHeight()
		} );
	},	
	_resetMaximizeIcon: function() {
		if (this.uiDialogTitlebarMaximum) {
			this.uiDialogTitlebarMaximum.find(".cui-icon-shrink7").removeClass("cui-icon-shrink7").addClass("cui-icon-enlarge7");
		}
	},
	_title: function( title ) {
		var formatterEvent = $.coral.toFunction(this.options.titleFormat);
		if ( !this.options.title ) {
			title.html("&#160;");
		}
		if (formatterEvent) {
			title.html( formatterEvent.call(this.element, this.options.title) );
		} else {
			title.text( this.options.title );
		}
	},
	
	_subTitle: function(subTitle){
		if( !this.options.subTitle ) {
			subTitle.html("&#160;");
		}
		subTitle.text( this.options.subTitle );
	},
	
	_createButtonPanel: function() {
		this.uiDialogButtonPane = $("<div>")
			.addClass("coral-dialog-buttonpane coral-component-content coral-helper-clearfix");

		this.uiButtonSet = $("<div>")
			.addClass("coral-dialog-buttonset")
			.appendTo( this.uiDialogButtonPane );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons,
			cancelEvent = $.noop,
			confirmEvent= $.noop;

		// 删除已有的按钮区
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();
		
		if ( $.isEmptyObject( buttons ) ) buttons = {};
		/*if (this.options.oncancel) {
			cancelEvent = function() { 
				that._trigger("onCancel");
				if (that._isOpen) that.close();
			};
			if ($.isArray( buttons )) {
				buttons.push({text : "取消", click: cancelEvent});
			} else {
				buttons["取消"] = cancelEvent;
			}
		}
		if (this.options.onConfirm) {
			confirmEvent = function() { 
				that._trigger("onConfirm");
				if (that._isOpen) that.close();
			};
			if ($.isArray( buttons )) {
				buttons.push({text : "确定", click: confirmEvent});
			} else {
				buttons["确定"] = confirmEvent;
			}
		}*/

		if ( ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass("coral-dialog-buttons");
			return;
		}
		var primary = true;
		$.each( buttons, function( name, props ) {
			var click, buttonOptions, btnPrimary = "coral-btn-primary";
			props = $.isFunction( props ) ? { click: props, text: name } : props;
			props = $.extend( { type: "button" }, props );
			
			click = props.click;
			props.click = function() {
				click.apply( that.element[0], arguments );
			};
			
			buttonOptions = {
				icons: props.icons,
				icons: props.cls,
				countdown: props.countdown,
				text: props.showText
			};
			if ( props.id ) {
				buttonOptions.id = props.id;
			}
			if(primary){
				buttonOptions = $.extend({},buttonOptions,{cls: btnPrimary + " " + props.cls});
			} else {
				buttonOptions = $.extend({},buttonOptions,{cls: props.cls});
			}
			delete props.icons;
			delete props.cls;
			delete props.showText;
			$( "<button></button>", props ).button( buttonOptions ).appendTo( that.uiButtonSet );
			primary = false;
		});
		
		this.uiDialog.addClass("coral-dialog-buttons");
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".coral-dialog-content, .coral-dialog-toolbar-close",
			handle: ".coral-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this ).addClass("coral-dialog-dragging");
				that._blockFrames();
				if (that.options.iframePanel) {
					that.iframePanel.css(ui.position);
				}
				that._trigger( "onDragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				if (that.options.iframePanel) {
					that.iframePanel.css(ui.position);
				}
				that._trigger( "onDrag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();
				
				options.position = {
						my: "left top",
						at: "left" + (left >= 0 ? "+" : "") + left + " " +
							"top" + (top >= 0 ? "+" : "") + top,
						of: that.window
				};
				$( this ).removeClass("coral-dialog-dragging");
				if (that.options.iframePanel) {
					that.iframePanel.position(options.position);
				}
				that._unblockFrames();
				that._trigger( "onDragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,
			position = this.uiDialog.css("position"),
			resizeHandles = typeof handles === "string" ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";
		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".coral-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass("coral-dialog-resizing");
				that.manualResize = true;
				if (that.options.iframePanel) {
					that.iframePanel.css(ui.position);
					that.iframePanel.css(ui.size);
				}
				that._blockFrames();
				that._trigger( "onResizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				if (that.options.iframePanel) {
					that.iframePanel.css(ui.position);
					that.iframePanel.css(ui.size);
				}
				$.coral.refreshAllComponent(that.element);
				that._trigger( "onResize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();
				
				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass("coral-dialog-resizing");
				if (that.options.iframePanel) {
					that.iframePanel.position(options.position);
					that.iframePanel.position(ui.size);
				}
				that._unblockFrames();
				that._trigger( "onResizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position );
	},
	
	_trackFocus: function() {
		this._on(this.component(), {
			focusin: function(event) {
				this._makeFocusTarget();
				this._focusedElement = $(event.target);
			}
		});
	},
	
	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},
	
	_untrackInstance: function() {
		var instances = this._trackingInstances(),
		exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},
		
	_trackingInstances: function() {
		var instances = this.document.data( "coral-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "coral-dialog-instances", instances );
		}
		return instances;
	},
	
	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {
		var position = this.options.position,
			offset = [0,0],
			myAt = [],
			isVisiblePanel,
			isVisible;
		
		if ( position ) {
			if ( typeof position === "string" || (typeof position === "object" && "0" in position ) ) {
				myAt = position.split ? position.split(" ") : [ position[0], position[1] ];
				if ( myAt.length === 1 ) {
					myAt[1] = myAt[0];
				}

				$.each( [ "left", "top" ], function( i, offsetPosition ) {
					if ( +myAt[ i ] === myAt[ i ] ) {
						offset[ i ] = myAt[ i ];
						myAt[ i ] = offsetPosition;
					}
				});

				position = {
					my: myAt[0] + (offset[0] < 0 ? offset[0] : "+" + offset[0]) + " " +
						myAt[1] + (offset[1] < 0 ? offset[1] : "+" + offset[1]),
					at: myAt.join(" ")
				};
			}

			position = $.extend( {}, $.coral.dialog.prototype.options.position, position );
		} else {
			position = $.coral.dialog.prototype.options.position;
		}	

		isVisible = this.uiDialog.is(":visible");
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		if (this.options.iframePanel) {
			isVisiblePanel = this.iframePanel.is(":visible");
			if (!isVisiblePanel) {
				this.iframePanel.show();
			}
		}
		if ( this.options.queue ) {
			$("#coral-msgBox").position( position );
		} else {
			this.uiDialog.position( position );	
			if (this.options.iframePanel) {
				this.iframePanel.position( position );
			}
		}
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
		if (this.options.iframePanel) {
			if (!isVisiblePanel) {
				this.iframePanel.hide();
			}
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		// 如果元素是隐藏状态设置的尺寸，则不进行调整，打开的时候会重新调整的。
		if ( resize && !$( that.element ).is(":hidden") ) {
			this._size();
			if(!that.animate){
				this._position();
			}
		}
		if ( this.uiDialog.is(":data(coral-resizable)") ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "dialogClass" ) {
			uiDialog
				.removeClass( this.options.dialogClass )
				.addClass( value );
		}

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}
		
		if ( key === "maximumText" ) {
			this.uiDialogTitlebarMaximum.button({
				// 确保label为字符串
				label: "" + value
			});
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button({
				// 确保label为字符串
				label: "" + value
			});
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is(":data(coral-draggable)");
			if ( isDraggable && !value ) {
				uiDialog.draggable("destroy");
				if(this.options.iframePanel){
					this.iframePanel.draggable("destroy")
				}
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}
		if ( key === "resizable" ) {
			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is(":data(coral-resizable)");
			if ( isResizable && !value ) {
				uiDialog.resizable("destroy");
				if(this.options.iframePanel){
					this.iframePanel.resizable("destroy");
				}
			}

			// currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find(".coral-dialog-title") );
		}
		if ( key === "subTitle" ) {
			this._subTitle( this.uiDialogTitlebar.find(".coral-dialog-subTitle") );
		}
		if ( key === "width" || key === "height" ) {
			// 当设置了高度或者宽度后，需要手动重置最大化按钮。
			this._resetMaximizeIcon();
			this.uiDialog.removeClass("coral-dialog-maximum");
		}
	},

	_size: function() {
		// If the user has resized the dialog, the .coral-dialog and .coral-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		// 以防content里有其他的子元素高度撑开，所以此处先隐藏
		this.element.hide().css({
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		});
		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		// 等到dialog拿到nonContent高度后，显示element。 
		this.element.show();
		
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			});
		} else { // 20150120 如果height为百分比形式，则先转化为px
			var re =/^(\d|[1-9]\d|100)%$/;
			if( re.test( this.options.height ) ){
				this.options.percent = this.options.height;
				this.element.height( Math.max( 0, this._percentToPx() - nonContentHeight ) );
			} else {
				this.element.height( Math.max( 0, this.options.height - nonContentHeight ) );
			}
		}

		if (this.uiDialog.is(":data(coral-resizable)") ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
		if(this.options.iframePanel){
			this.iframePanel
				.css({
					width: this.uiDialog.outerWidth(),
					height: this.uiDialog.outerHeight()
				});
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css({
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				})
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[0];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest(".coral-dialog").length ) {
			return true;
		}

		return !!$( event.target ).closest(".coral-datepicker").length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay(function() {
			isOpening = false;
		});
		
		if ( !this.document.data( "coral-dialog-overlays" ) ) {
		
			// Prevent use of anchors and inputs
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}
			
					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						
						var d = this.document.find( ".coral-dialog:visible:last .coral-dialog-content" )
											 .data( this.componentFullName );
						if (d && d._focusTabbable) {
							//d._focusTabbable();
							//TODO 注释掉的原因：在ie下面当点击dialog底部的按钮的时候，会产生聚焦异常，焦点不会停留在底部按钮区域
						}
					}
				}
			});
		}

		this.overlay = $("<div>")
			.addClass("coral-component-overlay coral-front")
			.appendTo( this._appendTo() );
		// -- 如果 appendTo 到非 body，position 不为 “fixed”
		if(this.options.appendTo == "parent"){
			this.overlay.css({
				position: "relative"
			});
		} else {
			if ($(this.options.appendTo)[0].tagName.toLowerCase() != "body") {
				this.overlay.css({
					position: "relative"
				});
			}
		}
		// --
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		});
		this.document.data( "coral-dialog-overlays",
			(this.document.data( "coral-dialog-overlays" ) || 0) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "coral-dialog-overlays" ) - 1;
			
			if ( !overlays ) {
				this.document
					.unbind( "focusin" )
					.removeData( "coral-dialog-overlays" );
			} else {
				this.document.data( "coral-dialog-overlays", overlays );
			}
			this.overlay.remove();
			this.overlay = null;
		}
	},
	// 按钮区面板
	buttonPanel : function () {
		return this.uiButtonSet;
	},
	// 隐藏对话框
	hide : function () {
		this._isOpen = false;
		this.component().hide();
	},
	_percentToPx : function(){
		var that = this,
			options = this.options,
			percent = options.percent,
			parent = $(window);
		
		maxHeight = parent.height() * parseInt(percent.substring(0, percent.length-1))/100;
		return maxHeight;
	},
	refresh : function(){
		var that = this,
			options = this.options,
			percent = options.percent;
		var re =/^(\d|[1-9]\d|100)%$/;
		if(re.test(percent)&&!options.manualResize){
			maxHeight = that._percentToPx();
			options.height = maxHeight;
			setTimeout(function(){
				$(that.element).dialog("option", "height", maxHeight);
			},0);
		} else {
			//$(that.element).dialog("option", "height", options.height);
		}
	}
	
});

}() );
// noDefinePart
} ) );