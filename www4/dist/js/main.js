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
    template: '<div class="page-tabbar"><mt-header title="基础产品演示平台" fixed></mt-header><div class="page-wrap"><mt-tab-container class="page-tabbar-container" v-model="selected" ref="tabContrainer"><mt-tab-container-item id="基础产品"><div class="page-navbar"><mt-navbar class="page-part" v-model="jccpSelected"><mt-tab-item id="yj">云基</mt-tab-item><mt-tab-item id="lq">灵器</mt-tab-item></mt-navbar><mt-tab-container v-model="jccpSelected"><mt-tab-container-item id="yj"><!-- 云基 --><div class="mtslider"><img src="img/yunjiSlider@2x.png"></div><div class="mtArticle clearfix"><h1 class="mtArticleH1"><img src="img/yunji.png"><span>“云基”平台系列产品</span></h1><p>平台化的设计理念起源于构件化和模块化软件开发思想，将应用软件开发过程中的通用功能进行提炼和升华，并按照松耦合、强内聚的基本设计思想进行功能划分和接口设计，使平台模块之间既保持接口上的关联，又实现功能上的独立。</p></div><div class="mtMenulist clearfix"><ul><li><router-link :to="\'/base/infoplat\'"><i class="iconfont icon-inforelease"></i><span>信息发布平台</span></router-link></li><li><router-link :to="\'/base/config\'"><i class="iconfont icon-xinxifabu"></i><span>系统配置平台</span></router-link></li><li><router-link :to="\'/base/coral\'"><i class="iconfont icon-guizezujian"></i><span>基础组件平台</span></router-link></li><li><router-link :to="\'/base/search\'"><i class="iconfont icon-gongzuoliu"></i><span>全文检索平台</span></router-link></li><li><router-link :to="\'/base/authsystem\'"><i class="iconfont icon-xitongguanli"></i><span>系统管理平台</span></router-link></li><li><router-link :to="\'/base/workflow\'"><i class="iconfont icon-kuaisujiansuo"></i><span>工作流平台</span></router-link></li></ul></div></mt-tab-container-item><mt-tab-container-item id="lq"><!-- 灵器 --><div class="mtslider"><img src="img/lingqiSlider@2x.png"></div><div class="mtArticle clearfix"><h1 class="mtArticleH1"><img src="img/lingqi.png"><span>“灵器”工具系列产品</span></h1><p>工具软件是指可以完成某一功能的独立软件，相对于应用软件的主体作用而言，工具软件起到了辅助作用，使用工具软件能节省软件生产开发时间和费用，提高软件生产率和质量。工具既可以在一定的条件下独立运行，也可以作为应用软件功能的一部分集成到项目中去，还可以作为基础功能整合在软件产品中。</p></div><div class="mtMenulist clearfix"><ul><li><router-link :to="\'/tool/browser\'">电子文件通用浏览器</router-link></li><li><router-link :to="\'/tool/package\'">电子文件封装工具</router-link></li><li><router-link :to="\'/tool/convert\'">电子文件格式转换软件</router-link></li><li><router-link :to="\'/tool/check\'">电子文件检测软件</router-link></li><li><a>电子文件离线浏览软件</a></li></ul></div></mt-tab-container-item></mt-tab-container></div></mt-tab-container-item><mt-tab-container-item id="云数物端"><div class="page-navbar"><mt-navbar class="page-part" v-model="yswdSelected" ref="yswdTab"><mt-tab-item id="yjs">云计算</mt-tab-item><mt-tab-item id="dsj">大数据</mt-tab-item><mt-tab-item id="wlw">物联网</mt-tab-item></mt-navbar><mt-tab-container v-model="yswdSelected" ref="yswdContainer"><mt-tab-container-item id="yjs"><!-- 云计算 --><mt-loadmore :top-method="loadYjsTop" :auto-fill="false" ref="yjsloadmore"><div class="cloudBox"><div class="cloudSum"><span class="data-name textxS">总金额</span><span class="data-num textM" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num textM" v-else v-html="datas.total.totalString"></span></div><div class="cloudDeatil clearfix"><ul><li><span class="cloudDetailName">云主机数量</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.serverCount"></span></li><li><span class="cloudDetailName">内存数GB</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.memorySize/1024"></span></li><li><span class="cloudDetailName">CPU核数</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.cpuCount"></span></li><li><span class="cloudDetailName">内存GB小时数</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.memoryHoursString"></span></li><li><span class="cloudDetailName">CPU小时数</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.cpuHours"></span></li><li><span class="cloudDetailName">硬盘容量GB</span><span class="data-num" v-if="datas == null"><mt-spinner color="#26a2ff" type="fading-circle"></mt-spinner></span><span class="data-num" v-else v-html="datas.total.volumeSize"></span></li></ul></div><div class="cloudlist"><div class="module" v-for="group in groups"><div class="module-left"><div class="module-left-name multi" v-if="group.name.length > 6"><span v-html="group.name"></span></div><div class="module-left-name" v-else><span v-html="group.name"></span></div><div class="module-left-data"><i class="iconfont icon-renminbi"></i><span v-html="group.totalString"></span></div></div><div class="module-right cloudDeatil"><ul><li><span class="item-name">云主机数量</span><span class="item-data" v-html="group.serverCount"></span></li><li><span class="item-name">CPU核数</span><span class="item-data" v-html="group.cpuCount"></span></li><li><span class="item-name">CPU小时数</span><span class="item-data" v-html="group.cpuHoursString"></span></li><li><span class="item-name">内存数GB</span><span class="item-data" v-html="group.memorySize/1024"></span></li><li><span class="item-name">内存GB小时数</span><span class="item-data" v-html="group.memoryHoursString"></span></li><li><span class="item-name">硬盘容量GB</span><span class="item-data" v-html="group.volumeSize"></span></li></ul></div></div></div></div></mt-loadmore></mt-tab-container-item><mt-tab-container-item id="dsj"><!--大数据--><div class="mtslider productslider"><img src="img/dashujuSlider@2x.png"></div><div class="mtMenulist mtMenulistDashuju clearfix"><ul><li><a>数据源</a></li><li><a>数据抽取</a></li><li><a>数据存储</a></li><li><a>商业报表</a></li><li><a>大数据库处理</a></li><li><a>数据查询分析</a></li><li><a>数据仓库</a></li></ul></div><div class="mtArticle clearfix"><h1 class="mtArticleH1"><span class="iconfont icon-dashuju"></span><span>中信大数据</span></h1><ul class="mtDesList"><li><span class="iconDot"></span><a>大数据为企业获得更为深刻、全面的洞察能力提供了前所未有的空间与潜力。</a></li><li><span class="iconDot"></span><a>实时准确地监控、追踪竞争对手动态，是企业获取竞争情报的利器。</a></li><li><span class="iconDot"></span><a>通过大数据计算可以帮助企业进行品牌信息的水平化设计和碎片化扩散。</a></li><li><span class="iconDot"></span><a>为企业决策部门和管理层提供便捷、多途径的企业战略决策工具。</a></li></ul></div></mt-tab-container-item><mt-tab-container-item id="wlw"><!-- 物联网 --><mt-loadmore :top-method="loadWlwTop" :auto-fill="false" ref="wlwloadmore"><div class="mtslider productslider"><img src="img/wulianwangSlider@2x.png"></div><div class="menulist clearfix"><ul><li><p><span class="iconfont icon-temperature"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'大气温度：\' + wlwDatas.dqwd + \'℃\'"></span></p></li><li><p><span class="iconfont icon-shidu"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'大气湿度：\' + wlwDatas.dqsd + \'℃\'"></span></p></li><li><p><span class="iconfont icon-turangwendu"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'土壤温度：\' + wlwDatas.trwd + \'℃\'"></span></p></li><li><p><span class="iconfont icon-turangshidu"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'土壤湿度：\' + wlwDatas.trsd + \'℃\'"></span></p></li><li><p><span class="iconfont icon-fengsu"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'风速：\' + wlwDatas.fs + \' m/s\'"></span></p></li><li><p><span class="iconfont icon-redianfengxiangbiao"></span><span class="menuText" v-if="wlwDatas == null"><mt-spinnercolor="#26a2ff" type="fading-circle"></mt-spinner></span><span class="menuText" v-else  v-html="\'风向：\' + wlwDatas.fx + \'\'"></span></p></li></ul></div><div class="mtArticle clearfix"><h1 class="mtArticleH1"><span class="iconfont icon-qingbaobanlianwang"></span><span>中信物联网</span></h1><p>物联网是“信息化”时代的重要发展阶段。其一，物联网的核心和基础仍然是互联网，是在互联网基础上的延伸和扩展的网络；其二，其用户端延伸和扩展到了任何物品与物品之间，进行信息交换和通信，也就是物物相息。物联网通过智能感知、识别技术与普适计算等通信感知技术，广泛应用于网络的融合中，也因此被称为继计算机、互联网之后世界信息产业发展的第三次浪潮。物联网是互联网的应用拓展，与其说物联网是网络，不如说物联网是业务和应用。因此，应用创新是物联网发展的核心，以用户体验为核心的创新2.0是物联网发展的灵魂。</p></div></mt-loadmore></mt-tab-container-item></mt-tab-container></div></mt-tab-container-item><mt-tab-container-item id="关于我们"><div class="aboutMe"><mt-cell title="中心概况" is-link to="/about/info"><span slot="icon" class="iconfont icon-gaikuang"></span></mt-cell><mt-cell title="组织沿革" is-link to="/about/history"><span slot="icon" class="iconfont icon-zuzhijigoushaixuan"></span></mt-cell><mt-cell title="组织定位" is-link to="/about/orientation"><span slot="icon" class="iconfont icon-icon4"></span></mt-cell><mt-cell title="中心文化" is-link to="/about/culture"><span slot="icon" class="iconfont icon-tubiao"></span></mt-cell></div></mt-tab-container-item></mt-tab-container></div><mt-tabbar v-model="selected" fixed ref="tabbars"><mt-tab-item id="基础产品"><span class="iconfont icon-icon61"></span><span class="footerText">基础产品</span></mt-tab-item><mt-tab-item id="云数物端"><span class="iconfont icon-chanpin"></span><span class="footerText">云数物</span></mt-tab-item><mt-tab-item id="关于我们"><span class="iconfont icon-guanyuwomen"></span><span class="footerText">关于我们</span></mt-tab-item></mt-tabbar></div>',
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
const Infoplat = { template: '<div>AAA</div>' }
// 系统配置平台
const Config = { template: '<div>AAA</div>'}
// 基础组件平台
const Coral = { template: '<div>AAA</div>'}
// 全文检索平台
const Search = { template: '<div>AAA</div>'}
// 系统管理平台
const Authsystem = { template: '<div>AAA</div>'}
// 工作流平台
const Workflow = { template: '<div>AAA</div>'}

// 灵器
// 电子文件通用浏览器
const BrowserTool = {template: '<div>AAA</div>'};
// 电子文件封装工具
const PackageTool = {template: '<div>AAA</div>'};
// 电子文件格式转换软件
const ConvertTool = {template: '<div>AAA</div>'};
// 电子文件检测软件
const CheckTool = {template: '<div>AAA</div>'};
// 电子文件离线浏览软件
// const OfflineTool = {template: '#offlinetoolpage'};

// 关于我们
// 中心概述
const CenterInfo = {template: '<div>AAA</div>'};
// 组织沿革
const OrganizeHistory = {template: '<div>AAA</div>'};
// 组织定位
const OrganizeOrientation = {template: '<div>AAA</div>'};
// 中心文化
const CenterCulture = {template: '<div>AAA</div>'};

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
