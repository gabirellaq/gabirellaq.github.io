( function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define( [
            "jquery",
            "./component"
        ], factory );
    } else {
        factory( jQuery, window, document );
    }
}( function( $, window, document, undefined ) {
//noDefinePart
/*jslint nomen: true */

/**
 * @fileOverview EasyEdit - A jQuery plugin for the input dom element of type text
 * @author Andres Jorquera
 * @version 0.2
 * @requires jQuery
 * @namespace easyInput.easyText
 * TODO Must set the new values if the storage option changes
 */

(function () {
    'use strict';
    
    var NAMESPACE = 'easyinput',
        PLUG_NAME = 'easytext',
        // constant use for events handlers to get the plugin instance using
        //$(this).data(NAME_SPAC_PLUG)
        NAME_SPAC_PLUG = NAMESPACE + PLUG_NAME.charAt(0).toUpperCase() + 
                         PLUG_NAME.slice(1);

    /**
     * Description of the plugin
     * 
     */

    $.component(NAMESPACE + '.' + PLUG_NAME, {

        options: {
            /**
             * The current value of the input element
             * @type String
             * @default ''
             */
            currentValue: '',

            /**
             * A custom array containing values for the input element
             * @type Array
             * @default []
             */
            values: [],

            /**
             * Max width in pixels for the input element.
             * @type Number
             * @default 200
             */
            maxWidth: 200,
            /**
             * Min width for the input element in pixels fo the input element.
             * @type number
             * @default 80
             */
            minWidth: 80,
            /**
             * Maximum number of characters permitted in the input.
             * @type number
             * @default 200
             */
            maxChars: 200,
            /**
             * Type of storage use for the input element.
             * @type string
             * @default 'array'
             */
            storage: 'array',
            /**
             * Configuration options for the ajax requests
             * @type object
             */
            ajaxConfig: {
                url: '/',
                id: '',
                UPDATETemplate: '',
                UPDATEData: {},
                GETCallback: null
            }
        },
        //---------------------------------------------------------------------
        //                          PRIVATE PROPERTIES
        //---------------------------------------------------------------------

        /**
         * Holder for the name of the plugin.
         * @type string
         * @private
         */
        _name: PLUG_NAME,
        /**
         * Holder for the input Jquery object.
         * @type Jquery object
         * @private
         */
        _input:null,
        /**
         * Holder for the id of the input.
         * @type string
         * @private
         */
        _id:null,
        /**
         * Holder for the current position of the current value in the
         * values attribute. It's use by the getNextBackValue public function
         * @type number
         * @private
         */
        _valuesIndex:null,
        /**
         * Holder for the class-name for the 'unChange'. Its the look of the
         * input when it hasn't been modified
         * @type String
         * @private
         */
        _classUnChanged:null,
        /**
         * Holder for the class-name for the 'empty'. The look of the input
         * when it's empty
         * @type String
         * @private
         */
        _classEmpty:null,
        /**
         * Holder for the class-name for the 'onEdit'.The look of the input
         * when it's been edited
         * @type String
         * @private
         */
        _classOnEdit: null,
        /**
         * Holder for the class-name for the "changed". The look of the input
         * when it's has been changed
         * @type String
         * @private
         */
        _classChanged:null,
        /**
         * Holder for the class-name of the input. It will be a class for the
         * input that has the plugin.
         * @type String
         * @private
         */
        _classEasyText:PLUG_NAME.toLowerCase(),

//-----------------------------------------------------------------------------
//                          PRIVATE FUNCTIONS
//-----------------------------------------------------------------------------
        /**
         * Add listeners to the input
         * @private
         */
        _setListeners:function() {
            this._input.bind({
                focus: this._focusBehaviour,
                input: this._autoGrownBehaviour,
                blur: this._blurBehaviour,
                storageChange: this._storageChange
            });
        },

        /**
         * Function that it's inspired in the getClassName function from the YUI
         * widget library.
         * reference: http://yuilibrary.com/yui/docs/api/files/widget_js_Widget.js.html#l309
         * FIXME re-think this function
         * @private
         */
        _getClassName: function(str) {
            return this._name.toLowerCase() + '-' + str;
        },
        /**
         * Sets the name for all the classes
         * @private
         */
        _setClassNames: function() {
            // set classes names
            this._classOnHover = this._getClassName('onHover');
            this._classUnChanged = this._getClassName('unChanged');
            this._classOnEdit = this._getClassName('onEdit');
            this._classChanged = this._getClassName('changed');
            this._classEmpty = this._getClassName('empty');

        },
        /**
         * Sets initial values for private variables
         * @private
         */
        _setVars: function() {
            var input = this.element;

            //save the host node to the private variable
            this._input = input;

            //creates an unique id in the element
            input.uniqueId();

            //saves the current position for the values attribute
            this._valuesIndex = 0;

            //sets the id
            this._id = this._name + '-' + input.attr('id');

            //set the maximum characters allow in the input
            input.attr('maxLength',this.options.maxChars);
        },
        /**
         * Creates a span element with the purpose for measuring the length in
         * pixels.
         * @private
         */
        _setRuler: function() {
            var rulerID    = '#' + this._name + '-ruler',
                ruler      = $(rulerID),
                input      = this._input;

            // check if a ruler already exist
            if (!ruler.length) {
                //NOTE maybe we shouldn't augment the string object
                String.prototype.visualLength = function() {
                    var ruler = $(rulerID);
                    //we need to escaped spaces
                    ruler.html(this.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;')
                          .replace(/</g, '&lt;').replace(/>/g, '&gt;'));

                    return ruler.width();
                };
                /* It will copy the same font family and size. Must be
                 * careful because if the font doesn't match it will not grown in the
                 * same way as the ruler
                 */
                ruler = $('<span id="' + rulerID.substr(1) + '"></span>');

                ruler.css({
                    fontSize:input.css('fontSize'),
                    fontFamily:input.css('font-family'),
                    fontWeight:input.css('fontWeight'),
                    position:'absolute',
                    visibility:'hidden',
                    //hides the ruler and breaks the text to avoid overflow
                    whiteSpace: 'nowrap'
                });
                $('body').after(ruler);
            }
        },
        /**
         * Prepares the configuration object for the ajax request. 
         * @private
         */
        _initializeAjax: function() {
            var ajaxConfig = this.options.ajaxConfig;
            
            //checks if there's a callback in the configuration object.
            //Do not send request if not
            if (!$.isFunction(ajaxConfig.GETCallback)) return;
            
            if (ajaxConfig.url.charAt(ajaxConfig.url.length - 1) !== '/') {
                ajaxConfig.url += '/'; 
            }
            
            if (!ajaxConfig.id) {
                ajaxConfig.id = this._id;
            }
            
            $.ajax({
                url:ajaxConfig.url + ajaxConfig.id,
                succes:ajaxConfig.GETCallback
            });
        },
        /**
         * Checks and sets the state for the input element 
         * @private
         */
        _setState:function() {
            var input         = this._input,
                text          = input.val(),
                visualLenText = text.visualLength(),
                minWidth      = this.options.minWidth,
                maxWidth      = this.options.maxWidth,
                width;

            if (visualLenText < minWidth) {
                width = minWidth;
            } else if (maxWidth < visualLenText) {
                width = maxWidth;
            } else {
                width = visualLenText;
            }

            input.width(width);

            //set the appropriate classes
            if (input.val().length === 0){
                //TODO do it in one call
                input.removeClass(this._classChanged);
                input.addClass(this._classEmpty);
            } else {
                input.addClass(this._classChanged);
            }
        },

        /**
         * Set the behaviour when the input gets clicked
         * @private
         */
        _focusBehaviour: function() {
            var that = $(this).data(NAME_SPAC_PLUG),
                input = that._input;

            input.removeClass(that._classChanged + ' ' +
                              that._classUnChanged + ' ' +
                              that._classEmpty)
                 .addClass(that._classOnEdit);
        },
        
        /**
         * Function that controls the auto-grown behaviour of the input 
         * @private
         */
        _autoGrownBehaviour: function() {
            var that     = $(this).data(NAME_SPAC_PLUG),
                input    = that._input,
                text     = input.val(),
                minWidth = that.options.minWidth,
                maxWidth = that.options.maxWidth,
                width    = text.visualLength();
                
            if (width < minWidth) {
                width = minWidth;
            } else if (width > maxWidth) {
                width = maxWidth;
            } 

            input.width(width);   
        },
        /**
         * Function that is trigger when the input loses focus. 
         * @private 
         */
        _blurBehaviour: function(){
            var that = $(this).data(NAME_SPAC_PLUG),
                input = that._input,
                value = input.val(),
                ajaxConfig = that.options.ajaxConfig,
                UPDATETemplate;

            input.removeClass(that._classOnEdit);

            //check if the field if empty. Don't store values if it is
            if (value.length === 0) {
                input.addClass(that._classEmpty);

            } else {
                
                input.addClass(that._classChanged);
                that.option('values',value);

                //TODO check this, not sure if it is the best way to do it
                that._valuesIndex = that.option('values').length - 1;

                //ajax feature
                if (that.options.storage === 'ajax') {
                    ajaxConfig.UPDATEData.value = input.val();

                    $.ajax({
                        url: ajaxConfig.url + ajaxConfig.id,
                        data: that._tmpl(ajaxConfig.UPDATETemplate,
                                         ajaxConfig.UPDATEData),
                        type: 'UPDATE'
                    });
                }
            }
            that._setState();
        },

        /**
         * Simple JavaScript Templating
         * John Resig - http://ejohn.org/ - MIT Licensed
         * ref:http://ejohn.org/blog/javascript-micro-templating/
         * @private
         */
        _tmpl : function(str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = typeof(str) !== 'string' ?
               (function(){throw {
                   name: 'Invalid Parameter',
                   message: 'You must insert a string into the function'
               }}()):
             
              // Generate a reusable function that will serve as a template
              // generator (and which will be cached).
              new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
               
                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +
               
                // Convert the template into pure JavaScript
                str
                  .replace(/[\r\t\n]/g, " ")
                  .split("<%").join("\t")
                  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                  .replace(/\t=(.*?)%>/g, "',$1,'")
                  .split("\t").join("');")
                  .split("%>").join("p.push('")
                  .split("\r").join("\\'")
              + "');}return p.join('');");
           
            // Provide some basic currying to the user
            return data ? fn( data ) : fn;
        },
        /**
         * Setter function for the options of the plugin
         * @param {string} key - key string for the option value
         * @param {string} value - value for the option 
         * @private
         */
        _setOption: function(key, value) {
            var options = this.options;

            switch (key) {

            case 'values':
                //adds a new value to the array
                options.values.push(value);

                //saves the value on the local storage if it applies.
                //Add instead of replace. 
                if (options.storage === 'localStorage') {
                    localStorage.setItem(this._id,JSON.stringify(options.values));
                }

                return;
            case 'currentValue':
                this.option('values',value);
                this._input.val(value);
                break;
            }
            this._super("_setOption", key, value);

        },
        /**
         * Function that automatically runs the first time the plugin is 
         * instantiated. 
         * @private
         */
        _create: function () {
            var values,
                input,
                storage = this.options.storage;

            this._setClassNames();
            this._setVars();
            this._setListeners();


            input = this._input;
            //TODO re-think this
            input.addClass(this._classEasyText);

            //check the type of storage
            if (storage === 'localStorage') {

                //Check if there's some initial value in the localStorage
                if (localStorage[this._id]) {
                    values = JSON.parse(localStorage[this._id]);
                    this.options.values = values;

                    input.val(values[values.length - 1]);
                    this._valuesIndex = values.length - 1;
                }

            //ajax feature. Sends a GET request to the the web service.
            //TODO Not sure of this. With server side scripting we can write the
            //     values on the input.
            } else if (storage === 'ajax') {
                this._initializeAjax();
            }

            //create a ruler to measure the text in pixels
            this._setRuler();
            this._setState();
        },
        /**
         * Destroy an instantiated plugin and clean up
         * @private
         */
        _destroy: function () {
            //removes any classes
            this._input.attr('class','');
            //$.Widget.prototype.destroy.call(this);
        },
        
        /**
         * Deletes the storage for all the values. 
         * @public
         */
        deleteStorage: function() {
            var ajaxConfig = this.options.ajaxConfig,
                typeStorage = this.options.storage;

            if (typeStorage === 'localStorage') {
                localStorage.removeItem(this._id);

            } else if (typeStorage === 'ajax') {
                $.ajax({
                    url: ajaxConfig.url + ajaxConfig.id,
                    type: 'DELETE'
                });
            }

            this.options.values = [];
            this._input.val('');
            this._setState();
        },
        /**
         * Get the value store before or after the current value.
         * @param {boolean} direction - Flag use to set the direction of the
         *                              searched value. True is next value
         *                              and false is the previous value.
         * @public
         */
        getNextBackValue:function(direction) {
            var values = this.option('values'),
                index = this._valuesIndex;

            if (direction === undefined) {
                direction = true;
            }

            //check valid direction
            if (typeof(direction) !== 'boolean') {
                throw new Error('Invalid parameter');
            }

            //check if next or back
            index += direction ? 1 : (-1);

            //check if we are in one extreme
            if (values[index] === undefined) return -1;

            this._valuesIndex = index;
            this._input.val(values[index]);
            
            this._setState();
            
            return values[index];    
        }
    });
})();
// noDefinePart
} ) );