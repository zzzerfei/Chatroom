module.exports = {
  outputDir:__dirname + "/../chatroomserver/chatroom",
  publicPath: process.env.NODE_ENV === 'production'
  ? '/chatroom/'
  : '/'
}

