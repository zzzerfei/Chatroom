/* 聊天室的主要功能 */

// 1.连接socketio服务
const socket = io('http://localhost:3200');
let userID;
let userName;
let avatarSrc;

// 选中头像功能
let avatars = document.querySelector('#login_avatar')
avatars = Array.from(avatars.children)
avatars.forEach(itme => {
  itme.onclick = function () {
    avatars.forEach(item => {
      item.classList.remove('now')
    })
    this.classList.add('now')
  }
})



// 发送图片功能
$('#file').on('change', function () {
  let file = this.files[0]
  // 需要把这个文件发送到服务器,借助于H5新增的fileReader
  var fr = new FileReader()
  // 读取选中的文件内容
  fr.readAsDataURL(file)
  // 读取成功 fr.result 保存有读取到的数据
  fr.onload = function () {
    socket.emit('userMessage', {
      id: userID,
      file: fr.result,
      type: 'image'
    })
  }
})

// 拿到登录按钮   点击按钮登录
let login = document.querySelector('#loginBtn')

login.onclick = function () {
  // 获取用户名
  // trim 去除两端空格
  let userName = document.querySelector('#username').value.trim()

  if (!userName) {
    alert('请输入用户名！');
    return
  }

  // 获取选择的头像的路径
  let avatarSrc = document.querySelector('#login_avatar li.now img').getAttribute('src')
  console.log(userName)
  console.log(avatarSrc)

  // 需要告诉我们的 socketIo 服务 我需要登陆
  socket.emit('login', {
    userName,
    avatarSrc
  })
}

// 监听登录失败的请求
socket.on('loginError', data => {
  alert('用户名已存在')
})

// 监听登录成功的请求
socket.on('loginSuccess', data => {
  // 需要显示聊天窗口 隐藏登录窗口
  $('.login_box').fadeOut()
  $('.container').fadeIn()

  // 设置个人信息
  $('#avatar-url').attr('src', data.avatarSrc)
  $('#loginUserName').text(data.userName)

  console.log(data)
  userName = data.userName
  avatarSrc = data.avatarSrc
})

// 监听用户进来的广播事件
socket.on('adduser', data => {
  console.log(data)
  // 添加系统消息
  $('.box-bd').append(`
  <div class="system">
    <p class="message_system">
      <span class="content">${data.userName}加入了群聊</span>
    </p>
  </div>
  `)
  scrollIntoEnd()
})

// 监听在线用户数据
socket.on('userList', data => {
  console.log(data)
  // 渲染数据 data现在是一个数组 要遍历
  // 不断append一个li会导致重复 所以要先清空列表数据
  $('.user-list ul').html('')
  data.forEach(item => {
    $('.user-list ul').append(`
    <li class="user">
      <div class="avatar"><img src="${item.avatarSrc}" alt=""></div>
      <div class="name">${item.userName}</div>
    </li>
    `)
  })

  // 当前在线人数
  $('#userTotalNumber').text(data.length)

})


// 监听用户退出聊天室
socket.on('delUser', data => {
  // 添加系统消息
  $('.box-bd').append(`
  <div class="system">
    <p class="message_system">
      <span class="content">${data.userName}离开了群聊</span>
    </p>
  </div>
  `)
  scrollIntoEnd()
})

// 实现聊天功能
$('.btn-send').on('click', () => {

  // 获取聊天的内容
  // var content = $('#content')
  // .val()
  // .trim()
  // console.log(content)
  // $('#content').val('')
  var content = document.getElementById('content').innerText.trim()
  if (!content) return alert('请输入内容！')
  console.log(content)
  $('#content').html('')
  $('#content').focus();
  // 如果拿到内容 发送到服务器
  socket.emit('sendMessage', {
    msg: content,
    userName,
    avatarSrc
  })
})
// 按下 ctrl + enter 发送
document.querySelector('#content').addEventListener('keydown', function (e) {
  if (e.ctrlKey) {
    e.target.onkeydown = function (e) {
      if (e.keyCode === 13) {
        document.querySelector('#btn-send').click()
        return false
      }
    }
  }
})
document.querySelector('#content').addEventListener('keyup', function (e) {
  e.target.onkeydown = null
})

// 监听服务器收到的聊天消息 并渲染到窗口中
socket.on('allmsg', data => {
  console.log(data)
  // 判断是自己的消息还是其他人的消息
  if (data.userName === userName) {
    $('.box-bd').append(`
    <div class="message-box">
      <div class="my message">
        <img src="${data.avatarSrc}" alt="" class="avatar">
        <div class="content">
          <div class="bubble">
            <div class="bubble_cont">${data.msg}</div>
          </div>
        </div>
      </div>
    </div>
    `)
  } else {
    $('.box-bd').append(`
    <div class="message-box">
      <div class="other message">
        <img src="${data.avatarSrc}" alt="" class="avatar">
        <div class="content">
          <div class="nickname">${data.userName}</div>
          <div class="bubble">
            <div class="bubble_cont">${data.msg}</div>
          </div>
        </div>
      </div>
    </div>
    `)
  }
  scrollIntoEnd()
})

// 发送图片功能
$('#file').on('change', function () {
  var file = this.files[0]

  // 需要把这个文件发送到服务器上，借助H5新增的fileReader
  var fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = function () {
    socket.emit('sendImage', {
      userName,
      avatarSrc,
      img: fr.result
    })
  }
})

// 监听图片聊天信息
socket.on('Image', data => {
  console.log(data)
  // 判断是自己的消息还是其他人的消息
  if (data.userName === userName) {
    $('.box-bd').append(`
    <div class="message-box">
      <div class="my message">
        <img src="${data.avatarSrc}" alt="" class="avatar">
        <div class="content">
          <div class="bubble">
            <div class="bubble_cont">
              <img src="${data.img}" >
            </div>
          </div>
        </div>
      </div>
    </div>
    `)
  } else {
    $('.box-bd').append(`
    <div class="message-box">
      <div class="other message">
        <img src="${data.avatarSrc}" alt="" class="avatar">
        <div class="content">
          <div class="nickname">${data.userName}</div>
          <div class="bubble">
            <div class="bubble_cont"> <img src="${data.img}" ></div>
          </div>
        </div>
      </div>
    </div>
    `)
  }
  // 如果有图片,等图片加载完成再滚动到可视区底部
  $('.box-bd img:last').on('load', function () {
    scrollIntoEnd()
  })
  // let lastImg = document.querySelectorAll('.box-bd img.user-message')
  // lastImg = lastImg[lastImg.length - 1]

  // if (lastImg) {
  //   lastImg.onload = function () {
  //     scrollIntoEnd()
  //   }
  // }
})

// 初始化jquery-emoji插件
// $("#content").emoji({
//   button: "#btn",
//   showTab: false,
//   animation: 'slide',
//   position: 'topLeft',
//   icons: [{
//       name: "QQ表情",
//       path: "dist/img/qq/",
//       maxNum: 91,
//       excludeNums: [41, 45, 54],
//       file: ".gif"
//   }]
// });

// 把聊天窗口滚动到可视区最底部
function scrollIntoEnd() {
  // 找到div里边的最后一个子元素
  // scrollIntoView 方法让当前的元素滚动到浏览器窗口的可视区域内。true顶部  false 底部
  $('.box-bd').children(':last').get(0).scrollIntoView(false)
}