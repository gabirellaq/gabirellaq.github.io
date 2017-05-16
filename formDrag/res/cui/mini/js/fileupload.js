/*! cui 2016-11-08 */
!function(){"use strict";function a(a){var b="dragover"===a;return function(c){c.dataTransfer=c.originalEvent&&c.originalEvent.dataTransfer;var d=c.dataTransfer;d&&-1!==$.inArray("Files",d.types)&&this._trigger(a,$.Event(a,{delegatedEvent:c}))!==!1&&(c.preventDefault(),b&&(d.dropEffect="copy"))}}$.support.fileInput=!(new RegExp("(Android (1\\.[0156]|2\\.[01]))|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)|(w(eb)?OSBrowser)|(webOS)|(Kindle/(1\\.0|2\\.[05]|3\\.0))").test(window.navigator.userAgent)||$('<input type="file">').prop("disabled")),$.support.xhrFileUpload=!(!window.ProgressEvent||!window.FileReader),$.support.xhrFormDataFileUpload=!!window.FormData,$.support.blobSlice=window.Blob&&(Blob.prototype.slice||Blob.prototype.webkitSlice||Blob.prototype.mozSlice),$.component("blueimp.fileupload",{options:{dropZone:$(document),pasteZone:void 0,fileInput:void 0,replaceFileInput:!0,paramName:void 0,singleFileUploads:!0,limitMultiFileUploads:void 0,limitMultiFileUploadSize:void 0,limitMultiFileUploadSizeOverhead:512,sequentialUploads:!1,limitConcurrentUploads:void 0,forceIframeTransport:!1,redirect:void 0,redirectParamName:void 0,postMessage:void 0,multipart:!0,maxChunkSize:void 0,uploadedBytes:void 0,recalculateProgress:!0,progressInterval:100,bitrateInterval:500,autoUpload:!0,messages:{uploadedBytes:"Uploaded bytes exceed file size"},i18n:function(a,b){return a=this.messages[a]||a.toString(),b&&$.each(b,function(b,c){a=a.replace("{"+b+"}",c)}),a},formData:function(a){return a.serializeArray()},add:function(a,b){return a.isDefaultPrevented()?!1:void((b.autoUpload||b.autoUpload!==!1&&$(this).fileupload("option","autoUpload"))&&b.process().done(function(){b.submit()}))},processData:!1,contentType:!1,cache:!1,timeout:0},_specialOptions:["fileInput","dropZone","pasteZone","multipart","forceIframeTransport"],_blobSlice:$.support.blobSlice&&function(){var a=this.slice||this.webkitSlice||this.mozSlice;return a.apply(this,arguments)},_BitrateTimer:function(){this.timestamp=Date.now?Date.now():(new Date).getTime(),this.loaded=0,this.bitrate=0,this.getBitrate=function(a,b,c){var d=a-this.timestamp;return(!this.bitrate||!c||d>c)&&(this.bitrate=(b-this.loaded)*(1e3/d)*8,this.loaded=b,this.timestamp=a),this.bitrate}},_isXHRUpload:function(a){return!a.forceIframeTransport&&(!a.multipart&&$.support.xhrFileUpload||$.support.xhrFormDataFileUpload)},_getFormData:function(a){var b;return"function"===$.type(a.formData)?a.formData(a.form):$.isArray(a.formData)?a.formData:"object"===$.type(a.formData)?(b=[],$.each(a.formData,function(a,c){b.push({name:a,value:c})}),b):[]},_getTotal:function(a){var b=0;return $.each(a,function(a,c){b+=c.size||1}),b},_initProgressObject:function(a){var b={loaded:0,total:0,bitrate:0};a._progress?$.extend(a._progress,b):a._progress=b},_initResponseObject:function(a){var b;if(a._response)for(b in a._response)a._response.hasOwnProperty(b)&&delete a._response[b];else a._response={}},_onProgress:function(a,b){if(a.lengthComputable){var c,d=Date.now?Date.now():(new Date).getTime();if(b._time&&b.progressInterval&&d-b._time<b.progressInterval&&a.loaded!==a.total)return;b._time=d,c=Math.floor(a.loaded/a.total*(b.chunkSize||b._progress.total))+(b.uploadedBytes||0),this._progress.loaded+=c-b._progress.loaded,this._progress.bitrate=this._bitrateTimer.getBitrate(d,this._progress.loaded,b.bitrateInterval),b._progress.loaded=b.loaded=c,b._progress.bitrate=b.bitrate=b._bitrateTimer.getBitrate(d,c,b.bitrateInterval),this._trigger("progress",$.Event("progress",{delegatedEvent:a}),b),this._trigger("progressall",$.Event("progressall",{delegatedEvent:a}),this._progress)}},_initProgressListener:function(a){var b=this,c=a.xhr?a.xhr():$.ajaxSettings.xhr();c.upload&&($(c.upload).bind("progress",function(c){var d=c.originalEvent;c.lengthComputable=d.lengthComputable,c.loaded=d.loaded,c.total=d.total,b._onProgress(c,a)}),a.xhr=function(){return c})},_isInstanceOf:function(a,b){return Object.prototype.toString.call(b)==="[object "+a+"]"},_initXHRData:function(a){var b,c=this,d=a.files[0],e=a.multipart||!$.support.xhrFileUpload,f="array"===$.type(a.paramName)?a.paramName[0]:a.paramName;a.headers=$.extend({},a.headers),a.contentRange&&(a.headers["Content-Range"]=a.contentRange),e&&!a.blob&&this._isInstanceOf("File",d)||(a.headers["Content-Disposition"]='attachment; filename="'+encodeURI(d.name)+'"'),e?$.support.xhrFormDataFileUpload&&(a.postMessage?(b=this._getFormData(a),a.blob?b.push({name:f,value:a.blob}):$.each(a.files,function(c,d){b.push({name:"array"===$.type(a.paramName)&&a.paramName[c]||f,value:d})})):(c._isInstanceOf("FormData",a.formData)?b=a.formData:(b=new FormData,$.each(this._getFormData(a),function(a,c){b.append(c.name,c.value)})),a.blob?b.append(f,a.blob,d.name):$.each(a.files,function(d,e){(c._isInstanceOf("File",e)||c._isInstanceOf("Blob",e))&&b.append("array"===$.type(a.paramName)&&a.paramName[d]||f,e,e.uploadName||e.name)})),a.data=b):(a.contentType=d.type||"application/octet-stream",a.data=a.blob||d),a.blob=null},_initIframeSettings:function(a){var b=$("<a></a>").prop("href",a.url).prop("host");a.dataType="iframe "+(a.dataType||""),a.formData=this._getFormData(a),a.redirect&&b&&b!==location.host&&a.formData.push({name:a.redirectParamName||"redirect",value:a.redirect})},_initDataSettings:function(a){this._isXHRUpload(a)?(this._chunkedUpload(a,!0)||(a.data||this._initXHRData(a),this._initProgressListener(a)),a.postMessage&&(a.dataType="postmessage "+(a.dataType||""))):this._initIframeSettings(a)},_getParamName:function(a){var b=$(a.fileInput),c=a.paramName;return c?$.isArray(c)||(c=[c]):(c=[],b.each(function(){for(var a=$(this),b=a.prop("name")||"files[]",d=(a.prop("files")||[1]).length;d;)c.push(b),d-=1}),c.length||(c=[b.prop("name")||"files[]"])),c},_initFormSettings:function(a){a.form&&a.form.length||(a.form=$(a.fileInput.prop("form")),a.form.length||(a.form=$(this.options.fileInput.prop("form")))),a.paramName=this._getParamName(a),a.url||(a.url=a.form.prop("action")||location.href),a.type=(a.type||"string"===$.type(a.form.prop("method"))&&a.form.prop("method")||"").toUpperCase(),"POST"!==a.type&&"PUT"!==a.type&&"PATCH"!==a.type&&(a.type="POST"),a.formAcceptCharset||(a.formAcceptCharset=a.form.attr("accept-charset"))},_getAJAXSettings:function(a){var b=$.extend({},this.options,a);return this._initFormSettings(b),this._initDataSettings(b),b},_getDeferredState:function(a){return a.state?a.state():a.isResolved()?"resolved":a.isRejected()?"rejected":"pending"},_enhancePromise:function(a){return a.success=a.done,a.error=a.fail,a.complete=a.always,a},_getXHRPromise:function(a,b,c){var d=$.Deferred(),e=d.promise();return b=b||this.options.context||e,a===!0?d.resolveWith(b,c):a===!1&&d.rejectWith(b,c),e.abort=d.promise,this._enhancePromise(e)},_addConvenienceMethods:function(a,b){var c=this,d=function(a){return $.Deferred().resolveWith(c,a).promise()};b.process=function(a,e){return(a||e)&&(b._processQueue=this._processQueue=(this._processQueue||d([this])).pipe(function(){return b.errorThrown?$.Deferred().rejectWith(c,[b]).promise():d(arguments)}).pipe(a,e)),this._processQueue||d([this])},b.submit=function(){return"pending"!==this.state()&&(b.jqXHR=this.jqXHR=c._trigger("submit",$.Event("submit",{delegatedEvent:a}),this)!==!1&&c._onSend(a,this)),this.jqXHR||c._getXHRPromise()},b.abort=function(){return this.jqXHR?this.jqXHR.abort():(this.errorThrown="abort",c._trigger("fail",null,this),c._getXHRPromise(!1))},b.state=function(){return this.jqXHR?c._getDeferredState(this.jqXHR):this._processQueue?c._getDeferredState(this._processQueue):void 0},b.processing=function(){return!this.jqXHR&&this._processQueue&&"pending"===c._getDeferredState(this._processQueue)},b.progress=function(){return this._progress},b.response=function(){return this._response}},_getUploadedBytes:function(a){var b=a.getResponseHeader("Range"),c=b&&b.split("-"),d=c&&c.length>1&&parseInt(c[1],10);return d&&d+1},_chunkedUpload:function(a,b){a.uploadedBytes=a.uploadedBytes||0;var c,d,e=this,f=a.files[0],g=f.size,h=a.uploadedBytes,i=a.maxChunkSize||g,j=this._blobSlice,k=$.Deferred(),l=k.promise();return this._isXHRUpload(a)&&j&&(h||g>i)&&!a.data?b?!0:h>=g?(f.error=a.i18n("uploadedBytes"),this._getXHRPromise(!1,a.context,[null,"error",f.error])):(d=function(){var b=$.extend({},a),l=b._progress.loaded;b.blob=j.call(f,h,h+i,f.type),b.chunkSize=b.blob.size,b.contentRange="bytes "+h+"-"+(h+b.chunkSize-1)+"/"+g,e._initXHRData(b),e._initProgressListener(b),c=(e._trigger("chunksend",null,b)!==!1&&$.ajax(b)||e._getXHRPromise(!1,b.context)).done(function(c,f,i){h=e._getUploadedBytes(i)||h+b.chunkSize,l+b.chunkSize-b._progress.loaded&&e._onProgress($.Event("progress",{lengthComputable:!0,loaded:h-b.uploadedBytes,total:h-b.uploadedBytes}),b),a.uploadedBytes=b.uploadedBytes=h,b.result=c,b.textStatus=f,b.jqXHR=i,e._trigger("chunkdone",null,b),e._trigger("chunkalways",null,b),g>h?d():k.resolveWith(b.context,[c,f,i])}).fail(function(a,c,d){b.jqXHR=a,b.textStatus=c,b.errorThrown=d,e._trigger("chunkfail",null,b),e._trigger("chunkalways",null,b),k.rejectWith(b.context,[a,c,d])})},this._enhancePromise(l),l.abort=function(){return c.abort()},d(),l):!1},_beforeSend:function(a,b){0===this._active&&(this._trigger("start"),this._bitrateTimer=new this._BitrateTimer,this._progress.loaded=this._progress.total=0,this._progress.bitrate=0),this._initResponseObject(b),this._initProgressObject(b),b._progress.loaded=b.loaded=b.uploadedBytes||0,b._progress.total=b.total=this._getTotal(b.files)||1,b._progress.bitrate=b.bitrate=0,this._active+=1,this._progress.loaded+=b.loaded,this._progress.total+=b.total},_onDone:function(a,b,c,d){var e=d._progress.total,f=d._response;d._progress.loaded<e&&this._onProgress($.Event("progress",{lengthComputable:!0,loaded:e,total:e}),d),f.result=d.result=a,f.textStatus=d.textStatus=b,f.jqXHR=d.jqXHR=c,this._trigger("done",null,d)},_onFail:function(a,b,c,d){var e=d._response;d.recalculateProgress&&(this._progress.loaded-=d._progress.loaded,this._progress.total-=d._progress.total),e.jqXHR=d.jqXHR=a,e.textStatus=d.textStatus=b,e.errorThrown=d.errorThrown=c,this._trigger("fail",null,d)},_onAlways:function(a,b,c,d){this._trigger("always",null,d)},_onSend:function(a,b){b.submit||this._addConvenienceMethods(a,b);var c,d,e,f,g=this,h=g._getAJAXSettings(b),i=function(){return g._sending+=1,h._bitrateTimer=new g._BitrateTimer,c=c||((d||g._trigger("send",$.Event("send",{delegatedEvent:a}),h)===!1)&&g._getXHRPromise(!1,h.context,d)||g._chunkedUpload(h)||$.ajax(h)).done(function(a,b,c){g._onDone(a,b,c,h)}).fail(function(a,b,c){g._onFail(a,b,c,h)}).always(function(a,b,c){if(g._onAlways(a,b,c,h),g._sending-=1,g._active-=1,h.limitConcurrentUploads&&h.limitConcurrentUploads>g._sending)for(var d=g._slots.shift();d;){if("pending"===g._getDeferredState(d)){d.resolve();break}d=g._slots.shift()}0===g._active&&g._trigger("stop")})};return this._beforeSend(a,h),this.options.sequentialUploads||this.options.limitConcurrentUploads&&this.options.limitConcurrentUploads<=this._sending?(this.options.limitConcurrentUploads>1?(e=$.Deferred(),this._slots.push(e),f=e.pipe(i)):(this._sequence=this._sequence.pipe(i,i),f=this._sequence),f.abort=function(){return d=[void 0,"abort","abort"],c?c.abort():(e&&e.rejectWith(h.context,d),i())},this._enhancePromise(f)):i()},_onAdd:function(a,b){var c,d,e,f,g=this,h=!0,i=$.extend({},this.options,b),j=b.files,k=j.length,l=i.limitMultiFileUploads,m=i.limitMultiFileUploadSize,n=i.limitMultiFileUploadSizeOverhead,o=0,p=this._getParamName(i),q=0;if(!k)return!1;if(m&&void 0===j[0].size&&(m=void 0),(i.singleFileUploads||l||m)&&this._isXHRUpload(i))if(i.singleFileUploads||m||!l)if(!i.singleFileUploads&&m)for(e=[],c=[],f=0;k>f;f+=1)o+=j[f].size+n,(f+1===k||o+j[f+1].size+n>m||l&&f+1-q>=l)&&(e.push(j.slice(q,f+1)),d=p.slice(q,f+1),d.length||(d=p),c.push(d),q=f+1,o=0);else c=p;else for(e=[],c=[],f=0;k>f;f+=l)e.push(j.slice(f,f+l)),d=p.slice(f,f+l),d.length||(d=p),c.push(d);else e=[j],c=[p];return b.originalFiles=j,$.each(e||j,function(d,f){var i=$.extend({},b);return i.files=e?f:[f],i.paramName=c[d],g._initResponseObject(i),g._initProgressObject(i),g._addConvenienceMethods(a,i),h=g._trigger("add",$.Event("add",{delegatedEvent:a}),i)}),h},_replaceFileInput:function(a){var b=a.fileInput,c=b.clone(!0),d=b.is(document.activeElement);a.fileInputClone=c,$("<form></form>").append(c)[0].reset(),b.after(c).detach(),d&&c.focus(),$.cleanData(b.unbind("remove")),this.options.fileInput=this.options.fileInput.map(function(a,d){return d===b[0]?c[0]:d}),b[0]===this.element[0]&&(this.element=c)},_handleFileTreeEntry:function(a,b){var c,d=this,e=$.Deferred(),f=function(b){b&&!b.entry&&(b.entry=a),e.resolve([b])},g=function(c){d._handleFileTreeEntries(c,b+a.name+"/").done(function(a){e.resolve(a)}).fail(f)},h=function(){c.readEntries(function(a){a.length?(i=i.concat(a),h()):g(i)},f)},i=[];return b=b||"",a.isFile?a._file?(a._file.relativePath=b,e.resolve(a._file)):a.file(function(a){a.relativePath=b,e.resolve(a)},f):a.isDirectory?(c=a.createReader(),h()):e.resolve([]),e.promise()},_handleFileTreeEntries:function(a,b){var c=this;return $.when.apply($,$.map(a,function(a){return c._handleFileTreeEntry(a,b)})).pipe(function(){return Array.prototype.concat.apply([],arguments)})},_getDroppedFiles:function(a){a=a||{};var b=a.items;return b&&b.length&&(b[0].webkitGetAsEntry||b[0].getAsEntry)?this._handleFileTreeEntries($.map(b,function(a){var b;return a.webkitGetAsEntry?(b=a.webkitGetAsEntry(),b&&(b._file=a.getAsFile()),b):a.getAsEntry()})):$.Deferred().resolve($.makeArray(a.files)).promise()},_getSingleFileInputFiles:function(a){a=$(a);var b,c,d=a.prop("webkitEntries")||a.prop("entries");if(d&&d.length)return this._handleFileTreeEntries(d);if(b=$.makeArray(a.prop("files")),b.length)void 0===b[0].name&&b[0].fileName&&$.each(b,function(a,b){b.name=b.fileName,b.size=b.fileSize});else{if(c=a.prop("value"),!c)return $.Deferred().resolve([]).promise();b=[{name:c.replace(/^.*\\/,"")}]}return $.Deferred().resolve(b).promise()},_getFileInputFiles:function(a){return a instanceof $&&1!==a.length?$.when.apply($,$.map(a,this._getSingleFileInputFiles)).pipe(function(){return Array.prototype.concat.apply([],arguments)}):this._getSingleFileInputFiles(a)},_onChange:function(a){var b=this,c={fileInput:$(a.target),form:$(a.target.form)};this._getFileInputFiles(c.fileInput).always(function(d){c.files=d,b.options.replaceFileInput&&b._replaceFileInput(c),b._trigger("change",$.Event("change",{delegatedEvent:a}),c)!==!1&&b._onAdd(a,c)})},_onPaste:function(a){var b=a.originalEvent&&a.originalEvent.clipboardData&&a.originalEvent.clipboardData.items,c={files:[]};b&&b.length&&($.each(b,function(a,b){var d=b.getAsFile&&b.getAsFile();d&&c.files.push(d)}),this._trigger("paste",$.Event("paste",{delegatedEvent:a}),c)!==!1&&this._onAdd(a,c))},_onDrop:function(a){a.dataTransfer=a.originalEvent&&a.originalEvent.dataTransfer;var b=this,c=a.dataTransfer,d={};c&&c.files&&c.files.length&&(a.preventDefault(),this._getDroppedFiles(c).always(function(c){d.files=c,b._trigger("drop",$.Event("drop",{delegatedEvent:a}),d)!==!1&&b._onAdd(a,d)}))},_onDragOver:a("dragover"),_onDragEnter:a("dragenter"),_onDragLeave:a("dragleave"),_initEventHandlers:function(){this._isXHRUpload(this.options)&&(this._on(this.options.dropZone,{dragover:this._onDragOver,drop:this._onDrop,dragenter:this._onDragEnter,dragleave:this._onDragLeave}),this._on(this.options.pasteZone,{paste:this._onPaste})),$.support.fileInput&&this._on(this.options.fileInput,{change:this._onChange})},_destroyEventHandlers:function(){this._off(this.options.dropZone,"dragenter dragleave dragover drop"),this._off(this.options.pasteZone,"paste"),this._off(this.options.fileInput,"change")},_setOption:function(a,b){var c=-1!==$.inArray(a,this._specialOptions);c&&this._destroyEventHandlers(),this._super(a,b),c&&(this._initSpecialOptions(),this._initEventHandlers())},_initSpecialOptions:function(){var a=this.options;void 0===a.fileInput?a.fileInput=this.element.is('input[type="file"]')?this.element:this.element.find('input[type="file"]'):a.fileInput instanceof $||(a.fileInput=$(a.fileInput)),a.dropZone instanceof $||(a.dropZone=$(a.dropZone)),a.pasteZone instanceof $||(a.pasteZone=$(a.pasteZone))},_getRegExp:function(a){var b=a.split("/"),c=b.pop();return b.shift(),new RegExp(b.join("/"),c)},_isRegExpOption:function(a,b){return"url"!==a&&"string"===$.type(b)&&/^\/.*\/[igm]{0,3}$/.test(b)},_initDataAttributes:function(){var a=this,b=this.options,c=this.element.data();$.each(this.element[0].attributes,function(d,e){var f,g=e.name.toLowerCase();/^data-/.test(g)&&(g=g.slice(5).replace(/-[a-z]/g,function(a){return a.charAt(1).toUpperCase()}),f=c[g],a._isRegExpOption(g,f)&&(f=a._getRegExp(f)),b[g]=f)})},_create:function(){this._initDataAttributes(),this._initSpecialOptions(),this._slots=[],this._sequence=this._getXHRPromise(!0),this._sending=this._active=0,this._initProgressObject(this),this._initEventHandlers()},active:function(){return this._active},progress:function(){return this._progress},add:function(a){var b=this;a&&!this.options.disabled&&(a.fileInput&&!a.files?this._getFileInputFiles(a.fileInput).always(function(c){a.files=c,b._onAdd(null,a)}):(a.files=$.makeArray(a.files),this._onAdd(null,a)))},send:function(a){if(a&&!this.options.disabled){if(a.fileInput&&!a.files){var b,c,d=this,e=$.Deferred(),f=e.promise();return f.abort=function(){return c=!0,b?b.abort():(e.reject(null,"abort","abort"),f)},this._getFileInputFiles(a.fileInput).always(function(f){if(!c){if(!f.length)return void e.reject();a.files=f,b=d._onSend(null,a),b.then(function(a,b,c){e.resolve(a,b,c)},function(a,b,c){e.reject(a,b,c)})}}),this._enhancePromise(f)}if(a.files=$.makeArray(a.files),a.files.length)return this._onSend(null,a)}return this._getXHRPromise(!1,a&&a.context)}})}();