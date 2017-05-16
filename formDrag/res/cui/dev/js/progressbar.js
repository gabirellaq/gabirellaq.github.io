( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component",
			"./formelement"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/*!
 * 组件库4.0.1：进度条
 *
 * 依赖JS文件:
 *   jquery.coral.code.js
 *   jquery.coral.component.js
 */
$.component( "coral.progressbar", {
	version: "4.0.1",
	options: {
		id: null,
		name: null,
		max: 100,
		value: 0,
		text: "{value}%",

		onChange: null,
		onComplete: null
	},

	min: 0,

	_create: function() {
		this.oldValue = this.options.value = this._constrainedValue();

		this.element
			.addClass( "coral-progressbar coral-component coral-corner-all" );

		this.valueDiv = $( "<div class=\"coral-progressbar-value coral-corner-left\"></div>" )
			.appendTo( this.element );
		this.textDiv = $("<div class=\"coral-progressbar-text\"></div>").appendTo(this.valueDiv);
		// 进度条宽度
		this.valueWidth = this.element.width() - (this.valueDiv.outerWidth(true) - this.valueDiv.outerWidth());

		this._refreshValue();
	},

	_destroy: function() {
		this.element
			.removeClass( "coral-progressbar coral-component coral-component-content coral-corner-all" );

		this.valueDiv.remove();
	},

	value: function( newValue ) {
		if ( newValue === undefined ) {
			return this.options.value;
		}

		this.options.value = this._constrainedValue( newValue );
		this._refreshValue();
	},

	_constrainedValue: function( newValue ) {
		if ( newValue === undefined ) {
			newValue = this.options.value;
		}

		this.indeterminate = newValue === false;

		if ( typeof newValue !== "number" ) {
			newValue = 0;
		}
		return (this.indeterminate ? false :
			Math.min( this.options.max, Math.max( this.min, newValue ) ));
	},

	_setOptions: function( options ) {
		var value = options.value;
		delete options.value;

		this._super( options );

		this.options.value = this._constrainedValue( value );
		this._refreshValue();
	},

	_setOption: function( key, value ) {
		if ( key === "max" ) {
			value = Math.max( this.min, value );
		}
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "coral-state-disabled", !!value )
				.attr( "aria-disabled", value );
		}
		this._super( key, value );
	},

	_percentage: function() {
		return this.indeterminate ? 100 : 100 * ( this.options.value - this.min ) / ( this.options.max - this.min );
	},

	_refreshValue: function() {
		var value = this.options.value,
			percentage = this._percentage().toFixed(0),
			text = this.options.text.replace(/{value}/, percentage),
			left = 0, top = 0;

		this.valueDiv
			.toggle( this.indeterminate || value > this.min )
			.toggleClass( "coral-corner-right", value === this.options.max )
			.width(this.valueWidth * percentage / 100);
		
		if (100 == percentage) this.valueDiv.width("auto");
		
		this.textDiv.html(text);
		
		
		left = (this.element.position().left + (this.element.outerWidth()  - this.textDiv.outerWidth()) / 2);
		top  = (this.element.position().top  + (this.element.outerHeight() - this.textDiv.outerHeight())/2);
		
		this.textDiv.position({
			of: this.element,
			my: left + " " + top,
			at: left + " " + top 
		});

		this.element.toggleClass( "coral-progressbar-indeterminate", this.indeterminate );

		if ( this.indeterminate ) {
			if ( !this.overlayDiv ) {
				this.overlayDiv = $( "<div class='coral-progressbar-overlay'></div>" ).appendTo( this.valueDiv );
			}
		} else {
			if ( this.overlayDiv ) {
				this.overlayDiv.remove();
				this.overlayDiv = null;
			}
		}

		if ( this.oldValue !== value ) {
			this.oldValue = value;
			this._trigger( "onChange", null, {value: value, oldValue: this.oldValue});
		}
		if ( value === this.options.max ) {
			this._trigger( "onComplete" );
		}
	}
});
// noDefinePart
} ) );