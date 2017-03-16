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
    template: '<div class="page-tabbar"><mt-header title="基础产品演示平台" fixed></mt-header></div>',
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
const Infoplat = { template: '<div><mt-header title="信息发布平台" fixed v-if="$root.transitionComplete"></mt-header><div class="section"><div class="page-video"><video width="320" height="240" controls poster="images/infoplat_screen.jpg"  preload="none" ><source src="http://180.168.156.212:2210/proxy/video/xinxifabupingtai_xuanchuan.mp4" type="video/mp4">您的浏览器不支持 video 标签。</video></div><div class="sectionMargin"><div class="mtArticle"><h1 class="mtArticleH1"><span>信息发布平台（CES Infoplat）</span></h1><p>信息发布平台就是负责从信息采集录入、信息处理、信息浏览一直到信息撤销等维护过程的信息处理的应用平台，目前的版本是基于J2EE技术架构，采用中间件开发技术（浏览器/中间件/服务器三层架构），将表示层、业务逻辑层和数据层分离，并且吸收了工作流平台、系统管理平台的设计思想，具有高性能、跨平台、易升级、可扩展等突出优点，可以真正实现信息类型自定义、发布流程自定义和显示自定义。</p><p>图为信息发布平台的系统架构图：</p><div class="articleImg clearfix"><img src="images/infoplat1.jpg" class="oneImg"></div><p>系统主要功能模块介绍如下：</p><p><b>内容管理：</b>提供了基于工作流的内容管理功能，实现信息的采集、处理、发布到归档的一系列功能，其中还包括内容管理的常见功能，如信息流程管理、信息检索等。具体功能有：</p><div class="articlelist clearfix"><ul><li>1.  信息新建与采集：使用基本信息自定义输入程序与图文混排新建文档；</li><li>2.  信息文档审批：对提交来的信息文档进行审批、批注，具有痕迹保留功能；基于工作流平台，提供多级审批功能；</li><li>3.  信息文档预发布：对提交来的信息文档进行预发布处理，就是发布到信息中间层；支持多网发布；</li><li>4.  信息全文检索：系统自动增量创建全文检索索引，实现信息的站内检索；</li><li>5.  信息文档发布后维护：信息发布撤回、修改各种发布属性（终止发布、延长发布）等；</li><li>6.  信息发布状态跟踪与信息访问量统计。</li></ul></div><p><b>发布管理：</b>提供从模板定义门户页面的功能，门户页面定义采用符合JSR 168规范的Portal技术，并采用Taglib技术对访问信息的数据源构件进行封装，对外提供标准二次开发的API接口。具体功能如下：</p><div class="articlelist clearfix"><ul><li>1.	站点管理：站点一般属性维护：用初始目录配置代替系统门户、内部镜像目录设置、发布策略选项等等；</li><li>2.	频道管理：按树状结构组织站点频道，并提供频道模板功能；</li><li>3.	数据源管理：提供站点与信息发布平台本身和其它业务系统集成的接口；</li><li>4.  信息发布：根据信息预发布情况，动态刷新门户页面（频道），生成静态发布文件，并按照设定好的发布策略，实现站点的文件同步功能。</li></ul></div><p><b>系统设置：</b>信息发布平台系统的配置功能，如：站内全文检索设置、动态页面刷新设置等等功能，具体如下：</p><div class="articlelist clearfix"><ul><li>1.	信息类型管理：分“一般文档”，“专题”，“图片”和“多媒体”四种信息大类进行管理；</li><li>2.	模板管理：分采集界面模板、文档显示模板和频道模板三类进行管理；</li><li>3.	工作流设置：实现了“采编发”流程的自定义；</li><li>4.	系统平台设置：实现了“采编发”流程中所有功能节点的权限设置。</li></ul></div><p>从功能上来看，信息发布平台主要由文档采编发流程、模板管理、站点管理和系统设置组成，具体见下图：</p><div class="articleImg clearfix"><img src="images/infoplat2.jpg" class="oneImg"></div><p>主要功能模块介绍如下：</p><h1><span class="iconDot"></span><a>文档采集</a></h1><p>对于一个信息网站，评价其优劣常常从四方面指标考虑：是否有充实丰富的内容、是否设计了引人入胜的页面显示、是否具有良好的运行性能，是否充分考虑了安全性。其中充实丰富内容的来源就是通过各种各样的文档采集。</p><p>根据不同的来源与采集方法，可以分为手工输入、EMAIL采集、WEB采集、从其它系统采集（API）等等。采集API就是定义一套采集文档的java类API，手工采集就是采用手工输入的方式进行文档的采集。</p><p>此外，信息发布平台能够处理的文档信息是结构化的，也就是包括结构化数据，如标题/日期等，同时也包括对图片/多媒体等非结构化信息处理。支持可视化编辑，良好的图、文、表格混排效果，与常用格式兼容，如：WORD、EXCEL等。有文字自动纠错和政治敏感性问题词提醒功能；支持丰富的信息内容创建：文本、html、多媒体、图片、PPT等。</p><h1><span class="iconDot"></span><a>文档发布</a></h1><p>文档发布指把文档发布到站点频道上（一个或多个），并使之能够被网络用户访问的过程。信息发布平台支持中文（简、繁）、英文等语言的发布。主要功能特征包括：</p><div class="articlelist clearfix"><ul><li>一档多发：一篇文档可以同时（或分步）发布到不同的站点或频道上，如一条新闻可以同时发布到单位的局域网、党政网和因特网。一档多发的好处就是信息集中管理、统一管理。</li><li>发布属性设置：包括实现延时发布、显示有效期控制等功能。</li></ul></div><p>发布管理的界面示意如下：</p><div class="articleImg clearfix"><img src="images/infoplat3.jpg" class="oneImg"></div><h1><span class="iconDot"></span><a>模板管理</a></h1><p>模板（Template）是信息发布平台中的重要概念，它是可定义的一组界面显示样式代码，具体可以是完整的HTML文件、JSP文件或者文件片断（一段代码）。信息发布平台模板包括文档采集模板、文档内容编辑模板、文档显示模板和频道显示等多种模板。</p><p>界面示意如下：</p><div class="articleImg clearfix"><img src="images/infoplat4.jpg" class="oneImg"></div><h1><span class="iconDot"></span><a>站点频道管理</a></h1><p>站点频道管理就是维护站点的频道层次结构，并确定站点及其频道的基本属性，最后为每个频道定义其文档显示布局信息。简单来说，站点频道管理就是维护站点频道层次及其各类信息的过程。支持多站点（主网站和子网站）管理模式，主网站设定一个最高权限的管理员，由其定义主站及子网站的各类操作管理人员的维护权限和维护范围。</p><p>具体站点频道的管理功能包括：站点频道的增删改、权限设置、排序、发布同步等等。主要功能如下：</p><div class="articlelist clearfix"><ul><li>提供频道基本属性自定义功能；频道页面刷新方式设置功能；</li><li>为文档内容相同的频道提供文档关联功能；</li><li>为频道相互依赖的页面提供页面关联功能。；</li></ul></div><p>我司的信息发布平台具有以下方面的优势：</p><div class="articleImg clearfix"><img src="images/infoplat5.jpg" class="oneImg"></div></div></div></div></div>' }
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
