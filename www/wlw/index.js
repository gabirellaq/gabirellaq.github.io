/**
 * Created by lenovo on 2017/3/12.
 */

new Vue({
    el: '.wrapper',
    data: function () {
        return {
            datas: null,
            groups: []
        }
    },
    methods: {
        loadData: function(callback){
            /*this.$http.jsonp('http://10.250.190.148/cescloud/tj/index.json', {
                timeout: 3000
            }).then(function(response) {
                this.datas = response.body;
                this.groups = this.datas.groups;
                if(callback) {
                    callback();
                }
            }).catch(function(response) {
                console.log(response);
                this.datas = {
                    query: {},
                    total: {},
                    groups: []
                };
                if(callback) {
                    callback();
                }
            })*/

            if(callback) {
                callback();
            }
        },
        loadTop: function(id) {
            var _this = this;
            this.$options.methods.loadData.bind(this)(function(){
                _this.$refs.loadmore.onTopLoaded();
            })
        }
    },
    beforeCreate: function() {
        this.$options.methods.loadData.bind(this)();
    }
})