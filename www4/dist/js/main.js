/**
 * Created by lenovo on 2017/3/14.
 */

// 0. 如果使用模块化机制编程，導入Vue和VueRouter，要调用 Vue.use(VueRouter)
// 本地存储
const storage = window.localStorage;
// 初始化本地存储内容

// 1. 定义（路由）组件。
// 可以从其他文件 import 进来
const MainPage = {
    template: '#mainpage',
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
            wlwDatas: null,
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
                            "endTime": "",
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
                    };
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
        this.$options.methods.loadYjsData.bind(this)();
        this.$options.methods.loadWlwData.bind(this)();
    },
    created: function() {
        
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
    }
}
// 云基
// 信息发布平台
const Infoplat = { template: '#infoplatpage' }
// 系统配置平台
const Config = { template: '#configpage'}
// 基础组件平台
const Coral = { template: '#coralpage'}
// 全文检索平台
const Search = { template: '#searchpage'}
// 系统管理平台
const Authsystem = { template: '#authsystempage'}
// 工作流平台
const Workflow = { template: '#workflowpage'}

// 灵器
// 电子文件通用浏览器
const BrowserTool = {template: '#browsertoolpage'};
// 电子文件封装工具
const PackageTool = {template: '#packagetoolpage'};
// 电子文件格式转换软件
const ConvertTool = {template: '#converttoolpage'};
// 电子文件检测软件
const CheckTool = {template: '#checktoolpage'};
// 电子文件离线浏览软件
// const OfflineTool = {template: '#offlinetoolpage'};

// 关于我们
// 中心概述
const CenterInfo = {template: '#centerinfopage'};
// 组织沿革
const OrganizeHistory = {template: '#organizehistorypage'};
// 组织定位
const OrganizeOrientation = {template: '#organizeorientationpage'};
// 中心文化
const CenterCulture = {template: '#centerculturepage'};

// 2. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
// 我们晚点再讨论嵌套路由。
const routes = [
    { path: '/', component: MainPage },
    { path: '/base/infoplat', component: Infoplat },
    { path: '/base/config', component: Config },
    { path: '/base/coral', component: Coral },
    { path: '/base/search', component: Search },
    { path: '/base/authsystem', component: Authsystem },
    { path: '/base/workflow', component: Workflow },

    { path: '/tool/browser', component: BrowserTool },
    { path: '/tool/package', component: PackageTool },
    { path: '/tool/convert', component: ConvertTool },
    { path: '/tool/check', component: CheckTool },
    // { path: '/tool/offline', component: OfflineTool },

    { path: '/about/info', component: CenterInfo },
    { path: '/about/history', component: OrganizeHistory },
    { path: '/about/orientation', component: OrganizeOrientation },
    { path: '/about/culture', component: CenterCulture },
]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new VueRouter({
    routes: routes
})


// 4. 创建和挂载根实例。
// 记得要通过 router 配置参数注入路由，
// 从而让整个应用都有路由功能
const app = new Vue({
    router: router,
    data: function() {
        return {
            transitionComplete: false
        }
    },
    computed: {
        visible: function() {
            return this.$route.path != '/';
        }
    },
    methods: {
        beforeEnter: function (el) {
            // ...
        },
        afterEnter: function (el) {
            if(this.$refs.topLink) {
                var tl = this.$refs.topLink.$el;
                tl.style.width = tl.getBoundingClientRect().height + "px";
                tl.style.zIndex = 2;
                this.transitionComplete = true;
            }
        },
        beforeLeave: function (el) {
            this.transitionComplete = false;
        },
        afterLeave: function (el) {
            // ...
        },
    }

}).$mount('#app');
