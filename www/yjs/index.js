

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
            this.$http.jsonp('http://10.250.190.140/cescloud/tj/index.json', {
                timeout: 3000
            }).then(function(response) {
                this.datas = response.body;
                this.groups = this.datas.groups;
                if(callback) {
                    callback();
                }
            }).catch(function(response) {
                console.log(response);
                this.$http.get('data.json', {
                    timeout: 3000
                }).then(function(response) {
                    this.datas = response.body;
                    this.groups = this.datas.groups;
                    if(callback) {
                        callback();
                    }
                }).catch(function(response) {
                    console.log(response);
                    if(callback) {
                        callback();
                    }
                })
            })
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