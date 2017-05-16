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
var validate_uuid = 0, validateSuffix = "coralForm", validatePrefix = "validate";

$.validate = {
	options: {
		onStatus: "onstatus",
		errorMode: 1,// 0表示下面显示错误信息  ；1代表感叹号 ； 
		errMsgPosition: "leftBottom",
		requiredMsg : "*必输项",
		triggers: {
			textbox: ["onchange","onblur","onkeyup"],
			radio: ["onchange","onblur"],
			checkbox: ["onchange","onblur"],
			radiolist: ["onchange","onblur"],
			checkboxlist: ["onchange","onblur"],
			combobox: ["onchange","onblur"],
			colorpicker:[],
			combotree: ["onchange","onblur"],
			combogrid: ["onchange","onblur"],
			datepicker: ["onchange","onblur"],
			autocomplete: ["onchange","onblur"],
			spinner: ["onchange","onblur"],
			textboxlist: ["onchange","onblur"],
			autocompletetree: ["onchange","onblur"],
			fileuploader: ["onchange"]
		}
	},
	// 返回校验后缀
	validateSuffix: function() {
		return validateSuffix;
	},
	/**
	 * param
	 * json {
	 *	validType: "minlength", //("required", "maxlength", "validType", "pattern")
	 *	validValue: "5"         //("false", "20", "number/float/ip/port", "正则表达式String")
	 *	optionValue: "yyyy-MM-dd",
	 *	elementValue: "value"
	 * }
	 * 
	 * return "" || "<%=出错信息 %>";
	 */		
	_validate: function (json) {
		var type = json.validType,
			validValue = json.validValue,
			elementValue = json.elementValue,
			optionValue = json.optionValue,
			field = json.field,
			requiredMsg = json.requiredMsg,
			errMsg = json.errMsg;
		
		if (typeof validValue == "undefined") {
			return "";
		}
		switch (type) {
			case "required":
				return this._checkRequired(validValue, elementValue, requiredMsg);
			case "minlength": 
				return this._checkMinlength(validValue, elementValue, errMsg);
			case "maxlength": 
				return this._checkMaxlength(validValue, elementValue, errMsg);
			case "pattern": 
				return this._checkPattern(validValue, elementValue, errMsg);
			case "validType":
				return this._checkValidType(validValue, elementValue, optionValue, errMsg);
			case "valid":
				return this._checkValid(validValue, elementValue, errMsg, field);
			case "specialCharacters":
				return this._isSpecialCharacters(validValue, elementValue, errMsg);
			default:
				return "";
		}			
	},
	/**
	 * 获取校验组件的类型
	 * @param el 组件jquery对象
	 * @return {string} 组件类型
	 */
	getFieldType: function(el) {
		return $( el ).attr( "component-role" );
		/*var classArray = $(el)[0].className.split(" "),
			type = "";

		for ( var item in classArray ) {
			if ( classArray[item].indexOf( "coral-validation-" ) >=  0 ) {
				type = classArray[item].substr( classArray[item].indexOf( "coral-validation-" ) + 17 );
				return type;
			}
		}
		
		return null;*/
	},
	validTypeNames: ["required","minlength","maxlength","pattern","validType","valid","specialCharacters"],
	// 校验类型控制 ??
	validTypeOptions: {
		"maxlength": {
			restrictInput: false,
			showTooltip: false
		},
		"number": {
			restrictInput: false
		},
		"naturalnumber": {
			restrictInput: false
		},
		"integer": {
			restrictInput: false
		},
		"float": {
			restrictInput: false
		},
		"zh": {
			restrictInput: false
		},
		"letter": {
			restrictInput: false
		},
		"uppercase": {
			restrictInput: false
		},
		"lowercase": {
			restrictInput: false
		},
		"zhOrNumOrLett": {
			restrictInput: false
		},
		"ip": {
			restrictInput: false
		},
		"port": {
			restrictInput: false
		},
		"url": {
			restrictInput: false
		},
		"email": {
			restrictInput: false
		},
		"mobile": {
			restrictInput: false
		},
		"idno": {
			restrictInput: false
		},
		"zipcode": {
			restrictInput: false
		}
	},
	/**
	 * data: isComponent ,如果是grid可能是对td的校验，无法获取component和option，也不能通过内置的校验进行提示
	 */
	validateField: function( event, data ) {
		validAction = true;
		data.validoptions = data.validoptions || {};
		var el = data.element,
			type = $.validate.getFieldType( el ),
    	 	component = data.notComponent?data.component : el[type]("component"),
    	 	options = data.notComponent?data.validoptions : el[type]("option"), // 获取组件的所有参数（options）
    	 	val = null, 
    	 	hasTips = data.hasTips,
    	 	errorArrayOriginal = [],
    	 	errorResults = [],
    	 	errorMode = options.errorMode || data.validoptions.errorMode || $.validate.options.errorMode,
    	 	errMsgPosition = options.errMsgPosition || data.validoptions.errMsgPosition || $.validate.options.errMsgPosition,
    	 	readonly = options.readonly,
    	 	disabled = options.disabled,
    	 	isLabel = options.isLabel;
		if (!component.is(":visible")) {
    		hasTips =  false;
    	}
		hasTips = false;
		// don't valid hidden input element 
		if ( "hidden" == el.attr("type") ) {
			el.prop( "isError", false );
			return errorResults;
		} 
		// if isLabel or disabled ,then don't valid 
		if ( isLabel || disabled) {
			el.prop( "isError", false ); 
			return errorResults;
		}
		// 针对表格的校验的特殊处理，表格里面不包含组件，只有td元素
		if ( data.notComponent ) {
			val = data.value;
		} else {
			// get value of the special way
			if ( "radio" === type || "checkbox" === type ) {
				val = el.prop("checked") ? el[type]("getValue") : "";
			} else {
				try {
					val = el[type]("getValidateValue");// default way to getValue method
				} catch (e){
					$.error( "cannot call methods on " + type + " , please achieve the getValue method !" );
				}
			}
		}
		for( var i = 0; i < this.validTypeNames.length; i++ ) {
			var vt = this.validTypeNames[i],
				vo = {
					optionValue: options.validType,
					requiredMsg: options.requiredMsg, 
					elementValue: val,// 表单元素的值。
					field: el,
					errMsg: options.errMsg,
					validValue: options[ vt ], // 比如：代表必输项的值是true或者false；maxlength对应的最大值是多少。
					validType: vt // 校验的形式 必输项，最大值，最小值等
				};
			//when validType is required, it does't need valid empty value
			if ( options[ vt ] && (vt == "required")?true:(val != "") ) {
				var error = $.validate._validate( vo );
				error == "" || errorResults.push( error );// if has error, then push the error to results.
			}
		}
		if ( errorResults.length > 0 ) {
			$.validate.hideErrors( component );
			if ( !data.notComponent ) {
				if( errorMode == 0 ){
					$(component).attr( "data-errors", errorResults.toString() ); 
				} else {
					var paddingRight = component.css("padding-right");
					component.append("<span class='cui-icon-notification2 coral-errorIcon' style='right:"+paddingRight+"' data-errors = '"+errorResults.toString()+"' ></span>")											
					component.addClass( "hasErrorIcon " );
				}
			}
			component.addClass( "coral-validate-error " );
			var eventData = errorResults;
			$.validate._apply(options.onValidError, el, event, eventData);
			$(el).prop( "isError", true );
			return errorResults;
		} else {
			$.validate._apply(options.onValidSuccess, el, event, {});
			component.removeClass( "coral-validate-error" );
			$.validate.hideErrors( component );
			$(el).prop( "isError", false ); 
			$(component).removeAttr( "data-errors" ); 
			return errorResults;
		}
	},
	/**
      * 改变回调函数的的指针this为初始化的field，
      **/
     _apply: function( callback, el, event, data ) {
    	 var fun = $.coral.toFunction( callback );
    	 
    	 if ( $.isFunction(fun) ) {
    		 return fun.apply( el, [event, data] );
    	 }
     },
	//脚本校验
	_checkValid: function (validValue, elementValue, errMsg, field) {
		var errMsgResult = "";
		
		if ( !!errMsg ) {
			errMsgResult = errMsg;
		}
		
		var validResult = null;
		
		if (validValue) {
			validResult = $.coralApply ($.coral.toFunction(validValue),field&&field[0], [{"value": elementValue}]);
//			validResult = $.coral.toFunction(validValue).apply( field&&field[0], [{"value": elementValue}] );
			if ( typeof validResult == "object" && typeof validResult.isValid == "boolean" ) {
				
				if ( validResult.isValid ) {
					return "";
				} else {
					if ( !!validResult.errMsg ) {
						return validResult.errMsg;
					}
					return errMsgResult == "" ? validResult.errMsg : errMsgResult;
				}
			}
			if ( typeof validResult == "boolean" ) {
				if ( validResult ) {
					return errMsgResult;
				} else {
					return errMsgResult;
				}
			}
			/*if ( typeof validResult.isValid == "boolean" ) {
				if (typeof validResult.message != "string") {
					return "";
				}
				if ( validResult.isValid ) {
					return "";
				} else {
					return errMsgResult == "" ? validResult.message : errMsgResult;
				}
			}*/
		}
		return "";
	},
//			_trigger1: function( field, validValue, data ) {
//				return $.coral.toFunction(validValue).apply( field[0], data );
//				/*var that = this;
//				
//				event = $.Event(event);
//				
//				var rData = {};
//				
//				var _fn = $.coral.toFunction(validValue);
//				_fn.apply( null, [ event ].concat( data ) );
//				
//				if ( data[0] && data[0]["getData"] == true ) {
//					rData["result"] = event["result"];
//				} else {
//					return rData["prevented"];
//				}
//				
//				return rData;*/
//				
//				
//			},
	//校验必输项
	_checkRequired: function (validValue, elementValue, requiredMsg) {
		//var errMsgResult = $.fn.coralValidator.validators["required"];
		//此处应该配置requiredMsg
		var errMsgResult = $.validate.options.requiredMsg;			
		if ( requiredMsg ) {
			errMsgResult = requiredMsg;
		}
		
		if (typeof validValue == "boolean" && validValue && ("" == $.trim(elementValue))) {
			return errMsgResult;
		} else {
			return "";
		}
	},
	//校验最小长度
	_checkMinlength: function (validValue, elementValue, errMsg) {
		var errMsgResult = "最少输入" + validValue + "个字符！";
		
		if ( typeof errMsg != "undefined" && errMsg != null && errMsg != "" ) {
			errMsgResult = errMsg;
		}
		if (validValue && this._isPositiveInteger(validValue)) {
			var minLength = parseInt(validValue), nowLength = this._getByteLength(elementValue);
			
			if (nowLength < minLength) {
				return errMsgResult;
			} else {
				return "";
			}
		}
	},
	//校验最大长度
	_checkMaxlength: function (validValue, elementValue, errMsg) {
		var errMsgResult = "最多输入" + validValue + "个字符！";
		
		if ( typeof errMsg != "undefined" && errMsg != null && errMsg != "" ) {
			errMsgResult = errMsg;
		}
		
		if (validValue && this._isPositiveInteger(validValue)) {
			var maxLength = parseInt(validValue), nowLength = this._getByteLength(elementValue);
			
			if (nowLength > maxLength) {
				return errMsgResult;
			} else {
				return "";
			}
		}
	},
	//校验正则表达式
	_checkPattern: function(validValue, elementValue, errMsg) {
		var errMsgResult = "请输入匹配的字符串！";
		
		if ( typeof errMsg != "undefined" && errMsg != null && errMsg != "" ) {
			errMsgResult = errMsg;
		}
		
		if (validValue) {
			var reg = eval(validValue.replace(/\/\//g, "\/"));
			if (!reg.test($.trim(elementValue))) {
				return errMsgResult;
			} else {
				return "";
			}
		} else {
			return "";
		}	
	},
	//校验特殊符号
	_isSpecialCharacters: function ( validValue, elementValue, errMsg ) {
		var errMsgResult = "含有特殊符号！";
		if ( typeof errMsg != "undefined" && errMsg != null && errMsg != "" ) {
			errMsgResult = errMsg;
		}
		if (validValue) {
			var reg = eval(validValue.replace(/\/\//g, "\/"));
			if (reg.test($.trim(elementValue))) {
				return errMsgResult;
			} else {
				return "";
			}
		} else {
			return "";
		}
	},
	//校验快捷类型
	_checkValidType: function (validValue, elementValue, optionValue, errMsg) {
		var errMsgResult = "";
		
		if ( typeof errMsg != "undefined" && errMsg != null && errMsg != "" ) {
			errMsgResult = errMsg;
		}
		
		var val = elementValue;
		
		switch (validValue) {
			case "number":
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入数字！";
				}
				return this._isNumber(val) ? "" :  errMsgResult;
			case "naturalnumber": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入自然数！";
				}
				return this._isNaturalnumber(val) ? "" :  errMsgResult;
			case "integer": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入整数！";
				}
				return this._isInteger(val) ? "" :  errMsgResult;
			case "float": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入实数！";
				}
				return this._isFloat(val) ? "" :  errMsgResult;
			case "zh": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入汉字！";
				}
				return this._isZh(val) ? "" :  errMsgResult;
			case "letter": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入英文字母！";
				}
				return this._isLetter(val) ? "" :  errMsgResult;
			case "uppercase":
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入大写英文字母！";
				}
				return this._isUppercase(val) ? "" :  errMsgResult;
			case "lowercase":
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入小写英文字母！";
				}
				return this._isLowercase(val) ? "" :  errMsgResult;
			case "zhOrNumOrLett":
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入汉字、数字、英文字母！";
				}
				return this._isZhOrNumOrLett(val) ? "" :  errMsgResult;
			case "ip":
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的计算机IP地址！";
				}
				return this._isIp(val) ? "" :  errMsgResult;
			case "port": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的计算机IP地址端口号！";
				}
				return this._isPort(val) ? "" :  errMsgResult;
			case "url": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的网页地址！";
				}
				return this._isUrl(val) ? "" :  errMsgResult;
			case "email": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的电子邮件地址！";
				}
				return this._isEmail(val) ? "" :  errMsgResult;
			case "mobile": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的手机号码！";
				}
				return this._isMobile(val) ? "" :  errMsgResult;
			case "idno": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法的身份证号码！";
				}
				return this._isIDNo(val) ? "" :  errMsgResult;
			case "zipcode": 
				if ( "" == errMsgResult ) {
					errMsgResult = "请输入合法邮政编码！";
				}
				return this._isZipcode(val) ? "" :  errMsgResult;
			default: 
				return "";
		}
	},
	_isNumber: function ( val ) {
		if(!isNaN( val )) {
			return true;
		} else {
			return false;
		}
	},
	_isNaturalnumber: function ( val ) {
		if (/^[0-9]+$/.test( val )) {
			return true;
		} else {
			return false;
		}
	},
	_isInteger: function ( val ) {
		if (/^(\+|-)?\d+$/.test( val )) {
			return true;
		} else {
			return false;
		}
	},
	_isFloat: function ( val ) {
		if (/^(\+|-)?\d+($|\.\d+$)/.test( val )) {
			return true;
		} else {
			return false;
		}
	},
	_isZh: function ( val ) {
		if (/^[\u4e00-\u9fa5]+$/.test(val)) {  
			return true;  
	    } else {
	    	return false;
	    }   
	},
	_isLetter: function ( val ) {
		if (/^[A-Za-z]+$/.test(val)) {  
			return true;  
	    } else {
	    	return false;
	    }   
	},
	_isUppercase: function ( val ) {
		if (/^[A-Z]+$/.test(val)) {  
			return true;  
	    } else {
	    	return false;
	    }   
	},
	_isLowercase: function ( val ) {
		if (/^[a-z]+$/.test(val)) {  
			return true;  
	    } else {
	    	return false;
	    }   
	},
	_isZhOrNumOrLett: function ( val ) {
		if (/^[0-9a-zA-Z\u4e00-\u9fa5]+$/.test(val)) {  
			return true;  
	    } else {
	    	return false;
	    }   
	},
	_isIp: function ( val ) {
		if (/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test(val)) {  
			if(RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256)  
				return true;
	    } else {
	    	return false;
	    }   
	},
	_isPort: function ( val ) {
		if (this._isNaturalnumber (val) && val < 65536) { 
			return true;
	    } else {
	    	return false;
	    }   
	},
	_isUrl: function ( val ) {
		if (/^(http|https|ftp):\/\/(www\.)?.+.?$/.test(val)) { //支持http,https,ftp
			return true;
	    } else {
	    	return false;
	    }   
	},
	_isEmail: function ( val ) {
		if (/^([-_A-Za-z0-9\.]+)@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/.test(val)) { 
			return true;
	    } else {
	    	return false;
	    }   
	},
	_isMobile: function ( val ) {
		if (/^0?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/.test(val)) { 
			return true;
	    } else {
	    	return false;
	    }   
	},
	_isIDNo: function ( val ) {
		 var aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"};  
		   
	    var iSum = 0;  
	    var info = "";  
	    var strIDno = val;  
	    var idCardLength = strIDno.length;    
	    if(!/^\d{17}(\d|x)$/i.test(strIDno)&&!/^\d{15}$/i.test(strIDno))   
	    {  
	        return false;  
	    }  
	   
	    //在后面的运算中x相当于数字10,所以转换成a  
	    strIDno = strIDno.replace(/x$/i,"a");  
	  
	    if(aCity[parseInt(strIDno.substr(0,2))]==null)  
	    {  
	        return false;  
	    }  
	      
	    if (idCardLength==18)  
	    {  
	        var sBirthday=strIDno.substr(6,4)+"-"+Number(strIDno.substr(10,2))+"-"+Number(strIDno.substr(12,2));  
	        var d = new Date(sBirthday.replace(/-/g,"/"))  
	        if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate()))  
	        {  
	            return false;  
	        }  
	  
	        for(var i = 17;i>=0;i --)  
	            iSum += (Math.pow(2,i) % 11) * parseInt(strIDno.charAt(17 - i),11);  
	  
	        if(iSum%11!=1)  
	        {    
	            return false;  
	        }  
	    }  
	    else if (idCardLength==15)  
	    {  
	        sBirthday = "19" + strIDno.substr(6,2) + "-" + Number(strIDno.substr(8,2)) + "-" + Number(strIDno.substr(10,2));  
	        var d = new Date(sBirthday.replace(/-/g,"/"))  
	        var dd = d.getFullYear().toString() + "-" + (d.getMonth()+1) + "-" + d.getDate();     
	        if(sBirthday != dd)  
	        {   
	            return false;  
	        }  
	    }  
	    return true; 
	},
	_isZipcode: function ( val ) {
		if (this._isNaturalnumber(val) && val.length == 6) { 
			return true;
	    } else {
	    	return false;
	    }   
	},
	_isDate: function ( val, format ) {
		var date = $.trim(val); 
	    var year,month,day,datePat,matchArray;  
	  
	    if(/^(y{4})(-|\/)(M{1,2})\2(d{1,2})$/.test(format))  
	        datePat = /^(\d{4})(-|\/)(\d{1,2})\2(\d{1,2})$/;  
	    else if(/^(y{4})(年)(M{1,2})(月)(d{1,2})(日)$/.test(format))  
	        datePat = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/;  
	    else if(format=="yyyyMMdd")  
	        datePat = /^(\d{4})(\d{2})(\d{2})$/;  
	    else  
	    {   
	        return false;  
	    }  
	    matchArray = date.match(datePat);  
	    if(matchArray == null)   
	    {  
	        return false;  
	    }  
	    if(/^(y{4})(-|\/)(M{1,2})\2(d{1,2})$/.test(format))  
	    {  
	        year = matchArray[1];  
	        month = matchArray[3];  
	        day = matchArray[4];  
	    } else  
	    {  
	        year = matchArray[1];  
	        month = matchArray[2];  
	        day = matchArray[3];  
	    }  
	    if (month < 1 || month > 12)  
	    {               
	        return false;  
	    }  
	    if (day < 1 || day > 31)  
	    {  
	        return false;  
	    }       
	    if ((month==4 || month==6 || month==9 || month==11) && day==31)  
	    {  
	        return false;  
	    }       
	    if (month==2)  
	    {  
	        var isleap=(year % 4==0 && (year % 100 !=0 || year % 400==0));  
	        if (day>29)  
	        {                  
	            return false;  
	        }  
	        if ((day==29) && (!isleap))  
	        {                 
	            return false;  
	        }  
	    }  
	    return true;   
	},
	/**
	 * show required "*"
	 */
	showRequiredMark: function( ui ) {
		var $component = ui.component;
		$component.find( "span.coral-validate-required:first" ).remove();
		$component.append( "<span class='coral-validate-required'>*</span>" );
	},
	hideRequiredMark: function( ui ) {
		var $component = ui.component;
		//$component.removeClass("coral-validate-starBefore");
		$component.find( "span.coral-validate-required:first" ).remove();
	},
	/**
	 * 
	 * @param element
	 * @param errorArray
	 * @param tipsPosition: leftTop, leftBottom, rightTop, rightBottom, right
	 */
	showErrors: function(element, errorArray, tipsPosition, noDelay) {
		// 如果是前置模式，则提示错误信息相对于 border 元素
		var $component = element; // cache component element
		if (element.hasClass("coral-hasLabel") || element.hasClass("coral-validate-starBefore")) {
			if ( element.find(".coral-radio-label").length ) {
				element = element.find(".coral-radio-label");
			} else if ( element.find(".coral-checkbox-label").length ) {
				element = element.find(".coral-checkbox-label");
			} else if ( element.find(".coral-label").next().length ) {
				element = element.find(".coral-label").next();
			} else if (element.find(".coral-validate-required").next().length) {
				element = element.find(".coral-validate-required").next();
			}
		}
		//setTimeout(function(){
		var hasForm = true, $form = $(element).parents("form"),
			container = "tooltip",
			errorContent = errorArray.join("<br />"), 
			$message, 
			position, 
			$element = $(element);
		var id = $element.attr("id"), $message = $("."+id+validateSuffix);
		var errorArrowClass = "coral-validate-errorArrow-top";
		
		if ( $(element).parents("form").length != 0 ) {
			container = $( $form ).form("option", "container");
		} 
		switch (tipsPosition) {
			case "leftTop": 
				errorArrowClass = "coral-validate-errorArrow-top";
				break;
			case "leftBottom": 
				errorArrowClass = "coral-validate-errorArrow-bottom";
				break;
			case "rightTop":
				errorArrowClass = "coral-validate-errorArrow-top";
				break;
			case "rightBottom":
				errorArrowClass = "coral-validate-errorArrow-bottom";
				break;
			case "right":
				errorArrowClass = "coral-validate-errorArrow-right";
				break;
			default:
				break;
		}

		var arrow = '<div class="' + errorArrowClass + '"></div>';
		if(id==null) {
			id = $element.attr("id", validatePrefix + validate_uuid++).attr("id");
		}
		if($("."+id+validateSuffix).length>0){
			$("."+id+validateSuffix).find(".error-content").html(errorContent);
		} else {
			$message = $("<div class='" + id+validateSuffix + " coral-validate-state-error'><div class='error-content'>"+errorContent+"</div>"+arrow+"</div>");
			var formContext = $(element).parents("form").attr("context");
			// 如果为elements 则插在element后面，如果为body 则插在body里面；
			if ( $( formContext ).length > 0 ) {
				$( formContext ).append($message);
			} else {
				$(document.body).append($message);
			}
				
			position = $element.position();
		}
		var my = "left top", at = "right-20 top-" + ( $message.outerHeight() + 8 );
		switch (tipsPosition) {
			case "leftTop": 
				my = "right top";
				at = "left+" + $message.outerWidth() + " top-" + ( $message.outerHeight() + 8 );
				break;
			case "leftBottom": 
				my = "right bottom";
				at = "left+" + $message.outerWidth() + " bottom+" + ( $message.outerHeight() + 8 );
				break;
			case "rightTop":
				my = "left top";
				at = "right-20 top-" + ( $message.outerHeight() + 8 );
				break;
			case "rightBottom":
				my = "left bottom";
				at = "right-20 bottom+" + ( $message.outerHeight() + 8 );
				break;
			case "right":
				my = "left middle";
				at = "right+15 middle";
				break;
			default:
				break;
		};
		
		$message.position({
			my: my,
			at: at,
			of: $element
		});
		
		$component.addClass("coral-validate-error");
		//}, 0);
		var that = this;
		// 校验提示信息（不包括红色边框），在2秒后消失。
		setTimeout(function() {
			//that.hideErrorsTip($element);
		}, 2000);	
	},
	/**
	 * 清除页面上的错误提示信息，以及元素的红色提示边框
	 */
	clearErrors:function(context){
		var fields = $.coral.findComponent( ".ctrl-form-element", context ),
			i = 0, 
			l = fields.length;
		for (i; i < l; i++) {
	        var c = fields[i];
	        c.clearError();
		}
	},
	clear: function() {
		$(".coral-validate-state-error").remove();
		$( ".coral-errorIcon" ).remove();
		$(".coral-validate-error").removeClass("coral-validate-error");
	},
	hideErrors: function ( element ) {
		var $element = $(element);
		var id = $element.attr("id");
		$("." + id + validateSuffix).remove();
		$( ".coral-errorIcon", $element ).remove();
		$element.removeClass("coral-validate-error hasErrorIcon ");
	},
        	
	hideErrorsTip: function(element){
		var $element = $(element);
		var id = $element.attr("id");
		$("."+id + validateSuffix).remove();
	},
	_showTooltip: function(element, tips){
		var $element = $(element);
		var $message = $("<div class='coral-validate-tooltip'>" + tips + "</div>");
		$(document.body).after($message);
		var position = $element.position();
		$message.position({
			my: "left top",
			at: "right+20 top+" + ($(element).height()/2 - $message.outerHeight()/2),
			of: $element
		});
	},
	_hideTooltip: function(element){
		var $element = $(element);
		$('.coral-validate-tooltip').remove();
	},
	//截取字符串，根据长度（支持中英文混合）
	_getSubString: function(str, n) { 
		var r=/[^\x00-\xff]/g;			
		if(str.replace(r,"mm").length<=n)
			return str;
		
		var m = Math.floor(n/2); 
		for(var i = m; i < str.length; i++) {
			if (str.substr(0, i).replace(r,"mm").length >= n) { 
				return str.substr(0,i); 
			}
		}
		
		return str; 
	},
	//获取字符串的字节长度
	_getByteLength: function (str) {			
		var length = 0; 

		for (var i = 0; i < str.length; i++) {
			var item = str.charAt(i);
			
			if (item.match(/[^\x00-\xff]/ig) != null) //全角 
				length += 2; 
			else 
				length += 1; 
		} 
		return length; 
	}, 
	//判断是否是正整数
	_isPositiveInteger: function (str) {
		return parseInt(str).toString() === "NaN" ? false : (parseInt(str) > 0 ? true : false);
	},
	showTooltip: function (el, validTypeOptions){
		validTypeOptions = $.extend(true,{},$.validate.validTypeOptions,validTypeOptions);
		var showTooltip = validTypeOptions.maxlength.showTooltip;			
		if (!showTooltip) return;	
		$(el).attr("tooltips","tooltips");
		$(el).tooltip({
			items : "[tooltips]"
		}).addClass("hasTooltip");
		$.validate.getMaxLength(el);
		$(el).on({
			"keyup": function(e){
				$.validate.getMaxLength(el);
			}
		})
	},
	getMaxLength: function(el){
		var number = 0,
			val = $(el).val(),
		    type = $(el).attr( "component-role" ),
		    isLabel = $(el)[type]("option","isLabel"),
		    readonly = $(el)[type]("option","readonly"),
		    readonlyInput = $(el)[type]("option","readonlyInput"),
		    length = $.validate._getByteLength(val),
		    maxlength = $(el)[type]("option","maxlength"),
		    number = maxlength - length;
		if(isLabel == false && readonly == false && readonlyInput == false){
			$(el).tooltip("option","content","还可以输入"+ number +"个字符");
		}
	},
	/**
	 * 强制校验处理方法
	 **/
	restrictInput: function ( el, event, hasTips ) {
		var type = $( el ).attr( "component-role" ),
			opts = $( el )[type]("option"),
			result = null;

		$.each($.validate.validTypeNames, function(i, d) {
			var opt = opts[d],// maxlength opt -> 10
				arg1 = $.validate.validTypeOptions[d],// {}				
				arg2 = $.validate.validTypeOptions[opt],// {}
				argKey = null,
				argValue = null;
				
			if (opt && arg1) {
				argKey = d;
				argValue = arg1;
			} else if (opt && arg2) {
				argKey = opt;
				argValue = arg2;
			}

			if ( argKey && argValue ) {
				if ( argValue.restrictInput ) {
					result = $.validate.forbiddenInput(argKey, event, el);
				}
			}
		});	

		return result;
    },
    /**
    	禁止输入处理
    **/
    forbiddenInput: function (arg, event, el) {
    	var type = $( el ).attr( "component-role" ),
			opts = $( el )[type]("option"),
			result = null;
    	var val = el.val();
    	switch (arg) {
			case "maxlength":
				if ( ( !event.ctrlKey && -1 == $.inArray(event.keyCode,[8, 46, 9, 37, 39, 35, 36]) ) && ( "" !== $.validate._checkMaxlength(opts[arg], val+String.fromCharCode(event.keyCode)) ) ) {
					var length = 0,
					    string = [];
					for ( var i = 0; i < val.length; i++ ){
						var item = val.charAt(i);														
						if ( item.match(/[^\x00-\xff]/ig) !== null ){//全角 
							length += 2; 
							if ( length <= opts[arg] ){
								string.push(item);
							}
					}
						else {
							length += 1; 
							if ( length <= opts[arg] ){
								string.push(item);
							}
						}
					} 
					el.val(string.join(""));
					result =  false;
				}
				break;
			case "number":
				if ( ( !event.ctrlKey && -1 == $.inArray(event.keyCode,[8, 46, 9, 37, 39, 35, 36]) ) && ( event.keyCode < 48 || (event.keyCode > 57 && event.keyCode < 96) || event.keyCode > 105 ) ) {
					result = false;
				}
				var re = /^[0-9]+.?[0-9]*$/;
				if ( !re.test(val)){
					$( el ).val("");
				}
				break;
			default:
				break;
		}

		return result;
    },
    _changeRequiredMark: function($field, value) {
    	var type = $field.attr("component-role");
    	var form = $field.closest(".ctrl-init-form"),
			formOptions;
		if ( form.length > 0 ) {
			formOptions = form.form("option");
		}
		var optionShowRequired = $field[type]("option", "showRequiredMark"),
			optionHideRequired = $field[type]("option", "hideRequiredMark"),
			showRequiredMark = optionShowRequired == null ? 
				(formOptions && formOptions.showRequiredMark) || $.validate.showRequiredMark : optionShowRequired,
			hideRequiredMark = optionHideRequired == null ? 
				(formOptions && formOptions.hideRequiredMark) || $.validate.hideRequiredMark : optionHideRequired;
		showRequiredMark = $.coral.toFunction(showRequiredMark);
		hideRequiredMark = $.coral.toFunction(hideRequiredMark);
		if ( value === true ) {
			showRequiredMark && showRequiredMark.apply( $field[0], [{component: $field[type]( "component" )}] );
		} else {
			hideRequiredMark && hideRequiredMark.apply( $field[0], [{component: $field[type]( "component" )}] );
		}
    },
	/**
	 * 校验表单元素的方法
	 **/
	validItem: function ( el, event, hasTips ) {
		var options = this.options;
		var data = {
			validoptions: options,
			hasTips: hasTips,
			element: el
		};
		var type = $( el ).attr( "component-role" ),
			opts = $( el )[type]("option"),
			excluded = opts.excluded;
		if (excluded) return ;
	 	$.validate.validateField( event ,data );    	 	
    },
	setExcluded: function(isSet, context){
		var fields = $.coral.findComponent( ".ctrl-form-element", $(context) ),
			i = 0, 
			l = fields.length;
		for (i; i < l; i++) {
	        var c = fields[i];
	        c._setOption("excluded", isSet);
	        c.component().removeClass( "coral-validate-error" );
	        c.component().removeAttr( "data-errors" ); 
	        $( ".coral-errorIcon", c.component() ).remove();
	        // clear error states
	        c.element.prop( "isError", false );
		}
	}
};
	
$.component( "coral.validate", {
	version: $.coral.version,
	options: {
		onStatus: "onstatus",
		showStar: true, // 必输项，是否显示 “*”
		errMessages: {
			required: "* 必输项",
			minLength: "{0}",
			maxLength: "{0}",
			pattern: "",
			validType: {
				number: ""	
			},
			valid: ""
		}, 
		fields: {},
		errMsgPosition: "leftBottom", // "leftTop", "leftBottom", "rightTop", "rightBottom", "right"
		excluded: [":disabled", ":hidden", ":not(:visible)"] // ":disabled,:hidden,:not(:visible)" 校验的时候排除不检验的元素
	},
	
	/**
	 * judge the field need valid or not
	 **/
	_isExclud: function ( $field, excluded ) {
    	 if ( !excluded ) {
    		 return false;
    	 }
    	 
    	 var length = excluded.length;
    	 var type = $field.attr( "component-role" ),
    	 	opts = $field[type]("option"),
    	 	isExcluded = opts.excluded,
			$component = $field[type]("component");
    	 for ( var i = 0; i < length; i++ ) {
             if ( ( "string" === typeof excluded[i] && 
            		 $component.is(excluded[i]) ) || isExcluded ){
                 return true;
             }
         }
    	 return false;
     },
	/**
	 * 构建组件
	 * @return
	 */
	_create: function() {
		var that = this;
		this.element.addClass( "coral-validate ctrl-init ctrl-init-validate" );
		//that._initField();
		this.element.addClass( "inited-validate" );
	},
	_destroy: function(){
		this.element.removeClass( "coral-validate ctrl-init ctrl-init-validate" );
		this._super();
	},
	//设置属性处理
	_setOption: function( key, value ) {
		//默认属性不允许更改
		if (key == "id" || key == "name") {
			return;
		}
		
		this._super( key, value );
		
		return ;
	},
	/**
	 * remove field on form
	 */
	removeField: function(){
		
	},
	/**
	 * update rules on field
	 */ 
	updateField: function(){
		
	},
	/**
	 * 绑定触发校验的事件
	 * @return 
	 */
	_initField: function() {
		//var fields = $(this.element).parent().find($("[class*='coral-validation-']"));
		var fields = $( this.element ).find( ".ctrl-form-element" );
		//$.validate.addField( fields, this.options );
		
	},
     /**
	 *  校验所有元素
	 *  @param el 组件jquery对象
	 *  @return {boolean} true代表通过，false代表不通过
	 */
	valid: function( el ) {
		if ( !el ) {
			el = this.element;
		}
		
		var that = this,
			fields = null,
			errCount = 0,
			excluded = this.options.excluded,
			errTipsType = null,
			hasTips = true;
		
		if ( excluded && "string" === typeof excluded ) {
	         excluded = $.map( excluded.split( ',' ), function( item ) {
	             return $.trim( item );
	         });
	    }
		
		if ( el.is($("[class*='coral-validation-']")) ) {
			fields = $(el);
		} else {
			fields = $(el).find($("[class*='coral-validation-']"));
		}
		if ( "form" === $(el)[0].tagName.toLowerCase()) {
			errTipsType = $(el).form("option", "errTipsType");
		}
		errTipsType = "none";
		fields.each( function( index ) {
			var $field = $( this ),
				type = $.validate.getFieldType( $field );
			 // 如果在排除范围内，则返回，不校验
			if ( that._isExclud( $field, excluded) ) {
	    		 return ;
			}
			if ( "none" === errTipsType ) {
				hasTips = false;
			}
			$.validate.validItem($field, null, hasTips);
			//$field.trigger( type + that.options.onStatus + ".validate",  { hasTips: hasTips } );
			 
			if ( $field.prop( "isError" ) ) {
				if ( "first" === errTipsType ) {
					hasTips = false;
				}
				if(errCount == 0){
					$field[type]("focus");
				}
				++ errCount;
			}
		});
		return ( errCount > 0 ? false : true );
	}	
});
// noDefinePart
} ) );