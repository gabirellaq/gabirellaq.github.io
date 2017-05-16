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
/*
 * 基于本地数据拼音搜索引擎 v0.1
 * Date: 2011-07-20
 * http://code.google.com/p/pinyin-engine/
 * (c) 2009-2010 TangBin, http://www.planeArt.cn
 * download by http://www.codefans.net
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://creativecommons.org/licenses/LGPL/2.1/
 */
var pinyinEngine = function () {
	return (this instanceof pinyinEngine) ? this.resetCache() : new pinyinEngine;
};
window.pinyinEngine = pinyinEngine;
pinyinEngine.prototype = {
	/**
	 * 查询
	 * @param		{String}	关键字
	 * @param		{Function}	回调函数(每一次成功匹配都将运行，
	 *							函数接收的第一个参数为匹配到的内容数据)
	 * @return		{Array}		所有匹配到的内容数据列表
	 */
	search: function (keyword, callback) {
		var cache = this._cache,
			history = this._history,
			value = [], number = 0;
		
		keyword = keyword.toLowerCase();
		callback = callback || function () {};
		
		// 在上一次搜索结果中查询
		if (history.length && keyword.indexOf(history.keyword) === 1) {
			cache = history.content;
		};
		
		for (var i = 0, len = cache.length; i < len; i ++) {
			if (cache[i].tags.indexOf(keyword) !== -1) {
				number ++;
				value.push(cache[i]);
				callback(cache[i].content);
			};
		};

		// 缓存本次查询结果
		this._history = {
			keyword: keyword,
			value: value,
			length: number
		};
		
		return value;
	},
	
	/**
	 * 设置索引缓存
	 * @param		{Array}		标签
	 * @param		{Any}		被索引的内容
	 */
	setCache: function (tags, content) {
		var keys, excision = '\u0001';
		
		keys = tags;
		for (var i = 0, len = tags.length; i < len; i ++) {
			 keys.push(pinyinEngine.toPinyin(tags[i], false, excision));
		};
		keys = keys.join(excision);
		
		var obj = {
			tags: keys,
			content: content
		};
		this._cache.push(obj);
	},
	
	/**
	 * 重置索引缓存
	 */
	resetCache: function () {
		this._cache = [];
		this._history = {};
	}
};



/**
 * 拼音转换算法
 *
 * @version	2011-07-19
 * @see		https://github.com/hotoo/pinyin.js
 * @author	闲耘™ (@hotoo <hotoo.cn[AT]gmail.com>), 唐斌 (1987.tangbin[AT]gmail.com)
 */
pinyinEngine.toPinyin = function () {
	var data = window.PINYIN_DATA;

    /*
	 * 建立高速索引缓存
     * Note: 除 Firefox 之外，IE,Chrome,Safari,Opera
     *       均为 s.split("")[i] 比 s.charAt(i) 的性能好。
     */
	var cache = {}, hans, i, j, m;
    for (var i in data) {
        hans = data[i];
		j = 0;
		m = hans.length;
        for(; j < m; j ++) {
            var han = hans.charAt(j);
            if (!cache[han]) {
                cache[han] = [];
            };
            cache[han].push(i);
        };
    };
    data = null;

    /*
     * 笛卡尔乘积，返回两个数组的所有可能的组合。
     * @param	{Array}
     * @param	{Array}
	 * @param	{String}	字符串分割符
     * @return	{Object}	成员包括array与string
     */
    function product (a, b, sp) {
        var r = [], val, str = [];
        for (var i = 0, l = a.length; i < l; i ++) {
            for (var j = 0, m = b.length; j < m; j ++) {
                val = r[r.length] = (a[i] instanceof Array) ? a[i].concat(b[j]) : [].concat(a[i],b[j]);
				str.push(val.join(""));
            };
        };
        return {
			array: r,
			string: str.join(sp || "")
		};
    };

    /**
     *	@param	{String}		要转为拼音的目标字符串（汉字）。
     *	@param	{Boolean}		是否仅保留匹配的第一个拼音。
     *	@param	{String}		返回结果的分隔符，默认返回数组集合。
     *	@return	{String, Array} 如果 sp 为 null，则返回 Array。
     *							否则，返回以 sp 分隔的字符串。
     */
    return function (keyword, single, sp) {
        var len, pys, py, pyl, i, y;
        if(keyword==null||keyword.length==0){
        	len = 0;
        }else{
        	if(typeof keyword == 'number'){
    			if(keyword.toString().length == "13"){
    				keyword = $.coral.longToStringDate(keyword);
    			}
    		}
        	len = keyword.length;
        }
		
        if (len === 0) {return single ? "" : []};
        if (len === 1) {
            y = cache[keyword];
            if (single) {return y && y[0] ? y[0] : keyword};
            return y || [keyword];
        } else {
            var py = [];
            for (i = 0; i < len; i ++) {
                y = cache[keyword.charAt(i)];
                if (y) {
                    py[py.length] = single ? y[0] : y;
                } else {
                    py[py.length] = single ? keyword.charAt(i) : [keyword.charAt(i)];
                };
            };
            if (single) {return sp == null ? py : py.join(sp || "")};

            pys = py[0];
			pyl = py.length;
			var prt, str;
            for (i = 1; i < pyl; i++) {
				prt = product(pys, py[i], sp);
                pys = prt.array;
            };
            return sp == null ? pys : prt.string;
        };
    };
	
}();
// noDefinePart
} ) );