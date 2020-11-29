
import Hammer from 'hammerjs'
import io from 'socket.io-client';


const canvas = document.getElementById('draw-board')


var ctx=canvas.getContext("2d");




var mc = new Hammer.Manager(canvas);

mc.add( new Hammer.Pan({}) );
mc.add( new Hammer.Tap({}) );

mc.on("panstart", startDraw);
mc.on("panmove", draw);
mc.on("panend", draw);

let pos = {x:0,y:0}
let enableDraw = false

window.onload = function(){
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

function draw(event){
	const e = event.srcEvent
	if(enableDraw){
		ctx.save();

		ctx.moveTo( pos.x, pos.y );	
		ctx.lineTo(e.offsetX, e.offsetY)

  		ctx.strokeStyle = '#663300';
        ctx.lineWidth = 10;

		ctx.stroke();
		ctx.restore();
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


const socket = io('ws://localhost:8888/test');

socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});


socket.emit('chat message','123');