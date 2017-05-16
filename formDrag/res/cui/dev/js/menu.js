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
$.component("coral.basemenu", {
	castProperties : ["data"],
        options: {
        	 responsive : false,
          	 minmenu : false,
        	 onLoad : null,
        	 singleOpen : false,
        	 collapseButton : false,
        	 collapseIcon : "cui-icon-arrow-left3",
        	 expandIcon : "cui-icon-arrow-right3",
        	 simpleDataIdKey : "id",
        	 firstIsactive : false,
        	 isactiveField : "isactive",
        	 nameField : "name",
        	 simpleDataPIdKey : "pId",
        	 vertical : false,
             autoDisplay: true,   
             popup: false,
             trigger: null,
             my: 'left top',
             at: 'left bottom',
             simpleDataEnable : false,
             of: null, /* menu定位依据的元素 */
             triggerEvent: 'click',
             data : null,//外部传入数据用于初始化
             onClick : null,//菜单鼠标点击回调方法
             onCreate : null,//父类中实现
             url : null,//数据调用的url
             method : "post"//url调用方式
        },
        _create: function() {
            if(this.options.popup) {
                this._initPopup();
            }
        },
        //reload方法，可以接收json格式的url，也可以无参数
        reload : function (url,param) {
        	var isUrl = false,
        	    data = [],
        	    that = this,
        	    opts = {};
        	if ( !url && !that.options.url ){
    			url = [];
    		} else if (!url && that.options.url){
    			url = that.options.url;
    		}
        	if (typeof(url) !== "string") {

    	    	
    		// 传过来的是object，需要区别是data还是options
    		// 如果是options，可能是options.data或者options.url ，否则才为data
    		    opts = url;
    		    if (opts.data) { //传进来的是options对象
    			    data = opts.data;			    
    		    } else if (opts.url) {// 传进来的是data对象
    			    url = opts.url;
    			    that.options.url = opts.url;
    			    isUrl = true;
    		    } else if (opts instanceof Array) {
    			    data = url;
    		    } else if (!opts.url && !opts.data && !that.options.url) {
    		    	data = [];
    		    } else if (!opts.url && !opts.data && that.options.url) {
    		    	url = that.options.url ;
    		    	isUrl = true;
    		    }
    	    } else {
    	    	that.options.url = url;
    		    isUrl = true;
    	    }
        	if (isUrl){
        		var html="";
        		$.ajax({
        			type : this.options.method,
        			url : that.options.url,
        			async : false,
        			data : null,
        			dataType : "json",
        			success : function (data) {
        				var html = "";
        				html=that._generateHTML(html,data);
						if(html.length>7){
		        			html=html.substring(4);
		        			html=html.substring(0,html.length-5);
		        		}
						that.element.empty();
		        		that.element.html(html);
		        		that._trigger($.isFunction( opts.onLoad ) ? opts.onLoad:"onLoad", null, [data]);
        			}
        		})
    	     } else{
    	    	 var html = "";
 				 html=that._generateHTML(html,data);
				 if(html.length>7){
        			html=html.substring(4);
        			html=html.substring(0,html.length-5);
        		 }
				 that.element.empty();
        		 that.element.html(html);
        		 that._trigger($.isFunction( opts.onLoad ) ? opts.onLoad:"onLoad", null, [data]);
    	     }
        	that._render();
        },
        //如果目标ul下没有元素，而data下有数据，则将data数据添加到目标UL下
        //如果目标ul下没有元素，而url下有数据，则将url数据添加到目标UL下
        _generateULContent : function(){
        	var $this=this;
        	if(this.element.children().length==0 && this.options.data!=null){
        		var html="";
        		var data = this.options.data;
        		html=this._generateHTML(html,data);
        		if(html.length>7){
        			html=html.substring(4);
        			html=html.substring(0,html.length-5);
        		}
        		this.element.html(html);
        	}else if(this.element.children().length==0 && this.options.url!=null){
        		var html="";
	        	$.ajax({
					type: this.options.method,
					url:  $this.options.url,
					async : false,
					data: null,
					dataType: 'json',
					success: function(data){
						var html="";
						html=$this._generateHTML(html,data);
						if(html.length>7){
		        			html=html.substring(4);
		        			html=html.substring(0,html.length-5);
		        		}
		        		$this.element.html(html);
					},
					error: function(){
					}
				});
        	}
        },
        // 由简单数据格式data生成一般数据格式data
        _transformToSimpleData : function (opts,sData){
        	if (!sData) return[];
        	var i,k,r=[],tmp=[],
        	    simpleDataIdKey = this.options.simpleDataIdKey,
        	    simpleDataPIdKey = this.options.simpleDataPIdKey;
			for (i=0, k=sData.length; i<k; i++) {
				tmp[sData[i][simpleDataIdKey]] = sData[i];
			}
			for (i=0, k=sData.length; i<k; i++) {
				if (tmp[sData[i][simpleDataPIdKey]] && sData[i][simpleDataIdKey] != sData[i][simpleDataPIdKey]) {
					if (!tmp[sData[i][simpleDataPIdKey]]["items"])
						tmp[sData[i][simpleDataPIdKey]]["items"] = [];
					tmp[sData[i][simpleDataPIdKey]]["items"].push(sData[i]);
				} else {
					r.push(sData[i]);
				}
			}
			return r;
        },
        // 由一般数据格式data生成简单数据格式data
        _transformToGeneralData : function(opts,sData){
        	
        },
        //根据data生成HTML
        _generateHTML : function(html,data){
        	var orData=[],opts=this.options;
        	var simpleDataIdKey = opts.simpleDataIdKey;
    		if (this.options.simpleDataEnable) {
    			orData = this._transformToSimpleData(opts,data)
    		} else {
    			orData = data;
    		}
    		data = orData;
        	html+="<ul>";
	        for(var i=0;i<data.length;i++){
	        	// modified by @lhb @20150317
	        	html+="<li"
	        	if (data[i][simpleDataIdKey] != "") {
	        		html+=" data-id=\""+data[i][simpleDataIdKey]+"\" id=\"menubar-"+data[i][simpleDataIdKey]+"\"";
	        	}
	        	if (data[i].path){
	        		html+=" data-path=\""+data[i].path+"\"";
	        	}
	        	html+=">";
				html+=this._generateANode(data[i]);
				var items=data[i].items;
				if(typeof items !== "undefined" && items instanceof Array && items.length>0 ){
					html=this._generateHTML(html,items);
				}
				html+="</li>"
			}
			html+="</ul>";
			return html;
        },
        //生成A元素
        _generateANode : function(node){
        	var str="<a",
        	    simpleDataIdKey = this.options.simpleDataIdKey,
        	    isactiveField = this.options.isactiveField,
        	    nameField = this.options.nameField;
			if(node.iconclass!=""){
				str+=" data-icon='"+node.iconclass+"'";
			}
			if(node[nameField]!=""){
				str+=" data-name='"+node[nameField]+"'";
			}
			if(node.disabled){
				str+=" data-disabled='"+node.disabled+"'";
			}
			if(node.url){
				/*if (node.response == "click") {
					str+="";
				} else {
					str+=" href='"+node.url+"'";
				}*/
				str+=" data-url='"+node.url+"'";
			}
			if(node.target){
				str+=" data-target='"+node.target+"'";
			}
			if(node[isactiveField]){
				str+=" data-isactive='"+node[isactiveField]+"'";
			}
			str+=">";
			if(node[nameField]!=""){
				str+=node[nameField];
			}
			str+="</a>";
			return str;
        },
        _initPopup: function() {
            var $this = this;
			//处理trigger类型转换
            this.options.trigger=typeof this.options.trigger==="string" ? $('#'+this.options.trigger):this.options.trigger;
            this.element.closest('.coral-menu').addClass('coral-menu-dynamic coral-shadow').appendTo(document.body);
            // 如果of属性定义，则定位于of，否则定位依据trigger
            this.positionConfig = {
                my: this.options.my,
                at: this.options.at,
                of: this.options.of ? this.options.of : this.options.trigger
            };

            this.options.trigger.on(this.options.triggerEvent + '.coral-menu', function(e) {
            	//禁用对trigger的事件触发
            	if($this.options.disabled===true)return ;
                var trigger = $(this);
                if($this.element.is(':visible')) {
                    $this.hide();
                }
                else {
                    $this.show();
                }
                
                e.preventDefault();
            });

            //hide overlay on document click
            $(document.body).on('click.coral-menu', function (e) {
                var popup = $this.element.closest('.coral-menu');
                if(popup.is(":hidden")) {
                    return;
                }

                //do nothing if mousedown is on trigger
                var target = $(e.target);
                if(target.is($this.options.trigger.get(0))||$this.options.trigger.has(target).length > 0) {
                    return;
                }

                //hide if mouse is outside of overlay except trigger
                var offset = popup.offset();
                if(e.pageX < offset.left ||
                    e.pageX > offset.left + popup.width() ||
                    e.pageY < offset.top ||
                    e.pageY > offset.top + popup.height()) {

                    $this.hide(e);
                }
            });

            //Hide overlay on resize
            $(window).on('resize.coral-menu', function() {
                if($this.element.closest('.coral-menu').is(':visible')) {
                    $this.align();
                }
            });
        },
                
        show: function() {
            this.align();
            this.element.closest('.coral-menu').css('z-index', ++$.coral.zindex).show();
        },

        hide: function() {
            this.element.closest('.coral-menu').fadeOut('fast');
        },

        align: function() {
            this.element.closest('.coral-menu').css({left:'', top:''}).position({
            	my: this.options.my,
                at: this.options.at,
                of: this.options.of ? this.options.of : this.options.trigger
            });
        },
        //方法调用
        _apply : function(callback,obj,datas){
        	if(typeof callback ==="string"){        		
				return window[callback].apply(obj, [datas]);
			}else if($.isFunction( callback )){
				return callback.apply(obj, [datas]);
			}
        },
        //设置每个菜单是否为禁用
        _setMenuItemLinkDisabled : function(menuitemLink){
        	if(menuitemLink.data('disabled')===true){
				menuitemLink.toggleClass( this.componentFullName + "-disabled coral-state-disabled", true ).attr( "aria-disabled", true );
            }else{
             	menuitemLink.toggleClass( this.componentFullName + "-disabled coral-state-disabled", false ).attr( "aria-disabled", false );
            }
        },
        
        _setMenuItemIsOpen : function(listItem,menuItemLink) {
        	var isOpen = $(menuItemLink).data("isopen"),
        	    singleOpen = this.options.singleOpen,
        	    elseOpen = this.element.find(".coral-menuitem-open").length;
        	if ((!singleOpen || !elseOpen) && isOpen) {
        		listItem.addClass("coral-menuitem-open");
        		listItem.children("ul").css({"display":"block"})
        	}
        },
        
        setMenuItemIsactive : function(menuItemLink){
        	if (typeof menuItemLink == "string") {
        		menuItemLink = this.element.find("#menubar-"+menuItemLink).children();
        		$(menuItemLink).parents("li").addClass("coral-menuitem-active");
        		$(menuItemLink).parent().parents("li").addClass("coral-menuitem-open ");
        		$(menuItemLink).parents("ul.coral-menu-child").css({"display":"block"});
        	} else {
        		var isactive = $(menuItemLink).data("isactive");
        		if (isactive) {
        			$(menuItemLink).parents("li").addClass("coral-menuitem-active");
        			$(menuItemLink).parent().parents("li").addClass("coral-menuitem-open ");
        			$(menuItemLink).parents("ul.coral-menu-child").css({"display":"block"});
        		}
        	}
        },
        //绑定菜单点击事件
        _bindMenuItemClick : function($this){
        	var click=$this.options.onClick;
            //if(click!=null){
            	$this.links.on('click',function(){
            		if($this.options.disabled===true)return ;
            		var datas={};
            		
            		if($(this).parent("li").attr("data-id")!=null){
            			datas.id=$(this).parent("li").attr("data-id");
            		}
            		if($(this).attr("data-target")!=null){
            			datas.target=$(this).attr("data-target");
            		}
            		if($(this).attr("data-name")!=null){
            			datas.name=$(this).attr("data-name");
            		}
            		/*if($(this).attr("href")!=null){
            			datas.href=$(this).attr("href");
            		}*/
            		if($(this).attr("data-url")!=null){
            			datas.url=$(this).attr("data-url");
            		}
            		if($(this).find(":checkbox,:radio").length>0){
            			datas.hasChk=true;
            			datas.checked=$(this).find(":checkbox,:radio").prop('checked');
            		}else{
            			datas.hasChk=false;
            		}
            		var event={
						target: $this,
						currentTarget: $this,
						preventDefault: $.noop
					}
					$this._trigger( "onClick", event, datas );
	            	//$this._apply(click,this,datas);
	            });
            //}
        },
        setActiveMenu : function(menuNames){
        	var $this = this;
        	if(menuNames==null || menuNames.length==0)return ;
        	
        	$.each(menuNames,function(){
        		var aEle=$this.element.find("[data-name='"+this+"']");
        		aEle.parent().addClass("coral-menuitem-current");
        	});
        },
        setCurrenMenu : function(menuNames){
        	if(menuNames==null || menuNames.length==0)return ;
        	this.element.find(">li>a").each(function() {
				var elem = $( this ),
					dn = elem.attr( "data-name" );

				if ( dn !== menuNames) {
					return;
				}
				elem.parent().addClass("coral-menuitem-current");
				$(this).parent().siblings().removeClass("coral-menuitem-current");
			});
        }
    });



$.component("coral.navigationmenu", $.coral.basemenu,{

	castProperties : ["title"],
	options: {
    	collapsible: true,
    	active: 0,
    	textAlign: "left",
    	role: "navigationmenu",
    	menus: "ul",
    	title: null,
    	icons: {
    		activeHeader: "cui-icon-arrow-down",
			header: "cui-icon-arrow-right2"
    	},
    	header: "> li > :first-child,> :not(li):even"
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
	
	_setOption: function( key, value ){
		if ( key === "active" ) {
			this._activate( value );
			return;
		}
		this._super(key, value );
	},
	
    _create: function() {
    	var that = this;
        this._generateULContent();
    	
        this._render();
        
	    
        this.links = this.element.find('.coral-menuitem-link:not(.coral-state-disabled)');
        this._on({
			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .coral-navigationmenu-header": function( event ) {
				event.preventDefault();
			},
			// 第一级的处理
			"click .coral-menuitem-link": function( event ) {
				event.preventDefault();
				var target = $( event.target ).closest( ".coral-menuitem-link" ),
					parent = $( event.target ).closest( ".coral-menu-parent" );
				if ( parent.not( ".coral-state-disabled" ).length ) {
					
					parent.siblings().find(">ul").attr( "aria-expanded", false ).slideUp();
						parent.find(">.icon").removeClass( that.options.icons.activeHeader )
						.addClass( that.options.icons.header );
					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}
					var targetUl = parent.find(">ul");
					// Open submenu on click
					if ( !target.parent().hasClass( "coral-menu-parent") ){
						this.oldActive = this.active || $();
						this.active = target;
						this.oldActive.removeClass( "coral-state-highlight" );
						ui = { item: this.active, target: this.active.attr("href") };
						this.active.addClass( "coral-state-highlight" )
						this._trigger( "onSelect", event, ui );
					} else {
						if ( targetUl.attr( "aria-expanded" ) == "true" ){
							targetUl.attr( "aria-expanded", false ).slideUp();
						} else {
							targetUl.attr( "aria-expanded", true ).slideDown();
							parent.find(">.icon").removeClass( that.options.icons.header )
								.addClass( that.options.icons.activeHeader );
						}
					}
				}
			},
			"mouseenter .coral-menuitem-link": function( event ) {
				event.preventDefault();
				var target = $( event.target ).closest( ".coral-menuitem-link" );
				var parent = $( event.target ).closest( ".coral-menu-parent" );
				if ( parent.not( ".coral-state-disabled" ).length ) {
					
					if ( !target.parent().hasClass( "coral-menu-parent") ){
						target.addClass("coral-state-hover")
					}
					this._updateTitle();
				}
			},
			"mouseleave .coral-menuitem-link": function( event ) {
				event.preventDefault();
				var target = $( event.target ).closest( ".coral-menuitem-link" );
				var parent = $( event.target ).closest( ".coral-menu-parent" );
				if ( parent.not( ".coral-state-disabled" ).length ) {
					
					if ( !target.parent().hasClass( "coral-menu-parent") ){
						target.removeClass( "coral-state-hover" )
					}
				}
			}
        });
        
        this._super();
    },
    _updateTitle: function(){
    	this.element.find("li>a").each(function() {
			var elem = $( this ),
				dn = elem.find(".coral-menuitem-text").text();
			var widthDiv = $("<span style = 'visibility: hidden'>"+ dn +"</span>").appendTo("body");
			if(elem.width() < widthDiv.width()){
	    		elem.attr( "title", dn);
	    	}
			widthDiv.remove();
		});
    },
    _processPanels: function() {
    	 this.headers = this.element.find( this.options.header )
 		.addClass( "coral-navigationmenu-header coral-state-default" );
	},
    _render: function() {
    	var $this=this;
        this.element.addClass('coral-helper-reset coral-navigationmenu coral-menu').attr("role","navigationmenu");
        
        this.element.uniqueId();
        this.options.id = this.element.attr('id');

        this._processPanels();
        submenus = this.element.find( this.options.menus );
        submenus.filter( ":not(.coral-menu)" )
			.addClass( "coral-menu-list coral-helper-reset" )
			/*.hide()*/
			.attr({
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			})
			.each(function() {
				var menu = $( this ),
					item = menu.parent();
	
				item.attr( "aria-haspopup", "true" );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			});

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );
	
		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".coral-menu-item" ).each(function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				item.addClass( "coral-component-content coral-menu-divider" );
			}
		});
		
        this.element.find('li').each(function() {
	        var listItem = $(this),
		        menuitemLink = listItem.children('a'),
		        icon = menuitemLink.data('icon'),
		        level = typeof(listItem.parent().parent("li").attr("data-level"))=="undefined"?
		        		0:parseInt(listItem.parent().parent("li").attr("data-level"))+1;
	        menuitemLink.addClass('coral-menuitem-link coral-state-default coral-corner-all');
	        menuitemLink.contents().filter(function(i, item){
	        	if (item.tagName) return false;
	        	return true;
	        }).wrap("<span class='coral-menuitem-text'/>");
	        // coral-navigationmenu-item-inner控制item不换行，出现ellipsis
	        menuitemLink.html('<div class="coral-navigationmenu-item-inner">'+menuitemLink.html()+'</div>');
	        listItem.addClass('coral-menuitem coral-component coral-corner-all')
	        	.attr("data-level", level).addClass("level"+level);
	        /*if(icon) {
	        	menuitemLink.prepend('<span class="menu-icon ' + icon + '"></span>');
	        }*/
	        if(listItem.children('ul').length > 0) {
	        	//submenus = this.element.find( this.options.menus );
	        	var submenus = listItem.children('ul');
	            listItem.addClass('coral-menu-parent');
	            submenus.addClass('coral-menu-list coral-helper-reset');
	            menuitemLink.prepend('<span class="coral-navigationmenu-item-arrow cui-icon-arrow-down3"></span>');
	        } else if($this.options.textAlign == 'right'){
	           // menuitemLink.find(".coral-navigationmenu-item-inner").prepend('<span style="visibility:hidden;" class="coral-navigationmenu-item-arrow cui-icon-arrow-down3"></span>');
	        }
	        
	        if($this.options.textAlign == 'right'){
	            $("<span class='coral-empty' style='width:"+level*16+"px;height:"+16+"px;'></span>").prependTo(menuitemLink.find(".coral-navigationmenu-item-inner"));
	        }

        });
        
        var selector = ".coral-navigationmenu li > a[data-target=\'" + this.options.active + "\']," +
        " .coral-navigationmenu li > a[href=\'" + this.options.active + "\']";

        var active = $( selector );
        active.parents('ul').show();
        if( !active.parent().hasClass("coral-menu-parent")){
        	active.addClass("coral-state-highlight");
        	this.oldActive = active;
			this.active = active;
        }
    }
});
/**
 * CoralUI Menu component
 */
$.component( "coral.menu", {
		version: "4.0.2",
		defaultElement: "<ul>",
		delay: 300,
		options: {
			icons: {
				submenu: "coral-icon-carat-1-e"
			},
			items: "> *",
			menus: "ul",
			position: {
				my: "left-1 top",
				at: "right top"
			},
			role: "menu",

			// callbacks
			onBlur: null,
			onFocus: null,
			onSelect: null
		},

		_create: function() {
			this.activeMenu = this.element;

			// Flag used to prevent firing of the click handler
			// as the event bubbles up through nested menus
			this.mouseHandled = false;
			this.element
				.uniqueId()
				.addClass( "coral-menu coral-component coral-component-content" )
				.toggleClass( "coral-menu-icons", !!this.element.find( ".coral-icon" ).length )
				.attr({
					role: this.options.role,
					tabIndex: 0
				});

			if ( this.options.disabled ) {
				this.element
					.addClass( "coral-state-disabled" )
					.attr( "aria-disabled", "true" );
			}

			this._on({
				// Prevent focus from sticking to links inside menu after clicking
				// them (focus should always stay on UL during navigation).
				"mousedown .coral-menu-item": function( event ) {
					event.preventDefault();
				},
				"click .coral-menu-item": function( event ) {
					var target = $( event.target );
					if ( !this.mouseHandled && target.not( ".coral-state-disabled" ).length ) {
						this.select( event );

						// Only set the mouseHandled flag if the event will bubble, see #9469.
						if ( !event.isPropagationStopped() ) {
							this.mouseHandled = true;
						}

						// Open submenu on click
						if ( target.has( ".coral-menu" ).length ) {
							this.expand( event );
						} else if ( !this.element.is( ":focus" ) && $( this.document[ 0 ].activeElement ).closest( ".coral-menu" ).length ) {

							// Redirect focus to the menu
							this.element.trigger( "focus", [ true ] );

							// If the active item is on the top level, let it stay active.
							// Otherwise, blur the active item since it is no longer visible.
							if ( this.active && this.active.parents( ".coral-menu" ).length === 1 ) {
								clearTimeout( this.timer );
							}
						}
					}
				},
				"mouseenter .coral-menu-item": function( event ) {
					// Ignore mouse events while typeahead is active, see #10458.
					// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
					// is over an item in the menu
					if ( this.previousFilter ) {
						return;
					}
					var target = $( event.currentTarget );
					// Remove coral-state-active class from siblings of the newly focused menu item
					// to avoid a jump caused by adjacent elements both having a class with a border
					target.siblings( ".coral-state-active" ).removeClass( "coral-state-active" );
					this.focus( event, target );
				},
				mouseleave: "collapseAll",
				"mouseleave .coral-menu": "collapseAll",
				focus: function( event, keepActiveItem ) {
					// If there's already an active item, keep it active
					// If not, activate the first item
					var item = this.active || this.element.find( this.options.items ).eq( 0 );

					if ( !keepActiveItem ) {
						this.focus( event, item );
					}
				},
				blur: function( event ) {
					this._delay(function() {
						if ( !$.contains( this.element[0], this.document[0].activeElement ) ) {
							this.collapseAll( event );
						}
					});
				},
				keydown: "_keydown"
			});

			this.refresh();

			// Clicks outside of a menu collapse any open menus
			this._on( this.document, {
				click: function( event ) {
					if ( this._closeOnDocumentClick( event ) ) {
						this.collapseAll( event );
					}

					// Reset the mouseHandled flag
					this.mouseHandled = false;
				}
			});
		},

		_destroy: function() {
			// Destroy (sub)menus
			this.element
				.removeAttr( "aria-activedescendant" )
				.find( ".coral-menu" ).addBack()
					.removeClass( "coral-menu coral-component coral-component-content coral-menu-icons coral-front" )
					.removeAttr( "role" )
					.removeAttr( "tabIndex" )
					.removeAttr( "aria-labelledby" )
					.removeAttr( "aria-expanded" )
					.removeAttr( "aria-hidden" )
					.removeAttr( "aria-disabled" )
					.removeUniqueId()
					.show();

			// Destroy menu items
			this.element.find( ".coral-menu-item" )
				.removeClass( "coral-menu-item" )
				.removeAttr( "role" )
				.removeAttr( "aria-disabled" )
				.removeUniqueId()
				.removeClass( "coral-state-hover" )
				.removeAttr( "tabIndex" )
				.removeAttr( "role" )
				.removeAttr( "aria-haspopup" )
				.children().each( function() {
					var elem = $( this );
					if ( elem.data( "coral-menu-submenu-carat" ) ) {
						elem.remove();
					}
				});

			// Destroy menu dividers
			this.element.find( ".coral-menu-divider" ).removeClass( "coral-menu-divider coral-component-content" );
		},

		_keydown: function( event ) {
			var match, prev, character, skip,
				preventDefault = true;

			switch ( event.keyCode ) {
			case $.coral.keyCode.PAGE_UP:
				this.previousPage( event );
				break;
			case $.coral.keyCode.PAGE_DOWN:
				this.nextPage( event );
				break;
			case $.coral.keyCode.HOME:
				this._move( "first", "first", event );
				break;
			case $.coral.keyCode.END:
				this._move( "last", "last", event );
				break;
			case $.coral.keyCode.UP:
				this.previous( event );
				break;
			case $.coral.keyCode.DOWN:
				this.next( event );
				break;
			case $.coral.keyCode.LEFT:
				this.collapse( event );
				break;
			case $.coral.keyCode.RIGHT:
				if ( this.active && !this.active.is( ".coral-state-disabled" ) ) {
					this.expand( event );
				}
				break;
			case $.coral.keyCode.ENTER:
			case $.coral.keyCode.SPACE:
				this._activate( event );
				break;
			case $.coral.keyCode.ESCAPE:
				this.collapse( event );
				break;
			default:
				preventDefault = false;
				prev = this.previousFilter || "";
				character = String.fromCharCode( event.keyCode );
				skip = false;

				clearTimeout( this.filterTimer );

				if ( character === prev ) {
					skip = true;
				} else {
					character = prev + character;
				}

				match = this._filterMenuItems( character );
				match = skip && match.index( this.active.next() ) !== -1 ?
					this.active.nextAll( ".coral-menu-item" ) :
					match;

				// If no matches on the current filter, reset to the last character pressed
				// to move down the menu to the first item that starts with that character
				if ( !match.length ) {
					character = String.fromCharCode( event.keyCode );
					match = this._filterMenuItems( character );
				}

				if ( match.length ) {
					this.focus( event, match );
					this.previousFilter = character;
					this.filterTimer = this._delay(function() {
						delete this.previousFilter;
					}, 1000 );
				} else {
					delete this.previousFilter;
				}
			}

			if ( preventDefault ) {
				event.preventDefault();
			}
		},

		_activate: function( event ) {
			if ( !this.active.is( ".coral-state-disabled" ) ) {
				if ( this.active.is( "[aria-haspopup='true']" ) ) {
					this.expand( event );
				} else {
					this.select( event );
				}
			}
		},

		refresh: function() {
			var menus, items,
				that = this,
				icon = this.options.icons.submenu,
				submenus = this.element.find( this.options.menus );

			this.element.toggleClass( "coral-menu-icons", !!this.element.find( ".coral-icon" ).length );

			// Initialize nested menus
			submenus.filter( ":not(.coral-menu)" )
				.addClass( "coral-menu coral-component coral-component-content coral-front" )
				.hide()
				.attr({
					role: this.options.role,
					"aria-hidden": "true",
					"aria-expanded": "false"
				})
				.each(function() {
					var menu = $( this ),
						item = menu.parent(),
						submenuCarat = $( "<span>" )
							.addClass( "coral-menu-icon coral-icon " + icon )
							.data( "coral-menu-submenu-carat", true );

					item
						.attr( "aria-haspopup", "true" )
						.prepend( submenuCarat );
					menu.attr( "aria-labelledby", item.attr( "id" ) );
				});

			menus = submenus.add( this.element );
			items = menus.find( this.options.items );

			// Initialize menu-items containing spaces and/or dashes only as dividers
			items.not( ".coral-menu-item" ).each(function() {
				var item = $( this );
				if ( that._isDivider( item ) ) {
					item.addClass( "coral-component-content coral-menu-divider" );
				}
			});

			// Don't refresh list items that are already adapted
			items.not( ".coral-menu-item, .coral-menu-divider" )
				.addClass( "coral-menu-item" )
				.uniqueId()
				.attr({
					tabIndex: -1,
					role: this._itemRole()
				});

			// Add aria-disabled attribute to any disabled menu item
			items.filter( ".coral-state-disabled" ).attr( "aria-disabled", "true" );

			// If the active item has been removed, blur the menu
			if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
				this.blur();
			}
		},

		_itemRole: function() {
			return {
				menu: "menuitem",
				listbox: "option"
			}[ this.options.role ];
		},

		_setOption: function( key, value ) {
			if ( key === "icons" ) {
				this.element.find( ".coral-menu-icon" )
					.removeClass( this.options.icons.submenu )
					.addClass( value.submenu );
			}
			if ( key === "disabled" ) {
				this.element
					.toggleClass( "coral-state-disabled", !!value )
					.attr( "aria-disabled", value );
			}
			this._super( key, value );
		},

		focus: function( event, item ) {
			var nested, focused;
			this.blur( event, event && event.type === "focus" );

			this._scrollIntoView( item );

			this.active = item.first();
			focused = this.active.addClass( "coral-state-focus" ).removeClass( "coral-state-active" );
			// Only update aria-activedescendant if there's a role
			// otherwise we assume focus is managed elsewhere
			if ( this.options.role ) {
				this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
			}

			// Highlight active parent menu item, if any
			this.active
				.parent()
				.closest( ".coral-menu-item" )
				.addClass( "coral-state-active" );

			if ( event && event.type === "keydown" ) {
				this._close();
			} else {
				this.timer = this._delay(function() {
					this._close();
				}, this.delay );
			}

			nested = item.children( ".coral-menu" );
			if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
				this._startOpening(nested);
			}
			this.activeMenu = item.parent();

			this._trigger( "onFocus", event, { item: item } );
		},

		_scrollIntoView: function( item ) {
			var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
			if ( this._hasScroll() ) {
				borderTop = parseFloat( $.css( this.activeMenu[0], "borderTopWidth" ) ) || 0;
				paddingTop = parseFloat( $.css( this.activeMenu[0], "paddingTop" ) ) || 0;
				offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
				scroll = this.activeMenu.scrollTop();
				elementHeight = this.activeMenu.height();
				itemHeight = item.outerHeight();

				if ( offset < 0 ) {
					this.activeMenu.scrollTop( scroll + offset );
				} else if ( offset + itemHeight > elementHeight ) {
					this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
				}
			}
		},

		blur: function( event, fromFocus ) {
			if ( !fromFocus ) {
				clearTimeout( this.timer );
			}

			if ( !this.active ) {
				return;
			}

			this.active.removeClass( "coral-state-focus" );
			this.active = null;

			this._trigger( "onBlur", event, { item: this.active } );
		},

		_startOpening: function( submenu ) {
			clearTimeout( this.timer );

			// Don't open if already open fixes a Firefox bug that caused a .5 pixel
			// shift in the submenu position when mousing over the carat icon
			if ( submenu.attr( "aria-hidden" ) !== "true" ) {
				return;
			}

			this.timer = this._delay(function() {
				this._close();
				this._open( submenu );
			}, this.delay );
		},

		_open: function( submenu ) {
			var position = $.extend({
				of: this.active
			}, this.options.position );

			clearTimeout( this.timer );
			this.element.find( ".coral-menu" ).not( submenu.parents( ".coral-menu" ) )
				.hide()
				.attr( "aria-hidden", "true" );

			submenu
				.show()
				.removeAttr( "aria-hidden" )
				.attr( "aria-expanded", "true" )
				.position( position );
		},

		collapseAll: function( event, all ) {
			clearTimeout( this.timer );
			this.timer = this._delay(function() {
				// If we were passed an event, look for the submenu that contains the event
				var currentMenu = all ? this.element :
					$( event && event.target ).closest( this.element.find( ".coral-menu" ) );

				// If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
				if ( !currentMenu.length ) {
					currentMenu = this.element;
				}

				this._close( currentMenu );

				this.blur( event );
				this.activeMenu = currentMenu;
			}, this.delay );
		},

		// With no arguments, closes the currently active menu - if nothing is active
		// it closes all menus.  If passed an argument, it will search for menus BELOW
		_close: function( startMenu ) {
			if ( !startMenu ) {
				startMenu = this.active ? this.active.parent() : this.element;
			}

			startMenu
				.find( ".coral-menu" )
					.hide()
					.attr( "aria-hidden", "true" )
					.attr( "aria-expanded", "false" )
				.end()
				.find( ".coral-state-active" ).not( ".coral-state-focus" )
					.removeClass( "coral-state-active" );
		},

		_closeOnDocumentClick: function( event ) {
			return !$( event.target ).closest( ".coral-menu" ).length;
		},

		_isDivider: function( item ) {

			// Match hyphen, em dash, en dash
			return !/[^\-\u2014\u2013\s]/.test( item.text() );
		},

		collapse: function( event ) {
			var newItem = this.active &&
				this.active.parent().closest( ".coral-menu-item", this.element );
			if ( newItem && newItem.length ) {
				this._close();
				this.focus( event, newItem );
			}
		},

		expand: function( event ) {
			var newItem = this.active &&
				this.active
					.children( ".coral-menu " )
					.find( this.options.items )
					.first();

			if ( newItem && newItem.length ) {
				this._open( newItem.parent() );

				// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
				this._delay(function() {
					this.focus( event, newItem );
				});
			}
		},

		next: function( event ) {
			this._move( "next", "first", event );
		},

		previous: function( event ) {
			this._move( "prev", "last", event );
		},

		isFirstItem: function() {
			return this.active && !this.active.prevAll( ".coral-menu-item" ).length;
		},

		isLastItem: function() {
			return this.active && !this.active.nextAll( ".coral-menu-item" ).length;
		},

		_move: function( direction, filter, event ) {
			var next;
			if ( this.active ) {
				if ( direction === "first" || direction === "last" ) {
					next = this.active
						[ direction === "first" ? "prevAll" : "nextAll" ]( ".coral-menu-item" )
						.eq( -1 );
				} else {
					next = this.active
						[ direction + "All" ]( ".coral-menu-item" )
						.eq( 0 );
				}
			}
			if ( !next || !next.length || !this.active ) {
				next = this.activeMenu.find( this.options.items )[ filter ]();
			}

			this.focus( event, next );
		},

		nextPage: function( event ) {
			var item, base, height;

			if ( !this.active ) {
				this.next( event );
				return;
			}
			if ( this.isLastItem() ) {
				return;
			}
			if ( this._hasScroll() ) {
				base = this.active.offset().top;
				height = this.element.height();
				this.active.nextAll( ".coral-menu-item" ).each(function() {
					item = $( this );
					return item.offset().top - base - height < 0;
				});

				this.focus( event, item );
			} else {
				this.focus( event, this.activeMenu.find( this.options.items )
					[ !this.active ? "first" : "last" ]() );
			}
		},

		previousPage: function( event ) {
			var item, base, height;
			if ( !this.active ) {
				this.next( event );
				return;
			}
			if ( this.isFirstItem() ) {
				return;
			}
			if ( this._hasScroll() ) {
				base = this.active.offset().top;
				height = this.element.height();
				this.active.prevAll( ".coral-menu-item" ).each(function() {
					item = $( this );
					return item.offset().top - base + height > 0;
				});

				this.focus( event, item );
			} else {
				this.focus( event, this.activeMenu.find( this.options.items ).first() );
			}
		},

		_hasScroll: function() {
			return this.element.outerHeight() < this.element.prop( "scrollHeight" );
		},

		select: function( event ) {
			// TODO: It should never be possible to not have an active item at this
			// point, but the tests don't trigger mouseenter before click.
			this.active = this.active || $( event.target ).closest( ".coral-menu-item" );
			var ui = { item: this.active };
			if ( !this.active.has( ".coral-menu" ).length ) {
				this.collapseAll( event, true );
			}
			this._trigger( "onSelect", event, ui );
		},

		_filterMenuItems: function(character) {
			var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
				regex = new RegExp( "^" + escapedCharacter, "i" );

			return this.activeMenu
				.find( this.options.items )

				// Only match on items, not dividers or other content (#10571)
				.filter( ".coral-menu-item" )
				.filter(function() {
					return regex.test( $.trim( $( this ).text() ) );
				});
		}
	});


/**
 * CoralUI BreadCrumb component
 */


    $.component("coral.breadcrumb", {
        
        _create: function() {
            this.element.wrap('<div class="coral-breadcrumb coral-module coral-component coral-component-header coral-helper-clearfix coral-corner-all" role="menu">');
            
            this.element.children('li').each(function(index) {
                var listItem = $(this);
                
                listItem.attr('role', 'menuitem');
                var menuitemLink = listItem.children('a');
                menuitemLink.addClass('coral-menuitem-link coral-corner-all').contents().wrap('<span class="coral-menuitem-text" />');
                    
                if(index > 0)
                    listItem.before('<li class="coral-breadcrumb-chevron menu-rightArrow cui-icon-arrowDown1"></li>');
                else
                    menuitemLink.addClass('coral-icon coral-icon-home');
            });
        }
    });




/*
 * CoralUI TieredMenu component
 */


    $.component("coral.tieredmenu", $.coral.basemenu, {
        
        options: {
            autoDisplay: true
        },
        
        _create: function() {
        	       	
        	this._generateULContent();
        	this.element.wrap('<div class="coral-tieredmenu coral-menu coral-component coral-component-content coral-corner-all coral-helper-clearfix" />');
        	
            this._render();
            
            this.links = this.element.find('.coral-menuitem-link');
            
            this.lis = this.element.find(".coral-menuitem");
            
            this.menuitems = this.element.children("li.coral-menuitem");

            this._bindEvents();
            
            this._super();
        },
         
        _render: function() {
        	var $this=this;
            this.element.addClass('coral-menu-list coral-helper-reset');
            
          /*  if (this.options.id){
            	this.element.parent().attr('id', this.options.id);
        	} else {
        		this.element.parent().uniqueId();
        		this.options.id = this.element.parent().attr('id');
        	}*/
        	this.element.find('li').each(function(i) {
        		var listItem = $(this),
	        		menuitemLink = listItem.children('a'),
	        		icon = menuitemLink.data('icon');
        		//禁用个别菜单
        		$this._setMenuItemLinkDisabled(menuitemLink);
        		//设置某个菜单是否展开
                $this._setMenuItemIsOpen(listItem,menuitemLink);
                //设置某个叶子菜单是否处于选中状态
                $this.setMenuItemIsactive(menuitemLink);
        		
        		menuitemLink.addClass('coral-menuitem-link coral-corner-all').contents().wrap('<span class="coral-menuitem-text" />');
        		
        		if(icon) {
        			menuitemLink.prepend('<span class="menu-icon ' + icon + '"></span>');
        		}
        		
        		listItem.addClass('coral-menuitem coral-component coral-corner-all');
        		if(listItem.children('ul').length > 0 ){
        			listItem.addClass('coral-menu-parent');
        			listItem.children('ul').addClass('coral-component-content coral-menu-list coral-corner-all coral-helper-clearfix coral-menu-child coral-shadow');
        			menuitemLink.prepend('<span class="menu-rightArrow cui-icon-arrowDown1"></span>');
        		}
        		
        		
        	});
        },
                
        _bindEvents: function() {        
            this._bindItemEvents();
        
            this._bindDocumentHandler();
        },
        /**
         * 为每个菜单绑定点击事件，覆盖父组件方法
         * @param $this {object} : current object
         * @param containRootLink {boolean} : 是否包含根菜单链接
         * @return ;
         */
        _bindMenuItemClick: function ($this, containRootLink) {
        	var rootLinks = [];
        	
        	$this._on({
        		'click.coral-menuitem-link' : function(e){
        			var link = $(e.target).closest("a");
        			if ($this.options.disabled === true || link.hasClass("coral-state-disabled")) return ;
        			if (typeof containRootLink === "boolean" && !containRootLink){
        				if (link.parent().parent().hasClass("ctrl-init")) return
        			}
            		var datas={};
            		var isParent = link.closest("li").hasClass("coral-menu-parent");
            		if(link.parent("li").attr("data-id")!=null){
            			datas.id=link.parent("li").attr("data-id");
            		}
            		if(link.parent("li").attr("data-path")){
            			datas.path = link.parent("li").attr("data-path");
            		}
            		if(link.attr("data-target")!=null){
            			datas.target=link.attr("data-target");
            		}
            		if(link.attr("data-name")!=null){
            			datas.name=link.attr("data-name");
            		}
            		if(link.attr("data-url")!=null){
            			datas.url=link.attr("data-url");
            		}
            		if(link.find(":checkbox,:radio").length>0){
            			datas.hasChk=true;
            			datas.checked=link.find(":checkbox,:radio").prop('checked');
            		}else{
            			datas.hasChk=false;
            		}
            		var event={
    					target: e.target,
    					currentTarget: $this,
    					preventDefault: $.noop
    				}
            		datas.isParent = isParent;
            		datas.target = e.target;
    				$this._trigger( "onClick", event, datas );
        		}
        	})
        },
        _bindItemEvents: function() {
            var $this = this;     
            
            this._on({
            	"mouseenter.coral-menuitem-link":function(e){
            		var target = e.target;
                	if (this.options.vertical || $(window).width()<900 ) return ;
                	if (this.options.disabled === true|| $(target).hasClass("coral-state-disabled")) return ;
                    var link = $(target),
    	                menuitem = link.parent(),
    	                autoDisplay = this.options.autoDisplay,
    	                activeSibling = menuitem.siblings('li').children(".coral-state-hover");
                    
                    if(activeSibling.length === 1) {
                        this._deactivate(activeSibling);
                    }
                    if(autoDisplay||this.active) {
                        this._activate(menuitem);
                    } else {
                        this._highlight(menuitem);
                    }
            	}
            })
            
            this._on({
            	"mouseleave.coral-menuitem":function(e){
            		var target = $(e.target).closest("li");
            		if (this.options.vertical || $(window).width()<900) return ;
            		if (this.options.disabled === true|| $(e.target).closest("a").hasClass("coral-state-disabled")) return ;
            		$(target).find("ul").hide();
            		$(target).children("a").removeClass("coral-state-hover");
            	},
            	"mouseleave" : function(e) {
            		if (this.options.vertical || !this.options.autoDisplay || $(window).width()<900) return
            		this.element.find("ul").hide();
            		this.element.find(".coral-state-hover").removeClass("coral-state-hover");
            	},
            	"click.coral-menuitem" : function(e){
            		var menuitem = $(e.target).closest("li");
            		if (this.options.disabled === true|| $(menuitem).find(">a").hasClass("coral-state-disabled")) return ;
            		if (!this.options.vertical && $(window).width()>900) {
            			if (menuitem.find("li").length == 0) {
            				if (!menuitem.hasClass("coral-menuitem-active")){
                        		$this.element.find(".coral-menuitem-active").removeClass("coral-menuitem-active");
                        		menuitem.addClass("coral-menuitem-active");
                        		menuitem.parents("li").addClass("coral-menuitem-active");
                        	} 
            			}
            		}
            		/*if ((!this.options.vertical && $(window).width()>900) ||
            				(this.element.parent().hasClass("coral-menu-min") && !$(menuitem).parents("ul").hasClass("coral-menu-child")) ) return*/
            		if (!this.options.vertical && $(window).width()>900) return;//忘了上面后面那一半是干嘛用的，想起来再说
                    if (menuitem.find("li").length){    //当li有子元素li时，即当li下面有ul时
                    	if (menuitem.hasClass("coral-menuitem-open")){
                    		menuitem.children("ul").css({"display":"none"});
                    		menuitem.removeClass("coral-menuitem-open");
                    	} else {
                    		if (this.options.singleOpen) {
                    			this.element.find(".coral-menu-child").css({"display":"none"});
                    			this.element.find(".coral-menuitem-open").removeClass("coral-menuitem-open");
                    			menuitem.parents(".coral-menu-child").css({"display":"block"});
                    			menuitem.parents(".coral-menu-child").closest("li").addClass("coral-menuitem-open");
                    		}
                    		menuitem.children("ul").css({"display":"block"});
                    		menuitem.addClass("coral-menuitem-open");
                    	}
                    } else {
                    	if (!menuitem.hasClass("coral-menuitem-active")){
                    		$this.element.find(".coral-menuitem-active").removeClass("coral-menuitem-active");
                    		menuitem.addClass("coral-menuitem-active");
                    		menuitem.parents("li").addClass("coral-menuitem-active");
                    	} 
                    }
                    
                    e.stopPropagation();
                        
            	}
            	
            })
            /*
             * 给expendstyle=click的menubar增加click事件，当点击非叶子节点时可以实现展开和收起，点击叶子节点时加一个class“coral-menu-active”
             * 并且叶子结点的所有祖先节点加class“coral-menu-active”
             */
            if(this.options.autoDisplay === false) {
                this.rootLinks = this.element.find('> .coral-menuitem > .coral-menuitem-link');
                this.rootLinks.data('primecoral-tieredmenu-rootlink', this.options.id).find('*').data('primecoral-tieredmenu-rootlink', this.options.id);
                
                this._on(this.rootLinks,{
                	"click" : function(e){
                		var link = $(e.target).closest("a");
                    	if($this.options.disabled===true || link.hasClass("coral-state-disabled") )return ;
                        var menuitem = link.parent(),
                            submenu = menuitem.children('ul.coral-menu-child');

                        if(submenu.length === 1) {
                            if(submenu.is(':visible')) {
                                $this.active = false;
                                $this._deactivate(menuitem);
                            }
                            else {                                        
                                $this.active = true;
                                $this._highlight(menuitem);
                                $this._showSubmenu(menuitem, submenu);
                            }
                        }
                        
                		var datas={};
                		if(link.parent("li").attr("data-id")!=null){
                			datas.id=link.parent("li").attr("data-id");
                		}
                		if(link.attr("data-target")!=null){
                			datas.target=link.attr("data-target");
                		}
                		if(link.attr("data-name")!=null){
                			datas.name=link.attr("data-name");
                		}
                		if(link.attr("data-url")!=null){
                			datas.url=link.attr("data-url");
                		}
                		if(link.find(":checkbox,:radio").length>0){
                			datas.hasChk=true;
                			datas.checked=link.find(":checkbox,:radio").prop('checked');
                		} else {
                			datas.hasChk=false;
                		}
                		var event = {
    						target: $this,
    						currentTarget: $this,
    						preventDefault: $.noop
    					}
    					$this._trigger( "onClick", event, datas );
                		// 如果li没有子元素，则隐藏
                		if (!link.parent("li").hasClass("coral-menu-parent")) {
                			$this.hide();
                		}
                	}
                })
                
                this._bindMenuItemClick($this,false);
            } else {
            	this._bindMenuItemClick($this,true);	
            }
            
/*            this.element.parent().on('mouseleave.coral-menu','ul.coral-menu-list', function(e) {
                if($this.activeitem) {
                    $this._deactivate($this.activeitem);
                }
                if (!$this.element.parent().hasClass("coral-menubar-horizontal")){
                	e.stopPropagation();
                }
            });*/
            this._on(this.element.parent().find("ul.coral-menu-list"),{
            	"mouseleave" : function(e){
                    if($this.activeitem) {
                        $this._deactivate($this.activeitem);
                    }
                    if (!$this.element.parent().hasClass("coral-menubar-horizontal")){
                    	e.stopPropagation();
                    }
            	}
            })
        },
        /**
         * 根据父id或者根菜单的索引添加项
         * @param key { string, number } : 父id，根菜单index
         * @param data { {},[{}] } : 要添加的项的数据对象，可为一个菜单，也可为多个菜单
         * @return ;
         */
        add: function (key, data) {
        	if ( (typeof key !== "string" && typeof key !== "number" && key !== null) || (typeof data !== "object" ) ) {
        		return;
        	}
        	
        	var that = this;
        	if (typeof key === "string" || key == null) {
        		this._addByParentId(key, data);
        	} else if (typeof key === "number") {
        		this._addByIndex(key, data);
        	}
        },
        /**
         * 根据父id添加项
         * @param pid { string } : 父id
         * @param data { {},[{}] } : 要添加的项的数据对象，可为一个菜单，也可为多个菜单
         * @return ;
         */
        _addByParentId: function(pid, data) {
        	var that = this,
        		$pNode = this.element.find(".coral-menuitem").filter("[data-id$='" + pid + "']");
        	
        	if (!$pNode.length && pid !== null) {
        		return ; 
    		}
        	// 如果pid为null，则添加到根菜单下，否则根据pid添加
        	if (pid === null) {
        		this.element.append( this._getAddHTML(data,false) );
        		var $rootLinks = this._renderAddHTML();
        		this._bindAddItemEvents($rootLinks);
        		this._bindLinkRootEvents( $($rootLinks[0]) );
        	} else {
        		if (this._hasChildren($pNode)) {
        			$pNode.children("ul").append( this._getAddHTML(data,false) );
        		} else {
        			$pNode.append( this._getAddHTML(data, true) );
        		}
        		
        		var $links = this._renderAddHTML($pNode);
        		this._bindAddItemEvents($links);
        	}
        },
        
        /**
         * 生成添加项需要的html字符串
         * @param data { {},[{}] } : 要添加的项的数据对象，可为一个菜单，也可为多个菜单
         * @param hasUL { boolean } : 是否创建ul元素
         * @return html { string } : 构造出来的要添加到页面中的html元素字符串
         */
        _getAddHTML: function(data, hasUL) {
        	var html = "",
        	    simpleDataIdKey = this.options.simpleDataIdKey;
        	// 如果data不是数组，先转换成数组
        	if ( !(data instanceof Array) ) {
        		data = [data];
        	}
        	if (typeof hasUL === "boolean" && hasUL) {
        		html+="<ul>";        		
        	}
	        for(var i=0;i<data.length;i++){
	        	if (data[i][simpleDataIdKey] != "") {
	        		html+="<li data-id=\""+data[i][simpleDataIdKey]+"\">";
	        	} else {
	        		html+="<li>";
	        	}
				html+=this._generateANode(data[i]);
				var items=data[i].items;
				if(items.length>0){
					html=this._generateHTML(html,items);
				}
				html+="</li>"
			}
	        if (typeof hasUL === "boolean" && hasUL) {
	        	html+="</ul>";		
        	}
			
			return html;
        },
        /**
         * 渲染生成的html
         * @param $pNode { jquery{} } : 找到的父元素li
         * @return  { jquery{} } : 返回$pNode下的所有a元素，以便后面绑定事件用
         */
        _renderAddHTML: function($pNode) {
        	var $this = this,
        		$links = this.element.find('li').not(".coral-menuitem");
        	
        	if( $pNode && !$pNode.children('ul').hasClass("coral-menu-list")) {
        		$pNode.addClass('coral-menu-parent');
        		$pNode.children('ul').addClass('coral-component-content coral-menu-list coral-corner-all coral-helper-clearfix coral-menu-child coral-shadow');
        		$pNode.children("a").prepend('<span class="menu-rightArrow cui-icon-arrowDown1"></span>');
            }
        	
        	$links.each(function() {
                    var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    
                    icon = menuitemLink.data('icon');
                    //禁用个别菜单
                    $this._setMenuItemLinkDisabled(menuitemLink);
                    
                     
                    menuitemLink.addClass('coral-menuitem-link coral-corner-all').contents().wrap('<span class="coral-menuitem-text" />');
                    
                    if(icon) {
                        menuitemLink.prepend('<span class="menu-icon ' + icon + '"></span>');
                    }
                    
                    listItem.addClass('coral-menuitem coral-component coral-corner-all');
                    if(listItem.children('ul').length > 0) {
                        listItem.addClass('coral-menu-parent');
                        listItem.children('ul').addClass('coral-component-content coral-menu-list coral-corner-all coral-helper-clearfix coral-menu-child coral-shadow');
                        menuitemLink.prepend('<span class="menu-rightArrow cui-icon-arrowDown1"></span>');
                    }
            });
            
            return $links.find('.coral-menuitem-link');
        },
        /**
         * 给根菜单绑定事件，用以显示子菜单
         * @param $rootLinks { jquery [{}] } : 根菜单a元素s
         * @return ;
         */
        _bindLinkRootEvents: function ($rootLinks) {
        	var $this = this;
        	$rootLinks.data('primecoral-tieredmenu-rootlink', this.options.id).find('*').data('primecoral-tieredmenu-rootlink', this.options.id);

        	this._on($rootLinks,{
        		"click" : function(e){
        			var link = $(e.target).closest("a");
	        		if($this.options.disabled === true || link.hasClass("coral-state-disabled") ) return ;
	                var menuitem = link.parent(),
	                    submenu = menuitem.children('ul.coral-menu-child');
	
	                if(submenu.length === 1) {
	                    if(submenu.is(':visible')) {
	                        $this.active = false;
	                        $this._deactivate(menuitem);
	                    } else {                                        
	                        $this.active = true;
	                        $this._highlight(menuitem);
	                        $this._showSubmenu(menuitem, submenu);
	                    }
	                }
        		}
        	})
        },
        /**
         * 给新增的菜单项绑定事件
         * @param $$links { jquery [{}] } : 菜单a元素s
         * @return ;
         */
        _bindAddItemEvents: function($links) {
        	var $this = this;
        	
/*        	this.element.on('click',$links,function(e){
        		var datas = {},
        		    link = $(e.target).closest("a");
        		if($this.options.disabled === true || link.hasClass("coral-state-disabled"))return ;
        		if(link.parent("li").attr("data-id")!=null){
        			datas.id=link.parent("li").attr("data-id");
        		}
        		if(link.attr("data-target")!=null){
        			datas.target=link.attr("data-target");
        		}
        		if(link.attr("data-name")!=null){
        			datas.name=link.attr("data-name");
        		}
        		if(link.attr("data-url")!=null){
        			datas.url=link.attr("data-url");
        		}
        		if(link.find(":checkbox,:radio").length>0){
        			datas.hasChk=true;
        			datas.checked=link.find(":checkbox,:radio").prop('checked');
        		} else {
        			datas.hasChk=false;
        		}
        		var event = {
					target: $this,
					currentTarget: $this,
					preventDefault: $.noop
				};        		
				$this._trigger( "onClick", event, datas );
				$this.hide();
            });*/
        	this._on($links,{
        		"click" : function(e){
        			var datas = {},
        		    link = $(e.target).closest("a");
	        		if($this.options.disabled === true || link.hasClass("coral-state-disabled"))return ;
	        		if(link.parent("li").attr("data-id")!=null){
	        			datas.id=link.parent("li").attr("data-id");
	        		}
	        		if(link.attr("data-target")!=null){
	        			datas.target=link.attr("data-target");
	        		}
	        		if(link.attr("data-name")!=null){
	        			datas.name=link.attr("data-name");
	        		}
	        		if(link.attr("data-url")!=null){
	        			datas.url=link.attr("data-url");
	        		}
	        		if(link.find(":checkbox,:radio").length>0){
	        			datas.hasChk=true;
	        			datas.checked=link.find(":checkbox,:radio").prop('checked');
	        		} else {
	        			datas.hasChk=false;
	        		}
	        		var event = {
						target: $this,
						currentTarget: $this,
						preventDefault: $.noop
					};        		
					$this._trigger( "onClick", event, datas );
					$this.hide();
        		}
        	})
        	
        	$links.on('mouseenter',function() {
        		if($this.options.disabled===true || $(this).hasClass("coral-state-disabled") )return ;
                var link = $(this),
                menuitem = link.parent(),
                autoDisplay = $this.options.autoDisplay;
                
                var activeSibling = menuitem.siblings('.coral-menuitem-active');
                if(activeSibling.length === 1) {
                    $this._deactivate(activeSibling);
                }

                if(autoDisplay||$this.active) {
                    if(menuitem.hasClass('coral-menuitem-active')) {
                        $this._reactivate(menuitem);
                    } else {
                        $this._activate(menuitem);
                    }  
                } else {
                    $this._highlight(menuitem);
                }
            });            
            
            $links.parents("li").find('ul.coral-menu-list').on('mouseleave.coral-menu', function(e) {
                if ($this.activeitem) {
                    $this._deactivate($this.activeitem);
                }
           
                e.stopPropagation();
            });
        },
        /**
         * 判断菜单项li是否有子菜单
         * @param $li { jquery{} } : 要判断的菜单项li元素
         * @return { boolean } : true - 有子菜单；false - 无子菜单
         */        
        _hasChildren: function($li) {
        	if ($li.hasClass("coral-menu-parent")) {
        		return true;
        	} else {
        		return false;
        	}
        },
        /**
         * 获取根菜单个数
         * @return { number } : number of root menuItems
         */
        _getLength: function () {
        	return this.element.children("li").length;
        },
        /**
         * 根据根菜单索引添加项
         * @param index { number } : 根菜单索引
         * @return ;
         */
        _addByIndex: function(index, data) {
        	var that = this,
				idx = parseInt( index );
			
			if ( idx < 0 || idx > this._getLength() ) {				
				return ;
			}
			
			if (this._getLength() == 0 || idx == this._getLength() ) {
				this.element.append( this._getAddHTML(data,false) );
			} else {
				this.element.children("li:eq("+idx+")").before(this._getAddHTML(data,false));
			}
			
    		var $rootLinks = this._renderAddHTML();
    		this._bindAddItemEvents($rootLinks);
    		this._bindLinkRootEvents( $($rootLinks[0]) );
        },
        /**
         * 删除所有项
         * @return ;
         */
		remove: function ( ) {
			var node = this.element.children("li");
			
			if ( !node.length ) {
				return ;
			}
			
			node.remove();
		},
        /**
         * 根据id或者根菜单索引删除项
         * @param key { string,number } : id，根菜单索引
         * @return ;
         */
		removeItem: function ( key ) {
			var that = this;
			
			if ( typeof key === "string" ) {
				this._removeById( key );
			} else {
				this._removeByIndex( key );
			}			
		},
		/**
		 * 根据id删除项
		 * @param id { string } : id
         * @return ;
		 */
		_removeById: function (id) {
			var node = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
			if (!node.length) {
				return ;
			}
			// 如果父元素没有子元素，则将父元素也删除
			if (!node.siblings("li").length) {
				node.parent("ul").remove();
			} else {
				node.remove();
			}
		},
		/**
		 * 根据根菜单index删除项
		 * @param index { number } :根菜单索引
         * @return ;
		 */
		_removeByIndex: function ( index ) {
			var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var $removeNode = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!$removeNode.length) {
				return ;
			}
			
			$removeNode.remove();
		},
		/**
	     * 根据id或者根菜单索引修改项的文本
	     * @param key { string,number } : id，根菜单索引
	     * @return ;
	     */
		updateItem: function ( key, label ) {
			var that = this;
			
			if ( typeof key === "string" ) {
				this._updateById( key, label );
			} else {
				this._updateByIndex( key, label );
			}
		},
		/**
		 * 根据id修改项的文本
		 * @param id { string } : id
         * @return ;
		 */
		_updateById: function ( id, label ) {
			var nodeUpdate = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
			
			if ( !nodeUpdate.length ) {
				return ;
			}
			
			nodeUpdate.children(".coral-menuitem-link").children( ".coral-menuitem-text" ).html( label );	
		},
		/**
		 * 根据根菜单index修改项的文本
		 * @param index { number } :根菜单索引
         * @return ;
		 */
		_updateByIndex: function ( index, label ) {
			var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var nodeUpdate = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!nodeUpdate.length) {
				return ;
			}
			
			nodeUpdate.children(".coral-menuitem-link").children( ".coral-menuitem-text" ).html( label );
		},
        _bindDocumentHandler: function() {
            var $this = this;

            $(document.body).on('click.coral-menu', function(e) {
                var target = $(e.target);
                if(target.data('primecoral-tieredmenu-rootlink') === $this.options.id) {
                    return;
                }
                    
                $this.active = false;
                //当点击的是叶子节点，或者expendStyle是click时return
                if (target.closest("li").find("ul").length != 0 || $this.element.parent().hasClass("coral-menubar-vertical")) return;
                $this.element.find('li.coral-menuitem-active').each(function() {
                    $this._deactivate($(this), true);
                });
            });
        },
        /**
         * 启用所有的菜单项
         * @return ;
         */
        enable: function() {
        	var node = this.element.find(".coral-menuitem");
			
			if ( !node.length ) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", false ).attr( "aria-disabled", false );
        },
        /**
	     * 根据id或者根菜单索引，启用
	     * @param key { string,number } : id，根菜单索引
	     * @return ;
	     */
        enableItem: function(key) {
        	var that = this;
			
			if ( typeof key === "string" ) {
				this._enableItemById( key );
			} else {
				this._enableItemByIndex( key );
			}
        },
        /**
		 * 根据id，启用
		 * @param id { string } : id
         * @return ;
		 */
        _enableItemById: function(id) {
			var node = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
						
			if ( !node.length ) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", false ).attr( "aria-disabled", false );        	
        },
        /**
	     * 根据根菜单索引，启用
	     * @param index { number } : 根菜单索引
	     * @return ;
	     */
        _enableItemByIndex: function(index) {
        	var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var node = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!node.length) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", false ).attr( "aria-disabled", false );
        },
        /**
         * 禁用所有的菜单项
         * @return ;
         */
        disable: function() {
        	var node = this.element.find(".coral-menuitem");
			
			if ( !node.length ) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", true ).attr( "aria-disabled", true );
        },
        /**
	     * 根据id或者根菜单索引，禁用
	     * @param key { string,number } : id，根菜单索引
	     * @return ;
	     */
        disableItem: function(key) {
        	var that = this;
			
			if ( typeof key === "string" ) {
				return this._disableItemById( key );
			} else {
				return this._disableItemByIndex( key );
			}
        },
        /**
		 * 根据id，禁用
		 * @param id { string } : id
         * @return ;
		 */
        _disableItemById: function(id) {
			var node = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
						
			if ( !node.length ) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", true ).attr( "aria-disabled", true );        	
        },
        /**
	     * 根据根菜单索引，禁用
	     * @param index { number } : 根菜单索引
	     * @return ;
	     */
        _disableItemByIndex: function(index) {
        	var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var node = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!node.length) {
				return ;
			}
			
			node.children(".coral-menuitem-link").toggleClass( this.componentFullName + "-disabled coral-state-disabled", true ).attr( "aria-disabled", true );
        },
        /**
         * 隐藏所有的菜单项
         * @return ;
         */
        hideAll: function () {
        	var node = this.element.children("li");
        	
        	if ( !node.length ) {
        		return ;
        	}
        	
        	node.hide();
        },
        /**
	     * 根据id或者根菜单索引，隐藏
	     * @param key { string,number } : id，根菜单索引
	     * @return ;
	     */
        hideItem: function ( key ) {
        	var that = this;
        	
        	if ( typeof key === "string" ) {
        		return that._hideById( key );
        	} else {
        		return that._hideByIndex( key );
        	}
        },
        /**
		 * 根据id，隐藏
		 * @param id { string } : id
         * @return ;
		 */
        _hideById: function ( id ) {
        	var node = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
			
			if ( !node.length ) {
				return ;
			}
			
			node.toggleClass( "coral-tieredmenu-hidden", true );
		},
		/**
	     * 根据根菜单索引，隐藏
	     * @param index { number } : 根菜单索引
	     * @return ;
	     */
		_hideByIndex: function ( index ) {
			var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var node = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!node.length) {
				return ;
			}
			
			node.toggleClass( "coral-tieredmenu-hidden", true );
		},
		/**
         * 显示所有的菜单项
         * @return ;
         */
		showAll: function () {
			var node = this.element.children("li");
			
			if ( !node.length ) {
				return ;
			}
			
			node.show();
		},
		/**
	     * 根据id或者根菜单索引，显示
	     * @param key { string,number } : id，根菜单索引
	     * @return ;
	     */
		showItem: function ( key ) {
			var that = this;
			
			if (typeof key === "string" ) {
				return that._showById(key);
			} else {
				return that._showByIndex(key);
			}
		},
		 /**
		 * 根据id，显示
		 * @param id { string } : id
         * @return ;
		 */
		_showById: function ( id ) {
			var node = this.element.find(".coral-menuitem").filter("[data-id$='" + id + "']");
			
			if ( !node.length ) {
				return ;
			}
			
			node.toggleClass( "coral-tieredmenu-hidden", false );	
		},
		/**
	     * 根据根菜单索引，显示
	     * @param index { number } : 根菜单索引
	     * @return ;
	     */
		_showByIndex: function ( index ) {
			var idx = parseInt( index );
			
			if ( idx < 0 || idx > (this._getLength()-1) ) {
				return ;
			}
			var node = this.element.children("li.coral-menuitem:eq("+idx+")");
			
			if (!node.length) {
				return ;
			}
			
			node.toggleClass( "coral-tieredmenu-hidden", false );	
		},
        _deactivate: function(menuitem, animate) {
            this.activeitem = null;
            menuitem.children('a.coral-menuitem-link').removeClass('coral-state-hover');
 //           menuitem.removeClass('coral-menuitem-active');

            if(animate)
                menuitem.children('ul.coral-menu-child:visible').fadeOut('fast');
            else
                menuitem.children('ul.coral-menu-child:visible').hide();
        },

        _activate: function(menuitem) {
            this._highlight(menuitem);

            var submenu = menuitem.children('ul.coral-menu-child');
            if(submenu.length === 1) {
                this._showSubmenu(menuitem, submenu);//menuba组件调这个方法，调用的是menubar里的那一个——showSunmenu方法
            }
        },

        _reactivate: function(menuitem) {
            this.activeitem = menuitem;
            var submenu = menuitem.children('ul.coral-menu-child'),
            activeChilditem = submenu.children('li.coral-menuitem-active:first'),
            _self = this;

            if(activeChilditem.length === 1) {
                _self._deactivate(activeChilditem);
            }
        },

        _highlight: function(menuitem) {
            this.activeitem = menuitem;
            menuitem.children('a.coral-menuitem-link').addClass('coral-state-hover');
 //           menuitem.addClass('coral-menuitem-active');
        },
                
        _showSubmenu: function(menuitem, submenu) {
        	// 如果子元素中都是隐藏的元素，则返回。
        	if (!submenu.children("li:not(.coral-tieredmenu-hidden)").length) return;
        	//禁用对trigger的事件触发
            if(this.options.disabled===true)return ;
            submenu.css({
                'left': menuitem.outerWidth(),
                'top': 0,
                'z-index': ++$.coral.zindex
            });

            submenu.show();
        }
            
    });


/**
 * CoralUI Menubar component
 */



    $.component("coral.menubar", $.coral.tieredmenu, {
        
        options: {

        },
        component: function(){
        	return this.element.parent();
        },
        _create: function() {
        	//this._generateULContent();
        	this._super();
        	// 继承 tieredmenu 父方法中给 parent 元素赋了跟 element 一样的 id。
            if (!this.options.vertical){
            	this.element.parent().removeClass('coral-tieredmenu').addClass('coral-menubar').addClass("coral-menubar-horizontal");
            } else if (this.options.vertical){
            	this.element.parent().addClass("coral-menubar-vertical").removeClass('coral-tieredmenu');
            }
            this.element.find(">li>ul").addClass('coral-dropdown-menu');
            if (this.options.responsive) {
            	this.component().addClass("menu-responsive")
            }
            if (this.options.minmenu) {
            	this.component().addClass("coral-menu-min");
            }
            if (this.options.collapseButton) {
            	$("<div class='coral-menubar-toggle coral-menubar-collapse'><a href='javascript:void(0)' class='coral-menubar-collapseButton "+this.options.collapseIcon+"'></a></div>")
            	.insertAfter(this.element);
            }
            var that=this;
            this.component().find(".coral-menubar-collapseButton").click(function(){
            	if ($(this).hasClass(that.options.collapseIcon)){
            		$(this).removeClass(that.options.collapseIcon).addClass(that.options.expandIcon);
            		$(this).parents(".coral-menu").removeClass("coral-menu-min").addClass("coral-menu-min");
            	} else if ($(this).hasClass(that.options.expandIcon)){
            		$(this).removeClass(that.options.expandIcon).addClass(that.options.collapseIcon)
            		$(this).parents(".coral-menu").removeClass("coral-menu-min");
            	}
            })
            if(this.options.firstIsactive){
            	var menuItem = this.element.find("li") ;
            	menuItem=menuItem.filter(function(i){
            		if ($(menuItem[i]).hasClass("coral-menu-parent")){
            			return false;
            		} else return true;
            	})
            	var menuItemLink = $(menuItem.get(0)).children("a");
            	menuItemLink.data("isactive",true)
            	this.setMenuItemIsactive(menuItemLink);
            }
            if (this.options.openFirst) {
            	var menuItem = this.element.find("li:first") ;
            	
            	var menuItemLink = menuItem.children("a");
            	menuItemLink.next("ul.coral-menu-child").css({"display":"block"});
            }
        },
        _setOption: function(key,value) {
        	this._super(key, value);
        	if (key=="minmenu") {
        		if (value) {
        			this.component().removeClass("coral-menu-min").addClass("coral-menu-min");
        		} else if (!value) {
        			this.component().removeClass("coral-menu-min");
        		}
        	}
        },
        _showSubmenu: function(menuitem, submenu) {
            var win = $(window),
            submenuOffsetTop = null,
            submenuCSS = {
                'z-index': ++$.coral.zindex
            };

            if(menuitem.parent().hasClass('coral-menu-child')) {
            	submenuCSS.left = menuitem.outerWidth();
                submenuCSS.top = 0; 
                submenuOffsetTop = menuitem.offset().top - win.scrollTop();
            } 
            else {
                submenuCSS.left = 0;
                if (menuitem.parent().parent().hasClass("coral-menu-min")){
                	submenuCSS.top = menuitem.outerHeight()+37; 
                } else {
                	submenuCSS.top = menuitem.outerHeight()
                }
                submenuOffsetTop = menuitem.offset().top + submenuCSS.top - win.scrollTop();
            }

            //adjust height within viewport
            submenu.css('height', 'auto');
            if((submenuOffsetTop + submenu.outerHeight()) > win.height()) {
                submenuCSS.overflow = 'auto';
                submenuCSS.height = win.height() - (submenuOffsetTop + 20);
            }
            submenu.css(submenuCSS).show();
        }       
    });



/*
 * CoralUI SlideMenu component
 */



    $.component("coral.slidemenu", $.coral.basemenu, {
                
        _create: function() {
        	//this.options.popup=false;
        	this._generateULContent();
            
            this._render();
        
            //elements
            this.rootList = this.element;
            this.content = this.element.parent();
            this.wrapper = this.content.parent();
            this.container = this.wrapper.parent();
            this.submenus = this.container.find('ul.coral-menu-list');
            
            this.links = this.element.find('a.coral-menuitem-link:not(.coral-state-disabled)');
            this.backward = this.wrapper.children('div.coral-slidemenu-backward');

            //config
            this.stack = [];
            this.jqWidth = this.container.width();

            var $this = this;

            if(!this.element.hasClass('coral-menu-dynamic')) {
                this._applyDimensions();
            }
            this._super();

            this._bindEvents();
        },
        
        _render: function() {
        	var $this=this;
            this.element.addClass('coral-menu-list coral-helper-reset').
                    wrap('<div class="coral-menu coral-slidemenu coral-component coral-component-content coral-corner-all coral-helper-clearfix"/>').
                    wrap('<div class="coral-slidemenu-wrapper" />').
                    after('<div class="coral-slidemenu-backward coral-component-header coral-corner-all coral-helper-clearfix">\n\
                    <span class="coral-icon coral-icon-triangle-1-w"></span>Back</div>').
                    wrap('<div class="coral-slidemenu-content" />');
            
            this.element.parent().uniqueId();
            this.options.id = this.element.parent().attr('id');
          
            this.element.find('li').each(function() {
                    var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');
                     //禁用个别菜单
                    $this._setMenuItemLinkDisabled(menuitemLink);
                    
                    menuitemLink.addClass('coral-menuitem-link coral-corner-all').contents().wrap('<span class="coral-menuitem-text" />');
                    
                    if(icon) {
                        menuitemLink.prepend('<span class="menu-icon ' + icon + '"></span>');
                    }
                    
                    listItem.addClass('coral-menuitem coral-component coral-corner-all');
                    if(listItem.children('ul').length > 0) {
                        listItem.addClass('coral-menu-parent');
                        listItem.children('ul').addClass('coral-component-content coral-menu-list coral-corner-all coral-helper-clearfix coral-menu-child coral-shadow');
                        menuitemLink.prepend('<span class="menu-rightArrow cui-icon-arrowDown1"></span>');
                    }
                
            
            });
        },
              
        _bindEvents: function() {
            var $this = this;
            
            //为每个菜单绑定点击事件
            this._bindMenuItemClick($this)

            this.links.on('mouseenter.coral-menu',function() {
               $(this).addClass('coral-state-hover'); 
            })
            .on('mouseleave.coral-menu',function() {
               $(this).removeClass('coral-state-hover'); 
            })
            .on('click.coral-menu',function() {
               var link = $(this),
               submenu = link.next();

               if(submenu.length == 1) {
                   $this._forward(submenu);
               }
            });

            this.backward.on('click.coral-menu',function() {
                $this._back();
            });
       },

       _forward: function(submenu) {
            var $this = this;

            this._push(submenu);

            var rootLeft = -1 * (this._depth() * this.jqWidth);

            submenu.show().css({
                left: this.jqWidth
            });

            this.rootList.animate({
                left: rootLeft
            }, 300, 'easeInOutCirc', function() {
                if($this.backward.is(':hidden')) {
                    $this.backward.fadeIn('fast');
                }
            });
       },

       _back: function() {
            var $this = this,
            last = this._pop(),
            depth = this._depth();

            var rootLeft = -1 * (depth * this.jqWidth);

            this.rootList.animate({
                left: rootLeft
            }, 300, 'easeInOutCirc', function() {
                last.hide();

                if(depth === 0) {
                    $this.backward.fadeOut('fast');
                }
            });
       },

       _push: function(submenu) {
             this.stack.push(submenu);
       },
    
       _pop: function() {
             return this.stack.pop();
       },

       _last: function() {
            return this.stack[this.stack.length - 1];
        },

       _depth: function() {
            return this.stack.length;
        },

       _applyDimensions: function() {
            this.submenus.width(this.container.width());
            this.wrapper.height(this.rootList.outerHeight(true) + this.backward.outerHeight(true));
            this.content.height(this.rootList.outerHeight(true));
            this.rendered = true;
        },

       show: function() {                
            this.align();
            this.container.css('z-index', ++$.coral.zindex).show();

            if(!this.rendered) {
                this._applyDimensions();
            }
        }        
    });




/**
 * CoralUI Context Menu component
 */



    $.component("coral.contextmenu", $.coral.tieredmenu, {
        
        options: {
            autoDisplay: true,
            target: null,
            event: 'contextmenu'
        },
        
        _create: function() {
        	//this._generateULContent();
            this._super();
            this.element.parent().removeClass('coral-tieredmenu').
                    addClass('coral-contextmenu coral-menu-dynamic coral-shadow coral-contextmenu');
            
            var $this = this;
			//处理如果是字符串的target属性
            this.options.target = typeof this.options.target==="string" ?$('#'+this.options.target):this.options.target
            this.options.target = this.options.target||$(document);

            if(!this.element.parent().parent().is(document.body)) {
                this.element.parent().appendTo('body');
            }
            
            this.options.target.on(this.options.event + '.coral-contextmenu' , function(e){
                    $this.show(e);
            });   
        },        

        _bindItemEvents: function() {
            this._super();

            var $this = this;

            //hide menu on item click
            this.links.bind('click', function() {
            	// lihaibo add
            	/*if ($(this).siblings("ul").length != 0) {
            		return ;
            	} */ 
            	//
            	if($(this).parent().hasClass("coral-menu-parent"))
            		return false;
            	$this._hide();
            });
        },

        _bindDocumentHandler: function() {
            var $this = this;

            //hide overlay when document is clicked
            $(document.body).bind('click.coral-contextmenu', function (e) {
                if($this.element.parent().is(":hidden")) {
                    return;
                }
                // lihaibo 注释                
                $this._hide();
                //
            });
        },

        show: function(e) { 
        	if(this.options.disabled===true){
        		e.preventDefault();
           		e.stopPropagation();
        		return;
        	}
            //hide other contextmenus if any
            $(document.body).children('.coral-contextmenu:visible').hide();

            var win = $(window),
            left = e.pageX,
            top = e.pageY,
            width = this.element.parent().outerWidth(),
            height = this.element.parent().outerHeight();

            //collision detection for window boundaries
            if((left + width) > (win.width())+ win.scrollLeft()) {
                left = left - width;
            }
            if((top + height ) > (win.height() + win.scrollTop())) {
                top = top - height;
            }

            if(this.options.beforeShow) {
                this.options.beforeShow.call(this);
            }

            this.element.parent().css({
                'left': left,
                'top': top,
                'z-index': ++$.coral.zindex
            }).show();

            e.preventDefault();
            e.stopPropagation();
        },

        _hide: function() {
            var $this = this;

            //hide submenus
            this.element.parent().find('li.coral-menuitem-active').each(function() {
                $this._deactivate($(this), true);
            });

            this.element.parent().fadeOut('fast');
        },

        isVisible: function() {
            return this.element.parent().is(':visible');
        },

        getTarget: function() {
            return this.jqTarget;
        }              
              
    });


/**
 * CoralUI NavigateMenuBase component
 */


    $.component("coral.navigatemenubase", $.coral.basemenu, {
        
        options: {
            autoDisplay: true    
        },
        
        _create: function() {
        	       	
        	this._generateULContent();
        	
            this._render();
            
            this.links = this.element.find('.coral-menuitem-link:not(.coral-state-disabled)');

            this._bindEvents();
            
            this._super();
        },
                
        _render: function() {
        	var $this=this;
            this.element.addClass('coral-menu-list coral-helper-reset').
                    wrap('<div class="coral-tieredmenu coral-menu coral-component coral-component-content coral-corner-all coral-helper-clearfix" />');
            
            this.element.parent().uniqueId();
            this.options.id = this.element.parent().attr('id');
          
            this.element.find('li').each(function() {
                    var listItem = $(this),
                    menuitemLink = listItem.children('a'),
                    icon = menuitemLink.data('icon');
                    //禁用个别菜单
                    $this._setMenuItemLinkDisabled(menuitemLink);
                     
                    menuitemLink.addClass('coral-menuitem-link coral-corner-all').contents().wrap('<span class="coral-menuitem-text" />');
                    
                    if(icon) {
                        menuitemLink.prepend('<span class="menu-icon ' + icon + '"></span>');
                    }
                    
                    listItem.addClass('coral-menuitem coral-component coral-corner-all');
                    if(listItem.children('ul').length > 0) {
                        listItem.addClass('coral-menu-parent');
                        //子菜单不会移动
                        listItem.css('position','static');
                        //子菜单宽度100%
     					listItem.children('ul').css('width','100%');
     					//子菜单底部对齐
     					//listItem.children('ul').css('margin-top','0px');
     					//子菜单横排
     					listItem.find('ul li').css('width','auto');
     					//子菜单A元素宽度自适应
     					listItem.find('ul li a').css('width','auto');
                        listItem.children('ul').addClass('coral-component-content coral-menu-list coral-corner-all coral-helper-clearfix coral-menu-child coral-shadow');
                        menuitemLink.prepend('<span class="menu-rightArrow cui-icon-arrowDown1"></span>');
                    }
                
            
            });
        },
                
        _bindEvents: function() {        
            this._bindItemEvents();
        
            this._bindDocumentHandler();
        },
    
        _bindItemEvents: function() {
            var $this = this;
            
            //为每个菜单绑定点击事件
            this._bindMenuItemClick($this);

           
            this.links.on('mouseenter.coral-menu',function() {
            	if($this.options.disabled===true){
            		return ;
            	}
                var link = $(this),
                menuitem = link.parent(),
                autoDisplay = $this.options.autoDisplay;

                var activeSibling = menuitem.siblings('.coral-menuitem-active');
                if(activeSibling.length === 1) {
                    $this._deactivate(activeSibling);
                }

                if(autoDisplay||$this.active) {
                	
                    if(menuitem.hasClass('coral-menuitem-active')) {
                        $this._reactivate(menuitem);
                    }
                    else {
                        $this._activate(menuitem);
                    }  
                }
                else {
                    $this._highlight(menuitem);
                }
            });

            if(this.options.autoDisplay === false) {
                this.rootLinks = this.element.find('> .coral-menuitem > .coral-menuitem-link');
                this.rootLinks.data('primecoral-tieredmenu-rootlink', this.options.id).find('*').data('primecoral-tieredmenu-rootlink', this.options.id);

                this.rootLinks.on('click.coral-menu', function(e) {
                    var link = $(this),
                    menuitem = link.parent(),
                    submenu = menuitem.children('ul.coral-menu-child');

                    if(submenu.length === 1) {
                        if(submenu.is(':visible')) {
                            $this.active = false;
                            $this._deactivate(menuitem);
                        }
                        else {                                        
                            $this.active = true;
                            $this._highlight(menuitem);
                            $this._showSubmenu(menuitem, submenu);
                        }
                    }
                });
            }
            
            this.element.parent().find('ul.coral-menu-list').on('mouseleave.coral-menu', function(e) {
                if($this.activeitem) {
                	//禁止隐藏
                    //$this._deactivate($this.activeitem);

                }
                e.stopPropagation();
            });
        },
       
        _bindDocumentHandler: function() {
            var $this = this;

            $(document.body).on('click.coral-menu ', function(e) {
                var target = $(e.target);
                if(target.data('primecoral-tieredmenu-rootlink') === $this.options.id) {
                    return;
                }
                //如果点击checkbox不要隐藏菜单
                if(target.is("[type='checkbox']"))return ;  
                $this.active = false;

                $this.element.find('li.coral-menuitem-active').each(function() {
                	//fixmenu来隐藏
                	if($this.options.fixmenu==="false"){
                    	$this._deactivate($(this), true);
                	}
                });
            });
        },
    
        _deactivate: function(menuitem, animate) {
            this.activeitem = null;
            menuitem.children('a.coral-menuitem-link').removeClass('coral-state-hover');
            menuitem.removeClass('coral-menuitem-active');

            if(animate)
                menuitem.children('ul.coral-menu-child:visible').fadeOut('fast');
            else
                menuitem.children('ul.coral-menu-child:visible').hide();
        },
        _activate: function(menuitem) {
            this._highlight(menuitem);

            var submenu = menuitem.children('ul.coral-menu-child');
            if(submenu.length === 1) {
                this._showSubmenu(menuitem, submenu);
            }
        },

        _reactivate: function(menuitem) {
            this.activeitem = menuitem;
            var submenu = menuitem.children('ul.coral-menu-child'),
            activeChilditem = submenu.children('li.coral-menuitem-active:first'),
            _self = this;

            if(activeChilditem.length === 1) {
                _self._deactivate(activeChilditem);
            }
        },

        _highlight: function(menuitem) {
            this.activeitem = menuitem;
            menuitem.children('a.coral-menuitem-link').addClass('coral-state-hover');
            menuitem.addClass('coral-menuitem-active');
        },
                
        _showSubmenu: function(menuitem, submenu) {
        	//禁用对trigger的事件触发
            if(this.options.disabled===true)return ;
            submenu.css({
                'left': menuitem.outerWidth(),
                'top': 0,
                'z-index': ++$.coral.zindex
            });

            submenu.show();
        }
            
    });



/**
 * CoralUI Navigate menu component
 */


    $.component("coral.navigatemenu",$.coral.navigatemenubase, {
        
        options: {
            autoDisplay: true,
            checkable : null,//是否支持多选
            fixmenu : null//是否固定底层菜单
        },
        //重写，递归调用改为只解析2层
        _generateHTML : function(html,data){
        	html+="<ul>";
	        for(var i=0;i<data.length;i++){
				html+="<li>"
				html+=this._generateANode(data[i]);
				var name=data[i].name;
				var items=data[i].items;
				if(items.length>0){
					html=this._generateLast(html,items,name);
				}
				html+="</li>"
			}
			html+="</ul>";
			return html;
        },
        //解析下层
        _generateLast : function(html,data,name){
        	html+="<ul>";
	        for(var i=0;i<data.length;i++){
				html+="<li>"
				html+=this._generateChbNode(data[i],name);
				html+="</li>"
			}
			html+="</ul>";
			return html;
        },
        //增加checkbox
        _generateChbNode : function(node,gname){
        	var str="<a";
			if(node.iconclass!=""){
				//str+=" data-icon='"+node.iconclass+"'";
			}
			if(node.name!=""){
				str+=" data-name='"+node.name+"'";
			}
			if(node.disabled!=""){
				str+=" data-disabled='"+node.disabled+"'";
			}
			if(node.url!=""){
				str+=" href='"+node.url+"'";
			}
			if(node.target!=""){
				str+=" target='"+node.target+"'";
			}
			str+=">";
			var checked=node.checked===true?"checked":"";
			var dis=node.disabled=="true"?"disabled=true":"";
			var chkstr="<input type='radio' "+dis+" name='"+gname+"' "+checked+" data-id='"+this.element[0].id+"_"+node.name+"'/>";
			if(this.options.checkable===true){
				chkstr="<input type='checkbox' "+dis+" "+checked+" data-id='"+this.element[0].id+"_"+node.name+"'/>";
			}
			str+=chkstr;
			if(node.name!=""){
				str+=node.name;
			}
			str+="</a>"
			return str;
        },
        _create: function() {
        	this._super();
            this.element.parent().removeClass('coral-tieredmenu').addClass('coral-navigatemenu');

            if(this.options.fixmenu!=="false"){
            	//设置主菜单的高度
            	var ulHeight=$(this.links[0]).parent(":first").find("ul").outerHeight();
            	var divHeight=this.element.parent().outerHeight();
            	this.element.parent().outerHeight(ulHeight+divHeight-3);
            }
            if(this.options.fixmenu!=="false"){
            	//激活第一个菜单
            	this._activate($(this.links[0]).parent());
            	//设置第一个菜单高度 修正ie8下高度为0px
            	$(this.links[0]).parent(":first").find("ul").css("height","auto");
            }
        },
        _showSubmenu: function(menuitem, submenu) {
            var win = $(window),
            submenuOffsetTop = null,
            submenuCSS = {
                'z-index': ++$.coral.zindex
            };

            if(menuitem.parent().hasClass('coral-menu-child')) {
                submenuCSS.left = menuitem.outerWidth();
                submenuCSS.top = 0; 
                submenuOffsetTop = menuitem.offset().top - win.scrollTop();
            } 
            else {
                submenuCSS.left = 0;
                submenuCSS.top = this.element.parent().outerHeight(); 
                submenuOffsetTop = menuitem.offset().top + submenuCSS.top - win.scrollTop();
            }

            //adjust height within viewport
            submenu.css('height', 'auto');
            if((submenuOffsetTop + submenu.outerHeight()) > win.height()) {
                submenuCSS.overflow = 'auto';
                submenuCSS.height = win.height() - (submenuOffsetTop + 20);
            }
            submenu.css(submenuCSS).show();
        },
        //勾选菜单
        check : function(name,checked){
			$("[data-id='"+this.element[0].id+"_"+name+"']").prop("checked",checked);
        }
    });

// noDefinePart
} ) );