/*! cui 2016-11-08 */
var pinyinEngine=function(){return this instanceof pinyinEngine?this.resetCache():new pinyinEngine};window.pinyinEngine=pinyinEngine,pinyinEngine.prototype={search:function(a,b){var c=this._cache,d=this._history,e=[],f=0;a=a.toLowerCase(),b=b||function(){},d.length&&1===a.indexOf(d.keyword)&&(c=d.content);for(var g=0,h=c.length;h>g;g++)-1!==c[g].tags.indexOf(a)&&(f++,e.push(c[g]),b(c[g].content));return this._history={keyword:a,value:e,length:f},e},setCache:function(a,b){var c,d="";c=a;for(var e=0,f=a.length;f>e;e++)c.push(pinyinEngine.toPinyin(a[e],!1,d));c=c.join(d);var g={tags:c,content:b};this._cache.push(g)},resetCache:function(){this._cache=[],this._history={}}},pinyinEngine.toPinyin=function(){function a(a,b,c){for(var d,e=[],f=[],g=0,h=a.length;h>g;g++)for(var i=0,j=b.length;j>i;i++)d=e[e.length]=a[g]instanceof Array?a[g].concat(b[i]):[].concat(a[g],b[i]),f.push(d.join(""));return{array:e,string:f.join(c||"")}}var b,c,d,e,f=window.PINYIN_DATA,g={};for(var c in f)for(b=f[c],d=0,e=b.length;e>d;d++){var h=b.charAt(d);g[h]||(g[h]=[]),g[h].push(c)}return f=null,function(b,c,d){var e,f,h,i,j,k;if(null==b||0==b.length?e=0:("number"==typeof b&&"13"==b.toString().length&&(b=$.coral.longToStringDate(b)),e=b.length),0===e)return c?"":[];if(1===e)return k=g[b],c?k&&k[0]?k[0]:b:k||[b];var h=[];for(j=0;e>j;j++)k=g[b.charAt(j)],k?h[h.length]=c?k[0]:k:h[h.length]=c?b.charAt(j):[b.charAt(j)];if(c)return null==d?h:h.join(d||"");f=h[0],i=h.length;var l;for(j=1;i>j;j++)l=a(f,h[j],d),f=l.array;return null==d?f:l.string}}();