( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
            "./autocomplete",
			"./autocompletetree",
			"./combobox",
			"./combotree", 
			"./button",
			"./combogrid",
	        "./checkbox", 
		    "./checkboxlist", 
			"./datepicker", 
			"./radio",
			"./radiolist", 
			"./spinner",
			"./textbox",
			"./colorpicker"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.component ( "coral.toolbar", {
	version: "4.0.2",
	castProperties: ["data","dataCustom","dropdownOptions"],
	options: {
		/* default options */
		clickToDisplay : 1,
		id: null,
		name: null,
		dataCustom: {},
		responsive: true,
		disabled: false,
		cls: null,
		url: null, 
		title : false,
		method: "get",
		data: null,
		width: "auto",
		height: null,
		isOverflow: true, // 是否自适应
		// 配置自适应时下拉选项
		dropdownOptions: {
			button: {
				text: false, // 默认不显示文字
				label: "更多" // 配置自适应时下拉按钮的文本
			},
			panelPosition: { // 配置下拉按钮的下拉面板相对于下拉按钮的position
				my: "right top",
				at: "right bottom"
			},
			atGroup: 0 //配置自适应时下拉按钮的位置所属的组别（0, 1, 2）
      	},
		align: 0, // 单组的时候，设置水平居左中右（"left", "center", "right"）
		autoDisplay: false, // 显示具有子菜单的按钮时，是否自动显示
		margin: 5, // define item与item之间的距离			
		/* default events */
		onCreate: null,
		onClick: null,
		onLoad: null // 数据加载回调事件
	},	
	/**
	 * 合并两个 $dom 集合
	 * @param: $d1 / $d2 {$dom}
	**/
	_jion: function($d1, $d2) {
		var $d = [];

		$.each($d1, function(i, d) {
			$d.push( $(d) );
		});
		$.each($d2, function(i, d) {
			$d.push( $(d) );
		});

		return $d;
	},
	/**
		hide all tieredmenus
	**/
	_hideMenus: function() {
		$(".coral-tieredmenu").hide();
	},
	/**
	 * create
	 */
	_create: function () {
		var that = this;
		this.isLoaded = false;
		// save sum of groups
		this.groupLength = 1;
		
		this._initElements();
		this._bindEvents();
	},
	//!-- extend api 
	_bindEvents: function () {
		var that = this;

		 // Clicks outside of a grid cancel any edit row
		this._on( this.document, {
			mousedown: function( event ) {
				if ( that.options.clickToDisplay == 1 && that.options.autoDisplay  ) {
					that.uiBox.toggleClass("coral-toolbar-click-active", false);
				}
			}
		});
	},
	/**
	 * initialize elements
	 */
	_initElements: function () {
		var that = this,
			options = this.options;
		
		this.uiBox = $( "<div class=\"coral-toolbar\"></div>" );
		this.uiBorder =  $( "<div class=\"coral-toolbar-border\"></div>" );
		this.uiBox.append( this.uiBorder );
		this.uiBox.insertAfter( this.element );
		this.element.appendTo( this.uiBorder );
		
		if(typeof this.element.attr("id") != "undefined"){
    		this.options.id = this.element.attr("id");
    	} else if (this.options.id){
    		this.element.attr("id", this.options.id);
    	}
    	if(typeof this.element.attr("name") != "undefined") {
    		this.options.name = this.element.attr("name");
    	} else if (this.options.name){
    		this.element.attr("name", this.options.name);
    	}

    	// 添加自适应时，需要用到的下拉按钮，默认隐藏
    	//var dropdownLabel = this.options.dropdownOptions.button.label;
    	//if ( !dropdownLabel ) dropdownLabel = "更多";
    	this.uiAfter = $("<button type='button' data-frozen='true' class='coral-toolbar-after-element ctrl-toolbar-element'></button>")
    		/*.appendTo(this.uiBox)	*/    		
    		.menubutton({
    			label: this.options.dropdownOptions.button.label,
    			text: this.options.dropdownOptions.button.text,
    			renderType: "button",
    			icons: "cui-icon-arrow-down3 right",
    			data: [],
    			position: this.options.dropdownOptions.panelPosition
    		});
		this.uiAfter.menubutton("component").addClass("coral-toolbar-item coral-toolbar-after");
		this.uiAfter.menubutton("hide");

		this._loadData();
		if(this.options.width){
			this.uiBox.css({
				"width":this.options.width
			})
		}
		if ( this.options.clickToDisplay == 0 ){
			this.uiBox.addClass("coral-toolbar-click-active");				
		}
	},
	reload: function (url) {
		this.isLoaded = false;
		this.groupLength = 1;
		var opts = this.options;
		if ( typeof( url ) !== "string" ) {
			opts.data = url;
		} else {
			opts.url = url;
		}
		this.element.html("");
		this.uiAfter = $("<button type='button' data-frozen='true' class='coral-toolbar-after-element ctrl-toolbar-element'></button>")
		.menubutton({
			label: this.options.dropdownOptions.button.label,
			text: this.options.dropdownOptions.button.text,
			renderType: "button",
			icons: "cui-icon-arrow-down3 right",
			data: [],
			position: this.options.dropdownOptions.panelPosition
		});
		this.uiAfter.menubutton("component").addClass("coral-toolbar-item coral-toolbar-after");
		this.uiAfter.menubutton("hide");
		this._loadData();
	},
	/**
	 * load json data from options.url or options.data
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
	 * initialize json data
	 */
	_initData: function (data) {
		var that = this;
		
		if (typeof data === "object") {
			this._addItems(null, data); // index = null 代表尾部直接添加
			this._trigger("onLoad", null, {});
			this.isLoaded = true;
			// 处理冻结项
			this._setFrozenElements();
			// 给元素定位
			this._position();
		}

		if ( this.options.disabled ) {
			this._setDisabled( this.options.disabled );
		}
	},
	/**
	 * 增加子项内部处理方法
	 * @param index{number}：0 ~ length,字符型数字,null代表尾部直接添加
	 * @param data {json object{} or array[]} : 子项数据对象
	 * @return ;
	 */
	_addItems: function (index, data, groupIndex) {
		if (typeof data !== "object") return ;
		
		var that = this,
			items = [],
			len = data.length;
		
		for (var i = 0; i < len; i++) {
			var itemData = data[i];
			
			if ( itemData == "" || !$.isEmptyObject( itemData ) ) {
				items.push( that._createItem(itemData) );
			}
		}

		this._appendItems(index, items, groupIndex);
		this._initItems(items);
		/* 如果没有定义 "more" 则添加到末尾 */
		if ( !this.element.find(".coral-toolbar-after-element").length ) {
			var groupName = this._getGroupNameByIndex( this.options.dropdownOptions.atGroup );
			var $group = this.element.find("[group-role='"+groupName+"']");
			
			if ( $group.length ) {
				$group.after(this.uiAfter.menubutton("component"))
			} else {
				this.element.append(this.uiAfter.menubutton("component"));
			}
		}
	},
	/**
	 * create a toolbar item
	 * @param itemData{json object}:子项数据对象
	 * @return {jquery object{}};
	 */
	_createItem: function (itemData) {
		var that = this,
			data = itemData,
			type = itemData.type || "button",
			opts = null;
		// 分隔符 和 分组符
		if (itemData === "-") {
			type = "seperator";
		} else if (itemData === "->") {
			type = "grouper";
		} else if (itemData === "") {
			type = "blank";
		} else if (itemData === "more") {
			type = "more";
		}
			
		var $el = this._createEl(type);
		
		//delete itemData.type;
		opts = itemData;
		//itemData.type = type;
		// 兼容以前的写法，如果以前写的是icon，而不是icons，则处理成现在的button的icons属性
		if (type === "button" && typeof itemData.icon !== "undefined" && itemData.icon != "") {
			var icons = this._getIcon(itemData.icon);
			delete opts.icon;
			if (null != icons.ico1 && null == icons.ico2) {
				opts["icons"] = icons.ico1;
			} else if (null == icons.ico1 && null != icons.ico2) {
				opts["icons"] = icons.ico2 + " right";
			} else if (null != icons.ico1 && null != icons.ico2) {
				opts["icons"] = icons.ico1 + " left, " + icons.ico2 + " right";
			}
		}
		
		return {
			$el: $el, // item jquery element of coral
			coralType: type, // coral type
			options: opts // coral init options
		}
	},
	/**
	 * 处理 align （单组的情况下）
	 */
	_align: function() {
		// 只有在单组的时候处理水平位置
		if ( this.groupLength != 1 ) return ;
		
		var opts = this.options;
		
		if ( opts.align == "center" ) {
			var $grouperLeft = this._createEl("grouper").attr("grouper-role", "center"),
				$grouperRight = this._createEl("grouper").attr("grouper-role", "right");
			
			this.element.prepend($grouperLeft);
			this.element.find("[group-role='left']")
						.removeClass("group-left")
						.addClass("group-center")
						.attr("group-role", "center");				
			this.element.find(".ctrl-toolbar-element")
						.attr("group", "center");
			this.element.append($grouperRight);
		} else if ( opts.align == "right") {
			var $grouperRight = this._createEl("grouper").attr("grouper-role", "right");
			this.element.find("[group-role='left']")
						.removeClass("group-left")
						.addClass("group-right")
						.attr("group-role", "right");
			this.element.find(".ctrl-toolbar-element")
						.attr("group", "right");
			this.element.prepend($grouperRight);
		}
	},
	/**
	 * 根据索引增加子项到页面
	 * @param index{number}：0 ~ length,字符型数字,null代表尾部直接添加
	 * @param items {json object{}} : 子项数据对象
	 * @return ;
	 */
	_appendItems: function (index, items, groupIndex) {
		var that = this;

		if ( !this.isLoaded ) {
			var grouperIndex = 0;
			var grouper = that._createGrouper(grouperIndex, this.groupLength);
			this.element.append(grouper);
			
			$.each(items, function(i, d) {
				if ( d.coralType == "grouper" ) {
					grouperIndex += 1;
					grouper = that._createGrouper(grouperIndex, that.groupLength);
					that.element.append(d.$el.attr("grouper-role", grouper.attr("group-role")));
					that.element.append(grouper);
				} else {
					// 给项分配组别
					grouper.append(d.$el.attr("group", grouper.attr("group-role")));
					// 如果有冻结项，则标识 data-frozen 为 true
					if ( d.options && d.options.frozen == true) {
						d.$el.attr("data-frozen", true);
					}
				}
			});
			// 水平居位处理
			this._align();
		} else {
			var groupName = this._getGroupNameByIndex(groupIndex);
			var $group = this.element.find("[group-role='"+ groupName +"']");
			var innerLength = $group.find(".ctrl-toolbar-element:not(.coral-toolbar-separator)").length;
			
			if ( null == index || index == innerLength ) {
				for (var i in items) {
					items[i].$el.attr("group", groupName);
					items[i].$el.appendTo($group);
				}
			} else if ( index == 0 ) {
				for (var j in items) {
					items[j].$el.attr("group", groupName);
					items[j].$el.prependTo($group);
				}
			} else {
				for (var k in items) {
					items[k].$el.attr("group", groupName);
					var item = $group.find(".ctrl-toolbar-element:eq(" + index + ")");
					var coralType = item.attr("component-role");
					if ( coralType ) {
						item[coralType]("component").before(items[k].$el);
					} else {
						item.before(items[k].$el);
					}
				}
			}
		}
	},
	/**
	 * 初始化添加的项内部组件
	 * @param items {json object{}} : 子项数据对象
	 * @return ;
	 */
	_initItems: function ( items ) {
		var that = this;
		
		for (var i in items) {
			// 如果是 "-" 分隔符，则跳过，不初始化
			if (items[i].coralType === "seperator" || items[i].coralType === "grouper" || items[i].coralType === "blank" || items[i].coralType === "more") {
				continue ;
			}
			var $el = items[i].$el,
				coralType = items[i].coralType.toLowerCase(),
				opts = items[i].options;
			// 给每一个子项的component做标记
			opts.componentCls = " coral-toolbar-item " + opts.componentCls||"";
			if (items[i].coralType === "html") {
				$el.attr("id", opts.id).append(opts.content);
				continue;
			}
			if( that.options.title ){
				opts.title=true;
			}
			$el[coralType](opts);
			
			// listen item's click event and trigger the default click event
			/*var _opts = {} ;				
			_opts[coralType + "onclick"] = function(e,ui) {
    			//that._trigger("onClick", e, ui);
    			//console.log(e);
    			if ( that.uiAfter.length ) {
    				
    				that.uiAfter.menubutton("hidePanel");
    			}
    		};*/
			//that._on( $el, _opts);
			$el.off(".toolbaronclick").on( coralType + "onclick.toolbaronclick", function( e, ui ) {
				ui = ui || {};
				ui.id = ui.id || e.currentTarget.id;
				$(e.currentTarget).attr("component-role") == "splitbutton";
				if ( that.uiAfter.length ) {
					var ctr = $(e.currentTarget).attr("component-role");
					if ( ctr == "splitbutton" 
						|| ctr == "button" ) {
						that.uiAfter.menubutton("hidePanel");
					}
    			}
				// trigger触发一般放在最后，在处理完内部逻辑后调用，因为外部逻辑可能会破坏当前结构；
				that._trigger("onClick", e, ui);
			});
			$el.off(".toolbaronmouseenter").on( coralType + "onmouseenter.toolbaronmouseenter", function( e, ui ) {
				var ctr = $(e.currentTarget).attr("component-role");
				if ( ctr == "splitbutton" 
					|| ctr == "menubutton" ) {
					if ( that.options.clickToDisplay == 0 && that.options.autoDisplay  ) {
						$(e.currentTarget)[ctr]("hideAllMenus");
						$(e.currentTarget)[ctr]("showMenu");
					}
				}
				
			});
		}
	},
	/**
	 * 根据组件类型，创建一个对应的jQuery element
	 * @param coralType(string):组件类型
	 * @return jQuery object
	 */
	_createEl: function (coralType) {
		var $el;
		
		switch(coralType) {
			case "button":
				$el = $("<button type='button'></button>");
				break;
			case "checkbox":
				$el = $("<input type='checkbox' />");
				break;
			case "textbox":
			case "combobox":
				$el = $("<input type='text' />");
				break;
			case "datepicker":
				$el = $("<input type='text' />");
				break;
			case "splitbutton": 
			case "menubutton":
				$el = $("<button type='button'></button>");
				break;
			case "seperator":
				$el = $("<div class='coral-toolbar-item coral-toolbar-separator coral-toolbar-separator-horizontal'></div>");
				break;
			case "grouper":
				this.groupLength += 1;
				$el = $("<div class='coral-toolbar-item coral-toolbar-grouper'></div>");
				break;
			case "html":
			 	$el = $("<div class='coral-toolbar-item coral-toolbar-html'></div>");
			 	break;
			case "blank":
				$el = $("<span class='coral-toolbar-item coral-toolbar-blank'></span>");
				break;
			case "more":
				$el = this.uiAfter.menubutton("component");
				return $el;
				break;
			default:
				$el = $("<span class='coral-toolbar-item'></span>");
				break;
		}
		// 标识是toolbar下的element
		return $el.addClass("ctrl-toolbar-element");
	},		
	/**
	 * 生成分组父元素
	 * @param: index {number}(0, 1, 2)，索引
	 * @param: sum {number}，总分组的数目
	**/
	_createGrouper: function(index, sum) {
		var $grouper = $();

		if (sum == 1 || sum == 3) {
			switch(index) {
				case 0:
					$grouper = $("<span class='coral-toolbar-group group-left' group-role='left'></span>");
					break;
				case 1:
					$grouper = $("<span class='coral-toolbar-group group-center' group-role='center'></span>");
					break;
				case 2:
					$grouper = $("<span class='coral-toolbar-group group-right' group-role='right'></span>");
					break;
				default:
					$grouper = $("<span class='coral-toolbar-group' group-role='default'></span>");
					break;
			}	
		} else if (sum == 2) {
			switch(index) {
				case 0:
					$grouper = $("<span class='coral-toolbar-group group-left' group-role='left'></span>");
					break;
				case 1:
					$grouper = $("<span class='coral-toolbar-group group-right' group-role='right'></span>");
					break;
				default:
					$grouper = $("<span class='coral-toolbar-group' group-role='default'></span>");
					break;
			}	
		}

		return $grouper;
	},
	/**
	 * 根据组别索引获取组别名称
	 */
	_getGroupNameByIndex: function(groupIndex) {
		if (typeof groupIndex !== "number") return "left";
		
		if ( this.groupLength == 1 ) {
			return "left";
		} else if ( this.groupLength == 2 ) {
			return groupIndex == 0 ? "left" : "right"; 
		} else if ( this.groupLength == 3 ) {
			switch (groupIndex) {
				case 0:
					return "left";
				case 1:
					return "center";
				case 2:
					return "right";
			}
		}
	},
	/**
	 * 获取分组符元素
	**/
	_getGrouper: function() {
		return this.element.find(".coral-toolbar-grouper");
	},
	/**
	 * 重置分组符宽度为1，便于计算计算totalWidth（不包括分组符）
	**/
	_resetGrouper: function() {
		var $grouper = this._getGrouper();
		
		if ( $grouper.length ) {
			$grouper.width(1);
		}
	},
	/**
	 *	重置 项 （讲收缩到panel的项还原，并清除绝对定位的样式）
	**/
	_resetToolbarItems: function() {
		var that = this,
			$elements = this._getElements(2);

		this._resetGrouper();
		
		$.each( $elements, function(i, el) {
			var $el = $(el),
				$com = that._getComponentByElement( $el );

			$com.css({
				left: ""
			});

			if ($com.hasClass("coral-menubutton-button-item")) {
				var groupRole = $el.attr("group"),
					$group = that.element.find("[group-role='"+groupRole+"']");

				if ( $group.find("[data-frozen='true']").length ) {
					var $frozenEl = $group.find("[data-frozen='true']:eq(0)");
					var $frozenCom = that._getComponentByElement($frozenEl);
					$frozenCom.before($com.removeClass("coral-menubutton-button-item"));
				} else {
					$group.append($com.removeClass("coral-menubutton-button-item"));
				}
			}
		});
		this.uiAfter.menubutton("hidePanel");
		this.uiAfter.menubutton("hide");

		this.uiBorder.css({
			width: "auto"
		});
	},
	/**
	 *	定位
	**/
	_position: function() {
		if ( !this.element.is(":visible") || !this.options.responsive ) {
			// TODO: 清除 left，并把 panel 内的元素移除来。
			this._resetToolbarItems();
			this.component().addClass("coral-toolbar-initHidden");
			return;
		} else {
			this.component().removeClass("coral-toolbar-initHidden");
		}
		var that = this,
			opts = this.options;
		// 详见方法注释
		this._resetGrouper();

		// 缓存下来totalWidth
		this.totalWidth = this._totalWidth();
		
		if (opts.isOverflow && this.uiBox.width() > 0) {
			// 定位前，先设置border宽度跟component一致，后再调整
			this.uiBorder.width(this.uiBox.width());
		} else {
			this.uiBorder.width( Math.max(this.totalWidth, this.uiBox.width()) );
			//this.uiBorder.width(this.totalWidth);
			//this.uiBox.width(this.totalWidth);
		}
		if(this._toolbarWidth() - this.totalWidth < 0) {
			this.uiAfter.menubutton("show");
			/*this.uiAfter.css("margin-left", opts.margin);
			this.uiBorder.width(this.uiBox.width() - this.uiAfter.width() - opts.margin*2);*/
		} else {
			this.uiAfter.menubutton("hide");
		}

		this._positionItems(this.element);
	},
	/**
		根据浮动的方向，计算每组的定位
	**/
	_positionItems: function($el) {
		var that = this,
			opts = this.options,
			margin = this.options.margin,
			isEnd = false,
			left = 0,
			$lastEl = $(),
			cssStyle = {
				/*margin: "0px",*/
				right: "auto"
			};
		
		this._prePosition();		
		this.element.find(".coral-toolbar-item:not(.coral-state-hidden)").each(function(index, itemEl) {
			var $itemEl = $(itemEl);

			if (isEnd) {
				return true;
			}
			if ($lastEl.length) {
				left = left + $lastEl.outerWidth() + margin;
			}
			cssStyle["left"] = left + "px";
			$itemEl.css(cssStyle);
			$lastEl = $itemEl;
		});	
		// 处理 menubutton，splitbutton 弹出方式
		this._handlerDropdownItems();
	},
	_handlerDropdownItems: function() {
		var that = this,
			$elementsParent = this._filter( this._getElements(0), ".ctrl-init-splitbutton,.ctrl-init-menubutton");
		
		that._hideMenus();
		$.each( $elementsParent, function(i, el) {
			var $el = $(el),
				$com = that._getComponentByElement($el);

			try {
				switch( $el.attr("component-role") ) {
					case "splitbutton":
						if ( $com.hasClass("coral-menubutton-button-item") ) {
							$el.splitbutton("menu").tieredmenu("option", {
								my: "left top",
								at: "right top",
								of: $el.splitbutton("uiDropdownButton")
							});
						} else {
							$el.splitbutton("menu").tieredmenu("option", {
								my: "left top",
								at: "left bottom",
								of: $el
							});
						}
						break;
					case "menubutton":
						if ( $com.hasClass("coral-menubutton-button-item") ) {
							$el.menubutton("menu").tieredmenu("option", {
								my: "left top",
								at: "right top"
							});
						} else {
							$el.menubutton("menu").tieredmenu("option", {
								my: "left top",
								at: "left bottom"
							});
						}
						break;
					default:
						break;
				}
			} catch ( exception ) {
				console.log(" There is a error happened.");
			} finally {
				
			}

		});

	},
	/**
	 * 根据组件原始元素，获取外层元素
	**/
	_getComponentByElement: function($el) {
		var $com = $(),
			type = $el.attr("component-role");
		
		if ( type ) {
			$com = $el[type]("component");
		} else {
			$com = $el;
		}

		return $com ;
	},
	/**
	** @param: $elements {$(dom)}
	** @param: selector {string}
	** return [$dom];
	**/
	_filter: function( $elements, selector ) {
		var $elementsRst = [];

		$.each( $elements, function(i, el) {
			var $el = $(el);

			if ( $el.is(selector) ) {
				$elementsRst.push( $el );
			}
		});

		return $elementsRst ;
	},
	/**
	 *	定位前期准备：将 $dom 所属范围归属好，宽度设置好
	**/
	_prePosition: function() {
		var that = this,
			opts = this.options,
			margin = this.options.margin,
			left = 0,
			isEnd = false,
			addMenuButtons = [],
			$lastEl = $(),
			elements = [];

		if (this.uiAfter.is(":visible")) {
			elements = this._getElements(3);
		} else {
			elements = this._getElements(2);
		}


		var elements = this._jion( that._getFrozenElements(),that._filter(elements, ":not([data-frozen='true'])") ) ;
		
		$.each( elements , function(i, el) {
			var $com = that._getComponentByElement( $(el) );

			var isInner = !$com.hasClass("coral-menubutton-button-item");

			if (isEnd) {
				if (!isInner) return true;
				if ( $com.hasClass("coral-toolbar-grouper") || $(el).attr("data-frozen") == "true" ) return true;
				addMenuButtons.push($com);
				return true;
			}

			if ($lastEl.length && $lastEl.is(":visible")) {
				left = left + $lastEl.outerWidth() + margin;
			}

			if (!isInner) {
				var $group = that.element.find("[group-role='" + $(el).attr("group") + "']");
				if ($group.attr("group-role") == $(el).attr("group") && $group.find("[data-frozen='true']").length) {
					var $frozenEl = $group.find("[data-frozen='true']:eq(0)");
					if ( $frozenEl.attr("component-role") ) {
						$frozenEl[$frozenEl.attr("component-role")]("component").before($com.removeClass("coral-menubutton-button-item"));
					} else {// html元素不是组件，无法调用component方法
						$frozenEl.before($com.removeClass("coral-menubutton-button-item"));
					}
				} else {
					$com.removeClass("coral-menubutton-button-item").appendTo($group);
				}
			}
			if ( left + $com.outerWidth() > that._toolbarWidth() ) {
				isEnd = true;
				if ( $com.hasClass("coral-toolbar-grouper") || $(el).attr("data-frozen") == "true" ) return true;
				if (isInner) {
					addMenuButtons.push($com);
				} else {
					that.uiAfter.menubutton("prepend", $com);
				}
				return true;
			}
			$lastEl = $com;
		});
		// 第一次初始化和刷新时的定位操作不同
		if ( !this.isLoaded ) {
			that.uiAfter.menubutton("append", addMenuButtons);
		} else {
			that.uiAfter.menubutton("prepend", addMenuButtons);
		}
		// 排完所有的元素后，还剩下的宽度给分组符
		this._setGrouperWidth();
	},
	/**
	 * 设置分组符的宽度
	**/
	_setGrouperWidth: function() {
		var $grouper = this._getGrouper();

		var grouperWidth = ( this._toolbarWidth() - this._totalWidth(true, this.uiAfter.is(":visible")) - this.options.margin );
		var leftGroupWidth = this._getWidthByGroupRole("left");
		var rightGroupWidth = this._getWidthByGroupRole("right");
		var leftGrouperWidth = (grouperWidth - leftGroupWidth + rightGroupWidth) / 2;
		var rightGrouperWidth = (grouperWidth - leftGrouperWidth);
		
		if (grouperWidth < 0) {
			$grouper.width(1);
			return ;
		}

		if ( $grouper.length == 1 ) {
			$grouper.width( grouperWidth );
		} else if ( $grouper.length == 2 ) {
			if (leftGrouperWidth > 0 && rightGrouperWidth > 0 && !this.uiAfter.is(":visible")) {
				$( $grouper[0] ).width(leftGrouperWidth + 1);
				$( $grouper[1] ).width(rightGrouperWidth + 1);						
			} else {
				$( $grouper[1] ).width(grouperWidth + 1);
				$( $grouper[0] ).width(1);
			}
		}
	},
	/**
	 * 根据组别，计算内部项宽度之和
	 * @param: groupRole {number}（"left","center","right"）
	**/
	_getWidthByGroupRole: function(groupRole) {
		var opts = this.options,
			width = 0,
			$group = this.element.find("[group-role='" + groupRole + "']"),
			$components = $group.find(".coral-toolbar-item");

		if ( !$group.length || !$components.length) return 0;

		$.each($components, function (i, component) {
			var $component = $(component);

			width += $component.outerWidth() + opts.margin;
			
			if (i == $components.length-1) {
				width -= opts.margin;
			}
		});

		return width;
	},				
	/**
	 * 获取 toolbar 实际宽度
	**/
	_toolbarWidth: function() {
		return this.uiBorder.innerWidth();
	},
	_setFrozenElements: function() {
		var $elements = this._getElements(3),
			flag = false;

		$.each( $elements, function(i, el) {
			var $el = $(el);
			
			if ( $el.hasClass("coral-toolbar-after-element") ) {
				flag = true;
			}
			if ( flag && !$el.hasClass("coral-toolbar-grouper") ) {
				$el.attr("data-frozen", true);
			}
		});
	},
	/**
		获取 frozen（冻结项） 元素
	**/
	_getFrozenElements: function() {
		if ( this.uiAfter.is(":visible") ) {
			return this.element.find("[data-frozen='true']");
		} else {
			return this.element.find("[data-frozen='true']:not(.coral-toolbar-after-element)");
		}			
	},
	/**
		获取 toolbar 项（原始元素）
		@param: type {number}（0-只包括有效项，1-包括分隔符，2-包括分组符，3-包括下拉面板按钮）
	**/
	_getElements: function(type) {
		var $itemsAll = $(),
			$itemsInner = this.element.find(".ctrl-toolbar-element"),
			$itemsOuter = this.uiAfter.menubutton("buttons").find(".ctrl-toolbar-element");

		$itemsAll = this._jion( $itemsInner, $itemsOuter );

		switch(type) {
			case 0: 
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after-element,.coral-toolbar-grouper,.coral-toolbar-separator)");
				break;
			case 1:
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after-element,.coral-toolbar-grouper)");
				break;
			case 2:
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after-element)");
				break;
			case 3:
				break;
			default:
				break;
		}

		return $itemsAll;
	},
	/**
		获取 toolbar 项（外层元素）
		@param: type {number}（0-只包括有效项，1-包括分隔符，2-包括分组符，3-包括下拉面板按钮）
	**/
	_getComponents: function(type, containHidden) {
		var $itemsAll = $(),
			$itemsInner = this.element.find(".coral-toolbar-item"),
			$itemsOuter = this.uiAfter.menubutton("buttonElements");
		
		$itemsAll = this._jion( $itemsInner, $itemsOuter );

		type = type || 1;
		switch(type) {
			case 0: 
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after,.coral-toolbar-grouper,.coral-toolbar-separator)");
				break;
			case 1:
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after,.coral-toolbar-grouper)");
				break;
			case 2:
				$itemsAll = this._filter($itemsAll, ":not(.coral-toolbar-after)");
				break;
			case 3:
				break;
			default:
				break;
		}
		// 如果不包含隐藏元素，则剔除
		if ( !containHidden ) {
			// $itemsAll.filter(".coral-state-hidden");
			$itemAll = this._filter($itemsAll, ".coral-state-hidden");
		}

		return $itemsAll;
	},
	/**
	 * 获取 toolbar 项相加的总宽度
	 * @param: inner {boolean}（true-只计算 border 内的项）
	 */
	getTotalWidth: function(inner) {
		return this._totalWidth(inner);
	},
	/**
	 * 获取 toolbar 项相加的总宽度
	 * @param: inner {boolean}（true-只计算 border 内的项）
	 */
	_totalWidth: function(inner, includeAfter) {
		var that = this,
			opts = this.options,
			totalWidth = 0;
		var $items = $();

		if (includeAfter) {
			$items = this.element.find(".coral-toolbar-item:not(.coral-state-hidden)");
		} else {
			$items = this.element.find(".coral-toolbar-item:not(.coral-state-hidden,.coral-toolbar-after)");
		}
		var $items_buttons = this.uiAfter.menubutton("buttons").find(".coral-toolbar-item:not(.coral-state-hidden)");
		

		$items.each(function(index, item) {
			var $item = $(item);

			totalWidth = totalWidth + $item.outerWidth() + opts.margin;
			if (index == $items.length-1 && !$items_buttons.length) {
				totalWidth = totalWidth - opts.margin;
			}
		});
		if (inner) {
			return totalWidth - opts.margin;
		}

		this.uiAfter.menubutton("showPanel");
		$items_buttons.each(function(index, item) {
			var $item = $(item);

			totalWidth = totalWidth + $item.outerWidth() + opts.margin;
			
			if (index == $items_buttons.length-1) {
				totalWidth = totalWidth - opts.margin;
			}
		});
		this.uiAfter.menubutton("hidePanel");

		return totalWidth;
	},
	//获取icon的两个class
	_getIcon: function ( icoStr ) {
		var ico = { ico1: null, ico2: null },
			icoArray = [],
			icoTrim;
		
		if ( icoStr == null ) {
			return ico;
		}
		
		icoTrim = $.trim( icoStr );
		if ( icoTrim.indexOf( "," ) >= 0 ) {
			icoArray = icoTrim.split( "," );
			
			ico.ico1 = icoArray[0] == "" ? null : icoArray[0];
			ico.ico2 = icoArray[1] == "" ? null : icoArray[1];
		} else {
			ico.ico1 = icoTrim;
		}
		
		return ico;
	},		
	/**
	 * 获取子项长度
	 * @return {number};
	 */
	getLength: function () {
		return this._getElements(0).length;
	},
	/**
	 * 根据id判断是否存在子项
	 * @return {boolean} : true - 存在; false - 不存在
	 */
	isExist: function ( id ) {			
		return this._getSubCoral(id) ? true : false;
	},
	/**
	 *	获取组别的长度
	**/
	_getGroupElementsLength: function(groupIndex) {
		if (typeof groupIndex !== "number" || groupIndex > (this.groupLength-1) ) return ;

		var groupName = this._getGroupNameByIndex(groupIndex);
		var $group = this.element.find("[group-role='"+ groupName +"']");

		return $group.find(".ctrl-toolbar-element:not(.coral-toolbar-separator)").length;
	},
	/**
	 * 增加子项
	 * @param key{number，string}：根按钮索引，或者id
	 * @param data {json object{} or array[]} : 子项数据对象
	 * @return ;
	 */
	add: function(key, data , groupIndex) {
		if (typeof data !== "object") return;
		// 说明传进的参数是id
		if ( typeof key === "string" ) {
			return this._addByParentId( key, data );
		}

		groupIndex = groupIndex || 0;
		var that = this,
			idx = parseInt( key );
		
		if ( ((null != key) && isNaN(idx)) || idx < 0 || idx > this._getGroupElementsLength(groupIndex) ) {
			return ;
		}
		if ( !$.isArray(data) ) {
			data = [data];
		}
		// 如果长度为0，则直接添加在尾部
		if ( 0 == this._getGroupElementsLength(groupIndex) ) {
			key = null;
		}
		this._addItems(key, data, groupIndex);
		this._refresh();
	},
	/**
     * 根据父id添加项
     * @param pid { string } : 父id
     * @param data { {},[{}] } : 要添加的项的数据对象，可为一个菜单，也可为多个菜单
     * @return ;
     */
	_addByParentId: function (pid, data) {
		var pNodeObj = this._getSubCoral(pid);
		
		if (pNodeObj) {
			var $el = pNodeObj.$el;
			switch (pNodeObj.type) {
				case "splitbutton":
					$el.splitbutton("menu").tieredmenu("add", null, data);
					break;
				case "menubutton":
					$el.menubutton("menu").tieredmenu("add", null, data);
					break;
				case "tieredmenu":
					$el.tieredmenu("add", pid, data);
					break;
				default:
					break;
			}
		}
	},
	/**
	 * 根据id或index获取组件对象
	 */
	getSubCoral: function (key) {
		var that = this;
		
		if ( typeof key === "string" ) {
			return that._getSubCoral( key );
		} else {
			return that._getSubCoralByIndex( key );
		}
	},
	/**
	 * 根据index获取组件对象
	 */
	_getSubCoralByIndex: function ( index ){
		var that = this,
			idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		return that._getSubCoral( idx );
		
	},
	/** 
	 *
	**/
	_findElementsByAttr: function($elements, attrName, attrValue) {
		var that = this,
			$elementsResult = [];

		$.each($elements, function(idx, item){
			var $item = $(item);
			
			if ( attrValue == $item.attr(attrName) ) {
				$elementsResult.push($item);
			} 
		});

		return $elementsResult;
	},
	/**
	 * 根据id获取子组件的信息
	 * @param id { string } : id
	 * @return { object } : {$el:组件元素, type:组件类型}
	 */
	_getSubCoral: function(id) {
		var that = this,
			$el = this._findElementsByAttr(this._getElements(0), "id", id),
			type = null,
			$splitItems = this._findElementsByAttr(this._getElements(0), "component-role", "splitbutton"),
			$menuItems = this._findElementsByAttr(this._getElements(0), "component-role", "menubutton"),
			$menuEl = null,
			returnObj = null,
			$item = null;
		
		if (typeof id === "number") {
			$item = $( this._getElements(0)[id] );
			returnObj = {
				$el: $item,
				type: $item.attr("component-role")
			};
			return returnObj;
		}
		if ($el.length) {
			returnObj = {
				$el: $el[0],
				type: $el[0].attr("component-role")
			};
			return returnObj;
		} 
		
		$menuEl = this._findSubCoralInMenuItems( $splitItems, id );
		if ($splitItems.length && $menuEl) {
			returnObj = {
				$el: $menuEl,
				type: "tieredmenu"
			};
			return returnObj;
		} 
		
		$menuEl = this._findSubCoralInMenuItems( $menuItems, id );
		if ($menuItems.length && $menuEl) {
			returnObj = {
				$el: $menuEl,
				type: "tieredmenu"
			};
			return returnObj;
		}
		
		return returnObj;
	},
	/**
	 * 在splitbutton 或者 menubutton 下的menuItems里面找
	 * @param $buttonEls { jquery{} } : 工具条下 splitbuttons 或 menubuttons
	 * @param id { string } : id
	 * @return { jquery{} } : 找到含有id的tieredmenu元素
	 */
	_findSubCoralInMenuItems: function($buttonEls, id) {
		if( !$buttonEls.length ) return;
		var returnObj = null;
		
		$.each($buttonEls, function(index, item) {
			var $item = $(item),
				type = $item.attr("component-role"),
				$menu =  $(item)[type]("menu");
			
			if ($menu.find("[data-id='"+id+"']").length) {
				returnObj = $menu;
			}
		});
		
		return returnObj;
	},
	/**
	 * remove all items
	 * @return ;
	 */
	removeAll: function() {
		var that = this;
		
		$.each(this._getElements(1), function(index, el) {
			var $el = $(el),
				coralType= $el.attr("component-role");
			
			if ( coralType ) {
				$el[coralType]("destroy");
			}		
			
			$el.remove();
		});

		this._refresh();
	},
	/**
     * 根据id或者根子项索引删除项
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	remove: function ( key ) {
		var that = this;
		
		if ( typeof key === "string" ) {
			this._removeById( key );
		} else {
			this._removeByIndex( key );
		}

		this._refresh();
		
	}, 
	/**
	 * 根据id删除项
	 * @param id { string } : id
     * @return ;
	 */
	_removeById: function(id) {			
		var that = this,
			pNodeObj = this._getSubCoral(id);
		
		if (pNodeObj) {
			var $el = pNodeObj.$el;
			if ( $el.hasClass("coral-toolbar-html") ) {
				$el.remove();
				return ;
			}					
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("removeItem", id);
					break;
				default:
					var coralType= $el.attr("component-role");
					
					$el[coralType]("destroy");
					$el.remove();
					break;
			}
		}
	},
	/**
	 * 根据根子项index删除项
	 * @param index { number } :根子项索引
     * @return ;
	 */
	_removeByIndex: function(index) {
		var idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		var $el = $( this._getElements(0)[idx] );
		var coralType= $el.attr("component-role");
		
		if ( coralType ) {
			$el[coralType]("component").remove();
		}
		$el.remove();
	},		
	/**
     * 根据id或者根子项索引修改项的文本
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	update: function ( key, label ) {
		var that = this;
		
		if ( typeof key === "string" ) {
			that._updateById( key, label );
		} else {
			that._updateByIndex( key, label );
		}

		this._refresh();
	},
	/**
	 * 根据id修改项的文本
	 * @param id { string } : id
     * @return ;
	 */
	_updateById: function ( id, label ) {
		var pNodeObj = this._getSubCoral(id);
		if (pNodeObj) {
			var $el = pNodeObj.$el;				
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("updateItem", id, label);
					break;
				case "button":
					$el.button("update", label);
					break;
				case "splitbutton":
					$el.splitbutton("button").button("update", label);
					break;
				case "menubutton":
					$el.menubutton("button").button("update", label);
					break;
				default:
					break;
			}
		}
	},
	/**
	 * 根据根子项index修改项的文本
	 * @param index { number } :根子项索引
     * @return ;
	 */
	_updateByIndex: function ( index, label ) {
		var idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		var pNodeObj = this._getSubCoral(index);			
		if (pNodeObj) {
			var $el = pNodeObj.$el;				
			switch (pNodeObj.type) {
				case "button":
					$el.button("update", label);
					break;
				case "splitbutton":
					$el.splitbutton("button").button("update", label);
					break;
				case "menubutton":
					$el.menubutton("button").button("update", label);
					break;
				default:
					break;
			}
		}
	},
	/**
	 * get coral component
	 */
	component: function () {
		return this.uiBox;
	},
	/**
	 * !-- get coral border
	 */
	_uiBorder: function() {
		return this.uiBorder;
	},
	/**
     * 禁用所有的菜单项
     * @return ;
     */
	disable: function () {
		this._setDisabled(true);
	},
	/**
     * 启用所有的菜单项
     * @return ;
     */
	enable: function () {
		this._setDisabled(false);
	},

	/**
	 * disabled handler code
	 * @param disabled{boolean}: true - disable; false - enable
	 */
	_setDisabled: function(disabled) {
		var that = this;
		
		var $els = this._getElements(0);	
		
		$.each( $els, function(i, el) {
			var $el = $(el);
			if ( $el.hasClass("coral-toolbar-html") ) return true;
			if ( !$el.attr("component-role") ) return;
			if (disabled) {
				$el[$el.attr("component-role")]("disable");
			} else {
				$el[$el.attr("component-role")]("enable");
			}
		});
		
		this.options.disabled = !!disabled;
	},		
	/**
     * 根据id或者根子项索引，禁用
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	disableItem: function ( key ) {
		var that = this;
		
		if ( typeof key === "string" ) {
			that._disableItemById( key );
		} else {
			that._disableItemByIndex( key );
		}
	},
	/**
	 * 根据id，禁用
	 * @param id { string } : id
     * @return ;
	 */
	_disableItemById: function(id) {
		var that = this,
			pNodeObj = this._getSubCoral(id);
		
		if (pNodeObj) {
			var $el = pNodeObj.$el;
			if ( $el.hasClass("coral-toolbar-html") ) return ;
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("disableItem", id);
					break;					
				default:
					var $itemEl = $( this._findElementsByAttr(this._getElements(0),"id", id)[0] );
					if (!$itemEl.length) {
						return ;
					}
					
					$itemEl[$itemEl.attr("component-role")]("disable");
					break;
			}
		}
	},
	/**
     * 根据根子项索引，禁用
     * @param index { number } : 根子项索引
     * @return ;
     */
	_disableItemByIndex: function(index) {
		var that = this,
			idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		var $itemEl = $( this._getElements(0)[idx] );
		if ( $itemEl.hasClass("coral-toolbar-html") ) return false;
		if (!$itemEl.length) {
			return false;
		}
		
		$itemEl[$itemEl.attr("component-role")]("disable");
		return true;
	},
	/**
     * 根据id或者根子项索引，启用
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	enableItem: function ( key ) {
		var that = this;
		
		if (typeof key === "string" ) {
			that._enableItemById( key );
		} else {
			that._enableItemByIndex( key );
		}
	},
	/**
	 * 根据id，启用
	 * @param id { string } : id
     * @return ;
	 */
	_enableItemById: function(id) {
		var that = this,
			pNodeObj = this._getSubCoral(id);
		
		if (pNodeObj) {
			var $el = pNodeObj.$el;	
			if ( $el.hasClass("coral-toolbar-html") ) return ;			
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("enableItem", id);
					break;
				default:
					var $itemEl = $( this._findElementsByAttr(this._getElements(0),"id", id)[0] );
					if (!$itemEl.length) {
						return ;
					}
					
					$itemEl[$itemEl.attr("component-role")]("enable");
					break;
			}
		}
	},
	/**
     * 根据根子项索引，启用
     * @param index { number } : 根子项索引
     * @return ;
     */
	_enableItemByIndex: function(index) {
		var that = this,
			idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		var $itemEl = $( this._getElements(0)[idx] );
		if ( $itemEl.hasClass("coral-toolbar-html") ) return ;
		if (!$itemEl.length) {
			return false;
		}
		
		$itemEl[$itemEl.attr("component-role")]("enable");
		return true;
	},
	/**
     * 根据id或者根子项索引，隐藏
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	hide: function ( key ) {
		var that = this;
		
		if ( typeof key === "string" ) {
			that._hideById( key );
		} else {
			that._hideByIndex( key );
		}

		this._refresh();
	},
	/**
     * 隐藏所有的菜单项
     * @return ;
     */
	hideAll: function() {
		var that = this;

		$.each(this._getElements(1), function(index, el) {
			var type = $(el).attr("component-role");
			
			if ( type ) {
				$(el)[type]("hide");
			} else {
				$(el).hide();
			}
		});

		this._refresh();			
	},
	/**
	 * 根据id，隐藏
	 * @param id { string } : id
     * @return ;
	 */
	_hideById: function(id) {
		var that = this,
			pNodeObj = this._getSubCoral(id);
	
		if (pNodeObj) {
			var $el = pNodeObj.$el;	
			
			if ( $el.hasClass("coral-toolbar-html") ) {
				$el.hide();
				return ;
			}			
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("hideItem", id);
					break;
				default:
					var $itemEl = $( this._findElementsByAttr(this._getElements(0),"id", id)[0] );
					if (!$itemEl.length) return ;
					
					$itemEl[$itemEl.attr("component-role")]("hide");
					break;
			}
		}
	},
	/**
     * 根据根子项索引，隐藏
     * @param index { number } : 根子项索引
     * @return ;
     */
	_hideByIndex: function(index) {
		var that = this,
			idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;

		var $itemEl = $( this._getElements(0)[idx] );
		if (!$itemEl.length) return false;
		
		if ( $itemEl.hasClass("coral-toolbar-html") ) {
			$itemEl.hide();
			return true;
		}
		
		$itemEl[$itemEl.attr("component-role")]("hide");
		return true;
	},
	/**
     * 根据id或者根子项索引，显示
     * @param key { string,number } : id，根子项索引
     * @return ;
     */
	show: function ( key ) {
		var that = this;
		
		if (typeof key === "string" ) {
			that._showById(key);
		} else {
			that._showByIndex(key);
		}
		this._refresh();
	},
	/**
     * 显示所有的菜单项
     * @return ;
     */
	showAll: function() {
		var that = this;

		$.each(this._getElements(1), function(index, el){
			var type = $(el).attr("component-role");
			
			if ( type ) {
				$(el)[type]("show");
			} else {
				$(el).show();
			}
		});

		this._refresh();
	},
	/**
	 * 根据id，显示
	 * @param id { string } : id
     * @return ;
	 */
	_showById: function(id) {
		var that = this,
			pNodeObj = this._getSubCoral(id);
		
		if (pNodeObj) {
			var $el = pNodeObj.$el;	
			if ( $el.hasClass("coral-toolbar-html") ) {
				$el.show();
				return ;
			}				
			switch (pNodeObj.type) {
				case "tieredmenu":
					$el.tieredmenu("showItem", id);
					break;
				default:
					var $itemEl = $( this._findElementsByAttr(this._getElements(0),"id", id)[0] );
					if (!$itemEl.length) return ;
					
					$itemEl[$itemEl.attr("component-role")]("show");
					break;
			}
		}
		
	},
	/**
     * 根据根子项索引，显示
     * @param index { number } : 根子项索引
     * @return ;
     */
	_showByIndex: function(index) {
		var that = this,
			idx = parseInt(index);
		
		if (isNaN(idx) || idx < 0 || idx > (this.getLength() - 1) ) return false;
		
		var $itemEl = $( this._getElements(0)[idx] );
		var type = $itemEl.attr("component-role");
		if (!$itemEl.length) return false;
		
		if ( type ) {
			$itemEl[type]("show");
		} else {
			$itemEl.show();
		} 
		return true;
	},
	_destroy: function() {			
		this.uiBox.replaceWith(this.element);
	},
	/**
	 * set option
	 * @param key {string}:键
	 * @param value {string}:值
	 */
	_setOption: function ( key, value ) {
		var that = this;
		//default option can't be modified
		if (key === "id" || key === "name" ) {
			return;
		}			 		
		if ( key === "disabled" ) {
			this._setDisabled(value);
		}
		this._super( key, value );
	},
	/**
	 * 刷新布局
	**/			
	refresh: function() {
		this._refresh();
	},		
	_refresh: function() {
		this._position();
		$.coral.refreshChild(this.element);
	}
});
// noDefinePart
} ) );