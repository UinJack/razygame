
import Hammer from 'hammerjs'
import io from 'socket.io-client';


const canvas = document.getElementById('draw-board')
const drawBtn = document.getElementById('draw-btn')
const clearBtn = document.getElementById('clear-btn')
drawBtn.onclick = function(){
	console.log('aaaa')
	loop()
}
clearBtn.onclick = function(){
	clear()
}

window.onload = function(){
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

var ctx=canvas.getContext("2d");

var socket = io("ws://192.168.7.18:3000/"); //初始化websocket，连接服务端

socket.on('word', (data)=>{
	alert(data)
})

const type = getQueryVariable('type') 
if(type === 'draw'){
	var mc = new Hammer.Manager(canvas);

	mc.add( new Hammer.Pan({}) );
	mc.add( new Hammer.Tap({}) );

	mc.on("panstart", startDraw);
	mc.on("panmove", draw);
	mc.on("panend", endDraw);

}else if(type === 'view'){
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
		// console.log(getBuffer())
	  	socket.emit("send", getBuffer())
	  	loop()
	}, 500)
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

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}



