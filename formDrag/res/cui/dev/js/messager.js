( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./dialog"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.messager = {
	/**
	 *  遮罩功能
	 */
	loading : {
		show: function($el) {
			if (! $el instanceof jQuery) {
				$el = $($el);
			}
			var loadingId = $el.attr("data-loading-id");
			if (!loadingId) {
				loadingId = new Date().getTime();
				$el.attr("data-loading-id", "loading_" + loadingId);
			}
			
			var $uiLoading = $("<div id='loading_"+ loadingId +"' class='coral-loading'><div class='coral-loading-zone'></div><span class='coral-loading-text'>加载中，请稍后...</span></div>");
			var $uiLoadingZone = $uiLoading.find(".coral-loading-zone");
			var $uiLoadingText = $uiLoading.find(".coral-loading-text");	
			
			$uiLoading.outerWidth($el.outerWidth());
			$uiLoading.outerHeight($el.outerHeight());
			$uiLoadingZone.outerWidth($el.outerWidth());
			$uiLoadingZone.outerHeight($el.outerHeight());
			
			$uiLoading.position({
				my: "left top",
				at: "left top",
				of: $el
			});	
			$(document.body).append($uiLoading);
			
			var loadingTextLeft = ( $uiLoading.outerWidth() - $uiLoadingText.outerWidth() ) / 2;
			$uiLoadingText.css({
				left: loadingTextLeft
			});
		},
		hide: function($el) {
			if (! $el instanceof jQuery) {
				$el = $($el);
			}
			var loadingId = $el.attr("data-loading-id");
			if (!loadingId) return;
			
			$("#" + loadingId).remove();
			$el.removeAttr("data-loading-id");
		}
	},
	_isType:function(options){
		var icons = "", typeCls = "",iconType,
			iconCls = options.iconCls,
			rep = $.inArray(options.cls, ["info", "success", "warning", "error", "question", "danger", "alert"]);
		if(options.cls && rep > -1){
			options.type = options.cls;
		}
		if(!options.type){
			options.type = "info";
		}
		var defaultIconCls = {
			warning: "cui-icon-warning2",
			danger: "cui-icon-cancel-circle2",
			error: "cui-icon-cancel-circle2",
			success: "cui-icon-checkmark4",
			alert: "cui-icon-notification2",
			info: "cui-icon-notification2",
			confirm:"cui-icon-question4"
		};
		if ( options.type == "alert" ) {
			typeCls = "coral-control-info ";
			iconType = defaultIconCls.alert;
		} else if ( options.type == "success" ) {
			typeCls = "coral-control-success ";
			iconType = defaultIconCls.success;
		} else if ( options.type =="danger" ) {
			typeCls = "coral-control-danger ";
			iconType = defaultIconCls.danger;
		} else if ( options.type =="info" ) {// info 用在message
			typeCls = "coral-control-info ";
			iconType = defaultIconCls.info;
		} else if ( options.type == "confirm" ) {
			typeCls = "coral-control-question ";
			iconType = defaultIconCls.confirm;
		}else if ( options.type == "warning" ) {
			typeCls = "coral-control-warning ";
			iconType = defaultIconCls.warning;
		}
		if(typeof iconCls === "boolean"){
			icons = iconCls === true ? 
					icons = "<span class='icon-control "+ typeCls + iconType +"'></span>" : "";
		}
		if(typeof iconCls === "string"){
			icons = "<span class='icon-control " + typeCls + options.iconCls +"'></span>";
		}
		return icons;
	},
	_init: function( dialog, options ){
		options.maximizable=false;
		if( options.queue === true ){
			if ( !$("#coral-msgBox").length ) {
				$("<div id='coral-msgBox' class='queueMessage'style='z-index:9999999999'></div>").appendTo("body");
			}
			options.appendTo = "#coral-msgBox";
		} 
		var icons = "", typeCls = "",iconType,
			iconCls = options.iconCls;
		if ( options.wtype == "messageBox" ) {
			dialog = $( "<div class='coral-messagerBox'>" +
				(options.iconCls || "") +
				"<span class='coral-messagerBox-content'>" +
				options.message + "</span></div>" ).appendTo( "body" );
		} else if ( options.wtype == "message" ) {
			icons = this._isType(options);
			var hasIcon = iconCls === false ? "" : "hasIcon ";
			dialog = $("<div class='"+ hasIcon + options.type +"' role='alert'>" +
					icons +
					"<span class='coral-alert-content'>" + options.message + "</span></div>").appendTo( "body" );
		} else if ( options.wtype == "progress" ) {
			icons = this._isType(options);
			dialog = $( "<div class='coral-messager-body coral-messager-progress'>"+icons +
				"<span class='coral-messager-content'>" +
				options.message + "</span><div class='coralui-progressbar'></div></div>" ).appendTo( "body" );
		}  else if ( typeof options.message !== "undefined" && options.wtype != "message" ) {
			icons = this._isType(options);
			dialog = $( "<div class='coral-messager-body'><span class='coral-messager-box'><span class='hasIcon coral-messager-box-content'>" +
				icons +
				"<span class='coral-messager-content'>" +
				options.message + "</span></span></span></div>" ).appendTo( "body" );
		} 
		return dialog;
	},
	/**
	 * 非模式窗口消息提示
	 * 
	 * options: 设置参数
	 * type: 消息类型
	 * fn: 消息回调
	 */
	message : function ( options, msgType, fn ) {
		if (typeof options === "string" || typeof options === "boolean" || typeof options === "number") {
			options = {message: options.toString(), wtype: "message"};
		} 
		if ( !fn && typeof msgType === "function") {
			fn = msgType;
			msgType = "info";
		}
		if ( !msgType || $.inArray(msgType, ["info", "success", "warning", "error", "question", "danger", "alert"]) < 0) {
			msgType = "info";
		}
		// 默认$.error和默认的方法冲突，只能用$.danger
		if ( msgType == "error" ) {
			msgType = "danger";
		}
		options = options || {};
		options = $.extend( true, {
			autoOpen: true,
			title: "消息提示",
			isMessage: true,//区别消息框和对话框
			show: "slideDown",
			hide: "slideUp",
			modal: false,
			queue: false,
			onClose: fn,
			draggable: false,
			resizable: false,
			width: "auto",
			maxWidth: 600,
			maxHeight: 600,
			wtype: "message",
			type: msgType,
			iconCls: true,
			timeOut: 2999
		}, $.message.defaults , $.messageQueue.defaults , options);
		
		var dialog = $.messager._init( dialog, options );
		dialog.css("max-width", options.maxWidth + "px");
		dialog.dialog(options);
		if (options.wtype === "message") {
			$.messager.messageInstances++;
			$.messager.messageHeights.push(dialog.outerHeight());
		}
	},
	messageBox: function( options, fn ) {
		/*if (typeof options === "string" && options == "close" ) {
			$(fn).dialog("close");
		}*/
		if (typeof options === "string" || typeof options === "boolean" || typeof options === "number") {
			options = {message: options.toString(), wtype: "messageBox"};
		} 
		options = options || {};
		options = $.extend( true, {
			autoOpen: true,
			title: "消息提示",
			show: "slideDown",
			hide: "slideUp",
			isMessage: true,//区别消息框和对话框
			modal: false,
			draggable: false,
			resizable: false,
			width: 200,
			wtype: "messageBox",
			timeOut: 2999
		}, $.messageBox.defaults , options);
		
		var dialog = $.messager._init( dialog, options );
		dialog.dialog(options);
		return dialog;
	},
	messageQueue: function ( message, title, callback ) {
		var defaultTitle = "信息提示";
		var options = {};
		if (typeof message !== "string") {
			options = message || "";
			options.queue = true;
			callback = options.callback;
			title = options.title || defaultTitle;
		}
		if (typeof title === "function") {
			callback = title;
			title = defaultTitle;
		}
		if (title === undefined) {
			title = defaultTitle;
		}
		options = $.extend(true, {
			iconCls:true,
			queue:true,
			message: message.toString(),
			title: title.toString()
		}, $.messageQueue.defaults, options);
		$.messager.message( options );
		options.wtype = "message";
	},
	messageToast: function(message, title, callback){
		var defaultTitle = "信息提示";
		var options = {};
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			autoOpen: true,
			modal: false,
			show: "slideDown",
			hide: "slideUp",
			message: message.toString(),
			title: title.toString(),
			isMessage: true,//区别消息框和对话框
			draggable: false,
			resizable: false,
			iconCls:true,
			width: "auto",
			wtype: "message",
			timeOut: 2999
		}, $.messageToast.defaults, options );
		options.wtype = "message";
		var dialog = $.messager._init( dialog, options );
		dialog.dialog(options);
		
		return dialog;
	},
	// 模式窗口消息提示
	alert: function( message, title, callback ) {
		var defaultTitle = "信息提示";
		var options = {};
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			modal: true,
			message: message.toString(),
			timeOut: 0,
			title: title.toString(),
			isMessage: true,//区别消息框和对话框
			width: 400,
			maxHeight:600,
			icons: "cui-icon-warning2",
			iconCls:true,
			wtype: "alert"
		}, $.alert.defaults, options );
		
		if ((options.timeOut <= 0 || isNaN(options.timeOut)) && !options.buttons) {
			options.buttons = {
				"确定": function() {						
					$( this ).dialog( "close" );
					if (typeof callback === "function") {
						callback(true);
					}
					return true;
				}
			};
		}
		options.wtype = "alert";
		options.type = "alert";
		var dialog = $.messager._init( dialog, options );
		dialog.dialog(options);
		
		return dialog;
	},
	//错误提示窗口
	danger: function(message, title, callback){
		var defaultTitle = "错误提示";
		var options = {};
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			modal: true,
			message: message.toString(),
			timeOut: 0,
			title: title.toString(),
			isMessage: true,//区别消息框和对话框
			width: 400,
			maxHeight: 600,
			iconCls:true,
			icons: "cui-icon-cancel-circle2",
			wtype: "danger"
		}, $.danger.defaults, options );
		
		if ((options.timeOut <= 0 || isNaN(options.timeOut)) && !options.buttons) {
			options.buttons = {
				"确定": function() {						
					$( this ).dialog( "close" );
					if (typeof callback === "function") {
						callback(true);
					}
					return true;
				}
			};
		}
		options.wtype = "danger";
		options.type = "danger";
		var dialog = $.messager._init( dialog, options );
		dialog.dialog(options);
		
		return dialog;
	},
	//success
	success: function(message, title, callback){
		var defaultTitle = "Success";
		var options = {};
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			modal: true,
			message: message.toString(),
			timeOut: 0,
			title: title.toString(),
			isMessage: true,//区别消息框和对话框
			width: 400,
			maxHeight:600,
			iconCls:true,
			icons: "cui-icon-checkmark4",
			wtype: "success"
		}, $.success.defaults, options );
		
		if ((options.timeOut <= 0 || isNaN(options.timeOut)) && !options.buttons) {
			options.buttons = {
				"确定": function() {						
					$( this ).dialog( "close" );
					if (typeof callback === "function") {
						callback(true);
					}
					return true;
				}
			};
		}
		options.wtype = "success";
		options.type = "success";
		var dialog = $.messager._init( dialog, options );
		dialog.dialog(options);
		
		return dialog;
	},
	//确认窗口
	confirm: function(message, title, callback){
		var okText = "确定",
			cancelText = "取消",
			buttons = {}, options = {},
		    defaultTitle = "信息提示";
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
			okText = options.okText ? options.okText : okText;
			cancelText = options.cancelText ? options.cancelText : cancelText;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			autoOpen: true,
			title: "确认提示",
			message: message.toString(),
			title: title.toString(),
			iconCls:true,
			isMessage: true,//区别消息框和对话框
			width: 400,
			maxHeight:600,
			show: "slideDown",
			modal: true,
			icons: "cui-icon-question4",
			buttons: buttons
		}, $.confirm.defaults, options);
		buttons[okText] = function() {
			$( this ).dialog( "close" );
			if (typeof callback === "function") {
				callback(true);
			}
			return false;
		};
		buttons[cancelText] = function() {
			$( this ).dialog( "close" );
			if (typeof callback === "function") {
				callback(false);
			}
			return false;
		};
		options.type = "confirm";
		options.wtype= "confirm";
		var dialog = $.messager._init( dialog, options );
			dialog.dialog(options);
	
		return dialog;
	},
	//进度窗体
	progress: function(message, title, callback){
		if (message === "close") {
			$(".coral-messager-progress").dialog("close");
			var c = $(".coral-messager-progress").dialog("destroy");
			c.remove();
			return;
		}
		if (message === "progressbar") {
			return $(".coral-messager-progress .ctrl-init-progressbar");
		}
		var okText = "确定",
			cancelText = "取消",
			buttons = {}, options = {},
		    defaultTitle = "进度提示";
		if ( typeof message !== "string"  ) {
			options = message || "";
			callback = options.callback;
			title = options.title || defaultTitle;
			okText = options.okText ? options.okText : okText;
			cancelText = options.cancelText ? options.cancelText : cancelText;
		}
		if( typeof title === "function" ) {
			callback = title;
			title = defaultTitle;
		}
		if(title === undefined){
			title = defaultTitle;
		}
		options = $.extend( true, {
			autoOpen: true,
			message: message.toString(),
			title: title.toString(),
			iconCls:true,
			isMessage: false,//区别消息框和对话框
			width: 400,
			maxHeight:600,
			show: "slideDown",
			modal: true,
			icons: "cui-icon-question4"
		}, $.confirm.defaults, options);
		buttons[okText] = function() {
			$( this ).dialog( "close" );
			if (typeof callback === "function") {
				callback(true);
			}
			return false;
		};
		buttons[cancelText] = function() {
			$( this ).dialog( "close" );
			if (typeof callback === "function") {
				callback(false);
			}
			return false;
		};
		options.type = "progress";
		options.wtype= "progress";
		var dialog = $.messager._init( dialog, options );
			dialog.dialog(options);
			$.parser.parse(dialog);
	
		return dialog;
	}
};
/*$.fn["messageBox"] = function ( options ) {
    return this.each(function () {
        if ( options && "hide" !== options ) {
    		$.messageBox( options );
        } else {
            if( "hide" === options ) { 
            	$(this).dialog("close"); 
            } else { 
            	$(this).dialog("open"); 
            }
        }
    });
};*/
$.messager.messageInstances = 0;
$.messager.messageHeights = [];
// 简化使用方式
$.message = $.messager.message;
$.messageQueue = $.messager.messageQueue;
$.messageBox = $.messager.messageBox;
$.messageToast = $.messager.messageToast;
$.alert = $.messager.alert;
$.danger = $.messager.danger;
$.success = $.messager.success;
$.confirm = $.messager.confirm;
$.progress = $.messager.progress;
$.message.defaults = {
	position: {
		my: "top",
		at: "top top+50",
		of: window
	}
};
$.messageQueue.defaults = {
	position: {
		my: "top",
		at: "top top+50",
		of: window
	}
};
$.messageBox.defaults = {
	position: {
		my: "right bottom",
		at: "right bottom",
		of: window
	}
};
$.messageToast.defaults = {
		position: {
			my: "top",
			at: "top top+50",
			of: window
		}
	};
$.alert.defaults = {
	position: {
		my: "center",
		at: "center top+200",
		of: window
	}
};
$.danger.defaults = {
	position: {
		my: "center",
		at: "center top+200",
		of: window
	}
};
$.success.defaults = {
	position: {
		my: "center",
		at: "center top+200",
		of: window
	}
};
$.confirm.defaults = {
	position: {
		my: "center",
		at: "center top+200",
		of: window
	}
};
// noDefinePart
} ) );