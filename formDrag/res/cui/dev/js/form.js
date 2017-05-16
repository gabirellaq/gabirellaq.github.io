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
/**
 *	Coral 4.0： form
 *
 * 	Depends:
 *		jquery.coral.core.js
 *		jquery.coral.component.js
 *
 */
$.component( "coral.form",{
	version: "4.0.2",
	options: {
		disabled: null,
		ajaxSubmit: true, //Defines if to submit form with Ajax.
		novalidate: false, // false to validate the form
		context: "",
		separator: ",", //获取form数据，多选时返回的对象是分割符分割的字符串，其中的分隔符。
		container: "tooltip", // tooltip, popover, default
		requires: null,
		excluded: [":disabled", ":hidden", ":not(:visible)"],  // ":disabled,:hidden,:not(:visible)" 校验的时候排除不检验的元素
		errTipsType: "first", // "all", "first", "none"  显示全部校验提示，显示第一个，全部不显示
		onCreate: null,
		url: "",
		postData: {},
		target: "",
		focusFirst: false, // load之后focus第一个form元素
		showRequiredMark: null,
		hideRequiredMark: null,
		onChange: null,
		triggers: {
		},
		exclude: false // true 则排除 form 内的表单元素不校验
	},
	//创建组件
	_create: function () {
		var that = this;
		//创建组件外围元素
		this._initElement();
		this._bindEvents();
		
		$.data( this.element, "modifiedData", {} );
		$.data( this.element, "originalData", this._getForm() );
		
		this.element.validate({
			excluded: this.options.excluded,
			errorMode: this.options.errorMode,
			showRequiredMark: this.options.showRequiredMark,
			hideRequiredMark: this.options.hideRequiredMark
		});
		if (this.options.focusFirst) {
			this._focusFirst();
		}
		//只有一个输入框的时候，会刷新页面，所以在加上一个隐藏的输入框
		this.element.append($("<input type='text' style='display:none;'></input>"));
	},
	/**
	 * get Fields of form
	 */
	_getFields: function() {
		return this.element.find( ".ctrl-form-element" );
	},
	/**
	 * 获取校验组件的类型
	 * @param el 组件jquery对象
	 * @return {string} 组件类型
	 */
	_getFieldType: function(el) {
		var classArray = $(el)[0].className.split(" "),
			type = "";

		for ( var item in classArray ) {
			if ( classArray[item].indexOf( "coral-validation-" ) >=  0 ) {
				type = classArray[item].substr( classArray[item].indexOf( "coral-validation-" ) + 17 );
				return type;
			}
		}
		
		return null;
	},
	/**
	 * 绑定事件
	 */
	_bindEvents: function() {
		var that = this,
			opts = this.options,
			$fields = this._getFields();			
		
		$fields.each( function(index, field) {
			var $field = $(field);
			var	type = that._getFieldType($field);
			// 绑定组件的校验方法
			$field.off(".formonchange").on( type + "onchange.formonchange", function( event, ui ) {
				if (event.type.indexOf("onchange") != -1) {
					var name = $(this)[type]("option", "name"),
						value = $(this)[type]("getValue"),
						changeData = {};

					changeData[name] = value;
					that.updateCoralData(changeData);
					that._trigger("onChange", null, {field:this, type:type});
				}
			});
		});
	},
	//组件初始化
	_initElement: function () {
		var options = this.options;
		//添加组件外围元素
		this.element.addClass( options.cls );
		this.element.appendTo( this.uiBorder );
		this.element.addClass( "coral-form-default" );
		
		if ( options.id !== "" ) {
			this.element.attr( "id", options.id );
		}
		if ( options.name !== "" ) {
			this.element.attr( "name", options.name );
		}
		if ( options.action !== "") {
			this.element.attr( "action", options.action );
		}
		if ( options.method !== "" ) {
			this.element.attr( "method", options.method );
		}				
		if ( options.target !== "" ) {
			this.element.attr( "target", options.target );
		}		
		if ( options.context != "" ) {
			this.element.attr( "context", options.context );
		} else {
			this.element.attr( "context", "body" );
		}
		// 处理form下的label的颜色
		// this._initRequires();			
	},
	initRequires: function () {
		this._initRequires();
	},
	// 处理校验组件前面的 label 的颜色。
	_initRequires: function () {
		var 	that = this,
				requiredEls = this.element.find($("[class*='coral-validation-']")).parent(":visible").find($("[class*='coral-validation-']"));
		
		requiredEls.each( function () {
			var className = this.className, 
				coralType = "",
				clsArray = className.split(" ");
			
			for ( var item in clsArray ) {
				if ( clsArray[item].indexOf( "coral-validation-" ) >=  0 ) {
					coralType = clsArray[item].substr( clsArray[item].indexOf( "coral-validation-" ) + 17 );
					break;
				}
			}
			
			var required = $(this)[coralType]("option", "required"); 
			
			if ( typeof  required === "boolean" && required ) {
				if (coralType=="datepicker" ) {
					$(this)[coralType]("component", $(this)).parent("td").prev().addClass("require");
				}  else {
					$(this)[coralType]("component").parent("td").prev().addClass("require");						
				}
			}
		});
	},
	/**
	 * 根据选择器参数，获取组件类型
	 */
	_getCoralType: function (selector) {
		var 	clsArray = $(selector)[0].className.split(" "),
				coralType = "";
		
		for ( var item in clsArray ) {
			if ( clsArray[item].indexOf( "coral-validation-" ) >=  0 ) {
				coralType = clsArray[item].substr( clsArray[item].indexOf( "coral-validation-" ) + 17 );
				return coralType;
			}
		}
	},
	/**
	 * 校验组件动态改变 required = true 属性时，设置前面label的颜色为红色
	 */
	showRequire: function( selector) {
		var $el = $(selector),
			coralType = this._getCoralType( selector );
		
		$el[coralType]("component").parent("td").prev().addClass("require");
	},
	/**
	 * 校验组件动态改变 required = false 属性时，恢复前面label的颜色
	 */
	hideRequire: function( selector) {
		var $el = $(selector),
			coralType = this._getCoralType( selector );
		
		$el[coralType]("component").parent("td").prev().removeClass("require");
	},
	//设置属性处理
	_setOption: function( key, value ) {
		//默认属性不允许更改
		if (key == "id" || key == "name") {
			return;
		}
		
		this._super(key, value );
		
		return ;
	},
	/**
	 * 组件值初始化或取得默认值时候调用的方法
	 * coralData: {
	 * 	  "name": "value" // value = String "v1" || Array ["v1", "v2", "v3"]
	 * }
	 */
	saveOriginalCoralData: function ( coralData ) {
		var that = this;
		
		$.each ( coralData, function ( key, val ) {
			that._updateCoralData("original", key, val);
		});	
		
		return ;
	},
	/**
	 * 组件值更改的时候调用的方法
	 * coralData: {
	 * 	  "name": "value" // value = String "v1" || Array ["v1", "v2", "v3"]
	 * }
	 */
	updateCoralData: function ( coralData ) {
		var that = this;
		
		$.each ( coralData, function( key, val ) {
			that._updateCoralData( "modified", key, val );
		});		
		
		return ;
	},
	_updateCoralData: function ( dataType, key, val ) {
		var data = $.data( this.element, dataType + "Data" );
			
		data[key] = val;
		
		$.data( this.element, dataType + "Data", data );
		
		return ;
	},
	// 原生获取 form 序列化方法
	serialize: function () {
		return $(this.element).serialize();
	},
	//  原生获取 form json 对象方法
	serializeArray: function () {
		return $(this.element).serializeArray();
	},
	// modifiedData undefined 应该和false同样的效果，undefined不应该和true一个效果
	modifiedData: function ( isSerialize ) {
		if ( ( typeof isSerialize == "boolean" && isSerialize ) ) {
			return this._getSerialize( "modified" );
		} else {
			return $.data( this.element, "modifiedData" );
		} 
	},
	// originalData undefined 应该和false同样的效果，undefined不应该和true一个效果
	originalData: function ( isSerialize ) {
		if ( ( typeof isSerialize == "boolean" && isSerialize) ) {
			return this._getSerialize( "original" );
		} else {
			return $.data( this.element, "originalData" );
		}
	},
	// formData undefined 应该和false同样的效果，undefined不应该和true一个效果
	/**
	 * 取得表单的数据
	 * */
	formData: function () {
		return this._getForm();
	},
	/**
	 * 取得表单的数据
	 * */
	getData: function () {
		return this.formData();
	},
	//获取 modified/original 序列化字符串
	_getSerialize: function ( dataType ) {
		var data = $.data( this.element, dataType + "Data" ),
			serializeStr = "";
		$.each( data, function ( key, val) {
			if ( typeof val != "Object") {
				serializeStr += key + "=" + val + "&";
			} else {
				for ( var i in val ) {
					serializeStr += key + "=" + val[i] + "&"; 
				}
			}			
		});
		return serializeStr.substr( 0, serializeStr.length - 1 );
	},
	// 获取 form 元素数据对象，多选，复选情况下，用分隔符 separator 分割
	_getForm: function() {
		var	that = this,
			coralEl = {},
			nomarlEl = {},
			arr = $( this.element ).serializeArray();
		
		$( this.element ).find(".ctrl-form-element").each(function(){
			var type = $(this).attr("component-role"),
				name = $(this)[type]("option", "name");
			if (name) {
				if (type !== "checkbox" && type !== "radio") {
					if (coralEl[name]) {
						coralEl[name] = coralEl[name] + that.options.separator + $(this)[type]("getValue");
					} else {
						coralEl[name] = $(this)[type]("getValue");
					}
				} else {
					// checkbox组件处理了name重复的问题
					coralEl[name] = $(this)[type]("getValue");
				}
			}
		});
		$( arr ).each( function(index, item) {
			if (item.name) {
				// 如果是组件的name，则跳过。
				if (typeof(coralEl[item.name]) === "undefined") {
					// 如果是非组件的name，重复的name，则逗号分隔。
					if (nomarlEl[item.name]) {
						nomarlEl[item.name] = nomarlEl[item.name] + that.options.separator + item.value;
					} else {
						nomarlEl[item.name] = item.value;
					}
				}
			}
		});
		$.extend(coralEl, nomarlEl);
		return coralEl;
	}, 
	/*//获取 form Json格式
	_getFormJson: function () {
		var serializeObj = {},
			array = $( this.element ).serializeArray();

		$( array ).each( function () {
			if( serializeObj[this.name] ) {
				if ( $.isArray( serializeObj[this.name] ) ) {
					serializeObj[this.name].push( this.value );
				} else {
					serializeObj[this.name] = [serializeObj[this.name], this.value];
				}
			} else {
				serializeObj[this.name] = this.value;	
			}
		});
		
		return serializeObj;
	},*/
	_loadData: function ( data ) {
		var that = this;

		this._updateData( data, "modified" );
		this._updateData( data, "original" );
		
		if ( typeof data == "object" ) {
			$.each ( data, function ( i, d ) {
				if ( !that._loadCoralData( i, d ) ) {
					that._loadNormalData( i, d );
				}
			});
		}
	},
	_loadCoralData: function ( key, value ) {
		var that = this;
		value = value == null? "":value;
		var coralData = that._getCoralFormData();
		var isFind =  false;
		for ( var i in coralData ) {
			var item = coralData[i];
			var ctype = item.coralType;
			switch ( ctype ) {
				case "radio": 
					if ( key == item.name ) {
						isFind =  true;				
						if ( item.el[ctype]("option", "value") == value && value != null ) {
							item.el[ctype]( "check" );
						} else {
							item.el[ctype]( "uncheck" );
						}		
					}
					break;
				case "radiolist": 
					if ( key == item.name ) {
						isFind =  true;	
						if (value == null ) value = "";	
						item.el[ctype]( "setValue", value );
					}
					break;
				case "checkbox":
					if ( key == item.name ) {
						isFind =  true;	
						if ( value == null ) {
							value = [""];
						}
						if ( typeof value != "object" ) {
							if (typeof value === "string" ) {
								value = value.split(that.options.separator); // 给出的分割符需要跟form的separator一致
							} else {
								value = [value];
							}
						}
						for ( var a in value ) {
							if ( item.el[ctype]("option", "value") == value[a] ) {
								item.el[ctype]( "check" );
								break;
							} else {
								item.el[ctype]( "uncheck" );
							}
						}											
					}
					break;
				case "checkboxlist":
					if ( key == item.name ) {
						isFind =  true;	
						if ( key == item.name ) {
							if ( value == null ) value = "";
							item.el[ctype]( "setValue", value );
						} 
					}
					break;
				case "combobox": 
				case "combotree":
				case "combogrid": 
					if ( key == item.name ) {
						isFind =  true;
						if ( typeof value != "object" ) {
							if (typeof value === "string" ) {
								value = value.split(that.options.separator); // 给出的分割符需要跟form的separator一致
							} else {
								value = [value];
							}
						}
						if ( value != null ) {
							item.el[ctype]( "setValues", value );
						}						
					}
					break;
				case "datepicker": 
					if ( key == item.name ) {
						isFind =  true;	
						if ( value != null ) {
							item.el[ctype]( "option", "value", value );
						}
					}
					break;
				case "autocomplete": 
				case "autocompletetree": 
					if ( key == item.name ) {
						isFind =  true;	
						if ( value != null ) {
							item.el[ctype]( "option", "value", value );
						}
					}
					break;
				default:
					if ( key == item.name ) {
						isFind =  true;	
						if ( value != null ) {
							item.el[ctype]( "option", "value", value );
						}
					}
					break;
			}
		}

		return isFind;
	},
	_loadNormalData: function ( key, value ) {
		var that = this,
			normalData = that._getNomalFormElements();

		for ( var i in normalData ) {
			if ( key == normalData[i].attr( "name" ) ) {
				if ( undefined != normalData[i].attr( "type" ) && "radio" == normalData[i].attr( "type" ) ) {
					if ( value == normalData[i].attr( "value" ) ) {
						normalData[i][0].checked = true;
					} else {
						continue;
					}
				} else {
					if ( typeof value === "string" && value.indexOf( that.options.separator ) != -1 ) {
						value = value.split( that.options.separator ); // 给出的分割符需要跟form的separator一致
					}
					$( that.element.find("[name=" + key + "]") ).val( value );
				}
			}
		}	
		return ;
	},
	_getAllFromElements: function () {
		return this.element.find("[name]");
	},
	_getCoralFormData: function () {
		var coralData = [];
		this.element.find( ".ctrl-form-element" ).each ( function () {
			var element = $(this), name = null, i = 0,
				tArr = ["radio", "checkbox", "combobox", "combotree", "combogrid", "datepicker", "checkboxlist", "radiolist", "autocomplete", "textboxlist", "autocompletetree"],
			    type = element.attr( "component-role");
			/*for (; i < tArr.length; i++) {
				type = tArr[i];
				if ( element.attr( "component-role") == type ) {*/
			name = element[type]( "option", "name" );
			if ( null != name ) {
				coralData.push({
					el: element,
					name: name,
					coralType: type
				});
			}
			//break;
				/*}
			}*/
		});
		return coralData;
	},
	_getCoralFormElements: function () {
		return this.element.find( ".coral-form-element" );
	},
	_getCoralNameJson: function () {
		var that = this,
			nameJson = {};
		that._getCoralFormElements().each ( function () {
			var componentRole = $( this ).attr( "component-role" );
			$( this )[ componentRole ]( "option", "name" ) && (nameJson[ name ] = componentRole);
		});
		return nameJson;
	},
	_getNomalFormElements: function () {
		var that = this,
			normalArray = [],
			nameJson = that._getCoralNameJson();
		that._getAllFromElements().each( function () {
			if ( ! nameJson[$( this ).attr( "name" )] ) {
				normalArray.push( $( this ) );
			}
		});
		return normalArray;
	},
	//根据load的新数据,更新数据
	_updateData: function ( data, dataType ) {
		var Data = $.data( this.element, dataType + "Data" );
		
		if ( typeof data == "object" ) {
			$.each( data, function ( i, d ) {
				if ( "original" == dataType && typeof Data[i] != "undefined" ) {
					Data[i] = d;
				} else if ( "modified" == dataType && typeof Data[i] != "undefined" ) {
					delete Data[i];
				}
			});
		}
	},
	resetData: function () {
		this.reset();
	},
	getErrors: function () {
		var errorElements = this.component().find(".coral-validate-error"),
		    errors = [];
		errorElements.each(function(){
			var el = $(this).find(".ctrl-form-element"),
			    type = $(el).attr("component-role"),
			    elementError = {};
			elementError.errorText = $(this).find(".coral-errorIcon").attr("data-errors");
			elementError.required = $(el)[type]("option","required");
			elementError.id = $(el)[type]("option","id");
			elementError.validType = $(el)[type]("option","validType");
			elementError.value = $(el)[type]("getValue");
			elementError.element = el[0];
			elementError.requiredMsg = $(el)[type]("option","requiredMsg")||$.validate.options.requiredMsg;
			elementError.name = $(el)[type]("option","name");
			errors.push(elementError);
		})
		return errors;
	},
	reset: function () {
		var that = this;
		$( this.element ).find( ".ctrl-form-element" ).each(function(i){
			var type = $(this).attr( "component-role" );
			$(this)[ type ]( "reset" );
		});
		$.data( this.element, "modifiedData", {} );
	},
	_isExclud: function ( $component, excluded ) {
    	 if ( !excluded ) {
    		 return false;
    	 }
    	 
    	 var length = excluded.length;
         
    	 for ( var i = 0; i < length; i++ ) {
             if ( "string" === typeof excluded[i] && $component.is(excluded[i]) ){
                 return true;
             }
         }
    	 
    	 return false;
     },
	//clear
	clear: function (options) {
		var excluded = {};
		if (options && options.excluded && options.excluded instanceof Array) {
			for (var i in options.excluded) {
				var item = options.excluded[i];
				excluded[item] = item;
			}
		}

		$( this.element ).find( ".ctrl-form-element" ).each(function(i){
			var type = $(this).attr( "component-role" );
			if ( 
					($(this)[ type ]( "option", "readonly" ) && excluded["readonly"]) ||
					($(this)[ type ]( "option", "isLabel" ) && excluded["isLabel"]) ||
					($(this)[ type ]( "option", "disabled" ) && excluded["disabled"])
			 	) return ;
			
			switch (type) {
				case "radio":
				case "checkbox":
					$(this)[ type ]( "uncheck" );
					break;
				default:
					$(this)[ type ]("setValue", "");
					break;
			}
		});
		$.validate.clearErrors(this.element);
		$.data( this.element, "modifiedData", {} );
	},
	/**
	 * 根据url或者data重新加载form表单元素
	 */
	load: function ( url ) {
		var that = this,
			opts = {}, 
			data = [], 
			isUrl = false;
		if ( typeof( url ) == "undefined" ) return;
		if ( typeof( url ) !== "string" ) {
			// 传过来的是object，需要区别是data还是options
			// 如果是options，可能是options.data或者options.url ，否则才为data
			opts = url;
			if ( opts.data ) { //传进来的是options对象
				data = opts.data;
			} else if ( opts.url ) {// 传进来的是data对象
				url = opts.url;
				isUrl = true;
			} else {
				// url是object，且传进来的是data
				data = url;
			}
		} else {
			isUrl = true;
		}
		
		if ( isUrl ) {// url被重新设置过
			$.ajax({
				url: url,
				type: "POST",
				data: $.extend( true, {}, this.options.postData, opts.postData ),
				async: false,
				dataType: "json",
				success: function ( data ) {
					that._loadData( data );
					that._trigger( $.isFunction( opts.onLoad )?opts.onLoad:"onLoad", null, [data] );
				},
				error: function () {  
					that._trigger("onLoadError", null, []);
				}
			});
		} else {
			this._loadData( data );
			this._trigger( $.isFunction( opts.onLoad )?opts.onLoad:"onLoad", null, [{content:data}] );
		/*if (that.options.focusFirst) {
			that._focusFirst();
		}  */
		}
	},
	/**
	 * 根据data对象重新加载form表单数据
	 */
	loadData: function ( data ) {
		this.load( data );
	},
	//提交表单
	/**
	 * TODO:submit 里面的postData是否要和loadData里面的postData区分开？
	 */
	submit: function ( opts ) {
		opts = opts || {};
		if ( false == this._trigger( $.isFunction( opts.onSubmit )?opts.onSubmit:"onSubmit", null, []) ) {
			return false;
		}
		if ( this.options.ajaxSubmit ) {
			$.ajax({
				type: 'post',
				url: $.extend( true, {}, this.options.url, opts.url ),
				data: $.extend( true, {}, this.options.postData, opts.postData, this.formData ),
				dataType: 'json',
				success: function(data) {
					this._trigger( $.isFunction( opts.onSuccess )?opts.onSuccess:"onSuccess", null, [{content:data}] );
				},
				error : function() {
				}
			});
		} else {
			if (  this.valid() ) {
				this.element.submit();
			} else {
				return false;
			}
		}
	},
	//校验方法
	valid: function () {
		if ( this.options.novalidate ) {
			return true;
		}
		return this.element.validate( "valid" );
	},
	// 统一去除校验组件的所有校验错误提示信息
	hideErrorTips: function () {
		$("div.coral-validate-state-error").remove();
	},
	/**
	 * focus form 的第一个可编辑form元素，优先focus 组件库表单元素
	 */
	_focusFirst: function() {
		/*
		if (this.options.focusFirst) {
			return;
		}
		var that = this,
			fields = this.findFields();
		
		for (var i in fields) {
			var instance = fields[i];
			
			if (fields[i] instanceof Array) {
				if ( true == $(instance[0].element)[instance[0].name]("focus") ) return;
			} else {
				if ( instance.focus && true == instance.focus() ) return;			
			}
		}
		
		// find normal form element
		var originalFields = this.element.find("[name]:not(:hidden,.ctrl-init,[readonly],[disabled])");
		if( originalFields.length ) {
			originalFields[0].focus();
		}*/
	},
	// 找到form下所有的组件元素
	findFields: function(){
		return $.coral.findComponent( ".ctrl-form-element", this.element );
	},
	setIsLabel: function(isSet){
		$.coral.setIsLabel(isSet, this.element);
	},
	setReadOnly: function(isSet){
		$.coral.setReadOnly(isSet, this.element);
	},
	refresh: function(opts){	
		var maxHeight,
		options = this.options,
		heightStyle = options.heightStyle,
		parent = this.component().parent();
		if ( heightStyle === "fill" ) {
			$.coral.fitParent(this.component(), true);
			maxHeight = parent.height();
			this.component().siblings( ":visible" ).each(function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			});
			this.element.height( Math.max( 0, maxHeight -
				this.element.innerHeight() + this.element.height() ) )
				//.css( "overflow", "auto" );
				.addClass( "coral-scroll" );
		} else if ( heightStyle === "auto" ) {
			this.element.height( "" );
		}
		$.coral.refreshChild(this.element);
	}
});
// noDefinePart
} ) );