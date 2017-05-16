( function( factory ) {
if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./tooltip"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
// noDefinePart
$(function(){
	$( document ).tooltip({
		items: "[data-errors]",
		content: function() {
			var element = $( this );
		    if ( element.is( "[data-errors]" ) ) {
		    	return element.attr( "data-errors" );
		    }
		},
		show: {
	    	effect: "fadeIn",
	        delay: 300
	    },
	    tooltipClass : "coral-state-error",
	    hide: { effect: "fadeOut", delay: 0 },
		position: {
			my: "left top",
	        at: "left bottom+5"/*,
			using: function( position, feedback ) {
				$( this ).css( position );
				$( "<div>" )
					.addClass( "coral-state-error" )
					.addClass( feedback.vertical )
					.addClass( feedback.horizontal )
					.appendTo( this );
			}*/
		}
	});
});
//$.datepicker.valueType="long";
//$.validate.validTypeOptions.maxlength.restrictInput = true;
//$.fn['datepicker'].defaults = {
//	minDate: "2015/8/7", //最小的可选日期，为null则无限制
//	maxDate: "2015-09-01"// 最大的可选日期，为null则无限制
//};
// noDefinePart
} ) );