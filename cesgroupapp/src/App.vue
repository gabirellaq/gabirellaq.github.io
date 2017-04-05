<template>
    <div>
        <router-link class="page-back" v-if="visible" :to="'/'" ref="topLink">
            <i class="mintui mintui-back"></i>
        </router-link>
        <transition name="fade" mode="out-in"
                    v-on:before-enter="beforeEnter"
                    v-on:after-enter="afterEnter"
                    v-on:before-leave="beforeLeave"
                    v-on:after-leave="afterLeave">
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'mainapp',
        computed: {
            visible() {
                return this.$route.path != '/';
            },
            transitionComplete: {
                get() {
                    return this.$root.transitionComplete;
                },
                set(value) {
                    this.$root.transitionComplete = value;
                }
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
    };
</script>

<style>
@import "./css/main.min.css";
[v-cloak] {
    display: none;
}

.font-wingdings {
    font-family: Wingdings
}
</style>
