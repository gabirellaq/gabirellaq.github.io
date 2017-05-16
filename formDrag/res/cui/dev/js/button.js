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
/*!
 * 组件库4.0.1：按钮
 *
 * 依赖JS文件:
 *	   jquery.coral.core.js
 *	   jquery.coral.component.js
 */
(function() {

var lastActive,
	baseClasses = "coral-button coral-component coral-state-default coral-corner-all",
	//typeClasses = "coral-button-icons-only coral-button-icon-only coral-button-text-icons coral-button-text-icon-primary coral-button-text-icon-secondary coral-button-text-only",
	typeClasses = "coral-button-text-icons coral-button-text-icon-primary coral-button-text-icon-secondary",
	focusClass = "coral-state-focus",
	formResetHandler = function() {
		var form = $( this );
		setTimeout(function() {
			form.find( ":coral-button" ).button( "refresh" );
		}, 1 );
	},
	radioGroup = function( radio ) {
		var name = radio.name,
			form = radio.form,
			radios = $( [] );
		if ( name ) {
			name = name.replace( /'/g, "\\'" );
			if ( form ) {
				radios = $( form ).find( "[name='" + name + "'][type=radio]" );
			} else {
				radios = $( "[name='" + name + "'][type=radio]", radio.ownerDocument )
					.filter(function() {
						return !this.form;
					});
			}
		}
		return radios;
	};

$.component( "coral.button", {
	version: "4.0.1",
	defaultElement: "<button>",
	castProperties : ["dataCustom","shortCut"],
	options: {
		id: null, // 设置默认的id
		name: null,
		cls: null,
		title : false,
		disabled: null,
		text: true,
		label: null,
		icons: {
			primary: null,
			secondary: null
		},
		type: "button",
		width: null,
		countdown: false,
		countdownTime: 3000,
		showCountdown: true,
		// 事件
		onCreate: null,
		onClick: null,
		onDblClick: null,
		onMouseEnter: null,
		onMouseLeave: null
	},
	_create: function() {		
		// 图标样式转换
		this.options.icons = this._icons();
		this.element.addClass("ctrl-init ctrl-init-button");
		this.element.closest( "form" )
			.unbind( "reset" + this.eventNamespace )
			.bind( "reset" + this.eventNamespace, formResetHandler );

		if ( typeof this.options.disabled !== "boolean" ) {
			this.options.disabled = !!this.element.prop( "disabled" );
		} else {
			this.element.prop( "disabled", this.options.disabled );
		}

		this._determineButtonType();
		this.hasTitle = !!this.buttonElement.attr( "title" )||this.options.title;

		var that = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			activeClass = !toggleButton ? "coral-state-active" : "";
		// js初始化时对id初始化处理
		if (options.id) {
			this.element.attr("id", options.id);
		}
		if (options.name) {
			this.element.attr("name", options.name);
		}
		if ( options.label === null ) {
			options.label = (this.type === "input" ? this.buttonElement.val() : this.buttonElement.html());
		}

		this._hoverable( this.buttonElement );

		this.buttonElement
			.addClass( baseClasses )
			.attr( "role", "button" )
			.bind( "mouseenter" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				if ( this === lastActive ) {
					$( this ).addClass( "coral-state-active" );
				}
				that._trigger("onMouseEnter", null, {"id": this.id, "label": that.options.label});
			}).bind( "mouseleave" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).removeClass( activeClass );
				that._trigger("onMouseLeave", null, {"id": this.id, "label": that.options.label});
			})
			.bind( "click" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				} else {					
					if (options.once) {
						that.element.button("disable");
					}
					if (options.countdown) {
						var wait = options.countdownTime/1000;
						var label;
						if ($("body").find(that.element).length !== 0) {
							label = that.element.button("option", "label");
						}
						function time() {
							if ($("body").find(that.element).length === 0) return;// delay方法调用的时候，元素可能已经不存在了。
							if (wait <= 0) {
								that.element.button("enable");
								// 需要延时处理，否则被禁用的对象无法触发事件
									that.element.button("option", "label", label);
							} else {
								setTimeout(function(){
									if ($("body").find(that.element).length === 0) return;
									that.element.button("option", "label", label + "(" + wait + ")");
								}, 0);
								wait--;
								setTimeout(function() {
									time();
								}, 1000);
							}
						}
						if ($(document).find(that.element).length) {
							that.element.button("disable");
							if (options.showCountdown) {
								time();
							} else {
								that._delay(function(){
									that.element.button("enable");
									that.element.button("option", "label", label);
								}, options.countdownTime);
							}
						}
					}
					that._trigger("onClick", null, {"id": this.id, "label": that.options.label});
				}
			})
			.bind( "dblclick" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				} else {
					that._trigger("onDblClick", null, {"id": this.id, "label": that.options.label});
				}
			});
		
		// Can't use _focusable() because the element that receives focus
		// and the element that gets the coral-state-focus class are different
		this._on({
			focus: function() {
				this.buttonElement.addClass( "coral-state-focus" );
			},
			blur: function() {
				this.buttonElement.removeClass( "coral-state-focus" );
			}
		});
		
		if ( toggleButton ) {
			this.element.bind( "change" + this.eventNamespace, function() {
				that.refresh();
			});
		}

		if ( this.type === "checkbox" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
			});
		} else if ( this.type === "radio" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
				$( this ).addClass( "coral-state-active" );
				that.buttonElement.attr( "aria-pressed", "true" );

				var radio = that.element[ 0 ];
				radioGroup( radio )
					.not( radio )
					.map(function() {
						return $( this ).button( "component" )[ 0 ];
					})
					.removeClass( "coral-state-active" )
					.attr( "aria-pressed", "false" );
			});
		} else {
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).addClass( "coral-state-active" );
					lastActive = this;
					that.document.one( "mouseup", function() {
						lastActive = null;
					});
				})
				.bind( "mouseup" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).removeClass( "coral-state-active" );
				})
				.bind( "keydown" + this.eventNamespace, function(event) {
					var keyCode = $.coral.keyCode;
					if ( options.disabled ) {
						return false;
					}
					if ( event.keyCode === keyCode.SPACE || event.keyCode === keyCode.ENTER ) {
						$( this ).addClass( "coral-state-active" );
					}
					if(options.shortCut){
						$.coral.callFunction(options.shortCut,event,this);
					}
					that._trigger("onKeyDown");
				})
				.bind( "keyup" + this.eventNamespace + " blur" + this.eventNamespace, function() {
					$( this ).removeClass( "coral-state-active" );
				});

			if ( this.buttonElement.is("a") ) {
				this.buttonElement.keyup(function(event) {
					if ( event.keyCode === $.coral.keyCode.SPACE ) {
						$( this ).click();
					}
				});
			}
		}

		if (options.width) {
			this.buttonElement.outerWidth(options.width);
		}
		this._setOption( "disabled", options.disabled );
		this._resetButton();
	},
	_icons: function() {
		var icons   = this.options.icons,
		    iconArr = null, iconstr   = null, 
		    primary = null, secondary = null;
		if (icons && typeof icons === "string") {
			iconArr = icons.split(",");
			if (iconArr.length > 0) {
				iconstr = $.trim(iconArr[0]);
				secondary = cls("right", iconstr);
				if (null === secondary) {
					primary   = cls("left" , iconstr, true);
				}
			}
			if (iconArr.length > 1) {
				iconstr = $.trim(iconArr[1]);
				primary   = ((primary === null) ? cls("left" , iconstr) : primary);
				if (null === secondary) {
					secondary = cls("right", iconstr, true);
				}
			}
		} else { return icons; }
		// 获取css样式
		function cls (position, iconstr, force/*Boolean 强制返回*/) {
			var arr = iconstr.split(" ");
			if ($.inArray(position, arr) > -1) {
				arr = $.grep(arr, function(cls, i) {
					return cls !== position;
				});
				return arr.join(" ");
			}
			if (force) {
				return iconstr;
			}
			return null;
		}
		
		return {"primary": primary, "secondary": secondary};
	},
	_determineButtonType: function() {
		var ancestor, labelSelector, checked;

		if ( this.element.is("[type=checkbox]") ) {
			this.type = "checkbox";
		} else if ( this.element.is("[type=radio]") ) {
			this.type = "radio";
		} else if ( this.element.is("input") ) {
			this.type = "input";
		} else {
			this.type = "button";
		}

		if ( this.type === "checkbox" || this.type === "radio" ) {
			ancestor = this.element.parents().last();
			labelSelector = "label[for='" + this.element.attr("id") + "']";
			this.buttonElement = ancestor.find( labelSelector );
			if ( !this.buttonElement.length ) {
				ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
				this.buttonElement = ancestor.filter( labelSelector );
				if ( !this.buttonElement.length ) {
					this.buttonElement = ancestor.find( labelSelector );
				}
			}
			this.element.addClass( "coral-helper-hidden-accessible" );

			checked = this.element.is( ":checked" );
			if ( checked ) {
				this.buttonElement.addClass( "coral-state-active" );
			}
			this.buttonElement.prop( "aria-pressed", checked );
		} else {
			this.buttonElement = this.element;
		}
	},

	component: function() {
		return this.buttonElement;
	},

	_destroy: function() {
		this.element
			.removeClass( "coral-helper-hidden-accessible" );
		this.buttonElement
			.removeClass( baseClasses + " ui-state-active " + typeClasses )
			.removeAttr( "role" )
			.removeAttr( "aria-pressed" )
			.html( this.buttonElement.find(".coral-button-text").html() );

		if ( !this.hasTitle ) {
			this.buttonElement.removeAttr( "title" );
		}
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "disabled" ) {
			this.component().toggleClass( "coral-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			if ( value ) {
				if ( this.type === "checkbox" || this.type === "radio" ) {
					this.buttonElement.removeClass( "coral-state-focus" );
				} else {
					this.buttonElement.removeClass( "coral-state-focus coral-state-active" );
				}
			}
			return;
		}
		this._resetButton();
	},
	update: function (label) {
		if (typeof label === "string") {
			this.element.find(".coral-button-text").html(label);
		}
	},
	refresh: function() {
		var isDisabled = this.element.is( "input, button" ) ? this.element.is( ":disabled" ) : this.element.hasClass( "coral-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOption( "disabled", isDisabled );
		}
		if ( this.type === "radio" ) {
			radioGroup( this.element[0] ).each(function() {
				if ( $( this ).is( ":checked" ) ) {
					$( this ).button( "component" )
						.addClass( "coral-state-active" )
						.attr( "aria-pressed", "true" );
				} else {
					$( this ).button( "component" )
						.removeClass( "coral-state-active" )
						.attr( "aria-pressed", "false" );
				}
			});
		} else if ( this.type === "checkbox" ) {
			if ( this.element.is( ":checked" ) ) {
				this.buttonElement
					.addClass( "coral-state-active" )
					.attr( "aria-pressed", "true" );
			} else {
				this.buttonElement
					.removeClass( "coral-state-active" )
					.attr( "aria-pressed", "false" );
			}
		}
	},
	_resetButton: function() {
		if ( this.type === "input" ) {
			if ( this.options.label ) {
				this.element.val( this.options.label );
			}
			return;
		}
		var buttonElement = this.buttonElement.removeClass( typeClasses ),
			buttonText = $( "<span></span>", this.document[0] )
				.addClass( "coral-button-text" )
				.html( this.options.label )
				.appendTo( buttonElement.empty() )
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

		if ( icons.primary || icons.secondary ) {
			if ( this.options.text ) {
				buttonClasses.push( "coral-button-text-icon" + ( multipleIcons ? "s" : ( icons.primary ? "-primary" : "-secondary" ) ) );
			}

			if ( icons.primary ) {
				buttonElement.prepend( "<span class='coral-button-icon-primary icon " + icons.primary + "'></span>" );
			}

			if ( icons.secondary ) {
				buttonElement.append( "<span class='coral-button-icon-secondary icon " + icons.secondary + "'></span>" );
			}

			if ( !this.options.text ) {
				buttonClasses.push( multipleIcons ? "coral-button-icons-only" : "coral-button-icon-only" );
				if ( !this.hasTitle ) {
					buttonElement.attr( "title", $.trim( buttonText ) );
				}
			}
		} else {
			buttonClasses.push( "coral-button-text-only" );
		}
		if ( this.hasTitle ) {
			buttonElement.attr( "title", $.trim( buttonText ) );
		}
		buttonElement.addClass( buttonClasses.join( " " ) );
	}
});

$.component( "coral.buttonset", {
	version: "4.0.1",
	options: {
		items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(coral-button)"
	},

	_create: function() {
		this.element.addClass( "coral-buttonset" );
	},

	_init: function() {
		this.refresh();
	},

	_setOption: function( key, value ) {
		if ( key === "disabled" ) {
			this.buttons.button( "option", key, value );
		}
		if ( key === "label" ) {
			this.update(value);
		}
		this._super( key, value );
	},

	refresh: function() {
		var rtl = this.element.css( "direction" ) === "rtl",
			allButtons = this.element.find( this.options.items ),
			existingButtons = allButtons.filter( ":coral-button" );

		// Initialize new buttons
		allButtons.not( ":coral-button" ).button();
		
		// Refresh existing buttons
		existingButtons.button( "refresh" );
		
		this.buttons = allButtons
			.map(function() {
				return $( this ).button( "component" )[ 0 ];
			})
				.removeClass( "coral-corner-all coral-corner-left coral-corner-right" )
				.filter( ":first" )
					.addClass( rtl ? "coral-corner-right" : "coral-corner-left" )
				.end()
				.filter( ":last" )
					.addClass( rtl ? "coral-corner-left" : "coral-corner-right" )
				.end()
			.end();
	},

	_destroy: function() {
		this.element.removeClass( "coral-buttonset" );
		this.buttons
			.map(function() {
				return $( this ).button( "component" )[ 0 ];
			})
				.removeClass( "coral-corner-left coral-corner-right" )
			.end()
			.button( "destroy" );
	}
});

})();
// noDefinePart
} ) );