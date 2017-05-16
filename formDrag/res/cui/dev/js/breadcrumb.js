( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
/**
 * menu 里面有一个breadcrumb，需要结合menu进行拓展
 */

$(".breadcrumb>li+li").prepend("<span class='splitline'>/ </span>");
// noDefinePart
} ) );