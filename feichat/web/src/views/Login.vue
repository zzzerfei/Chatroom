<!--  -->
<template>
  <div>
    <div class="login_box" v-if="isShow">
      <!-- 头部 -->
      <div class="title">
        <p>Welcome to</p>
        <p>Feichat</p>
      </div>
      <!-- 用户名 -->
      <div class="content">
        <p>用户名</p>
        <input
          type="text"
          placeholder="请输入用户名"
          required
          id="username"
          ref="username"
        />
      </div>
      <!-- 头像选择 -->
      <div>
        <p>选择头像</p>
        <ul class="avatar" id="login_avatar">
          <li v-for="(item, index) in imgs" :key="index">
            <img
              :src="require('../assets/img/login/' + item)"
              alt=""
              ondragstart="return false"
              @click="clickImg(index, item)"
              :class="{ active: currentIndex === index ? true : false }"
            />
            <!-- <img :src="`../assets/img/login/${item}`" alt="" ondragstart="return false" /> -->
          </li>
        </ul>
      </div>
      <button type="button" class="login-btn" id="loginBtn" @click="login">
        登录
      </button>
    </div>

    <!-- 聊天区域 -->
    <chat-room v-else 
    :user="user" 
    :userList="userList" 
    ref="chatroom" 
    @sendServer="sendServer"
    :message="message"
    />
  </div>
</template>

<script>
import io from "socket.io-client"; //引入socket.io-client

import ChatRoom from "./ChatRoom";

export default {
  data() {
    return {
      // 头像地址
      imgs: [
        "1.jpeg",
        "2.jpeg",
        "3.jpeg",
        "4.jpeg",
        "5.jpg",
        "6.jpg",
        "7.jpg",
        "8.jpeg",
        "9.jpeg",
        "10.jpeg",
      ],
      currentIndex: "",
      username: "", //用户名
      imgUrl: "", //选中的头像地址
      socket: null,
      isShow: true,
      user: {},
      userList: {},
      message: {}, //聊天信息
    };
  },
  components: {
    ChatRoom,
  },
  methods: {
    clickImg(index, item) {
      console.log(index);
      console.log(item);
      this.currentIndex = index;
      this.imgUrl = item;
    },
    login() {
      // 拿到用户名信息并登录
      const username = this.$refs.username.value;
      console.log(username);
      if (!username.trim()) {
        alert("要输入用户名喔");
        return;
      }
      // 将用户信息发送的服务器
      this.socket.emit("login", {
        username,
        avatar: this.imgUrl,
      });
    },
    // 拿到ChatRoom组件传来的数据   发送的聊天信息
    sendServer(content) {
      console.log(content)
      const {username, avatar} = this.user
      this.socket.emit('sendMessage', {
        msg: content,
        username,
        avatar
      })
    }
  },
  mounted() {
    // 实现聊天室的主要功能
    // 连接服务器
    // this.socket = io("http://localhost:3200");
    
    this.socket = io(process.env.VUE_APP_URL || "/");
    console.log(this.socket);

    // 监听登录失败的请求
    this.socket.on("loginError", (data) => alert(data.msg));

    // 监听登录成功的请求
    this.socket.on("loginSuccess", (data) => {
      console.log(data);
      this.user = data;
      this.isShow = false;
    });

    // 监听加入聊天室信息
    this.socket.on("addUser", (data) => {
      console.log(data);
      this.$store.commit("setJoinRoom", data);
      this.$refs.chatroom ? this.$refs.chatroom.haveOnejoinRoom() : null;
    });

    // 监听离开聊天室消息
    this.socket.on("delUser", (data) => {
      console.log(data);
      this.$store.commit("setLeaveRoom", data);
      this.$refs.chatroom ? this.$refs.chatroom.haveOneleaveRoom() : null;
    });

    // 监听用户列表的信息
    this.socket.on("userList", (data) => {
      this.userList = data;
    });

    // 监听聊天的消息
    this.socket.on("allmsg", (data) => {
      // 把接收到的消息显示到聊天窗口中
      console.log(data);
      this.message = data;
    });

    // 监听图片的消息
    this.socket.on("Image", (data) => {
      // 把接收到的图片显示到聊天窗口中
      this.$refs.chatroom.handleImage(data);
    });
  },
};
</script>

<style lang="less"  scoped>
.login_box p {
  font-size: 16px;
  padding: 10px 0px;
}

.login_box input,
.login_box button {
  display: block;
  width: 100%;
  padding: 8px 0;
}

.login_box {
  position: relative;
  top: 100px;
  width: 300px;
  height: 400px;
  margin: 0px auto;
  padding: 50px;
  background: #fff;
  border-radius: 5px;
  box-shadow: #999 0px 2px 10px;
  .title p {
    text-align: center;
    font-size: 22px;
  }
  .content input {
    border: 1px solid grey;
    padding: 8px 5px;
  }
  .avatar {
    width: 100%;
    border: 1px solid grey;
    display: flex;
    flex-wrap: wrap;
    .active {
      transform: scale(1.2);
    }
  }
  .avatar li {
    width: 60px;
    height: 60px;
    padding: 2px;
    box-sizing: border-box;
  }
  .avatar li img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.4s;
  }
  .avatar li img:hover {
    transform: scale(1.1);
  }

  .login-btn {
    background: #3caf36;
    border: 0px;
    border-radius: 2px;
    color: #fff;
    margin-top: 20px;
    cursor: pointer;
  }
}

.login_box .avatar::after {
  content: "";
  display: block;
  clear: both;
}

.invisible {
  display: none;
}
</style>
