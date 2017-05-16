( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./core",
			"./formelement"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart

function spinner_modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "onChange" );
		}
	};
}

var spinner = $.component( "coral.spinner", $.coral.formelement, {
	version: "4.0.3",
	castProperties : ["triggers"],
	defaultElement: "<input>",
	componentEventPrefix: "spin",
	options: {
		culture: null,
		icons: {
			down: "cui-icon-arrow-down3",
			up: "cui-icon-arrow-up3"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		onChange: null,
		onSpin: null,
		onStart: null,
		onStop: null,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false // true 则不单独校验
	},

	_create: function() {
		if (typeof this.element.attr("id") != "undefined") {
    		this.options.id = this.element.attr("id");
    	} else if (this.options.id) {
    		this.element.attr("id", this.options.id);
    	}
		if (typeof this.element.attr("name") != "undefined") {
    		this.options.name = this.element.attr("name");
    	} else if (this.options.name) {
    		this.element.attr("name", this.options.name);
    	}
		if (typeof this.element.attr("value") != "undefined") {
    		this.options.value = this.element.attr("value");
    	}
		
		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );
		
		// Only format if there is a value, prevents the field from being marked
		// as invalid in Firefox, see #9573.
		if ( this.value() !== "" ) {
			// Format the value, but don't constrain.
			this._value( this.element.val(), true );
		}
		if ($.trim(this.element.val()) !== "") {
    		this.options.value = this.element.text();
    	} else if (this.options.value) {
    		this.element.val( this.options.value );
    	}
		this.originalValue = this.getValue();
		this._draw();
		this._on( this._events );
		this._refresh();

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the component is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		"mouseenter.coral-textbox-border": function( event ) {
			if ( typeof this.options.isLabel == "boolean" && this.options.isLabel ) { 
				return;
			}
			if ( typeof this.options.readonly == "boolean" && this.options.readonly ) { 
				return;
			}
			
			this.component().addClass("coral-textbox-hover");
			this._trigger( "onMouseEnter", event, [] );
		},
		"mouseleave.coral-textbox-border": function( event ) {
			if ( typeof this.options.isLabel == "boolean" && this.options.isLabel ) { 
				return;
			}
			if ( typeof this.options.readonly == "boolean" && this.options.readonly  ) { 
				return;
			}	
			
			this.component().removeClass( "coral-textbox-hover" );	
			this._trigger( "onMouseLeave", event, [] );
		},
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			var val,newVal;
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}
			this._stop();
			this._refresh();
			val = this._parse(this.element.val());
			if(isNaN(val)){
				val = 0;
			}
			newVal = this._restrictMinMax(val);
			this.setValue(newVal);
			if ( this.previous !== this.element.val() ) {
				this._trigger( "onChange", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( (delta > 0 ? 1 : -1) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .coral-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "coral-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .coral-spinner-button": "_stop",
		"mouseenter .coral-spinner-button": function( event ) {
			// button will add coral-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "coral-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "coral-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .coral-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "coral-spinner-input coral-textbox-default" )
			.attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._buttonHtml() );

		this.element.attr( "role", "spinbutton" );
		if (this.options.vertical) {
			this.component().addClass("spinner-vertical");
		}
		// button bindings
		this.buttons = uiSpinner.find( ".coral-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "coral-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if (!this.options.vertical) {
			if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
					uiSpinner.height() > 0 ) {
				uiSpinner.height( uiSpinner.height() );
			}
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.coral.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='coral-spinner coral-textbox coral-component'><span class='coral-textbox-border coral-corner-all'></span></span>";
	},

	_buttonHtml: function() {
		return "" +
			"<a class='coral-spinner-button coral-spinner-up coral-corner-tr'>" +
				"<span class='icon " + this.options.icons.up + "'></span>" +
			"</a>" +
			"<a class='coral-spinner-button coral-spinner-down coral-corner-br'>" +
				"<span class='icon " + this.options.icons.down + "'></span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "onStart", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "onSpin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;
		// - round to the nearest step
		aboveMin = Math.round(aboveMin / options.step) * options.step;
		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// clamp the value
		if ( options.max !== null && value > options.max) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "onStop", event );
	},
	_restrictMinMax: function(val){
		var min = this.options.min,
			max = this.options.max;
		var newVal = (min && val < min ? min : val);
		return (max && newVal > max ? max : newVal);
	},
	_setOption: function( key, value ) {
		if ( key === "value" ) {
			if ( typeof value !== "undefined" ) {
				this.value( value );
			} else {
				this.value( );
			}
		}
		
		if ( key === "culture" || key === "numberFormat" ) {
			var prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}
		if ( key === "icons" ) {
			this.buttons.first().find( ".coral-icon" )
				.removeClass( this.options.icons.up )
				.addClass( value.up );
			this.buttons.last().find( ".coral-icon" )
				.removeClass( this.options.icons.down )
				.addClass( value.down );
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this.component().toggleClass( "coral-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			this.buttons.button( value ? "disable" : "enable" );
		}
	},

	_setOptions: spinner_modifier(function( options ) {
		this._super( options );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr({
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,
			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		});
	},

	isValid: function() {
		var value = this.value();

		// null is invalid
		if ( value === null ) {
			return false;
		}

		// if value gets adjusted, it's invalid
		return value === this._adjustValue( value );
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.removeClass( "coral-spinner-input" )
			.removeClass("coral-textbox-default")
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );
		this.component().replaceWith( this.element );
	},
	reset: function(){
		this.setValue(this.originalValue);
	},
	stepUp: spinner_modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * this.options.step );
			this._stop();
		}
	},

	stepDown: spinner_modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * -this.options.step );
			this._stop();
		}
	},

	pageUp: spinner_modifier(function( pages ) {
		this._stepUp( (pages || 1) * this.options.page );
	}),

	pageDown: spinner_modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),
	setValue: function( newVal ) {
		if (newVal == 0) {
			newVal = 0
		}else {
			newVal = newVal || "";
		}
		this.value( newVal );
	},
	getValue: function( newVal ) {
		return this.value()+"";
	},
	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		spinner_modifier( this._value ).call( this, newVal );
	},

	component: function() {
		return this.uiSpinner.parent();
	}
});
// noDefinePart
} ) );