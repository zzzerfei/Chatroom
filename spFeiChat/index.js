// 1、连接请求nodejs-websocket
const ws = require('nodejs-websocket')

const TYPE_ENTER = 0
const TYPE_LEAVE = 1
const TYPE_MSG = 2

// 记录当前在线人数
let count = 0

/*
  渲染的消息演样式单一 不美观
  应该可以对消息做处理
  消息作为一个对象 
  消息的类型：type
  0：进入聊天室   1：离开聊天室  2：正常聊天消息
  消息的内容：msg
  时间：time
*/

// 2、创建server
const server = ws.createServer(conn => {
  count++;
  // 给用户加上名字
  conn.userName = `用户${count}`

  // 告诉所有用户有人加入了聊天室
  broadcast({
    type: TYPE_ENTER,
    msg: `${conn.userName}进入了聊天室`,
    time: new Date().toLocaleTimeString()
  })

  // 接受浏览器链接 
  conn.on('text', data => {
    // 收到信息时，告诉所有的用户内容是什么
    broadcast({
      type: TYPE_MSG,
      msg: data,
      time: new Date().toLocaleTimeString()
    })
  })

  // 关闭连接 
  conn.on('close', data => {
    // 告诉所用用户，有人离开了聊天室
    console.log(data)
    count--;
    broadcast({
      type: TYPE_LEAVE,
      msg: `${conn.userName}离开了聊天室`,
      time: new Date().toLocaleTimeString()
    })
  })

  // 异常处理
  conn.on('error', data => {
    console.log(data)
  })
})

// 广播，给所有用户发消息
function broadcast(msg) {
  // server.connectins:表示所有用户
  server.connections.forEach(item => {
    item.send(JSON.stringify(msg))
  })
}

// 3、监听端口
server.listen(5000, () => {
  console.log('运行成功，端口号为5000')
})