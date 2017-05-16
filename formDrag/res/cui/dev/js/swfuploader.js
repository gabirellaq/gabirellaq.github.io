( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./swfobject",
			"./swfupload"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

$.component("coral.swfuploader", {
	options: {
		swfUploadOptions: null,
		swf      : 'external/swfupload.swf',  // The path to the swfuploader SWF file
		uploader : 'swfupload.php',  // The path to the server-side upload script
		
		// Options
		auto            : true,               // Automatically upload files when added to the queue
		buttonClass     : '',                 // A class name to add to the browse button DOM object
		buttonCursor    : 'hand',             // The cursor to use with the browse button
		buttonImage     : null,               // (String or null) The path to an image to use for the Flash browse button if not using CSS to style the button
		buttonText      : 'SELECT FILES',     // The text to use for the browse button
		checkExisting   : false,              // The path to a server-side script that checks for existing files on the server
		debug           : false,              // Turn on swfUpload debugging mode
		fileObjName     : 'Filedata',         // The name of the file object to use in your server-side script
		maxFileSize   : 0,                  // The maximum size of an uploadable file in KB (Accepts units B KB MB GB if string, 0 for no limit)
		fileTypeDesc    : 'All Files',        // The description for file types in the browse dialog
		fileTypeExts    : '*.*',              // Allowed extensions in the browse dialog (server-side validation should also be used)
		uploadTemplate  : false,              // The template for the file item in the queue
		method          : 'post',             // The method to use when sending files to the server-side upload script
		multiple           : true,               // Allow multiple file selection in the browse dialog
		formData        : {},                 // An object with additional data to send to the server-side upload script with every file upload
		preventCaching  : true,               // Adds a random value to the Flash URL to prevent caching of it (conflicts with existing parameters)
		uploadedFileList: [],
		separator       : ",",
		progressData    : 'speed',       // ('percentage' or 'speed') Data to show in the queue item during a file upload
		queueID         : false,              // The ID of the DOM object to use as a file queue (without the #)
		queueSizeLimit  : 999,                // The maximum number of files that can be in the queue at one time
		removeCompleted : true,               // Remove queue items from the queue when they are done uploading
		removeTimeout   : 3,                  // The delay in seconds before removing a queue item if removeCompleted is set to true
		requeueErrors   : false,              // Keep errored files in the queue and keep trying to upload them
		successTimeout  : 30,                 // The number of seconds to wait for Flash to detect the server's response after the file has finished uploading
		uploadLimit     : 999,                  // The maximum number of files you can upload
		
		// Events
		overrideEvents  : []             // (Array) A list of default event handlers to skip
		/*
		onCancel         // Triggered when a file is cancelled from the queue
		onClearQueue     // Triggered during the 'clear queue' method
		onDestroy        // Triggered when the swfuploader object is destroyed
		onDialogClose    // Triggered when the browse dialog is closed
		onDialogOpen     // Triggered when the browse dialog is opened
		onDisable        // Triggered when the browse button gets disabled
		onEnable         // Triggered when the browse button gets enabled
		onFallback       // Triggered is Flash is not detected    
		onInit           // Triggered when swfuploader is initialized
		onQueueComplete  // Triggered when all files in the queue have been uploaded
		onSelectError    // Triggered when an error occurs while selecting a file (file size, queue size limit, etc.)
		onSelect         // Triggered for each file that is selected
		onSWFReady       // Triggered when the SWF button is loaded
		onComplete // Triggered when a file upload completes (success or error)
		onError    // Triggered when a file upload returns an error
		onSuccess  // Triggered when a file is uploaded successfully
		onProgress // Triggered every time a file progress is updated
		onStart    // Triggered immediately before a file upload starts
		*/
	},
	_create: function() {
		// Create a reference to the jQuery DOM object
		// Clone the original DOM object
		var that = this,
			$clone = this.element.clone(),
			opts = this.options;

		// Setup the default options
		this.options.id = this.element.attr('id'); // The ID of the DOM object
		var $wrapper = $('<div />', {
			'id': opts.id + "_wrappper",
			'class': 'swfuploader',
			'css': {
				'height': opts.height + 'px',
				'width': opts.width + 'px'
			}
		});
		this.element.append($wrapper);
		// Prepare options for SWFUpload
		var swfUploadSettings = {
			assume_success_timeout   : opts.successTimeout,
			button_placeholder_id    : $wrapper[0].id,
			button_width             : opts.width,
			button_height            : opts.height,
			button_text              : null,
			button_text_style        : null,
			button_text_top_padding  : 0,
			button_text_left_padding : 0,
			button_action            : (opts.multiple ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE),
			button_disabled          : false,
			button_cursor            : (opts.buttonCursor == 'arrow' ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND),
			button_window_mode       : SWFUpload.WINDOW_MODE.TRANSPARENT,
			debug                    : opts.debug,						
			requeue_on_error         : opts.requeueErrors,
			file_post_name           : opts.fileObjName,
			file_size_limit          : opts.maxFileSize,
			file_types               : opts.fileTypeExts,
			file_types_description   : opts.fileTypeDesc,
			file_queue_limit         : opts.queueSizeLimit,
			file_upload_limit        : opts.uploadLimit,
			flash_url                : opts.swf,					
			prevent_swf_caching      : opts.preventCaching,
			post_params              : opts.formData,
			upload_url               : opts.uploader,
			delete_url               : opts.deleteUrl,
			use_query_string         : (opts.method == 'get'),
			
			// Event Handlers 
			swfupload_loaded_handler: opts.onSWFReady,
			file_dialog_complete_handler: this.onDialogClose,
			file_dialog_start_handler: this.onDialogOpen,
			file_queued_handler: function(file){
				that.onSelect.apply(that, [this,file]);
			},
			file_queue_error_handler: function(file, errorCode, errorMsg){
				that.onSelectError.apply(that, [this, file, errorCode, errorMsg]);
			},
			upload_complete_handler: function(file){
				that.onUploadComplete.apply(that, [this,file]);
			},
			upload_error_handler: function(file,errorCode,errorMsg){
				that.onUploadError.apply(that, [this, file, errorCode, errorMsg]);
			},
			upload_progress_handler: function(file, fileBytesLoaded, fileTotalBytes){
				that.onUploadProgress.apply(that, [this, file, fileBytesLoaded, fileTotalBytes]);
			},
			upload_start_handler: function(file){
				that.onUploadStart.apply(that, [this,file]);
			},
			upload_remove_handler: function(file){
				that.onRemove.apply(that, [this,file]);
			},
			upload_success_handler: function(file, data, response){
				that.onUploadSuccess.apply(that, [this, file, data, response]);
			}
		}

		// Merge the user-defined options with the defaults
		if (opts.swfUploadOptions) {
			swfUploadSettings = $.extend(swfUploadSettings, opts.swfUploadOptions);
		}
		// Add the user-defined settings to the swfupload object
		swfUploadSettings = $.extend(swfUploadSettings, opts);
		
		// Detect if Flash is available
		var playerVersion  = swfobject.getFlashPlayerVersion();
		var flashInstalled = (playerVersion.major >= 9);

		if (flashInstalled) {
			// Create the swfUpload instance
			window['swfuploader_' + opts.id] = new SWFUpload(swfUploadSettings);
			var swfuploaderObj = window['swfuploader_' + opts.id];

			// Add the SWFUpload object to the elements data object
			this.element.data('swfuploader', swfuploaderObj);
			// Wrap the instance
			
			$('#' + swfuploaderObj.movieName).wrap($wrapper);
			// Recreate the reference to wrapper
			$wrapper = $('#' + opts.id);
			// Add the data object to the wrapper 
			$wrapper.data('swfuploader', swfuploaderObj);

			/*// Create the button
			var $button = $('<div />', {
				'id'    : opts.id + '-button',
				'class' : 'swfuploader-button ' + opts.buttonClass
			});
			if (opts.buttonImage) {
				$button.css({
					'background-image' : "url('" + opts.buttonImage + "')",
					'text-indent'      : '-9999px'
				});
			}
			$button.html('<span class="swfuploader-button-text">' + opts.buttonText + '</span>')
			.css({
				'height'      : opts.height + 'px',
				'line-height' : opts.height + 'px',
				'width'       : opts.width + 'px'
			});
			// Append the button to the wrapper
			$wrapper.append($button);*/

			// Adjust the styles of the movie
			$('#' + swfuploaderObj.movieName).css({
				'position' : 'absolute',
				'z-index'  : 1
			});
			
			// Create the file queue
			if (!opts.queueID) {
				var $queue = $('<div />', {
					'id'    : opts.id + '-queue',
					'class' : 'swfuploader-queue'
				});
				$wrapper.after($queue);
				swfuploaderObj.settings.queueID      = opts.id + '-queue';
				swfuploaderObj.settings.defaultQueue = true;
			}
			
			// Create some queue related objects and variables
			swfuploaderObj.queueData = {
				files              : {}, // The files in the queue
				filesSelected      : 0, // The number of files selected in the last select operation
				filesQueued        : 0, // The number of files added to the queue in the last select operation
				filesReplaced      : 0, // The number of files replaced in the last select operation
				filesCancelled     : 0, // The number of files that were cancelled instead of replaced
				filesErrored       : 0, // The number of files that caused error in the last select operation
				uploadsSuccessful  : 0, // The number of files that were successfully uploaded
				uploadsErrored     : 0, // The number of files that returned errors during upload
				averageSpeed       : 0, // The average speed of the uploads in KB
				queueLength        : 0, // The number of files in the queue
				queueSize          : 0, // The size in bytes of the entire queue
				uploadSize         : 0, // The size in bytes of the upload queue
				queueBytesUploaded : 0, // The size in bytes that have been uploaded for the current upload queue
				uploadQueue        : [], // The files currently to be uploaded
				errorMsg           : 'Some files were not added to the queue:'
			};

			// Save references to all the objects
			swfuploaderObj.original = $clone;
			swfuploaderObj.wrapper  = $wrapper;
			//swfuploaderObj.button   = $button;
			swfuploaderObj.queue    = $queue;

			// Call the user-defined init event handler
			if (opts.onInit) opts.onInit.call(this.element, swfuploaderObj);

		} else {
			// Call the fallback function
			var uiBorder = opts.onNoflash.call(this.element);
			var warp = $("<div class='coral-uploader-button' style='height: 40px;'></div>").appendTo(uiBorder);
			var button = $("<input type='button'/>").appendTo(warp);
			button.button({
				id : opts.id + '-button',
				label : opts.buttonText,
				onClick : function() {
					alert("没有安装flash或flash版本过低");
				}
			})
			
		}
	},
	addUploadCount: function(){
		var swfuploaderObj = this.element.data('swfuploader');
		swfuploaderObj.addUploadCount();
	},
	reduece: function(fileID){
		var swfuploaderObj = this.element.data('swfuploader'),
			settings = swfuploaderObj.settings;
		if ($('#' + fileID).hasClass("template-download")) {
			swfuploaderObj.reduceUploadCount();
			uploadList = settings.uploadedFileList;
            var values = this.getValues();
            uploadList.splice($.inArray(fileID,values),1); 
		} else if ($('#' + fileID).hasClass("template-upload")) {
			downList = settings.unUploadedFileList;
            var values = this.getUnUploadValues();
            downList.splice($.inArray(fileID,values),1); 
		}
	},
	setValues: function(values) {
		var swfuploaderObj = this.element.data('swfuploader'),
			settings = swfuploaderObj.settings;
		settings.uploadedFileList = values;
	},
	// Stop a file upload and remove it from the queue 
	cancel: function(fileID, supressEvent) {
		var args = arguments,uploadList,downList,
			that = this;
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader'),
			settings = swfuploaderObj.settings,
			delay = -1;
		if(!settings.disabled){
			if (typeof fileID === "array" || typeof fileID === "undefined") {
				// Clear the queue
				if (typeof fileID === "undefined") {
					var queueItemCount = swfuploaderObj.queueData.queueLength;
					$('#' + settings.queueID).children().each(function() {
						delay++;
						if (args[1] === true) {
							swfuploaderObj.cancelUpload(this.id, false);
						} else {
							swfuploaderObj.cancelUpload(this.id);
						}
						$(this).find('.data').removeClass('data');
						var values = that.getValues();
						if($.inArray(this.id,values) != -1){
							var item = $('#' + this.id),
								$item = $(item);
							if($item.data().url && $item.data().url != "undefined"){
								var data = {};
								for(var j = 0; j< settings.uploadedFileList.length; j++){
			                		if(this.id == settings.uploadedFileList[j].fileId){
			                			data.data = settings.uploadedFileList[j];
			                		}
			                	}
								data.dataType = settings.dataType || "json";
								data.url = settings.uploadedFileList[0].fileUrl;
								$.ajax(data).done(function(){
									$item.delay(1000).fadeOut(500, function() {
										$(this).remove();
									});
								})
								that._trigger("onRemove", null,{"fileId":this.id});
							} else {
								$item.delay(1000 + 100 * delay).fadeOut(500, function() {
									$(this).remove();
								});
								that._trigger("onRemove", null,{"fileId":this.id});
							}
							delete swfuploaderObj.queueData.files[this.id];// #CORALIV-727
							that.reduece(this.id);
						}
					});
					swfuploaderObj.queueData.queueSize   = 0;
					swfuploaderObj.queueData.queueLength = 0;
					if (settings.onClearQueue) settings.onClearQueue.call(this.element, queueItemCount);
				} else {
					for (var n = 0; n < args.length; n++) {
						swfuploaderObj.cancelUpload(args[n]);
						$('#' + args[n]).find('.data').removeClass('data');
						//$('#' + args[n]).find('.progress').remove();
						$('#' + args[n]).delay(1000 + 100 * n).fadeOut(500, function() {
							$(this).remove();
						});
						this._trigger("onRemove", null);
						delete swfuploaderObj.queueData.files[args[n]];// #CORALIV-727
						that.reduece(args[n]);
					}
				}
			} else {
				var item = $('#' + fileID);
				$item = $(item);
				swfuploaderObj.cancelUpload($item.attr('id'));
				$item.find('.data').removeClass('data');
				//$item.find('.progress').remove();
				if($item.data().url && $item.data().url != "undefined"){
					var data = {};
					for(var j = 0; j< settings.uploadedFileList.length; j++){
                		if(fileID == settings.uploadedFileList[j].fileId){
                			data.data = settings.uploadedFileList[j];
                		}
                	}
					data.dataType = settings.dataType || "json";
					data.url = $item.data().url;
					$.ajax(data).done(function(){
						$item.delay(1000).fadeOut(500, function() {
							$(this).remove();
						});
					})
				} else {
					$item.delay(1000).fadeOut(500, function() {
						$(this).remove();
					});
				}
				this._trigger("onRemove", null);
				delete swfuploaderObj.queueData.files[fileID];// #CORALIV-727
				if ($('#' + fileID).hasClass("template-download")) {
					swfuploaderObj.reduceUploadCount();
					uploadList = settings.uploadedFileList;
	                var values = this.getValues();
	                uploadList.splice($.inArray(fileID,values),1); 
				} else if ($('#' + fileID).hasClass("template-upload")) {
					downList = settings.unUploadedFileList;
	                var values = this.getUnUploadValues();
	                downList.splice($.inArray(fileID,values),1); 
				}
			}
		}
	},
	// Revert the DOM object back to its original state
	_destroy: function() {
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader'),
			settings     = swfuploaderObj.settings;

		// Destroy the SWF object and 
		swfuploaderObj.destroy();
		this.element.find(".swfuploader").remove();
		// Destroy the queue
		if (settings.uploadedFileList) {
			$('#' + settings.queueID).remove();
		}
		// Reload the original DOM element
		//$('#' + settings.id).replaceWith(swfuploaderObj.original);
		$('#' + settings.id).replaceWith(this.element);
		// Call the user-defined event handler
		if (settings.onDestroy) settings.onDestroy.call(this);

		delete swfuploaderObj;
	},
	// Disable the select button
	disable: function(isDisabled) {
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader'),
			settings     = swfuploaderObj.settings;
		// Call the user-defined event handlers
		if (isDisabled) {
			//swfuploaderObj.button.addClass('disabled');
			$("#" + this.options.queueID).addClass('coral-state-disabled');
			settings.disabled = true;
			//if (settings.onDisable) settings.onDisable.call(this);
			this._trigger("onDisable", null, []);
		} else {
			//swfuploaderObj.button.removeClass('disabled');
			$("#" + this.options.queueID).removeClass('coral-state-disabled');
			settings.disabled = false;
			//if (settings.onEnable) settings.onEnable.call(this);
			this._trigger("onEnable", null, []);
		}
		// Enable/disable the browse button
		swfuploaderObj.setButtonDisabled(isDisabled);
	},
	getQueueData: function(){
    	var valArr1 = [],valArr2 = [];
    	var swfuploaderObj = this.element.data('swfuploader'),
		settings = swfuploaderObj.settings;
    	for(var i = 0; i < settings.uploadedFileList.length; i++){
    		valArr1.push(settings.uploadedFileList[i].fileId);
    	}
    	for(var i = 0; i < settings.unUploadedFileList.length; i++){
    		valArr2.push(settings.unUploadedFileList[i].fileId);
    	}
    	return $.merge(valArr1,valArr2);
    },
	getUnUploadValues: function(){
    	var fileArray = [];
    	var swfuploaderObj = this.element.data('swfuploader'),
			settings = swfuploaderObj.settings;
    	for(var i = 0; i < settings.unUploadedFileList.length; i++){
    		fileArray.push(settings.unUploadedFileList[i].fileId);
    	}
    	return fileArray;
    },
    getValues: function(){
    	var valArr = [];
		var swfuploaderObj = this.element.data('swfuploader'),
			settings = swfuploaderObj.settings;
		for (var i = 0; i < settings.uploadedFileList.length; i++) {
			valArr.push(settings.uploadedFileList[i].fileId);
		}
		return valArr;
    },
	getValue: function(){
		var swfuploaderObj = this.element.data('swfuploader'),
		settings = swfuploaderObj.settings;
    	return this.getValues().join( settings.separator );
    },
    getValidateValue: function(){
    	return this.getValue();
    },
    // Get or set the settings data
    _setOption: function(key, value, resetObjects) {
		var args = arguments;
		var returnValue = value;
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader'),
			settings     = swfuploaderObj.settings;
		this._super( key, value );
		switch (key) {
			case 'uploader':
				swfuploaderObj.setUploadURL(value);
				break;
			case 'formData':
				if (!resetObjects) {
					value = $.extend(settings.formData, value);
				}
				swfuploaderObj.setPostParams(settings.formData);
				break;
			case 'method':
				if (value == 'get') {
					swfuploaderObj.setUseQueryString(true);
				} else {
					swfuploaderObj.setUseQueryString(false);
				}
				break;
			case 'fileObjName':
				swfuploaderObj.setFilePostName(value);
				break;
			case 'fileTypeExts':
				swfuploaderObj.setFileTypes(value, settings.fileTypeDesc);
				break;
			case 'fileTypeDesc':
				swfuploaderObj.setFileTypes(settings.fileTypeExts, value);
				break;
			case 'maxFileSize':
				swfuploaderObj.setFileSizeLimit(value);
				break;
			case 'uploadLimit':
				swfuploaderObj.setFileUploadLimit(value);
				break;
			case 'queueSizeLimit':
				swfuploaderObj.setFileQueueLimit(value);
				break;
			/*case 'buttonImage':
				swfuploaderObj.button.css('background-image', settingValue);
				break;*/
			case 'buttonCursor':
				if (value == 'arrow') {
					swfuploaderObj.setButtonCursor(SWFUpload.CURSOR.ARROW);
				} else {
					swfuploaderObj.setButtonCursor(SWFUpload.CURSOR.HAND);
				}
				break;
			case 'buttonText':
				$('#' + this.options.id + '-button').find('.swfuploader-button-text').html(value);
				break;
			case 'width':
				swfuploaderObj.setButtonDimensions(value, settings.height);
				break;
			case 'height':
				swfuploaderObj.setButtonDimensions(settings.width, value);
				break;
			case 'multiple':
				if (value) {
					swfuploaderObj.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES);
				} else {
					swfuploaderObj.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);
				}
				break;
		}
	},
	// Stop the current uploads and requeue what is in progress
	stop: function() {
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader');

		// Reset the queue information
		swfuploaderObj.queueData.averageSpeed  = 0;
		swfuploaderObj.queueData.uploadSize    = 0;
		swfuploaderObj.queueData.bytesUploaded = 0;
		swfuploaderObj.queueData.uploadQueue   = [];

		swfuploaderObj.stopUpload();
		this._trigger("onStop", null, []);
	},

	// Start uploading files in the queue
	upload: function(fileId) {
		var args = arguments,n;
		// Create a reference to the jQuery DOM object
		var swfuploaderObj = this.element.data('swfuploader'),
			settings     = swfuploaderObj.settings;
		// Reset the queue information
		swfuploaderObj.queueData.averageSpeed  = 0;
		swfuploaderObj.queueData.uploadSize    = 0;
		swfuploaderObj.queueData.bytesUploaded = 0;
		swfuploaderObj.queueData.uploadQueue   = [];
		if(!settings.disabled){
			// Upload the files
			if (args[0] || typeof fileId === "undefined") {
				if (typeof fileId === "undefined") {
					swfuploaderObj.queueData.uploadSize = swfuploaderObj.queueData.queueSize;
					var arr = settings.unUploadedFileList;
					/*for (key in swfuploaderObj.queueData.files) {
						var obj = swfuploaderObj.queueData.files[key];
						if (!obj.error) {
							swfuploaderObj.queueData.uploadQueue.push(obj.id);
							swfuploaderObj.startUpload(swfuploaderObj.queueData.uploadQueue.shift());
						} else {
							swfuploaderObj.queueData.uploadQueue.shift();
						}
					}*/
					swfuploaderObj.queueData.uploadQueue.push('*');
					swfuploaderObj.startUpload();
				} else {
					for (n = 0; n < args.length; n++) {
						//swfuploaderObj.queueData.uploadSize += swfuploaderObj.queueData.files[args[n]].size;
						swfuploaderObj.queueData.uploadQueue.push(args[n]);
					}
					swfuploaderObj.startUpload(swfuploaderObj.queueData.uploadQueue.shift());
				}
			} else {
				swfuploaderObj.startUpload();
			}
		}
	},
	// Triggered when the file dialog is opened
	onDialogOpen: function() {
		// Load the swfupload settings
		var settings = this.settings;

		// Reset some queue info
		this.queueData.errorMsg       = 'Some files were not added to the queue:';
		this.queueData.filesReplaced  = 0;
		this.queueData.filesCancelled = 0;

		// Call the user-defined event handler
		if (settings.onDialogOpen) settings.onDialogOpen.call(this);
	},

	// Triggered when the browse dialog is closed
	onDialogClose:  function(filesSelected, filesQueued, queueLength) {
		// Load the swfupload settings
		var settings = this.settings;

		// Update the queue information
		this.queueData.filesErrored  = filesSelected - filesQueued;
		this.queueData.filesSelected = filesSelected;
		this.queueData.filesQueued   = filesQueued - this.queueData.filesCancelled;
		this.queueData.queueLength   = queueLength;

		// Run the default event handler
		if ($.inArray('onDialogClose', settings.overrideEvents) < 0) {
			if (this.queueData.filesErrored > 0) {
				//alert(this.queueData.errorMsg);
			}
		}

		// Call the user-defined event handler
		if (settings.onDialogClose) settings.onDialogClose.call(this, this.queueData);

		// Upload the files if auto is true
		if (settings.auto) $('#' + settings.id).swfuploader('upload');
	},
	handerSWFEvent: function(){
		
	},
	validateFiles: function(swfObj, file){
		var settings = swfObj.settings;
		if(settings.acceptFileTypes &&
           !(settings.acceptFileTypes.test(file.type) ||
        		   settings.acceptFileTypes.test(file.name))){
			file.error = "The file is not an accepted file type.";
		} else if (file.size > settings.maxFileSize) {
			file.error = "The File is too large.";
		}
		return file.error;
	},
	// Triggered once for each file added to the queue
	onSelect: function(swfObj, file) {
		// Load the swfupload settings
		var settings = swfObj.settings,item,itemHTML;
		
		// Check if a file with the same name exists in the queue
		var queuedFile = {};
		/*for (var n in swfObj.queueData.files) {
			queuedFile = swfObj.queueData.files[n];
			if (queuedFile.uploaded != true && queuedFile.name == file.name) {
				var replaceQueueItem = confirm('The file named "' + file.name + '" is already in the queue.\nDo you want to replace the existing item in the queue?');
				if (!replaceQueueItem) {
					swfObj.cancelUpload(file.id);
					swfObj.queueData.filesCancelled++;
					return false;
				} else {
					$('#' + queuedFile.id).remove();// #CORALIV-727
					delete swfObj.queueData.files[n];
					swfObj.cancelUpload(queuedFile.id);
					swfObj.queueData.filesReplaced++;
				}
			}
		}*/
		// Get the size of the file
		var fileSize = Math.round(file.size / 1024);
		var suffix   = 'KB';
		if (fileSize > 1000) {
			fileSize = Math.round(fileSize / 1000);
			suffix   = 'MB';
		}
		var fileSizeParts = fileSize.toString().split('.');
		fileSize = fileSizeParts[0];
		if (fileSizeParts.length > 1) {
			fileSize += '.' + fileSizeParts[1].substr(0,2);
		}
		fileSize += suffix;
		
		// Truncate the filename if it's too long
		var fileName = file.name;
		if (fileName.length > 25) {
			fileName = fileName.substr(0,25) + '...';
		}
		/*var number = this.getQueueData();
		if(number.length >= settings.filesLimt){
			$.messageQueue( {
                message:"Maximum number of files exceeded:" + settings.filesLimt
            }); 
			return;
		}*/
		// Create the file data object
		itemData = {
			'fileID'     : file.id,
			'instanceID' : settings.id,
			'fileName'   : fileName,
			'fileSize'   : fileSize
		}
		// Run the default event handler
		if ($.inArray('onSelect', settings.overrideEvents) < 0) {
			// Replace the item data in the template
			//file.error = true;
			item = settings.uploadTemplate({
                files: [file],
                options: settings
            });
			for (var d in itemData) {
				item = item.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
			}
			// Add the file item to the queue
			item = $(settings.templatesContainer).html(item).children();
			item.addClass("template-upload fade");
			//item.find('.error').text(swfObj.queueData.errorMsg);
			$('#' + settings.queueID).append(item);
			//$('#' + settings.queueID).find('.progress').empty().progressbar();
        	this._trigger("onRenderUploadTmp", null, {"item":item});
		}
		//settings.unUploadedFileList.push(file.id);
		swfObj.queueData.queueSize += file.size;
		swfObj.queueData.files[file.id] = file;
		this._trigger("onSelect", null, [{"file": file}]);
	},

	// Triggered when a file is not added to the queue
	onSelectError : function(swfObj, file, errorCode, errorMsg) {
		// Load the swfupload settings
		var settings = swfObj.settings,itemData,item;
		
		// Run the default event handler
		if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
			switch(errorCode) {
				case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
					if (settings.queueSizeLimit > errorMsg) {
						alert('\nThe number of files selected exceeds the remaining upload limit');
					} else {
						//alert( '\nThe number of files selected exceeds the queue size limit');
						$.messageQueue( {
		                    message:settings.messages.maxNumberOfFiles
		                }); 
					}
					break;
				case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
					$.messageQueue( {
	                    message:settings.messages.maxFileSize
	                }); 
					break;
				case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
					swfObj.queueData.errorMsg = '\nThe file "' + file.name + '" is empty.';
					break;
				case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
					$.messageQueue( {
	                    message:settings.messages.acceptFileTypes
	                }); 
					break;
			}
		}
		if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
			delete swfObj.queueData.files[file.id];
			/*$.messageQueue( {
                message:"Maximum number of files exceeded:" + settings.filesLimt
            }); */
		}
		/*if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
			file.error = true;
			// Replace the item data in the template
			item = settings.uploadTemplate({
                files: [file],
                options: settings
            });
			for (var d in itemData) {
				item = item.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
			}
			// Add the file item to the queue
			item = $(settings.templatesContainer).html(item).children();
			item.addClass("template-upload fade");
			$('#' + settings.queueID).append(item);
			$('#' + settings.queueID).find('.progress').empty().progressbar();
        	this._trigger("onRenderUploadTmp", null, {"item":item});
		}
		$("#" + file.id).find('.error').text(swfObj.queueData.errorMsg);*/
		// Call the user-defined event handler
		this._trigger("onSelectError", null, [{
			"file": file,
			"error": errorMsg
		}]);
	},

	// Triggered when all the files in the queue have been processed
	onQueueComplete : function() {
		if (this.settings.onQueueComplete) this.settings.onQueueComplete.call(this, this.settings.queueData);
	},

	// Triggered when a file upload successfully completes
	onUploadComplete : function(swfObj, file) {
		// Load the swfupload settings
		var settings     = swfObj.settings,
			swfuploaderObj = swfObj;

		// Check if all the files have completed uploading
		var stats = swfObj.getStats();
		swfObj.queueData.queueLength = stats.files_queued;
		/*swfObj.queueData.queueLength = '*';*/
		if (swfObj.queueData.uploadQueue[0] == '*') {
			if (swfObj.queueData.queueLength > 0) {
				swfObj.startUpload();
			} else {
				swfObj.queueData.uploadQueue = [];

				// Call the user-defined event handler for queue complete
				if (settings.onQueueComplete) settings.onQueueComplete.call(swfObj, swfObj.queueData);
			}
		} else {
			if (swfObj.queueData.uploadQueue.length > 0) {
				swfObj.startUpload(swfObj.queueData.uploadQueue.shift());
			} else {
				swfObj.queueData.uploadQueue = [];

				// Call the user-defined event handler for queue complete
				if (settings.onQueueComplete) settings.onQueueComplete.call(swfObj, swfObj.queueData);
			}
		}

		// Call the default event handler
		if ($.inArray('onUploadComplete', settings.overrideEvents) < 0) {
			if (settings.removeCompleted) {
				switch (file.filestatus) {
					case SWFUpload.FILE_STATUS.COMPLETE:
						setTimeout(function() { 
							if ($('#' + file.id)) {
								swfuploaderObj.queueData.queueSize   -= file.size;
								swfuploaderObj.queueData.queueLength -= 1;
								delete swfuploaderObj.queueData.files[file.id]
								$('#' + file.id).fadeOut(500, function() {
									$(this).remove();
								});
							}
						}, settings.removeTimeout * 1000);
						break;
					case SWFUpload.FILE_STATUS.ERROR:
						if (!settings.requeueErrors) {
							setTimeout(function() {
								if ($('#' + file.id)) {
									swfuploaderObj.queueData.queueSize   -= file.size;
									swfuploaderObj.queueData.queueLength -= 1;
									delete swfuploaderObj.queueData.files[file.id];
									$('#' + file.id).fadeOut(500, function() {
										$(this).remove();
									});
								}
							}, settings.removeTimeout * 1000);
						}
						break;
				}
			} else {
				file.uploaded = true;
			}
		}
		var arrList = settings.unUploadedFileList;
        var values = this.getUnUploadValues();
        arrList.splice($.inArray(file[settings.prmNames.fileId],values),1); 
		// Call the user-defined event handler
		this._trigger("onComplete", null, [{
			"file": file
		}]);
	},

	// Triggered when a file upload returns an error
	onUploadError : function(swfObj, file, errorCode, errorMsg) {
		// Load the swfupload settings
		var settings = swfObj.settings;
		// Set the error string
		var errorString = 'Error';
		switch(errorCode) {
			case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
				errorString = 'HTTP Error (' + errorMsg + ')';
				this._trigger("onFail", null, [{
					"file": file,
					"error": errorMsg
				}]);
				break;
			case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
				errorString = 'Missing Upload URL';
				break;
			case SWFUpload.UPLOAD_ERROR.IO_ERROR:
				errorString = 'IO Error';
				this._trigger("onFail", null, [{
					"file": file,
					"error": errorMsg
				}]);
				break;
			case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
				errorString = 'Security Error';
				this._trigger("onFail", null, [{
					"file": file,
					"error": errorMsg
				}]);
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
				alert('The upload limit has been reached (' + errorMsg + ').');
				errorString = 'Exceeds Upload Limit';
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
				errorString = 'Failed';
				this._trigger("onFail", null, [{
					"file": file,
					"error": errorMsg
				}]);
				break;
			case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
				break;
			case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
				errorString = 'Validation Error';
				break;
			case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
				errorString = 'Cancelled';
				swfObj.queueData.queueSize   -= file.size;
				swfObj.queueData.queueLength -= 1;
				if (file.status == SWFUpload.FILE_STATUS.IN_PROGRESS || $.inArray(file.id, swfObj.queueData.uploadQueue) >= 0) {
					swfObj.queueData.uploadSize -= file.size;
				}
				delete swfObj.queueData.files[file.id];
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
				errorString = 'Stopped';
				this._trigger("onFail", null, [{
					"file": file,
					"error": errorMsg
				}]);
				break;
		}

		// Call the default event handler
		if ($.inArray('onUploadError', settings.overrideEvents) < 0) {

			/*if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
				$('#' + settings.unUploadedFileList[0].fileId).addClass('swfuploader-error');
			}

			// Reset the progress bar
			//$('#' + file.id).find('.swfuploader-progress-bar').css('width','1px');
			$('#' + settings.unUploadedFileList[0].fileId).find('.progress').progressbar("value", 1);

			// Add the error message to the queue item
			if (errorCode != SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND && file.status != SWFUpload.FILE_STATUS.COMPLETE) {
				$('#' + settings.unUploadedFileList[0].fileId).find('.data').html(' - ' + errorString);
			}*/
		}

		var stats = swfObj.getStats();
		swfObj.queueData.uploadsErrored = stats.upload_errors;

		// Call the user-defined event handler
		//this._trigger("onComplete", null, [{"file": file}]);
	},

	// Triggered periodically during a file upload
	onUploadProgress : function(swfObj, file, fileBytesLoaded, fileTotalBytes) {
		// Load the swfupload settings
		var settings = swfObj.settings;

		// Setup all the variables
		var timer            = new Date();
		var newTime          = timer.getTime();
		var lapsedTime       = newTime - swfObj.timer;
		if (lapsedTime > 500) {
			swfObj.timer = newTime;
		}
		var lapsedBytes      = fileBytesLoaded - swfObj.bytesLoaded;
		swfObj.bytesLoaded     = fileBytesLoaded;
		var queueBytesLoaded = swfObj.queueData.queueBytesUploaded + fileBytesLoaded;
		var progress       = Math.round(fileBytesLoaded / fileTotalBytes * 100);
		
		// Calculate the average speed
		var suffix = 'KB/s';
		var mbs = 0;
		var kbs = (lapsedBytes / 1024) / (lapsedTime / 1000);
		    kbs = Math.floor(kbs * 10) / 10;
		if (swfObj.queueData.averageSpeed > 0) {
			swfObj.queueData.averageSpeed = Math.floor((swfObj.queueData.averageSpeed + kbs) / 2);
		} else {
			swfObj.queueData.averageSpeed = Math.floor(kbs);
		}
		if (kbs > 1000) {
			mbs = (kbs * .001);
			swfObj.queueData.averageSpeed = Math.floor(mbs);
			suffix = 'MB/s';
		}
		
		// Call the default event handler
		if ($.inArray('onUploadProgress', settings.overrideEvents) < 0) {
			$('#' + file.id).find('.progressbar-value').show().css("width", progress+"%");
			$('#' + file.id).find('.progressbar-text').text(progress+"%");
		}

		// Call the user-defined event handler
		this._trigger("onProgress", null, [{"file": file}]);
	},

	// Triggered right before a file is uploaded
	onUploadStart : function(swfObj, file) {
		// Load the swfupload settings
		var settings = swfObj.settings;

		var timer        = new Date();
		swfObj.timer       = timer.getTime();
		swfObj.bytesLoaded = 0;
		if (swfObj.queueData.uploadQueue.length == 0) {
			swfObj.queueData.uploadSize = file.size;
		}
		if (settings.checkExisting) {
			$.ajax({
				type    : 'POST',
				async   : false,
				url     : settings.checkExisting,
				data    : {filename: file.name},
				success : function(data) {
					if (data == 1) {
						var overwrite = confirm('A file with the name "' + file.name + '" already exists on the server.\nWould you like to replace the existing file?');
						if (!overwrite) {
							swfObj.cancelUpload(file.id);
							$('#' + file.id).remove();
							if (swfObj.queueData.uploadQueue.length > 0 && swfObj.queueData.queueLength > 0) {
								if (swfObj.queueData.uploadQueue[0] == '*') {
									swfObj.startUpload();
								} else {
									swfObj.startUpload(swfObj.queueData.uploadQueue.shift());
								}
							}
						}
					}
				}
			});
		}

		// Call the user-defined event handler
		this._trigger("onStart", null, [{
			"file": file
		}]);
		this._trigger("onSend", null, [{
			"file": file
		}]);
	},

	// Triggered when a file upload returns a successful code
	onUploadSuccess : function(swfObj, file, data, response) {
		// Load the swfupload settings
		var settings = swfObj.settings,item;
		var stats    = swfObj.getStats(),
			returnVal = JSON.parse(data).files;
		swfObj.queueData.uploadsSuccessful = stats.successful_uploads;
		swfObj.queueData.queueBytesUploaded += file.size;

		// Call the default event handler
		if ($.inArray('onUploadSuccess', settings.overrideEvents) < 0) {
			$('#' + file.id).find('.data').html(' - 上传完成');
		}
		var fileSize = Math.round(file.size / 1024);
		var suffix   = 'KB';
		if (fileSize > 1000) {
			fileSize = Math.round(fileSize / 1000);
			suffix   = 'MB';
		}
		var fileSizeParts = fileSize.toString().split('.');
		fileSize = fileSizeParts[0];
		if (fileSizeParts.length > 1) {
			fileSize += '.' + fileSizeParts[1].substr(0,2);
		}
		fileSize += suffix;
		// Truncate the filename if it's too long
		var fileName = file.name;
		if (fileName.length > 25) {
			fileName = fileName.substr(0,25) + '...';
		}
		if ($.inArray('onSelect', settings.overrideEvents) < 0) {
			// Replace the item data in the template
			item = settings.downloadTemplate({
                files: returnVal,
                options: settings
            });
			for (var d in itemData) {
				item = item.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
			}
			if (settings.uploadTemplate){
				item = $(settings.templatesContainer).html(item).children();
				item.addClass("template-download fade");
				$('#' + file.id).replaceWith(item);
			}
			this._trigger("onRenderDownloadTmp", null, {"item":item});
		}
		this._trigger("onSuccess", null, [{"file": returnVal[0]}]);
		//this._trigger("onComplete", null, [{"file": file}]);
	}
});
// noDefinePart
} ) );