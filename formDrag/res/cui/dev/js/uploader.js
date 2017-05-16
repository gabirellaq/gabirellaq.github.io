( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./swfuploader",
			"./uploadify"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/**
 *	Coral 4.0: uploader
 *
 *	Depends:
 *		jquery.coral.core.js
 *		jquery.coral.component.js
 *
 */
$.component ( "coral.uploader", {
	version: $.coral.version,
	castProperties : ["dataCustom", "formData", "overrideEvents", "buttons", "itemTemplate"],
	options: {				
		// Required Settings
		id: "", 														 	// The ID of the DOM object
		swf: $.coral.scriptPath+'external/swfupload.swf',  // The path to the uploadify SWF file
		uploader : "",  										  	// The path to the server-side upload script			
		// Options
		auto: true,               								    // Automatically upload files when added to the queue
		buttonClass: "",                 						// A class name to add to the browse button DOM object
		buttonCursor: "hand",         				    // The cursor to use with the browse button
		buttonImage: null,                              	// (String or null) The path to an image to use for the Flash browse button if not using CSS to style the button
		buttonText: "SELECT FILES",          	// The text to use for the browse button
		checkExisting: false,                           	// The path to a server-side script that checks for existing files on the server
		debug: false,                                        		//Turn on swfUpload debugging mode
		fileObjName: "Filedata",                     	// The name of the file object to use in your server-side script
		fileSizeLimit: 0,                                    		// The maximum size of an uploadable file in KB (Accepts units B KB MB GB if string, 0 for no limit)
		fileTypeDesc: "All Files",                    		// The description for file types in the browse dialog
		fileTypeExts: "*.*",              		       		// Allowed extensions in the browse dialog (server-side validation should also be used)
		heigh: 30,                                             		// The height of the browse button
		itemTemplate: false,                        		// The template for the file item in the queue
		method: "post",                                  		// The method to use when sending files to the server-side upload script
		multi: true,                                        		// Allow multiple file selection in the browse dialog
		formData: {},                                      		// An object with additional data to send to the server-side upload script with every file upload
		preventCaching: true,                     		// Adds a random value to the Flash URL to prevent caching of it (conflicts with existing parameters)
		progressData: "percentage",           		// ('percentage' or 'speed') Data to show in the queue item during a file upload
		queueID: false,                                 		// The ID of the DOM object to use as a file queue (without the #)
		queueSizeLimit: 999,                        		// The maximum number of files that can be in the queue at one time
		removeCompleted: true,                		// Remove queue items from the queue when they are done uploading
		removeTimeout: 3,                           		// The delay in seconds before removing a queue item if removeCompleted is set to true
		requeueError: false,                       		// Keep errored files in the queue and keep trying to upload them
		successTimeout: 30,                        		// The number of seconds to wait for Flash to detect the server's response after the file has finished uploading
		uploadLimit: 0,                                 		// The maximum number of files you can upload
		width: 120,                                        		// The width of the browse button	
		cls: "",
		displayStyle: "original", // original(原生的样式),custom(定制的带输入框的样式),
		emptyText: "请选择...",
		delay: 1000, //延迟dialog消失的时间
		buttons: null, //[{label: "上传",id: "uploader_btn_upload",click: function (e, ui) {} },{...}],"上传 upload,清空 clear" custom 模式下显示的buttons
		
		// Events
		overrideEvents  : [],             // (Array) A list of default event handlers to skip			
		onCancel: null, 					// Triggered when a file is cancelled from the queue
		onClearQueue : null,  			// Triggered during the 'clear queue' method
		onDestroy: null, 					// Triggered when the uploadify object is destroyed
		onDialogClose: null, 			// Triggered when the browse dialog is closed
		onDialogOpen: null, 			// Triggered when the browse dialog is opened
		onDisable: null, 					// Triggered when the browse button gets disabled
		onEnable: null, 					// Triggered when the browse button gets enabled
		onFallback: null, 					// Triggered is Flash is not detected
		onNoflash: null,
		onInit: null, 							// Triggered when Uploadify is initialized
		onQueueComplete: null, 	// Triggered when all files in the queue have been uploaded
		onSelectError: null, 		// Triggered when an error occurs while selecting a file (file size, queue size limit, etc.)
		onSelect: null, 			// Triggered for each file that is selected
		onNoFlash: null,			// Triggered for computer is Flash
		onSWFReady: null, 			// Triggered when the SWF button is loaded
		onUploadComplete: null, 	// Triggered when a file upload completes (success or error)
		onUploadError: null, 			// Triggered when a file upload returns an error
		onUploadSuccess: null, 		// Triggered when a file is uploaded successfully
		onUploadProgress: null, 	// Triggered every time a file progress is updated
		onUploadStart: null			// Triggered immediately before a file upload starts
	},
	_create: function() {
		var that = this;		
		that._initElement();
		//that._flashCheck();
		var isFlash = that._flashCheck();
		if(isFlash == false){
			that._trigger( "onNoFlash", null, [] );
		}
	},
	_initElement: function () {
		var that = this,
			opts = that.options,
			events = {};	

		// Initialize structure
		if(typeof that.element.attr("id") != "undefined") {
    		opts.id = that.element.attr("id");
    	} else if (opts.id){
    		that.element.attr("id", opts.id);
    	}		
		if(typeof that.element.attr("name") != "undefined") {
    		opts.name = that.element.attr("name");
    	} else if (opts.name) {
    		that.element.attr("name", opts.name);
    	}
		
		delete opts.id;			
		events = that.getEventsObj();
		
		opts = $.extend({}, opts, events);
		this._initUploder(opts);
		opts.id = that.element.attr("id");
	},
	//检测电脑（IE8）下是否安装了flash
/*	_flashCheck: function(){
		var hasFlash = true;
		try {
			if (document.all) {
				var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if(!swf){
					hasFlash = false;
				}
			} else {
				var swf = navigator.plugins["Shockwave Flash"];
				if(!swf){
					hasFlash = false;
				}
			}
			return hasFlash;
		} catch (e){
			
			return hasFlash;
		}
	},*/
	_flashCheck: function(){
		var isIE = !-[1,];
		var hasFlash = true;
		if(isIE){
		    try{
		        var swf1 = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
		        hasFlash = true;
		    }
		    catch(e){
		        hasFlash = false;
		    }
		}
		else {
		    try{
		    	if(navigator.plugins && navigator.plugins.length > 0){
		    		var swf2 = navigator.plugins['Shockwave Flash'];
		    		if(swf2 == undefined){
		    			hasFlash = false;
		    		}
		    	}
		        else {
		        	hasFlash = true;
		        }
		    }
		    catch(e){
		    	hasFlash = false;
		    }
		}
		return hasFlash;
	},
	// methods
	component: function () {
		return this.uiUploader;
	},
	destroy: function () {
		this.uploader.uploadify( "destroy" );
	},
	disable: function (isDisabled) {
		this.uploader.uploadify( "disable", isDisabled );
	},
	settings: function (name, value, resetObjects) {
		this.uploader.uploadify( "settings", name, value, resetObjects);
	},
	stop: function () {
		this.uploader.uploadify( "stop" );
	},
	upload: function(option) {
		if ("original" == this.options.displayStyle || !this._isQueueDialog()) {
			this.uploader.uploadify("upload", option);
			return ;
		}
		
		if (this.select.length == 0) return;
		
		var that = this,
			id = this.element.attr("id");
		
		$("#" + id + "_queue").dialog("open");
	},
    getvalue: function(){
    	if (this.select.length == 0) alert( "none file");
    	return this.select.join(",");
    },
	cancel: function() {
		this.uploader.uploadify("cancel");
	},
	clear: function(option) {
		if ("custom" == this.options.displayStyle) {
			this.select = [];
			this.uiUploader.find(".coral-file").html("请选择...");
			this.uiUploader.find("object").attr("title","请选择...");
		}
		
		this.uploader.uploadify("cancel");
		this.clearQueue();
	},
	/**
	 * 清除队列文件
	**/
	clearQueue: function() {
		this.uploader.clearQueue() ;
	},
	uploadify: function () {
		return this.uploader ;
	},
	/**
		获取队列文件数据
	**/
	queueData: function() {
		return this.uploader.data("uploadify").queueData ;
	},
	/**
	 * 获取buttons数据结构
	 * @returns
	 */
	_getButtons: function () {
		if (typeof this.options.buttons === "object") return this.options.buttons;
		if (typeof this.options.buttons !== "string") return [];

		var that = this,
			opts = this.options,
			buttons = this.options.buttons,
			buttonsArr = [];
		
		var tempArr = $.trim( buttons ).split( "," );
		for ( var i in tempArr ) {
			var buttonItem = {},
				itemArr = tempArr[i].split(" ");				
			
			buttonItem.label = itemArr[0];
			buttonItem.click = itemArr[1];
			
			buttonsArr.push( buttonItem );
		}
			
		return buttonsArr;
	},
	/**
	 * callback click handler
	 */
	_triggerClick: function ( handler, event, data ) {
		var that = this;
		
		var _fn = $.coral.toFunction(handler);
		event = $.Event( event );
		
		return _fn.apply( that.element[0], [ event ].concat( data )); 
	},
	/**
	 * create buttons when the displayStyle is custom
	 */
	_createButtons: function() {
		var that = this,
			opts = this.options,
			buttons = this._getButtons();
		
		var $icons = $("<span class=\"coral-uploader-btn-icons coral-corner-right\"></span>");
		that.uiBorder.append( $icons );

		$.each ( buttons, function ( index, item ) {
			var label = item.label,
				id = item.id,
				handler = item.click,
				callbackData = {},
				$icon = $("<span class=\"coral-uploader-btn-ico icon coral-uploader-btn-textico\"></span>");
			
			if (label) {
				$icon.html(label);
				callbackData["label"] = label;
			}
			if (id) {
				$icon.attr("data-id", id);
				callbackData["id"] = id;
			}
			$icon.bind("click" + that.eventNamespace, function (e) {
				if ( that.options.disabled ) return;
				
				that._triggerClick( handler, e , callbackData );
			});				
			$icons.append($icon);
		});
	},
	/**
	 * initialize uploader
	 */
	_initUploder: function(options) {
		var that = this,
			id = that.element.attr("id");
		
		that.uiUploader = $( "<span class=\"coral-uploader\"></span>" );	
		that.uiBorder =  $( "<span class=\"coral-uploader-border coral-corner-all\"></span>" );
		that.uploader = $("<div id=\""+ id +"_uploader\"></div>");
		that.element.after( that.uiUploader );
		that.uiUploader.append(that.uiBorder);
		that.uiBorder.append(that.element);
		that.element.hide();
		
		if (options.displayStyle == "original") {	
			that.element.before( that.uploader );
			this.uploader.uploadify( options );
			return ;
		}
		
		this.uiUploader.addClass("coral-uploader-custom coral-textbox");
		this.uiBorder.addClass("coral-textbox-border");
		if (options.buttons) {
			this._createButtons();
		}
		that.select = [];			
		$(this.element).wrap("<span class=\"coral-file-default\"></span>")
			.before("<span class='coral-file'>" + options.emptyText + "</span>")
			.before( that.uploader );
		
		var opts = $.extend(options, {
			height: 28,
			width: 800
		});
		if (!opts.queueID) {
			$(this.element).before("<div id='" + id + "_queue'></div>");
			$("#" + id + "_queue").dialog({
				autoOpen: false,
				title: "上传",
				modal: false,
				resizable: false,
				onOpen: function () {
					that.uploader.uploadify("upload","*");
				}
			});
			options.queueID = id+"_queue";
			this.hasDialog = true; // 说明进度条在dialog中显示
		}
		that.uploader.uploadify(opts);			
	},	
	_isQueueDialog: function() {
		return this.hasDialog;
	},
	_reloadUploader: function() {
		var that = this,
			opts = this.options;
		
		delete opts.id;
		that.uploader.uploadify( opts );
		opts.id = that.element.attr("id");
	},
	getEventsObj: function () {		
		var that = this,
			opts = this.options,
			id = this.element.attr("id");
		
		return {
			onCancel: function (file) {
				that._trigger( "onCancel", null, [{file:file}] );
			},
			onClearQueue: function (queueItemCount) {
				that._trigger( "onClearQueue", null, [{queueItemCount:queueItemCount}] );
			},
			onDestroy: function() {
				that._trigger( "onDestroy", null, [] );
			},
			onDialogClose: function(queueData) {
				if ("custom" == opts.displayStyle && opts.auto && that._isQueueDialog()) {
					$("#" + id + "_queue").dialog("open");
				}
				that._trigger( "onDialogClose", null, [{queueData:queueData}] );
			},
			onDialogOpen: function() {
				if ("custom" == opts.displayStyle) {
	//				that.select = [];
				}
				that._trigger( "onDialogOpen", null, [] );
			},
			onDisable: function() {
				that._trigger( "onDisable", null, [] );
			},
			onEnable: function() {
				that._trigger( "onEnable", null, [] );
			},
			onFallback : function() {
				that._trigger( "onFallback ", null, [] );
			},
			onNoflash : function() {
				return that.uiBorder;
			},
			onInit: function(swfuploadify) {
				that._trigger( "onInit", null, [{swfuploadify:swfuploadify}] );
			},
			onQueueComplete: function(queueData) {
				var id = that.element.attr("id");
				
				if ( "custom" == opts.displayStyle && that._isQueueDialog())  {
					setTimeout(function() {
		        		$("#" + id + "_queue").dialog("close");
		        		that.select = [];
		        	}, opts.delay);
				}
				that._trigger( "onQueueComplete", null, [{queueData:queueData}] );
			},
			onSelectError: function(file, errorCode, errorMsg) {
				that._trigger( "onSelectError", null, [{arguments:arguments}] );
			},
			onSelect: function(file) {
				if ( "custom" == opts.displayStyle )  {
					that.select.push(file.name);
		        	that.uiUploader.find(".coral-file").html(that.select.join(","));
		        	that.uiUploader.find("object").attr("title",that.select.join(","));
				}

				that._trigger( "onSelect", null, [{file:file}] );
			},
			onSWFReady: function() {
				that._trigger( "onSWFReady", null, [] );
			},
			onUploadComplete: function(file) {
				that._trigger( "onUploadComplete", null, [{file:file}] );
			},
			onUploadError: function(file, errorCode, errorMsg, errorString) {
				that._trigger( "onUploadError", null, [{file:file, errorCode:errorCode, errorMsg:errorMsg, errorString:errorString}] );
			},
			onUploadSuccess: function (file, data, response) {
				that._trigger( "onUploadSuccess", null, [{file:file, data:data, response:response}] );
			},
			onUploadProgress: function(file, fileBytesLoaded, fileTotalBytes, queueBytesLoaded, uploadSize) {
				that._trigger( "onUploadProgress", null, [{file:file, fileBytesLoaded:fileBytesLoaded, fileTotalBytes:fileTotalBytes, queueBytesLoaded:queueBytesLoaded, uploadSize:uploadSize}] );
			},
			onUploadStart: function(file) {
				that._trigger( "onUploadStart", null, [{file:file}] );
			}				
		};
	},	
	_setOption: function ( key, value ) {
		var that = this;
		
		if  ( key === "id" || key === "name" ) {
			return ;
		}
		
		this._super( key, value );
		
		if (key === "emptyText") {
			this.uiUploader.find(".coral-file").html(value);
			return;
		}
		
		that.settings( key, value);
	},
	_destroy: function() {
		var that = this;
		
		that.uiUploader.replaceWith( that.element );
	}
});
// noDefinePart
} ) );