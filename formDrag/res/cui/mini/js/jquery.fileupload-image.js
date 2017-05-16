/*! cui 2016-11-08 */
!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery","load-image","load-image-meta","load-image-exif","load-image-ios","canvas-to-blob","./jquery.fileupload-process"],a):"object"==typeof exports?a(require("jquery"),require("load-image")):a(window.jQuery,window.loadImage)}(function(a,b){"use strict";a.blueimp.fileupload.prototype.options.processQueue.unshift({action:"loadImageMetaData",disableImageHead:"@",disableExif:"@",disableExifThumbnail:"@",disableExifSub:"@",disableExifGps:"@",disabled:"@disableImageMetaDataLoad"},{action:"loadImage",prefix:!0,fileTypes:"@",maxFileSize:"@",noRevoke:"@",disabled:"@disableImageLoad"},{action:"resizeImage",prefix:"image",maxWidth:"@",maxHeight:"@",minWidth:"@",minHeight:"@",crop:"@",orientation:"@",forceResize:"@",disabled:"@disableImageResize"},{action:"saveImage",quality:"@imageQuality",type:"@imageType",disabled:"@disableImageResize"},{action:"saveImageMetaData",disabled:"@disableImageMetaDataSave"},{action:"resizeImage",prefix:"preview",maxWidth:"@",maxHeight:"@",minWidth:"@",minHeight:"@",crop:"@",orientation:"@",thumbnail:"@",canvas:"@",disabled:"@disableImagePreview"},{action:"setImage",name:"@imagePreviewName",disabled:"@disableImagePreview"},{action:"deleteImageReferences",disabled:"@disableImageReferencesDeletion"}),a.component("blueimp.fileupload",a.blueimp.fileupload,{options:{loadImageFileTypes:/^image\/(gif|jpeg|png|svg\+xml)$/,loadImageMaxFileSize:1e7,imageMaxWidth:1920,imageMaxHeight:1080,imageOrientation:!1,imageCrop:!1,disableImageResize:!0,previewMaxWidth:80,previewMaxHeight:80,previewOrientation:!0,previewThumbnail:!0,previewCrop:!1,previewCanvas:!0},processActions:{loadImage:function(c,d){if(d.disabled)return c;var e=this,f=c.files[c.index],g=a.Deferred();return"number"===a.type(d.maxFileSize)&&f.size>d.maxFileSize||d.fileTypes&&!d.fileTypes.test(f.type)||!b(f,function(a){a.src&&(c.img=a),g.resolveWith(e,[c])},d)?c:g.promise()},resizeImage:function(c,d){if(d.disabled||!c.canvas&&!c.img)return c;d=a.extend({canvas:!0},d);var e,f=this,g=a.Deferred(),h=d.canvas&&c.canvas||c.img,i=function(a){a&&(a.width!==h.width||a.height!==h.height||d.forceResize)&&(c[a.getContext?"canvas":"img"]=a),c.preview=a,g.resolveWith(f,[c])};if(c.exif){if(d.orientation===!0&&(d.orientation=c.exif.get("Orientation")),d.thumbnail&&(e=c.exif.get("Thumbnail")))return b(e,i,d),g.promise();c.orientation?delete d.orientation:c.orientation=d.orientation}return h?(i(b.scale(h,d)),g.promise()):c},saveImage:function(b,c){if(!b.canvas||c.disabled)return b;var d=this,e=b.files[b.index],f=a.Deferred();return b.canvas.toBlob?(b.canvas.toBlob(function(a){a.name||(e.type===a.type?a.name=e.name:e.name&&(a.name=e.name.replace(/\.\w+$/,"."+a.type.substr(6)))),e.type!==a.type&&delete b.imageHead,b.files[b.index]=a,f.resolveWith(d,[b])},c.type||e.type,c.quality),f.promise()):b},loadImageMetaData:function(c,d){if(d.disabled)return c;var e=this,f=a.Deferred();return b.parseMetaData(c.files[c.index],function(b){a.extend(c,b),f.resolveWith(e,[c])},d),f.promise()},saveImageMetaData:function(a,b){if(!(a.imageHead&&a.canvas&&a.canvas.toBlob)||b.disabled)return a;var c=a.files[a.index],d=new Blob([a.imageHead,this._blobSlice.call(c,20)],{type:c.type});return d.name=c.name,a.files[a.index]=d,a},setImage:function(a,b){return a.preview&&!b.disabled&&(a.files[a.index][b.name||"preview"]=a.preview),a},deleteImageReferences:function(a,b){return b.disabled||(delete a.img,delete a.canvas,delete a.preview,delete a.imageHead),a}}})});