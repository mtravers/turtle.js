// Copyright (C) 2012-3 Michael Travers http://hyperphor.com
// Released under the MIT Open Source License
// http://www.opensource.org/licenses/mit-license.php

function Turtle (x,y) {
    this.x = x || 0;
    this.y = y || 0;
    this.theta = 0;
    this.pen = "black";
    this.stack = [];
}

Turtle.prototype.push = function () {
    this.stack.push(this.state());
}

Turtle.prototype.pop = function () {
    this.setState(this.stack.pop());
}

// pop without popping
Turtle.prototype.restore = function () {
    this.setState(this.stack[this.stack.length - 1]);
}

Turtle.prototype.state = function () {
    return [this.x, this.y, this.theta, this.pen];
}


Turtle.prototype.setState = function (from) {
    this.x = from[0];
    this.y = from[1];
    this.theta = from[2];
    this.pen = from[3];
}

Turtle.prototype.fd = function (n) {
    this.x = this.x + Math.cos(this.theta) * n;
    this.y = this.y + Math.sin(this.theta) * n;
}

Turtle.prototype.jump = function (n) {
    this.x = this.x + Math.cos(this.theta) * n;
    this.y = this.y + Math.sin(this.theta) * n;
}

Turtle.prototype.rt = function(dtheta) {
    this.theta = this.theta + dtheta * (Math.PI / 180);
}

Turtle.prototype.lt = function(dtheta) {
    this.rt(-dtheta);
}

Turtle.prototype.pd = function(color) {
    this.pen = color;
}

Turtle.prototype.pinc = function(dr, dg, db) {
    this.pen = incColor(this.pen, dr, dg, db);
}

// internal use
Turtle.prototype.jscolor = function() {
    return coerceColor(this.pen);
}

Turtle.prototype.pu = function() {
    this.pd();
}

Turtle.prototype.moveto = function(x,y) {
    this.x = x;
    this.y = y;
}

// yes this is the same as moveto.  Why is it here? See below.
Turtle.prototype.jumpto = function(x,y) {
    this.x = x;
    this.y = y;
}

Turtle.prototype.aim = function(theta) {
    this.theta = theta * (Math.PI / 180);
}

// subclassing

function DrawingTurtle() {
    Turtle.call(this);
}
// magic crap
DrawingTurtle.prototype = new Turtle();
DrawingTurtle.prototype.constructor = DrawingTurtle;

// argh, javascript doesn't have good way to call super methods!
// http://joshgertzen.com/object-oriented-super-class-method-calling-with-javascript/

DrawingTurtle.prototype.drawingLine = function(p) {
    var sx = this.x; 
    var sy = this.y;
    p.call();
    if (this.pen) {
	this.drawLine(sx,sy,this.x,this.y,pen);
    }
}

DrawingTurtle.prototype.drawLine = function(x0,y0,x1,y1,pen) {
    print("line from (" + x0 + ", " + y0 + ") to (" + x1 + ", " + y1 + ")");
}


// this works...
// DrawingTurtle.prototype.fd = function(n) {
//     this.printState();
//     Turtle.prototype.fd.call(this, n);
//     this.printState();
// }


DrawingTurtle.prototype.fd = function(n) {
    var turt = this;
    this.drawingLine(function() { Turtle.prototype.fd.call(turt, n); });
}

DrawingTurtle.prototype.moveto = function(x,y) {
    var turt = this;
    this.drawingLine(function() { Turtle.prototype.moveto.call(turt, x,y); });
}

DrawingTurtle.prototype.jumpto = function(x,y) {
    var turt = this;
    Turtle.prototype.jumpto.call(turt, x,y);
}

DrawingTurtle.prototype.printState = function () {
    print("(" + this.x + ", " + this.y + ")");
}


function CanvasTurtle(canvas) {
    DrawingTurtle.call(this);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
}

CanvasTurtle.prototype = new DrawingTurtle();
CanvasTurtle.prototype.constructor = CanvasTurtle;

CanvasTurtle.prototype.constructor = DrawingTurtle();

CanvasTurtle.prototype.drawLine = function(x0,y0,x1,y1,pen) {
    if (this.pen == "path")
	// not quite right, but assume in a path all lines are joined end-to-end
        this.context.lineTo(x1,y1);
    else {
	this.context.beginPath();
        this.context.moveTo(x0,y0);
        this.context.lineTo(x1,y1);
	this.context.strokeStyle = this.jscolor();
	this.context.stroke();
    }
}

// this is not going to work for multiple turtles
CanvasTurtle.prototype.pd = function(color) {
    DrawingTurtle.prototype.pd.call(this, color);
    if (color) {
      var ctx = this.context;
      ctx.fillStyle = this.jscolor();
    }
}

CanvasTurtle.prototype.circle = function(r) {
    var ctx = this.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI*2, true); 
    ctx.strokeStyle = this.jscolor();
    ctx.closePath();
    ctx.fill();
}


CanvasTurtle.prototype.filling = function(ink, alpha, proc) {
    var ctx = this.context;
    ctx.fillStyle = coerceColor(ink); // shouldn't this use color state?
    ctx.globalAlpha = alpha;	// should save/restore argh
    ctx.beginPath();
    var savedPen = this.pen;
    this.pen = "path";
    proc();
    ctx.closePath();
    ctx.fill();
    this.pen = savedPen;
}

// SVG Turtle (experimental)

function SVGTurtle(svg) {
    DrawingTurtle.call(this);
    this.svg = svg;
}

SVGTurtle.prototype = new DrawingTurtle();
SVGTurtle.prototype.constructor = SVGTurtle;

SVGTurtle.prototype.constructor = DrawingTurtle();

var svgns = "http://www.w3.org/2000/svg";

SVGTurtle.prototype.drawLine = function(x0,y0,x1,y1,pen) {
    if (this.pen == "path") {
	// not quite right, but assume in a path all lines are joined end-to-end
        this.context.lineTo(x1,y1);
    }
    else {
	var line = document.createElementNS(svgns, "line");
	line.x1.baseVal.value = x0;
	line.y1.baseVal.value = y0;
	line.x2.baseVal.value = x1;
	line.y2.baseVal.value = y1;
	line.setAttributeNS(null,"stroke",pen);
	svg.insertBefore(line, svg.firstChild);
    }
}


/* 
SVGTurtle.prototype.circle = function(r) {
    var ctx = this.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI*2, true); 
    ctx.strokeStyle = this.pen;
    ctx.closePath();
    ctx.fill();
}


SVGTurtle.prototype.filling = function(ink, alpha, proc) {
    var ctx = this.context;
    ctx.fillStyle = ink;
    ctx.globalAlpha = alpha;	// should save/restore argh
    ctx.beginPath();
    var savedPen = this.pen;
    this.pen = "path";
    proc();
    ctx.closePath();
    ctx.fill();
    this.pen = savedPen;
}
*/

// utils
function random(i) {
    return Math.floor(i * Math.random());
}

function d2r(d) {
    return d * (Math.PI / 180);
}
function adjust() {
    // document.width works in Chrome, but not Firefox
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight - 30;
}
function clear() {
  var ctx =  canvas.getContext('2d');
  // note: will be wrong if transformations are in effect
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

// Color manipulation.

function randomColor() {
    return random(0xffffff);
}

function coerceColor(c) {
  if (typeof(c)  == "number") {
      return "#" + c.toString(16);
  } else {
      return c;
  }
}

function incColor(color, dr, dg, db) {
    return color + db + dg * 16 + dr * 256;
}
