/**
 *
 * @authors Your Name (you@example.org)
 * @date    2016-10-18 14:15:58
 * @version $Id$
 */

const User = {
  template: '<div class="user"><h2>{{ $route.params.id }}</h2><router-view></router-view></div>'
}

const XIAOXI = { template: '<span>Message is</span>' }
const TONGXUNLU = { template: '<div>Profile</div>' }
const FAXIIAN = { template: '<div>Posts</div>' }
const ME = { template: '<div>Posts</div>' }

const router = new VueRouter({
  routes: [
    { path: '/page/:id', component: User,
      children: [
        { path: 'xiaoxi', component: XIAOXI },
        { path: 'tongxunlu', component: TONGXUNLU },
        { path: 'faxian', component: FAXIIAN },
        { path: 'me', component: ME }
      ]
    }
  ]
})

const app = new Vue({ router }).$mount('#app')
