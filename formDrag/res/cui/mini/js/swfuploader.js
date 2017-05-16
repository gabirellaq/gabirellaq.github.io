/*! cui 2016-11-08 */
$.component("coral.swfuploader",{options:{swfUploadOptions:null,swf:"external/swfupload.swf",uploader:"swfupload.php",auto:!0,buttonClass:"",buttonCursor:"hand",buttonImage:null,buttonText:"SELECT FILES",checkExisting:!1,debug:!1,fileObjName:"Filedata",maxFileSize:0,fileTypeDesc:"All Files",fileTypeExts:"*.*",uploadTemplate:!1,method:"post",multiple:!0,formData:{},preventCaching:!0,uploadedFileList:[],separator:",",progressData:"speed",queueID:!1,queueSizeLimit:999,removeCompleted:!0,removeTimeout:3,requeueErrors:!1,successTimeout:30,uploadLimit:999,overrideEvents:[]},_create:function(){var a=this,b=this.element.clone(),c=this.options;this.options.id=this.element.attr("id");var d=$("<div />",{id:c.id+"_wrappper","class":"swfuploader",css:{height:c.height+"px",width:c.width+"px"}});this.element.append(d);var e={assume_success_timeout:c.successTimeout,button_placeholder_id:d[0].id,button_width:c.width,button_height:c.height,button_text:null,button_text_style:null,button_text_top_padding:0,button_text_left_padding:0,button_action:c.multiple?SWFUpload.BUTTON_ACTION.SELECT_FILES:SWFUpload.BUTTON_ACTION.SELECT_FILE,button_disabled:!1,button_cursor:"arrow"==c.buttonCursor?SWFUpload.CURSOR.ARROW:SWFUpload.CURSOR.HAND,button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,debug:c.debug,requeue_on_error:c.requeueErrors,file_post_name:c.fileObjName,file_size_limit:c.maxFileSize,file_types:c.fileTypeExts,file_types_description:c.fileTypeDesc,file_queue_limit:c.queueSizeLimit,file_upload_limit:c.uploadLimit,flash_url:c.swf,prevent_swf_caching:c.preventCaching,post_params:c.formData,upload_url:c.uploader,delete_url:c.deleteUrl,use_query_string:"get"==c.method,swfupload_loaded_handler:c.onSWFReady,file_dialog_complete_handler:this.onDialogClose,file_dialog_start_handler:this.onDialogOpen,file_queued_handler:function(b){a.onSelect.apply(a,[this,b])},file_queue_error_handler:function(b,c,d){a.onSelectError.apply(a,[this,b,c,d])},upload_complete_handler:function(b){a.onUploadComplete.apply(a,[this,b])},upload_error_handler:function(b,c,d){a.onUploadError.apply(a,[this,b,c,d])},upload_progress_handler:function(b,c,d){a.onUploadProgress.apply(a,[this,b,c,d])},upload_start_handler:function(b){a.onUploadStart.apply(a,[this,b])},upload_remove_handler:function(b){a.onRemove.apply(a,[this,b])},upload_success_handler:function(b,c,d){a.onUploadSuccess.apply(a,[this,b,c,d])}};c.swfUploadOptions&&(e=$.extend(e,c.swfUploadOptions)),e=$.extend(e,c);var f=swfobject.getFlashPlayerVersion(),g=f.major>=9;if(g){window["swfuploader_"+c.id]=new SWFUpload(e);var h=window["swfuploader_"+c.id];if(this.element.data("swfuploader",h),$("#"+h.movieName).wrap(d),d=$("#"+c.id),d.data("swfuploader",h),$("#"+h.movieName).css({position:"absolute","z-index":1}),!c.queueID){var i=$("<div />",{id:c.id+"-queue","class":"swfuploader-queue"});d.after(i),h.settings.queueID=c.id+"-queue",h.settings.defaultQueue=!0}h.queueData={files:{},filesSelected:0,filesQueued:0,filesReplaced:0,filesCancelled:0,filesErrored:0,uploadsSuccessful:0,uploadsErrored:0,averageSpeed:0,queueLength:0,queueSize:0,uploadSize:0,queueBytesUploaded:0,uploadQueue:[],errorMsg:"Some files were not added to the queue:"},h.original=b,h.wrapper=d,h.queue=i,c.onInit&&c.onInit.call(this.element,h)}else{var j=c.onNoflash.call(this.element),k=$("<div class='coral-uploader-button' style='height: 40px;'></div>").appendTo(j),l=$("<input type='button'/>").appendTo(k);l.button({id:c.id+"-button",label:c.buttonText,onClick:function(){alert("没有安装flash或flash版本过低")}})}},addUploadCount:function(){var a=this.element.data("swfuploader");a.addUploadCount()},reduece:function(a){var b=this.element.data("swfuploader"),c=b.settings;if($("#"+a).hasClass("template-download")){b.reduceUploadCount(),uploadList=c.uploadedFileList;var d=this.getValues();uploadList.splice($.inArray(a,d),1)}else if($("#"+a).hasClass("template-upload")){downList=c.unUploadedFileList;var d=this.getUnUploadValues();downList.splice($.inArray(a,d),1)}},setValues:function(a){var b=this.element.data("swfuploader"),c=b.settings;c.uploadedFileList=a},cancel:function(a,b){var c,d,e=arguments,f=this,g=this.element.data("swfuploader"),h=g.settings,i=-1;if(!h.disabled)if("array"==typeof a||"undefined"==typeof a)if("undefined"==typeof a){var j=g.queueData.queueLength;$("#"+h.queueID).children().each(function(){i++,e[1]===!0?g.cancelUpload(this.id,!1):g.cancelUpload(this.id),$(this).find(".data").removeClass("data");var a=f.getValues();if(-1!=$.inArray(this.id,a)){var b=$("#"+this.id),c=$(b);if(c.data().url&&"undefined"!=c.data().url){for(var d={},j=0;j<h.uploadedFileList.length;j++)this.id==h.uploadedFileList[j].fileId&&(d.data=h.uploadedFileList[j]);d.dataType=h.dataType||"json",d.url=h.uploadedFileList[0].fileUrl,$.ajax(d).done(function(){c.delay(1e3).fadeOut(500,function(){$(this).remove()})}),f._trigger("onRemove",null,{fileId:this.id})}else c.delay(1e3+100*i).fadeOut(500,function(){$(this).remove()}),f._trigger("onRemove",null,{fileId:this.id});delete g.queueData.files[this.id],f.reduece(this.id)}}),g.queueData.queueSize=0,g.queueData.queueLength=0,h.onClearQueue&&h.onClearQueue.call(this.element,j)}else for(var k=0;k<e.length;k++)g.cancelUpload(e[k]),$("#"+e[k]).find(".data").removeClass("data"),$("#"+e[k]).delay(1e3+100*k).fadeOut(500,function(){$(this).remove()}),this._trigger("onRemove",null),delete g.queueData.files[e[k]],f.reduece(e[k]);else{var l=$("#"+a);if($item=$(l),g.cancelUpload($item.attr("id")),$item.find(".data").removeClass("data"),$item.data().url&&"undefined"!=$item.data().url){for(var m={},n=0;n<h.uploadedFileList.length;n++)a==h.uploadedFileList[n].fileId&&(m.data=h.uploadedFileList[n]);m.dataType=h.dataType||"json",m.url=$item.data().url,$.ajax(m).done(function(){$item.delay(1e3).fadeOut(500,function(){$(this).remove()})})}else $item.delay(1e3).fadeOut(500,function(){$(this).remove()});if(this._trigger("onRemove",null),delete g.queueData.files[a],$("#"+a).hasClass("template-download")){g.reduceUploadCount(),c=h.uploadedFileList;var o=this.getValues();c.splice($.inArray(a,o),1)}else if($("#"+a).hasClass("template-upload")){d=h.unUploadedFileList;var o=this.getUnUploadValues();d.splice($.inArray(a,o),1)}}},_destroy:function(){var a=this.element.data("swfuploader"),b=a.settings;a.destroy(),this.element.find(".swfuploader").remove(),b.uploadedFileList&&$("#"+b.queueID).remove(),$("#"+b.id).replaceWith(this.element),b.onDestroy&&b.onDestroy.call(this),delete a},disable:function(a){var b=this.element.data("swfuploader"),c=b.settings;a?($("#"+this.options.queueID).addClass("coral-state-disabled"),c.disabled=!0,this._trigger("onDisable",null,[])):($("#"+this.options.queueID).removeClass("coral-state-disabled"),c.disabled=!1,this._trigger("onEnable",null,[])),b.setButtonDisabled(a)},getQueueData:function(){for(var a=[],b=[],c=this.element.data("swfuploader"),d=c.settings,e=0;e<d.uploadedFileList.length;e++)a.push(d.uploadedFileList[e].fileId);for(var e=0;e<d.unUploadedFileList.length;e++)b.push(d.unUploadedFileList[e].fileId);return $.merge(a,b)},getUnUploadValues:function(){for(var a=[],b=this.element.data("swfuploader"),c=b.settings,d=0;d<c.unUploadedFileList.length;d++)a.push(c.unUploadedFileList[d].fileId);return a},getValues:function(){for(var a=[],b=this.element.data("swfuploader"),c=b.settings,d=0;d<c.uploadedFileList.length;d++)a.push(c.uploadedFileList[d].fileId);return a},getValue:function(){var a=this.element.data("swfuploader"),b=a.settings;return this.getValues().join(b.separator)},getValidateValue:function(){return this.getValue()},_setOption:function(a,b,c){var d=this.element.data("swfuploader"),e=d.settings;switch(this._super(a,b),a){case"uploader":d.setUploadURL(b);break;case"formData":c||(b=$.extend(e.formData,b)),d.setPostParams(e.formData);break;case"method":"get"==b?d.setUseQueryString(!0):d.setUseQueryString(!1);break;case"fileObjName":d.setFilePostName(b);break;case"fileTypeExts":d.setFileTypes(b,e.fileTypeDesc);break;case"fileTypeDesc":d.setFileTypes(e.fileTypeExts,b);break;case"maxFileSize":d.setFileSizeLimit(b);break;case"uploadLimit":d.setFileUploadLimit(b);break;case"queueSizeLimit":d.setFileQueueLimit(b);break;case"buttonCursor":"arrow"==b?d.setButtonCursor(SWFUpload.CURSOR.ARROW):d.setButtonCursor(SWFUpload.CURSOR.HAND);break;case"buttonText":$("#"+this.options.id+"-button").find(".swfuploader-button-text").html(b);break;case"width":d.setButtonDimensions(b,e.height);break;case"height":d.setButtonDimensions(e.width,b);break;case"multiple":b?d.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES):d.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE)}},stop:function(){var a=this.element.data("swfuploader");a.queueData.averageSpeed=0,a.queueData.uploadSize=0,a.queueData.bytesUploaded=0,a.queueData.uploadQueue=[],a.stopUpload(),this._trigger("onStop",null,[])},upload:function(a){var b,c=arguments,d=this.element.data("swfuploader"),e=d.settings;if(d.queueData.averageSpeed=0,d.queueData.uploadSize=0,d.queueData.bytesUploaded=0,d.queueData.uploadQueue=[],!e.disabled)if(c[0]||"undefined"==typeof a)if("undefined"==typeof a){d.queueData.uploadSize=d.queueData.queueSize;e.unUploadedFileList;d.queueData.uploadQueue.push("*"),d.startUpload()}else{for(b=0;b<c.length;b++)d.queueData.uploadQueue.push(c[b]);d.startUpload(d.queueData.uploadQueue.shift())}else d.startUpload()},onDialogOpen:function(){var a=this.settings;this.queueData.errorMsg="Some files were not added to the queue:",this.queueData.filesReplaced=0,this.queueData.filesCancelled=0,a.onDialogOpen&&a.onDialogOpen.call(this)},onDialogClose:function(a,b,c){var d=this.settings;this.queueData.filesErrored=a-b,this.queueData.filesSelected=a,this.queueData.filesQueued=b-this.queueData.filesCancelled,this.queueData.queueLength=c,$.inArray("onDialogClose",d.overrideEvents)<0&&this.queueData.filesErrored>0,d.onDialogClose&&d.onDialogClose.call(this,this.queueData),d.auto&&$("#"+d.id).swfuploader("upload")},handerSWFEvent:function(){},validateFiles:function(a,b){var c=a.settings;return!c.acceptFileTypes||c.acceptFileTypes.test(b.type)||c.acceptFileTypes.test(b.name)?b.size>c.maxFileSize&&(b.error="The File is too large."):b.error="The file is not an accepted file type.",b.error},onSelect:function(a,b){var c,d=a.settings,e=Math.round(b.size/1024),f="KB";e>1e3&&(e=Math.round(e/1e3),f="MB");var g=e.toString().split(".");e=g[0],g.length>1&&(e+="."+g[1].substr(0,2)),e+=f;var h=b.name;if(h.length>25&&(h=h.substr(0,25)+"..."),itemData={fileID:b.id,instanceID:d.id,fileName:h,fileSize:e},$.inArray("onSelect",d.overrideEvents)<0){c=d.uploadTemplate({files:[b],options:d});for(var i in itemData)c=c.replace(new RegExp("\\$\\{"+i+"\\}","g"),itemData[i]);c=$(d.templatesContainer).html(c).children(),c.addClass("template-upload fade"),$("#"+d.queueID).append(c),this._trigger("onRenderUploadTmp",null,{item:c})}a.queueData.queueSize+=b.size,a.queueData.files[b.id]=b,this._trigger("onSelect",null,[{file:b}])},onSelectError:function(a,b,c,d){var e=a.settings;if($.inArray("onSelectError",e.overrideEvents)<0)switch(c){case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:e.queueSizeLimit>d?alert("\nThe number of files selected exceeds the remaining upload limit"):$.messageQueue({message:e.messages.maxNumberOfFiles});break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:$.messageQueue({message:e.messages.maxFileSize});break;case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:a.queueData.errorMsg='\nThe file "'+b.name+'" is empty.';break;case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:$.messageQueue({message:e.messages.acceptFileTypes})}c!=SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED&&delete a.queueData.files[b.id],this._trigger("onSelectError",null,[{file:b,error:d}])},onQueueComplete:function(){this.settings.onQueueComplete&&this.settings.onQueueComplete.call(this,this.settings.queueData)},onUploadComplete:function(a,b){var c=a.settings,d=a,e=a.getStats();if(a.queueData.queueLength=e.files_queued,"*"==a.queueData.uploadQueue[0]?a.queueData.queueLength>0?a.startUpload():(a.queueData.uploadQueue=[],c.onQueueComplete&&c.onQueueComplete.call(a,a.queueData)):a.queueData.uploadQueue.length>0?a.startUpload(a.queueData.uploadQueue.shift()):(a.queueData.uploadQueue=[],c.onQueueComplete&&c.onQueueComplete.call(a,a.queueData)),$.inArray("onUploadComplete",c.overrideEvents)<0)if(c.removeCompleted)switch(b.filestatus){case SWFUpload.FILE_STATUS.COMPLETE:setTimeout(function(){$("#"+b.id)&&(d.queueData.queueSize-=b.size,d.queueData.queueLength-=1,delete d.queueData.files[b.id],$("#"+b.id).fadeOut(500,function(){$(this).remove()}))},1e3*c.removeTimeout);break;case SWFUpload.FILE_STATUS.ERROR:c.requeueErrors||setTimeout(function(){$("#"+b.id)&&(d.queueData.queueSize-=b.size,d.queueData.queueLength-=1,delete d.queueData.files[b.id],$("#"+b.id).fadeOut(500,function(){$(this).remove()}))},1e3*c.removeTimeout)}else b.uploaded=!0;var f=c.unUploadedFileList,g=this.getUnUploadValues();f.splice($.inArray(b[c.prmNames.fileId],g),1),this._trigger("onComplete",null,[{file:b}])},onUploadError:function(a,b,c,d){var e=a.settings,f="Error";switch(c){case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:f="HTTP Error ("+d+")",this._trigger("onFail",null,[{file:b,error:d}]);break;case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:f="Missing Upload URL";break;case SWFUpload.UPLOAD_ERROR.IO_ERROR:f="IO Error",this._trigger("onFail",null,[{file:b,error:d}]);break;case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:f="Security Error",this._trigger("onFail",null,[{file:b,error:d}]);break;case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:alert("The upload limit has been reached ("+d+")."),f="Exceeds Upload Limit";break;case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:f="Failed",this._trigger("onFail",null,[{file:b,error:d}]);break;case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:break;case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:f="Validation Error";break;case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:f="Cancelled",a.queueData.queueSize-=b.size,a.queueData.queueLength-=1,(b.status==SWFUpload.FILE_STATUS.IN_PROGRESS||$.inArray(b.id,a.queueData.uploadQueue)>=0)&&(a.queueData.uploadSize-=b.size),delete a.queueData.files[b.id];break;case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:f="Stopped",this._trigger("onFail",null,[{file:b,error:d}])}$.inArray("onUploadError",e.overrideEvents)<0;var g=a.getStats();a.queueData.uploadsErrored=g.upload_errors},onUploadProgress:function(a,b,c,d){var e=a.settings,f=new Date,g=f.getTime(),h=g-a.timer;h>500&&(a.timer=g);var i=c-a.bytesLoaded;a.bytesLoaded=c;var j=(a.queueData.queueBytesUploaded+c,Math.round(c/d*100)),k="KB/s",l=0,m=i/1024/(h/1e3);m=Math.floor(10*m)/10,a.queueData.averageSpeed>0?a.queueData.averageSpeed=Math.floor((a.queueData.averageSpeed+m)/2):a.queueData.averageSpeed=Math.floor(m),m>1e3&&(l=.001*m,a.queueData.averageSpeed=Math.floor(l),k="MB/s"),$.inArray("onUploadProgress",e.overrideEvents)<0&&($("#"+b.id).find(".progressbar-value").show().css("width",j+"%"),$("#"+b.id).find(".progressbar-text").text(j+"%")),this._trigger("onProgress",null,[{file:b}])},onUploadStart:function(a,b){var c=a.settings,d=new Date;a.timer=d.getTime(),a.bytesLoaded=0,0==a.queueData.uploadQueue.length&&(a.queueData.uploadSize=b.size),c.checkExisting&&$.ajax({type:"POST",async:!1,url:c.checkExisting,data:{filename:b.name},success:function(c){if(1==c){var d=confirm('A file with the name "'+b.name+'" already exists on the server.\nWould you like to replace the existing file?');d||(a.cancelUpload(b.id),$("#"+b.id).remove(),a.queueData.uploadQueue.length>0&&a.queueData.queueLength>0&&("*"==a.queueData.uploadQueue[0]?a.startUpload():a.startUpload(a.queueData.uploadQueue.shift())))}}}),this._trigger("onStart",null,[{file:b}]),this._trigger("onSend",null,[{file:b}])},onUploadSuccess:function(a,b,c,d){var e,f=a.settings,g=a.getStats(),h=JSON.parse(c).files;a.queueData.uploadsSuccessful=g.successful_uploads,a.queueData.queueBytesUploaded+=b.size,$.inArray("onUploadSuccess",f.overrideEvents)<0&&$("#"+b.id).find(".data").html(" - 上传完成");var i=Math.round(b.size/1024),j="KB";i>1e3&&(i=Math.round(i/1e3),j="MB");var k=i.toString().split(".");i=k[0],k.length>1&&(i+="."+k[1].substr(0,2)),i+=j;var l=b.name;if(l.length>25&&(l=l.substr(0,25)+"..."),$.inArray("onSelect",f.overrideEvents)<0){e=f.downloadTemplate({files:h,options:f});for(var m in itemData)e=e.replace(new RegExp("\\$\\{"+m+"\\}","g"),itemData[m]);f.uploadTemplate&&(e=$(f.templatesContainer).html(e).children(),e.addClass("template-download fade"),$("#"+b.id).replaceWith(e)),this._trigger("onRenderDownloadTmp",null,{item:e})}this._trigger("onSuccess",null,[{file:h[0]}])}});