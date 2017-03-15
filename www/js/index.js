/**
 * Created by lenovo on 2017/3/9.
 */

/**
 * 第一种方案（参考网易）http://www.codeceo.com/article/font-size-web-design.html
 * [以iPhone4/5的设计稿为例js动态设置文档 rem 值]
 * 6.4怎么来的，当然是根据设计稿的横向分辨率/100得到的
 * 如果是750的设计稿，应该除以7.5
 * 当deviceWidth大于640时，则物理分辨率大于1280（这就看设备的devicePixelRatio这个值了），应该去访问pc网站 所以加上这个判断if(deviceWidth > 640) deviceWidth = 640;
 */
var deviceWidth = document.documentElement.clientWidth;
if(deviceWidth > 750) deviceWidth = 750;
document.documentElement.style.fontSize = deviceWidth / 7.2 + 'px';


$(function(){
    $('.module-right').each(function(index,element){
        var itemNameWidth=0;
        var itemDataWidth=0;
        var _this=$(element);
        _this.find('.item-name').each(function(i,elem){
            if($(elem).width()>itemNameWidth){
                itemNameWidth=Math.ceil($(elem).width()+1);
            }
        });
        _this.find('.item-name').width(itemNameWidth);


        _this.find('.item-data').each(function(i,elem){
            if($(elem).width()>itemDataWidth){
                itemDataWidth=Math.ceil($(elem).width()+1);
            }
        });
        _this.find('.item-data').width(itemDataWidth);
    });
});


new Vue({
    el: '.page-tabbar',
    data: function () {
        return {
            selected: '基础产品',
            jccpSelected: 'yj',
            yswdSelected: null,
            frameLoaded: {
                yjsframe: false,
                wlwframe: false
            },
            yjsurl: 'http://10.250.190.140/cescloud/tj/index',
            yjshtml: '',
            datas: null,
            groups: []
        }
    },
    watch: {
        selected: function(value) {
            if(value == '云数物端' && this.yswdSelected == null) {
                this.yswdSelected = 'yjs';
            }
        }
    },
    methods: {
        openurl: function(url, target, options) {
            if (!target) {
                target = '_blank';
            }
            if (!options) {
                options = 'location=no,toolbar=no,toolbarposition=top,closebuttoncaption=关闭'
            }
            cordova.InAppBrowser.open(url, target, options);
        },
        iframeLoad: function(id, tabprefix) {
            this.frameLoaded[id] = true;
            var bbarsTop = this.$refs.tabbars.$el.getBoundingClientRect().top;
            var tbarBottom = 0;
            if(tabprefix) {
                tbarBottom = this.$refs[tabprefix + 'Tab'].$el.getBoundingClientRect().bottom;
            } else {
                tbarBottom = this.$refs['tabContrainer'].$el.getBoundingClientRect().top;
            }
            this.$refs[id + 'Frame'].style.height = (bbarsTop - tbarBottom)+"px";
            // var ifm = document.getElementById(id);
            // var subWeb = document.frames ? document.frames[id].document : ifm.contentDocument;
            // if(ifm != null && subWeb != null) {
            //     ifm.height = subWeb.body.scrollHeight;
            //     ifm.width = subWeb.body.scrollWidth;
            // }
        }
    },
    created: function() {
        this.$http.jsonp('http://10.250.190.140/cescloud/tj/index.json').then(function(response) {
            this.datas = response.body;
            this.groups = this.datas.groups;
        }).catch(function(response) {
            console.log(response);
        })
    }
})
