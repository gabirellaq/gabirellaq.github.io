( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"./grid"
		], factory );
	} else {
		factory( jQuery );
	}
}( function( $, undefined ) {
//noDefinePart
$.component( "coral.grid", $.coral.grid, {
	editCell: function (iRow,iCol, ed){		
		var that = this, nm, tmp,cc, cm;
		if (!that.grid || that.options.cellEdit !== true) {return;}
		iCol = parseInt(iCol,10);

		// select the row that can be used for other methods
	//	that.options.selrow = that.rows[iRow].id;
		if (!that.options.knv) {$(that.element).grid("GridNav");}
		// check to see if we have already edited cell
		if (that.options.savedRow.length>0) {
			// prevent second click on that field and enable selects
			if (ed===true ) {
				if(iRow == that.options.iRow && iCol == that.options.iCol){
					return;
				}
			}
			// save the cell
			if ( that.rows[that.options.savedRow[0].id] ) {
				if( !$(that.element).grid("saveCell",that.options.savedRow[0].id,that.options.savedRow[0].ic) ){
					return;
				}
			}
		} else {
			window.setTimeout(function () { $("#"+$.grid.coralID(that.options.knv)).attr("tabindex","-1").focus();},0);
		}
		cm = that.options.colModel[iCol];
		nm = cm.name;
		if (nm=='subgrid' || nm=='cb' || nm=='rn') {return;}
		cc = $("td:eq("+iCol+")",that.rows[iRow]);
		if (cm.editable===true && ed===true && !cc.hasClass("not-editable-cell")) {
			if(parseInt(that.options.iCol,10)>=0  && parseInt(that.options.iRow,10)>=0) {
				$("td:eq("+that.options.iCol+")",that.rows[that.options.iRow]).removeClass("edit-cell coral-state-highlight");
				$(that.rows[that.options.iRow]).removeClass("selected-row coral-state-hover");
			}
			$(cc).addClass("edit-cell coral-state-highlight");
			$(that.rows[iRow]).addClass("selected-row coral-state-hover");
			try {
				tmp =  $.unformat.call(that,cc,{rowId: that.rows[iRow].id, colModel:cm},iCol);
			} catch (_) {
				tmp = ( cm.edittype && cm.edittype == 'textarea' ) ? $(cc).text() : $(cc).html();
			}
			if(that.options.autoencode) { tmp = $.grid.htmlDecode(tmp); }
			if( !that._trigger("beforeEditCell",null,[{"rowId":that.rows[iRow].id,"name":nm,"cellValue":tmp,"rowIndex":iRow,"cellIndex":iCol}]) ) return;
			//if (!cm.edittype) {cm.edittype = "text";}
			that.options.savedRow.push({id:iRow,ic:iCol,name:nm,value:tmp});
			if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
			if($.isFunction(that.options.formatCell)) {
				var tmp2 = that.options.formatCell.call(that, that.rows[iRow].id,nm,tmp,iRow,iCol);
				if(tmp2 !== undefined ) {tmp = tmp2;}
			}
			var editoptions = cm.editoptions,
				attr = {
					id:iRow+"_"+nm,
					name:nm
				};
			//editoptions = $.extend({}, editoptions || {} ,{id:iRow+"_"+nm,name:nm});
			editoptions = $.extend({}, editoptions || {},attr);
			var elc = $.grid.createEl.call(that,cm.edittype,editoptions,tmp,true,$.extend({},$.grid.ajaxOptions,that.options.ajaxSelectOptions || {}));


			$(cc).html("").append(elc).attr("tabindex","0");
			var _keydown = function(e){
				if (e.keyCode === 27) {
					if($("input.hasDatepicker",cc).length >0) {
						if( $(".coral-datepicker").is(":hidden") )  { $(that.element).grid("restoreCell",iRow,iCol); }
						else { $("input.hasDatepicker",cc).datepicker('hide'); }
					} else {
						$(that.element).grid("restoreCell",iRow,iCol);
					}
				} //ESC
				if (e.keyCode === 13) {
					$(that.element).grid("saveCell",iRow,iCol);
					// Prevent default action
					return false;
				} //Enter
				if (e.keyCode === 9) {
					if(!that.grid.columnsView.loading ) {
						if (e.shiftKey) {$(that.element).grid("prevCell",iRow,iCol);} //Shift TAb
						else {$(that.element).grid("nextCell",iRow,iCol);} //Tab
					} else {
						return false;
					}
				}
				e.stopPropagation();
			};
			/*var _onValidSuccess = editoptions.onValidSuccess;
			editoptions = $.extend({}, editoptions, {"onValidSuccess":function(e, ui){
				$(e.target).parent("td").removeClass( "coral-gridcell-error" );
				_onValidSuccess&&_onValidSuccess.apply( $( this ), [e, ui] );
				e.stopPropagation();
			}});
			var _onValidError = editoptions.onValidError;
			editoptions = $.extend({}, editoptions, {"onValidError":function(e, ui){
				$(e.target).parent("td").removeClass( "coral-gridcell-error" );
				_onValidError&&_onValidError.apply( $( this ), [e, ui] );
				e.stopPropagation();
			}});*/
		//	var coralOption = {"onValidSuccess":_onValidSuccess,"onValidError":_onValidError,"onKeyDown":_keydown, "value":$(elc).val()};
			var coralOption = {"onKeyDown":_keydown, "value":$(elc).val()},
				type = cm.edittype,
				rwd = $(that.element).grid("getRowData",that.rows[iRow].id);
			switch ( cm.edittype ) {
				case "text":
				case "textarea":
					editoptions = $.extend({}, editoptions, coralOption);
					$(elc).textbox(editoptions);					
					break;					
				case "datepicker":
					editoptions = $.extend({}, editoptions, coralOption);
					$(elc).datepicker(editoptions);
					break;
				case "radio":
					editoptions = $.extend({}, editoptions, coralOption);
					$(elc).radio(editoptions);
					if ( $(elc).val() == "Yes" ) {
						$(elc).radio("check");
					} else {
						$(elc).radio("uncheck");
					}
					break;
				case "checkbox":
					editoptions = $.extend({}, editoptions, coralOption);
					$(elc).checkbox(editoptions);	
					if ( $(elc).val() == "Yes" ) {
						$(elc).checkbox("check");
					} else {
						$(elc).checkbox("uncheck");
					}
					break;
				case "autocomplete":
					var value = $(elc).val();
					var isUrl = typeof ( editoptions.source ) == "string";
					editoptions = $.extend({}, editoptions, coralOption);
					var postMode = editoptions.postMode || "value";
					/*var _onChange = editoptions.onChange;
					editoptions = $.extend({}, editoptions, {"onChange":function(e, ui){
						$(elc).closest("td").attr( "data-org", isUrl?ui.value:ui.text );
						_onChange&&_onChange.apply(elc, [e, ui]);
					}});*/
					editoptions.postMode = postMode;
					editoptions = $.extend({}, editoptions, {"onKeyDown":_keydown});
					$(elc).autocomplete(editoptions);
					if ( isUrl ) {
						editoptions.postMode = "text";
						$(elc).autocomplete(editoptions);
						$( elc ).autocomplete( "setValue", value );
					} else {//data模式
						if ( postMode == "value" ) {
							$( elc ).autocomplete( "setValue", value );
						} else {
							/*var grepArr = $.grep( editoptions.source, function( _value ) {
								return _value[editoptions.textField||"text"] == value;
							});
							if ( grepArr.length ){
								//$( elc ).autocomplete( "setValue", grepArr[0][editoptions.valueField||"value"] );
							}*/
							$( elc ).autocomplete( "setValue", value );
							$( elc ).autocomplete( "setText", value );
						}
					}

					break;
				case "combobox":
				case "combotree":
				case "combogrid":
					editoptions = $.extend({}, editoptions, coralOption);
					if(cm.cellEditoptions){
						var cellOpt = that.getCellEditOptions(cm,$(elc).val(),editoptions,rwd,attr,coralOption);
					}
					type = cellOpt && cellOpt.type ? cellOpt.type : cm.edittype;
					editoptions = cellOpt && cellOpt.cOpts ? cellOpt.cOpts : editoptions ;
					type = type =="text"? "textbox" : type;
					$(elc)[type](editoptions);
					break;
			
			}
			window.setTimeout( function () { $(elc).focus();},0 );
			/*$("input, select, textarea",cc).bind("keydown",function(e) {
				if (e.keyCode === 27) {
					if($("input.hasDatepicker",cc).length >0) {
						if( $(".coral-datepicker").is(":hidden") )  { $(that.element).grid("restoreCell",iRow,iCol); }
						else { $("input.hasDatepicker",cc).datepicker('hide'); }
					} else {
						$(that.element).grid("restoreCell",iRow,iCol);
					}
				} //ESC
				if (e.keyCode === 13) {
					$(that.element).grid("saveCell",iRow,iCol);
					// Prevent default action
					return false;
				} //Enter
				if (e.keyCode === 9)  {
					if(!that.grid.columnsView.loading ) {
						if (e.shiftKey) {$(that.element).grid("prevCell",iRow,iCol);} //Shift TAb
						else {$(that.element).grid("nextCell",iRow,iCol);} //Tab
					} else {
						return false;
					}
				}
				e.stopPropagation();
			});*/
			/*$(that.element).triggerHandler("aftereditcell", [that.rows[iRow].id, nm, tmp, iRow, iCol]);
			if ($.isFunction(that.options.afterEditCell)) {
				that.options.afterEditCell.call(that, that.rows[iRow].id,nm,tmp,iRow,iCol);
			}*/
			that._trigger("afterEditCell",null,[{"rowId":that.rows[iRow].id,"name":nm,"cellValue":tmp,"rowIndex":iRow,"celIndex":iCol}]);
		} else {
			if (parseInt(that.options.iCol,10)>=0  && parseInt(that.options.iRow,10)>=0) {
				$("td:eq("+that.options.iCol+")",that.rows[that.options.iRow]).removeClass("edit-cell coral-state-highlight");
				$(that.rows[that.options.iRow]).removeClass("selected-row coral-state-hover");
			}
			cc.addClass("edit-cell coral-state-highlight");
			$(that.rows[iRow]).addClass("selected-row coral-state-hover");
			tmp = cc.html().replace(/\&#160\;/ig,'');
			$(that.element).triggerHandler("jqGridSelectCell", [that.rows[iRow].id, nm, tmp, iRow, iCol]);
			if ($.isFunction(that.options.onSelectCell)) {
				that.options.onSelectCell.call(that, that.rows[iRow].id,nm,tmp,iRow,iCol);
			}
		}
		//$(cc).validate();
		that.options.iCol = iCol; that.options.iRow = iRow;
	},
	getCellEditOptions: function(cm,value,editoptions,rwd,attr,coralOption){
		var cOpts = $.coral.toFunction(cm.cellEditoptions).call(this, value, editoptions, rwd);
		var type = cOpts && cOpts.type ? cOpts.type : cm.edittype;
		cOpts = cOpts && cOpts.cellEditoptions ? $.extend({}, cOpts.cellEditoptions, attr, coralOption):editoptions;
		editoptions = cOpts || editoptions;
		return {
			cOpts:cOpts,
			type : type
		}
	},
	GridNav : function() {
		var  that = this;
		if (!that.grid || that.options.cellEdit !== true ) {return;}
		// trick to process keydown on non input elements
		that.options.knv = that.options.id + "_kn";
		var selection = $("<span style='width:0px;height:0px;background-color:black;' tabindex='0'><span tabindex='-1' style='width:0px;height:0px;background-color:grey' id='"+that.options.knv+"'></span></span>"),
		i, kdir;
		function scrollGrid(iR, iC, tp){
			if (tp.substr(0,1)=='v') {
				var ch = $(that.grid.rowsView)[0].clientHeight,
				st = $(that.grid.rowsView)[0].scrollTop,
				nROT = that.rows[iR].offsetTop+that.rows[iR].clientHeight,
				pROT = that.rows[iR].offsetTop;
				if(tp == 'vd') {
					if(nROT >= ch) {
						$(that.grid.rowsView)[0].scrollTop = $(that.grid.rowsView)[0].scrollTop + that.rows[iR].clientHeight;
					}
				}
				if(tp == 'vu'){
					if (pROT < st ) {
						$(that.grid.rowsView)[0].scrollTop = $(that.grid.rowsView)[0].scrollTop - that.rows[iR].clientHeight;
					}
				}
			}
			if(tp=='h') {
				var cw = $(that.grid.rowsView)[0].clientWidth,
				sl = $(that.grid.rowsView)[0].scrollLeft,
				nCOL = that.rows[iR].cells[iC].offsetLeft+that.rows[iR].cells[iC].clientWidth,
				pCOL = that.rows[iR].cells[iC].offsetLeft;
				if(nCOL >= cw+parseInt(sl,10)) {
					$(that.grid.rowsView)[0].scrollLeft = $(that.grid.rowsView)[0].scrollLeft + that.rows[iR].cells[iC].clientWidth;
				} else if (pCOL < sl) {
					$(that.grid.rowsView)[0].scrollLeft = $(that.grid.rowsView)[0].scrollLeft - that.rows[iR].cells[iC].clientWidth;
				}
			}
		}
		function findNextVisible(iC,act){
			var ind, i;
			if(act == 'lft') {
				ind = iC+1;
				for (i=iC;i>=0;i--){
					if (that.options.colModel[i].hidden !== true) {
						ind = i;
						break;
					}
				}
			}
			if(act == 'rgt') {
				ind = iC-1;
				for (i=iC; i<that.options.colModel.length;i++){
					if (that.options.colModel[i].hidden !== true) {
						ind = i;
						break;
					}						
				}
			}
			return ind;
		}

		//$(selection).insertBefore(that.grid.cDiv);//mark 暂时不考虑添加caption，先添加到columnsView前
		$(selection).insertBefore(that.grid.columnsView);
		$("#"+that.options.knv)
		.focus()
		.keydown(function (e){
			kdir = e.keyCode;
			if(that.options.direction == "rtl") {
				if(kdir===37) { kdir = 39;}
				else if (kdir===39) { kdir = 37; }
			}
			switch (kdir) {
				case 38:
					if (that.options.iRow-1 >0 ) {
						scrollGrid(that.options.iRow-1,that.options.iCol,'vu');
						$(that.element).grid("editCell",that.options.iRow-1,that.options.iCol,false);
					}
				break;
				case 40 :
					if (that.options.iRow+1 <=  that.rows.length-1) {
						scrollGrid(that.options.iRow+1,that.options.iCol,'vd');
						$(that.element).grid("editCell",that.options.iRow+1,that.options.iCol,false);
					}
				break;
				case 37 :
					if (that.options.iCol -1 >=  0) {
						i = findNextVisible(that.options.iCol-1,'lft');
						scrollGrid(that.options.iRow, i,'h');
						$(that.element).grid("editCell",that.options.iRow, i,false);
					}
				break;
				case 39 :
					if (that.options.iCol +1 <=  that.options.colModel.length-1) {
						i = findNextVisible(that.options.iCol+1,'rgt');
						scrollGrid(that.options.iRow,i,'h');
						$(that.element).grid("editCell",that.options.iRow,i,false);
					}
				break;
				case 13:
					if (parseInt(that.options.iCol,10)>=0 && parseInt(that.options.iRow,10)>=0) {
						$(that.element).grid("editCell",that.options.iRow,that.options.iCol,true);
					}
				break;
				default :
					return true;
			}
			return false;
		});
	},
	saveCell: function (iRow, iCol){
		var that= this, fr;
		if (!that.grid || that.options.cellEdit !== true) {return;}
		if ( that.options.savedRow.length >= 1) {fr = 0;} else {fr=null;} 
		if(fr !== null) {
			var cc = $("td:eq("+iCol+")",that.rows[iRow]),v,v2,
			cm = that.options.colModel[iCol], nm = cm.name, nmjq = $.grid.coralID(nm) ;
			if ( this.options.autoValid ) {
				var isValid = this.valid( that.rows[iRow].id, cm.name );
				if ( !this.options.allowSaveOnError && !isValid ) {
					$.message("请确认是否输入正确！");return isValid;
				}
			}
			var edittype = cm.edittype;
			if (cm.cellEditoptions) {
				var rwd = $(that.element).grid("getRowData",that.rows[iRow].id),
					sel = $("#"+iRow+"_"+nmjq,that.rows[iRow]),
					cOpts = $.coral.toFunction(cm.cellEditoptions).call(this,$(sel)[$(sel).attr("component-role")]("getValue"),cm.editoptions,rwd);
				edittype = cOpts && cOpts.type ? cOpts.type: edittype;
			}
			switch (edittype) {
				case "select":
					if(!cm.editoptions.multiple) {
						v = $("#"+iRow+"_"+nmjq+" option:selected",that.rows[iRow]).val();
						v2 = $("#"+iRow+"_"+nmjq+" option:selected",that.rows[iRow]).text();
					} else {
						var sel = $("#"+iRow+"_"+nmjq,that.rows[iRow]), selectedText = [];
						v = $(sel).val();
						if(v) { v.join(",");} else { v=""; }
						$("option:selected",sel).each(
							function(i,selected){
								selectedText[i] = $(selected).text();
							}
						);
						v2 = selectedText.join(",");
					}
					if(cm.formatter) { v2 = v; }
					break;
				case "checkbox":
					var cbv  = ["Yes","No"];
					if(cm.editoptions){
						cbv = cm.editoptions.value.split(":");
					}
					v = $("#"+iRow+"_"+nmjq,that.rows[iRow]).is(":checked") ? cbv[0] : cbv[1];
					v2=v;
					break;
				case "password":
				case "text":
				case "textarea":
					//lihaibo add begin
					v = $("#"+iRow+"_"+nmjq,that.rows[iRow]).val();
					v2=v;
					/*if ( !$(cc).validate( "valid" ) ) {
						cc.addClass( "coral-gridcell-error" );
						return false;
					} else {
						cc.removeClass( "coral-gridcell-error" );
					}*/
					break;
					//lihaibo add end
				case "button" :
					v = $("#"+iRow+"_"+nmjq,that.rows[iRow]).val();
					v2=v;
					break;
				case 'custom' :
					try {
						if(cm.editoptions && $.isFunction(cm.editoptions.custom_value)) {
							v = cm.editoptions.custom_value.call(that, $(".customelement",cc),'get');
							if (v===undefined) { throw "e2";} else { v2=v; }
						} else { throw "e1"; }
					} catch (e) {
						if (e=="e1") { $.grid.info_dialog(jQuery.jgrid.errors.errcap,"function 'custom_value' "+$.grid.edit.msg.nodefined,jQuery.jgrid.edit.bClose); }
						if (e=="e2") { $.grid.info_dialog(jQuery.jgrid.errors.errcap,"function 'custom_value' "+$.grid.edit.msg.novalue,jQuery.jgrid.edit.bClose); }
						else {$.grid.info_dialog(jQuery.jgrid.errors.errcap,e.message,jQuery.jgrid.edit.bClose); }
					}
					break;
				case "datepicker":
					v = $("#"+iRow+"_"+nmjq,that.rows[iRow]).val();
					v2 = v;
					var $el = $("#"+iRow+"_"+nmjq,that.rows[iRow]);
					/*if ( !$(cc).validate( "valid" ) ) {
						cc.addClass( "coral-gridcell-error" );
						return false;
					} else {
						cc.removeClass( "coral-gridcell-error" );
					}*/
					break;
				case "combobox":
				case "combogrid":
				case "combotree":
					v = $("#"+iRow+"_"+nmjq,that.rows[iRow])[ edittype ]("getValues").toString();
					v2 = $("#"+iRow+"_"+nmjq,that.rows[iRow])[ edittype ]("getText");
					/*if ( !$(cc).validate( "valid" ) ) {
						cc.addClass( "coral-gridcell-error" );
						return false;
					} else {
						cc.removeClass( "coral-gridcell-error" );
					}*/
					if(cm.formatter) { v2 = v; }
					break;
				case "autocomplete":
					v2 = $("#"+iRow+"_"+nmjq,that.rows[iRow])[ edittype ]("getText");
					if ( typeof ( cm.editoptions.source ) == "string" ) {
						v = v2;
					} else {
						v = $("#"+iRow+"_"+nmjq,that.rows[iRow])[ edittype ]("getValue");
					}
					/*if ( !$(cc).validate( "valid" ) ) {
						cc.addClass( "coral-gridcell-error" );
						return false;
					} else {
						cc.removeClass( "coral-gridcell-error" );
					}*/
					if(cm.formatter&&cm.postMode=="value") { v2 = v; }
					break;
			}
			// The common approach is if nothing changed do not do anything
			if (v2 !== that.options.savedRow[fr].value){
				//that._trigger("beforeSaveCell", null, [{"rowId":that.rows[iRow].id,"name":nm,"cellValue":v,"rowIndex":iRow,"celIndex":iCol}]);
				var vvv = $(that).triggerHandler("jqGridBeforeSaveCell", [that.rows[iRow].id, nm, v, iRow, iCol]);
				if (vvv) {v = vvv; v2=vvv;}
				if ($.isFunction(that.options.beforeSaveCell)) {
					var vv = that.options.beforeSaveCell.call(that, that.rows[iRow].id,nm, v, iRow,iCol);
					if (vv) {v = vv; v2=vv;}
				}
				var cv = $.grid.checkValues(v,iCol,that);
				if(cv[0] === true) {
					var addpost = $(that).triggerHandler("jqGridBeforeSubmitCell", [that.rows[iRow].id, nm, v, iRow, iCol]) || {};
					if ($.isFunction(that.options.beforeSubmitCell)) {
						addpost = that.options.beforeSubmitCell.call(that, that.rows[iRow].id,nm, v, iRow,iCol);
						if (!addpost) {addpost={};}
					}
					if( $("input.hasDatepicker",cc).length >0) { $("input.hasDatepicker",cc).datepicker('hide'); }
					if (that.options.cellsubmit == 'remote') {
						if (that.options.cellurl) {
							var postdata = {};
							if(that.options.autoencode) { v = $.grid.htmlEncode(v); }
							postdata[nm] = v;
							var idname,oper, opers;
							opers = that.options.prmNames;
							idname = opers.id;
							oper = opers.oper;
							postdata[idname] = $.grid.stripPref(that.options.idPrefix, that.rows[iRow].id);
							postdata[oper] = opers.editoper;
							postdata = $.extend(addpost,postdata);
							$("#lui_"+$.grid.coralID(that.options.id)).show();
							that.grid.columnsView.loading = true;
							$.ajax( $.extend( {
								url: that.options.cellurl,
								data :$.isFunction(that.options.serializeCellData) ? that.options.serializeCellData.call(that, postdata) : postdata,
								type: "POST",
								complete: function (result, stat) {
									$("#lui_"+that.options.id).hide();
									that.grid.columnsView.loading = false;
									if (stat == 'success') {
										var ret = $(that).triggerHandler("jqGridAfterSubmitCell", [that, result, postdata.id, nm, v, iRow, iCol]) || [true, ''];
										if (ret[0] === true && $.isFunction(that.options.afterSubmitCell)) {
											ret = that.options.afterSubmitCell.call(that, result,postdata.id,nm,v,iRow,iCol);
										}
										if(ret[0] === true){
											$(cc).empty();
											$(that.element).grid("setCell",that.rows[iRow].id, iCol, v2, false, false, true);
											$(cc).addClass("dirty-cell");
											$(that.rows[iRow]).addClass("edited");
											$(that).triggerHandler("jqGridAfterSaveCell", [that.rows[iRow].id, nm, v, iRow, iCol]);
											if ($.isFunction(that.options.afterSaveCell)) {
												that.options.afterSaveCell.call(that, that.rows[iRow].id,nm, v, iRow,iCol);
											}
											that.options.savedRow.splice(0,1);
										} else {
											$.grid.info_dialog($.grid.errors.errcap,ret[1],$.grid.edit.bClose);
											$(that.element).grid("restoreCell",iRow,iCol);
										}
									}
								},
								error:function(res,stat,err) {
									$("#lui_"+$.grid.coralID(that.options.id)).hide();
									that.grid.columnsView.loading = false;
									$(that).triggerHandler("jqGridErrorCell", [res, stat, err]);
									if ($.isFunction(that.options.errorCell)) {
										that.options.errorCell.call(that, res,stat,err);
										$(that.element).grid("restoreCell",iRow,iCol);
									} else {
										$.grid.info_dialog($.grid.errors.errcap,res.status+" : "+res.statusText+"<br/>"+stat,$.grid.edit.bClose);
										$(that.element).grid("restoreCell",iRow,iCol);
									}
								}
							}, $.grid.ajaxOptions, that.options.ajaxCellOptions || {}));
						} else {
							try {
								$.grid.info_dialog($.grid.errors.errcap,$.grid.errors.nourl,$.grid.edit.bClose);
								$(that.element).grid("restoreCell",iRow,iCol);
							} catch (e) {}
						}
					}
					if (that.options.cellsubmit == 'clientArray') {
						$(cc).empty();
						$(that.element).grid("setCell",that.rows[iRow].id,iCol, v2, false, false, true);
						$(cc).addClass("dirty-cell");
						$(that.rows[iRow]).addClass("edited");
						that._trigger("afterSaveCell", null, [{"rowId":that.rows[iRow].id,"name":nm,"cellValue":v,"rowIndex":iRow,"celIndex":iCol}]);
						that.options.savedRow.splice(0,1);
					}
				} else {
					try {
						window.setTimeout(function(){$.grid.info_dialog($.grid.errors.errcap,v+" "+cv[1],$.grid.edit.bClose);},100);
						$(that.element).grid("restoreCell",iRow,iCol);
					} catch (e) {}
				}
			} else {
				$(that.element).grid("restoreCell",iRow,iCol);
			}
			/*if ( this.options.autoValid ) {
				this.valid( that.rows[iRow].id, cm.name );
			}*/
		}
		//if ($.browser.opera) {
		if (false) {
			$("#"+$.grid.coralID(that.options.knv)).attr("tabindex","-1").focus();
		} else {
			window.setTimeout(function () { $("#"+$.grid.coralID(that.options.knv)).attr("tabindex","-1").focus();},0);
		}
		//$(cc).validate("destroy");
	},
	restoreCell : function(iRow, iCol) {
		var that= this, fr;
		if (!that.grid || that.options.cellEdit !== true ) {return;}
		if ( that.options.savedRow.length >= 1) {fr = 0;} else {fr=null;}
		if(fr !== null) {
			var cc = $("td:eq("+iCol+")",that.rows[iRow]);
			// datepicker fix
			/*if($.isFunction($.fn.datepicker)) {
				try {
					$("input.hasDatepicker",cc).datepicker('hide');
				} catch (e) {}
			}*/
			$(cc).empty().attr("tabindex","-1");
			$(that.element).grid("setCell",that.rows[iRow].id, iCol, that.options.savedRow[fr].value, false, false, true);
			$(that).triggerHandler("jqGridAfterRestoreCell", [that.rows[iRow].id, that.options.savedRow[fr].value, iRow, iCol]);
			if ($.isFunction(that.options.afterRestoreCell)) {
				that.options.afterRestoreCell.call(that, that.rows[iRow].id, that.options.savedRow[fr].value, iRow, iCol);
			}				
			that.options.savedRow.splice(0,1);
		}
		window.setTimeout(function () { $("#"+that.options.knv).attr("tabindex","-1").focus();},0);
	},
	nextCell : function (iRow,iCol) {
		var that = this, nCol=false;
		if (!that.grid || that.options.cellEdit !== true) {return;}
		// try to find next editable cell
		for (var i=iCol+1; i<that.options.colModel.length; i++) {
			if ( that.options.colModel[i].editable ===true) {
				nCol = i; break;
			}
		}
		if(nCol !== false) {
			$(that.element).grid("editCell",iRow,nCol,true);
		} else {
			if (that.options.savedRow.length >0) {
				$(that.element).grid("saveCell",iRow,iCol);
			}
		}
	},
	prevCell : function (iRow,iCol) {
		var that = this, nCol=false;
		if (!that.grid || that.options.cellEdit !== true) {return;}
		// try to find next editable cell
		for (var i=iCol-1; i>=0; i--) {
			if ( that.options.colModel[i].editable ===true) {
				nCol = i; break;
			}
		}
		if(nCol !== false) {
			$(that.element).grid("editCell",iRow,nCol,true);
		} else {
			if (that.options.savedRow.length >0) {
				$(that.element).grid("saveCell",iRow,iCol);
			}
		}
	},
	getChangedCells : function (mthd) {
		var ret=[];
		if (!mthd) {mthd='all';}
		var that= this, nm, success = true;
		if (!that.grid || that.options.cellEdit !== true ) {return;}
		$(that.rows).each(function(j){
			var res = {};
			if ($(this).hasClass("edited")) {
				$('td',this).each( function(i) {
					nm = that.options.colModel[i].name;
					if ( nm !== 'cb' && nm !== 'subgrid') {
						if ( $(this).hasClass( "coral-gridcell-error" ) ) {
							success = false;
							return false;
						}
						if (mthd=='dirty') {
							if ($(this).hasClass('dirty-cell')) {
								try {
									res[nm] = $.unformat.call(that,this,{rowId:that.rows[j].id, colModel:that.options.colModel[i]},i);
								} catch (e){
									res[nm] = $.jgrid.htmlDecode($(this).html());
								}
							}
						} else {
							try {
								res[nm] = $.unformat.call(that,this,{rowId:that.rows[j].id,colModel:that.options.colModel[i]},i);
							} catch (e) {
								res[nm] = $.jgrid.htmlDecode($(this).html());
							}
						}
					}
				});
				if(!success){
					return false;
				}
				res.id = this.id;
				ret.push(res);
			}
		});
		if(!success){
			ret = [];
		}
		return ret;
	}
});
// noDefinePart
} ) );