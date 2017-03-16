/**
 *
 * @authors Your Name (you@example.org)
 * @date    2016-10-18 14:15:58
 * @version $Id$
 */

const User = {
  template: '<div class="user"><h2>User {{ $route.params.id }}</h2><router-view></router-view></div>'
}

const TAB1 = { template: '<span>Message is</span>' }
const TAB2 = { template: '<div>Profile</div>' }
const TAB3 = { template: '<div>Posts</div>' }

const router = new VueRouter({
  routes: [
    { path: '/user/:id', component: User,
      children: [
        { path: 'tab1', component: TAB1 },
        { path: 'tab2', component: TAB2 },
        { path: 'tab3', component: TAB3 }
      ]
    }
  ]
})

const app = new Vue({ router }).$mount('#app')
