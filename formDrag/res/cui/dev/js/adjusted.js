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
$.component("coral.adjusted", {
	_create: function() {
		this.element.addClass("ctrl-fit-element coral-scroll")
			.removeClass("coral-adjusted");
		if (this.element.hasClass("fill")) {
			this.element.removeClass("fill").addClass("coral-fill");
		}
	},
	refresh: function() {
		var maxHeight,
			$element = this.element,
			parent = $element.parent();
			
		maxHeight = parent.height();
		$element.siblings( ":visible" ).each(function() {
			var elem = $( this ),
			position = elem.css( "position" );
			
			if ( position === "absolute" || position === "fixed" ) {
				return;
			}
			maxHeight -= elem.outerHeight( true );
		});
		$element.height( Math.max( 0, maxHeight - $element.innerHeight() + $element.height() ) )
		.addClass("coral-scroll");
		$.coral.refreshChild(this.element);
		$.coral.fitParent(parent, true);
	}
});
// noDefinePart
} ) );