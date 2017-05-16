( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./component"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.tabs", {
	version: "4.0.1",
	delay: 300,
	options: {
		active: 0,
		collapsible: false,
		event: "click",
		loadonce: true,
		renderPanelOnActivate: false,
		destroyAllonActive: false, // 默认激活某一个tab时，销毁其他tab的内容
		heightStyle: "content",
		hide: null,
		show: null,
		loadtext:"加载中，请耐心等候...",
		// 回调函数
		/*activate: null,
		beforeActivate: null,
		beforeLoad: null,
		load: null,*/
		
		//附加
		//ajax请求方式
		method : 'GET',
		newbtn : false,
		name : null,
		
		onTabNew: null,
		onActivate : null,
		onLoad : null,
		beforeActivate: null,
		beforeLoad: null,
		beforeTabClose : null,
		onTabClose : null
	},

	_create: function() {
		var that = this,
			options = this.options;
			
		// 处理回调重命名
		//options.activate = options.onActivate;
		//options.load = options.onLoad;
		//options.beforeActivate = options.beforeActivate;
		//options.beforeLoad = options.beforeLoad;
		//处理属性
		if(options.method!=null && options.method!=""){
			options.method=(options.method+"").toUpperCase();
		}else{
			options.method="GET";
		}


		this.running = false;
		this.element
			.addClass( "coral-tabs ctrl-init ctrl-init-tabs coral-component coral-component-content coral-corner-all" )
			.toggleClass( "coral-tabs-collapsible", options.collapsible )

		this._processTabs();
		//lihaibo add begin
		if ( typeof options.newbtn == "boolean" && options.newbtn ) {
			this.addnewbtn();
		}
		//lihaibo add end
		options.active = this._initialActive();
		
		// 通过设置class来禁用tabs
		if ( $.isArray( options.disabled ) ) {
			options.disabled = $.unique( options.disabled.concat(
				$.map( this.tabs.filter( ".coral-state-disabled" ), function( li ) {
					return that.tabs.index( li );
				})
			) ).sort();
		}
		// 检查长度，避免初始化一个空列表发生错误
		if ( this.options.active !== false && this.anchors.length ) {
			this.active = this._findActive( options.active );
		} else {
			this.active = $();
		}

		this._refresh();

		if ( this.active.length ) {
			this.load( options.active );
		}
		if(this.element.hasClass("coral-tabs-bottom")){
			$( ".coral-tabs-bottom .coral-tabs-nav, .coral-tabs-bottom .coral-tabs-nav > *" ).removeClass( "coral-corner-all coral-corner-top" ).addClass( "coral-corner-bottom" );
		} else if(this.element.hasClass("coral-tabs-right")){
			this.element.addClass( "coral-tabs-right coral-helper-clearfix" ).removeClass( "coral-corner-top" ).addClass( "coral-corner-left" );
		}else if(this.element.hasClass("coral-tabs-left")){
			this.element.removeClass( "coral-corner-top" ).addClass( "coral-tabs-left coral-helper-clearfix coral-corner-left" );
		}
	},
	_isLocal: (function() {
		var rhash = /#.*$/;
		
		return function( anchor ) {
			var anchorUrl, locationUrl;

			// support: IE7
			// IE7 doesn't normalize the href property when set via script (#9317)
			anchor = anchor.cloneNode( false );
		
			
			// modify by mengshuai begin
			return anchor.hash.length > 1 &&
			anchor.href.indexOf("#")!=-1;
			// modify by mengshuai end
			
			
			anchorUrl = anchor.href.replace( rhash, "" );
			locationUrl = location.href.replace( rhash, "" );

			// decoding may throw an error if the URL isn't UTF-8 (#9518)
			try {
				anchorUrl = decodeURIComponent( anchorUrl );
			} catch ( error ) {}
			try {
				locationUrl = decodeURIComponent( locationUrl );
			} catch ( error ) {}

			return anchor.hash.length > 1 && anchorUrl === locationUrl;
		};
	})(),
	_initialActive: function() {
		var active = this.options.active,
			collapsible = this.options.collapsible,
			locationHash = location.hash.substring( 1 );

		if ( active === null ) {
			// 检查URL中fragment的表示
			if ( locationHash ) {
				this.tabs.each(function( i, tab ) {
					if ( $( tab ).attr( "aria-controls" ) === locationHash ) {
						active = i;
						return false;
					}
				});
			}
			// 通过检查class确定tab被标记为激活的
			if ( active === null ) {
				active = this.tabs.index( this.tabs.filter( ".coral-state-active" ) );
			}
			// 没有激活的tab，设置为false
			if ( active === null || active === -1 ) {
				active = this.tabs.length ? 0 : false;
			}
		}
		// 处理数字：负数，越界
		if ( active !== false ) {
			active = this.tabs.index( this.tabs.eq( active ) );
			if ( active === -1 ) {
				active = collapsible ? false : 0;
			}
		}

		// 不允许折叠的: false and active: false
		if ( !collapsible && active === false && this.anchors.length ) {
			active = 0;
		}

		return active;
	},

	_getCreateEventData: function() {
		return {
			tab: this.active,
			panel: !this.active.length ? $() : this._getPanelForTab( this.active )
		};
	},

	_tabKeydown: function( event ) {
		var focusedTab = $( this.document[0].activeElement ).closest( "li" ),
			selectedIndex = this.tabs.index( focusedTab ),
			goingForward = true;

		if ( this._handlePageNav( event ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case $.coral.keyCode.RIGHT:
			case $.coral.keyCode.DOWN:
				selectedIndex++;
				break;
			case $.coral.keyCode.UP:
			case $.coral.keyCode.LEFT:
				goingForward = false;
				selectedIndex--;
				break;
			case $.coral.keyCode.END:
				selectedIndex = this.anchors.length - 1;
				break;
			case $.coral.keyCode.HOME:
				selectedIndex = 0;
				break;
			case $.coral.keyCode.SPACE:
				// 只能活动的，不能颠倒
				event.preventDefault();
				clearTimeout( this.activating );
				this._activate( selectedIndex );
				return;
			case $.coral.keyCode.ENTER:
				// Toggle (cancel delayed activation, allow collapsing)
				event.preventDefault();
				clearTimeout( this.activating );
				// 判断是否为collapse或activate
				this._activate( selectedIndex === this.options.active ? false : selectedIndex );
				return;
			default:
				return;
		}

		// 聚焦弹出的tab, 基于按键按下
		event.preventDefault();
		clearTimeout( this.activating );
		selectedIndex = this._focusNextTab( selectedIndex, goingForward );

		// 预防control键自动活动
		if ( !event.ctrlKey ) {
			focusedTab.attr( "aria-selected", "false" );
			this.tabs.eq( selectedIndex ).attr( "aria-selected", "true" );

			this.activating = this._delay(function() {
				this.option( "active", selectedIndex );
			}, this.delay );
		}
	},

	_panelKeydown: function( event ) {
		if ( this._handlePageNav( event ) ) {
			return;
		}

		// Ctrl+up移动交到到当前tab
		if ( event.ctrlKey && event.keyCode === $.coral.keyCode.UP ) {
			event.preventDefault();
			this.active.focus();
		}
	},

	// Alt+page up/down 移动焦点到 前一个/下一个 tab (活动的)
	_handlePageNav: function( event ) {
		if ( event.altKey && event.keyCode === $.coral.keyCode.PAGE_UP ) {
			this._activate( this._focusNextTab( this.options.active - 1, false ) );
			return true;
		}
		if ( event.altKey && event.keyCode === $.coral.keyCode.PAGE_DOWN ) {
			this._activate( this._focusNextTab( this.options.active + 1, true ) );
			return true;
		}
	},

	_findNextTab: function( index, goingForward ) {
		var lastTabIndex = this.tabs.length - 1;

		function constrain() {
			if ( index > lastTabIndex ) {
				index = 0;
			}
			if ( index < 0 ) {
				index = lastTabIndex;
			}
			return index;
		}

		while ( $.inArray( constrain(), this.options.disabled ) !== -1 ) {
			index = goingForward ? index + 1 : index - 1;
		}

		return index;
	},

	_focusNextTab: function( index, goingForward ) {
		index = this._findNextTab( index, goingForward );
		this.tabs.eq( index ).focus();
		return index;
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			// _activate() 处理无效值 并更新this.options			
			if (typeof value === "string") {				
				this._activate( this._getIndex ( value) );
			} else {
				this._activate( value );
			}	
			return ;
		}
		
		if ( key === "disabled" ) {
			// 不使用 组件工厂的disabled
			this._setupDisabled( value );
			return;
		}

		this._super( key, value);

		if ( key === "collapsible" ) {
			this.element.toggleClass( "coral-tabs-collapsible", value );
			// 设置collapsible: false 为翻转; 打开第一个panel
			if ( !value && this.options.active === false ) {
				this._activate( 0 );
			}
		}

		if ( key === "event" ) {
			this._setupEvents( value );
		}

		if ( key === "heightStyle" ) {
			this._setupHeightStyle( value );
		}
	},

	_tabId: function( tab ) {
		return tab.attr( "aria-controls" ) || "coral-tabs-" + getNextTabId();
	},

	_sanitizeSelector: function( hash ) {
		return hash ? hash.replace( /[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&" ) : "";
	},

	refresh: function() {
		var options = this.options,
			lis = this.tablist.children( ":has(a[href])" );

		// 通过html class属性取得tabs是否为禁用
		// 这个将会改变_refresh()中的一个布尔值
		options.disabled = $.map( lis.filter( ".coral-state-disabled" ), function( tab ) {
			return lis.index( tab );
		});

		this._processTabs();

		// 翻转的 或者没有tabs
		if ( options.active === false || !this.anchors.length ) {
			options.active = false;
			this.active = $();
		// 已激活完成的
		} else if ( this.active.length && !$.contains( this.tablist[ 0 ], this.active[ 0 ] ) ) {
			// 其余tabs将被禁用
			if ( this.tabs.length === options.disabled.length ) {
				options.active = false;
				this.active = $();
			// 激活先前一个tabs
			} else {
				this._activate( this._findNextTab( Math.max( 0, options.active - 1 ), false ) );
			}
		// 将会发生激活
		} else {
			// 确定激活的tabsIndex为正确的
			options.active = this.tabs.index( this.active );
		}

		this._refresh();
	},

	_refresh: function() {
		var $this=this;
		this._setupDisabled( this.options.disabled );
		this._setupEvents( this.options.event );

		this.tabs.not( this.active ).attr({
			"aria-selected": "false",
			"aria-expanded": "false",
			tabIndex: -1
		});
		
		
		this.panels.not( this._getPanelForTab( this.active ) )
			.hide()
			.attr({
				"aria-hidden": "true"
			});

		// Make sure one tab is in the tab order
		if ( !this.active.length ) {
			this.tabs.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active
				.addClass( "coral-tabs-active coral-state-active" )
				.attr({
					"aria-selected": "true",
					"aria-expanded": "true",
					tabIndex: 0
				});
			this._getPanelForTab( this.active )
				.show()
				.attr({
					"aria-hidden": "false"
				}).attr({
					"data-render": ""
				});
		}
		// the height of ul may be changed when the border of active li is not equal the default li.
		this._setupHeightStyle( this.options.heightStyle );
	},
	//增加Tab
	add: function(option) {
		option=option||{};
		var disabled = this.options.disabled, // 禁用则忽略操作
		panelId = null,
		tabId = option.tabId,
		li = null,
		label = option.label, 
		ariaControls = option.ariaControls, 
		isUrl = false,
		href = option.href,
		closeable=option.closeable==undefined?false:option.closeable,
		closespan=closeable===true?"<span class='coral-closable cui-icon-cross2'></span>":"",
		content = option.content;
		if ( disabled === true ) {
			return;
		}
		//lihaibo add begin
		if ( typeof this.options.newbtn == "boolean" && this.options.newbtn ) {
			this.tablist.find( "> li:last").remove();
		}		
		//lihaibo add end
		//获得uuid
		if( ariaControls ){
			panelId = ariaControls;
		} else if ( typeof href === "undefined" ) {
			panelId = $( {} ).uniqueId()[ 0 ].id;
		} else {
			panelId = href;
			if (panelId.indexOf("#") == 0) {
				panelId = panelId.substr(1);
			}else{
				isUrl = true;
			}
		}
		tabId = tabId ? "id=" + tabId : "";
		var tabTemplate="<li " + tabId +"><a href='#{href}'>"+label+"</a>{closespan}</li>";	
		
		tabTemplate=tabTemplate.replace( /\{closespan\}/g,closespan);	
		
		if (!isUrl) {
			li = $( tabTemplate.replace( /#\{href\}/g, "#" + panelId ));
		} else {
			li = $( tabTemplate.replace( /#\{href\}/g, panelId ));
			this.component().find( ">.coral-tabs-nav" ).append( li );
			this.component().tabs( "refresh" );
			return ;
		}
		if(ariaControls){
			li.attr("aria-controls",ariaControls);
		}
		//添加操作
		this.component().find( ">.coral-tabs-nav" ).append( li );
		// for tabs at bottom the content must before the nav
		if(this.element.hasClass("coral-tabs-bottom")){
			this.component().find( ">.coral-tabs-nav" ).before( "<div id='" + panelId + "'>"+content+"</div>" );
		}else{
			this.component().append( "<div id='" + panelId + "'>"+content+"</div>" );
		}
      	if ( typeof this.options.newbtn == "boolean" && this.options.newbtn ) {
      		this.addnewbtn();
		}
      	this.refresh();
	},
	//删除Tab
	remove : function(index){
		//禁用则忽略操作
		if ( this.options.disabled ) return;
				
		if (index instanceof Array) { // array of index or id
			for (var i in index) {
				this._remove(index[i]);
			}
		} else {
			this._remove(index);
		} 
		this.refresh();
	},
	_remove: function(index) {
		var removeIndex;
		
		if ( typeof index == "undefined" ) {
			removeIndex = this.options.active;
		} else if ( typeof index == "string" ) {
			removeIndex = this.getIndexById(index);
		} else {
			removeIndex = index;
		}
		
		var removeId=this._getList().find( "> li:has(a[href])" ).eq(removeIndex).attr("aria-controls");
		//删除操作
		this.component().find("li[aria-controls='"+removeId+"']").remove();
		this.component().find("div#"+removeId).remove();
	},
	//lihaibo add begin
	addnewbtn: function () {
		var that = this;
		var newbtn = $("<li class='coral-tabs-newbtn coral-corner-top'><a class='coral-tabs-anchor'><span class='cui-icon-plus-circle2'></span></a></li>");
		newbtn.unbind("click").bind("click", function ( event ) {
			if ( true === that.options.disabled ) {
				return ;
			}
			that._trigger("onTabNew", null, []);
		});
		this.tablist.append(newbtn);
		that._hoverable( newbtn );
	},
	//lihaibo add end
	_processTabs: function() {
		var that = this;
		
		this.tablist = this._getList()
		.addClass( "coral-tabs-nav coral-helper-reset coral-helper-clearfix coral-component-header coral-corner-all" )
		.attr( "role", "tablist" )

		// Prevent users from focusing disabled tabs via click
		.delegate( "> li", "mousedown" + this.eventNamespace, function( event ) {
			if ( $( this ).is( ".coral-state-disabled" ) ) {
				event.preventDefault();
			}
		})

		// support: IE <9
		// Preventing the default action in mousedown doesn't prevent IE
		// from focusing the element, so if the anchor gets focused, blur.
		// We don't have to worry about focusing the previously focused
		// element since clicking on a non-focusable element should focus
		// the body anyway.
		.delegate( ".coral-tabs-anchor", "focus" + this.eventNamespace, function() {
			if ( $( this ).closest( "li" ).is( ".coral-state-disabled" ) ) {
				this.blur();
			}
		});

		this.tabs = this.tablist.find( "> li:has(a[href])" )
			.addClass( "coral-state-default coral-corner-top" )
			.attr({
				role: "tab",
				tabIndex: -1
			});
		this.tabs = this.tabs.filter(function(){
			if ($(this).data("authority") == false){
				$(this).remove();
				var hreff = $(this).find(">a").attr("href");
				if ( hreff.slice(0,1) == "#") {
					$("body").find(hreff).remove();
				}
				return false
			} else return true
		})
		
		this.anchors = this.tabs.map(function() {
				return $( "a", this )[ 0 ];
			})
			.addClass( "coral-tabs-anchor" )
			.attr({
				role: "presentation",
				tabIndex: -1
			});

		this.panels = $();

		this.anchors.each(function( i, anchor ) {
			var selector, panel, panelId,
				anchorId = $( anchor ).uniqueId().attr( "id" ),
				tab = $( anchor ).closest( "li" ),
				originalAriaControls = tab.attr( "aria-controls" );

			tab.find(".coral-closable").addClass("cui-icon-cross2");
			// 内嵌 tab
			if ( that._isLocal( anchor ) ) {
				selector = anchor.hash;
				panelId = selector.substring( 1 );
				panel = that.element.find( that._sanitizeSelector( selector ) );
				if (that.options.renderPanelOnActivate) {
					panel.attr( "data-render", "false" );
				}
			// 远程 tab
			} else {
				// If the tab doesn't already have aria-controls,
				// generate an id by using a throw-away element
				panelId = tab.attr( "aria-controls" ) || $( {} ).uniqueId()[ 0 ].id;
				selector = "#" + panelId;
				panel = that.element.find( selector );
				if ( !panel.length ) {
					panel = that._createPanel( panelId );
					// modify by mengshuai begin
					if(that.element.hasClass("coral-tabs-bottom")){
						panel.insertBefore( that.panels[ i - 1 ] || that.tablist );
					}else{
						panel.insertAfter( that.panels[ i - 1 ] || that.tablist );
					}
					// modify by mengshuai end
				}
				panel.attr( "aria-live", "polite" );
			}

			if ( panel.length) {
				that.panels = that.panels.add( panel );
			}
			if ( originalAriaControls ) {
				tab.data( "coral-tabs-aria-controls", originalAriaControls );
			}
			tab.attr({
				"aria-controls": panelId,
				"aria-labelledby": anchorId
			});
			panel.attr( "aria-labelledby", anchorId );
		});

		this.panels
			.addClass( "coral-tabs-panel coral-component-content coral-corner-bottom" )
			.attr( "role", "tabpanel" );
	},
	// allow overriding how to find the list for rare usage scenarios (#7715)
	_getList: function() {
		return this.tablist || this.element.find( ">ol,>ul" ).eq( 0 );
	},

	_createPanel: function( id ) {
		return $( "<div>" )
			.attr( "id", id )
			.addClass( "coral-tabs-panel coral-component-content coral-corner-bottom" )
			.data( "coral-tabs-destroy", true );
	},

	_setupDisabled: function( disabled ) {
		if ( $.isArray( disabled ) ) {
			if ( !disabled.length ) {
				disabled = false;
			} else if ( disabled.length === this.anchors.length ) {
				disabled = true;
			}
		}

		// 禁用 tabs
		for ( var i = 0, li; ( li = this.tabs[ i ] ); i++ ) {
			if ( disabled === true || $.inArray( i, disabled ) !== -1 ) {
				$( li )
					.addClass( "coral-state-disabled" )
					.attr( "aria-disabled", "true" );
			} else {
				$( li )
					.removeClass( "coral-state-disabled" )
					.removeAttr( "aria-disabled" );
			}
		}

		this.options.disabled = disabled;
	},

	_setupEvents: function( event ) {
		var that = this;
		var events = {};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.anchors.add( this.tabs ).add( this.panels ).add(this.tabs.children("span.cui-icon-cross2")) );
		// Always prevent the default action, even when disabled
		this._on( true, this.anchors, {
			click: function( event ) {
				event.preventDefault();
			}
		});
		this._on( this.anchors, events );
		this._on( this.tabs.children("span.coral-closable"), { click: "_tabClose" } );
		this._on( this.panels, { keydown: "_panelKeydown" } );
		this._on( this.tabs, { keydown: "_tabKeydown" } );
		this._focusable( this.tabs );
		this._hoverable( this.tabs );
	},
	_tabClose: function(e){
		var that = this;
		if ( that.options.disabled === true ) {return;	}
		
		var closeTab = $(e.target),
			currentTab = closeTab.closest( "li" ),
			panelId = currentTab.attr( "aria-controls" ),
			currentPanel=that._getPanelForTab(currentTab),
			eventData={"currentTab":currentTab,"currentPanel":currentPanel,"panelId":panelId};
		// trigger beforeTabClose
		if(that._trigger("beforeTabClose",e,eventData) === false)return;
		
		currentTab.remove();
 		that.element.find( "#" + panelId ).remove();
  		
  		// trigger onTabClose
  		that._trigger("onTabClose",e,eventData);
  		
  		that.refresh();
	},
	_setupHeightStyle: function( heightStyle ) {
		var maxHeight,
		 	maxWidth,
		 	isVertival = false,
			parent = this.element.parent();

		if ( heightStyle === "fill" ) {
			$.coral.fitParent(this.component(), true);
			maxHeight = parent.height();
			maxWidth = parent.width();
			parent.addClass("coral-noscroll");
			maxHeight -= this.element.outerHeight() - this.element.height();
			// added .not("script") by @haibo lee
			this.element.siblings( ":visible" ).not("script").each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight(  );
			});

			this.element.children().not( this.panels ).each(function() {
				// add by mengshuai begin
				// if tabs is vertical then do not minus the height of nav 
				if($(this).parent().hasClass("coral-tabs-right")||$(this).parent().hasClass("coral-tabs-left")){
					var position =  $( this ).css( "position" );
					isVertival = true;
					if ( position === "absolute" || position === "fixed" ) {
						return;
					}
					maxWidth -= $( this ).outerWidth( true );
					return;
				}
				// add by mengshuai end
				maxHeight -= $( this ).outerHeight( true );
			});
			var border;
			var vPanel = this.panels.filter(":visible");
				// if panel has border then minus the border
			border = vPanel.outerHeight() - vPanel.innerHeight();
			this.panels.each(function() {
				$( this ).height( Math.max( 0, maxHeight - border -
						$( this ).innerHeight() + $( this ).height() ) );
			});
			if(isVertival){
				var nav = this.element.children("ul");
				nav.height(Math.max( 0, maxHeight -
						nav.innerHeight() + nav.height() ));
			}
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.panels.each(function() {
				maxHeight = Math.max( maxHeight, $( this ).height( "" ).height() );
				$( this ).width("");
			}).height( maxHeight );
		}
		this.panels.each(function() {
			if ($(this).is(":visible")) {
				$.coral.refreshAllComponent($( this ));
			}
		});
	},

	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			anchor = $( event.currentTarget ),
			tab = anchor.closest( "li" ),
			clickedIsActive = tab[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : this._getPanelForTab( tab ),
			toHide = !active.length ? $() : this._getPanelForTab( active ),
			eventData = {
				oldTab: active,
				oldPanel: toHide,
				newTab: collapsing ? $() : tab,
				newPanel: toShow
			};

		event.preventDefault();

		if ( tab.hasClass( "coral-state-disabled" ) ||
				// tab已加载完毕
				tab.hasClass( "coral-tabs-loading" ) ||
				// 动画中不能切换
				this.running ||
				// 单击活动header，但不会翻转
				( clickedIsActive && !options.collapsible ) ||
				// 允许取消激活
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.tabs.index( tab );

		this.active = clickedIsActive ? $() : tab;
		if ( this.xhr ) {
			this.xhr.abort();
		}

		if ( !toHide.length && !toShow.length ) {
			$.error( "jQuery UI Tabs: Mismatching fragment identifier." );
		}

		if ( toShow.length ) {
			this.load( this.tabs.index( tab ), event );
		}
		this._toggle( event, eventData );
	},

	// 处理选中的tab的show/hide 
	_toggle: function( event, eventData ) {
		var that = this,
			toShow = eventData.newPanel,
			toHide = eventData.oldPanel;

		this.running = true;

		function complete() {
			that.running = false;
			that._trigger( "onActivate", event, eventData );
			if (toShow.attr("data-render") === "false") {
				coral.render(toShow);
			} else {
				$.coral.refreshAllComponent(toShow);
			}
		}

		function show() {
			eventData.newTab.closest( "li" ).addClass( "coral-tabs-active coral-state-active" );

			if ( toShow.length && that.options.show ) {
				that._show( toShow, that.options.show, complete );
			} else {
				toShow.show();
				complete();
			}
		}
		// 处理 隐藏，显示，完成
		if ( toHide.length && this.options.hide ) {
			this._hide( toHide, this.options.hide, function() {
				eventData.oldTab.closest( "li" ).removeClass( "coral-tabs-active coral-state-active" );
				show();
			});
		} else {
			eventData.oldTab.closest( "li" ).removeClass( "coral-tabs-active coral-state-active" );
			toHide.hide();
			show();
		}

		toHide.attr( "aria-hidden", "true" );
		eventData.oldTab.attr({
			"aria-selected": "false",
			"aria-expanded": "false"
		});
		// If we're switching tabs, remove the old tab from the tab order.
		// If we're opening from collapsed state, remove the previous tab from the tab order.
		// If we're collapsing, then keep the collapsing tab in the tab order.
		if ( toShow.length && toHide.length ) {
			eventData.oldTab.attr( "tabIndex", -1 );
		} else if ( toShow.length ) {
			this.tabs.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow.attr( "aria-hidden", "false" );
		eventData.newTab.attr({
			"aria-selected": "true",
			"aria-expanded": "true",
			tabIndex: 0
		});
	},
	_activate: function( index ) {
		//如果没有该索引
		if ( index == -1 ) {
			return ;
		}
		var anchor, active = this._findActive( index );
		// 尝试激活已激活的panel
		if ( active[ 0 ] === this.active[ 0 ] ) {
			return;
		}
		// 尝试翻转，模仿点击当前活动的header
		if ( !active.length ) {
			active = this.active;
		}

		anchor = active.find( ".coral-tabs-anchor" )[ 0 ];
		this._eventHandler({
			target: anchor,
			currentTarget: anchor,
			preventDefault: $.noop
		});
	},

	_findActive: function( index ) {
		return index === false ? $() : this.tabs.eq( index );
	},
	/**
	 * 
	 * @param index : href
	 * @returns index
	 */
	_getIndex: function( index ) {
		// 给用户选择提供一个href字符串，来代替数字索引
		if ( typeof index === "string" ) {
			index = this.anchors.index( this.anchors.filter( "[href$='" + index + "']" ) );
		}

		return index;
	},
	/**
	 * 根据 index 获取 id
	 */
	getIdByIndex: function ( index ) {
		var lis = this.tablist.children("li").filter( function() {
			return $(this).hasClass("coral-state-default");
		});
		return lis.eq( index ).attr( "aria-controls" );
	}, 
	/**
	 * 根据 id 获取 index 
	 */
	getIndexById: function ( id ) {
		var lis = this.tablist.children("li").filter( function() {
			return $(this).hasClass("coral-state-default");
		});
		return lis.index( lis.filter( "[aria-controls$='" + id + "']" ) );
	},
	getIndexByTabId: function ( id ) {
		 var lis = this.tablist.children("li").filter( function() {
			 return $(this).hasClass("coral-state-default");
		 });
		 return lis.index( lis.filter( "#" + id ) );
	},
	/**
	 * 获取 tabs 的所有 tab 的 id 列表
	 * @returns {Array}
	 */
	getAllTabId: function () {
		return this.getPanelIds();
	},
	getPanelIds: function(){
		var idList = [];

		this.tabs.filter( "[aria-controls]" ).each( function() {
			var id = $( this ).attr( "aria-controls" );
			
			if ( "" != id ) {
				idList.push( id );
			}
		});
		
		return idList;
	},
	getTabIds: function(){
		var idList = [];
		var lis = this.tablist.children("li").each( function() {
			var id = $( this ).attr( "id" );
			
			if ( "" != id ) {
				idList.push( id );
			}
		});
		return idList;
	},
	getTabEl: function(){
		var lis = this.tablist.children("li.coral-state-default");
		return lis;
	},
	getPanelEl: function(){
        // TODO
		return {};
	},
	getLength: function(){
	    return this.tabs.find( "[aria-controls]" ).length;
	},
	_destroy: function() {
		if ( this.xhr ) {
			this.xhr.abort();
		}

		this.element.removeClass( "coral-tabs coral-component coral-component-content coral-corner-all coral-tabs-collapsible" );

		this.tablist
			.removeClass( "coral-tabs-nav coral-helper-reset coral-helper-clearfix coral-component-header coral-corner-all" )
			.removeAttr( "role" );

		this.anchors
			.removeClass( "coral-tabs-anchor" )
			.removeAttr( "role" )
			.removeAttr( "tabIndex" )
			.removeUniqueId();

		this.tablist.unbind( this.eventNamespace );
		
		this.tabs.add( this.panels ).each(function() {
			if ( $.data( this, "coral-tabs-destroy" ) ) {
				$( this ).remove();
			} else {
				$( this )
					.removeClass( "coral-state-default coral-state-active coral-state-disabled " +
						"coral-corner-top coral-corner-bottom coral-component-content coral-state-active coral-tabs-panel" )
					.removeAttr( "tabIndex" )
					.removeAttr( "aria-live" )
					.removeAttr( "aria-busy" )
					.removeAttr( "aria-selected" )
					.removeAttr( "aria-labelledby" )
					.removeAttr( "aria-hidden" )
					.removeAttr( "aria-expanded" )
					.removeAttr( "role" );
			}
		});

		this.tabs.each(function() {
			var li = $( this ),
				prev = li.data( "coral-tabs-aria-controls" );
			if ( prev ) {
				li
					.attr( "aria-controls", prev )
					.removeData( "coral-tabs-aria-controls" );
			} else {
				li.removeAttr( "aria-controls" );
			}
		});

		this.panels.show();

		if ( this.options.heightStyle !== "content" ) {
			this.panels.css( "height", "" );
		}
	},

	enable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === false ) {
			return;
		}

		if ( index === undefined ) {
			disabled = false;
		} else {
			index = this._getIndex( index );
			if ( $.isArray( disabled ) ) {
				disabled = $.map( disabled, function( num ) {
					return num !== index ? num : null;
				});
			} else {
				disabled = $.map( this.tabs, function( li, num ) {
					return num !== index ? num : null;
				});
			}
		}
		this._setupDisabled( disabled );
	},

	disable: function( index ) {
		var disabled = this.options.disabled;
		if ( disabled === true ) {
			return;
		}

		if ( index === undefined ) {
			disabled = true;
		} else {
			index = this._getIndex( index );
			if ( $.inArray( index, disabled ) !== -1 ) {
				return;
			}
			if ( $.isArray( disabled ) ) {
				disabled = $.merge( [ index ], disabled ).sort();
			} else {
				disabled = [ index ];
			}
		}
		this._setupDisabled( disabled );
	},
	// 20150116 destroyAllonActive 属性为true时，点击tab时，移除其他tab内容 移除其他tab panel内的dom 元素
	_destroyOtherTabs: function( index ) {
		var id = this._getList().find( "> li:has(a[href])" ).eq(index).attr("aria-controls");
		
		this.component().children("div:not(#" + id + ")").empty();
	},
	load: function( index, event ) {
		index = this._getIndex( index );
		var that = this,
			tab = this.tabs.eq( index ),
			anchor = tab.find( ".coral-tabs-anchor" ),
			panel = this._getPanelForTab( tab ),
			eventData = {
				tab: tab,
				panel: panel
			};		
		// 20150116 destroyAllonActive 属性为true时，点击tab时，移除其他tab内容
		if ( this.options.destroyAllonActive ) {
			that._destroyOtherTabs( index );
		}
		// 非远程 lihaibo changed begin
		if ( that._isLocal( anchor[ 0 ] ) || $.data( anchor[0], "cache") ) {
			return ;
		} else if ( this.options.loadonce ) {
			$.data( anchor[0], "cache", true);
		}
		//lihaibo changed end

		this.xhr = $.ajax( this._ajaxSettings( anchor, event, eventData ) );
		// 支持: jQuery <1.8
		// jQuery <1.8 在beforeSend方法被取消后返回false
		// 但是1.8起，$.ajax()通常返回jqXHR 
		if ( this.xhr && this.xhr.statusText !== "canceled" ) {
			tab.addClass( "coral-tabs-loading" );
			panel.attr( "aria-busy", "true" );
			panel.loading({
				position:   "inside",
				text:       "加载中，请耐心等候..."
			});
			this.xhr
				.success(function( response ) {
					// 支持: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						panel.html( response );
						if( $.coral.openTag === true ){
							$.parser.parse(panel);
						}
						that._trigger( "onLoad", event, eventData );
					}, 1 );
				})
				.complete(function( jqXHR, status ) {
					// 支持: jQuery <1.8
					// http://bugs.jquery.com/ticket/11778
					setTimeout(function() {
						if ( status === "abort" ) {
							that.panels.stop( false, true );
						}

						tab.removeClass( "coral-tabs-loading" );
						panel.removeAttr( "aria-busy" );

						if ( jqXHR === that.xhr ) {
							delete that.xhr;
						}
					}, 1 );
				});
		}
	},

	_ajaxSettings: function( anchor, event, eventData ) {
		var that = this;
		return {
			url: anchor.attr( "href" ),
			beforeSend: function( jqXHR, settings ) {
				return that._trigger( "beforeLoad", event,
					$.extend( { jqXHR : jqXHR, ajaxSettings: settings }, eventData ) );
			},
			// 修改ajax请求方式
			type : that.options.method
		};
	},

	_getPanelForTab: function( tab ) {
		var id = $( tab ).attr( "aria-controls" );
		return this.element.find( this._sanitizeSelector( "#" + id ) );
	},
	getPanelForTab: function( tab ) {
		return this._getPanelForTab( tab );
	}
});
// noDefinePart
} ) );