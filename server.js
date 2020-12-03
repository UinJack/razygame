const express = require("express");
const io = require("socket.io");
const app = express();


const clients = []
const connectionList = []
let currentIndex = 0
app.use(express.static('./'));
app.get('/index.htm', function (req, res) {
    res.sendFile(__dirname + "/" + "index.htm");
})
var server = app.listen(3000, function () {
    console.log("应用实例，访问地址为http://127.0.0.1:3000")
})

var sockets = io(server);//监听server
sockets.on("connection",function(socket){

  console.log(socket.client.id)
  clients.push(socket.client)
  connectionList.push(socket)
  console.log("初始化成功！下面可以用socket绑定事件和触发事件了");
  const commandList = []
  socket.on("send",function(data){
    socket.broadcast.emit("getMsg", data );
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
  })

});


function sendWord(){
  if( currentIndex < connectionList.length ){
    connectionList[currentIndex].emit('word', 'test' + currentIndex)
    currentIndex ++
    setTimeout(() => {
      sendWord()
    }, 10000)
  }else{
   currentIndex = 0
   connectionList[currentIndex].emit('word', 'test' + currentIndex)
  }
  
}

setTimeout(() => {
  sendWord()
}, 10000)