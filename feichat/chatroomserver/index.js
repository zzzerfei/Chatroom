// 启动聊天服务端
const express = require('express');
const path = require("path")
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server, { cors: true });

// 记录所有登录的用户
const users = []

// express处理静态资源
app.use('/chatroom', express.static(path.join(__dirname, '/chatroom')))

io.on('connection', (socket) => {
  // 用户登录功能
  socket.on('login', data => {
    // 判断 如果data在users中存在 那么不允许登录
    console.log(data)
    let user = users.length!==0 ? users.find(item => item.username === data.username) : false
    if (user) {
      // 表示用户存在，登陆失败，服务器需要给当前用户发送响应，告诉登陆失败
      socket.emit('loginError', { msg: '登陆失败' })
      console.log('登陆失败')
    } else {
      // 表示用户不存在，可以登陆成功
      users.push(data)
      // 告诉用户登录成功
      socket.emit('loginSuccess', data)
      console.log('登陆成功')

      // 告诉所有用户有人登陆进来了
      // io.emit:广播事件
      io.emit('addUser', data)

      // 告诉所有用户现在在线的用户
      io.emit('userList', users)

      // 将用户信息存储起来
      // 也就是说 每一个登陆的 都把用户名和头像信息给存到对应的一个socket里
      socket.username = data.username
      socket.avatar = data.avatar
    }
  })

  // 用户断开连接的功能
  // 监听用户断开连接
  socket.on('disconnect', () => {
    console.log(socket.username)
    console.log(socket.avatar)
    console.log(users)
    // 把当前用户的信息从users中删除
    // 通过数组中的对应下标来删除
    const idx = users.findIndex(item => item.username === socket.username)
    console.log(idx)
    // 删除掉断开连接的这个人
    users.splice(idx, 1)
    // 告诉所有人有人离开了聊天室，并更新用户列表
    io.emit('delUser', {
      username: socket.username
    })
    io.emit('userList', users)
  })

  // 监听用户发送信息的内容
  socket.on('sendMessage', data => {
    console.log(data)
    // 拿到消息后广播给所有用户
    io.emit('allmsg', data)
  })

  // 监听发送图片
  socket.on('sendImage', data => {
    console.log(data)
    // 广播给所有用户
    io.emit('Image',data)
  })
});


server.listen(3200, () => {
  console.log('服务器启动成功！ 端口3200');
});