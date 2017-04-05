import Vue from 'vue';
import VueResource from 'vue-resource';
import routes from './route.js';
import VueRouter from 'vue-router';
import MintUI from 'mint-ui';
import App from './App.vue';

Vue.use(MintUI);
Vue.use(VueResource);
Vue.use(VueRouter);

const router = new VueRouter({
    // base: __dirname,
    routes
});

const app = new Vue({
    el: '#app',
    render: h => h(App),
    router,
    data () {
        return {
            transitionComplete: false
        }
    },
});

let indexScrollTop = 0;
router.beforeEach((route, redirect, next) => {
    if (route.path !== '/') {
        indexScrollTop = document.body.scrollTop;
    }
    next();
});

router.afterEach(route => {
    if (route.path !== '/') {
        document.body.scrollTop = 0;
    } else {
        Vue.nextTick(() => {
            document.body.scrollTop = indexScrollTop;
        });
    }
});