/*! cui 2016-11-08 */
!function(){function a(a,b){this.element=a,this.options=$.extend({},d,b),this._defaults=d,this._name=c,this._loader=null,this.init()}function b(){$[c]||($.loading=function(a){$("body").loading(a)})}var c="loading",d={position:"overlay",text:"",loadingIcon:"coral-icon-loading",tpl:'<span class="loading-wrapper {wrapper}">{text}<span class="{loadingIcon}"></span></span>',disableSource:!1,disableOthers:[]};a.prototype={init:function(){$(this.element).is("body")&&(this.options.position="overlay"),this.show()},show:function(){var a=this,b=a.options.tpl.replace("{wrapper}"," loading-show ");switch(b=b.replace("{loadingIcon}",a.options.loadingIcon),b=b.replace("{text}",""!==a.options.text?a.options.text+" ":""),a._loader=$(b),$(a.element).is("input, textarea")&&!0===a.options.disableSource?$(a.element).attr("disabled","disabled"):!0===a.options.disableSource&&$(a.element).addClass("disabled"),a.options.position){case"inside":$(a.element).append(a._loader);break;case"overlay":var c=null;if($(a.element).is("body"))c=$('<div class="coral-loading" style="position:fixed; left:0; top:0; z-index: 10001; width: 100%; height: '+$(window).height()+'px;" />'),c.prepend("<div class ='coral-component-overlay'/>"),$("body").prepend(c);else{var d=$(a.element).css("position"),e={},f=$(a.element).outerHeight()+"px",g="100%";e="relative"===d||"absolute"===d?{top:0,left:0}:$(a.element).position(),c=$('<div class="coral-loading" style="position:absolute; top: '+e.top+"px; left: "+e.left+"px; z-index: 10000; width: "+g+"; height: "+f+';" />'),c.prepend("<div style='position:absolute;width:100%;height:100%;'><div class ='coral-component-overlay'style='position:relative;'></div></div>"),$(a.element).prepend(c)}c.append(a._loader),a._loader.css({top:c.outerHeight()/2-a._loader.outerHeight()/2+"px"});break;default:$(a.element).after(a._loader)}a.disableOthers()},refresh:function(){var a=null,b=this,c=$(b.element).css("position"),d={},e=$(b.element).outerHeight()+"px",f="100%";d="relative"===c||"absolute"===c?{top:0,left:0}:$(b.element).position(),a=$(b.element).find(".coral-loading"),a.css({top:d.top,left:d.left,width:f,height:e}),b._loader.css({top:a.outerHeight()/2-b._loader.outerHeight()/2+"px"})},hide:function(){"overlay"===this.options.position?$(this.element).find(".coral-loading").first().remove():($(this._loader).remove(),$(this.element).text($(this.element).attr("data-loading-label"))),$(this.element).removeAttr("disabled").removeClass("disabled"),this.enableOthers()},disableOthers:function(){$.each(this.options.disableOthers,function(a,b){var c=$(b);c.is("button, input, textarea")?c.attr("disabled","disabled"):c.addClass("disabled")})},enableOthers:function(){$.each(this.options.disableOthers,function(a,b){var c=$(b);c.is("button, input, textarea")?c.removeAttr("disabled"):c.removeClass("disabled")})}};var e=Array.prototype.slice;$.fn[c]=function(b){var d=this,f=e.call(arguments,1),g="string"==typeof b;return this.each(function(){if(g){if($.data(this,"plugin_"+c)){var e,h=$.data(this,"plugin_"+c);if(!$.isFunction(h[b])||"_"===b.charAt(0))return $.error("no such method '"+b+"' for "+name+" component instance");if(e=h[b].apply(h,f),e!==h&&void 0!==e)return d=e&&e.jquery?d.pushStack(e.get()):e,!1}}else $.data(this,"plugin_"+c,new a(this,b))})},b()}();