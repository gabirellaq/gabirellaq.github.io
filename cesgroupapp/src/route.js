//import Infoplat from './pages/base/Infoplat.vue';
//import Index from './index.vue';
import Links from './links.json';

const registerRoute = (links) => {
    let route = [];
    links.map(link =>
        route.push({
            name: link.name,
            path: '/'+link.name,
            component: require('./pages/'+link.name+'.vue')
        })
    );

    return route;
};

const route = registerRoute(Links);

route.push({
    path: '/',
    component: require('./index.vue')
});

export default route;
