( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./parser",
			"./core"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
// noDefinePart
(function() {
var uuid = 0,
	slice = Array.prototype.slice;
$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );
$.component = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple components (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Component;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createComponent ) {
			return new constructor( options, element );
		}
		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			if (options && options.noUseParse) {
				options = $.component.extend( {}, $.fn[name].defaults || {}, options );
			} else {
				options = $.component.extend( {}, $.fn[name].defaults || {}, this._parseOptions(element),
						options );
			}
			this._createComponent( options, element );
		}
	};
	// 兼容旧的写法，如果是fill和coral-adjusted都当做是adjusted组件。
	$.uiplugins = $.uiplugins || {};
	if (name && !$.uiplugins.name) {
		if (name == "adjusted") {
			$.uiplugins["fill"] = constructor;
			$.uiplugins["coral-adjusted"] = constructor;
		}
		$.uiplugins["coralui-"+name] = constructor;
	}
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the component later
		_proto: $.extend( {}, prototype ),
		// track components that inherit from this component in case this component is
		// redefined after a component inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.component.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.component.extend( basePrototype, {
		// TODO: remove support for componentEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for components that aren't DOM-based
		componentEventPrefix: existingConstructor ? (basePrototype.componentEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		componentName: name,
		componentFullName: fullName
	});

	// If this component is being redefined then we need to find all components that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this component. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child component using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.component( childPrototype.namespace + "." + childPrototype.componentName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.component.bridge( name, constructor );
	
	return constructor;	
};

$.component.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.component.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.component.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.component.bridge = function( name, object ) {
	var fullName = object.prototype.componentFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// tree的js旧的初始化写法的兼容
		// 旧的初始化参数的第一个参数是option，第二个参数是node
		if (name == 'tree') {
			if (arguments[1]) {
				options.data = arguments[1];
			}
		}
		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.component.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " component instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					/*if ( this.id && typeof (this.id) == "string" ) {
						var $Script = $( "#"+this.id + "_s" );
						if( $Script.length>0 ) {
							$Script.remove();
						}
					}*/
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Component = function( /* options, element */ ) {};
$.Component._childConstructors = [];

$.Component.prototype = {
	componentName: "component",
	componentEventPrefix: "",
	defaultElement: "<div>",
	castProperties: null, /*options中的哪些属性值(字符串)要转换为对象["data","setting.checkalbe"]*/
	options: {
		disabled: false,
		authorized: true,
		rendered: true,
		// callbacks
		onCreate: null
	},
	formFieldArray: [
	    "autocomplete", "autocompletetree", "combobox", "combotree", "combogrid",
	    "checkbox", "checkboxlist", "datepicker", "radio","radiolist", "spinner", "textbox","fileuploader"
    ],
	panelArray: [
	    "accordion", "dialog", "form", "grid", "layout", "panel", "tabs", "toolbar", "splitcontainer", "view", "adjusted"
    ],
    refresh: function() {
    	
    },
  /*  prepareCreate: function(element) {
    	var that = this;
		this.element = $( element );
		if ( element !== this ) {
			$.data( element, this.componentFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}
    },*/
	_createComponent: function( options, element ) {
		var that = this;
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.componentName + this.uuid;
		// 组件身份识别
		if ( !this.element.attr( "component-role" ) ) {
			// TODO: 目前没有好的方案对一个组件初始化两次，所以只能这么做，
			// 如果不处理，element的component-role会被改变
			this.element.attr( "component-role", this.componentName );
		}
		/**
		 * add parseOptions to support the parse option of tag
		 * 
		 * added by mengshuai
		 */
		this.options = $.component.extend( {},
			this.options,
			this._getCreateOptions(),
			options );
		/*if($.migrate&&options&&$.migrate[this.componentName]
			&&this.componentName!="grid"
			&&this.componentName!="tree"//grid在内部处理migrate，此处跳过migrate来提供效率
				){
			this.options = $.extend(true,{},this.options,$.migrate[this.componentName](options));
		}*/
		if ( !this.options.authorized || this.options.authorized === "false" ) { this.element.remove(); }
		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		if ( element !== this ) {
			$.data( element, this.componentFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === that.element[0] ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}
		/*if ( typeof ( this.options.rendered ) == "undefined" ) {
			this.options.rendered = true;
		} else {
			this.options.rendered = false;
		}*/
		//var data = this.element.data('events');
		this.element.prop( "rendered", !!this.options.rendered );
		if ( !this.options.rendered ) {
			this.element.addClass( "coral-no-rendered" );
			return;
		} else {
			this.element.addClass( "ctrl-init ctrl-init-"+this.componentName );
			this._create();
			this._renderComponent();
		}
	},
	_renderComponent: function(){
		if ( this.options.componentCls ) {
			this.component().addClass( this.options.componentCls );
		}
		if ( this.options.cls ) {
			this.element.addClass( this.options.cls );
		}
		// 处理动态添加的表单元素，添加校验
		/*if ( $.inArray( this.componentName, this.formFieldArray ) > -1 ) {
			this.element.addClass( "ctrl-form-element coral-validation-" + this.componentName );
			//var form = this.element.closest("form");
			// 如果form存在，则不进行添加
			// 如果form不存在，额外的进行添加
			//if ( !form.length && !$.data( this.element[0], "inited" )) {
			$.validate.addField( this.element, this.options );
			//}
			
		}*/
		if (this.addField) {
			this.addField();
		}
		if ( $.inArray( this.componentName, this.panelArray ) > -1 ) {
			if (typeof this.element.attr("id") != "undefined") {
				this.options.id = this.element.attr("id");
			} else if (this.options.id) {
				this.element.attr("id", this.options.id);
			} else {
				this.options.id = this.element.uniqueId(this.componentName).attr("id");
			}
			this.component().addClass( "ctrl-fit-element" );
			this.component().attr("component-id", this.options.id);
		} else {
			if (typeof this.element.attr("id") != "undefined") {
				this.options.id = this.element.attr("id");
			} else if (this.options.id) {
				this.element.attr("id", this.options.id);
			}
		}
		this._trigger( "onCreate", null, this._getCreateEventData() );
		this._init();
	},
	properties: ["controllerName"],
	_parseOptions: function(target){
		var t = $(target);
		return $.extend({}, $.parser.parseOptions(target, this.properties, this.castProperties));
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	valid: function() {
		var data = {
			hasTips: false,
			element: this.element
		};
		return ( $.validate.validateField( null, data ).length > 0 ? false : true );
	},
	isValid: function(){
		
	},
	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.componentName )
			.removeData( this.componentFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.componentFullName ) );
		this.element.removeClass(
		"ctrl-form-element " + "ctrl-init ctrl-init-" + this.componentName );
		this.component()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeAttr( "component-role" )
			.removeClass(
				this.componentFullName + "-disabled " +
				"coral-state-disabled" );
		this.element.removeAttr( "component-role" );
		this.element.removeAttr( "data-options" );
		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "coral-state-hover" );
		this.focusable.removeClass( "coral-state-focus" );
	},
	_destroy: $.noop,

	component: function() {
		return this.element;
	},
	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.component.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.component.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
			this.element.trigger( "onOptionChange", {key: key, value: options[ key ]} );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.component()
				.toggleClass( this.componentFullName + "-disabled coral-state-disabled", !!value )
				.attr( "aria-disabled", value );

			// If the component is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "coral-state-hover" );
				this.focusable.removeClass( "coral-state-focus" );
			}
		}

		return this;
	},
	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},
	show: function() {
		this.component().removeClass("coral-state-hidden").show();
	},
	hide: function() {
		this.component().addClass("coral-state-hidden").hide();
	},
	// 初始化搜索引擎，创建拼音搜索索引
	/**
	 * key 如： 
	 * dataArr 如： [{id:'1', name:'节点1'},{id:'2', name:'节点2'}]
	 */
	_pinyinEngine: function () {
		return new pinyinEngine();
	},
	_pinyinSetCache: function (engine, key, dataArr) {
		
		for (var i in dataArr) {
			// @param	{Array}	标签
			// @param	{Any}	被索引的内容
			engine.setCache([dataArr[i][key]], dataArr[i]);
		}
		
		return engine;
	},
	/** 
	 * @param engine 
	 * @param keyword 搜索的关键字
	 * @param callback 返回dataResult
	 */
	_pinyinSearch: function (engine, keyword, callback) {
		var dataResult = [];
		
		engine.search(keyword, function (data) {
			dataResult.push(data);
		});
		
		callback(dataResult);
	},
	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.component();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow components to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "coral-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "coral-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "coral-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "coral-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "coral-state-focus" );
			}
		});
	},
    addNoTrigger: function ( string ){
    	this.options.noTriggerEvent.push(string);
    },
	_trigger: function( type, event, data ) {
		var noTrigger = this.options.noTriggerEvent||[];
		if ( noTrigger.length ) {
			for( var i=0;i<noTrigger.length;i++ ){
				if( type==noTrigger[i] ){
					noTrigger.splice(i,1);
					return;
				} 
			}
		}
		var ctype = this.options[ type ];
		if (this.options.controllerName && typeof ctype === "string") {
			ctype = this.options.controllerName + "." + ctype;
		}
		var prop, orig, 
			/**
			 * 1. $.isFunction to find the function of tag
			 * 
			 * 2. if "type" is function then not trigger the function of options.
			 */
		    fn = $.isFunction(type)?type:$.coral.toFunction( ctype ), rData = {};

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.componentEventPrefix ?
			type :
			this.componentEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];
		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		// customData只是为了用在回调函数中，自定义事件的e.data中无法取得此处的customData
		event.data = event.data || {};
		$.extend(event.data, this.options.dataCustom);
		$.extend(event.data, {"controllerName": this.options.controllerName});
		var _t;
		_t = $.controller(this.options.controllerName);
		if (this.options.controllerName && !$.isFunction(this.options[ type ]) && _t) {
			$.extend(event.data, {"element": this.element[0]});
		} else {
			_t = this.element[0];
		}
		return !( $.isFunction(fn) && fn.apply( _t, [ event ].concat( data ) ) === false || event.isDefaultPrevented() );
		/*rData["prevented"] = !( $.isFunction(fn) && fn.apply( this.element[0], [ event ].concat( data ) ) === false 
			|| event.isDefaultPrevented() );
		
		if (data[0] && data[0]["getData"] == true) {
			rData["result"] = event["result"];
		} else {
			return rData["prevented"];
		}
		return rData;*/
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Component.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})();
// noDefinePart
} ) );