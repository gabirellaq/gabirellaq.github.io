( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./component"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.view", {
	version: "@version",
	options: {
		controllerName: null,
		heightStyle: "auto"
	},
	
	_create: function(e, ui) {
		var that = this;
		var options = this.options;
		this.element.addClass( "coral-view coral-helper-reset" );
		$.controller(this.options.controllerName, {
			view: this.element,
			controllerName: this.options.controllerName
		});
		var c = $.controller(that.options.controllerName);
		$.parseDone({
			fun: c.onInit,
			context: c,
			args: [e, ui]
		});
		this._refresh();
	},
	_destroy: function() {
	},
	_setOption: function(key, value) {
		this._super( key, value );
	},
	refresh: function() {
		this._refresh();
	},
	_refresh: function() {
		$.coral.refreshChild(this.element);
	}
});
// noDefinePart
} ) );