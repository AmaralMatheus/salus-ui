import { createWebHistory, createRouter } from "vue-router"
import Home from "./pages/Home.vue"
import Login from "./pages/Login.vue"
import Register from "./pages/Register.vue"
// lazy-loaded
const Profile = () => import("./pages/Profile.vue")
const Company = () => import("./pages/Company.vue")
const User = () => import("./pages/User.vue")
const Procedures = () => import("./pages/Procedures.vue")
const Clients = () => import("./pages/client/Clients.vue")
const ClientDetails = () => import("./pages/client/ClientDetails.vue")
const ClientRegister = () => import("./components/ClientRegister.vue")
const Finance = () => import("./pages/Finance.vue")
const Agenda = () => import("./pages/Agenda.vue")

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/profile",
    name: "profile",
    // lazy-loaded
    component: Profile,
  },
  {
    path: "/clientes",
    name: "client",
    // lazy-loaded
    component: Clients,
  },
  {
    path: "/clientes/:id",
    name: "client-details",
    // lazy-loaded
    component: ClientDetails,
  },
  {
    path: "/clientes/registro/:id?",
    name: "client-register",
    // lazy-loaded
    component: ClientRegister,
  },
  {
    path: "/financeiro",
    name: "financeiro",
    // lazy-loaded
    component: Finance,
  },
  {
    path: "/agenda",
    name: "agenda",
    // lazy-loaded
    component: Agenda,
  },
  {
    path: "/ajustes",
    name: "user",
    // lazy-loaded
    component: Company,
  },
  {
    path: "/ajustes/registro/:id?",
    name: "user-register",
    // lazy-loaded
    component: User,
  },
  {
    path: "/procedimentos",
    name: "procedures",
    // lazy-loaded
    component: Procedures,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
const publicPages = ['/login', '/register', '/home'];
const authRequired = !publicPages.includes(to.path);
const loggedIn = localStorage.getItem('user');

// trying to access a restricted page + not logged in
// redirect to login page
if (authRequired && !loggedIn) {
    next('/login');
} else {
    next();
}
});

export default router
