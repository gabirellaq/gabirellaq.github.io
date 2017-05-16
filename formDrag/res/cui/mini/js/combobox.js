/*! cui 2016-11-08 */
!function(){"use strict";var a=0;$.component("coral.combobox",$.coral.combo,{version:"4.0.3",castProperties:["data","buttons","formatter","shortCut","onShowPanel","onBlur"],options:{cls:"",valueField:"value",textField:"text",panelRenderOnShow:!1,mode:"local",method:"post",url:null,data:[],selectedIndex:null,buttons:[],width:"auto",showText:!0,emptyText:null,postMode:"value",formatter:function(a){var b=$(this).combobox("option","textField");return a[b]},loader:function(a,b,c){var d=$(this),e=d.combobox("option","url");return e?($.ajax({type:d.combobox("option","method"),url:e,data:a,dataType:"json",success:function(a){b(a)},error:function(){c.apply(this,arguments)}}),!1):!1},beforeLoad:$.noop,onLoad:$.noop,onError:$.noop,onShowPanel:$.noop,beforeSelect:$.noop,onSelect:$.noop,unSelect:$.noop},_create:function(){var b=this,c=null;new Date;this.data=this.data||[],a++,b.options.itemIdPrefix="combobox_i"+a,this.element.addClass("coral-form-element-combobox coral-validation-combobox ctrl-form-element");var d=$.coral.toFunction(this.options.onShowPanel);c=function(a){d&&d.apply(b.element,[a])},this.options.onShowPanel=c,this._super(),this._on(this.uiCombo.panel,{mouseover:function(a){$(a.target).closest(".coral-combobox-item").addClass("coral-combobox-item-hover")},mouseout:function(a){$(a.target).closest(".coral-combobox-item").removeClass("coral-combobox-item-hover")},mousedown:function(a){this.cancelBlur=!0,this._delay(function(){delete this.cancelBlur});var b=$(a.target).closest(".coral-combobox-item"),c=b.attr("value");if(!$(a.target).closest(".coral-combo-filterbox").length){if(!b.length||b.hasClass("coral-combobox-item-disabled"))return!1;var d=this.getRowIndex(c);return!1===this._trigger("beforeSelect",null,[{item:this.options.data[d]},{data:this.options.data[d]}])?!1:(this.options.multiple?(this.oldText=this.uiCombo.textbox.val(),""===c?(this.clear(),this.hidePanel(),this.select(c)):(this.options.emptyText&&this.unselect(""),b.hasClass("coral-combobox-item-selected")?(this.unselect(c),b.removeClass("coral-combobox-item-selected")):this.select(c))):(this.oldText=this.uiCombo.textbox.val(),this.hidePanel(),this.select(c)),!1)}}}),this.options.isLabel&&this.options.emptyText&&""===this.getValue()&&this.uiCombo.textbox.val("")},_initData:function(){return this.options.url?this._request(this.options.url):this.options.data.length?this.loadData(this.options.data):this.loadData(this.transformData)},_renderItems:function(a){var b,c=this.options,d=(this.panel(),[]),e=[],f="",g=$.coral.toFunction(this.options.formatter),h=$.coral.toFunction(this.options.itemattr);for(b=0;b<a.length;b++){var i=a[b],j=i[c.valueField],k=i[c.textField],l=1==!!i.hidden?"hidden":"",m="",n=k;if(g&&(n=g.call(this.element,a[b])),$.isFunction(h)){var o=h.apply(this.element[0],[{item:a[b]}]);if(!$.isEmptyObject(o)){o.hasOwnProperty("style")&&(m+=o.style,delete o.style),o.hasOwnProperty("class")&&(l+=" "+o["class"],delete o["class"]);try{delete o.role}catch(p){}for(attrName in o)o.hasOwnProperty(attrName)&&(f+=" "+attrName+"="+o[attrName])}e.push("<div class='coral-combobox-item "+l+f+"' style='"+m+"' id='"+this.options.itemIdPrefix+"_"+b+"' value='"+j+"'>"+n+"</div>")}else e.push("<div class='coral-combobox-item "+l+" ' id='"+this.options.itemIdPrefix+"_"+b+"' value='"+j+"'>"+n+"</div>");i.selected&&-1===$.inArray(j,d)&&d.push(this.getModeValue(j,k))}return this.lazyPanelHtml=e.join(""),this.uiCombo.pContent.html(this.lazyPanelHtml),d},loadData:function(a,b,c){var d=this.options,e=(this.panel(),this),f=c||"onLoad",g=($.coral.toFunction(this.options.formatter),{}),h=[],i=!1;a instanceof Array||(a=[]),this.data=a||[],this.options.data=a||[],d.clearOnLoad&&(i=e._clearValues(this.data)),this.uiCombo.pContent.empty(),this.options.emptyText&&(a.length>0&&""===a[0][this.options.valueField]||(g[this.options.valueField]="",g[this.options.textField]=this.options.emptyText,a.unshift(g)));h=this._renderItems(this.data),0==h.length&&!this.currentValues.length&&this.options.selectedIndex&&a[this.options.selectedIndex]&&(h=[a[this.options.selectedIndex].value]),this.options.panelRenderOnShow||(this.uiCombo.pContent.html(this.lazyPanelHtml),this.panelRendered=!0),this.currentValues.length&&!i&&(h=this.currentValues),this.isInit||(this.isInit=!0,this.originalValue=h.join(",")),this.dataLoaded=!0,d.multiple?this.setValues(h,!1,b):(h=h.length?[h[0]]:[],this.setValues(h,!1,b)),this._trigger(f,null,[a])},localFilter:function(a){for(var b=this.getData(),c=this.panel().find(".coral-combobox-item"),d=0;d<b.length;d++)if($(c[d]).hide(),a.apply(this.element,[b[d]])){b[d][this.options.valueField],b[d][this.options.textField];$(c[d]).show()}},_scrollTo:function(a){var b,c=this.panel().find(".coral-combo-content"),d=this.getEl(a);d.length&&(d.position().top<=0?(b=c.scrollTop()+d.position().top,c.scrollTop(b)):d.position().top+d.outerHeight()>c.height()&&(b=c.scrollTop()+d.position().top+d.outerHeight()-c.height(),c.scrollTop(b)))},_transformData:function(){var a=this.options,b=[];return $(">option",this.element).each(function(){var c={};c[a.valueField]=void 0!==$(this).attr("value")?$(this).attr("value"):$(this).html(),c[a.textField]=$(this).html(),c.selected=$(this).attr("selected"),b.push(c)}),b},_showItems:function(){this.uiCombo.panel.find(".coral-combobox-item").show()},_doQuery:function(a){var b=this.options,c=this.options.filter;if("remote"==b.mode)this._request(null,{q:a},!0);else{var d=this.panel(),e=this.getData(),f=d.find(".coral-combobox-item");f.hide(),this._removeHighlight(this.uiCombo.pContent.find("span.coral-keyword-highlight")),this.uiCombo.pContent.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected"),this.uiCombo.pContent.find(".coral-item-focus").removeClass("coral-item-focus");for(var g=0;g<e.length;g++)for(var h=pinyinEngine.toPinyin(e[g][b.textField],!1,""),i=0;i<a.length;i++){var j=c.apply(this.element,[a[i],e[g]]);if(j){var k=e[g][b.valueField].toString(),l=e[g][b.textField];(l.indexOf(a[i])>-1||k.indexOf(a[i])>-1||h.indexOf(a[i])>-1)&&(-1!=$.inArray($(f[g]).attr("value"),this.hideValueArr)?$(f[g]).hide():($(f[g]).show(),l==a[i]?($(f[g]).addClass("coral-combobox-item-selected"),this._removeHighlight($(f[g]).find("span.coral-keyword-highlight"))):"text"==j&&this._addHighlight($(f[g]),a[i])))}}}},_checkMathch:function(a,b){var c=[],d=[],e=this.options,f=e.textField,g=e.valueField;b&&this._showItems();var h,i,j=!1,k=this.data,l="",m={};if(e.multiple)for(h=0;h<a.length;h++){for(i=0;i<k.length;i++)if(k[i][f]!=a[h]&&k[i][g]!=a[h]&&(m[h.toString()]=!0),k[i][f]==a[h]){l=this.getModeValue(k[i][g],k[i][f]),c.push(l),j=!0;break}j||e.forceSelection||(!m[h.toString()]&&!b||b)&&(c.push(a[h]),d.push(a[h])),j=!1}else{var n=-1;for(h=0;h<k.length;h++)k[h][f]==a[0]&&(n=-1===n?h:n,j=!0),k[h][f]!=a[0]&&k[h][g]!=a[0]&&(m[0]=!0);j&&(l=this.getModeValue(k[n][g],k[n][f]),c.push(l)),j||e.forceSelection||(!m[0]&&!b||b)&&(c.push(a[0]),d.push(a[0]))}return{valarr:c,textarr:d}},_request:function(a,b,c){var d=this,e={},f=[],g=this.options.loader,h=!1;if(a||d.options.url?!a&&d.options.url&&(a=d.options.url):a=[],"string"!=typeof a?(e=a,e.data?f=e.data:e.url?(a=e.url,d.options.url=e.url,h=!0):e instanceof Array?f=a:e.url||e.data||d.options.url?e.url||e.data||!d.options.url||(a=d.options.url,h=!0):f=[]):(d.options.url=a,h=!0),h){if(b=b||{},0==this._trigger("beforeLoad",null,[b]))return;g.apply(this.element,[b,function(a){var b=e.onLoad;d.loadData(a,c,b),d._loadedHandler()},function(){d._trigger("onError",null,arguments)}])}else{var i=e.onLoad;d.loadData(f,c,i)}},_loadedHandler:function(){var a=this._getCacheItem("setValues");a&&(this.setValues(a.values,a.triggerOnChange,a.remainText),this._removeCacheItem("setValues"));var b=this._getCacheItem("focus");b&&this._removeCacheItem("focus")},_selectItems:function(a,b){var c=this.panel(),d=null,e=null,f=c.find(".coral-item-focus:visible"),g=":last";return a&&(g=":first"),f.removeClass("coral-item-focus"),f.length?e=f.attr("value"):(f=d=c.find(".coral-combobox-item-selected:visible"+g),d.length&&(e=d.attr("value"))),"prev"==b?0===f.prevAll(":visible").length?(f=c.find(".coral-combobox-item:visible:last"),f.addClass("coral-item-focus")):f.prevAll(":visible:eq(0)").addClass("coral-item-focus"):0===f.nextAll(":visible").length?(f=c.find(".coral-combobox-item:visible:first"),f.addClass("coral-item-focus")):f.nextAll(":visible:eq(0)").addClass("coral-item-focus"),e},_selectPrev:function(){var a=this.panel(),b=this._selectItems(!0,"prev"),c=a.find('.coral-combobox-item[value="'+b+'"]'),d=null,e=null;c.length?d=c.prevAll(":visible:eq(0)"):c=a.find(".coral-combobox-item:visible:last"),null!==d&&0===d.length&&(d=a.find(".coral-combobox-item:visible:last")),e=d?d.attr("value"):c.attr("value"),this.select(e),this._scrollTo(e)},_selectNext:function(){var a=this.panel(),b=this._selectItems(!0,"next"),c=a.find('.coral-combobox-item[value="'+b+'"]'),d=null,e=null;c.length?d=c.nextAll(":visible:eq(0)"):c=a.find(".coral-combobox-item:visible:first"),d&&0==d.length&&(d=a.find(".coral-combobox-item:visible:first")),e=d?d.attr("value"):c.attr("value"),this.select(e),this._scrollTo(e)},_doEnter:function(a){var b,c=this.panel(),d=this.getValues(),e=c.find(".coral-item-focus:visible"),f=this.getData(),g=this.options,h=e.attr("value");if(h){var i="",j=0;for(b=0;b<f.length;b++)h==f[b][g.valueField]&&(j=b);i=this.getModeValue(h,f[j][g.textField]),this.options.multiple?-1==$.inArray(i,d)?this.select(h):this.unselect(h):this.hidePanel()}},_formatValue:function(a){var b=this.getData(),c=this.options,d=c.valueField,e=c.textField,f=0,g=null;if("text"===c.postMode||"value-text"===c.postMode)for(f=0;f<b.length;f++)if(g=b[f],""!=a&&a==g[d]){if("text"===c.postMode)return g[e];if("value-text"===c.postMode)return a+c.valueTextSeparator+g[e]}return a},_destroy:function(){this.element.removeClass("coral-validation-combobox"),this.element.removeClass("coral-form-element-combobox"),this._super()},_getOnlyValues:function(){var a=this.getData(),b=this.options,c=[],d=0;if(!this.currentValues||!this.currentValues[0]&&1===this.currentValues.length)return c;for(;d<this.currentValues.length;d++){var e=this.currentValues[d],f=0,g=b.valueField,h=b.textField,i=null;if("value-text"===b.postMode&&(e=e.split(b.valueTextSeparator)[0],c.push(e)),"value"===b.postMode&&c.push(e),"text"===b.postMode)for(;a&&f<a.length;f++)if(i=a[f],i[h]==e){c.push(i[g]);break}}return c},_getCurrentValues:function(){var a=(this.getData(),this.options,[]);return!this.currentValues||!this.currentValues[0]&&1===this.currentValues.length?a:this.currentValues},getData:function(){return this.data||[]},setValues:function(a,b,c){var d=this.options,e=this.getData(),f=this.panel(),g=c,h=0,i=(this.getValues()||[],[]),j=[],k=null,l=null,m=null;if("object"==typeof g&&(c=g.remainText,b=g.triggerOnChange),this.currentValues=a,this.dataLoaded){for(f.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected"),h=0;h<a.length;h++){l=a[h],m=l;var n=this.getRowIndex(l);if(n>-1){m=e[n][d.textField],k=e[n][d.valueField];this._getItemByIndex(n).addClass("coral-combobox-item-selected");d.emptyText&&""==l?(this.uiCombo.textbox.attr("placeholder",d.emptyText),this._showPlaceholder(d.emptyText),m=""):this._hidePlaceholder(),j.push(m),i.push(l)}else 0>n&&!d.forceSelection&&(j.push(m),i.push(l))}c||this._setText(j.join(d.separator));var o=this._getMinus(i,a);(o.length&&i.length||!i.length)&&(j=j.concat(o),c||this._setText(j.join(d.separator)),i=a),this._super(i,b,c)}},_getMinus:function(a,b){var c=[];return $.each(b,function(b,d){-1==$.inArray(d,a)&&c.push(d)}),c},getEl:function(a){var b=this.getRowIndex(a),c=b;return $("#"+this.options.itemIdPrefix+"_"+c)},_getItemByIndex:function(a){var b=a;return $("#"+this.options.itemIdPrefix+"_"+b)},getRowIndex:function(a){for(var b=this.options,c=this.getData(),d=b.postMode,e=0;e<c.length;e++){if("value"==d&&c[e][b.valueField]==a)return e;if("text"==d&&c[e][b.textField]==a)return e;if("value-text"==d&&c[e][b.valueField]==a.split(b.valueTextSeparator)[0])return e}return-1},clear:function(){var a=this.panel();this._super(),a.find(".coral-combobox-item-selected").removeClass("coral-combobox-item-selected"),a.find(".coral-item-focus").removeClass("coral-item-focus")},reload:function(a){this._request(a)},select:function(a){var b,c,d=this.options,e=this.getData();a=$.trim(a),c=d.multiple?this.getValues():[];var f="",g=0;for(b=0;b<e.length;b++)a==e[b][d.valueField]&&(g=b);for(f=this.getModeValue(a,e[g][d.textField]),b=0;b<c.length;b++)if(c[b]==f)return;c.push(f),this.setValues(c,!0,!1),this._trigger("onSelect",null,[{item:e[g],value:a,text:e[g][d.textField]}])},getModeValue:function(a,b){var c;return"value"==this.options.postMode&&(c=a),"text"==this.options.postMode&&(c=b),"value-text"==this.options.postMode&&(c=a+"-"+b),c},unselect:function(a){var b,c=this.options,d=this.getData(),e=this.getValues(),f=0;for(b=0;b<d.length;b++)a==d[b][c.valueField]&&(f=b);for("value"==this.options.postMode&&(a=a),"text"==this.options.postMode&&(a=d[f][c.textField]),"value-text"==this.options.postMode&&(a=a+"-"+d[f][c.textField]),b=0;b<e.length;b++)if(e[b]==a){e.splice(b,1),this.setValues(e,!0,!1),this._trigger("onSelect",null,[{item:d[f],value:a,text:d[f][c.textField]}]);break}},showPanel:function(){this._removeHighlight(this.uiCombo.pContent.find("span.coral-keyword-highlight"));var a,b=0;if(this._super(),this.hideValueArr)for(;b<this.hideValueArr.length;b++)a=this.hideValueArr[b],this.uiCombo.pContent.find('.coral-combobox-item[value="'+a+'"]').addClass("hidden")},addOption:function(a){var b=0,c=null,d=this.options.valueField,e=this.options.textField,f=a[d],g=a[e];if(!(d in a&&e in a))return $.message&&$.message("JSON格式不正确!"),!1;for(b=0;b<this.data.length;b++)if(a[d]==this.data[b][d]||a[e]==this.data[b][e])return $.message&&$.message("当前选项已存在!"),!1;return c=$('<div class="coral-combobox-item"></div>'),c.attr("value",f),this.options.formatter?c.html(this.options.formatter.call(this.element,a)):c.html(g),this.data.length>0&&""==this.data[0][d]?(this.data.splice(1,0,a),c.insertAfter(this.uiCombo.pContent.find(":first-child"))):(this.data.unshift(a),c.prependTo(this.uiCombo.pContent)),!0},removeOption:function(a){var b=null,c=null,d=0,e=this.options.valueField,f=null;if("number"==typeof a){if(a>this.data.length)return;b=this.data[d],f=a}if("string"==typeof a&&(c=a),"object"==typeof a){if(!(e in a))return;c=a[e]}if(null!==c)for(;d<this.data.length;d++)if(c==this.data[d][e]){b=this.data[d],f=d;break}null!==f&&(this.data.splice(f,1),this.uiCombo.pContent.find('.coral-combobox-item[value="'+c+'"]').remove())},clearOptinons:function(){this.uiCombo.pContent.empty(),this.clear()},showOption:function(a){var b;if("number"==typeof a)b=this.uiCombo.pContent.find(".coral-combobox-item:eq("+a+")");else if("string"==typeof a)b=this.uiCombo.pContent.find('.coral-combobox-item[value="'+a+'"]');else if("object"==typeof a){if(!(this.options.valueField in a))return;b=this.uiCombo.pContent.find('.coral-combobox-item[value="'+a[this.options.valueField]+'"]')}else this.uiCombo.pContent.find(".coral-combobox-item").removeClass("hidden"),this.hideValueArr=null;b&&b.length>0&&(b.removeClass("hidden"),this.hideValueArr&&$.inArray(b.attr("value"),this.hideValueArr)>-1&&this.hideValueArr.splice($.inArray(b.attr("value"),this.hideValueArr),1))},hideOption:function(a){this.hideValueArr||(this.hideValueArr=[]);var b;if("number"==typeof a)b=this.uiCombo.pContent.find(".coral-combobox-item:eq("+a+")");else if("string"==typeof a)b=this.uiCombo.pContent.find('.coral-combobox-item[value="'+a+'"]');else{if(!(this.options.valueField in a))return;b=this.uiCombo.pContent.find('.coral-combobox-item[value="'+a[this.options.valueField]+'"]')}b&&b.length>0&&(b.addClass("hidden"),-1==$.inArray(b.attr("value"),this.hideValueArr)&&this.hideValueArr.push(b.attr("value")))}})}();