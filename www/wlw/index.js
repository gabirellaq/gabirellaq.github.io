/**
 * Created by lenovo on 2017/3/12.
 */

new Vue({
    el: '.wrapper',
    data: function () {
        return {
            datas: null
        }
    },
    methods: {
        loadData: function(callback){
            this.$http.jsonp('http://180.168.156.212:2177/cold/mqtt/wlw.json', {
                timeout: 3000
            }).then(function(response) {
                this.datas = response.body;
                if(callback) {
                    callback();
                }
            }).catch(function(response) {
                console.log(response);
                this.datas = {};
                if(callback) {
                    callback();
                }
            })

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