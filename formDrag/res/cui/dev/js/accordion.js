//>>label: Accordion
//>>group: Component
//>>description: Displays collapsible content panels for presenting information in a limited amount of space.
//>>docs: 
//>>demos: 
//>>css.structure: ../themes/base/core.css
//>>css.structure: ../themes/base/accordion.css
//>>css.theme: ../themes/base/theme.css
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./validate",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $ ) {
// noDefinePart
$.component( "coral.accordion", {
	version: "4.0.1",
	options: {
		active: 0,
		a: [],
		animate: {params : {},duration : 300,easing  : 'swing'},//在此给动画默认属性赋值
		collapsible: false,
		event: "click",
		header: "> li > :first-child,> :not(li):even",
		heightStyle: "auto",
		icons: {
			activeHeader: "cui-icon-arrow-down3",
			header: "cui-icon-arrow-up3"
		},

		//回调方法
		activate: null,
		beforeActivate: null
	},
	
	hideProps: {
		borderTopWidth: "hide",
		borderBottomWidth: "hide",
		paddingTop: "hide",
		paddingBottom: "hide",
		height: "hide"
	},
		
	showProps: {
		borderTopWidth: "show",
		borderBottomWidth: "show",
		paddingTop: "show",
		paddingBottom: "show",
		height: "show"
	},
		
	_create: function() {
		var options = this.options;
		options.icons = $.coral.toFunction(options.icons);
		this.options.a.push("ddd");
		this.prevShow = this.prevHide = $();
		this.element.addClass( "coral-accordion ctrl-init ctrl-init-accordion coral-component coral-helper-reset" )
			.attr( "role", "tablist" );

		// 当collapsible: false and active: false / null时，必须指定一个展开节点，默认是index:0
		if ( !options.collapsible && (options.active === false || options.active == null) ) {
			options.active = 0;
		}

		this._processPanels();
		if ( options.active < 0 ) {
			options.active += this.headers.length;
		}
		this._refresh();
	},

	_getCreateEventData: function() {
		return {
			header: this.active,
			panel: !this.active.length ? $() : this.active.next()
		};
	},

	_createIcons: function() {
		var that = this, icons = this.options.icons;
		if ( icons ) {
			$( "<span>" )
				.addClass( "coral-accordion-header-icon icon " + icons.header )
				.prependTo( this.headers );
			this.active.children( ".coral-accordion-header-icon" )
				.removeClass( icons.header )
				.addClass( icons.activeHeader );
			this.headers.each(function(){
				var dataOptions = $.parser.parseOptions(this);
				if ( dataOptions.collapsible == false ){
					$(this).children( ".coral-accordion-header-icon" ).remove();
				} else {
					$(this).addClass( "coral-accordion-icons" );
				}
			});
		}
	},

	_destroyIcons: function() {
		this.headers
			.removeClass( "coral-accordion-icons" )
			.children( ".coral-accordion-header-icon" )
				.remove();
	},

	_destroy: function() {
		var contents;

		// 清除主标签上的class
		this.element
			.removeClass( "coral-accordion coral-component coral-helper-reset" )
			.removeAttr( "role" );

		// clean up headers
		this.headers
			.removeClass( "coral-accordion-header coral-accordion-header-active coral-state-default " +
				"coral-corner-all coral-state-active coral-state-disabled coral-corner-top" )			
			.removeAttr( "role" )
			.removeAttr( "aria-expanded" )
			.removeAttr( "aria-selected" )
			.removeAttr( "aria-controls" )
			.removeAttr( "tabIndex" )
			.removeUniqueId();
		this._destroyIcons();

		// clean up content panels
		contents = this.headers.next()
			.removeClass( "coral-helper-reset coral-widget-content coral-corner-bottom " +
				"coral-accordion-content coral-accordion-content-active coral-state-disabled" )
			.css( "display", "" )
			.removeAttr( "role" )
			.removeAttr( "aria-hidden" )
			.removeAttr( "aria-labelledby" )
			.removeUniqueId();
		if ( this.options.heightStyle !== "content" ) {
			contents.css( "height", "" );
		}
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {
			this._activate( value );
			return;
		}

		if ( key === "event" ) {
			if ( this.options.event ) {
				this._off( this.headers, this.options.event );
			}
			this._setupEvents( value );
		}

		this._super( key, value );

		if ( key === "collapsible" && !value && this.options.active === false ) {
			this._activate( 0 );
		}

		if ( key === "icons" ) {
			this._destroyIcons();
			if ( value ) {
				this._createIcons();
			}
		}

		// #5332 - opacity doesn't cascade to positioned elements in IE
		// so we need to add the disabled class to the headers and panels
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "coral-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.headers.add( this.headers.next() )
				.toggleClass( "coral-state-disabled", !!value );
		}
	},
		//键盘事件
	_keydown: function( event ) {
		if ( event.altKey || event.ctrlKey ) {
			return;
		}

		var keyCode = $.coral.keyCode,
			length = this.headers.length,
			currentIndex = this.headers.index( event.target ),
			toFocus = false;

		switch ( event.keyCode ) {
			case keyCode.RIGHT:
			case keyCode.DOWN:
				toFocus = this.headers[ ( currentIndex + 1 ) % length ];
				break;
			case keyCode.LEFT:
			case keyCode.UP:
				toFocus = this.headers[ ( currentIndex - 1 + length ) % length ];
				break;
			case keyCode.SPACE:
			case keyCode.ENTER:
				this._eventHandler( event );
				break;
			case keyCode.HOME:
				toFocus = this.headers[ 0 ];
				break;
			case keyCode.END:
				toFocus = this.headers[ length - 1 ];
				break;
		}

		if ( toFocus ) {
			$( event.target ).attr( "tabIndex", -1 );
			$( toFocus ).attr( "tabIndex", 0 );
			toFocus.focus();
			event.preventDefault();
		}
	},
	//内容部分事件
	_panelKeyDown : function( event ) {
		if ( event.keyCode === $.coral.keyCode.UP && event.ctrlKey ) {
			$( event.currentTarget ).prev().focus();
		}
	},

	refresh: function() {
		var options = this.options;
		this._processPanels();

		if ( ( options.active === false && options.collapsible === true ) || !this.headers.length ) {
			options.active = false;
			this.active = $();
		// active false only when collapsible is true
		} else if ( options.active === false ) {
			this._activate( 0 );
		// was active, but active panel is gone
		} else if ( this.active.length && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			if ( this.headers.length === this.headers.find(".coral-state-disabled").length ) {
				options.active = false;
				this.active = $();
			} else {
				this._activate( Math.max( 0, options.active - 1 ) );
			}
		} else {
			options.active = this.headers.index( this.active );
		}

		this._destroyIcons();

		this._refresh();
	},

	_processPanels: function() {
		//为头部<h>添加class
		this.headers = this.element.find( this.options.header )
			.addClass( "coral-accordion-header coral-state-default coral-corner-all" );
		//为内容<div>添加class
		this.headers.next()
			.addClass( "coral-accordion-content coral-helper-reset coral-component-content coral-corner-bottom" )
			.filter(":not(.coral-accordion-content-active)")
			.hide();
	},

	_refresh: function() {
		
		var maxHeight,
			options = this.options,
			heightStyle = options.heightStyle,
			parent = this.element.parent();
		//为激活状态下的头部<h>添加class
		this.active = this._findActive( options.active )
			.addClass( "coral-accordion-header-active coral-state-active coral-corner-top" )
			.removeClass( "coral-corner-all" );
		//为激活状态下的内容<div>添加class
		this.active.next()
			.addClass( "coral-accordion-content-active" )
			.show();
		//为头部添加属性role=tab
		this.headers
			.attr( "role", "tab" )
			.each(function() {
				var header = $( this ),
					headerId = header.uniqueId().attr( "id" ),
					panel = header.next(),
					panelId = panel.uniqueId().attr( "id" );
				header.attr( "aria-controls", panelId );
				panel.attr( "aria-labelledby", headerId );
			})
			.next()
				.attr( "role", "tabpanel" );

		this.headers
			.not( this.active )
			.attr({
				"aria-selected": "false",
				"aria-expanded": "false",
				tabIndex: -1
			})
			.next()
				.attr({
					"aria-hidden": "true"
				})
				.hide();

		if ( !this.active.length ) {
			this.headers.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active.attr({
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			})
			.next()
				.attr({
					"aria-hidden": "false"
				});
		}
		//为头部<h>添加图标
		this._createIcons();
		//为头部<h>绑定事件
		this._setupEvents( options.event );
		//自动填充满高度
		if ( heightStyle === "fill" ) {
			$.coral.fitParent(this.component(), true);
			//父元素高度
			maxHeight = parent.height();
			//以父元素高度为基础，减去兄弟元素的高度
			this.element.siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});
			//再减去所有头部<h>的高度
			this.headers.each(function() {
				maxHeight -= $( this ).outerHeight( true );
			});
			//为内容部分设置高度与浮动
			this.headers.next()
				.each(function() {
					$( this ).height( Math.max( 0, maxHeight -
						$( this ).innerHeight() + $( this ).height() ) );
				})
				//.css( "overflow", "auto" );
				.addClass( "coral-scroll" );
		} else if ( heightStyle === "auto" ) {
			$.coral.fitParent(this.component(), false);
			//以内容自身高度填充
			maxHeight = 0;
			this.headers.next()
				.each(function() {
					maxHeight = Math.max( maxHeight, $( this ).css( "height", "" ).height() );
				})
				.height( maxHeight );
		}
		this.headers.each(function(){
			var dataOptions = $.parser.parseOptions(this);
			if ( dataOptions.collapsible == false ){
				$(this).next().addClass("hidden");
			}
		});
	},

	_activate: function( index ) {
		var active = this._findActive( index )[ 0 ];

		if ( active === this.active[ 0 ] ) {
			return;
		}

		active = active || this.active[ 0 ];

		this._eventHandler({
			target: active,
			currentTarget: active,
			preventDefault: $.noop
		});
	},

	_findActive: function( selector ) {
		return typeof selector === "number" ? this.headers.eq( selector ) : $();
	},

	_setupEvents: function( event ) {
		var events = {
			keydown: "_keydown"
		};
		if ( event ) {
			$.each( event.split(" "), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			});
		}

		this._off( this.headers.add( this.headers.next() ) );
		this._on( this.headers, events );
		this._on( this.headers.next(), { keydown: "_panelKeyDown" });
		this._hoverable( this.headers );
		this._focusable( this.headers );
	},
	
	_eventHandler: function( event ) {
		var options = this.options,
			active = this.active,
			clicked = $( event.currentTarget ),
			//判断是否选中激活状态中的头部<h>
			clickedIsActive = clicked[ 0 ] === active[ 0 ],
			//折叠标志true/false
			collapsing = clickedIsActive && options.collapsible,
			//展开内容
			toShow = collapsing ? $() : clicked.next(),
			//隐藏内容                        
			toHide = active.next(),
			eventData = {
				oldHeader: active,
				oldPanel: toHide,
				newHeader: collapsing ? $() : clicked,
				newPanel: toShow,
				headerOptions: $.parser.parseOptions( (collapsing ? $() : clicked) )
			};

		event.preventDefault();

		if (
				// 点击的是激活状态头部，并且参数设置collapsible为false，则返回
				( clickedIsActive && !options.collapsible ) ||
				// 允许运行激活前的回调函数
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.headers.index( clicked );
		this.active = clickedIsActive ? $() : clicked;
		//动态效果
		this._toggle( eventData );

		//针对激活状态头部<h>切换class
		active.removeClass( "coral-accordion-header-active coral-state-active" );
		if ( options.icons ) {
			active.children( ".coral-accordion-header-icon" )
				.removeClass( options.icons.activeHeader )
				.addClass( options.icons.header );
		}
		//如果点击的不是激活状态头部<h>，则切换class
		if ( !clickedIsActive ) {
			clicked
				.removeClass( "coral-corner-all" )
				.addClass( "coral-accordion-header-active coral-state-active coral-corner-top" );
			if ( options.icons ) {
				clicked.children( ".coral-accordion-header-icon" )
					.removeClass( options.icons.header )
					.addClass( options.icons.activeHeader );
			}

			clicked
				.next()
				.addClass( "coral-accordion-content-active" );
		}
	},

	_toggle: function( data ) {
		var toShow = data.newPanel,
			toHide = this.prevShow.length ? this.prevShow : data.oldPanel;

		// 针对正在运行的动画效果，停止当前队列中的所有动画
		this.prevShow.add( this.prevHide ).stop( true, true );
		this.prevShow = toShow;
		this.prevHide = toHide;
		//animate : {}有动画效果
		if ( this.options.animate ) {
			this._animate( toShow, toHide, data );
		} else {//animate : null无动画效果
			toHide.hide();
			toShow.show();
			//切换class
			this._toggleComplete( data );
		}

		toHide.attr({
			"aria-hidden": "true"
		});
		toHide.prev().attr( "aria-selected", "false" );
		if ( toShow.length && toHide.length ) {
			toHide.prev().attr({
				"tabIndex": -1,
				"aria-expanded": "false"
			});
		} else if ( toShow.length ) {
			this.headers.filter(function() {
				return $( this ).attr( "tabIndex" ) === 0;
			})
			.attr( "tabIndex", -1 );
		}

		toShow
			.attr( "aria-hidden", "false" )
			.prev()
				.attr({
					"aria-selected": "true",
					tabIndex: 0,
					"aria-expanded": "true"
				});
	},

	_animate: function( toShow, toHide, data ) {
		var total, easing, duration,
			that = this,
			adjust = 0,
			down = toShow.length &&
				( !toHide.length || ( toShow.index() < toHide.index() ) ),
			animate = this.options.animate || {},
			options = down && animate.down || animate,
			//动画结束后的回调函数，主要处理切换class
			complete = function() {
				that._toggleComplete( data );
			};

		if ( typeof options === "number" ) {
			duration = options;
		}
		if ( typeof options === "string" ) {
			easing = options;
		}
		// 使用options.easing赋值
		easing = easing || options.easing || animate.easing;
		// 使用options.duration赋值
		duration = duration || options.duration || animate.duration;
		//当所有内容都已关闭时，直接展开当前点击的内容
		if ( !toHide.length ) {
			return toShow.animate( this.showProps, duration, easing, complete );
		}
		//当其他内容都已关闭时，直接关闭当前点击的内容
		if ( !toShow.length ) {
			return toHide.animate( this.hideProps, duration, easing, complete );
		}

		total = toShow.show().outerHeight();
		//当既有需要关闭的内容，也有需要展开的内容时，执行以下代码
		//关闭内容的动画
		toHide.animate( this.hideProps, {
			duration: duration,
			easing: easing,
			step: function( now, fx ) {
				fx.now = Math.round( now );
			}
		});
		//展开内容的动画
		toShow
			.hide()
			.animate( this.showProps, {
				duration: duration,
				easing: easing,
				complete: complete,
				step: function( now, fx ) {
					fx.now = Math.round( now );
					if ( fx.prop !== "height" ) {
						adjust += fx.now;
					} else if ( that.options.heightStyle !== "content" ) {
						//fx.now = Math.round( total - toHide.outerHeight() - adjust );
						adjust = 0;
					}
				}
			});
	},

	_toggleComplete: function( data ) {
		var toHide = data.oldPanel;

		toHide
			.removeClass( "coral-accordion-content-active" )
			.prev()
				.removeClass( "coral-corner-top" )
				.addClass( "coral-corner-all" );

		if ( toHide.length ) {
			toHide.parent()[0].className = toHide.parent()[0].className;
		}
		this._trigger( "onActivate", null, data );
	}
});
// noDefinePart
} ) );