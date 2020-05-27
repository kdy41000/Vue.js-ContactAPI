<template>
  <div id="container">
    <div class="page-header">
      <h1 class="text-center">연락처 관리 애플리케이션</h1>
      <p>(Dynamic Component + EventBus + Axios)</p>
    </div>  
    <!-- 동적 컴포넌트 설정 -->
    <component :is="currentView" :contact="contact"></component>
    <contactList :contactlist="contactlist"></contactList>
  </div>  
</template>

<script type="text/javascript">
import ContactList from './components/ContactList';
import AddContact from './components/AddContact';
import UpdateContact from './components/UpdateContact';
import UpdatePhoto from './components/UpdatePhoto';
import CONF from './Config.js';      //baseURL
import eventBus from './EventBus.js';   //eventBus

export default {
  name: 'app',
  components : { ContactList, AddContact, UpdateContact, UpdatePhoto },
  data: function() {
    return {
      currentView : null,
      contact : { no:0, name:'', tel:'', address:'', photo:'' },    //api에 요청 시 전송할 파라미터
      contactlist : {
        pageno:1, pagesize: CONF.PAGESIZE, totalcount:0, contacts:[]
      }
    }
  },
  mounted : function() {     // 이벤트 버스가 마운트 된 직후 호출됨
    this.fetchContacts();     //초기 한번 전체 연락처 조회 함수 실행
    eventBus.$on("cancel", () => {
      this.currentView = null;  // null이면 <component>에 아무런 컴포넌트도 나타나지 않음
    });
    eventBus.$on("addSubmit",(contact) => {
      this.currentView = null;   //currentView를 비워줌(addContact메서드에서 fetchContacts호출예정)
      this.addContact(contact);  //addContact메서드 호출
    });
    eventBus.$on("updateSubmit",(contact) => {
      this.currentView = null;
      this.updateContact(contact);
    });
    eventBus.$on("addContactForm", () => {
      this.currentView = 'addContact';
    });
    eventBus.$on("editContactForm",(no) => {
      this.fetchContactOne(no)    //수정 전 상세조회
      this.currentView = 'updateContact';
    });
    eventBus.$on("deleteContact",(no) =>{
      this.deleteContact(no);
    });
    eventBus.$on("editPhoto",(no) => {
      this.fetchContactOne(no)
      this.currentView = 'updatePhoto';
    });
    eventBus.$on("updatePhoto",(no,file) => {
      if(typeof file !=='undefined'){
        this.updatePhoto(no, file);
      }
      this.currentView = null;
    });
    eventBus.$on("pageChanged",(page) => {
      this.pageChanged(page);
    })
  },
  methods : {
    pageChanged : function(page) {   //보여줄 페이지를 변경함
        this.contactlist.pageno = page;
        this.fetchContacts();
    },
    fetchContacts : function() {     //전체 연락처 데이터를 페이징하여 조회함
        this.$axios.get(CONF.FETCH, {
          params : {
            pageno: this.contactlist.pageno,
            pagesize: this.contactlist.pagesize
          }
        })
        .then((response) => {
          this.contactlist = response.data;
        })
        .catch((ex) => {
          console.log('fetchContacts failed',ex);
          this.contactlist.contacts = [];
        })
    },
    addContact : function(contact) {   //연락처 한건을 추가함
        this.$axios.post(CONF.ADD, contact)
        .then((response) => {
          if(response.data.status ==="success") {
            this.contactlist.pageno = 1;
            this.fetchContacts();
          } else {
            console.log('연락처 추가 실패 : ' + response.data.message);
          }
        })
        .catch((ex) => {
          console.log('addContact failed : ',ex);
        })
    },
    updateContact : function(contact) {   //연락처 한건을 수정함
        this.$axios.put(CONF.UPDATE.replace("${no}",contact.no),contact)  //replace로 해당 번호 및 입력한 값을 전달
        .then((response) => {
          if(response.data.status === "success") {
            this.fetchContacts();
          }else {
            console.log('연락처 변경 실패 : ' + response.data.message);
          }
        })
        .catch((ex) => {
          console.log('updateContact failed : ',ex);
        })
    },
    fetchContactOne : function(no) {     //일련번호를 이용해 특정 연락처 한건을 조회함
        this.$axios.get(CONF.FETCH_ONE.replace("${no}",no))
        .then((response) => {
          this.contact = response.data;
        })
        .catch((ex) => {
          console.log('fetchContactOne failed',ex);
        })
    },
    deleteContact : function(no) {        //연락처 한건을 삭제함
        this.$axios.delete(CONF.DELETE.replace("${no}",no))
        .then((response) => {
          if (response.data.status === "success") {
            this.fetchContacts();
          } else {
            console.log('연락처 삭제 실패 : ' + response.data.message);
          }
        })
        .catch((ex) => {
          console.log('delete failed', ex);
        })
    },
    updatePhoto : function(no, file) {    //일련번호와 파일 요소 정보를 이용해 사진 파일을 변경함
        var data = new FormData();  //파일 업로드이기 때문에 form에서 보낸 것과 일치 시켜야한다.
        data.append('photo', file);
        this.$axios.post(CONF.UPDATE_PHOTO.replace("${no}",no),data)
        .then((response) => {
          if(response.data.status === "success"){
            this.fetchContacts();
          } else {
            console.log('연락처 사진 변경 실패 : ' + response.data.message);
          }
        })
        .catch((ex) => {
          console.log('updatePhoto failed', ex);
        })
    }
  }
}
</script>

<style scoped>
#container {
  font-family: 'Avenir', Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align:center;
  color: #2c3e50;
  margin-top:60px;
}
</style>