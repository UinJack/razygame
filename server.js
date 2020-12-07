const express = require("express");
const io = require("socket.io");
const app = express();


/**
* 相关参数配置
**/

const time = 60 * 1000 //绘制一个词的游戏时间单位ms
const words = ['跑','唱','喝','敲','吆喝','盯','踢','闻','听','摸'] //词语列表
const port = 3000 //服务器端口


const clients = []
const connectionList = []
let currentIndex = 0
app.use(express.static('./'));
app.get('/index.htm', function (req, res) {
    res.sendFile(__dirname + "/" + "index.htm");
})
var server = app.listen(port, function () {
    console.log(`应用实例，访问地址为http://127.0.0.1:${port}`)
})

var sockets = io(server);//监听server
sockets.on("connection",function(socket){
  // console.log(socket.client.id)
  clients.push(socket.client)
  connectionList.push(socket)
  console.log("初始化成功！");
  const commandList = []
  socket.on("send",function(data){
    socket.broadcast.emit("getMsg", data );
  })

  setTimeout(() => {
    socket.emit("count", `现在有${clients.length}在线` );
    socket.broadcast.emit("count", `现在有${clients.length}在线` );
  }, 1000)

  

  socket.on("action",function(data){
    if(data == 'start'){
      console.log('开始游戏')
      sendWord()
    }
  })


  socket.on("disconnect",function(data){
    let delIndex = null
    clients.find((item, i) => {
      if(item.id === socket.client.id){
        delIndex = i
        return true
      }
    }) 

    if(delIndex != null){
      clients.splice(delIndex, 1)  
      connectionList.splice(delIndex, 1)
    }
    socket.broadcast.emit("count", `现在有${clients.length}在线` );
  })

});


function sendWord(){
  if( currentIndex < connectionList.length ){
    connectionList[currentIndex].emit('word', words[ currentIndex ] )

    const viewList = connectionList.filter(item=>item.id !== connectionList[currentIndex].id)
    viewList.forEach((item) => {
      item.emit('word', 'end')
    })

    if( currentIndex !== 0){
       connectionList[currentIndex - 1].emit('word', 'end')
    }
    currentIndex ++
    setTimeout(() => {
      sendWord()
    }, time)
  }else{
    connectionList.forEach((item) => {
      item.emit('word', 'clear')
    })
    console.log('游戏结束')
   currentIndex = 0
  }
  
}
