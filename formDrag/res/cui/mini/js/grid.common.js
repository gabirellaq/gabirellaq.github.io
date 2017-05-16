/*! cui 2016-11-08 */
$.grid=$.grid||{},$.extend($.grid,{showModal:function(a){a.w.show()},closeModal:function(a){a.w.hide().attr("aria-hidden","true"),a.o&&a.o.remove()},hideModal:function(a,b){if(b=$.extend({jqm:!0,gb:""},b||{}),b.onClose){var c=b.onClose(a);if("boolean"==typeof c&&!c)return}if($.fn.jqm&&b.jqm===!0)$(a).attr("aria-hidden","true").jqmHide();else{if(""!==b.gb)try{$(".jqgrid-overlay:first",b.gb).hide()}catch(d){}$(a).hide().attr("aria-hidden","true")}},findPos:function(a){var b=0,c=0;if(a.offsetParent)do b+=a.offsetLeft,c+=a.offsetTop;while(a=a.offsetParent);return[b,c]},createModal:function(a,b,c,d,e,f,g){var h,i=document.createElement("div"),j=this;g=$.extend({},g||{}),h="rtl"==$(c.gbox).attr("dir"),i.className="coral-component coral-component-content coral-corner-all coral-jqdialog",i.id=a.themodal;var k=document.createElement("div");k.className="coral-jqdialog-titlebar coral-component-header coral-corner-all coral-helper-clearfix",k.id=a.modalhead,$(k).append("<span class='coral-jqdialog-title'>"+c.caption+"</span>");var l=$("<a href='javascript:void(0)' class='coral-jqdialog-titlebar-close coral-corner-all'></a>").hover(function(){l.addClass("coral-state-hover")},function(){l.removeClass("coral-state-hover")}).append("<span class='coral-icon coral-icon-closethick'></span>");$(k).append(l),h?(i.dir="rtl",$(".coral-jqdialog-title",k).css("float","right"),$(".coral-jqdialog-titlebar-close",k).css("left","0.3em")):(i.dir="ltr",$(".coral-jqdialog-title",k).css("float","left"),$(".coral-jqdialog-titlebar-close",k).css("right","0.3em"));var m=document.createElement("div");$(m).addClass("coral-jqdialog-content coral-component-content").attr("id",a.modalcontent),$(m).append(b),i.appendChild(m),$(i).prepend(k),f===!0?$("body").append(i):"string"==typeof f?$(f).append(i):$(i).insertBefore(d),$(i).css(g),"undefined"==typeof c.jqModal&&(c.jqModal=!0);var n={};if($.fn.jqm&&c.jqModal===!0){if(0===c.left&&0===c.top&&c.overlay){var o=[];o=this.findPos(e),c.left=o[0]+4,c.top=o[1]+4}n.top=c.top+"px",n.left=c.left}else 0===c.left&&0===c.top||(n.left=c.left,n.top=c.top+"px");if($("a.coral-jqdialog-titlebar-close",k).click(function(){var b=$("#"+$.grid.jqID(a.themodal)).data("onClose")||c.onClose,d=$("#"+$.grid.jqID(a.themodal)).data("gbox")||c.gbox;return j.hideModal("#"+$.grid.jqID(a.themodal),{gb:d,jqm:c.jqModal,onClose:b}),!1}),0!==c.width&&c.width||(c.width=300),0!==c.height&&c.height||(c.height=200),!c.zIndex){var p=$(d).parents("*[role=dialog]").filter(":first").css("z-index");p?c.zIndex=parseInt(p,10)+2:c.zIndex=950}var q=0;if(h&&n.left&&!f&&(q=$(c.gbox).width()-(isNaN(c.width)?0:parseInt(c.width,10))-8,n.left=parseInt(n.left,10)+parseInt(q,10)),n.left&&(n.left+="px"),$(i).css($.extend({width:isNaN(c.width)?"auto":c.width+"px",height:isNaN(c.height)?"auto":c.height+"px",zIndex:c.zIndex,overflow:"hidden"},n)).attr({tabIndex:"-1",role:"dialog","aria-labelledby":a.modalhead,"aria-hidden":"true"}),"undefined"==typeof c.drag&&(c.drag=!0),"undefined"==typeof c.resize&&(c.resize=!0),c.drag)if($(k).css("cursor","move"),$.fn.jqDrag)$(i).jqDrag(k);else try{$(i).draggable({handle:$("#"+$.grid.jqID(k.id))})}catch(r){}if(c.resize)if($.fn.jqResize)$(i).append("<div class='jqResize coral-resizable-handle coral-resizable-se coral-icon coral-icon-gripsmall-diagonal-se coral-icon-grip-diagonal-se'></div>"),$("#"+$.grid.jqID(a.themodal)).jqResize(".jqResize",a.scrollelm?"#"+$.grid.jqID(a.scrollelm):!1);else try{$(i).resizable({handles:"se, sw",alsoResize:a.scrollelm?"#"+$.grid.jqID(a.scrollelm):!1})}catch(s){}c.closeOnEscape===!0&&$(i).keydown(function(b){if(27==b.which){var d=$("#"+$.grid.jqID(a.themodal)).data("onClose")||c.onClose;j.hideModal(this,{gb:c.gbox,jqm:c.jqModal,onClose:d})}})},viewModal:function(a,b){if(b=$.extend({toTop:!0,overlay:10,modal:!1,overlayClass:"coral-component-overlay",onShow:this.showModal,onHide:this.closeModal,gbox:"",jqm:!0,jqM:!0},b||{}),$.fn.jqm&&b.jqm===!0)b.jqM?$(a).attr("aria-hidden","false").jqm(b).jqmShow():$(a).attr("aria-hidden","false").jqmShow();else{""!==b.gbox&&($(".jqgrid-overlay:first",b.gbox).show(),$(a).data("gbox",b.gbox)),$(a).show().attr("aria-hidden","false");try{$(":input:visible",a)[0].focus()}catch(c){}}},info_dialog:function(a,b,c,d){var e={width:290,height:"auto",dataheight:"auto",drag:!0,resize:!1,caption:"<b>"+a+"</b>",left:250,top:170,zIndex:1e3,jqModal:!0,modal:!1,closeOnEscape:!0,align:"center",buttonalign:"center",buttons:[]};$.extend(e,d||{});var f=e.jqModal,g=this;$.fn.jqm&&!f&&(f=!1);var h="";if(e.buttons.length>0)for(var i=0;i<e.buttons.length;i++)"undefined"==typeof e.buttons[i].id&&(e.buttons[i].id="info_button_"+i),h+="<a href='javascript:void(0)' id='"+e.buttons[i].id+"' class='fm-button coral-state-default coral-corner-all'>"+e.buttons[i].text+"</a>";var j=isNaN(e.dataheight)?e.dataheight:e.dataheight+"px",k="text-align:"+e.align+";",l="<div id='info_id'>";l+="<div id='infocnt' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"+j+";"+k+"'>"+b+"</div>",l+=c?"<div class='coral-component-content coral-helper-clearfix' style='text-align:"+e.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a href='javascript:void(0)' id='closedialog' class='fm-button coral-state-default coral-corner-all'>"+c+"</a>"+h+"</div>":""!==h?"<div class='coral-component-content coral-helper-clearfix' style='text-align:"+e.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+h+"</div>":"",l+="</div>";try{"false"==$("#info_dialog").attr("aria-hidden")&&this.hideModal("#info_dialog",{jqm:f}),$("#info_dialog").remove()}catch(m){}this.createModal({themodal:"info_dialog",modalhead:"info_head",modalcontent:"info_content",scrollelm:"infocnt"},l,e,"","",!0),h&&$.each(e.buttons,function(a){$("#"+$.grid.jqID(this.id),"#info_id").bind("click",function(){return e.buttons[a].onClick.call($("#info_dialog")),!1})}),$("#closedialog","#info_id").click(function(){return g.hideModal("#info_dialog",{jqm:f}),!1}),$(".fm-button","#info_dialog").hover(function(){$(this).addClass("coral-state-hover")},function(){$(this).removeClass("coral-state-hover")}),$.isFunction(e.beforeOpen)&&e.beforeOpen(),this.viewModal("#info_dialog",{onHide:function(a){a.w.hide().remove(),a.o&&a.o.remove()},modal:e.modal,jqm:f}),$.isFunction(e.afterOpen)&&e.afterOpen();try{$("#info_dialog").focus()}catch(n){}},createEl:function(a,b,c,d,e){function f(a,b,c){b.hasOwnProperty("id")||$(a).attr("id",$.grid.randId())}var g="",h=this;switch(a){case"textarea":g=document.createElement("textarea"),d?b.cols||$(g).css({width:"98%"}):b.cols||(b.cols=20),b.rows||(b.rows=2),("&nbsp;"==c||"&#160;"==c||1==c.length&&160==c.charCodeAt(0))&&(c=""),g.setAttribute("value",c),f(g,b),$(g).attr({role:"textbox",multiline:"true"});break;case"select":g=document.createElement("select"),g.setAttribute("role","select");var i,j=[];if(b.multiple===!0?(i=!0,g.multiple="multiple",$(g).attr("aria-multiselectable","true")):i=!1,"undefined"!=typeof b.dataUrl)$.ajax($.extend({url:b.dataUrl,type:"GET",dataType:"html",context:{elem:g,options:b,vl:c},success:function(a){var b,c=[],d=this.elem,e=this.vl,g=$.extend({},this.options),i=g.multiple===!0;if($.isFunction(g.buildSelect)){var j=g.buildSelect.call(h,a);b=$(j).html()}else b=$(a).html();b&&($(d).append(b),f(d,g),"undefined"==typeof g.size&&(g.size=i?3:1),i?(c=e.split(","),c=$.map(c,function(a){return $.trim(a)})):c[0]=$.trim(e),setTimeout(function(){$("option",d).each(function(a){0===a&&d.multiple&&(this.selected=!1),$(this).attr("role","option"),($.inArray($.trim($(this).text()),c)>-1||$.inArray($.trim($(this).val()),c)>-1)&&(this.selected="selected")})},0))}},e||{}));else if(b.value){var k;"undefined"==typeof b.size&&(b.size=i?3:1),i&&(j=c.split(","),j=$.map(j,function(a){return $.trim(a)})),"function"==typeof b.value&&(b.value=b.value());var l,m,n,o=void 0===b.separator?":":b.separator,p=void 0===b.delimiter?";":b.delimiter;if("string"==typeof b.value)for(l=b.value.split(p),k=0;k<l.length;k++)m=l[k].split(o),m.length>2&&(m[1]=$.map(m,function(a,b){return b>0?a:void 0}).join(o)),n=document.createElement("option"),n.setAttribute("role","option"),n.value=m[0],n.innerHTML=m[1],g.appendChild(n),i||$.trim(m[0])!=$.trim(c)&&$.trim(m[1])!=$.trim(c)||(n.selected="selected"),i&&($.inArray($.trim(m[1]),j)>-1||$.inArray($.trim(m[0]),j)>-1)&&(n.selected="selected");else if("object"==typeof b.value){var q=b.value;for(var r in q)q.hasOwnProperty(r)&&(n=document.createElement("option"),n.setAttribute("role","option"),n.value=r,n.innerHTML=q[r],g.appendChild(n),i||$.trim(r)!=$.trim(c)&&$.trim(q[r])!=$.trim(c)||(n.selected="selected"),i&&($.inArray($.trim(q[r]),j)>-1||$.inArray($.trim(r),j)>-1)&&(n.selected="selected"))}f(g,b,["value"])}break;case"datepicker":case"autocomplete":case"autocompletetree":case"text":case"password":case"button":var s;s="button"==a?"button":"textbox",g=document.createElement("input"),"datepicker"==a?g.type="text":"autocomplete"==a?g.type="text":g.type=a,g.setAttribute("value",c),f(g,b),"button"!=a&&(d?b.size||$(g).css({width:"98%"}):b.size||(b.size=20)),$(g).attr("role",s);break;case"image":case"file":g=document.createElement("input"),g.type=a,f(g,b);break;case"custom":g=document.createElement("span");try{if(!$.isFunction(b.custom_element))throw"e1";var t=b.custom_element.call(h,c,b);if(!t)throw"e2";t=$(t).addClass("customelement").attr({id:b.id,name:b.name}),$(g).empty().append(t)}catch(u){"e1"==u&&this.info_dialog($.grid.errors.errcap,"function 'custom_element' "+$.grid.edit.msg.nodefined,$.grid.edit.bClose),"e2"==u?this.info_dialog($.grid.errors.errcap,"function 'custom_element' "+$.grid.edit.msg.novalue,$.grid.edit.bClose):this.info_dialog($.grid.errors.errcap,"string"==typeof u?u:u.message,$.grid.edit.bClose)}break;case"checkbox":g=document.createElement("input"),g.type=a,g.setAttribute("value",c),f(g,b);break;case"combobox":case"combotree":case"combogrid":g=document.createElement("input"),g.type="text",g.setAttribute("value",c),f(g,b)}return g},checkDate:function(a,b){var c,d=function(a){return a%4!==0||a%100===0&&a%400!==0?28:29},e=function(a){for(var b=1;a>=b;b++)this[b]=31,4!=b&&6!=b&&9!=b&&11!=b||(this[b]=30),2==b&&(this[b]=29);return this},f={};if(a=a.toLowerCase(),c=-1!=a.indexOf("/")?"/":-1!=a.indexOf("-")?"-":-1!=a.indexOf(".")?".":"/",a=a.split(c),b=b.split(c),3!=b.length)return!1;for(var g,h=-1,i=-1,j=-1,k=0;k<a.length;k++){var l=isNaN(b[k])?0:parseInt(b[k],10);f[a[k]]=l,g=a[k],-1!=g.indexOf("y")&&(h=k),-1!=g.indexOf("m")&&(j=k),-1!=g.indexOf("d")&&(i=k)}g="y"==a[h]||"yyyy"==a[h]?4:"yy"==a[h]?2:-1;var m,n=e(12);return-1===h?!1:(m=f[a[h]].toString(),2==g&&1==m.length&&(g=1),m.length!=g||0===f[a[h]]&&"00"!=b[h]?!1:-1===j?!1:(m=f[a[j]].toString(),m.length<1||f[a[j]]<1||f[a[j]]>12?!1:-1===i?!1:(m=f[a[i]].toString(),!(m.length<1||f[a[i]]<1||f[a[i]]>31||2==f[a[j]]&&f[a[i]]>d(f[a[h]])||f[a[i]]>n[f[a[j]]]))))},isEmpty:function(a){return!(!a.match(/^\s+$/)&&""!==a)},checkTime:function(a){var b,c=/^(\d{1,2}):(\d{2})([ap]m)?$/;if(!this.isEmpty(a)){if(b=a.match(c),!b)return!1;if(b[3]){if(b[1]<1||b[1]>12)return!1}else if(b[1]>23)return!1;if(b[2]>59)return!1}return!0},checkValues:function(a,b,c,d,e){var f,g,h,i,j;if("undefined"==typeof d)if("string"==typeof b){for(g=0,j=c.options.colModel.length;j>g;g++)if(c.options.colModel[g].name==b){f=c.options.colModel[g].editrules,b=g;try{h=c.options.colModel[g].formoptions.label}catch(k){}break}}else b>=0&&(f=c.options.colModel[b].editrules);else f=d,h=void 0===e?"_":e;if(f){if(h||(h=c.options.colNames[b]),f.required===!0&&this.isEmpty(a))return[!1,h+": "+$.grid.edit.msg.required,""];var l=f.required!==!1;if(f.number===!0&&(l!==!1||!this.isEmpty(a))&&isNaN(a))return[!1,h+": "+$.grid.edit.msg.number,""];if("undefined"!=typeof f.minValue&&!isNaN(f.minValue)&&parseFloat(a)<parseFloat(f.minValue))return[!1,h+": "+$.grid.edit.msg.minValue+" "+f.minValue,""];if("undefined"!=typeof f.maxValue&&!isNaN(f.maxValue)&&parseFloat(a)>parseFloat(f.maxValue))return[!1,h+": "+$.grid.edit.msg.maxValue+" "+f.maxValue,""];var m;if(f.email===!0&&!(l===!1&&this.isEmpty(a)||(m=/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,m.test(a))))return[!1,h+": "+$.grid.edit.msg.email,""];if(f.integer===!0&&(l!==!1||!this.isEmpty(a))){if(isNaN(a))return[!1,h+": "+$.grid.edit.msg.integer,""];if(a%1!==0||-1!=a.indexOf("."))return[!1,h+": "+$.grid.edit.msg.integer,""]}if(f.date===!0&&!(l===!1&&this.isEmpty(a)||(i=c.options.colModel[b].formatoptions&&c.options.colModel[b].formatoptions.newformat?c.options.colModel[b].formatoptions.newformat:c.options.colModel[b].datefmt||"Y-m-d",this.checkDate(i,a))))return[!1,h+": "+$.grid.edit.msg.date+" - "+i,""];if(f.time===!0&&!(l===!1&&this.isEmpty(a)||this.checkTime(a)))return[!1,h+": "+$.grid.edit.msg.date+" - hh:mm (am/pm)",""];if(f.url===!0&&!(l===!1&&this.isEmpty(a)||(m=/^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i,m.test(a))))return[!1,h+": "+$.grid.edit.msg.url,""];if(f.custom===!0&&(l!==!1||!this.isEmpty(a))){if($.isFunction(f.custom_func)){var n=f.custom_func.call(c,a,h);return $.isArray(n)?n:[!1,$.grid.edit.msg.customarray,""]}return[!1,$.grid.edit.msg.customfcheck,""]}}return[!0,"",""]}});