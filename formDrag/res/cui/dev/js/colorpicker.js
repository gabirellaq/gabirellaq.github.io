( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
            "./component",
			"./validate",
			"./inputbase"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/**
 *	Coral 4.0: textbox
 *
 *	Depends:
 *		jquery.coral.core.js
 *		jquery.coral.component.js
 *		jquery.validate.js
 *
 */
$.component ( "coral.colorpicker", $.coral.inputbase, {
	version: $.coral.version,
	ids : {},
	charMin : 65,
	tp1 : '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div>'+
		'<div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color">'+
	    '</div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field">'+
		'<input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field">'+
		'<input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" />'+
		'<span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>'+
		'<div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>'+
		'<div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>'+
		'<div class="colorpicker_submit"></div><div class="custom_color_area"></div></div>',
	castProperties : ["customColorArray"],
	options: {		
		readonlyInput:false,
		readonly : false,
		isLabel: false,
		disable: false,
		isShow : false,
		showBgcolor : true,
		showClose: false,
		onShow: null,
		onBeforeShow: null,
		onHide: null,
		customColorArray:["dddddd","eeeeee","cccccc","eb1139","FF0000","700000","585858","33FF00"
		                  ,"330000","009900","990000","FFFF66","FF3366","6666FF","0000CC","00FFFF"
		                  ,"FF66CC","FF0099","999999","ffffff","33FFFF","ffffff","ffffff","ffffff","ffffff","ffffff"],
		onChange: null,
		onSubmit: null,
		color: 'ff0000',
		livePreview: true,
		flat: false 
	},

	fillRGBFields: function  (hsb, cal) {
		var rgb = this.HSBToRGB(hsb);
		$(cal).data('colorpicker').fields
			.eq(1).val(rgb.r).end()
			.eq(2).val(rgb.g).end()
			.eq(3).val(rgb.b).end();
	},
	
	fillHSBFields: function  (hsb, cal) {
		$(cal).data('colorpicker').fields
		.eq(4).val(hsb.h).end()
		.eq(5).val(hsb.s).end()
		.eq(6).val(hsb.b).end();
    },

    fillHexFields: function (hsb, cal) {
		$(cal).data('colorpicker').fields
		.eq(0).val(this.HSBToHex(hsb)).end();
    },
	component: function () {
		return this.textboxWrapper;
	},
	_create: function() {
		var that = this,
		    opts = this.options;
		if (typeof opts.color == 'string') {
			opts.color = that.HexToHSB(opts.color);
		} else if (opts.color.r != undefined && opts.color.g != undefined && opts.color.b != undefined) {
			opts.color = that.RGBToHSB(opts.color);
		} else if (opts.color.h != undefined && opts.color.s != undefined && opts.color.b != undefined) {
			opts.color = that.fixHSB(opts.color);
		} else {
			return this;
		}
		var options = $.extend({}, opts);
		options.origColor = opts.color;
		var id = 'collorpicker_' + parseInt(Math.random() * 1000);
		$(this.element).data('colorpickerId', id);
		this.cal = $(this.tp1).attr('id', id);
		if (options.flat) {
			this.cal.appendTo(this.element).show();
		} else {
			this.cal.appendTo(document.body);
		}
		this._initElement();
		options.fields = this.cal.find("input");
		options.selector = this.cal.find('div.colorpicker_color');
		options.selectorIndic = options.selector.find('div div');
		options.el = this.element;
		options.hue = this.cal.find('div.colorpicker_hue div');
		options.newColor = this.cal.find('div.colorpicker_new_color');
		options.currentColor = this.cal.find('div.colorpicker_current_color');
		this.cal.data('colorpicker', options);
		this._bindEvents();
		this.fillRGBFields(options.color, this.cal.get(0));
		this.fillHSBFields(options.color, this.cal.get(0));
		this.fillHexFields(options.color, this.cal.get(0));
		this.setHue(options.color, this.cal.get(0));
		this.setSelector(options.color, this.cal.get(0));
		this.setCurrentColor(options.color, this.cal.get(0));
		this.setNewColor(options.color, this.cal.get(0));
		if (options.flat) {
			this.cal.css({
				position: 'relative',
				display: 'block'
			});
		}

		that._trigger( "onCreate", null, [] );
	},
	
	_bindEvents:function(){
		var that = this,
		    opts = this.options;
		this._on(this.cal.find("input"),{
			"keyup": function(ev){
				var pressedKey = ev.charCode || ev.keyCode || -1,
				    target = $(ev.target).closest("input")[0];
				if ((pressedKey > this.charMin && pressedKey <= 90) || pressedKey == 32) {
					return false;
				}
				if (this.cal.data('colorpicker').livePreview === true) {
					this._change(target);
				}
			},
			"change": function(ev){
				var target = $(ev.target).closest("input")[0];
				this._change(target);
			},
			"blur": function(e){
				this.cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
			},
			"focus": function(e){
				var target = $(e.target).closest("input")[0];
				    charMin = target.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
				$(target).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
				$(target).parent().addClass('colorpicker_focus');
			}
		})
		this._on(this.cal.find("span"),{
			"mousedown" : function(ev){
				var target = $(e.target).closest("span")[0];
				var field = $(target).parent().find('input').focus();
				var current = {
					el: $(target).parent().addClass('colorpicker_slider'),
					max: target.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (target.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					that : this,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colorpicker').livePreview					
				};
				$(document).bind('mouseup', current, this._upIncrement);
				$(document).bind('mousemove', current, this._moveIncrement);
			},
		})
		this._on(this.cal.find('>div.colorpicker_current_color'),{
			"click": function(ev){
				var cal=this.cal;
				var col = this.cal.data('colorpicker').origColor;
				cal.data('colorpicker').color = col;
				this.fillRGBFields(col, cal.get(0));
				this.fillHexFields(col, cal.get(0));
				this.fillHSBFields(col, cal.get(0));
				this.setSelector(col, cal.get(0));
				this.setHue(col, cal.get(0));
				this.setNewColor(col, cal.get(0));
			},
		})
		this._on(this.cal.find('div.colorpicker_color'),{
			"mousedown": function(ev){
				var that = this,
				    target=$(ev.target).closest("div.colorpicker_color");
				var current = {
						that: this,
						cal: target.parent(),
						pos: target.offset()
					};
					current.preview = current.cal.data('colorpicker').livePreview;
					$(document).bind('mouseup', current, this._upSelector);
					$(document).bind('mousemove', current, this._moveSelector);
					
			},
			"dblclick" : function(ev){
				var that = this,
				    target=$(ev.target).closest("div.colorpicker_color");
				var current = {
						that: this,
						cal: target.parent(),
						pos: target.offset()
					};
				current.preview = current.cal.data('colorpicker').livePreview;
				ev.data = current;
				this._moveSelector(ev);
				var cal = this.cal;
				var col = cal.data('colorpicker').color;
				cal.data('colorpicker').origColor = col;
				this.setCurrentColor(col, cal.get(0));
				this.setValue(this.HSBToHex(col));
				if (this.options.showBgcolor){
					this.element.css({
						"background-color":"#"+this.HSBToHex(col)
					})
				}
				this._trigger("onSubmit", this.HSBToHex(col), this.HSBToRGB(col), cal.data('colorpicker').el);
				this.cal.hide();
				this.options.isShow = false;
			}
		})
		this._on(this.cal.find('div.colorpicker_hue'),{
			"mousedown" : function(ev){
				var that = this,
			        target=$(ev.target).closest("div.colorpicker_hue");  
				var current = {
						that:that,
						cal: target.parent(),
						y: target.offset().top
					};
					current.preview = current.cal.data('colorpicker').livePreview;
					$(document).bind('mouseup', current, that._upHue);
					$(document).bind('mousemove', current, that._moveHue);
			}
		})
		this._on(this.cal.find('div.colorpicker_submit'),{
			"mouseenter": function(ev){
				var target = $(ev.target).closest("div.colorpicker_submit");
				target.addClass('colorpicker_focus');
			},
			"mouseleave": function(ev) {
				var target = $(ev.target).closest("div.colorpicker_submit");
				target.removeClass("colorpicker_focus");
			},
			"click": function(ev){
				var cal = this.cal;
				var col = cal.data('colorpicker').color;
				cal.data('colorpicker').origColor = col;
				this.setCurrentColor(col, cal.get(0));
				this.setValue(this.HSBToHex(col));
				if (this.options.showBgcolor){
					this.element.css({
						"background-color":"#"+this.HSBToHex(col)
					})
				}
				this._trigger("onSubmit", this.HSBToHex(col), this.HSBToRGB(col), cal.data('colorpicker').el);
				this.cal.hide();
				this.options.isShow = false;
			}
		})
		this._on({
			"click": function(ev){
				this.component().addClass("coral-state-focus");
                this._show(ev);
			},
			"blur": function(ev) {
				this.component().removeClass("coral-state-focus");
				this.setValue(this.element.val());
			},
			"keyup": function(ev){
				var value = this.element.val();
				this.cal.find(".colorpicker_new_color").css({
					"background-color": "#"+value
				})
			}
		})
		this._on(this.cal.find(".color-div"),{
			"click": function(ev){
				var target = $(ev.target).closest(".color-div"),
				    color = target.attr("title");
				this.cal.find(".custom_show_area").css({
					"background-color": color
				}).attr("title",color);
			}
		}) 
		this._on(this.cal.find(".custom_show_area"),{
			"click": function(ev){
				var value = this.cal.find(".custom_show_area").attr("title").slice(1)
				this.setValue(value);
				if (this.options.showBgcolor){
					this.element.css({
						"background-color":"#"+value
					})
				}
				this.cal.hide()
                this.options.isShow = false;
			}
		}) 
	},
	_initElement: function () {
		var that = this,
			options = that.options;	
		this.className = "coral-textbox-default coral-validation-colorpicker tabbable "+this.element[0].className;
		this.compClass = "coral-colorpicker coral-textbox";
		this.hiddenClass = "";
		this.classBorder = "";
		if ( "hidden" == this.element.attr("type") ) {
			this.compClass = this.compClass + " hide";
		}
		this.createInput();
		this.textboxWrapper = $(this.textboxWrapper);
		this.elementBorder = $(this.elementBorder);
		this.textboxHidden = $(this.textboxWrapper[0].lastChild);
		this.element = $(this.textboxInput);
		var customShow = $("<div class='custom_show_area' title='#ffffff'></div>");
		customShow.appendTo(".custom_color_area");
		options.customColorArray.forEach(function(item,index){
			var innerColor="#"+item.toLowerCase();
			var colorDiv = $("<div class='color-div' title='"+innerColor+"'></div>");
			colorDiv.appendTo(".custom_color_area").css({
				"background-color" : innerColor,
				position : "absolute",
				width : "16px",
				height : "16px"
			})
			if (index<=12){
				colorDiv.css({
					left : 18+index*19+"px",
					top : "10px"
				})
			}else{
				colorDiv.css({
					left : 18+(index-13)*19+"px",
					top : "36px"
				})
			}
		})
		if ($.trim(this.element.val()) !== "") {
    		this.options.value = this.element.val();
    	} else if (this.options.value) {
    		this.element.val(this.options.value);
    	}
		if (options.width) {				
			this.textboxWrapper.css( "width", options.width );
		}	
		if (options.height) {				
			this._setOption("height", options.height );
		}
		if (options.readonlyInput) {
			this._setReadonlyInput();
		}
		if (options.readonly) {
			this._setReadonly();
		}

		if ( typeof options.isLabel == "boolean" && options.isLabel ) {
			this._setReadonly();
			this.options.readonly = true;
			this.component().addClass( "coral-isLabel" );
			return ;
		} 
		if ( typeof options.disabled === "boolean" && options.disabled  ) {
			this._setOption( "disabled", options.disabled );
		}
		// clear button
		if ( this.options.showClose ) {
			this.clearIcon.css( "right", this.rightPos ? this.rightPos: 0);
		}
		this.element.attr( "placeholder", options.placeholder );
		if ( options.placeholder && "" === this.element.val() ) {
			this._showPlaceholder();
		}
//		this._updateTitle();
	},
	
	setValue: function (value) {
		value = value === null || typeof(value) === "undefined" ? "":value;
		this.textboxHidden.val(value);
		this.element.val(value)
		this.options.value = value;
		this.previous = value;

		if ( value !== "" ) {
			this._hidePlaceholder();
		}
	},
	
	getValue: function () {
		return this.textboxHidden.val();
	},
	
	_hidePlaceholder: function () {
		if ( $.support.placeholder ) {
			return ;
		}
		
		var that  = this;

		that.textboxWrapper.find( ".coral-textbox-placeholder-label" ).remove();
	},
	
	_showPlaceholder: function () {
		if ( $.support.placeholder ) {
			return ;
		}
		var that = this,
			$placeholder = $("<span class='coral-textbox-placeholder-label'>" + that.options.placeholder  + "</span>");
		$(that.element).after( $placeholder );
	},
	
	_setReadonlyInput: function() {
		if(typeof this.element.attr("readonly") != "undefined"){
			this.options.readonlyInput = this.element.prop("readonly");
		} else if (this.options.readonlyInput){
			this.element.prop("readonly", this.options.readonlyInput);
		}
		if (this.element.prop("readonly")) {
			this.component().addClass("coral-readonlyInput");
		}
	},
	
	_setReadonly: function() {
		this.options.readonlyInput = true;
		this._setReadonlyInput();
		this.component().removeClass("coral-readonlyInput").addClass("coral-readonly");
		this.element.removeClass("tabbable");
	},
	
	_change : function (ev,bool) {
		var cal = $(ev).parent().parent(), col;
		if (ev.parentNode.className.indexOf('_hex') > 0) {
			cal.data('colorpicker').color = col = this.HexToHSB(this.fixHex($(ev).val()));
		} else if (ev.parentNode.className.indexOf('_hsb') > 0) {
			cal.data('colorpicker').color = col = this.fixHSB({
				h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
				s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
				b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
			});
		} else {
			cal.data('colorpicker').color = col = this.RGBToHSB(this.fixRGB({
				r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
				g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
				b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
			}));
		}
		if (bool) {
			this.fillRGBFields(col, cal.get(0));
			this.fillHexFields(col, cal.get(0));
			this.fillHSBFields(col, cal.get(0));
		}
		this.setSelector(col, cal.get(0));
		this.setHue(col, cal.get(0));
		this.setNewColor(col, cal.get(0));
		//TODO 这个要改成_trigger的写法
		this._trigger("onChange", col, this.HSBToHex(col), this.HSBToRGB(col));
	},
	
	_upIncrement: function(ev){
		var that = ev.data.that;
		that._change(ev.data.field.get(0), true);
		ev.data.el.removeClass('colorpicker_slider').find('input').focus();
		$(document).unbind('mouseup', that._upIncrement);
		$(document).unbind('mousemove', that._moveIncrement);
		return false;
	},
	
	_moveIncrement: function(ev) {
		var that = ev.data.that;
		ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
		if (ev.data.preview) {
			that._change(ev.data.field.get(0), true);
		}
		return false;
	},
	
	setSelector: function (hsb, cal) {
		$(cal).data('colorpicker').selector.css('backgroundColor', '#' + this.HSBToHex({h: hsb.h, s: 100, b: 100}));
		$(cal).data('colorpicker').selectorIndic.css({
			left: parseInt(150 * hsb.s/100, 10),
			top: parseInt(150 * (100-hsb.b)/100, 10)
		});
	},
	setHue : function (hsb, cal) {
		$(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
	},
	setCurrentColor: function (hsb, cal) {
		$(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + this.HSBToHex(hsb));
	},
	setNewColor: function (hsb, cal) {
		$(cal).data('colorpicker').newColor.css('backgroundColor', '#' + this.HSBToHex(hsb));
	},
	_moveHue: function (ev) {
		var that = ev.data.that;
		that._change(
			ev.data.cal.data('colorpicker')
				.fields
				.eq(4)
				.val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
				.get(0),
			ev.data.preview
		);
		return false;
	},
	_upHue: function (ev) {
		var that = ev.data.that;
		that.fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
		that.fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
		$(document).unbind('mouseup', that._upHue);
		$(document).unbind('mousemove', that._moveHue);
		return false;
	},
	_moveSelector: function (ev) {
		var that = ev.data.that;
		that._change(
			ev.data.cal.data('colorpicker')
				.fields
				.eq(6)
				.val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
				.end()
				.eq(5)
				.val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
				.get(0),
			ev.data.preview
		);
		return false;
	},
	_upSelector: function (ev) {
		var that = ev.data.that;
		that.fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
		that.fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
		$(document).unbind('mouseup', that._upSelector);
		$(document).unbind('mousemove', that._moveSelector);
		return false;
	},
	enterSubmit: function (ev) {
		$(this).addClass('colorpicker_focus');
	},
	leaveSubmit: function (ev) {
		$(this).removeClass('colorpicker_focus');
	},
	_hide: function (ev) {
		var that = this.cal?this:ev.data.that;
		if (!that.isChildOf(that.cal.get(0), ev.target, that.cal.get(0))) {
			if (that._trigger("onHide",that.cal.get[0]) != false) {
				that.cal.hide();
				/*if(that.scrollTimer){clearTimeout(that.scrollTimer)};*/
				that.options.isShow=false;
			}
			$(document).unbind('mousedown', that._hide);
		}
	},
	_show: function(ev){
		if (this.options.flat) return;
		var cal = this.cal,
		    that = this,
		    uiBorder = this.element.parent();
		this.setColor(this.getValue());
		this._trigger("onBeforeShow",ev,cal.get(0));
		var pos = $(this.element).offset();
		var viewPort = this.getViewport();
		var top = pos.top + this.element.offsetHeight;
		var left = pos.left;
		if (top + 176 > viewPort.t + viewPort.h) {
			top -= this.element.offsetHeight + 176;
		}
		if (left + 356 > viewPort.l + viewPort.w) {
			left -= 356;
		}
/*		cal.css({
			left : $.coral.getLeft( cal, uiBorder ),
			top  : $.coral.getTop( cal, uiBorder),
			display : "absolute"
		});*/
		if (!that.options.isShow){
			if (this._trigger("onShow",ev,cal.get(0)) != false) {
				cal.show();
				this.options.isShow=true
			}
			(function move () {
				var that1 = that;
				if (that1.options.isShow){
					cal.css({
						left : $.coral.getLeft( cal, uiBorder ),
						top  : $.coral.getTop( cal, uiBorder)
					});
					that1.scrollTimer=setTimeout(move, 200);
				}
				
			})();
		}

		$(document).bind('mousedown', {cal: cal,that:that}, this._hide);
		return false;
	},
	isChildOf: function(parentEl, el, container) {
		if (parentEl == el) {
			return true;
		}
		if (parentEl.contains) {
			return parentEl.contains(el);
		}
		if ( parentEl.compareDocumentPosition ) {
			return !!(parentEl.compareDocumentPosition(el) & 16);
		}
		var prEl = el.parentNode;
		while(prEl && prEl != container) {
			if (prEl == parentEl)
				return true;
			prEl = prEl.parentNode;
		}
		return false;
	},
	getViewport: function () {
		var m = document.compatMode == 'CSS1Compat';
		return {
			l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
			t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
			w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
			h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
		};
	},
	fixHSB: function (hsb) {
		return {
			h: Math.min(360, Math.max(0, hsb.h)),
			s: Math.min(100, Math.max(0, hsb.s)),
			b: Math.min(100, Math.max(0, hsb.b))
		};
	}, 
	fixRGB: function (rgb) {
		return {
			r: Math.min(255, Math.max(0, rgb.r)),
			g: Math.min(255, Math.max(0, rgb.g)),
			b: Math.min(255, Math.max(0, rgb.b))
		};
	},
	fixHex: function (hex) {
		var len = 6 - hex.length;
		if (len > 0) {
			var o = [];
			for (var i=0; i<len; i++) {
				o.push('0');
			}
			o.push(hex);
			hex = o.join('');
		}
		return hex;
	}, 
	HexToRGB: function (hex) {
		var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
		return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
	},
	HexToHSB: function (hex) {
		return this.RGBToHSB(this.HexToRGB(hex));
	},
	RGBToHSB: function (rgb) {
		var hsb = {
			h: 0,
			s: 0,
			b: 0
		};
		var min = Math.min(rgb.r, rgb.g, rgb.b);
		var max = Math.max(rgb.r, rgb.g, rgb.b);
		var delta = max - min;
		hsb.b = max;
		if (max != 0) {
			
		}
		hsb.s = max != 0 ? 255 * delta / max : 0;
		if (hsb.s != 0) {
			if (rgb.r == max) {
				hsb.h = (rgb.g - rgb.b) / delta;
			} else if (rgb.g == max) {
				hsb.h = 2 + (rgb.b - rgb.r) / delta;
			} else {
				hsb.h = 4 + (rgb.r - rgb.g) / delta;
			}
		} else {
			hsb.h = -1;
		}
		hsb.h *= 60;
		if (hsb.h < 0) {
			hsb.h += 360;
		}
		hsb.s *= 100/255;
		hsb.b *= 100/255;
		return hsb;
	},
	HSBToRGB: function (hsb) {
		var rgb = {};
		var h = Math.round(hsb.h);
		var s = Math.round(hsb.s*255/100);
		var v = Math.round(hsb.b*255/100);
		if(s == 0) {
			rgb.r = rgb.g = rgb.b = v;
		} else {
			var t1 = v;
			var t2 = (255-s)*v/255;
			var t3 = (t1-t2)*(h%60)/60;
			if(h==360) h = 0;
			if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
			else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
			else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
			else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
			else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
			else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
			else {rgb.r=0; rgb.g=0;	rgb.b=0}
		}
		return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
	},
	RGBToHex: function (rgb) {
		var hex = [
			rgb.r.toString(16),
			rgb.g.toString(16),
			rgb.b.toString(16)
		];
		$.each(hex, function (nr, val) {
			if (val.length == 1) {
				hex[nr] = '0' + val;
			}
		});
		return hex.join('');
	},
	HSBToHex: function (hsb) {
		return this.RGBToHex(this.HSBToRGB(hsb));
	},

	showPicker: function() {
		if ($(this.element).data('colorpickerId')) {
			this._show();
		}
	},
	hidePicker: function() {
		var that = this;
		if ($(this).data('colorpickerId')) {
			this._hide();
		}
	},
	setColor: function(col) {
		if (typeof col == 'string') {
			col = this.HexToHSB(col);
		} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
			col = this.RGBToHSB(col);
		} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
			col = this.fixHSB(col);
		} else {
			return this;
		}
		if ($(this.element).data('colorpickerId')) {
			var cal = this.cal;
			cal.data('colorpicker').color = col;
			cal.data('colorpicker').origColor = col;
			this.fillRGBFields(col, cal.get(0));
			this.fillHSBFields(col, cal.get(0));
			this.fillHexFields(col, cal.get(0));
			this.setHue(col, cal.get(0));
			this.setSelector(col, cal.get(0));
			this.setCurrentColor(col, cal.get(0));
			this.setNewColor(col, cal.get(0));
		}
	}
});
// noDefinePart
} ) );