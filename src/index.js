
import Hammer from 'hammerjs'
import io from 'socket.io-client';


const canvas = document.getElementById('draw-board')
const drawBtn = document.getElementById('draw-btn')
const clearBtn = document.getElementById('clear-btn')
const clock = document.getElementById('clock')
const title = document.getElementById('title')
const count = document.getElementById('count')

let isStop = false

const serverPath = "ws://192.168.7.18:3000/"
const time = 10 //绘制一个词的游戏时间单位s


drawBtn.onclick = function(){
	startGame()
}
clearBtn.onclick = function(){
	clear()
}

window.onload = function(){
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

var ctx=canvas.getContext("2d");
var socket = io( serverPath ); //初始化websocket，连接服务端
var mc = new Hammer.Manager(canvas);
	mc.add( new Hammer.Pan({}) );
	mc.add( new Hammer.Tap({}) );

socket.on('word', (data)=>{
	if(data === 'end'){
		title.innerText = ''	
		onDrawEnd()
	}else if(data === 'clear'){
		clear()
		onDrawEnd()
		title.innerText = `游戏结束了老铁`
	}else{
		title.innerText = `开始游戏了老铁，你要描述的词是${data}`
		onDraw()

	}
})

socket.on('connect', () => {
  console.log(socket.disconnected); // false
});


socket.on('count', (data)=>{
	console.log(data); 
	count.innerText = data
})


function onDraw(){
	setTimeAlert(time)
	isStop = false
	clear()
	socket.emit("send", getBuffer())
	loop()
	mc.on("panstart", startDraw);
	mc.on("panmove", draw);
	mc.on("panend", endDraw);
}

function onDrawEnd(){
	isStop = true
	mc.off("panstart", startDraw);
	mc.off("panmove", draw);
	mc.off("panend", endDraw);
	socket.on("getMsg", function (data) {
		var img = new Image();
		img.onload = function(){
			clear()
		    ctx.drawImage(img,0,0);
		}
		img.src = `data:image/png;base64,${data}`
	})
}

function loop(){
	return setTimeout(() => {
	  	socket.emit("send", getBuffer())
	  	if(!isStop){
	  		loop()
	  	}
	}, 500)
}

function startGame(){
	socket.emit("action", 'start')
	
}

window.loop = loop
function getBuffer(){
	var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var base64Url = canvas.toDataURL("image/png");
    let base64 = base64Url.toString()
    // console.log(base64.substring(22));
	return base64.substring(22)
}

let pos = {x:0,y:0}
let enableDraw = false

function clear(){
	ctx.clearRect(0,0,canvas.width,canvas.height);  
	ctx.save();
}


function draw(event){
	const e = event.srcEvent
	if(enableDraw){
		ctx.save();
	    ctx.beginPath();
		ctx.moveTo( pos.x, pos.y );	
		ctx.lineTo(e.offsetX, e.offsetY)

  		ctx.strokeStyle = '#663300';
        ctx.lineWidth = 10;

		ctx.stroke();
		ctx.restore();
	    ctx.closePath();
		pos = {x:e.offsetX, y:e.offsetY}


	}
}

function startDraw(event){
	const e = event.srcEvent
	enableDraw = true
	pos = {x:e.offsetX, y:e.offsetY}
}

function endDraw(event){
	const e = event.srcEvent
	enableDraw = false
}

function setTimeAlert( time ){
	if( time > 0){
		setTimeout(() => {
		  clock.innerText = time
		  time -= 1
		  setTimeAlert(time)
		}, 1000)
	}else{
		clock.innerText = ''
	}
}


