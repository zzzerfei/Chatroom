<template>
  <!-- 聊天盒子 -->
  <div class="container">
    <!-- 左侧用户列表 -->
    <div class="user-list">
      <div class="header">
        <div class="avatar">
          <img
            id="avatar-url"
            :src="require('@/assets/img/login/' + user.avatar)"
            alt=""
            class="img avatar_url"
          />
        </div>
        <div class="info">
          <h3 id="loginUserName" class="username">{{ user.username }}</h3>
        </div>
      </div>
      <div class="title">
        <h3>用户列表</h3>
      </div>
      <ul>
        <li class="user" v-for="(item, index) in userList" :key="index">
          <div class="avatar">
            <img :src="require('@/assets/img/login/' + item.avatar)" alt="" />
          </div>
          <div class="name">{{ item.username }}</div>
        </li>
      </ul>
    </div>
    <!-- 聊天主窗口 -->
    <div class="box">
      <!-- 群聊 -->
      <div class="box-hd">
        <h3 id="chatName">二肥聊天室({{ userListLength }})</h3>
      </div>
      <div class="box-bd" ref="chat">
        <div
          v-for="(item, index) in messageContent"
          :key="index"
          :class="{
            'my-message': item.type === 1 ? true : false,
            'other-message': item.type === 2 ? true : false,
          }"
        >
          <!-- 加入聊天室提示信息 -->
          <div class="system">
            <p class="message_system">
              <span v-if="item.type === 0" class="content">
                {{ item.username }}加入了群聊
              </span>
            </p>
          </div>
          <!-- 退出聊天室提示信息 -->
          <div class="system">
            <p class="message_system">
              <span v-if="item.type === 3" class="content"
                >{{ item.username }}离开了群聊</span
              >
            </p>
          </div>

          <!-- 自己的消息模板 -->
          <div v-if="item.type === 1" class="message-box">
            <div class="my message">
              <img
                :src="require('@/assets/img/login/' + item.avatar)"
                alt=""
                class="avatar"
              />
              <div class="content">
                <div class="bubble">
                  <div class="bubble_cont">{{ item.msg }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 别人消息模板 -->
          <div v-if="item.type === 2" class="message-box">
            <div class="other message">
              <img
                :src="require('@/assets/img/login/' + item.avatar)"
                alt=""
                class="avatar"
              />
              <div class="content">
                <div class="nickname">{{ item.username }}</div>
                <div class="bubble">
                  <div class="bubble_cont">{{ item.msg }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 聊天窗口底部 -->
      <div class="box-ft">
        <!-- 工具栏 -->
        <div class="toolbar">
          <a href="javascript:;" title="表情" class="face">
            <span class="iconfont icon-smile" @click="emojiShow = !emojiShow"
              ><img src="../assets/img/bq.png" alt=""
            /></span>
            <div
              class="emoji"
              tabindex="1"
              v-show="emojiShow"
              @click="handleEmojiBlur"
            >
              <span
                v-for="item in emojiList"
                :key="item.codes"
                @click="handleEmoji(item)"
                >{{ item.char }}</span
              >
            </div>
          </a>
          <a href="javascript:;" title="图片" class="file">
            <label for="file"><img src="../assets/img/wj.png" alt="" /></label>
            <input type="file" id="file" style="display: none" />
          </a>
        </div>
        <!-- 内容输入区 -->
        <div class="content">
          <!-- div添加contenteditable即可编辑 -->
          <textarea
            id="content"
            class="text"
            ref="textarea"
            contenteditable
          ></textarea>
        </div>
        <!-- 发送按钮 -->
        <div class="action">
          <span class="desc">按下Ctrl+Enter发送</span>
          <button
            class="btn-send"
            id="btn-send"
            @click="SendBtn"
            href="javascript:;"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emoji from "../assets/emoji.json";
export default {
  name: "Home",
  data() {
    return {
      joinRoom: [],
      leaveRoom: [],
      messageContent: [],
      content: "", //聊天信息
      emojiList: [],
      emojiShow: false,
    };
  },
  props: {
    user: {
      type: Object,
      value: "",
    },
    userList: {
      typr: Array,
      value: "",
    },
    message: {
      type: Object, //拿到聊天信息数据
      value: "",
    },
  },
  computed: {
    userListLength() {
      return this.userList.length;
    },
  },
  methods: {
    // 监听到有人进入聊天室
    haveOnejoinRoom() {
      const joinRoom = this.$store.state.joinRoom;
      console.log(joinRoom);
      this.messageContent.push({ ...joinRoom, type: 0 });
    },
    // 监听有人离开聊天室
    haveOneleaveRoom() {
      const leaveRoom = this.$store.state.leaveRoom;
      console.log(leaveRoom);
      this.messageContent.push({ ...leaveRoom, type: 3 });
    },
    // 点击发送消息
    SendBtn() {
      console.log(this.$refs.textarea);
      this.content = this.$refs.textarea.value;
      this.$refs.textarea.value = "";
      if (!this.content) {
        alert("要有内容才可以发信息喔");
      }

      // 将信息发送给服务器
      this.$emit("sendServer", this.content);
      console.log(this.$refs.input);
      // 点击发送后
      this.$nextTick(() => {
        this.$refs.textarea.focus();
      });
    },
    // 发送和接受的信息 判断状态 自己发的就为1  别人发来的就为2
    senremessage(newValue) {
      console.log(newValue);
      if (newValue.username === this.user.username) {
        // 自己发的消息
        this.messageContent.push({ ...newValue, type: 1 });
      } else {
        // 别人发的信息
        this.messageContent.push({ ...newValue, type: 2 });
      }
    },

    // EMOJI
    handleEmojiBlur() {
      this.emojiShow = false;
    },
    handleEmoji(emoji) {
      this.content = this.$refs.textarea.value;
      this.$refs.textarea.value += emoji.char;
    },

    // 实现始终置于聊天窗口底部
    toBottom() {
      const ul = this.$refs.chat;
      console.log(ul);
      ul.scrollTop = ul.scrollHeight;
      console.log(scrollTo);
    },
  },
  mounted() {
    // console.log(this.$store);
    // this.joinRoom = this.$store.state.joinRoom;
    // 这样子好像不能监听到每次有人离开的
    // this.leaveRoom = this.$store.state.leaveRoom
    this.emojiList = emoji;
  },
  watch: {
    message(newValue) {
      this.senremessage(newValue);
    },
  },
  created() {},
  updated() {
    // 定位聊天底部
    this.toBottom();
  },
};
</script>

<style scoped>
.user-list img,
.box-bd .avatar {
  width: 40px;
  height: 40px;
}

.container {
  margin: 0px auto;
  max-width: 1000px;
  min-width: 700px;
  width: 100%;
  height: 100%;
  min-height: 720px;
  border-radius: 3px;
}

.container .user-list {
  box-sizing: border-box;
  padding: 15px;
  float: left;
  height: 100%;
  width: 280px;
  background: #2e3238;
  color: #fff;
  font-size: 16px;
}
.user-list ul {
  height: 580px;
  overflow: auto;
  /* scrollbar-width: 0px; */
}

.container .header,
.container .title {
  border-bottom: 1px solid #26292e;
  margin-bottom: 10px;
  padding-bottom: 10px;
}
.container h3 {
  /* font-size: 10px; */
  font-weight: normal;
  /* border-top: 1px solid #f2f2f2; */
}
.container .avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  display: inline-block;
}
.info,
.user .name {
  float: right;
  width: 190px;
  height: 40px;
  line-height: 40px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.container .user-list .user {
  list-style: none;
  padding: 10px 0px;
}
.container .box {
  /* float: right; */
  display: inline-block;
  height: 100%;
  width: calc(100% - 280px);
  min-width: 420px;
  background: #eeeeee;
  padding: 10px;
  box-sizing: border-box;
}

.container .box .box-hd {
  text-align: center;
  border-bottom: 1px solid #d6d6d6;
  padding-bottom: 10px;
}
.container .box .box-bd {
  width: 100%;
  height: 450px;
  overflow: auto;
  padding: 10px 0px;
}

/* 设置滚动条样式 */
/* 滚动条整体样式 */
.user-list ul::-webkit-scrollbar,
.container .box .box-bd::-webkit-scrollbar,
.box-ft #content::-webkit-scrollbar {
  width: 5px;
  height: 1px;
}
/* 滚动条里面的小方块 */
.user-list ul::-webkit-scrollbar-thumb,
.container .box .box-bd::-webkit-scrollbar-thumb,
.box-ft #content::-webkit-scrollbar-thumb {
  border-radius: 4px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #f2f2f2;
}
/* 滚动条里面的轨道 */
.user-list ul::-webkit-scrollbar-track,
.container .box .box-bd::-webkit-scrollbar-track,
.box-ft #content::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background: #fff;
}

.box-ft {
  border-top: 1px solid #d6d6d6;
  width: 100%;
  height: 180px;
  /* overflow: hidden; */
}
.box-ft .toolbar {
  width: 100%;
  height: 40px;
  padding: 5px;
  box-sizing: border-box;
}
.box-ft .toolbar label {
  display: inline-block;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.box-ft .action {
  float: right;
  height: 40px;
  font-size: 12px;
  color: #9b9b9b;
}
.box-ft .action .btn-send {
  /* width: 40px; */
  display: inline-block;
  padding: 2px 25px;
  background: #fcfcfd;
  color: black;
  text-decoration: none;
  border: 1px solid #9b9b9b;
  font-size: 16px;
  border-radius: 3px;
}
.box-ft .action .btn-send:hover {
  background: #f8f8f8;
}
.box-ft .content,
.box-ft #content {
  height: 120px;
  border: 0px solid black;
  background: #eeeeee;
  outline: none;
  width: 100%;
  font-size: 18px;
  overflow: auto;
}
.box-ft .toolbar a img {
  display: inline-block;
  width: 30px;
  height: 30px;
}

.box-bd .message-box {
  padding: 10px;
  position: relative;
}
.box-bd .message-box .content {
  max-width: 400px;
  display: inline-block;
  padding: 5px 10px;
  box-sizing: border-box;
  line-height: 30px;
  vertical-align: top;
  background: #fff;
  border-radius: 4px;
  position: relative;
}
/* 添加消息框中的小三角 */
.box-bd .message-box .other .content::before {
  position: absolute;
  top: 14px;
  border: 6px solid transparent;
  content: "";
  left: -10px;
  border-right-color: #fff;
  border-right-width: 4px;
}
.box-bd .message-box .my .content::after {
  position: absolute;
  left: 100%;
  top: 14px;
  border: 6px solid transparent;
  content: "";
  border-left-color: #b2e281;
  border-left-width: 4px;
}

.box-bd .message-box .my .avatar,
.box-bd .message-box .my .content {
  float: right;
  margin-right: 10px;
  background: #b2e281;
}
.box-bd .message-box .my::after {
  content: "";
  display: block;
  clear: both;
}
.nickname {
  width: 100%;
  position: absolute;
  top: -25px;
  color: #b7b7b7;
  font-size: 12px;
}
.system {
  padding: 5px 0;
  text-align: center;
  color: #b7b7b7;
  font-size: 12px;
}
.system.leave {
  color: #cc3322;
}
.bubble_cont img {
  max-width: 300px;
}
ul .user {
  border-bottom: 1px solid #26292e;
}
.container .user-list .active {
  background: #3a3f45;
}
.bubble_toName {
  position: absolute;
  font-size: 12px;
  color: gray;
  top: 0;
  left: 100%;
  width: 30px;
  height: 40px;
  line-height: 40px;
  margin-left: 10px;
}
.my .bubble_toName {
  left: -40px;
}

.emoji {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  width: 276px;
  height: 218px;
  overflow: auto;
  bottom: 159px;
  background-color: #fff;
  border: 1px solid #cccccc;
  outline: none;
}
.emoji span {
  padding: 7px;
  cursor: pointer;
}
</style>
