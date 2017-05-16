( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./inputbase",
            "./easytext"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.autocomplete", $.coral.inputbase,{
	version: "4.0.2",
	defaultElement: "<input>",
	castProperties : ["source","pageData","buttons","title","rootNode", "triggers","showRequiredMark","shortCut","hideRequiredMark","itemattr", "onValidSuccess", "onValidError"],
	options: {
		appendTo: "body",//如果放在dialog里面，会把dialog撑开。
		autoFocus: false,
		allowRepeat: false,
		asyncType: "post",
		delay: 300,
		scrollTimeOut:100,
		maxLabelWidth : "auto" ,
		pageData:[],
		multiLineLabel: false,
		minLength: 0,
		minHeight: 1,
		panelComponentCls: null,
		panelWidth: null,
		height: "auto",
		multiple : false,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		value: "",
		text: "",
		forceSelection: false,
		defaultValue: "", // value separator text
		postMode:"value", // value, text, value-text
		required: false,
		showStar: true,
		separator: ",",
		labelCls:"",
		buttons: [],
		rowNum: 100,
		title:null,
		errMsg: null,
		errMsgPosition: "leftBottom",
		panelHeight:"auto",
		placeholder: "",
		maxPanelHeight: 200,
		iframePanel : false,
		isLabel: false,
		source: null,
		valueField: "value",
		textField: "label",
		searchField:"valueField",
		// callbacks
		onValidSuccess: null,
		onValidError: null,
		onChange: null,
		onBlur: null,
		onClose: null,
		onFocus: null,
		onOpen: null,
		oncancel:null,
		onResponse: null,
		onSearch: null,
		onSelect: null,
		triggers: null, // 覆盖 validate 里的 triggers
		excluded: false // true 则不单独校验
	},
	requestIndex: 0,
	pending: 0,
	_create: function() {
		var that = this;
		this._prepareInit();
		this._initAutocomplete();
		this._initState();
		this._initSource();
		this._initData();
		this._bindEvent();
		this._setDefaultValue();
		this._setDefaultText();
		this.liveRegion = $( "<span>", {
				role: "status",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			})
			.addClass( "coral-helper-hidden-accessible" )
			.appendTo( this.document[ 0 ].body );

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the component is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
		if ( this.options.multiLineLabel ) {
			// TODO: 销毁的时候应该考虑easytext组件的销毁情况，待测试
			$( this.element ).easytext({
				minWidth:10,
				maxWidth:200,
				maxChars:60
			});
			// Clicks outside of a treePanel move the input element to the end
			this._on( this.document, {
				click: function( event ) {
					if ( this.options.readonly || this.options.isLabel ) return;
					this._moveInput( "last", event );
				}
			
			});
		}
	},
	_prepareInit: function(){
		this.lastSelectedItem = {};
		this.selectedItems = [];
		
		this.isNewMenu = true;
	},
	_initAutocomplete: function(){
		var autocompleteCls = this.options.render == "tree"?"coral-autocompletetree":"coral-autocomplete";
		this.className = "coral-autocomplete-text coral-combo-default coral-textbox-default tabbable "+this.element[0].className;
		this.classBorder = "";
		this.hiddenClass = "";
		if ( this.options.iframePanel ){
			   this.iframePanel = $("<iframe class='coral-autocomplete-iframePanel' style='position:absolute;display:none;'></iframe>" ).appendTo( "body" );
		}
		if ( this.options.multiLineLabel ) {
			var that = this, nodeName = this.element[ 0 ].nodeName.toLowerCase(),
				isTextarea = nodeName === "textarea",
				isInput = nodeName === "input";
			this.ismultiLineLabel =
				// Textareas are always multi-line
				isTextarea ? true :
				// Inputs are always single-line, even if inside a contentEditable element
				// IE also treats inputs as contentEditable
				isInput ? false :
				// All other element types are determined by whether or not they're contentEditable
				this.element.prop( "isContentEditable" );
			
			this.compClass = autocompleteCls + " coral-textboxlist coral-textbox";
			
			this.createInput();
			
			this.valuebox = $(this.textboxWrapper.lastChild);
			this.textboxWrapper = $(this.textboxWrapper);
			this.elementBorder = $(this.elementBorder);
			this.element = $(this.textboxInput);
			
			this.elementBorder.css({
				minHeight: this.options.minHeight  + "px",
				height: this.options.height,
				overflow: "auto"
			})
			
			this.valueMethod = this.valuebox[ isTextarea || isInput ? "val" : "text" ];
			this.textMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
			this.textboxlistUl = $( "<ul class='coral-textboxlist-ul'><li class='coral-textboxlist-inputLi'></li></ul>" );
			this.textboxlistUl.appendTo( this.elementBorder );
			this.element.appendTo( this.textboxlistUl.find( ".coral-textboxlist-inputLi" ) );
			if ( this.options.buttons.length > 0 ) {
				this._createButtonPanel();
			}
			// 初始化id，name，value
			if ( typeof this.element.attr("id") != "undefined" ) {
	    		this.options.id = this.element.attr("id");
	    	} else if ( this.options.id ){
	    		this.element.attr("id", this.options.id);
	    	}
			if ( typeof this.element.attr( "name" ) != "undefined" ) {
	    		this.options.name = this.element.attr( "name" ); // name属性加到hidden元素上
	    		this.valuebox.attr( "name", this.options.name );
	    		this.element.removeAttr( "name" );
	    	} else if ( this.options.name ) {
	    		this.valuebox.attr( "name", this.options.name );
	    	}
			
			if ( this.options.text ) {
				this.setText( this.options.text );
			}
			if ( $.trim( this.valuebox.val() ) != "" ) {
	    		this.options.value = this.valuebox.val();
	    	}
			if ( this.options.showPopup ) {
				
			}
		} else {
			var nodeName = this.element[ 0 ].nodeName.toLowerCase(),
				isTextarea = nodeName === "textarea",
				isInput = nodeName === "input";
			this.ismultiLineLabel =
				// Textareas are always multi-line
				isTextarea ? true :
				// Inputs are always single-line, even if inside a contentEditable element
				// IE also treats inputs as contentEditable
				isInput ? false :
				// All other element types are determined by whether or not they're contentEditable
				this.element.prop( "isContentEditable" );
			
			this.compClass = autocompleteCls + " coral-textbox";
			this.createInput();
			this.valuebox = $(this.textboxWrapper.lastChild);
			this.elementBorder = $(this.elementBorder);
			this.textboxWrapper = $(this.textboxWrapper);
			this.element = $(this.textboxInput);
			
			
			this.textboxWrapper.css({
				"border-width":"0"
			})
			
			this.elementBorder.css({
				minHeight: this.options.minHeight  + "px"
			})
			// 下拉框显示值文本框
			this.valueMethod = this.valuebox[ isTextarea || isInput ? "val" : "text" ];
			this.textMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
			
			if ( this.options.buttons.length > 0 ) {
				this._createButtonPanel();
			}
			// 初始化id，name，value
			if ( typeof this.element.attr("id") != "undefined" ) {
	    		this.options.id = this.element.attr("id");
	    	} else if ( this.options.id ){
	    		this.element.attr("id", this.options.id);
	    	}
			if ( typeof this.element.attr( "name" ) != "undefined" ) {
	    		this.options.name = this.element.attr( "name" ); // name属性加到hidden元素上
	    		this.valuebox.attr( "name", this.options.name );
	    		this.element.removeAttr( "name" );
	    	} else if ( this.options.name ) {
	    		this.valuebox.attr( "name", this.options.name );
	    	}
			this.element.attr( "placeholder", this.options.placeholder );
			if ( this.options.placeholder && "" === this.element.val() ) {
				this._showPlaceholder();
			}
			if ( this.options.text ) {
				this.setText( this.options.text );
			}
			if ( $.trim( this.valuebox.val() ) != "" ) {
	    		this.options.value = this.valuebox.val();
	    	}
		}
		if ( this.options.showClose ) {
			this.clearIcon.css( "right", this.rightPos ? this.rightPos: 0);
		}
	},
	_initState: function(){
		if( this.element.prop("readonly") || this.options.readonly ){
    		this.options.readonly = true;
    		this.valuebox.prop( "readonly", true );
    		this.element.prop( "readonly", true );
    		this.element.removeClass("tabbable");
    		this.component().addClass("coral-readonly");
    	}
		if ( this.options.isLabel ) {
			this.element.prop( "readonly", true );
			this.valuebox.prop( "readonly", true );
			this.element.removeClass("tabbable");
			this.component().addClass( "coral-isLabel" );
		}
	},
	reset : function() {
		this.setValue(this.originalValue);
	},
	/**
	 * 显示 placeholder
	 */
	_showPlaceholder: function () {
		if ( $.support.placeholder && !this.options.multiLineLabel) {
			return ;
		}
		var that = this,
			$placeholder = $("<span class='coral-textbox-placeholder-label'>" + that.options.placeholder  + "</span>");
		$(that.element).after( $placeholder );
	},
	/**
	 * 隐藏 placeholder
	 */
	_hidePlaceholder: function () {
		if ( $.support.placeholder && !this.options.multiLineLabel) {
			return ;
		}
		
		var that  = this;

		that.textboxWrapper.find( ".coral-textbox-placeholder-label" ).remove();
	},
	_bindEvent: function(){
		// Some browsers only repeat  events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var that = this, 
			suppressKeyPress, suppressKeyPressRepeat, suppressInput;
		this._on({
			"mouseenter.coral-textbox-border" : function(e) {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				that.textboxWrapper.addClass("coral-textbox-hover");
			},
			"mouseleave.coral-textbox-border" : function(e) {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				that.textboxWrapper.removeClass("coral-textbox-hover");
			},
			"click.coral-input-clearIcon" : function(e) {
				this.setValue( "", true );
				// 清空后如果有placeholder则显示 @added by@lhb at @20150417 : placeholder
				if (this.options.placeholder) {
					this._showPlaceholder();
				}
			},
			keyup: function( event ) {
				if ( this.options.readonly || this.options.isLabel ) return;
				this._trigger( "onKeyUp", event, { } );
			},
			keydown: function( event ) {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.coral.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					if ( this.options.render == "tree" ) {
						break;
					}
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					if ( this.options.render == "tree" ) {
						break;
					}
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.LEFT:
					suppressKeyPress = true;
					this._moveItem( "left", event );
					break;
				case keyCode.RIGHT:
					suppressKeyPress = true;
					this._moveItem( "right", event );
					break;
				case keyCode.UP:
					if ( this.options.render == "tree" ) {
						break;
					}
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					if ( this.options.render == "tree" ) {
						break;
					}
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:
					// when menu is open and has focus
					if ( this.menu.active ) {
						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						if ( !this.ismultiLineLabel ) {
							// ??
							this.setValue( this.term, true );
						}
						this.close( event );
						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;
					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
				//this._change( event );
				var options = this.options;
				if(options.shortCut){
					$.coral.callFunction(options.shortCut,event,this);
				}
				this._trigger( "onKeyDown", event, { } );
			},
			keypress: function( event ) {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.ismultiLineLabel || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}
				if ( this.options.render == "tree" ) {
					return;
				}				
				// replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.coral.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				default:
					break;
				}
			},
			input: function( event ) {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				this.selectedItem = null;
				this.previous = this.getValue();
				this.component().addClass( "coral-state-focus" );
				this._hidePlaceholder();
			},
			blur: function( event ) {
				this.component().removeClass( "coral-state-focus" );
				if ( that.options.disabled || that.options.isLabel || that.options.readonly ) { return; }
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}
				clearTimeout( this.searching );
				this.close( event );
				// 非multiLineLabel不需要额外校验
				if ( !this.options.multiLineLabel ) {
					if ( this.options.multiple ) {
						
					} else {
						// 20150121 : value 无值时设置为输入值，text为空时，value也设置为空。
						if ( !this.options.forceSelection ) {
							if ( this.lastSelectedItem[this.options.textField] != this.element.val() ) {
								this.setValue( this.element.val(), true );
							}
						} else {
							// TODO: 检查输入的值是否是建议列表里面的值，如果不是则清空输入框和隐藏域
							// 如果是url
							// 如果是数组
							/*if ( !this.lastSelectedItem 
									|| this.getText() !== this.lastSelectedItem[this.options.textField] ) {
								this.setValue( "", true );
							}*/
							if ( this.options.render == "tree" ){
								
							}else{
								var grepArr = $.grep( this.responseItems, function( value0 ) {
									return value0[that.options.textField] == that.element.val();
								});
								if ( !grepArr.length ){
									this.setValue( "", true );
								} else {
									this.setValue( grepArr[0][that.options.valueField], true );
								}
							}
						}
					}
				}
				if ( "" === this.getValue() ) {
					this._showPlaceholder();
				}
				this._trigger( "onBlur", event, { item: this.selectedItem } );
			}
		});
		this._on( this.menu.element, {
			scroll : function(e){
				var that = this
				    viewH =this.menu.element.height(),
			    	contentH =this.menu.element[0].scrollHeight,
			    	scrollTop =this.menu.element.scrollTop();
				if(contentH - viewH - scrollTop <= 15){
					if(this.renderNumber<this.options.pageData.length){
						if(that.scrollTimer){clearTimeout(that.scrollTimer)};
						that.scrollTimer = setTimeout(function(){
							that._renderMenu(that.menu.element,that.options.pageData[that.renderNumber])
							that.menu.refresh();
							that.renderNumber++;
						}, that.options.scrollTimeout);
					}
				}
			},
			mousedown: function( event ) {
				if ( this.options.readonly || this.options.isLabel ) return;
				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay(function() {
					delete this.cancelBlur;
				});

				// clicking on the scrollbar causes focus to shift to the body
				// but we can't detect a mouseup or a click immediately afterward
				// so we have to track the next mousedown and close the menu if
				// the user clicks somewhere outside of the autocomplete
				var menuElement = this.menu.element[ 0 ];
				if ( !$( event.target ).closest( ".coral-menu-item" ).length ) {
					this._delay(function() {
						var that = this;
						this.document.one( "mousedown", function( event ) {
							if ( event.target !== that.element[ 0 ] &&
									event.target !== menuElement &&
									!$.contains( menuElement, event.target ) ) {
								that.close();
							}
						});
					});
				}
			},
			menuonfocus: function( event, ui ) {
				if ( this.options.readonly || this.options.isLabel ) return;
				var label, item;
				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						});

						return;
					}
				}

				//item = ui.item.data( "coral-autocomplete-item" );
				item = this.options.tempData[ui.item.data( "key" )];
				if ( false !== this._trigger( "onFocus", event, { item: item } ) ) {
					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						/*if (this.options.postMode=="value") {
							this.setValue( item[this.options.valueField] );
						} else if (this.options.postMode=="text") {
							this.setValue( item[this.options.textField] );
						} else if (this.options.postMode=="value-text") {
							this.setValue( item[this.options.valueField] + "-"+ item[this.options.textField] );
						}*/
						// this._value( item[this.options.valueField] );
						//this._text( item[this.options.textField] );
					}
				}

				// Announce the value in the liveRegion
				label = ui.item.attr( "aria-label" ) || item[this.options.valueField] ;
				if ( label && $.trim( label ).length ) {
					this.liveRegion.children().hide();
					$( "<div>" ).text( label ).appendTo( this.liveRegion );
				}
			},
			menuonselect: function( event, ui ) {
				if ( this.options.readonly || this.options.isLabel ) return;
				//var item = ui.item.data( "coral-autocomplete-item" ),
				var item = this.options.tempData[ui.item.data( "key" )],
					previous = this.previous;

				// only trigger when focus was lost (click on menu)
				if ( this.element[ 0 ] !== this.document[ 0 ].activeElement ) {
					this.element.focus();
					this.previous = previous;
					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay(function() {
						this.previous = previous;
						this.selectedItem = item;
						that.lastSelectedItem = item;
					});
				}
				that.lastSelectedItem = item;
				this.selectedItem = item;
				//setValue()和setText(),先将原有的值删去，再加上选择的值
				if ( false !== this._trigger( "onSelect", event, { item: item } ) ) {
						//var item = ui.item.data( "coral-autocomplete-item" );
						var item = this.options.tempData[ui.item.data( "key" )];
						valueField = item[this.options.valueField];
						textField = item[this.options.textField];
						var value = that.getValue(),
						text = that.getText(),
						vv = value==""?[]:value.split(this.options.separator),
						vt = text==""?[]:text.split(this.options.separator);
						if ( that.options.multiple ) {
							if (this.options.postMode=="value") {
								if ( !this.options.allowRepeat && $.inArray(valueField, vv) > -1 ) {
									return ;
								}
								vv.push( valueField );
								vt.push( textField );
								this.setText(vt.join(this.options.separator));
								this.setValue(vv.join(this.options.separator), true);
							} 
							if (this.options.postMode=="text") {
								if ( !this.options.allowRepeat && $.inArray(textField, vt) > -1 ) {
									return ;
								}
								vt.push( textField );
								that.setValue(vt.join(this.options.separator), true );
							} 
							if (this.options.postMode=="value-text") {
								if ( !this.options.allowRepeat && $.inArray(valueField + "-"+textField, vv + "-" + vt) > -1 ) {
									return ;
								}
								vv.push( valueField );
								vt.push( textField );
								this.setValue(vv.join(this.options.separator) + "-"+ vt.join(this.options.separator), true );
							}
						} else{
							if (this.options.postMode=="value") {
								this.setText(item[this.options.textField], true );
								this.setValue(item[this.options.valueField], true );
							} 
							if (this.options.postMode=="text") {
								this.setValue(item[this.options.textField], true );
							} 
							if (this.options.postMode=="value-text") {
								this.setValue(item[this.options.valueField] + "-"+ item[this.options.textField], true );
							}
						}
				}
				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this.getText();
				this.close( event );
			}
		});
		if ( this.options.multiLineLabel ) {
			this._on( {
				"click .coral-label-close" : function( e ){
					if ( this.options.readonly || this.options.isLabel ) return;
					this._removeLabel( e );
					e.stopPropagation();
					this._trigger( "onLabelClose", e , [] );
				},
				"click .coral-textboxlist-item" : function( e ){
					//if ( this.options.readonly || this.options.isLabel ) return;
					e.stopPropagation();
					this._trigger( "onLabelClick", e , [] );
				},
				"click .coral-textbox-border" : function( e ){
					if ( this.options.readonly || this.options.isLabel ) return;
					this.element.focus();
				},
				"mouseenter .coral-label-close" : function( e ){
					$( e.target ).addClass( "coral-label-close-hover" );
				},
				"mouseleave .coral-label-close" : function( e ){
					$( e.target ).removeClass( "coral-label-close-hover" );
				},
				"focus .coral-textboxlist-item" : function( e ) {
					if ( this.options.readonly || this.options.isLabel ) return;
					$( e.target ).addClass( "coral-state-active" );
				},
				"blur .coral-textboxlist-item" : function( e ) {
					$( e.target ).removeClass( "coral-state-active" );
				},
				"keydown .coral-state-active" : function( e ) {
					if ( this.options.readonly || this.options.isLabel ) return;
					var keyCode = $.coral.keyCode;
					switch ( e.keyCode ) {
					case keyCode.LEFT:
						//suppressKeyPress = true;
						this._moveInput( "left", e );
						break;
					case keyCode.RIGHT:
						//suppressKeyPress = true;
						this._moveInput( "right", e );
						break;
					case keyCode.BACKSPACE:
						this._removeLabel( e );
						break;
					case keyCode.DELETE:
						this._removeLabel( e );
						break;
					default:
						break;
					}
				}
			});
		}
	},
	_initData: function(){
		var that = this;
		var opts = this.options;
		this.menu = $( "<ul>" )
		.addClass( "coral-autocomplete-panel coral-front" )
		.appendTo( this._appendTo() )
		.menu({
			// disable ARIA support, the live region takes care of that
			role: null
		})
		.hide()
		.menu( "instance" );
		if ( isNaN( opts.panelHeight ) ) {
			$(".coral-autocomplete-panel").css( {
				"max-height": opts.maxPanelHeight +"px"
			} );
			$(".coral-autocomplete-iframePanel").css( {
				"max-height": opts.maxPanelHeight +"px"
			} );
		}
	},
	_setDefaultValue: function(){
		if (!this.options.value) {
			this.originalValue = "";
			return ;
		} else {
			this.setValue(this.options.value);
			this.originalValue = this.getValue();
		}
	},
	_setDefaultText: function(){
		if ( !this.options.text ) return ;
		this.setText( this.options.text );
	},
/*	_createButtonPanel: function() {
		this.uiDialogButtonPanel = $("<span class=\"coral-autocomplete-btn-icons coral-corner-right coral-buttonset\"></span>");
		this.elementBorder.append( this.uiDialogButtonPanel );
		this._createButtons();
		this.elementBorder.css( "padding-right", this.uiDialogButtonPanel.outerWidth() );
	},*/
/*	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons.concat();
		if ( $.isEmptyObject( buttons ) ) buttons = {};
		$.each( buttons, function(i) {
			var buttonOptions,
				addCls = "",
				removeCls = "",
				props = $.extend( { type: "button" }, {click: this.click} );
			var click = this.click || $.noop;
			props.click = function() {
				click.apply( that.element[0], arguments );
			};
			delete this.click;
			removeCls = "coral-corner-all";
			if ( i == ( buttons.length - 1 ) ) {
				addCls = "coral-corner-right"
			}
			$( "<button></button>", props ).button( this )
				.addClass(addCls).removeClass(removeCls).appendTo( that.uiDialogButtonPanel );
			this.click = click;
		});
	},*/
	getLastSelectedItem: function(){
		return this.lastSelectedItem;
	},
	
	_destroy: function() {
		clearTimeout( this.searching );
		this.element
			.removeClass( "coral-autocomplete-input" )
			.removeAttr( "autocomplete" )
			.removeAttr("title");
		this.menu.element.remove();
		if(this.options.iframePanel){
			this.iframePanel.remove();
		}
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		var maxWidth = this.options.maxLabelWidth;
		if ( maxWidth != "auto" ) {
			maxWidth = maxWidth+"px";
		}

		this._super( key, value );
		
		if ( key === "isLabel" && typeof value === "boolean" ) {
			this.element.prop( "readonly", value );
			this.valuebox.prop( "readonly", value );
			this.component().removeClass( "coral-readonly" );	
			this.component().toggleClass( "coral-isLabel", value );
			this.element.toggleClass( "tabbable", !value );
			if ( this.textboxlistUl ) {
				if( value ){
					this.textboxlistUl.find(".coral-textboxlist-item").css("max-width","");
				}else{
					this.textboxlistUl.find(".coral-textboxlist-item").css("max-width",maxWidth);
				}
			}
		}
		if ( key === "readonly" && typeof value === "boolean") {
			this.element.prop( "readonly", value );
			this.valuebox.prop( "readonly", value );
			this.component().removeClass( "coral-isLabel" );	
			this.component().toggleClass( "coral-readonly", value );
			this.element.toggleClass( "tabbable", !value );
			if ( this.textboxlistUl ) {
				if( value ){
					this.textboxlistUl.find(".coral-textboxlist-item").css("max-width","");
				}else{
					this.textboxlistUl.find(".coral-textboxlist-item").css("max-width",maxWidth);
				}
			}
		}
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
		if ( key === "value") {
			this.setValue( value );
		}
		if ( key === "placeholder" ) {
			this.element.attr( "placeholder", this.options.placeholder );	
			if ( this.getValue() === "" ) {
				this._showPlaceholder();					
			}
		}
		if ( key === "panelComponentCls" ) {
			this.menu.element.addClass(this.options.panelComponentCls);
		}
	},
	
	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".coral-front" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},
	_filter: function( array, request, response ){
		response( $.coral.autocomplete.filter( array, request.term, this.options.valueField, this.options.textField ,this.options.searchField) );
	},
	transTempData: function(data) {
		function convtree(node, opts){
			for ( var j=0; j<node.length; j++ ) {
				if ( node[j].children ) {
					convtree(node[j].children, opts);
				}
				opts.tempData[node[j].id] = node[j];
			}
		}
		if (data && this.options.render === "tree") {
			this.options.tempData = {};
			this.options.textField = this.options.textField || "name";
			this.options.valueField = this.options.valueField || "id";
			convtree(data, this.options);
		}
		if (data && this.options.render !== "tree") {
			this.options.tempData = {};
			this.options.textField = this.options.textField || "text";
			this.options.valueField = this.options.valueField || "value";
			for(var k =0; k< data.length;k++){
				this.options.tempData[data[k][this.options.valueField]] = data[k];
			}
		}
	},
	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray( this.options.source ) ) {
			array = this.options.source;
			this.transTempData(array);
			this.source = function( request, response ) {
				that._filter( array, request, response );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				if ( this.element.attr("name") ){
					request[this.element.attr("name")] = request.term;
				}
				that.xhr = $.ajax({
					url: url,
					data: request,
					type: that.options.asyncType,
					dataType: "json",
					success: function( data ) {

						if ( that.options.render != "tree" ) {
							response( data );
						} else {
							$( that.menu.element ).tree("reload", data);
							response( data );
						}
						that.transTempData(data);
					},
					error: function() {
						response([]);
					}
				});
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay(function() {

			// Search if the value has changed, or if the user retypes the same value (see #7434)
			var equalValues = this.term === this._term(),
				menuVisible = this.menu.element.is( ":visible" ),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},
	_term: function(){
		if ( this.options.multiLineLabel ) {
			return this.element.val();
		}
		return this.getText();
	},
	_updateTitle: function(text) {
		var that = this,element,
			opts = this.options;
		if( opts.multiLineLabel ){
			element = that.element.closest("ul");
		}else{
			element = that.element;
		}
		if (opts.title == true) {
			element.attr("title", text);
		} else if (opts.title == false) {
			element.attr("title", "");
		} else {
			element.attr("title", opts.title);
		}
	},
	search: function( text/*value*/, event ) {
		text = text != null ? text : this._term();
		// always save the actual value, not the one passed as an argument
		this.term = this._term();

		if ( text.length < this.options.minLength ||
			( this.options.minLength > 0 && $.trim( text ) == "" ) ) {
			return this.close( event );
		}

		if ( this._trigger( "onSearch", event ) === false ) {
			return;
		}

		return this._search( text );
	},

	_search: function( text ) {
		this.pending++;
		this.element.addClass( "coral-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: text }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy(function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this.element.removeClass( "coral-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		var that = this;
		this.renderNumber = 1;
		this.options.pageData=[];
		
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "onResponse", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			var length = content.length,// 所有的数据的长度
			    showNum = that.options.rowNum,// 一次加载的条数
	            number = Math.ceil(length/showNum);// 多少页
			if (number>1) {
				for(var i=0;i<number;i++){
					that.options.pageData[i]=content.slice(i*showNum,(i+1)*showNum-1);
				}
				content=that.options.pageData[0];
			}
			this._suggest( content );
			this._trigger( "onOpen" );
		} else {
			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {
		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			if(this.options.iframePanel){
				this.iframePanel.hide();
			}
			this.options.render != "tree" && this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "onClose", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this.getValue() ) {
			this._trigger( "onChange", event, { item: this.selectedItem,oldValue: this.previous,value: this.getValue(),text:this.getText(),lastSelectedItem: this.lastSelectedItem} );
		}
	},
	_normalize: function( items ) {
		var that = this;
		// assume all items have the right format when the first item is complete
		if ( items.length && items[ 0 ][this.options.textField] && items[ 0 ][this.options.valueField] ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend( {}, item, {
				label: item.label || item.value,
				value: item.value || item.label
			});
		});
	},
	_suggest: function( items ) {
		var that=this;
		var ul = this.menu.element,nData;//.empty();
		var iframePanel = this.iframePanel || $();
		if ( this.options.render == "tree" ){
			//$( ul ).tree("addNodes", null, items);
			//$( ul ).tree("filterNodesByParam", {"name": "112"} );
		}else{
			this.menu.element.empty();
			this._renderMenu( ul, items );
			this.isNewMenu = true;
			this.menu.refresh();
		}
		this.responseItems = items;
		// size and position menu
		var height = ul.height();
		iframePanel.css("height",height);
		ul.show();
		ul.scrollTop(0);
		iframePanel.show();
		var zIndicies = ul.siblings( ".coral-front:visible" ).map(function() {
				return +$( this ).css( "z-index" );
			}).get(),
			zIndexMax = Math.max.apply( null, zIndicies );
		if ( zIndexMax >= +ul.css( "z-index" ) ) {
			ul.css( "z-index", zIndexMax + 1 );
			iframePanel.css( "z-index", zIndexMax );
		}
		/*iframePanel.outerWidth(
				 Math.max(
						// Firefox wraps long text (possibly a rounding bug)
						// so we add 1px to avoid the wrapping (#7513)
						ul.width( "" ).outerWidth() + 1,
						this.elementBorder.outerWidth()
				 )
		);*/
		this._resizeMenu();
		ul.position( $.extend({
			of: this.elementBorder
		}, this.options.position ) );
		iframePanel.position( $.extend({
			of: this.elementBorder
		}, this.options.position ) );
		if ( this.options.autoFocus ) {
			this.menu.next();
		}
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		var iframePanel = this.iframePanel || $();
		ul.outerWidth( Math.max(
			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			this.options.panelWidth? this.options.panelWidth: ul.width( "" ).outerWidth() + 1,
			this.elementBorder.outerWidth()
		) );
		iframePanel.outerWidth(ul.outerWidth());
	},

	_renderMenu: function( ul, items ) {
		var that = this,
			htmlArr = [],
			arr;
		$.each( items, function( index, item ) {
			htmlArr.push(that._renderItemData( ul, item ));
		});
		ul.append(htmlArr.join(""));
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item )//.data( "coral-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		var text = item[this.options.textField];
		var attrName, restAttr = '', style = '', classes = !!item.hidden==true?"hidden":"";
		var _fn = $.coral.toFunction(this.options.formatter),nData;
		if($.isFunction(_fn)){
			text = _fn.apply(this.element[0], [{"item":item}]);
		}
		var itemattrFun = $.coral.toFunction(this.options.itemattr);
		restAttr += ' data-key="' + item[this.options.valueField]+'"';
		if($.isFunction(itemattrFun)){
			var itemAttrObj = itemattrFun.apply( this.element[0], [{"item":item}]);
			if(!$.isEmptyObject( itemAttrObj )) {
				if (itemAttrObj.hasOwnProperty("style")) {
					style += itemAttrObj.style;
					delete itemAttrObj.style;
				}
				if (itemAttrObj.hasOwnProperty("class")) {
					classes += ' ' + itemAttrObj['class'];
					delete itemAttrObj['class'];
				}
				// dot't allow to change role attribute
				try { delete itemAttrObj.role; } catch(ra){}
				for (attrName in itemAttrObj) {
					if (itemAttrObj.hasOwnProperty(attrName)) {
						restAttr += ' ' + attrName + '=' + itemAttrObj[attrName];
					}
				}
			}
			return "<li class='" + classes + "' " + restAttr + " style='"+ style +"'>"+text+"</li>";
			
		}else{

			return "<li class='" + classes + "' " + restAttr + ">"+text+"</li>";
		}
		
	},
	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {

			if (!this.options.multiLineLabel ) {
				this.setValue( "", true );
				this.setText( this.term );
			}

			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	component: function() {
		return this.textboxWrapper;
	},
	/**
	 * set the lastSelectedItem 
	 **/
	_setLastSelectedItem: function(){
		var options = this.options;
		var value = this.getValue(),
			text = this.getText();
		// lastSelectedItem是引用模式，如果改变的值是空，会影响source里面的值。
		this.lastSelectedItem = {};
		this.lastSelectedItem[options.valueField] = value;
		this.lastSelectedItem[options.textField] = text;
	},
	
	/*_value: function( value, noChange ) {
		if ( this.options.multiLineLabel ) {
			var that = this;
			if ( value != "" && !value ) {
				return this.valuebox.val();
			}
			
			var inputLi = this.element.closest( "li.coral-textboxlist-inputLi" ),
				indexOfInputLi = inputLi.index(),
				index = indexOfInputLi,
				values = this.valuebox.val()==""?[]:this.valuebox.val().split( "," );
			if ( this.options.multiple ) {
				values.splice(index,0,value);
			} else {
				values = [];
				values.push( value );
			}
			
			if ( $.trim( value ) !== "" && $.isArray( this.options.source ) ) {
				var array = $( this.menu.element ).tree("transformToArray", this.options.source),
					texts = [],
					grepArr = $.grep( value.split( "," ), function( value0 ) {
						var ret = false;
						$.each(array, function(i){
							if ( value0 == array[i][that.options.valueField] ) {
								texts.push(array[i][that.options.textField]);
								return true;
							}
						});
						return ret;
					});
				if ( texts.length ){
					this.setText( texts );
				}
			} else if ( typeof this.options.source == "string" && this.selectedItem ) {
				this.setText(this.selectedItem[this.options.textField]);
			} else if ( $.trim( value ) == "" ) {
				this.setText(value);
			}
			this.valuebox.val( values.join( "," ) );
			!noChange && this._change(null);
		} else {
			return this.valueMethod.apply( this.valuebox, value );
		}
	},*/

	_text: function( text ) {
		var maxLabelWidth = this.options.maxLabelWidth,
		    readonly = this.options.readonly,
		    isLabel = this.options.isLabel,
			labelCls = this.options.labelCls;
		if ( this.options.multiLineLabel ) {
			if ( text != "" && !text ) {
				var texts = [];
				$.each( this.textboxlistUl.find( ".coral-textboxlist-item" ), function(){
					texts.push($( this ).text());
				});
				return texts.join( "," );
			}
			var item = "";
			if ( text != "" && !(text instanceof Array) ) {
				text = text.split( this.options.separator );
			}
			if ( text instanceof Array ) {
				if ( maxLabelWidth == "auto" || isLabel || readonly ){
					$.each(text, function(i){
						text.splice(i,1,"<li tabindex='-1' class='coral-textboxlist-item "+ labelCls +"'  title='"+this+"'>"+this+"<span class='coral-label-close cui-icon-cross2'></span></li>");
					});
				}else{
					$.each(text, function(i){
						text.splice(i,1,"<li tabindex='-1' class='coral-textboxlist-item "+ labelCls +"'  style='  max-width:"+maxLabelWidth+"px;' title='"+this+"'>"+this+"<span class='coral-label-close cui-icon-cross2'></span></li>");
					});
				}
				item = text.join("");
			} else {
				if ( maxLabelWidth == "auto"|| isLabel || readonly){
					item = "<li tabindex='-1' class='coral-textboxlist-item "+ labelCls +"'   title='"+this+"' >"+text+"<span class='coral-label-close  cui-icon-cross2'></span></li>";
				}else{
					item = "<li tabindex='-1' class='coral-textboxlist-item "+ labelCls +"'  style='  max-width:"+maxLabelWidth+"px;' title='"+this+"' >"+text+"<span class='coral-label-close cui-icon-cross2'></span></li>";
				}
			}
			if ( text != "" ) {
				if ( this.options.multiple ) {
					this.textboxlistUl.find( ".coral-textboxlist-item" ).remove(".coral-textboxlist-item");
					this.textboxlistUl.find( ".coral-textboxlist-inputLi" ).before( item );
				} else {
					this.textboxlistUl.find( ".coral-textboxlist-item" ).remove(".coral-textboxlist-item");
					this.textboxlistUl.find( ".coral-textboxlist-inputLi" ).before( item );
				}
			} else {
				this.textboxlistUl.find( ".coral-textboxlist-item" ).remove(".coral-textboxlist-item");
			}
		} else {
			return this.textMethod.apply( this.element, arguments );
		}
		
		
	},
	getOldValue: function(){
		var opts = this.options,
		    valArr = [],
		    substr = [],
		    i = 0;
		if ( !this.currentValues ) return valArr;
		var substr = this.currentValues.split(",");
		for (; i <substr.length; i++) {
			var value = substr[i];
			valArr.push(value);
		}
		return valArr;
	},
	/**
	 * value: 设置的值。
	 * 
	 * changed：不对外开放，如果不传默认是false，内部调用，
	 * 如果需要出发onChange事件，则设置changed为true。
	 * 
	 */
	setValue: function ( opts, changed ) {
		// 如果null或者空，则设置为""。
		opts = opts || "";
		var that = this,
			value, text,changed, removed;
		if ( typeof opts !== "string" ) {
			value = opts.value;
			changed = opts.changed;
			removed = opts.removed;
		} else {
			value = opts;
		}
		if ( this.options.multiLineLabel ) {
			this.element.val("");
			this.element.css({width:"10px"});//清空值并且 将宽度还原；否则会将元素的高度撑开
		}
		this.previous = this.getValue();
		// 多行标签模式的设置值，有多选的功能
		if ( this.options.multiLineLabel ) {
			var that = this;
			var inputLi = this.element.closest( "li.coral-textboxlist-inputLi" ),
				indexOfInputLi = inputLi.index(),
				index = indexOfInputLi,
				values = this.valuebox.val(value)==""?[]:this.valuebox.val(value);
				//this.setText("");
			if ( $.trim( value ) == "" ) {
				this.setText(value);
			} else if ( "text" === this.options.postMode ) {
				this.setText( value );
			} else if ( $.trim( value ) !== "" && $.isArray( this.options.source ) ) {
				
				var texts = [],
					textField = this.options.textField,
					cArr = value.split( "," );
				for ( var i=0; i<cArr.length; i++ ) {
					var t = this.options.tempData[cArr[i]];
					if (t) {
						texts.push( this.options.tempData[cArr[i]][textField] );
					} else {
						texts.push( cArr[i] );
					}
				}
				if ( texts.length ){
					this.setText( texts );
				}
			}			
			//}
			if ( value == "" ) values = [];
			this.valuebox.val( value );
			this.currentValues = value;
		} else {
			// 不是标签模式，目前没有多选的功能
			// 设置text
			if ( $.trim( value ) == "" ) {
				this.setText(value);
			} else if ( "text" === this.options.postMode ) {
				this.setText( value );
			} else if ( $.trim( value ) !== "" && $.isArray( this.options.source ) ) {
				var texts = [],
					textField = this.options.textField,
					cArr = value.split( "," );
				for ( var i=0; i<cArr.length; i++ ) {
					var t = this.options.tempData[cArr[i]];
					if (t) {
						texts.push( this.options.tempData[cArr[i]][textField] );
					} else {
						texts.push( cArr[i] );
					}
				}
				if ( texts.length ){
					this.setText( texts );
				}
//				if ( texts.length ){
//					this.setText( texts[0] );
//				}
			}
			this.valuebox.val( value );
		}
		if ( value !== "" ) {
			this._hidePlaceholder();
		}
		changed && this._change(null);
	},
	
	setText: function (text) {
		this._updateTitle(text);
		this._text(text);
		this._setLastSelectedItem();
	},
	
	getValue: function(){
		if ( this.options.multiLineLabel ) {
			//if ( value != "" && !value ) {
			return this.valuebox.val();
			//}
		}else {
			return this.valueMethod.apply( this.valuebox );
		}
	//	return this._value();
	},	
	
	getText: function(){
		return this._text();
	},
	focus: function(){
		if (this.options.disabled || this.options.readonly || this.options.isLabel) return false;
		this.element.focus();
	},
	_keyEvent: function( keyEvent, event ) {
		if ( !this.ismultiLineLabel || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	},
	_removeLabel: function( e ){
		var inputLi = this.element.closest( "li.coral-textboxlist-inputLi" ),
			curItem = $(e.target).closest( "li.coral-textboxlist-item" ),
			lastItem = $(e.target).closest( "li.coral-textboxlist-item:last" );
		inputLi.insertAfter( lastItem );
		var indexOfInputLi = inputLi.index();
		var indexOfItem = curItem.index();
		var index = indexOfItem;
		if ( indexOfItem > indexOfInputLi ) {
			index = indexOfItem - 1;
		}
		var texts = this.getText().split( "," );
		texts.splice( index, 1 );
		curItem.remove();
		var values = this.getValue().split( "," );
		values.splice( index, 1 );
		this.selectedItems.splice( index, 1 );
		this.selectedItem = null;
		//this.valuebox.val( values.join(",") );
		/*this.setValue( {
			value: values.join(","), 
			changed: true,
			removed: index
		});*/
		this.setValue( values.join(","), true );
		if(typeof this.options.source == "string" ){
			this.setText( texts.join(",") );
		}
		//this._change( e );
		this._moveInput( "last", e );
		this.element.val("");
		this.element.focus();
	},
	_moveInput: function( direction, e ){
		var inputLi = this.element.closest( "li.coral-textboxlist-inputLi" );
		var curItem = $(e.target).closest( "li.coral-textboxlist-item" );
		var lastItem = $(inputLi).closest( "li.coral-textboxlist-inputLi" ).nextAll("li.coral-textboxlist-item").last();

		switch ( direction ) {
		case 'left':
			inputLi.insertBefore( curItem );
			this.element.val("");
			this.element.focus();
			break;
		case 'right':
			inputLi.insertAfter( curItem );
			this.element.val("");
			this.element.focus();
			break;
		case 'last':
			inputLi.insertAfter( lastItem );
			this.element.val("");
			break;
		}
	},
	_moveItem: function( direction, e ){
		var inputLi = this.element.closest( "li.coral-textboxlist-inputLi" );
		if ( direction == "left" && inputLi.prev().length && $( inputLi.find( "input" ) ).caret() == 0 ) {
			this.element.val("");
			inputLi.prev().focus();
		}
		if ( direction == "right" && inputLi.next().length && $( inputLi.find( "input" ) ).caret() == inputLi.find( "input" ).val().length ) {
			this.element.val("");
			inputLi.next().focus();
		}
	}
});
$.extend( $.coral.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
	},
	filter: function( array, term , valueField, textField, searchField) {
		var that = this;
		var matcher = new RegExp( $.coral.autocomplete.escapeRegex( term ), "i" );
		if ( searchField ) {
			return $.grep( array, function( value ) {
				var r = matcher.test( value[textField] || value[valueField] || value );
				var sarr = searchField.split( "," );
				for( var i = 0; i < sarr.length; i ++ ){
					if ( !r && value[sarr[i]] ) {
						r = matcher.test( value[sarr[i]] );
						if ( r ) break;
					}
				}
				return r;
				/*if ( !r && value[searchField] ) {
					r = matcher.test( value[searchField] );
				}
				return r;*/
			});
		}
		return $.grep( array, function( value ) {
			return matcher.test( value[textField] || value[valueField] || value[searchField] || value );
		});
	}
});
$.component( "coral.autocomplete", $.coral.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.children().hide();
		$( "<div>" ).text( message ).appendTo( this.liveRegion );
	}
});
// noDefinePart
} ) );