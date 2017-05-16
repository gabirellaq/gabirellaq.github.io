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
/**
 * grid extension for manipulating Grid Data
 * Tony Tomov tony@trirand.com
 * http://trirand.com/blog/ 
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
**/ 
//jsHint options
/*global alert, $, jQuery */
"use strict";
$.coral.grid.inlineEdit = $.coral.grid.inlineEdit || {};
$.component( "coral.grid", $.coral.grid, {
//Editing
	editButtonsPos: function(rowid,inlineBtn){
		var $t = this,ids,ind,height,gridViewHeight;
		ids = $($t.element).grid("getDataIDs");
		ind = $($t.element).grid("getInd",rowid,true);
		gridViewHeight = $t.element.find(".coral-grid-rows-view").outerHeight();
		height = $t.element.find(".coral-grid-btable").outerHeight();
		if((height + $(ind).outerHeight() > gridViewHeight) && rowid == ids[ids.length-1]){
			inlineBtn.position({
				my: "left-"+(inlineBtn.outerWidth()/2)+" top-2",
				at: "right-"+($(ind).outerWidth()/2)+" top-"+($(inlineBtn).outerHeight()),
				collision: "fit",
				of: $(ind)
			});
		}else{
			inlineBtn.position({
				my: "left-"+(inlineBtn.outerWidth()/2)+" top-2",
				at: "right-"+($(ind).outerWidth()/2)+" top+"+($(ind).outerHeight()),
				collision: "fit",
				of: $(ind)
			});
		}
	},
	editRow : function(rowid,keys,oneditfunc,successfunc, url, extraparam, aftersavefunc,errorfunc, afterrestorefunc) {
		// Compatible mode old versions
		var o={}, args = $.makeArray(arguments).slice(1);

		if( $.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if (typeof keys !== "undefined") { o.keys = keys; }
			if ($.isFunction(oneditfunc)) { o.oneditfunc = oneditfunc; }
			if ($.isFunction(successfunc)) { o.successfunc = successfunc; }
			if (typeof url !== "undefined") { o.url = url; }
			if (typeof extraparam !== "undefined") { o.extraparam = extraparam; }
			if ($.isFunction(aftersavefunc)) { o.aftersavefunc = aftersavefunc; }
			if ($.isFunction(errorfunc)) { o.errorfunc = errorfunc; }
			if ($.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
			// last two not as param, but as object (sorry)
			//if (typeof restoreAfterError !== "undefined") { o.restoreAfterError = restoreAfterError; }
			//if (typeof mtype !== "undefined") { o.mtype = mtype || "POST"; }			
		}
		o = $.extend(true, {
			keys : true,
			oneditfunc: null,
			successfunc: null,
			url: "clientArray",
			extraparam: {},
			aftersavefunc: null,
			errorfunc: null,
			afterrestorefunc: null,
			restoreAfterError: true,
			mtype: "POST"
		}, $.coral.grid.inlineEdit, o );

		// End compatible
		var $t = this, nm, tmp, editable, cnt=0, focus=null, svr={}, ind,cm;
		if (!$t.grid ) { return; }
		ind = $($t.element).grid("getInd",rowid,true);
		$t.options.editrow = rowid;
		$t.editRowIndex = rowid;// for editing
		if( ind === false ) {return;}
		editable = $(ind).attr("editable") || "0";
		if ( $t._trigger("beforeInlineEditRow",null,[{"rowId":rowid, "options":o}]) == false ) return;
		if (editable == "0" && !$(ind).hasClass("not-editable-row")) {
			if ( this.options.rowEditButtons ) {
				var inlineBtn = $("<div class='row-editable coral-grid-rows'><div class='row-editable-btns coral-state-highlight'>" +
						"<div class='grid_edit_toolbar'></div>" +
						"</div></div>");								
				var editBarData = [];

				var updateBtn = {
					"type": "button",
					"id": "update",
					"label": $.grid.edit.bUpdate,
					"name": "update",
					"onClick":function(){
					var status = $t.saveRow(ind.id, null, "clientArray");
					}
				}
				var cancelBtn = {
						"type": "button",
						"id": "cancel",
						"label": $.grid.edit.bCancel,
						"name": "cancel",
						'onClick': function(){
							$t.restoreRow(ind.id);
							inlineBtn.remove();
					        $t._trigger("afterInlineCancelRow", null, [{'rowId': ind.id, 'options': o, 'isUpdated': !$(ind.id).hasClass("new-row")}]);
						}	
				};
				if ( this.options.rowEditButtons.length === 0){
					this.options.rowEditButtons = ["update","cancel"];
				}
				for(var i=0;i<this.options.rowEditButtons.length;i++){
					if ( this.options.rowEditButtons[i]=='update' ) {
						
						editBarData.push(updateBtn);
					} else if (this.options.rowEditButtons[i]=='cancel' ) {
							editBarData.push(cancelBtn);
					} else {
						
						editBarData.push(this.options.rowEditButtons[i]);
					}
				}
				this.rowEditButtons = inlineBtn;

				$t.element.find(".row-editable").remove();
				$t.element.find(".coral-grid-view").prepend(inlineBtn[0]);
				$( '.grid_edit_toolbar', $t.element ).toolbar({
					data : editBarData
				})
				this._delay(function(){
					this.editButtonsPos(rowid,inlineBtn);
				});
			}
			cm = $t.options.colModel;
			$('td[role="gridcell"]',ind).each( function(i) {
				nm = cm[i].name;
				var treeg = $t.options.treeGrid===true && nm == $t.options.ExpandColumn;
				if(treeg) { tmp = $("span:first",this).html();}
				else {
					try {
						tmp = $.unformat.call($t,this,{rowId:rowid, colModel:cm[i]},i);
					} catch (_) {
						tmp =  ( cm[i].edittype && cm[i].edittype == 'textarea' ) ? $(this).text() : $(this).html();
					}
				}
				if ( nm != 'cb' && nm != 'subgrid' && nm != 'rn') {
					if($t.options.autoencode) { tmp = $.grid.htmlDecode(tmp); }
					svr[nm]=tmp;
					if(cm[i].editable===true) {
						if(focus===null) { focus = i; }
						if (treeg) { $("span:first",this).html(""); }
						else { $(this).html(""); }
						var opt = $.extend({},cm[i].editoptions || {},{id:rowid+"_"+nm,name:nm});
						if(!cm[i].edittype) { cm[i].edittype = "text"; }
						if(tmp == "&nbsp;" || tmp == "&#160;" || (tmp.length==1 && tmp.charCodeAt(0)==160) ) {tmp='';}
						var elc = $.grid.createEl.call($t,cm[i].edittype,opt,tmp,false,$.extend({},$.grid.ajaxOptions,$t.options.ajaxSelectOptions || {}));
						$(elc).addClass("editable");
						if(treeg) { $("span:first",this).append(elc); }
						else { $(this).append(elc); }

						var editoptions = cm[i].editoptions || {};
						var postMode = editoptions.postMode || "value";
						$.extend(editoptions,{
							'onValidError': function(e, ui){
								$(elc).parents("td").addClass("coral-gridcell-error");
								e.stopPropagation();
							},
							'onValidSuccess': function(e, ui){
								$(elc).parents("td").removeClass("coral-gridcell-error");
								e.stopPropagation();
							},
							'onKeyDown': function(e, ui){
								//e.stopPropagation();
							},
							'onClick': function(e, ui){
								e.stopPropagation();
							},
							dataCustom: {
								rowId: rowid,
								gridId: $t.options.id
							}
						});
						var edittype = cm[i].edittype;
						switch( edittype ){
							case 'autocomplete': 
								var value = $(elc).val();
								var isUrl = typeof ( editoptions.source ) == "string";
								
								var _onSelect = editoptions.onSelect;
								editoptions = $.extend({}, editoptions, {"onSelect":function(e, ui){
									$(elc).closest("td").attr("data-org", isUrl?ui.value:ui.text);
									_onSelect&&_onSelect.apply(elc, [e, ui]);
								}});
								// url模式
								if ( isUrl ) {
									editoptions.postMode = "text";
									$(elc).autocomplete(editoptions);
									$( elc ).autocomplete( "setValue", value );
								} else {//data模式
									$(elc).autocomplete(editoptions);
									if ( postMode == "value" ) {
										$( elc ).autocomplete( "setValue", value );
									} else {
										$( elc ).autocomplete( "setValue", value );
										$( elc ).autocomplete( "setText", value );
									}
								}
								break;
							case 'checkbox': 
								$(elc).checkbox(editoptions);	
								var cbv = ["Yes","No"];
								if( editoptions && editoptions.value) {
									cbv = editoptions.value.split(":");
								}
								if ( $(elc).val() == cbv[0] ) {
									$(elc).checkbox("check");
								} else {
									$(elc).checkbox("uncheck");
								}
								break;
							case 'combogrid':
							case 'combobox': 
							case 'combotree': 
								$(elc)[ edittype ](editoptions);
/*
								if ( postMode == "value" ) {
									$( elc )[ edittype ]( "setValues", $(elc).val().split(",") );
								} else {
									// TODO: combotree还未实现该方法，可能会报错
									$( elc )[ edittype ]( "setText", $(elc).val() );
								}
								editoptions = null;*/
								$( elc )[ edittype ]( "setValues", $(elc).val().split(",") );
								break;
							case 'text':
							case 'textarea':
								$( elc )[ "textbox" ]( editoptions );
								break;
							default:
								$( elc )[ edittype ]( editoptions );
								break;
						}
						cnt++;
					}
				}
			});
			if(cnt > 0) {
				svr.id = rowid; $t.options.savedRow.push(svr);
				$(ind).attr("editable","1");
				$("td:eq("+focus+") input",ind).focus();
				if(o.keys===true) {
					$(ind).bind("keydown",function(e) {
						if (e.keyCode === 27) {
							$($t.element).grid("restoreRow",rowid, o.afterrestorefunc);
							if($t.options._inlinenav) {
								try {
									$($t.element).grid('showAddEditButtons');
								} catch (eer1) {}
							}
							return false;
						}
						if (e.keyCode === 13) {
							var ta = e.target;
							if(ta.tagName == 'TEXTAREA') { return true; }
							if( $($t.element).grid("saveRow", rowid, o) ) {
								if($t.options._inlinenav) {
									try {
										$($t.element).grid('showAddEditButtons');
									} catch (eer2) {}
								}
							}
							return false;
						}
					});
				}
				/*$($t).triggerHandler("gridInlineEditRow", [rowid, o]);
				if( $.isFunction(o.oneditfunc)) { o.oneditfunc.call($t, rowid); }*/
				$t._trigger("onInlineEditRow",null,[{"rowId":rowid, "options":o}]);
			}
		}
		/*var validateCom = $.coral.findComponent( ".ctrl-init-validate", $( ind ).parent() );
		if( validateCom.length ){
			for( var i=0; i < validateCom.length; i++ ){
				validateCom[i].destroy();
			}
		}
		$( ind ).validate();*/
	},
	saveRow : function(rowid, successfunc, url, extraparam, aftersavefunc,errorfunc, afterrestorefunc) {
		// Compatible mode old versions
		var args = $.makeArray(arguments).slice(1), o = {};

		if( $.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if ($.isFunction(successfunc)) { o.successfunc = successfunc; }
			if (typeof url !== "undefined") { o.url = url; }
			if (typeof extraparam !== "undefined") { o.extraparam = extraparam; }
			if ($.isFunction(aftersavefunc)) { o.aftersavefunc = aftersavefunc; }
			if ($.isFunction(errorfunc)) { o.errorfunc = errorfunc; }
			if ($.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
		}
		o = $.extend(true, {
			successfunc: null,
			url: null,
			extraparam: {},
			aftersavefunc: null,
			errorfunc: null,
			afterrestorefunc: null,
			restoreAfterError: true,
			mtype: "POST"
		}, $.grid.inlineEdit, o );
		// End compatible

		var success = false;
		var $t = this, nm, tmp={}, tmp2={}, tmp3= {}, editable, fr, cv, ind;
		if (!$t.grid ) { return success; }
		ind = $($t.element).grid("getInd",rowid,true);
		// 进行错误校验 有错误则阻止保存
		//success = $.coral.valid( $( ind ), false );
		/*success = $( ind ).validate("valid");
		if( !success ){
			$.message("请确认是否输入正确！");return success;
		}*/
		if(ind === false) {return success;}
		if ( this.options.autoValid ) {
			var isValid = this.valid( ind.id );
			if ( !this.options.allowSaveOnError && !isValid ) {
				$.message("请确认是否输入正确！");return isValid;
			}
		}
		editable = $(ind).attr("editable");
		o.url = o.url ? o.url : $t.options.editurl;
		// 如果url为undefined 则默认设置为clientArray，因为大部分都是用客户端提交的方式
		o.url = o.url ? o.url : "clientArray";
		if (editable==="1") {
			var cm;
			$('td[role="gridcell"]',ind).each(function(i) {
				cm = $t.options.colModel[i];
				nm = cm.name;
				if ( nm != 'cb' && nm != 'subgrid' && cm.editable===true && nm != 'rn' && !$(this).hasClass('not-editable-cell')) {
					var edittype = cm.edittype;
					switch (edittype) {
						case "checkbox":
							var cbv = ["Yes","No"];
							if(cm.editoptions ) {
								cbv = cm.editoptions.value.split(":");
							}
							tmp[nm]=  $("input",this).is(":checked") ? cbv[0] : cbv[1]; 
							break;
						case 'datepicker':
							tmp[nm]=$("input[type='hidden']",this).val();
							break;
						case 'autocomplete':
							if ( typeof ( cm.editoptions.source ) == "string" ) {
								tmp[nm]=$(".ctrl-init-"+edittype,this)[ edittype ]( "getText" );
							} else {
								tmp[nm]=$(".ctrl-init-"+edittype,this)[ edittype ]( "getValue" );
							}
							break;
						case 'text':
						case 'password':
						case 'textarea':
						case "button" :
							tmp[nm]=$("input, textarea",this).val();
							break;
						case 'combogrid':
						case 'combobox':
						case 'combotree':
							/*if(!cm.editoptions) {
								tmp[nm] = $(".ctrl-init:first", this)[ edittype ]( "getValues" ).toString();
								tmp2[nm] = $(".ctrl-init:first", this)[ edittype ]( "getText" );
							} else {
								tmp[nm] = $(".ctrl-init:first", this)[ edittype ]( "getValues" ).toString();
								tmp2[nm] = $(".ctrl-init:first", this)[ edittype ]( "getText" );
							}*/
							tmp[nm] = $(".ctrl-init-"+edittype, this)[ edittype ]( "getValues" ).toString();
							tmp2[nm] = $(".ctrl-init-"+edittype, this)[ edittype ]( "getText" )
							if(cm.formatter && cm.formatter == edittype ) { tmp2={}; }
							break;
						case 'custom' :
							try {
								if(cm.editoptions && $.isFunction(cm.editoptions.custom_value)) {
									tmp[nm] = cm.editoptions.custom_value.call($t, $(".customelement",this),'get');
									if (tmp[nm] === undefined) { throw "e2"; }
								} else { throw "e1"; }
							} catch (e) {
								if (e=="e1") { $.grid.info_dialog($.grid.errors.errcap,"function 'custom_value' "+$.grid.edit.msg.nodefined,$.grid.edit.bClose); }
								if (e=="e2") { $.grid.info_dialog($.grid.errors.errcap,"function 'custom_value' "+$.grid.edit.msg.novalue,$.grid.edit.bClose); }
								else { $.grid.info_dialog($.grid.errors.errcap,e.message,$.grid.edit.bClose); }
							}
							break;
					}
					cv = $.grid.checkValues(tmp[nm],i,$t);
					if(cv[0] === false) {
						cv[1] = tmp[nm] + " " + cv[1];
						return false;
					}
					if($t.options.autoencode) { tmp[nm] = $.grid.htmlEncode(tmp[nm]); }
					if(o.url !== 'clientArray' && cm.editoptions /*&& cm.editoptions.NullIfEmpty === true*/) {
						if(tmp[nm] === "") {
							tmp3[nm] = 'null';
						}
					}
				}
			});
			if (cv[0] === false){
				try {
					var positions = $.grid.findPos($("#"+$.grid.coralID(rowid), $t.grid.bDiv)[0]);
					$.grid.info_dialog($.grid.errors.errcap,cv[1],$.grid.edit.bClose,{left:positions[0],top:positions[1]});
				} catch (e) {
					alert(cv[1]);
				}
				return success;
			}
			var idname, opers, oper;
			opers = $t.options.prmNames;
			oper = opers.oper;
			if ($t.options.keyName === false) {
				idname = opers.id;
			} else {
				idname = $t.options.keyName;
			}
			if(tmp) {
				tmp[oper] = opers.editoper;
				tmp[idname] = rowid;
				if(typeof($t.options.inlineData) == 'undefined') { $t.options.inlineData ={}; }
				tmp = $.extend({},tmp,$t.options.inlineData,o.extraparam);
			}
			if (o.url == 'clientArray') {
				//tmp = $.extend({},tmp, tmp2);
				if($t.options.autoencode) {
					$.each(tmp,function(n,v){
						tmp[n] = $.grid.htmlDecode(v);
					});
				}
				var resp = $($t.element).grid("setRowData",rowid,tmp);
				$(ind).attr("editable","0");
				for( var k=0;k<$t.options.savedRow.length;k++) {
					if( $t.options.savedRow[k].id == rowid) {fr = k; break;}
				}
				if(fr >= 0) { $t.options.savedRow.splice(fr,1); }
				success = resp;
				if(success)$t.options.editrow = null;//成功后删除
				if ( $t.options.rowEditButtons  ) {
					$t.rowEditButtons.hide();
				}
				$t._trigger("afterInlineSaveRow", null, [{'rowId': rowid, 'options': o, 'status': resp}]);
				//$($t).triggerHandler("gridInlineAfterSaveRow", [rowid, resp, tmp, o]);
				if( $.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid,resp); }
				$(ind).unbind("keydown");
			} else {
				$("#lui_"+$.grid.coralID($t.options.id)).show();
				tmp3 = $.extend({},tmp,tmp3);
				tmp3[idname] = $.grid.stripPref($t.options.idPrefix, tmp3[idname]);
				$.ajax($.extend({
					url:o.url,
					data: $.isFunction($t.options.serializeRowData) ? $t.options.serializeRowData.call($t, tmp3) : tmp3,
					type: o.mtype,
					async : false, //?!?
					complete: function(res,stat){
						$("#lui_"+$.grid.coralID($t.options.id)).hide();
						if (stat === "success"){
							var ret = true, sucret;
							sucret = $t._trigger("inlineSuccessSaveRow", null, [{'res':res, 'rowId': rowid, 'options': o}]);
							if (!$.isArray(sucret)) {sucret = [true, tmp];}
							if (sucret[0] && $.isFunction(o.successfunc)) {sucret = o.successfunc.call($t, res);}							
							if($.isArray(sucret)) {
								// expect array - status, data, rowid
								ret = sucret[0];
								tmp = sucret[1] ? sucret[1] : tmp;
							} else {
								ret = sucret;
							}
							if (ret===true) {
								if($t.options.autoencode) {
									$.each(tmp,function(n,v){
										tmp[n] = $.grid.htmlDecode(v);
									});
								}
								tmp = $.extend({},tmp, tmp2);
								$($t.element).grid("setRowData",rowid,tmp);
								$(ind).attr("editable","0");
								for( var k=0;k<$t.options.savedRow.length;k++) {
									if( $t.options.savedRow[k].id == rowid) {fr = k; break;}
								}
								if(fr >= 0) { $t.options.savedRow.splice(fr,1); }
								$($t).triggerHandler("gridInlineAfterSaveRow", [rowid, res, tmp, o]);
								if( $.isFunction(o.aftersavefunc) ) { o.aftersavefunc.call($t, rowid,res); }
								success = true;
								$t.options.editrow = null;//成功后删除
								if ( $t.rowEditButtons  ) {
									$t.rowEditButtons.hide();
								}
								$t._trigger("afterInlineSaveRow", null, [{'rowId': rowid, 'options': o, 'status': resp}]);
								$(ind).unbind("keydown");
							} else {
								$($t).triggerHandler("gridInlineErrorSaveRow", [rowid, res, stat, null, o]);
								if($.isFunction(o.errorfunc) ) {
									o.errorfunc.call($t, rowid, res, stat, null);
								}
								if(o.restoreAfterError === true) {
									$($t.element).grid("restoreRow",rowid, o.afterrestorefunc);
								}
							}
						}
					},
					error:function(res,stat,err){
						$("#lui_"+$.grid.coralID($t.options.id)).hide();
						$($t).triggerHandler("gridInlineErrorSaveRow", [rowid, res, stat, err, o]);
						if($.isFunction(o.errorfunc) ) {
							o.errorfunc.call($t, rowid, res, stat, err);
						} else {
							try {
								$.grid.info_dialog($.grid.errors.errcap,'<div class="coral-state-error">'+ res.responseText +'</div>', $.grid.edit.bClose,{buttonalign:'right'});
							} catch(e) {
								alert(res.responseText);
							}
						}
						if(o.restoreAfterError === true) {
							$($t.element).grid("restoreRow",rowid, o.afterrestorefunc);
						}
					}
				}, $.grid.ajaxOptions, $t.options.ajaxRowOptions || {}));
			}
		}
		if(success){
			//$( ind ).validate("destroy");
			$(ind).removeClass("new-row");
		}
		return success;
	},
	restoreRow : function(rowid, afterrestorefunc) {
		// Compatible mode old versions
		var args = $.makeArray(arguments).slice(1), o={};

		if( $.type(args[0]) === "object" ) {
			o = args[0];
		} else {
			if ($.isFunction(afterrestorefunc)) { o.afterrestorefunc = afterrestorefunc; }
		}
		o = $.extend(true, $.grid.inlineEdit, o );

		// End compatible

		//return this.each(function(){
		var $t= this, fr, ind, ares={};
		if (!$t.grid ) { return; }
		ind = $($t.element).grid("getInd",rowid,true);
		if( $t.options.editrow && rowid == $t.options.editrow ){
			$t.options.editrow = null;//如果重置的是当前编辑的id则删除
			$t.clearErrors(rowid);
		}
		//$(ind).children("td.coral-gridcell-error").removeClass("coral-gridcell-error");
		if(ind === false) {return;}
		for( var k=0;k<$t.options.savedRow.length;k++) {
			if( $t.options.savedRow[k].id == rowid) {fr = k; break;}
		}
		if(fr >= 0) {
			if($.isFunction($.fn.datepicker)) {
				try {
					$("input.hasDatepicker","#"+$.grid.coralID(ind.id)).datepicker('hide');
				} catch (e) {}
			}
			$.each($t.options.colModel, function(){
				if(this.editable === true && this.name in $t.options.savedRow[fr] ) {
					ares[this.name] = $t.options.savedRow[fr][this.name];
				}
			});
			$($t.element).grid("setRowData",rowid,ares);
			$(ind).attr("editable","0").unbind("keydown");
			$t.options.savedRow.splice(fr,1);
			if($("#"+$.grid.coralID(rowid), "#"+$.grid.coralID($t.options.id)).hasClass("grid-new-row")){
				setTimeout(function(){$($t.element).grid("delRowData",rowid);},0);
			}
		}
		$($t).triggerHandler("gridInlineAfterRestoreRow", [rowid]);
		if ($.isFunction(o.afterrestorefunc))
		{
			o.afterrestorefunc.call($t, rowid);
		}
		if ($t.options.rowEditButtons) {
			$t.rowEditButtons.hide();
		}
		//});
	},
	addRow : function ( p ) {
		p = $.extend(true, {
			rowID : "new_row",
			initdata : {},
			position :"first",
			useDefValues : true,
			useFormatter : false,
			addRowParams : {extraparam:{}}
		},p  || {});
		if (!this.grid ) { return; }
		var $t = this;
		if(p.useDefValues === true) {
			$($t.options.colModel).each(function(){
				if( this.editoptions && this.editoptions.defaultValue ) {
					var opt = this.editoptions.defaultValue,
					tmp = $.isFunction(opt) ? opt.call($t) : opt;
					p.initdata[this.name] = tmp;
				}
			});
		}
		$($t.element).grid('addRowData', p.rowID, p.initdata, p.position);
		$("#"+$.grid.coralID(p.rowID), "#"+$.grid.coralID($t.options.id)).addClass("grid-new-row");
		if(p.useFormatter) {
			$("#"+$.grid.coralID(p.rowID)+" .coral-inline-edit", "#"+$.grid.coralID($t.options.id)).click();
		} else {
			var opers = $t.options.prmNames,
			oper = opers.oper;
			p.addRowParams.extraparam[oper] = opers.addoper;
			$($t.element).grid('editRow', p.rowID, p.addRowParams);
			$($t.element).grid('setSelection', p.rowID);
		}
	},
	clearEdited: function(rowId){
		var $tr = $( this.getInd(rowId, true) );
		$tr.removeClass("edited");
		$tr.children("td").removeClass("dirty-cell");
	},
	inlineNav : function (elem, o) {
		o = $.extend({
			edit: true,
			editicon: "coral-icon-pencil",
			add: true,
			addicon:"coral-icon-plus",
			save: true,
			saveicon:"coral-icon-disk",
			cancel: true,
			cancelicon:"coral-icon-cancel",
			addParams : {useFormatter : false,rowID : "new_row"},
			editParams : {},
			restoreAfterSelect : true
		}, $.grid.nav, o ||{});
		return this.each(function(){
			if (!this.grid ) { return; }
			var $t = this, onSelect, gID = $.grid.coralID($t.options.id);
			$t.options._inlinenav = true;
			// detect the formatactions column
			if(o.addParams.useFormatter === true) {
				var cm = $t.options.colModel,i;
				for (i = 0; i<cm.length; i++) {
					if(cm[i].formatter && cm[i].formatter === "actions" ) {
						if(cm[i].formatoptions) {
							var defaults =  {
								keys:false,
								onEdit : null,
								onSuccess: null,
								afterSave:null,
								onError: null,
								afterRestore: null,
								extraparam: {},
								url: null
							},
							ap = $.extend( defaults, cm[i].formatoptions );
							o.addParams.addRowParams = {
								"keys" : ap.keys,
								"oneditfunc" : ap.onEdit,
								"successfunc" : ap.onSuccess,
								"url" : ap.url,
								"extraparam" : ap.extraparam,
								"aftersavefunc" : ap.afterSavef,
								"errorfunc": ap.onError,
								"afterrestorefunc" : ap.afterRestore
							};
						}
						break;
					}
				}
			}
			if(o.add) {
				$($t.element).grid('navButtonAdd', elem,{
					caption : o.addtext,
					title : o.addtitle,
					buttonicon : o.addicon,
					id : $t.options.id+"_iladd",
					onClickButton : function () {
						$($t.element).grid('addRow', o.addParams);
						if(!o.addParams.useFormatter) {
							$("#"+gID+"_ilsave").removeClass('coral-state-disabled');
							$("#"+gID+"_ilcancel").removeClass('coral-state-disabled');
							$("#"+gID+"_iladd").addClass('coral-state-disabled');
							$("#"+gID+"_iledit").addClass('coral-state-disabled');
						}
					}
				});
			}
			if(o.edit) {
				$($t.element).grid('navButtonAdd', elem,{
					caption : o.edittext,
					title : o.edittitle,
					buttonicon : o.editicon,
					id : $t.options.id+"_iledit",
					onClickButton : function () {
						var sr = $($t.element).grid('getGridParam','selrow');
						if(sr) {
							$($t.element).grid('editRow', sr, o.editParams);
							$("#"+gID+"_ilsave").removeClass('coral-state-disabled');
							$("#"+gID+"_ilcancel").removeClass('coral-state-disabled');
							$("#"+gID+"_iladd").addClass('coral-state-disabled');
							$("#"+gID+"_iledit").addClass('coral-state-disabled');
						} else {
							$.grid.viewModal("#alertmod",{gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
			}
			if(o.save) {
				$($t.element).grid('navButtonAdd', elem,{
					caption : o.savetext || '',
					title : o.savetitle || 'Save row',
					buttonicon : o.saveicon,
					id : $t.options.id+"_ilsave",
					onClickButton : function () {
						var sr = $t.options.savedRow[0].id;
						if(sr) {
							var opers = $t.options.prmNames,
							oper = opers.oper;
							if(!o.editParams.extraparam) {
								o.editParams.extraparam = {};
							}
							if($("#"+$.grid.coralID(sr), "#"+gID ).hasClass("grid-new-row")) {
								o.editParams.extraparam[oper] = opers.addoper;
							} else {
								o.editParams.extraparam[oper] = opers.editoper;
							}
							if( $($t.element).grid('saveRow', sr, o.editParams) ) {
								$($t.element).grid('showAddEditButtons');
							}
						} else {
							$.grid.viewModal("#alertmod",{gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
				$("#"+gID+"_ilsave").addClass('coral-state-disabled');
			}
			if(o.cancel) {
				$($t.element).grid('navButtonAdd', elem,{
					caption : o.canceltext || '',
					title : o.canceltitle || 'Cancel row editing',
					buttonicon : o.cancelicon,
					id : $t.options.id+"_ilcancel",
					onClickButton : function () {
						var sr = $t.options.savedRow[0].id;
						if(sr) {
							$($t.element).grid('restoreRow', sr, o.editParams);
							$($t.element).grid('showAddEditButtons');
						} else {
							$.grid.viewModal("#alertmod",{gbox:"#gbox_"+gID,jqm:true});$("#jqg_alrt").focus();							
						}
					}
				});
				$("#"+gID+"_ilcancel").addClass('coral-state-disabled');
			}
			if(o.restoreAfterSelect === true) {
				if($.isFunction($t.options.beforeSelectRow)) {
					onSelect = $t.options.beforeSelectRow;
				} else {
					onSelect =  false;
				}
				$t.options.beforeSelectRow = function(id, stat) {
					var ret = true;
					if($t.options.savedRow.length > 0 && $t.options._inlinenav===true && ( id !== $t.options.selrow && $t.options.selrow !==null) ) {
						if($t.options.selrow == o.addParams.rowID ) {
							$($t.element).grid('delRowData', $t.options.selrow);
						} else {
							$($t.element).grid('restoreRow', $t.options.selrow, o.editParams);
						}
						$($t.element).grid('showAddEditButtons');
					}
					if(onSelect) {
						ret = onSelect.call($t, id, stat);
					}
					return ret;
				};
			}

		});
	},
	showAddEditButtons : function()  {
		return this.each(function(){
			if (!this.grid ) { return; }
			var gID = $.grid.coralID(this.options.id);
			$("#"+gID+"_ilsave").addClass('coral-state-disabled');
			$("#"+gID+"_ilcancel").addClass('coral-state-disabled');
			$("#"+gID+"_iladd").removeClass('coral-state-disabled');
			$("#"+gID+"_iledit").removeClass('coral-state-disabled');
		});
	}
//end inline edit
});
// noDefinePart
} ) );