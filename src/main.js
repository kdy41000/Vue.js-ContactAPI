import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
//axios는 Promise기반이다. default로 IE에서는 Promise를 사용 할 수 없기 때문에 polyfill 요소를 참조해야한다.
import ES6Promise from 'es6-promise'
ES6Promise.polyfill()

//axios 간편사용 설정
Vue.prototype.$axios = axios;
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
