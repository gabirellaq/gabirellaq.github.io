/**
 * Created by lenovo on 2017/3/14.
 */

// 0. 如果使用模块化机制编程，導入Vue和VueRouter，要调用 Vue.use(VueRouter)
// 本地存储
var storage = window.localStorage;
// 初始化本地存储内容

// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
var app = new Vue({
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
            yjshtml: '',
            datas: null,
            groups: [],
            wlwDatas: null
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
        },
        loadYjsData: function(callback){
            this.$http.get('http://180.168.156.212:2210/proxy/cescloud/tj/index.json', {
                timeout: 3000
            }).then(function(response) {
                this.datas = response.body;
                storage['datas'] = JSON.stringify(this.datas);
                this.groups = this.datas.groups;
                if(callback) {
                    callback();
                }
            }).catch(function(response) {
                console.log(response);
                if(storage['datas']){
                    this.datas = JSON.parse(storage['datas']);
                } else {
                    this.datas = {
                        "groups": [],
                        "total" : {
                            "serverCount" : 0,
                            "cpuCount" : 0,
                            "cpuHours" : 0,
                            "memorySize" : 0,
                            "memoryHours" : 0,
                            "volumeSize" : 420072,
                            "volumeHours" : 0,
                            "startTime" : "",
                            "endTime" : "",
                            "discount" : 0.0,
                            "total" : 108643.34,
                            "totalString" : "",
                            "volumeHoursString" : "",
                            "memoryHoursString" : "",
                            "cpuHoursString" : ""
                        },
                        "query" : {
                            "startTime": "",
                            "endTime": ""
                        }
                    };
                }
                this.groups = this.datas.groups;
                if(callback) {
                    callback();
                }
            })
        },
        loadYjsTop: function(id) {
            var _this = this;
            this.$options.methods.loadYjsData.bind(this)(function(){
                _this.$refs.yjsloadmore.onTopLoaded();
            })
        },
        loadWlwData: function(callback){
            this.wlwDatas = null;
            this.$http.get('http://180.168.156.212:2210/proxy/cold/mqtt/wlw.json', {
                timeout: 3000,
            }).then(function(response) {
                this.wlwDatas = response.body;
                storage['wlwDatas'] = JSON.stringify(this.wlwDatas);
                if(callback) {
                    callback();
                }
            }).catch(function(response) {
                console.log(response);
                if(storage['wlwDatas']){
                    this.wlwDatas = JSON.parse(storage['wlwDatas']);
                } else {
                    this.wlwDatas = {
                        "dqwd" : "",
                        "dqsd" : "",
                        "fs" : "",
                        "fx" : "",
                        "trwd" : "",
                        "trsd" : ""
                    }
                }
                if(callback) {
                    callback();
                }
            })

            if(callback) {
                callback();
            }
        },
        loadWlwTop: function(id) {
            var _this = this;
            this.$options.methods.loadWlwData.bind(this)(function(){
                _this.$refs.wlwloadmore.onTopLoaded();
            })
        },

    },
    beforeCreate: function() {
        //this.$options.methods.loadYjsData.bind(this)();
        //this.$options.methods.loadWlwData.bind(this)();
    },
    created: function() {
        /**
         * 第一种方案（参考网易）http://www.codeceo.com/article/font-size-web-design.html
         * [以iPhone4/5的设计稿为例js动态设置文档 rem 值]
         * 6.4怎么来的，当然是根据设计稿的横向分辨率/100得到的
         * 如果是750的设计稿，应该除以7.5
         * 当deviceWidth大于640时，则物理分辨率大于1280（这就看设备的devicePixelRatio这个值了），应该去访问pc网站 所以加上这个判断if(deviceWidth > 640) deviceWidth = 640;
         */
        var deviceWidth = document.documentElement.clientWidth;
        if (deviceWidth > 750) deviceWidth = 750;
        document.documentElement.style.fontSize = deviceWidth / 7.2 + 'px';
        $('.module-right').each(function (index, element) {
            var itemNameWidth = 0;
            var itemDataWidth = 0;
            var _this = $(element);
            _this.find('.item-name').each(function (i, elem) {
                if ($(elem).width() > itemNameWidth) {
                    itemNameWidth = Math.ceil($(elem).width() + 1);
                }
            });
            _this.find('.item-name').width(itemNameWidth);


            _this.find('.item-data').each(function (i, elem) {
                if ($(elem).width() > itemDataWidth) {
                    itemDataWidth = Math.ceil($(elem).width() + 1);
                }
            });
            _this.find('.item-data').width(itemDataWidth);
        });
		       
		this.$options.methods.loadYjsData.bind(this)();
        this.$options.methods.loadWlwData.bind(this)();
    }

});
