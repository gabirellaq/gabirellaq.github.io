( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./inputbase",
			"./spinner",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
var datepicker_instActive;
var formatOptions = {
	  ymdFormat: ["dd","MMdd","yyyyMM","yyyyMMdd"],
	  ymFormat:["yyyy","yyyyMM"],
	  yFormat:["yyyy"]
	}
$.coral.trim = function(str) {
	return str.replace(/(^\s*)|(\s*$)/g,"");
}
$.coral.parseDate = function(format, value, options){
	var opts = options,fValue;
	if (format == null || value == null) {
		throw "Invalid arguments";
	}
	options = options || {};	
	value = (typeof value === "object" ? value.toString() : value + "");
	if (value === "") {
		return null;
	}
	if(opts.model=="timepicker"){
		var date= new Date(),
			timeValue = [];
		format = "yyyy-MM-dd "+opts.timeFormat;
		timeValue.push(date.getFullYear());
		timeValue.push(date.getMonth()+1);
		timeValue.push(date.getDate());
		value = timeValue.join("-") + " " + value;
		
	}
	fValue = configDateFormat(format,value,options);
    format = fValue.format;	    
    value = fValue.value;
	//是否含有时间
	var hasTime = _hasTime(format);

	var iFormat, dim, extra,
		iValue = 0,
		shortYearCutoffTemp = (options ? options.shortYearCutoff : null) || options.shortYearCutoff,
		shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
			new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
		dayNamesShort = (options ? options.dayNamesShort : null) || options.dayNamesShort,
		dayNames = (options ? options.dayNames : null) || options.dayNames,
		monthNamesShort = (options ? options.monthNamesShort : null) || options.monthNamesShort,
		monthNames = (options ? options.monthNames : null) || options.monthNames,
		opts=options.opts,
		year = -1,
		month = -1,
		day = -1,
		doy = -1,
		hur = -1,
		miu = -1,
		sed = -1,
		literal = false,
		date,
		lookAhead = function(match) {
			var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
			if (matches) {
				iFormat++;
			}
			return matches;
		},
		//判断格式匹配长度  如 yyyy 返回4 ，yyy 返回3
		lookMathesLength = function(match){
			var length=1;
			while(iFormat+1 < format.length && format.charAt(iFormat+1) == match){
				length++;
				iFormat++;
			}
			return length;
		},
		getNumber = function(match) {
			var isDoubled = lookAhead(match),
				size = (match === "@" ? 14 : (match === "!" ? 20 :
				(match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
				minSize = (match === "y" ? size : 1),
				digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
				num = value.substring(iValue).match(digits);
			if (!num) {
				throw "Missing number at position " + iValue;
			}
			iValue += num[0].length;
			return parseInt(num[0], 10);
		},
		//带有长度的数字
		getNumber2 = function(match,size) {
			if ( iValue > value.length || iValue == value.length) {
				return -1;
			}
			var digits = new RegExp("^\\d{1," + size + "}"),
				num = value.substring(iValue).match(digits);
			if (!num) {
				throw "Missing number at position " + iValue;
			}
			iValue += num[0].length;
			return parseInt(num[0], 10);
		},
		getName = function(match, shortNames, longNames) {
			var index = -1,
				names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
					return [ [k, v] ];
				}).sort(function (a, b) {
					return -(a[1].length - b[1].length);
				});

			$.each(names, function (i, pair) {
				var name = pair[1];
				if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
					index = pair[0];
					iValue += name.length;
					return false;
				}
			});
			if (index !== -1) {
				return index + 1;
			} else {
				throw "Unknown name at position " + iValue;
			}
		},
		checkLiteral = function() {
			if ("" !== value.charAt(iValue) && value.charAt(iValue) !== format.charAt(iFormat)) {
				return; // 支持没有格式化符号的输入
				throw "Unexpected literal at position " + iValue;
			}
			iValue++;
		};
		

	for (iFormat = 0; iFormat < format.length; iFormat++) {
		if (literal) {
			if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
				literal = false;
			} else {
				checkLiteral();
			}
		} else {
			switch (format.charAt(iFormat)) {
				// 解析日期
				case "d":
					var ml=lookMathesLength("d");
					day = getNumber2("d",ml);
					break;
				case "M":
					ml=lookMathesLength("M");
					month = getNumber2("M",ml);
					break;
				case "y":
					ml=lookMathesLength("y");
					year = getNumber2("y",ml);
					break;

				//解析时间
				case "H":
					ml=lookMathesLength("H");
					hur = getNumber2("H",ml);
					break;	
				case "m":
					ml=lookMathesLength("m");
					miu = getNumber2("m",ml);
					break;	
				case "s":
					ml=lookMathesLength("s");
					sed = getNumber2("s",ml);
					break;
				default:
					checkLiteral();
			}
		}
	}
	if( day == -1 ){
		day = 1;
		if(month == -1 ){
			month = 1;
		}
	}
	
	if(day != -1 && month == -1){
		month = new Date().getMonth() + 1;
	}
	if (year === -1) {
		year = new Date().getFullYear();
	} else if (year < 100) {
		year += new Date().getFullYear() - new Date().getFullYear() % 100 +
			(year <= shortYearCutoff ? 0 : -100);
	}
	if (doy > -1) {
		month = 1;
		day = doy;
		do {
			//dim = this._getDaysInMonth(year, month - 1,inst);
			dim = _getDaysInMonth(year, month - 1);
			if (day <= dim) {
				break;
			}
			month++;
			day -= dim;
		} while (true);
	}
		year = ( year==-1 ? 1 : year);
//			month = ( month==-1 ? 1 : month);
//			day = ( day==-1 ? 1 : day);
		hur = ( hur==-1? 0 : hur);
		miu = ( miu==-1? 0 : miu);
		sed = ( sed==-1? 0 : sed);
	// ??
	date = _daylightSavingAdjustWidthTime(new Date(year, month - 1, day),[hur,miu,sed]);
	if ( 
		( date.getFullYear() !== year || 
		date.getMonth() + 1 !== month ||
		date.getDate() !== day ) ||
		( hasTime && (date.getHours() !== hur || 
		date.getMinutes() !== miu ||
		date.getSeconds() !== sed ) )
		) {
		throw "Invalid date"; // E.g. 31/02/00
		
	}
	return date;
},
$.coral.longToStringDate = function (value, options) {
	var dateFormat;
	// 毫秒级别是无法察觉的，0和1代表的秒是相同的。
	// undefined or null or "" return "";
	// 当restrictConvert为true时,将1强制转换为空值
	if (! $.trim(value) || (value ==1 && options.restrictConvert)) {
		return "";
	}
	if (options == undefined) {
		dateFormat = "yyyy-MM-dd";
	} else {
		dateFormat = options.dateFormat;
	}
	var date = new Date(parseInt(value));
	var str = $.coral.formatDate(dateFormat, date, options);
	return str;
},
$.coral.stringToLongDate = function (value, opts) {
	if (! $.trim(value)) {
		// 当restrictConvert为true时,将空值强制转换为1
		if ( opts.restrictConvert ) {
			return 1;
		} else {
			return "";
		}
	}
	var d = new Date(value);
	var value = d.getTime();
	return value;
},
$.coral.formatDate = function (format, date, options) {
	if (!date) {
		return "";
	}
	var iFormat,
		opts = options,
		dayNamesShort = opts ? opts.dayNamesShort : null,
		dayNames = opts ? opts.dayNames : null,
		monthNamesShort = opts ? opts.monthNamesShort : null,
		monthNames = opts ? opts.monthNames : null,
		// Check whether a format character is doubled
		//是否为两个相同的字符
		lookAhead = function(match) {
			var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
			if (matches) {
				iFormat++;
			}
			return matches;
		},
		//判断格式匹配长度  如 yyyy 返回4 ，yyy 返回3
		lookMathesLength = function(match){
			var length=1;
			while(iFormat+1 < format.length && format.charAt(iFormat+1) == match){
				length++;
				iFormat++;
			}
			return length;
		},
		formatNumber = function(match, value, len) {
			var num = "" + value;
			if (lookAhead(match)) {
				while (num.length < len) {
					num = "0" + num;
				}
			}
			return num;
		},
		formatName = function(match, value, shortNames, longNames) {
			return (lookAhead(match) ? longNames[value] : shortNames[value]);
		},
		output = "",timeput = "",weekput="",
		literal = false;
	if(opts && opts.model=="timepicker"){
		format = "yyyy-MM-dd " + opts.timeFormat;
	}
	if (date) {
		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					output += format.charAt(iFormat);
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d":
						output += formatNumber("d", date.getDate(), 2);
						break;
					case "D":
						output += formatName("D", date.getDay(), dayNamesShort, dayNames);
						break;
					case "M":
						var ml=lookMathesLength("M");
						if(ml==4){
							output += monthNames[date.getMonth()];
						}else if(ml==3){
							output += monthNames[date.getMonth()];
						}else if(ml==2){
							output += (date.getMonth() + 1>9?date.getMonth() + 1:"0"+(date.getMonth() + 1));
						}else if(ml==1){
							output += date.getMonth() + 1;
						}
						
						//output += formatNumber("M", date.getMonth() + 1, 2);//formatName("M", date.getMonth(), monthNamesShort, monthNames);
						break;
					case "y":
						ml=lookMathesLength("y");
						if(ml==4){
							output += date.getFullYear();
						}else if(ml==3){
							output += (date.getFullYear()+"").substring(1,4);
						}else if(ml==2){
							output += ((date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
						}else if(ml==1){
							output += date.getYear() % 100;
						}
						//output += (lookAhead("y") ? date.getFullYear() :
						//	(date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
						break;
						
					// 时间解析	
					case "H":
						ml=lookMathesLength("H");
						if(ml==2){
							output += (date.getHours()>9?date.getHours():"0"+(date.getHours()));
						}else if(ml==1){
							output += date.getHours();
						}
					break;
					case "m":
						ml=lookMathesLength("m");
						if(ml==2){
							output += (date.getMinutes()>9?date.getMinutes():"0"+(date.getMinutes()));
						}else if(ml==1){
							output += date.getMinutes();
						}
					break;
					case "s":
						ml=lookMathesLength("s");
						if(ml==2){
							output += (date.getSeconds()>9?date.getSeconds():"0"+(date.getSeconds()));
						}else if(ml==1){
							output += date.getSeconds();
						}
					break;
					//计算年周数
					case "W":
						ml=lookMathesLength("W");
						if(ml==2){
							output += (options.calculateWeek(date)>9?options.calculateWeek(date):"0"+options.calculateWeek(date));
						}else if(ml==1){
							output += options.calculateWeek(date);
						}
					break;
					//返回一周中的天数
					case "w":
						output += date.getDay();
					break;
					default:
						output += format.charAt(iFormat);
				}
			}
		}
	}
	if(opts  && opts.model == "timepicker"){
		output = output.substring(output.indexOf(" ") + 1,output.length);
	} 
	return output;
},
_hasTime = function( dateFormat ){
	var format = (dateFormat+"");
	if( format.indexOf("H")!=-1 || format.indexOf("m")!=-1 || format.indexOf("s")!=-1 ){
		return true;
	}
	return false;
},
//该方法的作用：根据value得到format
getFormatter = function(value, format, options){
	var inputFormats = null,
		inputFormat = null,
		opts = options;
	if(format.indexOf("y")>-1 && format.indexOf("M")>-1 && format.indexOf("d")>-1){
		inputFormats = "ymdFormat";
	}
	if(format.indexOf("y")>-1 && format.indexOf("M")>-1 && format.indexOf("d")==-1){
		inputFormats = "ymFormat";
	}
	if(format.indexOf("y")>-1 && format.indexOf("M") == -1 && format.indexOf("d") ==-1){
		inputFormats = "yFormat";
	}
	var editFormate = "yyyy-MM-dd";
	var formatOpts = opts.formatOptions || formatOptions;
	var value = (typeof value === "object" ? value.toString() : value + "");
	if (value === "") {
		return null;
	}
	var vValue = value.split(" ");
	if(vValue[0].indexOf("/")>-1 || vValue[0].indexOf("-")>-1){
		var subStr =vValue[0].indexOf("/")>-1 ? vValue[0].split("/") : vValue[0].split("-");
		//实现日期框中月份和日期可以输入个位数字
		for(var i=0;i<subStr.length;i++){
			if(subStr[i].length % 2 != 0  ){
				subStr[i] = "0"+ subStr[i];
			}
			vValue[0] = subStr.join("-");
		}
	}
	var valRep = vValue[0].indexOf("/")>-1 ? vValue[0].replace( /\//g, "" ):vValue[0].replace( /-/g, "" );//去除value中的特殊字符
	var	str1 = vValue[0].split("/").length-1,//value中有几个分隔符
		str2 = vValue[0].split("-").length-1;
	//将去掉特殊分隔符的value的长度与formatOpts里面存的format的长度进行比较，取得长度相等的format
	for(var i=0;i<formatOpts[inputFormats].length;i++){
		if(formatOpts[inputFormats][i].length == valRep.length){
			inputFormat = formatOpts[inputFormats][i];
		}
	}
	return (inputFormat ? inputFormat: format) || null ;
	
},
//得到配置的模式format，和输入框中的value值
configDateFormat = function(format,value,options){
	//若有hh:mm:ss的时候，只取前面的年日月
	var orgFormat = format;
	var vformat = format.split(" ");
	var timeFormat = vformat[1] || "";
	var vValue = value.split(" ");
	if(vValue[0].indexOf("/")>-1 || vValue[0].indexOf("-")>-1){
		var subStr =vValue[0].indexOf("/")>-1 ? vValue[0].split("/") : vValue[0].split("-");
		//实现日期框中月份和日期可以输入个位数字
		for(var i=0;i<subStr.length;i++){
			if(subStr[i].length % 2 != 0  ){
				subStr[i] = "0"+ subStr[i];
			}
			vValue[0] = subStr.join("-");
		}
	}
//		options.inst && (options.inst.beforevalue = vValue);
	format = getFormatter( vValue[0], vformat[0], options);
	format += orgFormat.substr(vformat[0].length, orgFormat.length);//将时间与年月日拼在一起显示
	vValue[0] = vValue[0].indexOf("/")>-1? vValue[0].replace( /\//g, "" ):vValue[0].replace( /-/g, "" );//将value中的分隔符去掉
	value = vValue.join(" "); 
	return {
		format: format,
		value: value
	};
},
_daylightSavingAdjust = function(date) {
	if (!date) {
		return null;
	}
	date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
	return date;
},
//提供配置用来格式化和解析
_getFormatConfig= function(opts) {
	var shortYearCutoff = opts.shortYearCutoff;
	shortYearCutoff = (typeof shortYearCutoff !== "string" ? shortYearCutoff :
		new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
	return {shortYearCutoff: shortYearCutoff,
		dayNamesShort:opts.dayNamesShort, dayNames: opts.dayNames,
		monthNamesShort: opts.monthNamesShort, monthNames: opts.monthNames,calculateWeek:opts.calculateWeek,"opts":opts};
},
_daylightSavingAdjustWidthTime= function(date,timeArr) {
	var ndate = _daylightSavingAdjust( date );
	if ( ndate ) {
		ndate.setHours(timeArr[0]);
		ndate.setMinutes(timeArr[1]);
		ndate.setSeconds(timeArr[2]);
		ndate.setMilliseconds(0);
	}
	return date;
}

$.component("coral.datepicker", $.coral.inputbase,{
	castProperties : ["showRequiredMark","hideRequiredMark","shortCut"],
	version: "4.0.2",
	componentName: "datepicker",
	componentFullName: "coral-datepicker",
    initialized: false,
	_curInst: null, // 当前在用的实例
	_keyEvent: false, //  若最后一个是键盘事件
	_disabledInputs: [],//  日历选择输入框中被禁用的
	_datepickerShowing: false, //  日历是否为正显示，True为是
	_inDialog: false, // 日历是否正显示为一个对话框中，True为是
	_mainDivId: "coral-datepicker-divId", // 日历选择组件主ID
	_inlineClass: "coral-datepicker-inline", // 内嵌标记类名
	_appendClass: "coral-datepicker-append", // 附加标记类名
	_triggerClass: "coral-datepicker-trigger", //  触发标记类名
	_dialogClass: "coral-datepicker-dialog", // 对话框标记类名
	_disableClass: "coral-datepicker-disabled", // 禁用标记类名
	_unselectableClass: "coral-datepicker-unselectable", // 为选择标记类名
	_currentClass: "coral-datepicker-current-day", //当前日期标记类名
	_dayOverClass: "coral-datepicker-days-cell-over", // 日期单元格类名
	regional: [], // 地域性设置，通过语言代码索引
	options: { //全局默认设置，针对所有日历组件实例
		showOn: "button", //  “focus” 即获得焦点后弹出
			//  “button” 按钮点击后触发，“both” 两者
		showAnim: "fadeIn", // 日历组件弹出时动画，参照jquery动画
		showOptions: {}, // 动画增强选项
		closeOnClick: true,
		iframePanel: false,
		dateFormat: 'yyyy-MM-dd',//日期格式
		timeFormat: 'HH:mm:ss',//日期格式
		formatOptions: formatOptions,
		firstDay: 1,//每周第一天
		isRTL: false,//为True表示右到左语言，否则为左到右
		showMonthAfterYear: true,// 为True表示年份选择优选月份
		defaultDate: null, //  默认时间，为空则为今天
		appendText: "", // 输入框显示的文字，例如显示格式 
		buttonText: "...", // 按钮的文字
		buttonImage: "", //按钮的图片Url
		buttonImageOnly: false, // 为True则只有图片，否则将图片赋予按钮
		hideIfNoPrevNext: false, //  为True隐藏 上一个月/下一个月
			// 若为不可用，false 就只是禁用他们
		navigationAsDateFormat: false, //为True日期格式应用于  prev/today/next
		gotoCurrent: false, // 为True则today链接返回为当前选择
		changeMonth: true, //  为True则能直接选择月份，否则仅为 prev/next
		changeYear: true, // 为True则能直接选择年度，否则仅为 prev/next
		complete: true,//是否自动补全日期
		yearRange: "c-30:c+30", //  下拉框中年度范围，默认为当前年度+-10年
		showOtherMonths: true, //为True显示非本月的日期，否则为空白
		selectOtherMonths: true, // 为True允许选择非本月的日期，否则不能
		showWeek: false, // 为True显示 周 的序号
		/* 计算当前Date对象的年周数 基于ISO 8601 定义
		 * @param date Date - 日期对象
		 * @return  number - Date对象在年中的周数
		 */
		calculateWeek: function(date) {
			var time,
				checkDate = new Date(date.getTime());
			checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
			time = checkDate.getTime();
			checkDate.setMonth(0); // Compare with Jan 1
			checkDate.setDate(1);
			return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
			
		}, //  如何计算年当中的周
			// 使用Date对象返回 周 的数量
		shortYearCutoff: "+10", 
		validDate: true,
		model:"datepicker",
		minDate: null, //最小的可选日期，为null则无限制
		maxDate: null, // 最大的可选日期，为null则无限制
		minTime: null,
		maxTime: null,
		duration: "fast", // 显示、关闭的速度
		beforeShowDay: null, //  方法，使用date并返回一个数组
			// [0]=true 则为可选则的，[1]=自定义css名
			// [2]= 单元格标题，
		beforeShow: null, // 方法，在输入框中返回个性化设定的日历组件
	//	onSelect: null, // 当日期被选择后的方法回调
		onChangeMonthYear: null, // 当月份和年度发生改变时的方法回调
		onClose: null, //当日历组件被关闭时的方法回调
		numberOfMonths: 1, // 显示的月份的数量
		showCurrentAtPos: 0, // 在多月份中当前月份的位置，起始为0
		stepMonths: 1, // 跳过月份的步长
		stepBigMonths: 12, //big links中back/forward跳过月份的步长
		altField: "", //  alt键被存储的值
		altFormat: "", // alt键被存储的日期格式
		constrainInput: true, // 输入被迫按照当前日期格式
		showButtonPanel: true, //  True为显示一个button面板
		autoSize: false, // True输入时按照日期格式调整大小
		disabled: false, // 初始为禁用状态
		
		//补充。。。
		//autoFormat : false, // 是否自动格式化输入日期
		isLabel : false, // 是否输入框为标签项
		readonly : false, // 输入框是否为只读
		readonlyInput : false,
		showClose: false,
		value : null ,//输入框值
		required : false,//是否为只读
		showStar : true,
		starBefore: false,
		errMsg: null,
		errMsgPosition: "leftBottom",
		startDateId: null,
		endDateId: null,
		onSelect : null ,
		onChange : null,
		onFormatError : null,
		onFormatWarn : null,
		//原始的dateFormat
		srcDateFormat : null,
		zIndex : null,
		name : null,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false, // true 则不单独校验
		valueType: "string",
		restrictConvert: true
    },
  //为元素添加类名，指出一个已配置的日历组件
	markerClassName: "hasDatepicker",

	//跟踪最大的显示行数
	maxRows: 4,
	// jquery extend 忽略null
	extendRemove: function(target, props) {
		$.extend(target, props);
		for (var name in props) {
			if (props[name] == null) {
				target[name] = props[name];
			}
		}
		return target;
	},
	bindHover: function(dpDiv) {
		var that = this;
		var selector = "button, .coral-datepicker-prev, .coral-datepicker-next, .coral-datepicker-calendar td a, .menuTimeSel";
		var selectormousedown = "#coral-datepicker-divId";
		return dpDiv.delegate(selector, "mouseout", function() {
				$(this).removeClass("coral-state-hover");
				if (this.className.indexOf("coral-datepicker-prev") !== -1) {
					$(this).removeClass("coral-datepicker-prev-hover");
				}
				if (this.className.indexOf("coral-datepicker-next") !== -1) {
					$(this).removeClass("coral-datepicker-next-hover");
				}
			})
			.delegate( selector, "mouseover",{element: that}, that.datepicker_handleMouseover );
		
	},
	datepicker_handleMouseover: function(event) {
		var that = event.data ? event.data.element : event;
		if (!that.isDisabled()) {   //TODO:没有考虑div或者span初始化时的情况
			$(this).parents(".coral-datepicker-calendar").find("a").removeClass("coral-state-hover");
			$(this).addClass("coral-state-hover");
			if (this.className.indexOf("coral-datepicker-prev") !== -1) {
				$(this).addClass("coral-datepicker-prev-hover");
			}
			if (this.className.indexOf("coral-datepicker-next") !== -1) {
				$(this).addClass("coral-datepicker-next-hover");
			}
		}
	},
	// TODO 重命名“widget”
	widget: function() {
		return this.dpDiv;
	},

	/*
	 * 覆盖日历组件实例的默认设置方法。
	 * @param options object - 新的设置
	 * @return 管理的对象
	 */
/*		setDefaults: function(options) {
			that.extendRemove(this.options, options || {});
			return this;
		},*/
    
    _create: function () {
    	var nodeName, inline;
		nodeName = this.element[0].nodeName.toLowerCase();
		inline = (nodeName === "div" || nodeName === "span");
    	this.regional[""] = { // 默认地域设置
			//将默认英文改为中文
			closeText: '关闭',//关闭
			prevText: '上月',//上月
			nextText: '下月&#x3E;',//下月
			currentText: '今天',//今天
			// 以下两个属性，将“月”字去掉，选择框内只显示数字，“月”字写死在 select 外面，配置在 monthSuffix 属性
			monthNames: ['1','2','3','4','5','6',
			'7','8','9','10','11','12'],//月的名字
			monthNamesShort: ['1','2','3','4','5','6',
			'7','8','9','10','11','12'],//月的短名
			dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],//日期名
			dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],//日期短名
			dayNamesMin: ['日','一','二','三','四','五','六'],//日期单名
			weekHeader: '周',//周前缀

			yearSuffix: '年',//年与月之间的分隔文字
			monthSuffix: '月' // 月文本配置
		};
    	$.extend(this.options, this.regional[""]);
    	var options = this.options;
    	if( options["dateFormat"] != null && 
			options["srcDateFormat"] == null ){
			options["srcDateFormat"] = options["dateFormat"];
		}
    	if (options.valueType == "long" && options.value) {
    		options.value = $.coral.longToStringDate(options.value, options);
		}
    	this.regional.en = $.extend( true, {}, this.regional[ "" ]);
    	this.regional[ "en-US" ] = $.extend( true, {}, this.regional.en );
    	var panel = $("body").find("#coral-datepicker-divId");
    	this.dpDiv = $("#coral-datepicker-divId").length ? $("#coral-datepicker-divId") : this.bindHover($("<div id='" + this._mainDivId + "' class='coral-datepicker coral-component coral-component-content coral-helper-clearfix coral-corner-all'></div>"));
    	this.iframePanel = $("<iframe class='coral-datepicker-iframePanel' style='position:absolute;height:auto;'></iframe>" )
    	//初始化日历组件
    	if (!this.initialized) {
    		$(document).mousedown({that:this},this._checkExternalClick);
    		this.initialized = true;
    	}
    	//在body中加入日历组件
    	if ($("#"+this._mainDivId).length === 0) {
    		$("body").append(this.dpDiv);
    	}
    	this.prepareInit(this.options);
    	//初始化
		this._initElement();
		if ( options.startDateId ) {
			$( "#"+ options.startDateId ).datepicker("option", "endDateId", this.element[0].id);
			var value = $("#"+ options.startDateId).datepicker("getValue");
			$("#"+ this.element[0].id).datepicker("option","minDate",value);
		}
		
		if (nodeName === "input") {
			this.connect();
		} else if (inline) {
			this.inline();
		}
    	$( document ).off(".coral-datepicker").on("mousedown.coral-datepicker", "#"+this._mainDivId, function(e){
    		if ( $(e.target).hasClass("menuTimeSel")) {
    			e.stopPropagation();
    			return;
    		}
    		e.stopPropagation();
    	});
    },
    
	component: function () {
		return this.element.parent().parent();
	},
    
	_initElement: function(){
		var opts = this.options,
		    id=opts.id,
			name = this.element.attr("name") || opts.name || "",
			value = $.coral.trim(opts.value),
			width = opts.width,
			height = opts.height,
			cls = opts.cls,
			labelField = opts.labelField,
			showClose = opts.showClose,
			clearIcon = "",
			componentCls = opts.componentCls;
		this.originalValue = value;
		if ( name ) { 
			this.element.removeAttr("name");
		}
		if (showClose) {
			clearIcon = "<span class='coral-input-clearIcon cui-icon-cross2'></span>";
		}
		var hidden = $("<input id='"+id+"_srcval' name='"+name+"' type='hidden' value='"+(value==null?"":value)+"'>");
		var eleBorder = $("<span id='"+id+"_eleBorder' class='coral-textbox-border coral-corner-all'>" + clearIcon + "</span>");
		var eleComp = $("<span id='"+id+"_eleComp' class='coral-textbox'></span>");
		this.element.addClass("coral-textbox-default coral-validation-datepicker tabbable ");
		this.element.addClass("coral-form-element-datepicker ctrl-init ctrl-form-element ctrl-init-datepicker");

		if(height!=null){
			eleComp.outerHeight(height);
			this.element.outerHeight("100%");
		}
		if(width!=null){
			eleComp.outerWidth(width);
		}
		eleComp.insertAfter(this.element).addClass(componentCls);
		hidden.appendTo(eleBorder);
		this.element.appendTo(eleBorder).addClass(cls);
	   
		eleBorder.appendTo(eleComp);
		if( opts.iframePanel ){
			this.iframePanel.appendTo("body").hide();
		};
		if (null != labelField) {
			var uiLabel = $("<label class=\"coral-label\">"+ labelField +"</label>");
			eleBorder.before(uiLabel);
			eleComp.addClass("coral-hasLabel");
		}
		if ( ! (this.options.readonly)) {
			this.element.prop("readonly", this.options.readonlyInput);
		}
	},
	prepareInit: function(options) {
		var target = this.element[0];
		options = options || {};
		
		if (!target.id) {
			if (options.id) {
				target.id = options.id;
			}else{
				/*this.uuid += 1;
				target.id = "dp" + this.uuid;*/
			}
			options.id = $(target).uniqueId().attr("id");
		} else {
			if (options.id) {
				target.id = options.id;
			} else {
				options.id = $(target).uniqueId().attr("id");
			}
		}
		if (!target.name) {
			if (options.name) {
				target.name = options.name;
			}
			options.name = $(target).attr("name");
		} else {
			if (options.name) {
				target.name = options.name;
			} else {
				options.name = $(target).attr("name");
			}
		}
		options.value =  $(target).val() || options.value || "";
		var inline = (target.nodeName.toLowerCase() === "div" || target.nodeName.toLowerCase() === "span");
		this._newInst($(target), inline);
		
		//解析input对象中data-options并赋值给响应的options
		/*if(nodeName === "input"){
			var dataoptions=$.parser.parseOptions(target,[], ['dataCustom','formatOptions']);
			$.extend( true, options, dataoptions );
		}*/
		
		//options = $.extend({}, this.options, $.fn["datepicker"].defaults, options || {});
		//如果srcDateFormat没有指定，则将dateFormat复制到srcDateFormat
		//options = $.extend(this.options, options || {});
    },
    
    _newInst: function(target, inline) {
		var id = target[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1");
		this.dpDiv.css({display:"none"});//默认隐藏组件外框Div
		target.attr( "component-role", this.componentName );//身份识别
		this.inst =  {id: id, input: target, 
				selectedDay: 0, selectedMonth: 0, selectedYear: 0, 
				drawMonth: 0, drawYear: 0, 
				inline: inline, 
				isShow: false,
				dpDiv: (!inline ? this.dpDiv :
				this.bindHover($("<div class='" + this._inlineClass + " coral-datepicker coral-datepicker-panel coral-component coral-component-content coral-helper-clearfix coral-corner-all'></div>")))};
		$.extend(this.options,this.inst)
	},
	//输入框附加日历组件
	connect: function() {
		var opts = this.options,
		    target = this.element[0],
		    input = $(target),
		    that = this;
		opts.append = $([]);
		opts.trigger = $([]);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		this._attachments(input);
		input.addClass(this.markerClassName)
			.keydown({that:that},this._doKeyDown)
			.keypress({that:that},this._doKeyPress)
			.keyup({that:that},this._doKeyUp);
		this._autoSize();
		
		if( opts.disabled ) {
			this.disable();
		}
		if( opts.readonlyInput ) {
			this.readonlyInput(opts.readonlyInput);
		}
		if( opts.readonly ) {
			this.readonly( opts.readonly);
		}
		if( opts.isLabel ) {
			this.isLabel(opts.isLabel);
		}
		/*if( inst.options.required && inst.options.showStar) {
			$.validate._showRequire(input.parent().parent());
		}*/
	},
	//处理defaultDate
	_processDefaultDate : function(that,defaultDate){
		var opts = this.options;
		if(defaultDate==""){
			opts.selectedDay = opts.currentDay = null;
			opts.selectedMonth = opts.currentMonth = null;
			opts.selectedYear = opts.currentYear = null;
			
			opts.currentHur=null;
			opts.currentMiu=null;
			opts.currentSed=null;
			opts.input.val("");
			return null;
		}
		var dateFormat=opts.dateFormat;
		var defaultDateObj=null;
		try{
			defaultDateObj = $.coral.parseDate(dateFormat,defaultDate,opts);
		}catch(e){
			//触发格式化错误事件TODO:_apply无法继承方法待商定
//			that._apply(inst,"onFormatError",[defaultDate,inst]);
//			that._apply(inst,"onFormatWarn",[defaultDate,inst]);
			return null;
		}
		opts.selectedDay = opts.currentDay = defaultDateObj.getDate();
		opts.selectedMonth = opts.currentMonth = defaultDateObj.getMonth();
		opts.selectedYear = opts.currentYear = defaultDateObj.getFullYear();
		
		opts.currentHur=defaultDateObj.getHours();
		opts.currentMiu=defaultDateObj.getMinutes ();
		opts.currentSed=defaultDateObj.getSeconds();
		var date = _daylightSavingAdjustWidthTime(new Date(opts.currentYear, opts.currentMonth, opts.currentDay),[opts.currentHur,opts.currentMiu,opts.currentSed]);
		var datestr = "";
		if ( !opts.value && defaultDate ) {
			opts.value = defaultDate;
		}
		if ( opts.value != "" ) {
			var srcDateFormat = getFormatter(opts.value,opts.dateFormat,opts);
			datestr = this.completeFormate(srcDateFormat,dateFormat);
			datestr = $.coral.formatDate(datestr, date, opts);
		} 
		opts.input.val(datestr);
		return date;
	},
	//基于options上附加内容
	_attachments: function(input) {
		var that =this,
		    opts = this.options;
		var showOn, buttonText, buttonImage,
			appendText = opts.appendText,
			isRTL = opts.isRTL;

		if (opts.append) {
			opts.append.remove();
		}
		if (appendText) {
			opts.append = $("<span class='" + this._appendClass + "'>" + appendText + "</span>");
			input[isRTL ? "before" : "after"](opts.append);
		}

		input.unbind("focus", this.show);
		input.unbind("blur");
		input.parent().unbind("mouseleave");
		input.parent().unbind("mouseenter");
		input.unbind(".attachments");

		if (opts.trigger) {
			opts.trigger.remove();
		}
		//将defaultDate值赋值给input，并格式化为显示格式
		var defaultDate= $.coral.trim(opts.value);
		if("" == input.parent().find("input[type='hidden']").val() && typeof defaultDate==="string" && defaultDate!=''){				
			that._processDefaultDate(that,defaultDate);
			that._setHiddenInputValue();//设置隐藏字段值
		} else {
			var valueDate = that._getHiddenInputValue();
			that._processDefaultDate(that,valueDate);
		}
		input.parent().find(".coral-input-clearIcon").unbind("click").bind("click", function(e){
			that.setValue("",true)
//				that._clearDate();
		});
		showOn = opts.showOn;
		input.focus(function(e){
			//that._inputFocus(inst);
			if (showOn === "focus" || showOn === "both") { //  在被标记的域中弹出日历组件
				that.show(e);
			}
			if(that.options.readonly || that.options.isLabel) return;
			that.component().addClass("coral-state-focus");
		});
		if (showOn === "button" || showOn === "both") {
			// 按钮点击时弹出日历组件
			buttonText = opts.buttonText;
			opts.trigger = $("<span/>").addClass("coral-icon-calendar cui-icon-calendar4");
			
			input[isRTL ? "before" : "after"](opts.trigger);
			if(opts.isLabel == true){
				input.parent().addClass("coral-datepicker-no-close");
			}
			opts.trigger.click(function(e) {
				if (that._datepickerShowing && that._lastInput === input[0]) {
					that.hide();
				} else if (that._datepickerShowing && that._lastInput !== input[0]) {
					that.hide();
				}
				that.show();
				return false;
			});
		}
		input.blur(function(e){
			that._inputBlur(opts,e);
		});
		//增加验证
		input.parent().mouseleave(function() {
			if ( opts.readonly || opts.isLabel || opts.disabled || opts.readonlyInput) {
				return ;
			}
			input.parent().parent().removeClass("coral-textbox-hover");
		});    
		//lihaibo add
		input.parent().mouseenter(function(){
			if ( opts.readonly || opts.isLabel || opts.disabled || opts.readonlyInput) {
				return ;
			}
			input.parent().parent().addClass("coral-textbox-hover");
		});
		input.bind("keyup.attachments", function(e){
			switch (e.keyCode) {
			case 9:
				that.show( e );
				break;
			}
		})
	},
	_autoSize: function() {
		var opts = this.options;
		if (opts.autoSize && !opts.inline) {
			var findMax, max, maxI, i,
				date = new Date(2009, 12 - 1, 20), // 确定浮点位数
				dateFormat = opts.dateFormat;

			if (dateFormat.match(/[DM]/)) {
				findMax = function(names) {
					max = 0;
					maxI = 0;
					for (i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				var matchMM = dateFormat.match(/MM/) ?
						"monthNames" : "monthNamesShort",
					matchDD = dateFormat.match(/DD/) ?
							"dayNames" : "dayNamesShort";
				date.setMonth(findMax(opts.matchMM));
				date.setDate(findMax(opts.amtchDD) + 20 - date.getDay());
			}
			opts.input.attr("size", this._formatDate(date).length);
		}
	},
	//div中加入日历组件
	inline: function() {
		var target = this.element[0],
		    opts = this.options,
		    divSpan = $(target);
		if (divSpan.hasClass(this.markerClassName)) {
			return;
		}
		divSpan.addClass(this.markerClassName).append(opts.dpDiv);
		this._setDate( this._getDefaultDate(), true);
		this.update();
		this._updateAlternate();
		//若disabled 为True，在显示前禁用日历组件
		if( opts.disabled ) {
			this.disable(target);
		}
		// 设置display为block 代替 inst.dpDiv.show() 不能工作在未连接的元素
		opts.dpDiv.css( "display", "block" );
	},
	/*
	 * 在对话框中弹出日历组件
	 * @param input - 忽略的
	 * @param data string or Date - 显示的初始日期
	 * @param onSelect function - 当日期被选中是触发的回调函数
	 * @param options object - 更新对话框中日历组件实例的设置
	 * @param pos int[2] - 等同于 对话框在屏幕中的位置
	 * 					event - x/y
	 * @return 对象 
	 */
	dialog: function(date, onSelect, options, pos) {//TODO： 暂时此功能不添加,以后需要时再做处理
		var input = this.element[0],
		    that = this;
		var id, browserWidth, browserHeight, scrollX, scrollY,
			opts = this._dialogInst; // internal instance

		if (!opts) {
			this.uuid += 1;
			id = "dp" + this.uuid;
			this._dialogInput = $("<input type='text' id='" + id +
				"' style='position: absolute; top: -100px; width: 0px;'/>");
			this._dialogInput.keydown({that:that},this._doKeyDown);
			$("body").append(this._dialogInput);
			this._newInst(this._dialogInput, false);
			this._dialogInst = opts;
			inst.options = {};
		}
		that.extendRemove(inst.options, options || {});
		date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
		this._dialogInput.val(date);

		this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
		if (!this._pos) {
			browserWidth = document.documentElement.clientWidth;
			browserHeight = document.documentElement.clientHeight;
			scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			this._pos = 
				[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
		}

		// 移动焦点至屏幕中的输入项，之后隐藏对话框
		this._dialogInput.css("left", (this._pos[0] + 20) + "px").css("top", this._pos[1] + "px");
		inst.options.onSelect = onSelect;
		this._inDialog = true;
		this.dpDiv.addClass(this._dialogClass);
		this.show();
		if ($.blockUI) {
			$.blockUI(this.dpDiv);
		}
		return this;
	},
	//将目标对象与日历组件分离
	_destroy: function() {
		var nodeName,
		    opts = this.options,
		    target = this.element[0],
			$target = $(target);

		$(target).parent().parent().replaceWith($target);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		
		nodeName = target.nodeName.toLowerCase();
		$.removeData(target, "inited");
		opts.isShow = false;
		if (nodeName === "input") {
			opts.append.remove();
			opts.trigger.remove();
			$target.removeClass(this.markerClassName).
				unbind(".field").
				unbind(".restrictInput").
				unbind("blur").
				unbind("focus").
				unbind("keydown").
				unbind("keypress").
				unbind("keyup").
				unbind("datepickeronblur").
				unbind("datepickeronchange").
				unbind("datepickeronkeydown").
				unbind("datepickeronkeyup").
				unbind("datepickeronstatus").
				unbind("onOptionChange");
		} else if (nodeName === "div" || nodeName === "span") {
			$target.removeClass(this.markerClassName).empty();
		}
		$(target).val("");
		$(target).removeAttr("value");
		$target.removeAttr( "component-role" )
			   .removeClass("coral-textbox-default coral-validation-datepicker coral-form-element-datepicker ctrl-init ctrl-form-element ctrl-init-datepicker")
			   .removeAttr("data-options");
	},
	//启用日历组件到一个jquery选择器上
	enable: function() {
		var target = this.element[0],
		    opts = this.options,
		    nodeName, inline,
			$target = $(target);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		//$(target).parent().parent().css({opacity: "1"});
		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = false;
			opts.trigger.filter("button").
				each(function() { this.disabled = false; }).end().
				filter("img").css({opacity: "1.0", cursor: ""});
			$target.parent().parent().removeClass("coral-state-disabled");
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().removeClass("coral-state-disabled");
			inline.find("select.coral-datepicker-month, select.coral-datepicker-year").
				prop("disabled", false);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
	},

	//禁用日历组件到一个jquery选择器上
	disable: function() {
		var target = this.element[0],
		    nodeName, inline,
		    opts = this.options,
			$target = $(target);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		//$(target).parent().parent().css({opacity: "0.5"});
		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = true;
			opts.trigger.css({opacity: "0.5", cursor: "default"});
			
			$target.parent().parent().addClass("coral-state-disabled");
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().addClass("coral-state-disabled");
			inline.find("select.coral-datepicker-month, select.coral-datepicker-year").
				prop("disabled", true);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
		this._disabledInputs[this._disabledInputs.length] = target;
	},
	/**
	 * 设置日历组件为只读
	 */
	readonly: function(flag){
		var target = this.element[0],
		    inline,
			$target = $(target);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		$(target).parent().parent().removeClass( "coral-isLabel" );
		$(target).parent().parent().toggleClass( "coral-readonly", flag );
		$(target).toggleClass("tabbable",!flag);
		this._readonly(target,flag);
	},
	_readonly: function(target,flag){
		var nodeName = target.nodeName.toLowerCase(),
			opts = this.options;
		if (nodeName === "input" && flag) {
			target.readOnly = true;
			opts.trigger.filter("button").
				each(function() { this.readOnly = true; }).end().
				filter("img").css({opacity: "0.5", cursor: "default"});
		}
		if (nodeName === "input" && !flag) {
			if(this.isIsLabel())return ;
			target.readOnly = false;
			opts.trigger.filter("button").
				each(function() { this.readOnly = false; }).end().
				filter("img").css({opacity: "1.0", cursor: ""});
		}
	},
	readonlyInput: function(flag) {
		if( !(this.options.readonly))
			this.element.prop("readonly", flag);
	},
	/**
	 * 日历组件是否为只读
	 */
	isReadonly: function() {
		if(this.options.readonly){
			return this.options.readonly;
		}
		return false;
	},
	isReadonlyInput: function() {
		if(this.options.readonlyInput){
			return this.options.readonlyInput;
		}
		return false;
	},
	isIsLabel: function() {
		if(this.options.isLabel){
			return this.options.isLabel;
		}
		return false;
	},
	/**
	 * 设置日历组件为只读
	 */
	isLabel: function(flag){
		var target = this.element[0],
		    inline,
			$target = $(target),
			opts = this.options;

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		var id=opts.id;
		//修改样式
		if(flag){
			$target.parent().removeClass("coral-datepicker-no-close");
			$target.parent().parent().removeClass("coral-readonly");
			$target.parent().parent().addClass("coral-isLabel");
			$target.removeClass("tabbable");
		}else{
			$target.parent().parent().removeClass("coral-isLabel coral-readonly");
			$target.parent().addClass("coral-datepicker-no-close");
			$target.addClass("tabbable");
		}
		//设置为只读 标签
		this.options.readonly = flag;
		this.options.isLabel = flag;
		this._readonly(target,flag);
	},
	
	/*
	 * 是否第一个jquery组件禁用的日历组件
	 * @param target element - 输入框  或 div 或 span
	 * @return boolean - true 为禁用的，false 为启用的
	 */	
	isDisabled: function() {
		var target = this.element[0];
		if (!target) {
			return false;
		}
		for (var i = 0; i < this._disabledInputs.length; i++) {
			if (this._disabledInputs[i] === target) {
				return true;
			}
		}
		return false;
	},
	
	_doOption: function (key, value) {
		var that = this,
			opts = this.options;
		var settings, date, minDate, maxDate;
		date=this.getDate(true);
		minDate = this._getMinMaxDate("min");
		maxDate = this._getMinMaxDate("max");
		var oldValue=this._getHiddenInputValue();
		if ( key=="value" ) {
			if(value){
				var format = getFormatter(value,opts.dateFormat, opts);
				var cdate = $.coral.parseDate(format, value,opts);
				var srcDateFormat = opts.srcDateFormat;
				if (this._checkDateRange(cdate) === 2){
					value = $.coral.formatDate(srcDateFormat, minDate, opts);
				}
				if (this._checkDateRange(cdate) === 1) {
					value = $.coral.formatDate(srcDateFormat, maxDate, opts);
				}
			}
			date = that._processDefaultDate(that,value);
			//设置隐藏字段值
		}
		if (minDate !== null && key=="dateFormat" || minDate !== null && key=="minDate") {
			opts.minDate = this._formatDate(minDate);
		}
		if (maxDate !== null && key == "dateFormat" || maxDate !== null && key == "maxDate") {
			opts.maxDate = this._formatDate(maxDate);
		}
		if ( key == "disabled" ) {
			if ( value ) {
				this.disable();
			} else {
				this.enable();
			}
		}
		if ( key == "readonlyInput" ) {
			this.readonlyInput(value);
		}
		if ( key == "readonly" ) {
			this.readonly(value);
		}
		if ( key == "isLabel" ) {
			this.isLabel(value);
		}
		if ( key == "showAnim" ) {
			//下拉显示的时候无需进行下面的初始化操作
			return;
		}
		if ( key === "startDateId" ) {
			$( "#"+value ).datepicker( "option", "endDateId", opts.id );
		}
		
		this._attachments(this.element);
		this._autoSize();
		this._setDate(date);
		if ( opts.isShow ) {
			this.update();
		}
		this._updateAlternate();
		this._setHiddenInputValue();
		if( key=="value" ){
			this._setStartEnd(oldValue, value);
		}
	},
	/**
	 * 用于更新option参数时赋值的方法
	 * @param target element - 目标对象
	 * @param key object - 新的设置对象
	 * 			   string - 设置的key
	 * @param value any - 新的value
	 */
	_setOption: function(key, value) {
		// 判断key必须放在最前面
		if ( key=="value" ) {
			if (this.options.valueType == "long") {
				value = $.coral.longToStringDate(value, this.options);
			}
		}
		this._super(key,value);
		this._doOption(key, value);
	},
	valid: function(){
		var target = this.element[0];
		var data = {
			hasTips: false,
			element: $(target)
		};
		return ( $.validate.validateField( null, data ).length > 0 ? false : true );
	},
	//发生变化的方法
	change: function( key, value) {
		var target = this.element[0];
		this.option( key, value);
	},
	/**
	 * 日历组件的刷新方法
	 */
	refresh: function() {
		var target = this.element[0],
		    opts = this.options;
		if (opts) {
			this.update();
		}
	},
	reset: function(){
		var target = this.element[0];
		$(target).datepicker("option", "value", this.originalValue);
	},
	/**
	 * 设置日历组件的日期
	 */
	setValue: function(value, triggerChange) {
		var opts = this.options;
		if (opts.valueType == "long") {
			value = $.coral.longToStringDate(value, opts);
		}
		var target = this.element[0],
		    oldValue = this._getHiddenInputValue();
		var value=$.coral.trim(value);
		this._doOption("value", value);
		//$(target).datepicker("option", "value", value);
		if (triggerChange){
			this._change(oldValue,value);
		}
	},
	
	/**
	 * 取得日历组件的日期
	 */
	getValue: function(noDefault) {
		var target = this.element[0];
		var opts = this.options;
		var value = this.getDateValue();
		if(opts.valueType == "long") {
			value = $.coral.stringToLongDate(value, opts);
		}
		return value;
	},
	/**
	 * 取得日期组件的显示值
	 */
	getText: function() {
		return this.options.input.val();
	},
	getValidateValue: function() {
		if (this.options.restrictConvert && this.options.valueType =="long") {
			return this.getText();
		} else {
			return this.getValue();
		}
	},
	/**
	 * 设置日历组件的日期
	 */
	setDate: function(date) {
//			var target = this.element[0],
//			    opts = this.options;
//			if (opts) {
//				//var tmpDateFormat=this._get(inst,"dateFormat");
//			//	this._set(inst,"dateFormat",editFormat);
//				this._setDate(date);
//				//this._set(inst,"dateFormat",tmpDateFormat);
//				this.update();
//				this._updateAlternate();
//				//设置隐藏字段值
//				this._setHiddenInputValue();
//			}
		var opts = this.options;
		var dateFormat = opts.dateFormat
		var str = $.coral.formatDate(dateFormat, date, opts);
		this.setValue(str);
	},
	
	/**
	 * 取得日历组件的日期
	 */
	getDate: function(noDefault) {
		var target = this.element[0],
		    opts = this.options;
		
		if (opts && !opts.inline) {
			this._setDateFromField(opts, noDefault);
		}
		return (opts ? this._getDate() : null);
	},
	/**
	 * 取得日历组件的显示值
	 */
	getDateValue: function() {
		var target = this.element[0],
		    opts = this.options;
		//if( !inst.currentYear ) return "";
		return this._getHiddenInputValue();
		/*var str=this._formatDate(inst);
		return str;*/
	},

	//执行keydown事件
	_doKeyDown: function(event) {
		var that = event.data.that,
		    onSelect, dateStr, sel,
		    opts = that.options,
			handled = true,
			isRTL = opts.dpDiv.is(".coral-datepicker-rtl");
		var oldValue = that._getHiddenInputValue();
		opts._keyEvent = true;
		if (that._datepickerShowing) {
			switch (event.keyCode) {
				case 9: that.hide();
						handled = false;
						break; //  屏蔽Tab
				case 13: sel = $("td." + that._dayOverClass + ":not(." +
									that._currentClass + ")", opts.dpDiv);
						if (sel[0]) {
							that._selectDay(event.target, opts.selectedMonth, opts.selectedYear, sel[0]);
						}

						onSelect = opts.onSelect;
						if (onSelect) {
							dateStr = that._formatDate();
							// 触发回调
							//onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
						} else {
							that.hide();
						}
						//return false; // form中不提交
				case 27: that.hide();
						break; // 屏蔽 escape
				case 33: that._adjustDate(event.target, (event.ctrlKey ?
							-opts.stepBigMonths :
							-opts.stepMonths), "M");
						break; // previous month/year on page up/+ ctrl
				case 34: that._adjustDate(event.target, (event.ctrlKey ?
							+opts.stepBigMonths :
							+opts.stepMonths), "M");
						break; // next month/year on page down/+ ctrl
				case 35: if (event.ctrlKey || event.metaKey) {
							that._clearDate();
						}
						handled = event.ctrlKey || event.metaKey;
						break; // clear on ctrl or command +end
				case 36: if (event.ctrlKey || event.metaKey) {
							that._gotoToday(event.target);
						}
						handled = event.ctrlKey || event.metaKey;
						break; // current on ctrl or command +home
				case 37: if (event.ctrlKey || event.metaKey) {
							that._adjustDate(event.target, (isRTL ? +1 : -1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// -1 day on ctrl or command +left
						if (event.originalEvent.altKey) {
							that._adjustDate(event.target, (event.ctrlKey ?
								-opts.stepBigMonths :
								-opts.stepMonths), "M");
						}
						// next month/year on alt +left on Mac
						break;
				case 38: if (event.ctrlKey || event.metaKey) {
							that._adjustDate(event.target, -7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // -1 week on ctrl or command +up
				case 39: if (event.ctrlKey || event.metaKey) {
							that._adjustDate(event.target, (isRTL ? -1 : +1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// +1 day on ctrl or command +right
						if (event.originalEvent.altKey) {
							that._adjustDate(event.target, (event.ctrlKey ?
								+opts.stepBigMonths :
								+opts.stepMonths), "M");
						}
						// next month/year on alt +right
						break;
				case 40: if (event.ctrlKey || event.metaKey) {
					       that._adjustDate(event.target, +7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // +1 week on ctrl or command +down
				default: handled = false;
			}
		} else if (event.keyCode === 36 && event.ctrlKey) { // 显示日历 date picker on ctrl+home
			that.show();
		} else {
			// 对输入框的keyDown事件
			handled = false;
			switch (event.keyCode) {
			case 9:
			case 13: 
				that._setHiddenInputValue();
				dateStr = that._getHiddenInputValue();
				that._setStartEnd(oldValue, dateStr);
				that._change( oldValue, dateStr);
				break; 
			}
		}
		if(opts.shortCut){
			$.coral.callFunction(opts.shortCut,event,this);
		}
		// added by mengshuai begin onKeydown
		that._trigger("onKeyDown", event, [ { "oldValue": oldValue, "value": opts.input.val() } ]);
		// added by mengshuai end
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	},
	
	_setStartEnd: function(oldValue, value){
		var opts = this.options;
		if (oldValue == value) {
			return;
		}
		var startDateId = opts.startDateId;
		var endDateId = opts.endDateId;
		if (startDateId) {
			$("#"+startDateId).datepicker("option", "maxDate", value);
		}
		if (endDateId) {
			$("#"+endDateId).datepicker("option", "minDate", value);
		}
	},
	_change: function(oldValue, value, event){
		if ( oldValue != value ) {
			this.options.value = value;
			this._trigger("onChange", event, [{"oldValue": oldValue,"newValue": value,"value": value}]);
		}
	},

	//执行keypress事件
	_doKeyPress: function(event) {
		/*var chars, chr,
			inst = $.datepicker._getInst(event.target);

		if ($.datepicker._get(inst, "constrainInput")) {
			chars = $.datepicker._possibleChars($.datepicker._get(inst, "dateFormat"));
			chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
			return event.ctrlKey || event.metaKey || (chr < " " || !chars || chars.indexOf(chr) > -1);
		}*/
	},

	//执行keyup事件
	_doKeyUp: function(event) {
		var that = event.data.that,
		    date,
			opts = that.options;
		var oldValue = that._getHiddenInputValue();
		var minDate = that._getMinMaxDate( "min"),
			maxDate = that._getMinMaxDate( "max");	
		if (opts.input.val() !== opts.lastVal) {
			try {
				//支持通过键盘删除日期操作
				if(opts.input.val()==""){
					opts.selectedDay = null;
					opts.drawMonth = opts.selectedMonth = null;
					opts.drawYear = opts.selectedYear = null;
					opts.currentDay = null;
					opts.currentMonth = null;
					opts.currentYear = null;
					opts.currentHur = null;
					opts.currentMiu = null;
					opts.currentSed = null;
					
				}
				
				date = $.coral.parseDate(opts.dateFormat,
					opts.input ? opts.input.val() : null,opts),
				// 标识是用户在键盘输入的编辑状态
				opts.input.addClass("isEdit");

				if (date && that._checkDateRange(date)===0) { // only if valid
					that._setDateFromField();
					that._updateAlternate();
					//$.datepicker._updateDatepicker(inst);
				}else if(that._checkDateRange(date)===1){
					 opts.currentDay= maxDate.getDate();
					 opts.currentMonth = maxDate.getMonth();
					 opts.currentYear = maxDate.getFullYear();
				}else if(that._checkDateRange(date)===2){
					 opts.currentDay= minDate.getDate();
					 opts.currentMonth = minDate.getMonth();
					 opts.currentYear = minDate.getFullYear();
				}
				//触发修改事件
				var dateStr=opts.input.val();
			//	$.datepicker._trigger(opts, "onChange", event, [ { "oldValue": oldValue, "newValue": datestr,"value": datestr } ]);
			//	$.datepicker._apply(inst,"onChange",[dateStr,inst]);
			//	this._apply( inst,"onChange",[ { "oldValue": oldValue, "newValue": datestr,"value": datestr } ] );
				//设置隐藏字段值
			//	$.datepicker._setHiddenInputValue(inst);
			}catch (err) {
				//触发格式化错误事件
				var dateStr=opts.input.val();
/*					that._apply(inst,"onFormatError",[dateStr,inst]);
					that._apply(inst,"onFormatWarn",[dateStr,inst]);*/
			}
			that._trigger("onKeyUp", event, [ { "oldValue": oldValue, "value": opts.input.val() } ]);
		}
		return true;
	},
	/**
	 * 检查日期时间是否在最大最小日期范围内
	 * @return 0在minDate和maxDate之间  1大于maxDate 2小于minDate 
	 */
	_checkDateRange: function(date){
		var minDate,maxDate,
			opts = this.options,
		minDate = this._getMinMaxDate("min");
		maxDate = this._getMinMaxDate("max");
		if(maxDate!=null && date>maxDate){
			return 1;
		}
		if(minDate!=null && date<minDate){
			return 2;
		}
		return 0; 
	},
	//获取srcDateFormat的分隔符是什么
	_srcDateFormatSeparator: function(srcDateFormat){
		var separator = "/";
		if(srcDateFormat.indexOf("/")>-1){
			return separator;
		}
		if(srcDateFormat.indexOf("-")>-1){
			separator = "-";
			return separator;
		}
	},
	
	/**
	 * 设置隐藏input字段值,getValue()取值的时候，若complete==false,只能根据显示值的格式来显示，但是分隔符可以根据隐藏值的格式显示，
	 * 例如：显示值为2015-12，隐藏值srcDateFormat=“yyyy/MM/dd”，则getValue()取到的值为2015/12
	 */
	_setHiddenInputValue: function() {
		// 修改赋值bug 20150129
		var opts = this.options;
		if (opts.input.val() == "") {
			opts.input.parent().find("input[type='hidden']").val("");
			return ;
		}
		var dateFormat=opts.dateFormat;
		var srcDateFormat = srcDateFormat || opts.srcDateFormat;//this._get(inst,"srcDateFormat");
		var separator = this._srcDateFormatSeparator(srcDateFormat);
		if(opts.currentYear==null || opts.currentMonth==null){
			opts.input.parent().find("input[type='hidden']").val("");
			return ;
		}
		var date = _daylightSavingAdjustWidthTime(new Date(opts.currentYear, opts.currentMonth, opts.currentDay),[opts.currentHur,opts.currentMiu,opts.currentSed]);
		var format = getFormatter(opts.input.val(),opts.dateFormat, opts),
			datestr = this.completeFormate(format,dateFormat);
		if(opts.complete){
			dateStr = $.coral.formatDate(srcDateFormat, date, opts);
		}else {
			//getValue()的时候如果配置的srcDateFormat有分隔符，按照下面的处理，取到值的分隔符按照srcDateFormat的分隔符显示
			if(srcDateFormat.indexOf("-")>-1 ||srcDateFormat.indexOf("/")>-1 ){
				datestr = (datestr.indexOf("y")>-1 && datestr.indexOf("M")>-1 && datestr.indexOf("d")>-1)?srcDateFormat:datestr; 
				var dateStr = $.coral.formatDate(datestr, date, _getFormatConfig(opts));
				if(dateStr.indexOf("-") > -1){
					var dateStr = dateStr.indexOf(separator) ==-1 ? dateStr.replace(/-/gm,separator):dateStr;
				}else if(dateStr.indexOf("/") > -1){
					var dateStr = dateStr.indexOf(separator) ==-1 ? dateStr.replace(/\//gm,separator):dateStr;
				}
			}else{
				//如果srcDateFormat没有分隔符，例如srcDateFormat=“yyyyMMdd”,按如下处理
				datestr = datestr.indexOf("-")>-1?datestr.replace(/-/gm,""):datestr.replace(/\//gm,"");
				if(datestr.indexOf("y")>-1){
					if(datestr.indexOf("d")==-1 && datestr.indexOf("y")>-1 && datestr.indexOf("M")>-1){
						srcDateFormat = (srcDateFormat.split(" "))[0];
						datestr = srcDateFormat.replace(/d/gm,"");
					}
					if(datestr.indexOf("y")>-1 && datestr.indexOf("M")>-1 && datestr.indexOf("d")>-1){
						datestr = srcDateFormat;
					}else{
						datestr = datestr;
					}
				}
				dateStr = $.coral.formatDate(datestr, date, opts);
			}
		}
		opts.input.parent().find("input[type='hidden']").val(dateStr);
	},
	/**
	 * 取得隐藏字段值
	 */
	_getHiddenInputValue:function(){
		var opts = this.options;
		var id=opts.id;
		return opts.input.parent().find("input[type='hidden']").val();
	},
	//根据dateFormat构件editFormat
	_createEditFormat : function(dateFormat){
		var editFormat="";
		if(dateFormat!=null){
			if(this._isYearMonthMode(dateFormat)){
				editFormat+="yyyy-MM";
			}else if(this._isYearMode(dateFormat)){
				editFormat+="yyyy";
			}else{
				editFormat+="yyyy-MM-dd";
			}
			if(_hasTime(dateFormat)){
				editFormat+=" HH:mm:ss";
			}
		}
		return editFormat;
	},
	//如果complete为true，返回dateFormat即自动补全；若complete为false,根据配置的格式来显示
	completeFormate : function(dateshow,dateFormat){
		var str1,str2,mark = null,datestr;
		var opts = this.options;
		var dateformat = dateFormat.indexOf("H")>-1?(dateFormat.split(" "))[0]:dateFormat;
		if(opts.complete){
			return dateFormat;
		}else{
			//若dateformat不含“dd”,则只需根据dateFormat的格式来显示
			if(dateformat.indexOf("d") == -1){
				if(dateformat.indexOf("d") == -1 && dateshow.indexOf("M") == -1){
					return dateshow;
				}
				return dateformat;
			}
			//若dateFormat中有“dd”,则根据配置的模式显示，但是样式要和dateFormat的样式一样
			if(dateformat.indexOf("d") > -1){
				var posYear = dateformat.indexOf("y"),
				 	posDay =  dateformat.indexOf("d"),
				 	substr1 = dateformat.substr(posDay + 2,dateformat.length),
					substr2 = dateformat.substr(0,posDay-1),
					substr3 = dateformat.substr(0,posDay + 2);
				//如果dateshow只有两位,即dd,则直接返回dateshow
				if(dateshow.length == 2){
					return dateshow;
				}
				//如果dateshow为yyyyMMdd,则返回dateFormat的格式
				if(dateshow.indexOf("y") > -1 && dateshow.indexOf("d") > -1 && dateshow.indexOf("M") > -1){
					return dateFormat;
				}
				//如果dateshow不含dd,比如“yyyyMM”,根据dateFormat格式返回
				if(dateshow.indexOf("d") == -1){
					if(dateshow.indexOf("M") == -1){
						return dateshow;
					}
					if( posDay == 0){
						datestr = substr1;
					}
					if(posDay == 8){
						datestr = substr2;
					}
					if(posDay == 3){
						datestr = substr2 + substr1;
					}
				}else if(dateshow.indexOf("y") == -1){
					if( posYear == 0){
						datestr = dateformat.substr(posYear + 5,5);
					}
					if(posYear == 6){
						datestr = dateformat.substr(0,posYear-1);
					}
				}
			}
			return datestr;
		}
	},
	compMaxMin: function(){
		var opts = this.options;
		var minDate = this._getMinMaxDate("min");
		var maxDate = this._getMinMaxDate("max");
		if(minDate && opts.currentYear == minDate.getFullYear() && opts.currentMonth == minDate.getMonth() 
				&& opts.currentDay == minDate.getDate().toString()) {
			if(opts.currentHur < minDate.getHours()) {
				opts.currentHur = minDate.getHours();
				opts.currentMiu = minDate.getMinutes();
				opts.currentSed = minDate.getSeconds();
			} else if(opts.currentHur == minDate.getHours()){
				opts.currentHur = minDate.getHours();
				if(opts.currentMiu < minDate.getMinutes()) {
					opts.currentMiu = minDate.getMinutes();
					opts.currentSed = minDate.getSeconds();
				}else if(opts.currentMiu == minDate.getMinutes()){
					opts.currentMiu = minDate.getMinutes();
					if (opts.currentSed <= minDate.getSeconds()){
						opts.currentSed = minDate.getSeconds();
					}
				}
			} 
		} else if(maxDate && opts.currentYear == maxDate.getFullYear() && opts.currentMonth == maxDate.getMonth() 
				&& opts.currentDay == maxDate.getDate().toString()){
			if(opts.currentHur > maxDate.getHours()) {
				opts.currentHur = maxDate.getHours();
				opts.currentMiu = maxDate.getMinutes();
				opts.currentSed = maxDate.getSeconds();
			} else if(opts.currentHur == maxDate.getHours()){
				opts.currentHur = maxDate.getHours();
				if(opts.currentMiu > maxDate.getMinutes()) {
					opts.currentMiu = maxDate.getMinutes();
					opts.currentSed = maxDate.getSeconds();
				}else if(opts.currentMiu == maxDate.getMinutes()){
					opts.currentMiu = maxDate.getMinutes();
					if (opts.currentSed >= maxDate.getSeconds()){
						opts.currentSed = maxDate.getSeconds();
					}
				}
			} 
		}
	},
	//失去焦点的时候将编辑格式换成显示格式
	_inputBlur : function(e){
		this.component().removeClass( "coral-state-focus" );
		var opts = this.options;
		var dateFormat=opts.dateFormat;
		if(this.isReadonly() || this.isIsLabel()){
			return ;
		}
		var oldValue = this._getHiddenInputValue();
		var datestr = "";
		var minDate = this._getMinMaxDate("min");
		var maxDate = this._getMinMaxDate("max");
		this.compMaxMin();
		var date = _daylightSavingAdjustWidthTime(new Date(opts.currentYear, opts.currentMonth, opts.currentDay),[opts.currentHur,opts.currentMiu,opts.currentSed]);
		// 日期面板不显示的时候才触发onBlur事件和onChange事件；
		// 日期面板显示的时候，onChange事件交给面板上面的事件去处理；
		if ( (typeof opts.currentYear != "undefined" || opts.currentYear != null) && !opts.isShow ) {
			var srcDateFormat = getFormatter(opts.input.val(),opts.dateFormat, opts);
			var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[a-zA-Z]|[`~!@#\$%\^\&\*\(\)_\+<>\?"\{\},\.\\\;'\[\]]|^[-/:]|[-/:]$/gi;
			if(patrn.exec(opts.input.val())){
				opts.input.val("");
			}
			// 修改赋值bug 20150129
			if ( "" != opts.input.val() ) {
				datestr = this.completeFormate(srcDateFormat,dateFormat);
				datestr = $.coral.formatDate(datestr, date, opts);
			} 
			opts.input.val(datestr);
			this._setHiddenInputValue();
			//var value = this._getHiddenInputValue();
			//设置隐藏字段值
//				opts.dpDiv.find("#dpTimeHour").val(opts.currentHur||"00");
//				opts.dpDiv.find("#dpTimeMinute").val(opts.currentMiu||"00");
//				opts.dpDiv.find("#dpTimeSecond").val(opts.currentSed||"00");
			this._setStartEnd(oldValue, datestr);
			this._change(oldValue, datestr, null);
			this._trigger("onBlur", e, [ { "value": datestr } ]);
		}
	},
	/**
	 * 获取焦点方法
	 */
	focus: function(event) {
		if (event) {
			input = event.target;
		} else {
			input = this.element[0];
		}
		if (input.nodeName.toLowerCase() !== "input") { // find from button/image trigger
			input = $("input", input.parentNode)[0];
		}

		if (this.isDisabled() || this._lastInput === input || this.isReadonly() || this.isIsLabel() || this.isReadonlyInput()) { // already here
			return false;
		}
		input.focus();
		return true;
	},
	//在给定的输入字段上弹出日历组件
	show: function(event) {
		var input,
		    that = this,
		    opts = this.options;
		if (event) {
			input = event.target;
		} else {
			input = this.element[0];
		}
		if (input.nodeName.toLowerCase() !== "input") { // find from button/image trigger
			input = $("input", input.parentNode)[0];
		}

		if ( that.isDisabled() || 
				that._lastInput === input || 
				that.isReadonly() || 
				that.isIsLabel() ) { // already here
			return;
		}

		var beforeShow, beforeShowoptions, isFixed,
			offset, showAnim, duration;
		
		if ( $.coral._curInst && $.coral._curInst !== opts ) {
			$.coral._curInst.dpDiv.stop( true, true );
			if ( opts && that._datepickerShowing ) {
				that.hide();
			}
		}

		beforeShow = opts.beforeShow;
		beforeShowoptions = beforeShow ? beforeShow.apply(input, [input, opts]) : {};
		if(beforeShowoptions === false){
			return;
		}
		that.extendRemove(opts, beforeShowoptions);

		opts.lastVal = null;
		that._lastInput = input;
		that._setDateFromField();

		if ( that._inDialog ) { // 隐藏 cursor
			input.value = "";
		}
		if ( !that._pos ) { // 
			that._pos = that._findPos( input );
			that._pos[1] += input.offsetHeight; // 增加高度
		}
		isFixed = false;
		$(input).parents().each(function() {
			isFixed |= $(this).css("position") === "fixed";
			return !isFixed;
		});

		offset = {left: that._pos[0], top: that._pos[1]};
		that._pos = null;

		opts.dpDiv.empty();
		
		opts.dpDiv.css({position: "absolute", display: "block", top: "-1000px"});
		that.iframePanel.css({position: "absolute", display: "block", top: "-1000px"});
		that.update();
		
		var panel = $(opts.dpDiv),
	        ifPanel = that.iframePanel, 
            width = panel.width(),
	        height = panel.height();
	    
		offset = that._checkOffset(offset, isFixed);
		opts.dpDiv.css({position: (that._inDialog && $.blockUI ?
			"static" : (isFixed ? "fixed" : "absolute")), display: "none",
			left: offset.left + "px", top: offset.top + "px"});
		that.iframePanel.css({position: (that._inDialog && $.blockUI ?
			"static" : (isFixed ? "fixed" : "absolute")), display: "none",
			left: offset.left + "px", top: offset.top + "px", width:width, height:height});
		if ( !opts.isShow ) {
			opts.isShow = true;
			if (!opts.inline) {
				showAnim = opts.showAnim;
				duration = opts.duration;
				if(opts.zIndex!=null){
					opts.dpDiv.zIndex(opts.zIndex+1);
					that.iframePanel.zIndex(opts.zIndex);
				}
				//inst.dpDiv.zIndex($(input).zIndex()+1);
				that._datepickerShowing = true;
	
				if ( $.effects && $.effects.effect[ showAnim ] ) {
					opts.dpDiv.show(showAnim, opts.showOptions, duration);
				} else {
					opts.dpDiv[showAnim || "show"](showAnim ? duration : null);
				}
				that.iframePanel.show(showAnim);   
				if ( that._shouldFocusInput() ) {
					opts.input.focus();
				}
	
				that._curInst = opts;
				$.coral._curInst = that._curInst;
			}
			
			(function move () {
				var datepickerComponent = $(input).parent().parent();
				    
				
				if (opts.isShow) {
					panel.css({
						left : $.coral.getLeft( panel, datepickerComponent ),
						top  : $.coral.getTop( panel, datepickerComponent )
					});
					ifPanel.css({
						left : $.coral.getLeft( panel, datepickerComponent ),
						top  : $.coral.getTop( panel, datepickerComponent )
					});
					setTimeout(move, 200);
				}
			})();
		}
		opts.dpDiv.find( "#dpTimeSpinner" ).spinner( "setValue", opts.dpDiv.find("#dpTimeHour").val() );
		opts.dpDiv.find( "#dpTimeSpinner" ).spinner( "setValue", opts.dpDiv.find("#dpTimeMinute").val() );
		opts.dpDiv.find( "#dpTimeSpinner" ).spinner( "setValue", opts.dpDiv.find("#dpTimeSecond").val() );
	},
	_updateDateTime: function(){
		var that = this,hur,min,sed,
			timeDate=[],compDate,compMin,compMax,
		    opts = this.options;
		if(opts.model=="timepicker"){
			var date = new Date();
			timeDate.push(date.getFullYear(),date.getMonth(),date.getDate());
			var minDate = opts.minTime ?  timeDate.join("-") + " " + opts.minTime: null,
				maxDate = opts.maxTime ? timeDate.join("-") + " " + opts.maxTime: null;
			var minDay = new Date(minDate),
				maxDay = new Date(maxDate);
			compDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
			compMin = compMax = compDate;
		}else{
			var minDate = this._getMinMaxDate("min");
			var maxDate = this._getMinMaxDate("max");
			var minDay = new Date(minDate),
			maxDay = new Date(maxDate);
			compDate = new Date(opts.selectedYear,opts.selectedMonth,opts.selectedDay),
			compMin= new Date(minDay.getFullYear(),minDay.getMonth(),minDay.getDate()),
			compMax= new Date(maxDay.getFullYear(),maxDay.getMonth(),maxDay.getDate());
		}
		opts.dpDiv.find( "#coral-timePanel").find("#dpTimeHour").spinner({
			max: 24,
			min: 0,
			step: 1,
			vertical: true,
			onSpin: function( e, ui ){
				var value = $(this).spinner( "getValue" );
				hur = ui.value;
				if(new Date(compDate).getTime() == new Date(compMin).getTime() &&(minDate && hur < minDay.getHours())|| (maxDate &&  new Date(compDate).getTime() == new Date(compMax).getTime() && hur > maxDay.getHours())){
					$(this).find("#dpTimeHour").val(value);
					return false;
				}
				that._selectTime(hur);
			}
		});
		opts.dpDiv.find( "#coral-timePanel").find("#dpTimeMinute").spinner({
			max: 60,
			min: 0,
			step: 1,
			vertical: true,
			onSpin: function( e, ui ){
				var value = $(this).spinner( "getValue" );
				min = ui.value;
				var hour = opts.dpDiv.find("#dpTimeHour").val();
				if(new Date(compDate).getTime() == new Date(compMin).getTime() && (minDate && min < minDay.getMinutes() && hour <= minDay.getHours())|| (maxDate && new Date(compDate).getTime() == new Date(compMax).getTime() &&  min > maxDay.getMinutes() && hour >= maxDay.getHours())){
					$(this).find("#dpTimeMinute").val(value);
					return false;
				}
				that._selectTime(null,ui.value);
			}
		});
		opts.dpDiv.find( "#coral-timePanel").find("#dpTimeSecond").spinner({
			max: 60,
			min: 0,
			step: 1,
			vertical: true,
			onSpin: function( e, ui ){
				var value = $(this).spinner( "getValue" );
				sed = ui.value;
				var hour = opts.dpDiv.find("#dpTimeHour").val(),
					miu = opts.dpDiv.find("#dpTimeMinute").val();
				if(new Date(compDate).getTime() == new Date(compMin).getTime() &&(minDate && sed < minDay.getSeconds() && hour <= minDay.getHours() && miu <= minDay.getMinutes())|| (maxDate && new Date(compDate).getTime() == new Date(compMax).getTime() &&  sed > maxDay.getSeconds()&& hour >= maxDay.getHours()&& miu >= maxDay.getMinutes())){
					$(this).find("#dpTimeSecond").val(value);
					return false;
				}
				that._selectTime(null,null,ui.value);
			}
		});
	},
	// 更新日历组件
	/* Generate the date picker content. */
	update: function() {
		var opts = this.options,
		    that = this;
		this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
		datepicker_instActive = opts; // for delegate hover events
		if (opts.model=="datepicker") {
			opts.dpDiv.empty().append(this._generateHTML()).append(this._generateTimePanel());
			opts.dpDiv.find("#timepicker").find(".icon-checkmark").hide();
		} else {
			opts.dpDiv.empty().append(this._generateTimePanel());
		}
		this._updateDateTime();
		this._attachHandlers();
		this._attachTimeHandlers();
		
		var origyearshtml,
			numMonths = this._getNumberOfMonths(),
			cols = numMonths[1],
			width = 17,
			activeCell = opts.dpDiv.find( "." + this._dayOverClass + " a" );

		if ( activeCell.length > 0 ) {
			this.datepicker_handleMouseover.apply( activeCell.get( 0 ),[that] );
		}
		opts.dpDiv.removeClass("coral-datepicker-multi-2 coral-datepicker-multi-3 coral-datepicker-multi-4").width("");
		if (cols > 1) {
			opts.dpDiv.addClass("coral-datepicker-multi-" + cols).css("width", (width * cols) + "em");
		}
		opts.dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") +
			"Class"]("coral-datepicker-multi");
		opts.dpDiv[(opts.isRTL ? "add" : "remove") +
			"Class"]("coral-datepicker-rtl");

		if (opts === this._curInst && this._datepickerShowing && this._shouldFocusInput() ) {
			//inst.input.focus();
		}		
		// 
		if( opts.yearshtml ){
			origyearshtml = opts.yearshtml;
			setTimeout(function(){
				//
				if( origyearshtml === opts.yearshtml && opts.yearshtml ){
					opts.dpDiv.find("select.coral-datepicker-year:first").replaceWith(opts.yearshtml);
				}
				origyearshtml = opts.yearshtml = null;
			}, 0);
		}
	},
	_shouldFocusInput: function() {
		var opts = this.options;
		return opts.input && opts.input.is( ":visible" ) && !opts.input.is( ":disabled" ) && !opts.input.is( ":focus" );
	},

	/* 检查屏幕中剩余位置 */
	_checkOffset: function(offset, isFixed) {
		var opts = this.options,
		    dpWidth = opts.dpDiv.outerWidth(),
			dpHeight = opts.dpDiv.outerHeight(),
			inputWidth = opts.input ? opts.input.outerWidth() : 0,
			inputHeight = opts.input ? opts.input.outerHeight() : 0,
			viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft()),
			viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());

		offset.left -= opts.isRTL ? (dpWidth - inputWidth) : 0;
		offset.left -= (isFixed && offset.left === opts.input.offset().left) ? $(document).scrollLeft() : 0;
		offset.top -= (isFixed && offset.top === (opts.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

		offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
		offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);

		return offset;
	},

	/* 发现指定对象在屏幕中的位置. */
	_findPos: function(obj) {
		var position,
			opts = this.options,
			isRTL = opts.isRTL;

		while (obj && (obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden(obj))) {
			obj = obj[isRTL ? "previousSibling" : "nextSibling"];
		}

		position = $(obj).offset();
		return [position.left, position.top];
	},

	//隐藏日历组件
	hide: function(input) {
		var input = this.element[0],
		    that = this,
		    showAnim, duration, postProcess, onClose,
			opts = this._curInst;
		if (!opts || (input && opts !== this.options)) {
			return;
		}
		opts.isShow = false;
		if (this._datepickerShowing) {
			showAnim = opts.showAnim;
			duration = opts.duration;
			postProcess = function() {
				that._tidyDialog(opts);
			};

			if ( $.effects && ( $.effects.effect[ showAnim ] || $.effects[ showAnim ] ) ) {
				opts.dpDiv.hide(showAnim, opts.showOptions, duration, postProcess);
			} else {
				opts.dpDiv[(showAnim === "slideDown" ? "slideUp" :
					(showAnim === "fadeIn" ? "fadeOut" : "hide"))]((showAnim ? duration : null), postProcess);
			}
            this.iframePanel.hide();
            
			if (!showAnim) {
				postProcess();
			}
			this._datepickerShowing = false;

			onClose = opts.onClose;
			if (onClose) {
				onClose.apply((opts.input ? opts.input[0] : null), [(opts.input ? opts.input.val() : ""), opts]);
			}

			this._lastInput = null;
			if (this._inDialog) {
				this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" });
				if ($.blockUI) {
					$.unblockUI();
					$("body").append(this.dpDiv);
				}
			}
			this._inDialog = false;
		}
	},
	
	_tidyDialog: function(opts) {
		opts.dpDiv.removeClass(this._dialogClass).unbind(".coral-datepicker-calendar");
	},

	_checkExternalClick: function(event) {
		var that = event.data.that;
		if (!that._curInst) {
			return;
		}

		var $target = $(event.target),
			opts = that.options;
		if (event.isDefaultPrevented()) {return};
		if ( ( ( $target[0].id !== that._mainDivId &&
				$target.parents("#" + that._mainDivId).length === 0 &&
				!$target.hasClass(that.markerClassName) &&
				!$target.closest("." + that._triggerClass).length &&
				that._datepickerShowing && !(that._inDialog && $.blockUI) ) ) ||
			( $target.hasClass(that.markerClassName) && that._curInst !== opts ) ) {
				that.hide();
		}
	},
	//调整日期字段
	_adjustDate: function(id, offset, period) {
		var target = $(id),
			opts = this.options;

		if (this.isDisabled(target[0]) || this.isReadonly() || this.isIsLabel()) {
			return;
		}
		this._adjustInstDate( offset +
			(period === "M" ? opts.showCurrentAtPos : 0), 
			period);
		this.update();
	},

	//响应gotoToday
	_gotoToday: function(id) {
		var that = this,
			date,
			target = $(id),
			opts = this.options;
		var hasTime = _hasTime(opts.dateFormat);
		if (opts.gotoCurrent && opts.currentDay) {
			opts.selectedDay = opts.currentDay;
			opts.drawMonth = opts.selectedMonth = opts.currentMonth;
			opts.drawYear = opts.selectedYear = opts.currentYear;
		} else {
			date = new Date();
			if ( !hasTime ) {
				date.setHours(0, 0, 0, 0);
			}
			if(that._checkDateRange(date)===1){
				return;
			}else if(that._checkDateRange(date)===2){
				return;
			}
			opts.selectedDay = date.getDate();
			opts.drawMonth = opts.selectedMonth = date.getMonth();
			opts.drawYear = opts.selectedYear = date.getFullYear();
			opts.currentHur = date.getHours();
			opts.currentMiu = date.getMinutes();
			opts.currentSed = date.getSeconds();
			
		}
		this._notifyChange();
		//this._adjustDate(target);//点击今天，面板直接消失不需要update()了
		// 如果没有时间格式，点击“今天”按钮， 则默认选中今天的日期
		
		if (!hasTime) {
			var $targetToday = opts.dpDiv.children("table").find(".coral-datepicker-today");
			this._selectDay(id, +$targetToday.attr("data-month"), +$targetToday.attr("data-year"), $targetToday[0]);
		}else{
			this._selectDateTime();
		}
		this._updateDateTime();
	},

	//响应年月选择
	_selectMonthYear: function(id, select, period, change) {
		var target = $(id),
		    that = this,
			opts = this.options;
		var isYearMonth=this._isYearMonthMode(opts.dateFormat);
		var isYear = this._isYearMode(opts.dateFormat);
		//inst["selected" + (period === "M" ? "Month" : "Year")] =		
		if(isYearMonth===true){
			opts["draw" + (period === "M" ? "Month" : "Year")]=
			parseInt(period === "M" ? $(select).attr("data-month"): select.options[select.selectedIndex].value,10);
		}else if(isYear===true){
			opts["drawYear"]=
				parseInt(period === "Y" ? $(select).attr("data-year"): select.options[select.selectedIndex].value,10);
		}else{
			opts["draw" + (period === "M" ? "Month" : "Year")]=
			parseInt(select.options[select.selectedIndex].value,10);
		}
		opts["selected" + (period === "M" ? "Month" : "Year")]=
		opts["draw" + (period === "M" ? "Month" : "Year")];
			
		var oldValue = this._getHiddenInputValue();
		if(isYearMonth===true && period === "M"){
			this._setMonthYearValue(this);
		}
		if(isYear === true){
			this._setMonthYearValue(this);
			//change = false;
		}
		var value = this._getHiddenInputValue();
		this._notifyChange();
		if(change){
			that._setStartEnd( oldValue, value);
			that._change(oldValue, value, null);
		}
		this._adjustDate(target);
	},
	//针对年月模式时的值处理
	_setMonthYearValue : function($this){
		var opts = this.options,
		    dateFormat = opts.dateFormat;
		if($this._isYearMonthMode(dateFormat)){
			opts.currentYear=opts.selectedYear;
			opts.currentMonth=opts.selectedMonth;
			opts.currentDay=opts.selectedDay=1;
		}
		if($this._isYearMode(dateFormat)){
			opts.currentYear=opts.selectedYear;
			opts.currentMonth=opts.selectedMonth=1;
			opts.currentDay=opts.selectedDay=1;
		}
		var dateStr = $this._formatDate();
		if (opts.input) {
			opts.input.val(dateStr);
		}
		//设置隐藏字段值
		$this._setHiddenInputValue();
	},
	// 选择的天更新到输入域中
	_selectDay: function(id, month, year, td) {
		var opts = this.options,
		    minDate,maxDate,
			target = $(id);

		if ($(td).hasClass(this._unselectableClass) || this.isDisabled() || this.isReadonly() || this.isIsLabel()) {
			return;
		}
		opts.selectedDay = opts.currentDay = $("a", td).html();
		opts.selectedMonth = opts.currentMonth = month;
		opts.selectedYear = opts.currentYear = year;	
		var dateFormat = opts.dateFormat;
		var minDate = this._getMinMaxDate("min");
		var maxDate = this._getMinMaxDate("max");
		this.compMaxMin();
		//验证时间是否超范围
		this._autoFixInput(this);
		//加入时间字段
		var hur=opts.dpDiv.find("#dpTimeHour").val();
		var miu=opts.dpDiv.find("#dpTimeMinute").val();
		var sed=opts.dpDiv.find("#dpTimeSecond").val();
		this._selectDate(id, this._formatDate(
			opts.currentDay, opts.currentMonth, opts.currentYear));
		//日期选中时增加样式
		$(td).parent().parent().find("a").removeClass("coral-state-active");	
		$(td).children("a").addClass("coral-state-active");
		this.update();
		if(this.options.closeOnClick && opts.dateFormat.indexOf("H")==-1 ){
			this.hide();
		}
	},
	//清楚日期
	_clearDate: function() {
		this._setDate("");
	},
	clearError:function(){
		var target = this.element[0];
		$(".coral-validate-state-error").remove();
		$(".coral-errorIcon").remove();
		$(".coral-validate-error").removeClass("coral-validate-error");
		$(target).prop("isError", false);
	},
	// 选择的日期更新到输入域中
	_selectDate: function(id, dateStr) {
		var onSelect,
			target = $(id),
			opts = this.options;

		//取得日期时间格式，查看是否含有时间
		var dateFormat=opts.dateFormat;
		dateStr = (dateStr != null ? dateStr : this._formatDate());
		if (opts.input) {
			opts.input.val(dateStr);
		}
//			opts.value = dateStr;
		this._updateAlternate();
		//不触发修改时间
		/* else if (inst.input && !hasTime) {
			inst.input.trigger("change"); // fire the change event
		}*/
		if (opts.inline){
			this.update();
		} else {
			this._lastInput = opts.input[0];
			if (typeof(opts.input[0]) !== "object") {
				opts.input.focus(); // restore focus
			}
			this._lastInput = null;
			
			var oldValue = this._getHiddenInputValue();
			//设置隐藏字段值
			this._setHiddenInputValue();
			
			var datestr=this._getHiddenInputValue();
			if( datestr !== oldValue ) {
				this._setStartEnd(oldValue, datestr);
				this._change(oldValue, datestr, null);
			}
		}
		//触发日期选择时间
		this._trigger("onSelect", null, [ { "oldValue": oldValue, "newValue": datestr } ]);
	},
	
	/**********************************时间处理start*********************************/
	//增加时间按钮事件及输入框验证处理
	_attachTimeHandlers :function(){var that = this,datestr="",
	    opts = this.options;
		var oldValue = this._getHiddenInputValue();
			this._setHiddenInputValue();
		var	datestr = this._getHiddenInputValue();
		function slideToggleTrans (element, display) {
            var h = display ? (function() {
                var height = 0;
                element.children(":visible").each(function(i){
                	height += $(this).outerHeight(true);
                })
                return height;
            })() : 0;
            element.height(h);
		}
		// 对时间边栏的处理，点击确定按钮后触发时间选择
		opts.dpDiv.find("#timePanel").bind('mousedown',function(e){
			var datePanel = opts.dpDiv.find("#datepicker"),
				timePanel = opts.dpDiv.find("#timepicker");
			if (datePanel.hasClass("in")) {
				slideToggleTrans(datePanel,true);
				slideToggleTrans(datePanel,false);
				slideToggleTrans(timePanel,true);
				setTimeout(function(){
					timePanel.css("height", "auto")
				}, 350);
			} else {
				slideToggleTrans(timePanel,true);
				slideToggleTrans(datePanel,true);
				slideToggleTrans(timePanel,false);
				setTimeout(function(){
					datePanel.css("height", "auto")
				}, 350);
			}
			datePanel.toggleClass('in')
			e.preventDefault();
		});
		this._verifyInput(opts.dpDiv.find("#dpTimeHour"),"H");
		this._verifyInput(opts.dpDiv.find("#dpTimeMinute"),"m");
		this._verifyInput(opts.dpDiv.find("#dpTimeSecond"),"s");
	},
	//自动更正时间范围
	_autoFixInput : function (that){
		var min = 0,
		    opts = this.options;
		var minDate = that._getMinMaxDate("min");
		var maxDate = that._getMinMaxDate("max");
		var hur=opts.dpDiv.find("#dpTimeHour").val();
		var miu=opts.dpDiv.find("#dpTimeMinute").val();
		var sed=opts.dpDiv.find("#dpTimeSecond").val();
		//如果时间的输入框输入的不是数字，那么返回上一个日期
		hur = hur.replace(/[^0-9]/g,'');
		if(hur=='')  hur = opts.currentHur;
		miu = miu.replace(/[^0-9]/g,'');
		if(miu=='')  miu = opts.currentMiu;
		sed = sed.replace(/[^0-9]/g,'');
		if(sed=='')  sed = opts.currentSed;
		var date=new Date(opts.currentYear,opts.currentMonth,opts.currentDay,hur,miu,sed);
		var tmpDate=date;
		if(that._checkDateRange(date)===1){
			tmpDate=maxDate;
		}else if(that._checkDateRange(date)===2){
			tmpDate=minDate;
		}
		opts.dpDiv.find("#dpTimeHour").spinner("setValue",tmpDate.getHours()||"00");
		opts.dpDiv.find("#dpTimeMinute").spinner("setValue",tmpDate.getMinutes()||"00");
		opts.dpDiv.find("#dpTimeSecond").spinner("setValue",tmpDate.getSeconds()||"00");
//			opts.dpDiv.find("#dpTimeHour").val(tmpDate.getHours()||"00");
//			opts.dpDiv.find("#dpTimeMinute").val(tmpDate.getMinutes()||"00");
//			opts.dpDiv.find("#dpTimeSecond").val(tmpDate.getSeconds()||"00");
	},
	//增加输入框验证
	_verifyInput : function(input,type){
		var that=this,min=0,max=59;
		max=type=="H"?23:max;
		input.change(function(){   
                    that._autoFixInput(that); 
                }).bind("paste",function(){  //CTR+V事件处理    
                    //处理最大最小日期时间范围
                    that._autoFixInput(that); 
                });
	},
	_selectTime: function(hour,min,sed){
		var opts = this.options;
		var oldValue = this._getHiddenInputValue();
		var hur=hour || opts.dpDiv.find("#dpTimeHour").val();
		var miu=min || opts.dpDiv.find("#dpTimeMinute").val();
		var sed=sed || opts.dpDiv.find("#dpTimeSecond").val();
				
		opts.currentHur=hur;
		opts.currentMiu=miu;
		opts.currentSed=sed;
		opts.input.val( this._formatDate() );
		this._setHiddenInputValue();
		var datestr=this._getHiddenInputValue();
		this._change(oldValue, datestr, null);
		
	},
	//将选择的日期时间更新到输入框中
	_selectDateTime : function(){
		var oldValue = this._getHiddenInputValue(),
		    opts = this.options;
//		var hur=opts.dpDiv.find("#dpTimeHour").val();
//		var miu=opts.dpDiv.find("#dpTimeMinute").val();
//		var sed=opts.dpDiv.find("#dpTimeSecond").val();
//				
//		opts.currentHur=hur;
//		opts.currentMiu=miu;
//		opts.currentSed=sed;
			
		//取得日期时间格式，查看是否含有时间
		var minDate = this._getMinMaxDate("min"),
			maxDate = this._getMinMaxDate("max");	
		var date = new Date();
		if ( !opts.selectedYear ) {
			opts.currentDay = opts.selectedDay = date.getDate();
			opts.currentMonth = opts.selectedMonth = date.getMonth();
			opts.currentYear = opts.selectedYear = date.getFullYear();
			var tmpDate = new Date(opts.currentYear,opts.currentMonth,opts.currentDay,hur,miu,sed);
			if(!(minDate || maxDate)){
				opts.input.val(tmpDate);
			}else {
				if(this._checkDateRange(tmpDate)===1){
					 opts.selectedDay= maxDate.getDate();
					 opts.selectedMonth = maxDate.getMonth();
					 opts.selectedYear = maxDate.getFullYear();
				}else if(this._checkDateRange(tmpDate)===2){
					 opts.selectedDay= minDate.getDate();
					 opts.selectedMonth = minDate.getMonth();
					 opts.selectedYear = minDate.getFullYear();
				}
			}
		}
		opts.input.val( this._formatDate() );
		//设置隐藏字段值
		this._setHiddenInputValue();
		this._updateAlternate();
		
		var datestr=this._getHiddenInputValue();
		
		this._setStartEnd(oldValue, datestr);
		this._change(oldValue, datestr, null);
		var target = $(opts.input[0]);
		this.hide();
	},

	//检查日期格式中是否含有时间格式
	//返回 true or false
	_hasHur : function( dateFormat ){
		var format = ( dateFormat+"" );
		if( format.indexOf("H")!=-1 ){
			return true;
		}
		return false;
	},
	_hasMin : function( dateFormat ){
		var format = ( dateFormat+"" );
		if( format.indexOf("m")!=-1 ){
			return true;
		}
		return false;
	},
	_hasSec : function( dateFormat ){
		var format = ( dateFormat+"" );
		if( format.indexOf("s")!=-1 ){
			return true;
		}
		return false;
	},
	//是否为年月模式的
	_isYearMonthMode : function(dateFormat){
		if(!_hasTime(dateFormat)){
			return dateFormat.indexOf("M")!=-1 && dateFormat.indexOf("y")!=-1 &&dateFormat.indexOf("d")==-1;
		}
		return false;
	},
	//是否为只有年的模式
	_isYearMode : function(dateFormat){
		if(!_hasTime(dateFormat)){
			return dateFormat.indexOf("y")!=-1 && dateFormat.indexOf("M")==-1 && dateFormat.indexOf("d")==-1;
		}
		return false;
	},
	/**********************************时间处理end*********************************/

	//交替更新
	_updateAlternate: function() {
		var opts = this.options,
		    altFormat, date, dateStr,
			altField = opts.altField;

		if (altField) { // update alternate field too
			altFormat = opts.altFormat || opts.dateFormat;
			date = this._getDate();
			dateStr = $.coral.formatDate(altFormat, date, opts);
			$(altField).each(function() { $(this).val(dateStr); });
		}
	},
	noWeekends: function(date) {
		var day = date.getDay();
		return [(day > 0 && day < 6), ""];
	},
	/*// yyyy-MM-dd 
	// 11
	//查找format的分隔符在什么位置
	searchIndex : function(format){
		var i=0,j=0,temp = [];
		format = format.indexOf("/")>-1 ? format.replace( /\//g, "" ):format.replace( /-/g, "" );
		for( i = 0; i < format.length - 1; i++ ){
			if ( format[i] != format[i+1] ){//splice
				temp.push(j+1);
				j++;
			}
			j++;
		}
		return temp;
	},*/
	//解析指定格式的字符串为一个Date对象
	//指定格式为yyyy-MM 或 yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss

	
	ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
	COOKIE: "D, dd M yy",
	ISO_8601: "yy-mm-dd",
	RFC_822: "D, d M y",
	RFC_850: "DD, dd-M-y",
	RFC_1036: "D, d M y",
	RFC_1123: "D, d M yy",
	RFC_2822: "D, d M yy",
	RSS: "D, d M y", // RFC 822
	TICKS: "!",
	TIMESTAMP: "@",
	W3C: "yy-mm-dd", // ISO 8601

	_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

	/* 
	 * 将Date对象格式化为一个字符串
y	将年份表示为最多两位数字。如果年份多于两位数，则结果中仅显示两位低位数。
yy	同上，如果小于两位数，前面补零。
yyy	将年份表示为三位数字。如果少于三位数，前面补零。
yyyy	将年份表示为四位数字。如果少于四位数，前面补零。
M	将月份表示为从 1 至 12 的数字
M M	同上，如果小于两位数，前面补零。
M M M	返回月份的缩写 一月 至 十二月 (英文状态下 Jan to Dec) 。
M M M M	返回月份的全称 一月 至 十二月 (英文状态下 January to December) 。
d	将月中日期表示为从 1 至 31 的数字。
d d	同上，如果小于两位数，前面补零。
H	将小时表示为从 0 至 23 的数字。
H H	同上，如果小于两位数，前面补零。
m	将分钟表示为从 0 至 59 的数字。
m m	同上，如果小于两位数，前面补零。
s	将秒表示为从 0 至 59 的数字。
s s	同上，如果小于两位数，前面补零。
w	返回星期对应的数字 0 (星期天) - 6 (星期六) 。
D	返回星期的缩写 一 至 六 (英文状态下 Sun to Sat) 。
D D	返回星期的全称 星期一 至 星期六 (英文状态下 Sunday to Saturday) 。
W	返回周对应的数字 (1 - 53) 。
W W	同上，如果小于两位数，前面补零 (01 - 53) 。
	 */
	
	
	_possibleChars: function (format) {
		var iFormat,
			chars = "",
			literal = false,

			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					chars += format.charAt(iFormat);
				}
			} else {
				switch (format.charAt(iFormat)) {
					//case "d": case "m": case "y": case "@":
					case "d": case "m": case "y": case "@": case "H": case "M": case "s":
						chars += "0123456789";
						break;
					//case "D": case "M":
					case "D": case "W":
						return null; // Accept anything
					case "'":
						if (lookAhead("'")) {
							chars += "'";
						} else {
							literal = true;
						}
						break;
					default:
						chars += format.charAt(iFormat);
				}
			}
		}
		return chars;
	},
	//解析可执行的Date对象初始化日历组件
	_setDateFromField: function( noDefault) {
		var opts = this.options;
		var dateFormat = opts.dateFormat,
			dates = opts.lastVal = opts.input ? opts.input.val() : null,
			defaultDate = this._getDefaultDate(),
			date = defaultDate,
			dateValue = opts.input.val(),
			options = _getFormatConfig(opts);
		
		try {
			date = $.coral.parseDate(dateFormat, dateValue, opts) || defaultDate;
		} catch (event) {
			//dateValue = (noDefault ? "" : dateValue);
			date = defaultDate;
		}
		opts.selectedDay = date.getDate();
		opts.drawMonth = opts.selectedMonth = date.getMonth();
		opts.drawYear = opts.selectedYear = date.getFullYear();
		opts.currentDay = date.getDate();
		opts.currentMonth = date.getMonth();
		opts.currentYear = date.getFullYear();
		
		opts.currentHur = date.getHours();
		opts.currentMiu = date.getMinutes();
		opts.currentSed = date.getSeconds();
		this._adjustInstDate();
	},

	//取得默认的date在显示时
	_getDefaultDate: function() {
		var opts = this.options;
		return this._restrictMinMax(
			this._determineDate(opts.defaultDate, new Date()));
	},
	/* A date may be specified as an exact value or a relative one. */
	//按照指定格式来判定时间范围
	//指定格式 为 yyyy-MM-dd HH:mm:ss 或者 yyyy-MM-dd
	_determineDate: function( date, defaultDate) {
		var that = this,timeDate=[],
		    opts = this.options;
		var offsetNumeric = function(offset) {
				var date = new Date();
				date.setDate(date.getDate() + offset);
				return date;
			},
			offsetString = function(offset) {
				try {
					var tmpFormat="yyyy-MM-dd";
					var srcDateFormat=opts.srcDateFormat;
					if(that._isYearMonthMode(srcDateFormat)){
						tmpFormat="yyyy-MM";
					}
					if(that._isYearMode(srcDateFormat)){
						tmpFormat="yyyy";
					}
					if((offset+"").length>10 && _hasTime(srcDateFormat)){
						tmpFormat+=" HH:mm:ss";
					}
					tmpFormat = opts.dateFormat;
					//return $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
					return $.coral.parseDate(tmpFormat,
						offset, opts);
				}catch (e) {
					// Ignore
					//return "Invalid Date";
					//触发格式化错误事件
/*						that._apply(inst,"onFormatError",[date,inst]);TODO: 涉及_apply的以后要重写
						that._apply(inst,"onFormatWarn",[date,inst]);*/
				}

				var date = (offset.toLowerCase().match(/^c/) ?
					that._getDate() : null) || new Date(),
					year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
					matches = pattern.exec(offset);

				while (matches) {
					switch (matches[2] || "d") {
						case "d" : case "D" :
							day += parseInt(matches[1],10); break;
						case "w" : case "W" :
							day += parseInt(matches[1],10) * 7; break;
						case "m" : case "M" :
							month += parseInt(matches[1],10);
							day = Math.min(day, that._getDaysInMonth(year, month,opts));
							break;
						case "y": case "Y" :
							year += parseInt(matches[1],10);
							day = Math.min(day, that._getDaysInMonth(year, month,opts));
							break;
					}
					matches = pattern.exec(offset);
				}
				return new Date(year, month, day);
			},
			newDate = (date == null || date === "" ? 
					defaultDate : 
					(typeof date === "string" ? 
						offsetString(date) : 
						(typeof date === "number" ? 
							(isNaN(date) ? 
								defaultDate : 
								offsetNumeric(date)
							) : 
							new Date(date.getTime())
						)
					)
				);

		newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
		var hur = 0, miu = 0, sed = 0, msed = 0;
		if (newDate) {
			hur = newDate.getHours(),
			miu = newDate.getMinutes(),
			sed = newDate.getSeconds(),
			msed = newDate.getMilliseconds();
			
			newDate.setHours(0);
			newDate.setMinutes(0);
			newDate.setSeconds(0);
			newDate.setMilliseconds(0);
		}
		return _daylightSavingAdjustWidthTime(newDate,[hur,miu,sed]);
	},

	//直接设置日期
	_setDate: function(date, noChange) {
		var clear = !date,
		    opts = this.options,
			origMonth = opts.selectedMonth,
			origYear = opts.selectedYear,
			newDate = this._restrictMinMax(this._determineDate(date, new Date()));
		var dateFormat=opts.dateFormat,
		    oldValue = this._getHiddenInputValue();
		opts.selectedDay = opts.currentDay = newDate.getDate();
		opts.drawMonth = opts.selectedMonth = opts.currentMonth = newDate.getMonth();
		opts.drawYear = opts.selectedYear = opts.currentYear = newDate.getFullYear();
		
		opts.currentHur=newDate.getHours();
		opts.currentMiu=newDate.getMinutes();
		opts.currentSed=newDate.getSeconds();
		
		if ((origMonth !== opts.selectedMonth || origYear !== opts.selectedYear) && !noChange) {
			this._notifyChange();
		}
		this._adjustInstDate();
		if (opts.input) {
			if ( clear ) {
				this._processDefaultDate(this,"");
				this._setHiddenInputValue();//设置隐藏字段值
			} else {
				if(opts.complete){
//					opts.input.val(this._formatDate());
					var currentValue = this._formatDate();
					opts.input.val(currentValue);
					this._setStartEnd(oldValue,currentValue);
				}else{
					var format = getFormatter(opts.value,opts.dateFormat, opts);
					var datestr = this.completeFormate(format,dateFormat);
					datestr = $.coral.formatDate(datestr, date, opts);
					/*var format = this.getFormatter(inst.input.val(),this._get(inst,"srcDateFormat"), this._getFormatConfig(inst));
				var datestr = this.completeFormate(format,this._get(inst,"srcDateFormat"),inst);*/
					opts.input.val(datestr);
				}
			}
		}
	},

	//取回日期对象
	_getDate: function() {
		var opts = this.options,
		    startDate = (!opts.currentYear || (opts.input && opts.input.val() === "") ? null :
			_daylightSavingAdjustWidthTime( new Date( opts.currentYear, opts.currentMonth, opts.currentDay ), [opts.currentHur,opts.currentMiu,opts.currentSed] ) );
		return startDate;
	},
	
	//响应日历组件上的各种动作事件 
	_attachHandlers: function() {
		var $this=this,
		    opts = this.options;
		var stepMonths = opts.stepMonths,
			id = "#" + opts.id.replace( /\\\\/g, "\\" );
		var isYearMonth=this._isYearMonthMode(opts.dateFormat);
		var isYear = this._isYearMode(opts.dateFormat);
		opts.dpDiv.find("[data-handler]").map(function () {
			var handler = {
				prev: function () {
					if(isYearMonth===true){
						$this._adjustDate(id, -1, "Y");
					}else if(isYear===true){
						$this._adjustDate(id, -12, "Y");
					}else{
						$this._adjustDate(id, -stepMonths, "M");
					}
					//$this._setMonthYearValue($this,inst);
					return false;
				},
				next: function () {
					if(isYearMonth===true){
						$this._adjustDate(id, +1, "Y");
					}else if(isYear===true){
						$this._adjustDate(id, +12, "Y");
					}else{
						$this._adjustDate(id, +stepMonths, "M");
					}
					//$this._setMonthYearValue($this,inst);
					return false;
				},
				hide: function () {
					$this.hide();
				},
				today: function () {
					$this._gotoToday(id);					
					return false;
				},
				selectDay: function () {
					$this._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
					return false;
				},
				selectMonthAndHide: function(){
					$this._selectMonthYear(id, this, "M", true);
					$this.hide();
					return false;
				},
				selectYearAndHide: function(){
					$this._selectMonthYear(id, this, "Y", true);
					$this.hide();
					return false;
				},
				selectMonth: function () {
					$this._selectMonthYear(id, this, "M");
					return false;
				},
				selectYear: function () {
					$this._selectMonthYear(id, this, "Y");
					return false;
				},
				focusTime: function () {
//					var opts = this.options;
					if ( $(this).prop("readonly") ) return false;
					$this.focusInput = this.id;
					if ( this.id == "dpTimeHour" ){
						opts.dpDiv.find(".coral-datepicer-timePanel").hide();
						opts.dpDiv.find(".hourMenu").show();
					}
					if ( this.id == "dpTimeMinute" ){
						//获得时间的值，然后判断如果大于最小日期的时间，例如最小日期的时间为09:20:45，那么可以获得时间的值为09，那么选择大于9点的时候，分钟和秒
						//都是可以选择的，用新生成的面板来取代原来的面板。
						var value = $("#dpTimeHour").val();
						opts.dpDiv.find(".coral-datepicer-timePanel").hide();
						opts.dpDiv.find(".minuteMenu").replaceWith($this._modifiedMin(value));
						opts.dpDiv.find(".minuteMenu").show();
					}
					if ( this.id == "dpTimeSecond" ){
						var value = $("#dpTimeHour").val();
						var value1 = $("#dpTimeMinute").val();
						opts.dpDiv.find(".secondMenu").replaceWith($this._modifiedSed(value,value1));
						opts.dpDiv.find(".coral-datepicer-timePanel").hide();
						opts.dpDiv.find(".secondMenu").show();
					}
					return false;
				}
			};
			$(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
			//重新生成的时间面板绑定"mousedown"事件，点击事件面板选中时间
			$(opts.dpDiv).off(".hourMenu").on("mousedown.hourMenu", ".hourMenu", function(e){
				if ( !$(e.target).hasClass("menuTimeSel") ) return false;;
				opts.dpDiv.find("#dpTimeHour").spinner("setValue",$(e.target).html());
				opts.dpDiv.find(".menuSel").hide();
				$this._autoFixInput($this);
				$this._selectTime();
				opts.dpDiv.find("#coral-timePanel").show();
				return false;
			});
			$(opts.dpDiv).off(".minuteMenu").on("mousedown.minuteMenu", ".minuteMenu", function(e){
				if ( !$(e.target).hasClass("menuTimeSel") ) return false;;
				opts.dpDiv.find("#dpTimeMinute").spinner("setValue",$(e.target).html());
				opts.dpDiv.find(".menuSel").hide();
				$this._autoFixInput($this);
				$this._selectTime();
				opts.dpDiv.find("#coral-timePanel").show();
				return false;
			});
			$(opts.dpDiv).off(".secondMenu").on("mousedown.secondMenu", ".secondMenu", function(e){
				if ( !$(e.target).hasClass("menuTimeSel") ) return false;;
				opts.dpDiv.find("#dpTimeSecond").spinner("setValue",$(e.target).html());
				opts.dpDiv.find(".menuSel").hide();
				$this._autoFixInput($this);
				$this._selectTime();
				opts.dpDiv.find("#coral-timePanel").show();
				return false;
			});
		});
	},
	// 生成 当前状态日历组件的html代码
	_generateHTML: function() {
		var opts = this.options,
		    maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
			controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
			monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
			selectOtherMonths, defaultDate,defaultDateTime, html, dow, row, group, col, selectedDate,
			cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
			printDate, dRow, tbody, dayoptions, otherMonth, unselectable,
			tempDate = new Date(),
			today = _daylightSavingAdjustWidthTime(
				new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()),[0,0,0]), // clear time
			isRTL = opts.isRTL,
			isYearMonth=this._isYearMonthMode(opts.dateFormat),
			isYear=this._isYearMode(opts.dateFormat),
			showButtonPanel = isYearMonth==true || isYear==true?false:opts.showButtonPanel,
			hideIfNoPrevNext = opts.hideIfNoPrevNext,
			navigationAsDateFormat = opts.navigationAsDateFormat,
			numMonths = this._getNumberOfMonths(),
			showCurrentAtPos = opts.showCurrentAtPos,
			stepMonths = opts.stepMonths,
			isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
			currentDate = _daylightSavingAdjustWidthTime((!opts.currentDay ? new Date(9999,9,9) :
				new Date(opts.currentYear, opts.currentMonth, opts.currentDay)),[0,0,0]),
			minDate = this._getMinMaxDate("min"),
			maxDate = this._getMinMaxDate("max"),		
			drawMonth = opts.drawMonth - showCurrentAtPos,
			drawYear = opts.drawYear,
			//日期时间格式
			dateFormat = opts.dateFormat,
			panelCls = "";
			//根据日期时间格式调整最大最小值，在日历绘制时
			var hasTime = _hasTime(opts.dateFormat);
			//有time情况，最小日期要-1
			/*if(minDate!=null && hasTime){
				minDate.setDate(minDate.getDate());
			}*/
			//无time情况，最大日期要+1(作废)
			/*if(maxDate!=null && !hasTime){
				maxDate.setDate(maxDate.getDate());
			}*/

		if (drawMonth < 0) {
			drawMonth += 12;
			drawYear--;
		}
		if (maxDate) {
			maxDraw = _daylightSavingAdjustWidthTime(new Date(maxDate.getFullYear(),
				maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()),[opts.currentHur,opts.currentMiu,opts.currentSed]);
			maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
			while (_daylightSavingAdjustWidthTime(new Date(drawYear, drawMonth, 1),[opts.currentHur,opts.currentMiu,opts.currentSed]) > maxDraw) {
				drawMonth--;
				if (drawMonth < 0) {
					drawMonth = 11;
					drawYear--;
				}
			}
		}
		opts.drawMonth = drawMonth;
		opts.drawYear = drawYear;

		prevText = opts.prevText;
		prevText = (!navigationAsDateFormat ? prevText : $.coral.formatDate(prevText,
			_daylightSavingAdjustWidthTime(new Date(drawYear, drawMonth - stepMonths, 1),[opts.currentHur,opts.currentMiu,opts.currentSed]),
			opts));

		prev = (this._canAdjustMonth(-1, drawYear, drawMonth) ?
			"<a class='coral-datepicker-prev coral-state-default coral-corner-all' data-handler='prev' data-event='mousedown'" +
			" title='" + prevText + "'><span class='icon  cui-icon-arrow-" + ( isRTL ? "right3" : "left3") + "'></span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='coral-datepicker-prev coral-state-default coral-corner-all coral-state-disabled' title='"+ prevText +"'><span class='coral-icon coral-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

		nextText = opts.nextText;
		nextText = (!navigationAsDateFormat ? nextText : $.coral.formatDate(nextText,
			_daylightSavingAdjustWidthTime(new Date(drawYear, drawMonth + stepMonths, 1),[opts.currentHur,opts.currentMiu,opts.currentSed]),
			opts));

		next = (this._canAdjustMonth( +1, drawYear, drawMonth) ?
			"<a class='coral-datepicker-next coral-state-default coral-corner-all' data-handler='next' data-event='mousedown'" +
			" title='" + nextText + "'><span class='cui-icon-arrow-" + ( isRTL ? "left3" : "right3") + "'></span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='coral-datepicker-next coral-state-default coral-corner-all coral-state-disabled' title='"+ nextText + "'><span class='coral-icon coral-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

		currentText = opts.currentText;
		gotoDate = (opts.gotoCurrent && opts.currentDay ? currentDate : today);
		currentText = (!navigationAsDateFormat ? currentText :
			$.coral.formatDate(currentText, gotoDate, opts));

		controls = "";//(!inst.inline ? "<button type='button' class='coral-datepicker-close coral-state-default coral-priority-primary coral-corner-all' data-handler='hide' data-event='click'>" +
			//this._get(inst, "closeText") + "</button>" : "");

		buttonPanel = (showButtonPanel) ? "<div class='coral-datepicker-buttonpane coral-component-content' "+(isYearMonth || isYear?"style='display:none'":"")+">" + (isRTL ? controls : "") +
			(this._isInRange( gotoDate) ? "<button type='button' class='coral-datepicker-current coral-state-default coral-priority-primary coral-corner-all' data-handler='today' data-event='mousedown'" +
			">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";
		var buttonPanelstr = "";
		!hasTime||(buttonPanelstr += '<button class="coral-datepicker-close coral-state-default coral-priority-secondary coral-corner-all" id="dpTimeEnsure">确定</button>');	
		buttonPanelstr += (showButtonPanel)? "<button type='button' class='coral-datepicker-current coral-state-default coral-priority-primary coral-corner-all' data-handler='today' data-event='mousedown'" +
			">" + currentText + "</button>":"";

		firstDay = parseInt(opts.firstDay,10);
		firstDay = (isNaN(firstDay) ? 0 : firstDay);

		showWeek = opts.showWeek;
		dayNames = opts.dayNames;
		dayNamesMin = opts.dayNamesMin;
		monthNames = opts.monthNames;
		monthNamesShort = opts.monthNamesShort;
		beforeShowDay = opts.beforeShowDay;
		showOtherMonths = opts.showOtherMonths;
		selectOtherMonths = opts.selectOtherMonths;
		defaultDateTime = this._getDefaultDate();//原始defaultDate，会含有时间格式
		//只含年月日
		defaultDate=new Date(defaultDateTime.getFullYear(),defaultDateTime.getMonth(),defaultDateTime.getDate());
		html = "";
		dow;
		if(opts.model == "datepicker"){
			panelCls = "collapse in"
		}
		for (row = 0; row < numMonths[0]; row++) {
			group = "";
			this.maxRows = 4;
			for (col = 0; col < numMonths[1]; col++) {
				selectedDate = _daylightSavingAdjustWidthTime(new Date(drawYear, drawMonth, opts.selectedDay),[opts.currentHur,opts.currentMiu,opts.currentSed]);
				cornerClass = " coral-corner-all";
				calender = "";
				if (isMultiMonth) {
					calender += "<div class='coral-datepicker-group";
					if (numMonths[1] > 1) {
						switch (col) {
							case 0: calender += " coral-datepicker-group-first";
								cornerClass = " coral-corner-" + (isRTL ? "right" : "left"); break;
							case numMonths[1]-1: calender += " coral-datepicker-group-last";
								cornerClass = " coral-corner-" + (isRTL ? "left" : "right"); break;
							default: calender += " coral-datepicker-group-middle"; cornerClass = ""; break;
						}
					}
					calender += "'>";
				}
				calender += "<div id='datepicker' class='coral-datepickerPanel "+ panelCls +"'><div class='coral-datepicker-header coral-helper-clearfix" + cornerClass + "'>" +
					(/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
					(/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
					this._generateMonthYearHeader(drawMonth, drawYear, minDate, maxDate,
					row > 0 || col > 0, monthNames, monthNamesShort,isYearMonth) + // draw month headers
					"</div>" ;
				if(isYearMonth===true){
					//生成月份
					calender += this._generateMonthHTML(drawMonth, drawYear, minDate, maxDate,
						row > 0 || col > 0, monthNames, monthNamesShort,currentDate,today);
				}
				//生成年份
				if(isYear == true){
					calender += this._generateYearHTML(drawYear, minDate, maxDate,
							row > 0 || col > 0,currentDate,today);
				}
				calender += "<table class='coral-datepicker-calendar' "+(isYearMonth || isYear ? "style='display:none'":"")+"><thead>" +
					"<tr>";
				thead = (showWeek ? "<th class='coral-datepicker-week-col'>" + opts.weekHeader + "</th>" : "");
				for (dow = 0; dow < 7; dow++) { // days of the week
					day = (dow + firstDay) % 7;
					thead += "<th scope='col'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='coral-datepicker-week-end'" : "") + ">" +
						"<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
				}
				calender += thead + "</tr></thead><tbody>";
				daysInMonth = this._getDaysInMonth(drawYear, drawMonth,opts);
				if (drawYear === opts.selectedYear && drawMonth === opts.selectedMonth) {
					opts.selectedDay = Math.min(opts.selectedDay, daysInMonth);
				}
				leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
				curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
				numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
				this.maxRows = numRows;
				printDate = _daylightSavingAdjustWidthTime(new Date(drawYear, drawMonth, 1 - leadDays),[0,0,0]);
				for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
					calender += "<tr>";
					tbody = (!showWeek ? "" : "<td class='coral-datepicker-week-col'>" +
						opts.calculateWeek(printDate) + "</td>");
					for (dow = 0; dow < 7; dow++) { // create date picker days
						dayoptions = (beforeShowDay ?
							beforeShowDay.apply((opts.input ? opts.input[0] : null), [printDate]) : [true, ""]);
						otherMonth = (printDate.getMonth() !== drawMonth);
						unselectable = (otherMonth && !selectOtherMonths) || !dayoptions[0] ||
							(minDate && printDate<= new Date(minDate.getFullYear(),minDate.getMonth(),minDate.getDate()-1)) || (maxDate && printDate > maxDate);
						tbody += "<td class='" +
							((dow + firstDay + 6) % 7 >= 5 ? " coral-datepicker-week-end" : "") + // highlight weekends
							(otherMonth ? " coral-datepicker-other-month" : "") + // highlight days from other months
							((printDate.getTime() === selectedDate.getTime() && drawMonth === opts.selectedMonth && opts._keyEvent) || // user pressed key
							(defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
							// or defaultDate is current printedDate and defaultDate is selectedDate
							" " + this._dayOverClass : "") + // highlight selected day
							(unselectable ? " " + this._unselectableClass + " coral-state-disabled": "") +  // highlight unselectable days
							(otherMonth && !showOtherMonths ? "" : " " + dayoptions[1] + // highlight custom dates
							(printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
							(printDate.getTime() === today.getTime() ? " coral-datepicker-today" : "")) + "'" + // highlight today (if different)
							((!otherMonth || showOtherMonths) && dayoptions[2] ? " title='" + dayoptions[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
							(unselectable ? "" : " data-handler='selectDay' data-event='mousedown' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
							(otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
							(unselectable ? "<span class='coral-state-default'>" + printDate.getDate() + "</span>" : "<a class='coral-state-default" +
							(printDate.getTime() === today.getTime() ? " coral-state-highlight" : "") +
							(printDate.getTime() === currentDate.getTime() ? " coral-state-active" : "") + // highlight selected day
							(otherMonth ? " coral-priority-secondary" : "") + // distinguish dates from other months
							"' href='javascript:void(0);'>" + printDate.getDate() + "</a>")) + "</td>"; // display selectable date
						printDate.setDate(printDate.getDate() + 1);
						printDate = _daylightSavingAdjustWidthTime(printDate,[0,0,0]);
					}
					calender += tbody + "</tr>";
				}
				drawMonth++;
				if (drawMonth > 11) {
					drawMonth = 0;
					drawYear++;
				}
				if (hasTime) {
					 calender += "</tbody></table></div><div class='picker-switch accordion-toggle'>" +
					 	"<a class='coral-datepicker-today time-btn' data-handler='today' data-event='mousedown'>今天</a>";
					 calender +="<a id='timePanel' class='date-time-icon time-btn'><span class='cui-icon-clock'/></a>" +
					 	"<a class='datepicker-close time-btn' data-handler='hide' data-event='click'>关闭</a></div>";
				 }

				group += calender;
			}
			html += group;
		}
		//html += buttonPanel;
		opts._keyEvent = false;
		return html;
	},
	
	//生成 仿win8 风格 月份
	_generateMonthHTML : function(drawMonth,drawYear,minDate, maxDate,
			secondary, monthNames, monthNamesShort,currentDate,today){
		var html="<table class='coral-datepicker-calendar' ><tbody>";
		var opts = this.options;
		var month=0;var highlightcss="";var activecss="";
		var inMinYear = (minDate && minDate.getFullYear() === drawYear);
		var inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
		for(var i=0;i<3;i++){
			html+="<tr>"
			for(var j=0;j<4;j++){
				if(month === today.getMonth() && drawYear === today.getFullYear()){
					highlightcss="coral-state-highlight";
				}else{
					highlightcss="";
				}
				if(month === drawMonth){
					activecss="coral-state-active";
				}else{
					activecss="";
				}
				if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())){
					html+="<td data-handler='selectMonthAndHide' data-event='mousedown' data-month='"+ month +"'>" +
						"<a class='coral-state-default date-month "+ highlightcss + " "+activecss+"' href='javascript:void(0);'" +
						">"+ monthNames[month++] +"</a></td>";
				}else{
					html+="<td class='"+ this._unselectableClass + " coral-state-disabled'>" +
						"<span class='date-month' >"+ monthNames[month++] + "</span></td>";
				}
			}
			html+="</tr>";
		}
		return html+"</tbody></table>";
	},
	isExist: function(datestr) {
		if (typeof datestr != "undefined"){
			return  true;
		} else {
			return false;
		}
	},
	_timeDateInitValue: function(){
		var opts = this.options,hur,min,sed,tmpDate,
			timeDate = [],minDay,maxDay,compMin,compMax,compDate,
			date=new Date();
		if(opts.model == "timepicker"){
			hur = opts.currentHur ? opts.currentHur: date.getHours() ,
			min = opts.currentMiu ? opts.currentMiu: date.getMinutes(),
			sed = opts.currentSed ? opts.currentSed: date.getSeconds();
			timeDate.push(date.getFullYear(),date.getMonth(),date.getDate());
			var minDate = opts.minTime ?  timeDate.join("-") + " " + opts.minTime: null,
				maxDate = opts.maxTime ? timeDate.join("-") + " " + opts.maxTime: null;
			tmpDate=new Date(date.getFullYear(),date.getMonth(),date.getDate(), hur, min, sed);
			compDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
			compMin = compMax = compDate;
		} else {
			var hasTime=_hasTime(opts.dateFormat),
				hasHur=this._hasHur(opts.dateFormat),
				hasMin=this._hasMin(opts.dateFormat),
				hasSec=this._hasSec(opts.dateFormat);
			var minDate = opts.minDate;
				maxDate = opts.maxDate;
			hur = hasHur?( this.isExist(opts.currentHur) ? opts.currentHur : date.getHours() ):"00";
			min = hasMin?( this.isExist(opts.currentMiu) ? opts.currentMiu : date.getMinutes() ):"00";
			sed = hasSec?( this.isExist(opts.currentSed) ? opts.currentSed : date.getSeconds() ):"00";
			tmpDate=new Date(opts.selectedYear,opts.selectedMonth,opts.selectedDay, hur, min, sed);
			compDate = new Date(opts.selectedYear,opts.selectedMonth,opts.selectedDay);
			if (minDate && minDate != ""){
				minDay = new Date(minDate.replace(/-/g, "/"));
				compMin= new Date(minDay.getFullYear(),minDay.getMonth(),minDay.getDate());
			}
			if (maxDate && maxDate != ""){
				maxDay = new Date(maxDate.replace(/-/g, "/"));
				compMax= new Date(maxDay.getFullYear(),maxDay.getMonth(),maxDay.getDate());
			}
		}
		//验证时间是否超范围
		if(this._checkDateRange(tmpDate)===1){
			tmpDate=new Date(maxDate.replace(/-/g, "/"));
			hur=tmpDate.getHours();
			min=tmpDate.getMinutes();
			sed=tmpDate.getSeconds();
		}else if(this._checkDateRange(tmpDate)===2){
			tmpDate=new Date(minDate.replace(/-/g, "/"));
			hur=tmpDate.getHours();
			min=tmpDate.getMinutes();
			sed=tmpDate.getSeconds();
		}
		return {
			hur:hur,min:min,sed:sed,
			minDate:minDate,maxDate:maxDate,
			minDay:minDay,maxDay:maxDay,
			compMin:compMin,compMax:compMax,compDate:compDate
		}
	},
	_generateTimePanel: function(){
		var opts = this.options,divStyle,
			dateFormat = opts.dateFormat;
		var calender = [],panelCls = "",timeValue,minDay,compMin,compMax,maxDay;
		if(this.options.model == "datepicker"){
			panelCls = "collapse";
		}
		timeValue = this._timeDateInitValue();
		var minDate = timeValue.minDate,
			maxDate = timeValue.maxDate,
			compDate = timeValue.compDate,
			compMin = timeValue.compMin,
			compMax = timeValue.compMax;
		calender.push( "<div id='timepicker' class='coral-timepickerPanel "+ panelCls +"'>");
		calender.push("<table id='coral-timePanel' class='coral-datepicer-timePanel'><tr><td><input data-handler='focusTime' data-event='click' id='dpTimeHour' name='timeHourVal' value='"+ timeValue.hur +"' maxlength='2'/></td>")
		calender.push("<td class='separator'>:</td><td><input id='dpTimeMinute' name='timeMinVal' data-handler='focusTime' data-event='click' value='"+ timeValue.min +"' maxlength='2'/></td>");
		if (opts.model=="datepicker" && opts.dateFormat.indexOf("s") > -1 ||
				opts.model=="timepicker" && opts.timeFormat.indexOf("s") > -1){
			divStyle = "";
		} else {
			divStyle = "display:none";
		}
		calender.push("<td class='separator' style="+ divStyle +">:</td><td id='secondTd' style="+ divStyle +"><input id='dpTimeSecond' name='timeSecVal' data-handler='focusTime' data-event='click' value='"+ timeValue.sed +"' maxlength='2'/></td>"); 
		calender.push("</tr></table>");
		calender.push(this._timeHourPanel(minDate,maxDate,compDate,compMin,compMax,false));
		// init minute
		calender.push(this._timeMinPanel(minDate,maxDate,compDate,compMin,compMax,false));
		// init second
		calender.push(this._timeSedPanel(minDate,maxDate,compDate,compMin,compMax,false));
		calender.push("</div>");
		return calender.join("");
	},
	//只生成年份
	_generateYearHTML : function(drawYear,minDate, maxDate,
			secondary, currentDate,today){
		var opts = this.options;
		var html="<table class='coral-datepicker-calendar' ><tbody>";
		var highlightcss="";var activecss="";
		var year = drawYear-(drawYear%12);
		var inMinYear = (minDate && minDate.getFullYear() === drawYear);
		var inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
		
		for(var i=0;i<3;i++){
			html+="<tr>"
			for(var j=0;j<4;j++){
				/*if(drawYear === today.getFullYear()){
					highlightcss="coral-state-highlight";
				}else{*/
					highlightcss="";
				//}
				if(year == opts.currentYear){
					activecss="coral-state-active";
				}else{
					activecss="";
				}
				if ((!inMinYear || year >= minDate.getFullYear()) && (!inMaxYear || year <= maxDate.getFullYear())){
					html+="<td data-handler='selectYearAndHide' data-event='mousedown' data-year='"+ year +"'>" +
						"<a class='coral-state-default date-year "+ " "+activecss+"' href='javascript:void(0);'" +
						">"+ year++ +"</a></td>";
				}else{
					html+="<td class='"+ this._unselectableClass + " coral-state-disabled'>" +
						"<span class='date-year' >"+ year++ + "</span></td>";
				}
			}
			html+="</tr>";
		}
		return html+"</tbody></table>";
	},
	_timeHourPanel: function(minDate,maxDate,compDate,compMin,compMax,isTimePanel){
		var dateTimeHTML = [],hourCls = "";
		if(isTimePanel){
			hourCls = "hourPanel";
		}
		dateTimeHTML.push( "<div class='menuSel hourMenu '"+ hourCls +" style='display: none;'>");
		dateTimeHTML.push( "<table cellspacing='0' cellpadding='3' border='0' nowrap='nowrap'><tbody>" );
		var k= 0;
		for ( var i = 0; i < 6; i++ ) {
			dateTimeHTML.push( "<tr nowrap='nowrap'></tr>" );
			for ( var j = 0; j < 4; j++ ) {
					if((minDate && k < new Date(minDate).getHours() && new Date(compDate).getTime() == new Date(compMin).getTime())
							||(maxDate && k > new Date(maxDate).getHours() && new Date(compDate).getTime() == new Date(compMax).getTime())){
						dateTimeHTML.push( "<td nowrap='' class='menuTimeSel coral-state-disabled' data-handler='clickHour' data-event='click' >" +
								((k++)/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
					}else{
						dateTimeHTML.push( "<td nowrap='' class='menuTimeSel' data-handler='clickHour' data-event='click' >"+ ((k++)/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}
			}
			dateTimeHTML.push( "</tr>" );
		}
		dateTimeHTML.push( "</tbody></table></div>" );
		return dateTimeHTML.join("");
	},
	_timeMinPanel: function(minDate,maxDate,compDate,compMin,compMax,isTimePanel){
		var dateTimeHTML = [],minCls = "";
		if(isTimePanel){
			minCls = "minPanel";
		}
		dateTimeHTML.push( "<div class='menuSel minuteMenu '"+ minCls +" style='display: none;'>" );
		dateTimeHTML.push( "<table cellspacing='0' cellpadding='3' border='0' nowrap='nowrap'><tbody>" );
		var k= 0;
		for ( var i = 0; i < 3; i++ ) {
			dateTimeHTML.push( "<tr nowrap='nowrap'></tr>" );
			for ( var j = 0; j < 4; j++ ) {
				if((minDate && k < new Date(minDate).getMinutes() && new Date(compDate).getTime() == new Date(compMin).getTime() )
						||(maxDate && k > new Date(maxDate).getMinutes() && new Date(compDate).getTime() == new Date(compMax).getTime())){
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel coral-state-disabled' data-handler='clickMinute' data-event='click'>" +
							k +"</td>" );
				}else{
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel' data-handler='clickMinute' data-event='click' >"+ k +"</td>" );
				}
				k+=5;
			}
			dateTimeHTML.push( "</tr>" );
		}
		dateTimeHTML.push( "</tbody></table></div>" );
		return dateTimeHTML.join("");
	},
	_timeSedPanel: function(minDate,maxDate,compDate,compMin,compMax,isTimePanel) {
		var dateTimeHTML = [],k,sedCls = "";
		if(isTimePanel){
			sedCls = "sedPanel";
		}
		dateTimeHTML.push( "<div class='menuSel secondMenu '"+ sedCls +" style='display: none;'>" );
		dateTimeHTML.push( "<table cellspacing='0' cellpadding='3' border='0' nowrap='nowrap'><tbody>" );
		k= 0;
		for ( var i = 0; i <4; i++ ) {
			dateTimeHTML.push( "<tr nowrap='nowrap'></tr>" );
			for ( var j = 0; j < 3; j++ ) {
				if((minDate && k < new Date(minDate).getSeconds() && new Date(compDate).getTime() == new Date(compMin).getTime() )
						||(maxDate && k > new Date(maxDate).getSeconds() && new Date(compDate).getTime() == new Date(compMax).getTime())){
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel coral-state-disabled' data-handler='clickSecond' data-event='click'>" +
							(k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}else{
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel' data-handler='clickSecond' data-event='click' >"+ (k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}
				k+=5;
			}
			dateTimeHTML.push( "</tr>" );
		}
		dateTimeHTML.push( "</tbody></table></div>" );
		return dateTimeHTML.join("");
	},
	//有最小值和最大值的时候，例如最小日期为2015-08-12 09:45:10 ，当选择2015-08-12，时间大于9点的时候，分钟和秒的面板上的所有值都可以点击，因此重新生成面板
	_modifiedMin: function(value){
		var opts = this.options,timeDate=[],
			minDay,maxDay,compDate,
			minDate = opts.minDate,
			maxDate = opts.maxDate,
			compMin,compMax;
		if(opts.model == "timepicker"){
			var date = new Date();
			timeDate.push(date.getFullYear(),date.getMonth(),date.getDate());
			minDate = opts.minTime ?  timeDate.join("-") + " " + opts.minTime: null,
			maxDate = opts.maxTime ? timeDate.join("-") + " " + opts.maxTime: null;
			compDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
			compMin = compMax = compDate;
		} else {
			compDate = new Date(opts.selectedYear,opts.selectedMonth,opts.selectedDay),
			minDay = new Date(minDate),
			maxDay = new Date(maxDate);
			compMin= new Date(minDay.getFullYear(),minDay.getMonth(),minDay.getDate()),
			compMax= new Date(maxDay.getFullYear(),maxDay.getMonth(),maxDay.getDate());
		}
		var dateTimeHTML= [];
		dateTimeHTML.push( "<div class='menuSel minuteMenu' style='display: none;'>" );
		dateTimeHTML.push( "<table cellspacing='0' cellpadding='3' border='0<tr' nowrap='nowrap'><tbody>" );
		var k= 0;
		for ( var i = 0; i < 3; i++ ) {
			dateTimeHTML.push( "<tr nowrap='nowrap'></tr>" );
			for ( var j = 0; j < 4; j++ ) {
				if((minDate && k < new Date(minDate).getMinutes() && new Date(compDate).getTime() == new Date(compMin).getTime() && value == new Date(minDate).getHours())
						||(maxDate && k > new Date(maxDate).getMinutes() && new Date(compDate).getTime() == new Date(compMax).getTime() && value == new Date(maxDate).getHours())){
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel coral-state-disabled' data-handler='clickMinute' data-event='click'>" +
							(k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}else{
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel' data-handler='clickMinute' data-event='click' >"+ (k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}
				k+=5;
			}
			dateTimeHTML.push( "</tr>" );
		}
		dateTimeHTML.push( "</tbody></table></div>" );
		return dateTimeHTML.join("");
	},
	_modifiedSed: function(value,value1){
		var opts = this.options;
		var minDate = opts.minDate;
		var maxDate = opts.maxDate;
		var compDate = new Date(opts.selectedYear,opts.selectedMonth,opts.selectedDay),
			minDay = new Date(minDate),
			maxDay = new Date(maxDate),
			compMin= new Date(minDay.getFullYear(),minDay.getMonth(),minDay.getDate()),
			compMax= new Date(maxDay.getFullYear(),maxDay.getMonth(),maxDay.getDate());
		var dateTimeHTML= [];
		dateTimeHTML.push( "<div class='menuSel secondMenu' style='display: none;'>" );
		dateTimeHTML.push( "<table cellspacing='0' cellpadding='3' border='0<tr' nowrap='nowrap'><tbody>" );
		var k= 0;
		for ( var i = 0; i < 3; i++ ) {
			dateTimeHTML.push( "<tr nowrap='nowrap'></tr>" );
			for ( var j = 0; j < 4; j++ ) {
				if((minDate && k < new Date(minDate).getSeconds() && new Date(compDate).getTime() == new Date(compMin).getTime() && value == new Date(minDate).getHours() && value1 == new Date(minDate).getMinutes())
						||(maxDate && k > new Date(maxDate).getSeconds() && new Date(compDate).getTime() == new Date(compMax).getTime()&& value == new Date(maxDate).getHours() && value1 == new Date(maxDate).getMinutes())){
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel coral-state-disabled' data-handler='clickSecond' data-event='click'>" +
							(k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}else{
					dateTimeHTML.push( "<td nowrap='' class='menuTimeSel' data-handler='clickSecond' data-event='click' >"+ (k/Math.pow(10,2)).toFixed(2).substr(2) +"</td>" );
				}
				k+=5;
			}
			dateTimeHTML.push( "</tr>" );
		}
		dateTimeHTML.push( "</tbody></table></div>" );
		return dateTimeHTML.join("");
	},
	// 生成月份和年度的头部
	_generateMonthYearHeader: function(drawMonth, drawYear, minDate, maxDate,
			secondary, monthNames, monthNamesShort,isYearMonth) {

		var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
		    opts = this.options,
			changeMonth = opts.changeMonth,
			changeYear = opts.changeYear,
			showMonthAfterYear = opts.showMonthAfterYear,
			html = "<div class='coral-datepicker-title'>",
			monthHtml = "",
			monthSuffix = opts.monthSuffix,
			dateFormat = opts.dateFormat;
		//年份
		//月份选择
		if(!this._isYearMonthMode(dateFormat)&&!this._isYearMode(dateFormat)){
			if (secondary || !changeMonth) {
				monthHtml += "<span class='coral-datepicker-month'>" + monthNames[drawMonth] + "</span>";
			} else {
				inMinYear = (minDate && minDate.getFullYear() === drawYear);
				inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
				monthHtml += "<select class='coral-datepicker-month' data-handler='selectMonth' data-event='change'>";
				for ( month = 0; month < 12; month++) {
					if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
						monthHtml += "<option value='" + month + "'" +
						(month === drawMonth ? " selected='selected'" : "") +
						">" + monthNamesShort[month] + "</option>";
					}
				}
				
				monthHtml += "</select>";
				monthHtml += monthSuffix;// “月”，写死在panel
			}
			
			if (!showMonthAfterYear) {
				html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
			}
		}

		// 年度选择
		if ( !opts.yearshtml ) {
			opts.yearshtml = "";
			if (secondary || !changeYear) {
				html += "<span class='coral-datepicker-year'>" + drawYear + "</span>";
			} else {
				// 判断 年度范围用来显示
				years = opts.yearRange.split(":");
				thisYear = new Date().getFullYear();
				determineYear = function(value) {
					var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
						(value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
						parseInt(value, 10)));
					return (isNaN(year) ? thisYear : year);
				};
				year = determineYear(years[0]);
				endYear = Math.max(year, determineYear(years[1] || ""));
				year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
				endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
				if(this._isYearMode(dateFormat)){
					var year = drawYear-(drawYear % 12)
					opts.yearshtml +="<span class = 'coral-datepicker-year'>" + year + "-" + (year+11) + "</span>";
				}else{
					opts.yearshtml += "<select class='coral-datepicker-year' data-handler='selectYear' data-event='change'>";
					for (; year <= endYear; year++) {
						opts.yearshtml += "<option value='" + year + "'" +
						(year === drawYear ? " selected='selected'" : "") +
						">" + year + "</option>";
					}
					opts.yearshtml += "</select>";
				}

				html += opts.yearshtml;
				opts.yearshtml = null;
			}
		}

		html += opts.yearSuffix;
		if (showMonthAfterYear) {
			html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + (isYearMonth===false?monthHtml:"");
		}
		html += "</div>"; // 关闭 datepicker_header
		return html;
	},
	
	//调整日期子字段
	_adjustInstDate: function(offset, period) {
		var opts = this.options;
		var year = opts.drawYear + (period === "Y" ? offset : 0),
			month = opts.drawMonth + (period === "M" ? offset : 0),
			day = Math.min(opts.selectedDay, this._getDaysInMonth(year, month,opts)) + (period === "D" ? offset : 0),
			date = this._restrictMinMax(_daylightSavingAdjustWidthTime(new Date(year, month, day),[opts.currentHur,opts.currentMiu,opts.currentSed]));

		opts.selectedDay = date.getDate();
		opts.drawMonth = opts.selectedMonth = date.getMonth();
		opts.drawYear = opts.selectedYear = date.getFullYear();
		if (period === "M" || period === "Y") {
			this._notifyChange();
		}
	},

	//保证一个日期在最大和最小范围内
	_restrictMinMax: function(date) {
		var opts = this.options;
		var minDate = this._getMinMaxDate( "min"),
			maxDate = this._getMinMaxDate("max"),
			newDate = (minDate && date < minDate ? minDate : date);
		return (maxDate && newDate > maxDate ? maxDate : newDate);
	},

	//通知月份或月份发生改变
	_notifyChange: function() {
		var opts = this.options,
		    onChange = opts.onChangeMonthYear;
		if (onChange) {
			onChange.apply((opts.input ? opts.input[0] : null),
				[opts.selectedYear, opts.selectedMonth + 1, opts]);
		}
	},

	//判断 显示的月份数量
	_getNumberOfMonths: function() {
		var opts = this.options;
		var numMonths = opts.numberOfMonths;
		return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
	},

	//判定当前最大最小的日期 - 保证没有时间组件被设定
	_getMinMaxDate: function( minMax) {
		var opts = this.options,temp,
			defaultDate;
		if(opts.model == "timepicker"){
			temp = minMax + "Time";
		} else {
			temp = minMax + "Date";
		}
		return this._determineDate(opts[temp], null);
	},

	//查找月中的日期
	_getDaysInMonth: function(year, month,options) {
		// TODO: 代码优化；
		var opts = options;
		if ( opts ) {
			return 32 - _daylightSavingAdjustWidthTime(new Date(year, month, 32),[opts.currentHur,opts.currentMiu,opts.currentSed]).getDate();
		} else {
			return 32 - _daylightSavingAdjustWidthTime(new Date(year, month, 32),[0,0,0]).getDate();
		}
	},

	//查找月中的第一天的date
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},

	//判定 是否允许调整月份
	_canAdjustMonth: function(offset, curYear, curMonth) {
		var opts = this.options,
		    numMonths = this._getNumberOfMonths(),
			date = _daylightSavingAdjustWidthTime(new Date(curYear,
			curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1),[opts.currentHur,opts.currentMiu,opts.currentSed]);

		if (offset < 0) {
			date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth(),opts));
		}
		return this._isInRange(date);
	},

	//给定的日期是否在接收范围内
	_isInRange: function(date) {
		var opts = this.options,
		    yearSplit, currentYear,
			minDate = this._getMinMaxDate("min"),
			maxDate = this._getMinMaxDate("max"),
			minYear = null,
			maxYear = null,
			years = opts.yearRange;
			if (years){
				yearSplit = years.split(":");
				currentYear = new Date().getFullYear();
				minYear = parseInt(yearSplit[0], 10);
				maxYear = parseInt(yearSplit[1], 10);
				if ( yearSplit[0].match(/[+\-].*/) ) {
					minYear += currentYear;
				}
				if ( yearSplit[1].match(/[+\-].*/) ) {
					maxYear += currentYear;
				}
			}

		return ((!minDate || date.getTime() >= minDate.getTime()) &&
			(!maxDate || date.getTime() <= maxDate.getTime()) &&
			(!minYear || date.getFullYear() >= minYear) &&
			(!maxYear || date.getFullYear() <= maxYear));
	},

	//格式化给定的日期用来显示
	_formatDate: function(day, month, year) {
		var opts = this.options;
		if (!day) {
			opts.currentDay = opts.selectedDay;
			opts.currentMonth = opts.selectedMonth;
			opts.currentYear = opts.selectedYear;
		}
		var minDate = this._getMinMaxDate("min");
		var maxDate = this._getMinMaxDate("max");
		var date = (day ? (typeof day === "object" ? day :
			_daylightSavingAdjustWidthTime(new Date(year, month, day),[opts.currentHur,opts.currentMiu,opts.currentSed])) :
			_daylightSavingAdjustWidthTime(new Date(opts.currentYear, opts.currentMonth, opts.currentDay),[opts.currentHur,opts.currentMiu,opts.currentSed]));
//			date.setHours(opts.currentHur);
//			date.setMinutes(opts.currentMiu);
//			date.setSeconds(opts.currentSed);
//			date.setMilliseconds(0);
		return $.coral.formatDate(opts.dateFormat, date, opts);
	},
	//调用事件
	_apply : function(type,datas,event){
		var opts = this.options;
		var callback = opts.type;
		if (callback) {
			if(typeof callback ==="string"){
				return window[callback].apply((opts.input ? opts.input[0] : null),[event].concat(datas));
			}else if($.isFunction( callback )){
				return callback.apply((opts.input ? opts.input[0] : null), [event].concat(datas));
			}
		}
	}
	
})
// noDefinePart
} ) );