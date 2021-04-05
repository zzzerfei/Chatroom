import Vue from 'vue'
import VueRouter from 'vue-router'

const ChatRoom = ()=>import('../views/ChatRoom')
const Login = ()=>import('../views/Login')

Vue.use(VueRouter)

const routes = [
  {
    path: '/chat',
    name: 'home',
    component: ChatRoom
  },
  {
    path: '/',
    component: Login
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
