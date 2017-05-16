( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*
**
 * formatter for values but most of the values if for grid
 * Some of this was inspired and based on how YUI does the table datagrid but in jQuery fashion
 * we are trying to keep it as light as possible
 * Joshua Burnett josh@9ci.com	
 * http://www.greenbill.com
 *
 * Changes from Tony Tomov tony@trirand.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * 
**/

(function() {
"use strict";	
	$.fmatter = {};
	//opts can be id:row id for the row, rowdata:the data for the row, colmodel:the column model for this column
	//example {id:1234,}
	$.extend($.fmatter,{
		isBoolean : function(o) {
			return typeof o === 'boolean';
		},
		isObject : function(o) {
			return (o && (typeof o === 'object' || $.isFunction(o))) || false;
		},
		isString : function(o) {
			return typeof o === 'string';
		},
		isNumber : function(o) {
			return typeof o === 'number' && isFinite(o);
		},
		isNull : function(o) {
			return o === null;
		},
		isUndefined : function(o) {
			return typeof o === 'undefined';
		},
		isValue : function (o) {
			return (this.isObject(o) || this.isString(o) || this.isNumber(o) || this.isBoolean(o));
		},
		isEmpty : function(o) {
			if(!this.isString(o) && this.isValue(o)) {
				return false;
			}else if (!this.isValue(o)){
				return true;
			}
			o = $.trim(o).replace(/\&nbsp\;/ig,'').replace(/\&#160\;/ig,'');
			return o==="";	
		}
	});
	/**
	 * 为单元格设置值的时候会调用此方法，包括编辑和添加数据
	 * 如果是带隐藏域的组件，在编辑的情况下会将隐藏值传过来
	 * 转码功能：如果是revertCode为false，只有编辑的时候才需要转码
	 * 如果revertCode为true，则需要formatter里面进行转码
	 */
	$.fn.fmatter = function(formatType, cellval, opts, rwd, act) {
		// build main options before element iteration
		var v=cellval;
		opts = $.extend({}, $.grid.formatter, opts);
		//footer没有id
		// 兼容旧的项目的写法里面的id是数字不是字符串。
		if (act === "edit" && opts.rowId+"") {			
			$("#"+opts.rowId, this.element).children("td[aria-describedby$='"+opts.colModel.name+"']").attr("data-org",v); 
		}
		if (act === "edit" && opts.colModel.cellEditoptions){
			var cOpts = $.coral.toFunction(opts.colModel.cellEditoptions).call(this,v,opts,rwd);
			formatType = cOpts && cOpts.type ? cOpts.type : formatType;
			if (formatType === "combobox" || formatType === "combogrid" || formatType === "combotree" || formatType === "convertCode"){
				return $.fn.fmatter["convertCode"].call(this, cellval, opts, rwd, act);
			} else {
				return v;
			}
		} 
		try {
			v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
		} catch(fe){}
		return v;
	};
	$.fmatter.util = {
		// Taken from YAHOO utils
		NumberFormat : function(nData,opts) {
			if(!$.fmatter.isNumber(nData)) {
				nData *= 1;
			}
			if($.fmatter.isNumber(nData)) {
				var bNegative = (nData < 0);
				var sOutput = nData + "";
				var sDecimalSeparator = (opts.decimalSeparator) ? opts.decimalSeparator : ".";
				var nDotIndex;
				if($.fmatter.isNumber(opts.decimalPlaces)) {
					// Round to the correct decimal place
					var nDecimalPlaces = opts.decimalPlaces;
					var nDecimal = Math.pow(10, nDecimalPlaces);
					sOutput = Math.round(nData*nDecimal)/nDecimal + "";
					nDotIndex = sOutput.lastIndexOf(".");
					if(nDecimalPlaces > 0) {
					// Add the decimal separator
						if(nDotIndex < 0) {
							sOutput += sDecimalSeparator;
							nDotIndex = sOutput.length-1;
						}
						// Replace the "."
						else if(sDecimalSeparator !== "."){
							sOutput = sOutput.replace(".",sDecimalSeparator);
						}
					// Add missing zeros
						while((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
							sOutput += "0";
						}
					}
				}
				if(opts.thousandsSeparator) {
					var sThousandsSeparator = opts.thousandsSeparator;
					nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
					nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
					var sNewOutput = sOutput.substring(nDotIndex);
					var nCount = -1;
					for (var i=nDotIndex; i>0; i--) {
						nCount++;
						if ((nCount%3 === 0) && (i !== nDotIndex) && (!bNegative || (i > 1))) {
							sNewOutput = sThousandsSeparator + sNewOutput;
						}
						sNewOutput = sOutput.charAt(i-1) + sNewOutput;
					}
					sOutput = sNewOutput;
				}
				// Prepend prefix
				sOutput = (opts.prefix) ? opts.prefix + sOutput : sOutput;
				// Append suffix
				sOutput = (opts.suffix) ? sOutput + opts.suffix : sOutput;
				return sOutput;
				
			} else {
				return nData;
			}
		},
		// Tony Tomov
		// PHP implementation. Sorry not all options are supported.
		// Feel free to add them if you want
		DateFormat : function (format, date, newformat, opts)  {
			var	token = /\\.|[dDjlNSwzWFmMntLoYyaABgGhHisueIOPTZcrU]/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			msDateRegExp = new RegExp("^\/Date\\((([-+])?[0-9]+)(([-+])([0-9]{2})([0-9]{2}))?\\)\/$"),
			msMatch = ((typeof date === 'string') ? date.match(msDateRegExp): null),
			pad = function (value, length) {
				value = String(value);
				length = parseInt(length,10) || 2;
				while (value.length < length)  { value = '0' + value; }
				return value;
			},
			ts = {m : 1, d : 1, y : 1970, h : 0, i : 0, s : 0, u:0},
			timestamp=0, dM, k,hl,
			dateFormat=["i18n"];
			// Internationalization strings
			dateFormat.i18n = {
				dayNames: opts.dayNames,
				monthNames: opts.monthNames
			};
			if( format in opts.masks ) { format = opts.masks[format]; }
			if( !isNaN( date - 0 ) && String(format).toLowerCase() == "u") {
				//Unix timestamp
				timestamp = new Date( parseFloat(date)*1000 );
			} else if(date.constructor === Date) {
				timestamp = date;
				// Microsoft date format support
			} else if( msMatch !== null ) {
				timestamp = new Date(parseInt(msMatch[1], 10));
				if (msMatch[3]) {
					var offset = Number(msMatch[5]) * 60 + Number(msMatch[6]);
					offset *= ((msMatch[4] == '-') ? 1 : -1);
					offset -= timestamp.getTimezoneOffset();
					timestamp.setTime(Number(Number(timestamp) + (offset * 60 * 1000)));
				}
			} else {
				date = String(date).split(/[\\\/:_;.,\t\T\s-]/);
				format = format.split(/[\\\/:_;.,\t\T\s-]/);
				// parsing for month names
				for(k=0,hl=format.length;k<hl;k++){
					if(format[k] == 'M') {
						dM = $.inArray(date[k],dateFormat.i18n.monthNames);
						if(dM !== -1 && dM < 12){date[k] = dM+1;}
					}
					if(format[k] == 'F') {
						dM = $.inArray(date[k],dateFormat.i18n.monthNames);
						if(dM !== -1 && dM > 11){date[k] = dM+1-12;}
					}
					if(date[k]) {
						ts[format[k].toLowerCase()] = parseInt(date[k],10);
					}
				}
				if(ts.f) {ts.m = ts.f;}
				if( ts.m === 0 && ts.y === 0 && ts.d === 0) {
					return "&#160;" ;
				}
				ts.m = parseInt(ts.m,10)-1;
				var ty = ts.y;
				if (ty >= 70 && ty <= 99) {ts.y = 1900+ts.y;}
				else if (ty >=0 && ty <=69) {ts.y= 2000+ts.y;}
				timestamp = new Date(ts.y, ts.m, ts.d, ts.h, ts.i, ts.s, ts.u);
			}
			
			if( newformat in opts.masks )  {
				newformat = opts.masks[newformat];
			} else if ( !newformat ) {
				newformat = 'Y-m-d';
			}
			var 
				G = timestamp.getHours(),
				i = timestamp.getMinutes(),
				j = timestamp.getDate(),
				n = timestamp.getMonth() + 1,
				o = timestamp.getTimezoneOffset(),
				s = timestamp.getSeconds(),
				u = timestamp.getMilliseconds(),
				w = timestamp.getDay(),
				Y = timestamp.getFullYear(),
				N = (w + 6) % 7 + 1,
				z = (new Date(Y, n - 1, j) - new Date(Y, 0, 1)) / 86400000,
				flags = {
					// Day
					d: pad(j),
					D: dateFormat.i18n.dayNames[w],
					j: j,
					l: dateFormat.i18n.dayNames[w + 7],
					N: N,
					S: opts.S(j),
					//j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th',
					w: w,
					z: z,
					// Week
					W: N < 5 ? Math.floor((z + N - 1) / 7) + 1 : Math.floor((z + N - 1) / 7) || ((new Date(Y - 1, 0, 1).getDay() + 6) % 7 < 4 ? 53 : 52),
					// Month
					F: dateFormat.i18n.monthNames[n - 1 + 12],
					m: pad(n),
					M: dateFormat.i18n.monthNames[n - 1],
					n: n,
					t: '?',
					// Year
					L: '?',
					o: '?',
					Y: Y,
					y: String(Y).substring(2),
					// Time
					a: G < 12 ? opts.AmPm[0] : opts.AmPm[1],
					A: G < 12 ? opts.AmPm[2] : opts.AmPm[3],
					B: '?',
					g: G % 12 || 12,
					G: G,
					h: pad(G % 12 || 12),
					H: pad(G),
					i: pad(i),
					s: pad(s),
					u: u,
					// Timezone
					e: '?',
					I: '?',
					O: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					P: '?',
					T: (String(timestamp).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					Z: '?',
					// Full Date/Time
					c: '?',
					r: '?',
					U: Math.floor(timestamp / 1000)
				};	
			return newformat.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.substring(1);
			});			
		}
	};
	$.fn.fmatter.defaultFormat = function(cellval, opts, rwd, act) {
		return ($.fmatter.isValue(cellval) && cellval!=="" ) ?  cellval : opts.defaultValue ? opts.defaultValue : "&#160;";
	};
	$.fn.fmatter.email = function(cellval, opts, rwd, act) {
		if(!$.fmatter.isEmpty(cellval)) {
			return "<a href=\"mailto:" + cellval + "\">" + cellval + "</a>";
		}else {
			return $.fn.fmatter.defaultFormat(cellval,opts );
		}
	};
	/*$.fn.fmatter.checkbox =function(cval, opts) {
		var op = $.extend({},opts.checkbox), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = $.fn.fmatter.defaultFormat(cval,op);}
		cval=cval+"";cval=cval.toLowerCase();
		var bchk = cval.search(/(false|0|no|off)/i)<0 ? " checked='checked' " : "";
		return "<input type=\"checkbox\" " + bchk  + " value=\""+ cval+"\" offval=\"no\" "+ds+ "/>";
	};*/
	
	$.fn.fmatter.combobox =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.combobox), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		return "<input class=\"parseformatter\" data-formatter=\"combobox\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.combotree =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.combotree), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<input class=\"parseformatter\" data-formatter=\"combotree\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.combogrid =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.combogrid), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<input class=\"parseformatter\" data-formatter=\"combogrid\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.autocomplete =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.autocomplete), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		return "<input class=\"parseformatter\" data-formatter=\"autocomplete\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.toolbar =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.toolbar), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<div class=\"parseformatter\" data-formatter=\"toolbar\" data-pos=\""+opts.pos+"\" "+ds+ "/>";
	};
	$.fn.fmatter.text =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.textbox), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<input class=\"parseformatter\" data-formatter=\"textbox\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.datepicker =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.datepicker), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<input class=\"parseformatter\" data-formatter=\"datepicker\" data-pos=\""+opts.pos+"\" type=\"text\" value=\""+ cval+"\" "+ds+ "/>";
	};
	$.fn.fmatter.textarea =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.textbox), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<textarea class=\"parseformatter\" data-formatter=\"textbox\" data-pos=\""+opts.pos+"\" "+ds+ "/>"+ cval+"</textarea>";
	};
	$.fn.fmatter.progressbar =function(cval, opts, rwd, act) {
		var op = $.extend({},opts.progressbar), ds;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<div class=\"parseformatter\" data-formatter=\"progressbar\" data-pos=\""+opts.pos+"\" "+ds+ "/>";
	};
	/**
	 * 默认会去code里面取编码，如果没有code将data作为编码进行取值赋值的转换
	 */
	$.fn.fmatter.convertCode =function(cval, opts, rwd, act) {
		var options = opts.colModel.formatoptions || opts.colModel.editoptions || {},
			postMode = options.postMode || "value";
		// 处理cellOptions
		var type = "convertCode";
		if(opts.colModel.cellEditoptions){
			var cOpts = $.coral.toFunction(opts.colModel.cellEditoptions).call(this,cval,options,rwd);
			options = cOpts && cOpts.cellEditoptions ? cOpts.cellEditoptions : options;
			type = cOpts && cOpts.type? cOpts.type:"convertCode";
		}
		if (type !=="convertCode" && type !=="combobox"&& type !=="combogrid" ) return cval;
		
		var code = options.data,
			dataStructure = options.dataStructure || "list",
			valueField,
			textField,
			separator = options.separator || ",";
		if (dataStructure == 'tree') {
			valueField = options.valueField || "id";
			textField = options.textField || "name";
		} else {
			valueField = opts.colModel.edittype == "combogrid" ? options.valueField || "id" : options.valueField || "value";
			textField = opts.colModel.edittype == "combogrid"?  options.textField || "name": options.textField || "text";
		}
		//formatter的时候，如果cellValue是空值，页面上可能会出现undefined
		if ( typeof ( cval ) === "undefined" || cval === null) return "";
		/**
		 * postMode为value的情况下才考虑转码
		 */
		if ( postMode != "value" ) {
			return cval;
		}
		// setCell会有问题，，此时有code了
		if ( opts.colModel.edittype == "combobox" && options.code ){
			code = options.code;
		}
		if ( opts.colModel.edittype == "combotree" && options.code ){
			code = options.code;
		}
		if ( opts.colModel.edittype == "combogrid" && options.code ){
			code = options.code;
		}
		if ( opts.colModel.edittype == "combotree" ){
			dataStructure = "tree";
		}
		if ( opts.colModel.edittype == "autocomplete" && typeof( options.code ) == "string" ) {
			code = options.code;
		}
		if ( opts.colModel.edittype == "autocomplete" && options.source ) {
			code = options.source;
		}
		var valArr = [],
			has = false,
			cArr = cval.toString().split( separator );
		if(opts.colModel.cellEditoptions){
			if ( dataStructure == "tree" ) {
				//code可能是tree或者普通array
				for( var i=0; i<cArr.length; i++) {
					convtree(code, cArr[i],valArr);
				}
				
			} else {// default dataStructure is list
				for ( var i=0; i<cArr.length; i++ ) {
					for ( var j=0; j<code.length; j++ ){
						if ( code[j][valueField] == cArr[i] ) {
							valArr.push( code[j][textField] );
							has = true;
						} 
					}
					if ( !has && !options.forceSelection ) {
						valArr.push( cArr[i] );
					}
					has = false;
				}			}
		} else {
			for ( var i=0; i<cArr.length; i++ ) {
				var t = options.tempData[cArr[i]];
				if (t) {
					valArr.push( options.tempData[cArr[i]][textField] );
					has = true;
				}
				if ( !has && !options.forceSelection ) {
					valArr.push( cArr[i] );
				}
				has = false;
			}
		}
		return valArr.join( separator );
		
	};
	function convtree(node,v,push){
		for ( var j=0; j<node.length; j++ ) {
			if ( node[j].id == v) {
				push.push(node[j].name);
			} else if ( node[j].children ) {
				convtree(node[j].children,v,push);
			} 
		}
	}
	$.fn.fmatter.checkbox =function(cval, opts) {
		var op = $.extend({},opts.checkbox), ds;
		var cbv = ["Yes","No"];
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
			if( opts.colModel.formatoptions && opts.colModel.formatoptions.value) {
				cbv = opts.colModel.formatoptions.value.split(":");
			}
		}
		if(op.disabled===true) {ds = "disabled=\"disabled\"";} else {ds="";}
		if($.fmatter.isEmpty(cval) || $.fmatter.isUndefined(cval) ) {cval = "";}
		cval=cval+"";
		//cval=cval.toLowerCase();
		return "<input class=\"parseformatter\" data-formatter=\"checkbox\" value='"+cval+"' data-pos=\""+opts.pos+"\" type=\"checkbox\" "+ds+ "/>";
	};
	
	$.fn.afterFmatter =function( colModel ) {
		var that = this;
		$(".parseformatter", that.element).each(function(){
			$(this).removeClass("parseformatter");
			var pos = $(this).attr("data-pos"),
				dataFormatter = $(this).attr("data-formatter"),
				//value是空格的话取""否则取value本身
				value = $.trim($( this ).val())===""?"":$( this ).val(),
				formatoptions = $.extend(
					{}, 
					that.options.colModel[pos].formatoptions, 
					{
						dataCustom: {
							rowId: $(this).closest("tr")[0].id,
							gridId: that.options.id
						}
					}
				);
			switch (dataFormatter) {
			case "combobox":
		    case "combotree":
		    case "combogrid":
		    case "textbox":	
		    	formatoptions.value = value;
		    	break;
		    case "toolbar":
		    case "progressbar":
		    	break;
		    case "checkbox":
		    	var cbv = ["Yes","No"];
				if( dataFormatter && that.options.colModel[pos].formatoptions.value) {
					cbv = that.options.colModel[pos].formatoptions.value.split(":");
				}
				if ( $(this).val() == cbv[0] ) {
					formatoptions.checked = true;
					//$(this)[dataFormatter]("check");
				} else {
					formatoptions.checked = false;
					//$(this)[dataFormatter]("uncheck");
				}
				break;
			}
			$(this)[dataFormatter](formatoptions);
		});
	};
	$.fn.fmatter.link = function(cellval, opts) {
		var op = {target:opts.target};
		var target = "";
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.target) {target = 'target=' + op.target;}
		if(!$.fmatter.isEmpty(cellval)) {
			return "<a "+target+" href=\"" + cellval + "\">" + cellval + "</a>";
		}else {
			return $.fn.fmatter.defaultFormat(cellval,opts);
		}
	};
	$.fn.fmatter.showlink = function(cellval, opts) {
		var op = {baseLinkUrl: opts.baseLinkUrl,showAction:opts.showAction, addParam: opts.addParam || "", target: opts.target, idName: opts.idName},
		target = "", idUrl;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if(op.target) {target = 'target=' + op.target;}
		idUrl = op.baseLinkUrl+op.showAction + '?'+ op.idName+'='+opts.rowId+op.addParam;
		if($.fmatter.isString(cellval) || $.fmatter.isNumber(cellval)) {	//add this one even if its blank string
			return "<a "+target+" href=\"" + idUrl + "\">" + cellval + "</a>";
		}else {
			return $.fn.fmatter.defaultFormat(cellval,opts);
		}
	};
	$.fn.fmatter.integer = function(cellval, opts) {
		var op = $.extend({},opts.integer);
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.number = function (cellval, opts) {
		var op = $.extend({},opts.number);
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.currency = function (cellval, opts) {
		var op = $.extend({},opts.currency);
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		if($.fmatter.isEmpty(cellval)) {
			return op.defaultValue;
		}
		return $.fmatter.util.NumberFormat(cellval,op);
	};
	$.fn.fmatter.date = function (cellval, opts, rwd, act) {
		var op = $.extend({},opts.date);
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend({},op,opts.colModel.formatoptions);
		}
		var srcDateFormat = op.srcDateFormat || op.dateFormat;
		if (op.valueType == "long") {
			op.restrictConvert = (op.restrictConvert == undefined) ? true : op.restrictConvert;
			cellval = $.coral.longToStringDate(cellval, op);
		}
		var date = $.coral.parseDate(srcDateFormat, cellval||"",op);
		//if null retrun empty string
		return $.coral.formatDate(op.dateFormat, date, op)||"";
		/*if(!op.reformatAfterEdit && act=='edit'){
			return $.fn.fmatter.defaultFormat(cellval, opts);
		} else if(!$.fmatter.isEmpty(cellval)) {
			return  $.fmatter.util.DateFormat(op.srcformat,cellval,op.newformat,op);
		} else {
			return $.fn.fmatter.defaultFormat(cellval, opts);
		}*/
	};
	$.fn.fmatter.select = function (cellval,opts) {
		// grid specific
		cellval = cellval + "";
		var oSelect = false, ret=[], sep, delim;
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)){
			oSelect= opts.colModel.formatoptions.value;
			sep = opts.colModel.formatoptions.separator === undefined ? ":" : opts.colModel.formatoptions.separator;
			delim = opts.colModel.formatoptions.delimiter === undefined ? ";" : opts.colModel.formatoptions.delimiter;
		} else if(!$.fmatter.isUndefined(opts.colModel.editoptions)){
			oSelect= opts.colModel.editoptions.value;
			sep = opts.colModel.editoptions.separator === undefined ? ":" : opts.colModel.editoptions.separator;
			delim = opts.colModel.editoptions.delimiter === undefined ? ";" : opts.colModel.editoptions.delimiter;
		}
		if (oSelect) {
			var	msl =  opts.colModel.editoptions.multiple === true ? true : false,
			scell = [], sv;
			if(msl) {scell = cellval.split(",");scell = $.map(scell,function(n){return $.trim(n);});}
			if ($.fmatter.isString(oSelect)) {
				// mybe here we can use some caching with care ????
				var so = oSelect.split(delim), j=0;
				for(var i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,function(n,i){if(i>0) {return n;}}).join(sep);
					}
					if(msl) {
						if($.inArray(sv[0],scell)>-1) {
							ret[j] = sv[1];
							j++;
						}
					} else if($.trim(sv[0])==$.trim(cellval)) {
						ret[0] = sv[1];
						break;
					}
				}
			} else if($.fmatter.isObject(oSelect)) {
				// this is quicker
				if(msl) {
					ret = $.map(scell, function(n){
						return oSelect[n];
					});
				} else {
					ret[0] = oSelect[cellval] || "";
				}
			}
		}
		cellval = ret.join(", ");
		return  cellval === "" ? $.fn.fmatter.defaultFormat(cellval,opts) : cellval;
	};
	$.fn.fmatter.rowactions = function(rid,gid,act,pos) {
		var op ={
			keys:false,
			onEdit : null, 
			onSuccess: null, 
			afterSave:null,
			onError: null,
			afterRestore: null,
			extraparam: {},
			url: null,
			delOptions: {},
			editOptions : {}
		};
		rid = $.grid.coralID( rid );
		gid = $.grid.coralID( gid );
		var cm = $('#'+gid)[0].options.colModel[pos];
		if(!$.fmatter.isUndefined(cm.formatoptions)) {
			op = $.extend(op,cm.formatoptions);
		}
		if( !$.fmatter.isUndefined($('#'+gid)[0].options.editOptions) ) {
			op.editOptions = $('#'+gid)[0].options.editOptions;
		}
		if( !$.fmatter.isUndefined($('#'+gid)[0].options.delOptions) ) {
			op.delOptions = $('#'+gid)[0].options.delOptions;
		}
		var $t = $("#"+gid)[0];
		var saverow = function( rowid, res)	{
			if($.isFunction(op.afterSave)) { op.afterSave.call($t, rowid, res); }
			$("tr#"+rid+" div.coral-inline-edit, "+"tr#"+rid+" div.coral-inline-del","#"+gid + ".coral-grid-btable:first").show();
			$("tr#"+rid+" div.coral-inline-save, "+"tr#"+rid+" div.coral-inline-cancel","#"+gid+ ".coral-grid-btable:first").hide();
		},
		restorerow = function( rowid)	{
			if($.isFunction(op.afterRestore) ) { op.afterRestore.call($t, rowid); }
			$("tr#"+rid+" div.coral-inline-edit, "+"tr#"+rid+" div.coral-inline-del","#"+gid+ ".coral-grid-btable:first").show();
			$("tr#"+rid+" div.coral-inline-save, "+"tr#"+rid+" div.coral-inline-cancel","#"+gid+ ".coral-grid-btable:first").hide();
		};
		if( $("#"+rid,"#"+gid).hasClass("grid-new-row") ){
			var opers = $t.options.prmNames,
			oper = opers.oper;
			op.extraparam[oper] = opers.addoper;
		}
		switch(act)
		{
			case 'edit':
				$('#'+gid).grid('editRow',rid, op.keys, op.onEdit, op.onSuccess, op.url, op.extraparam, saverow, op.onError,restorerow);
				$("tr#"+rid+" div.coral-inline-edit, "+"tr#"+rid+" div.coral-inline-del","#"+gid+ ".coral-grid-btable:first").hide();
				$("tr#"+rid+" div.coral-inline-save, "+"tr#"+rid+" div.coral-inline-cancel","#"+gid+ ".coral-grid-btable:first").show();
				$($t).triggerHandler("jqGridAfterGridComplete");
				break;
			case 'save':
				if ( $('#'+gid).grid('saveRow',rid,  op.onSuccess,op.url, op.extraparam, saverow, op.onError,restorerow) ) {
				$("tr#"+rid+" div.coral-inline-edit, "+"tr#"+rid+" div.coral-inline-del","#"+gid+ ".coral-grid-btable:first").show();
				$("tr#"+rid+" div.coral-inline-save, "+"tr#"+rid+" div.coral-inline-cancel","#"+gid+ ".coral-grid-btable:first").hide();
				$($t).triggerHandler("jqGridAfterGridComplete");
				}
				break;
			case 'cancel' :
				$('#'+gid).grid('restoreRow',rid, restorerow);
				$("tr#"+rid+" div.coral-inline-edit, "+"tr#"+rid+" div.coral-inline-del","#"+gid+ ".coral-grid-btable:first").show();
				$("tr#"+rid+" div.coral-inline-save, "+"tr#"+rid+" div.coral-inline-cancel","#"+gid+ ".coral-grid-btable:first").hide();
				$($t).triggerHandler("jqGridAfterGridComplete");
				break;
			case 'del':
				$('#'+gid).grid('delGridRow',rid, op.delOptions);
				break;
			case 'formedit':
				$('#'+gid).grid('setSelection',rid);
				$('#'+gid).grid('editGridRow',rid, op.editOptions);
				break;
		}
	};
	$.fn.fmatter.actions = function(cellval,opts) {
		var op ={keys:false, editbutton:true, delbutton:true, editformbutton: false};
		if(!$.fmatter.isUndefined(opts.colModel.formatoptions)) {
			op = $.extend(op,opts.colModel.formatoptions);
		}
		var rowid = opts.rowId, str="",ocl;
		if(typeof(rowid) =='undefined' || $.fmatter.isEmpty(rowid)) {return "";}
		if(op.editformbutton){
			ocl = "onclick=jQuery.fn.fmatter.rowactions('"+rowid+"','"+opts.gid+"','formedit',"+opts.pos+"); onmouseover=jQuery(this).addClass('coral-state-hover'); onmouseout=jQuery(this).removeClass('coral-state-hover'); ";
			str =str+ "<div title='"+$.grid.nav.edittitle+"' style='float:left;cursor:pointer;' class='coral-pg-div coral-inline-edit' "+ocl+"><span class='coral-icon coral-icon-pencil'></span></div>";
		} else if(op.editbutton){
			ocl = "onclick=jQuery.fn.fmatter.rowactions('"+rowid+"','"+opts.gid+"','edit',"+opts.pos+"); onmouseover=jQuery(this).addClass('coral-state-hover'); onmouseout=jQuery(this).removeClass('coral-state-hover') ";
			str =str+ "<div title='"+$.grid.nav.edittitle+"' style='float:left;cursor:pointer;' class='coral-pg-div coral-inline-edit' "+ocl+"><span class='coral-icon coral-icon-pencil'></span></div>";
		}
		if(op.delbutton) {
			ocl = "onclick=jQuery.fn.fmatter.rowactions('"+rowid+"','"+opts.gid+"','del',"+opts.pos+"); onmouseover=jQuery(this).addClass('coral-state-hover'); onmouseout=jQuery(this).removeClass('coral-state-hover'); ";
			str = str+"<div title='"+$.grid.nav.deltitle+"' style='float:left;margin-left:5px;' class='coral-pg-div coral-inline-del' "+ocl+"><span class='coral-icon coral-icon-trash'></span></div>";
		}
		ocl = "onclick=jQuery.fn.fmatter.rowactions('"+rowid+"','"+opts.gid+"','save',"+opts.pos+"); onmouseover=jQuery(this).addClass('coral-state-hover'); onmouseout=jQuery(this).removeClass('coral-state-hover'); ";
		str = str+"<div title='"+$.grid.edit.bSubmit+"' style='float:left;display:none' class='coral-pg-div coral-inline-save' "+ocl+"><span class='coral-icon coral-icon-disk'></span></div>";
		ocl = "onclick=jQuery.fn.fmatter.rowactions('"+rowid+"','"+opts.gid+"','cancel',"+opts.pos+"); onmouseover=jQuery(this).addClass('coral-state-hover'); onmouseout=jQuery(this).removeClass('coral-state-hover'); ";
		str = str+"<div title='"+$.grid.edit.bCancel+"' style='float:left;display:none;margin-left:5px;' class='coral-pg-div coral-inline-cancel' "+ocl+"><span class='coral-icon coral-icon-cancel'></span></div>";
		return "<div style='margin-left:8px;'>" + str + "</div>";
	};
	/**
	 * 
	 * grid特殊字符转码说明：
	 * 只针对textbox的情形，formattype=textbox的情形调用textbox本身的getValue方法，需要配置textbox的autoDecode为true才能转码，
	 * edittype为text的情形，特殊字符会自动转义
	 * 	
	 * edittype和formattype情形要都测试下面几种情况：
	 *	
	 *	1，初始化的时候data里面为特殊字符或者转义之后的特殊字符：
	 *	a：formattype情况下 data里面特殊字符，显示的是同样的特殊字符；data里面有转义之后的字符，显示的是对应的特殊字符
	 *	b：edittype情况下 data里面特殊字符，显示的是同样的特殊字符；data里面有转义之后的字符，显示的是对应的特殊字符
	 *	
	 *	2，addRowData的data里面为特殊字符或者转义之后的特殊字符：
	 *	a：formattype情况下 data里面有转义字符，显示的是对应的特殊字符；data里面有特殊字符，显示的仍然是特殊字符
	 *	b: editType情况下，data里面有转义字符，显示的是对应的特殊字符，data里面有特殊字符，显示的还是特殊字符
	 *	
	 *	3，setRowData的data里面为特殊字符或者转义之后的特殊字符：
	 *	a：formattype情况下 data里面有转义字符，显示的是对应的特殊字符；data里面有特殊字符，显示的仍然是特殊字符
	 *	b: edittype情况下 data里面有转义字符，显示的是对应的特殊字符，data里面有特殊字符，显示的仍是特殊字符
	 *	
	 *	4，setCell当set的为特殊字符或者转移之后的特殊字符
	 *	a:formattype情况下 set转义字符，显示其对应的特殊字符；set特殊字符，显示同样的特殊字符
	 *	b: edittype情况下set转义字符，显示的是对应的特殊字符，set特殊字符，显示同样的特殊字符
	 *	
	 *	5，getCell当get的单元格里面有特殊字符，或转义之后的特殊字符
	 *	a：formattype情况下 单元格里面有特殊字符，取出来的是对应的转义字符；单元格里面有转义字符，取出来的是转义字符转义之后的字符
	 *	b：edittype情况下 单元格里是特殊字符会得到转义字符
	 *	
	 *	6，getRowData当单元格有特殊字符或转义之后的特殊字符：
	 *	a: formattype情况下 输入特殊字符get到转义字符，输入转义字符get到转义字符转义之后的字符
	 *	b：edittype情况下 输入特殊字符得到转义字符
	 * 
	 * 
	 */
	// state: edittype or formatter
	$.unformat = function (cellval,options,pos,cnt,state) {
		// specific for grid only
		var ret, state = state|| "formatter", formatType = options.colModel[state],editType,
		op =options.colModel.formatoptions || {}, sep,
		re = /([\.\*\_\'\(\)\{\}\+\?\\])/g,
		unformatFunc = options.colModel.unformat||($.fn.fmatter[formatType] && $.fn.fmatter[formatType].unformat);
		unformatFunc = $.coral.toFunction(unformatFunc);
		// 如果是编辑模式的下拉框是无法通过
		/*editType =  $.inArray(options.colModel.edittype,
				["combobox", "combotree", "combogrid", "datepicker", "autocomplete"]);
		if(editType > -1 && options.colModel.revertCode || options.colModel.revertCode){
			if($.inArray(formatType, ["autocomplete","datepicker","combobox","combotree","combogrid"]) === -1){
				formatType = "convertCode";
			}
		}*/
		if ( options.colModel.edittype == "combobox" && options.colModel.revertCode
				|| options.colModel.edittype == "combotree" && options.colModel.revertCode
				|| options.colModel.edittype == "combogrid" && options.colModel.revertCode
				|| options.colModel.edittype == "datepicker" && options.colModel.revertCode
				|| options.colModel.edittype == "autocomplete" && options.colModel.revertCode
				|| options.colModel.revertCode) {
			//如果revertCode为true，则必须保证隐藏值能够动态维护，或者这个隐藏值是不变的
			if (formatType == "autocomplete" || formatType == "datepicker" || formatType == "combobox" || formatType == "combotree" || formatType == "combogrid" ){
				//如果是formatter而不是edit，combobox有自己维护隐藏值的方式
			} else {
				formatType = "convertCode";
			}
		}
		if(typeof unformatFunc !== 'undefined' && $.isFunction(unformatFunc) ) {
			ret = unformatFunc.call(this, $(cellval).text(), options, cellval);
		} else if(!$.fmatter.isUndefined(formatType) && $.fmatter.isString(formatType) ) {
			var opts = $.grid.formatter || {}, stripTag;
			switch(formatType) {
				case 'integer' :
					op = $.extend({},opts.integer,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,'');
					break;
				case 'number' :
					op = $.extend({},opts.number,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text().replace(stripTag,"").replace(op.decimalSeparator,'.');
					break;
				case 'currency':
					op = $.extend({},opts.currency,op);
					sep = op.thousandsSeparator.replace(re,"\\$1");
					stripTag = new RegExp(sep, "g");
					ret = $(cellval).text();
					if (op.prefix && op.prefix.length) {
						ret = ret.substr(op.prefix.length);
					}
					if (op.suffix && op.suffix.length) {
						ret = ret.substr(0, ret.length - op.suffix.length);
					}
					ret = ret.replace(stripTag,'').replace(op.decimalSeparator,'.');
					break;
				case 'checkbox':
					ret = $.unformat.checkbox(cellval,options,pos,cnt);
					break;
				case 'select' :
					ret = $.unformat.select(cellval,options,pos,cnt);
					break;
				case 'date' :
					ret = $.unformat.date(cellval,options,pos,cnt);
					break;
				case 'combobox' :
				case 'combogrid' :
				case 'combotree' :
					ret = $.unformat[ formatType ](cellval,options,pos,cnt);
					break;
				case 'datepicker' :
					ret = $.unformat.datepicker(cellval,options,pos,cnt);
					break;
				case 'autocomplete' :
					ret = $.unformat.autocomplete(cellval,options,pos,cnt);
					break;
				case 'text' :
				case 'textarea' :
					ret = $.unformat.textbox(cellval,options,pos,cnt);
					break;
				case 'convertCode' :
					if (options.colModel.postMode){
						if ( options.colModel.postMode == "value" ){
							ret = $.unformat.convertCode(cellval,options,pos,cnt);
						} else {
							ret= $(cellval).text();
						}

					}else{
						if ( options.colModel.revertCode == true ){
							ret = $.unformat.convertCode(cellval,options,pos,cnt);
						} else {
							ret= $(cellval).text();
						}

					}
/*					if ( cnt == "get" ) {
						if ( options.colModel.revertCode == true ){
							ret = $.unformat.convertCode(cellval,options,pos,cnt);
						} else {
							ret= $(cellval).text();
						}
					} else {
						if ( options.colModel.postMode == "value" ){
							ret = $.unformat.convertCode(cellval,options,pos,cnt);
						} else {
							ret= $(cellval).text();
						}
					}*/
					
					break;
				case 'actions':
					return "";
				default:
					ret= $(cellval).text();
			}
		}
		//针对edittype为text的列进行转码，以后可能会扩充到所有类型的列
		if (options.colModel.edittype=="text"){
			return ret !== undefined ? ret : cnt===true ? $(cellval).text() : $.coral.decode($(cellval).html());
		}
		return ret !== undefined ? ret : cnt===true ? $(cellval).text() : $.grid.htmlDecode($(cellval).html());
	};
	$.unformat.autocomplete = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		if ( options.colModel.revertCode ){
			return  $(cellval).find(".ctrl-init").autocomplete("getValue").toString();
		} else {
			return  $(cellval).find(".ctrl-init").autocomplete("getText");
		}
	};
	$.unformat.combobox = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		if ( options.colModel.revertCode ){
			return  $(cellval).find(".ctrl-init").combobox("getValue");
		} else {
			return  $(cellval).find(".ctrl-init").combobox("getText");
		}
	};
	$.unformat.combotree = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		if ( options.colModel.revertCode ){
			return  $(cellval).find(".ctrl-init").combotree("getValue").toString();
		} else {
			return  $(cellval).find(".ctrl-init").combotree("getText");
		}
	};
	$.unformat.combogrid = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		if ( options.colModel.revertCode ){
			return  $(cellval).find(".ctrl-init").combogrid("getValue");
		} else {
			return  $(cellval).find(".ctrl-init").combogrid("getText");
		}
	};
	$.unformat.textbox = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		return  $(cellval).find(".ctrl-init").textbox("getValue");
	};
	$.unformat.datepicker = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		return  $(cellval).find(".ctrl-init").datepicker("getValue");
	};
	$.unformat.convertCode = function (cellval,options,pos,cnt) {
		return $(cellval).attr("data-org");
	};
	$.unformat.select = function (cellval,options,pos,cnt) {
		// Spacial case when we have local data and perform a sort
		// cnt is set to true only in sortDataArray
		var ret = [];
		var cell = $(cellval).text();
		if(cnt===true) {return cell;}
		var op = $.extend({}, !$.fmatter.isUndefined(options.colModel.formatoptions) ? options.colModel.formatoptions: options.colModel.editoptions),
		sep = op.separator === undefined ? ":" : op.separator,
		delim = op.delimiter === undefined ? ";" : op.delimiter;
		
		if(op.value){
			var oSelect = op.value,
			msl =  op.multiple === true ? true : false,
			scell = [], sv;
			if(msl) {scell = cell.split(",");scell = $.map(scell,function(n){return $.trim(n);});}
			if ($.fmatter.isString(oSelect)) {
				var so = oSelect.split(delim), j=0;
				for(var i=0; i<so.length;i++){
					sv = so[i].split(sep);
					if(sv.length > 2 ) {
						sv[1] = $.map(sv,function(n,i){if(i>0) {return n;}}).join(sep);
					}					
					if(msl) {
						if($.inArray(sv[1],scell)>-1) {
							ret[j] = sv[0];
							j++;
						}
					} else if($.trim(sv[1])==$.trim(cell)) {
						ret[0] = sv[0];
						break;
					}
				}
			} else if($.fmatter.isObject(oSelect) || $.isArray(oSelect) ){
				if(!msl) {scell[0] =  cell;}
				ret = $.map(scell, function(n){
					var rv;
					$.each(oSelect, function(i,val){
						if (val == n) {
							rv = i;
							return false;
						}
					});
					if( typeof(rv) != 'undefined' ) {return rv;}
				});
			}
			return ret.join(", ");
		} else {
			return cell || "";
		}
	};
	$.unformat.date = function (cellval, opts) {
		//将长整型0强制转为1
		if (opts.colModel.formatoptions) {
			opts.colModel.formatoptions.restrictConvert = (opts.colModel.formatoptions.restrictConvert == undefined) ? true :opts.colModel.formatoptions.restrictConvert;
		}
		// TODO: 检查单元格值变化的时候，data-org的值是否跟着改变
		var op = $.extend({}, opts.formatoptions || opts.colModel.formatoptions);
		if ( op.revertCode ){
			if (op.valueType == "long") {
				var cellval = $(cellval).attr("data-org");
				return parseInt(cellval);
			} else {
				return $(cellval).attr("data-org");
			}
			
		} else {
			return $(cellval).text();
		}
		
		/*var op = $.grid.formatter.date || {};
		if(!$.fmatter.isUndefined(opts.formatoptions)) {
			op = $.extend({},op,opts.formatoptions);
		}		
		if(!$.fmatter.isEmpty(cellval)) {
			return  $.fmatter.util.DateFormat(op.newformat,cellval,op.srcformat,op);
		} else {
			return $.fn.fmatter.defaultFormat(cellval, opts);
		}*/
	};
	$.unformat.checkbox = function (cellval, opts) {
		var op = $.extend({}, !$.fmatter.isUndefined(opts.colModel.formatoptions) ? opts.colModel.formatoptions: opts.colModel.editoptions);

		var cbv = (op.value) ? op.value.split(":") : ["Yes","No"];
		
		return $('input',cellval).is(":checked") ? cbv[0] : cbv[1];
	};
})();
// noDefinePart
} ) );