///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />

var Rect = createjs.Rectangle;


var assetManifest = [
  { src:'assets/boid.png', id:'boid' },
];

var stage = new createjs.Stage("game");
var loader = new createjs.LoadQueue();

loader.on("fileload", (e) => { console.log("file complete", e); });
loader.on("complete", (e) => { console.log("completed"); run(); });

loader.loadManifest(assetManifest);


function run() {
    var img = loader.getResult("boid");
    //createjs.Ticker.setFPS(60);
    //createjs.Ticker.on("tick", onTick);
}

function assert(condition, message="Assertion failed") {
    if(!condition) {
        throw message;
    }
}

function sum(arr) {
    return arr.reduce((a, b) =>  a + b, 0);
}


var edges = [
    [1, 1, 1, 1],
    [1, 2, 1],
    [1, 1, 2],
    [1, 3],
    [2, 1, 1],
    [2, 2],
    [3, 1],
];

function emptyGrid(width, height) {
    var grid = [];
    for(var y=0; y<height; y++) {
        var row = [];
        for(var x=0; x<width; x++) {
            row.push(0);
        }
        grid.push(row);
    }
    return grid;
}


function generateBuildings(width, height) {
    var grid = emptyGrid(width, height);
    var rects = [];
    for(var y=0; y<grid.length-1; y++) {
        var row = grid[y];
        for(var x=0; x<row.length-1; x++) {
            if(row[x] == 0) {
                for(var maxWidth=1; 
                    (row[x+maxWidth] == 0) && ((x+maxWidth) < (row.length-1));
                    maxWidth++);
                var rectWidth = 1 + Math.floor(Math.random() * maxWidth);
                var rectHeight = 1 + Math.floor(Math.random() * (grid.length - y - 2));
                rects.push(new Rect(x, y, rectWidth, rectHeight));
                for(var oy=y; oy<y+rectHeight; oy++) {
                    for(var ox=x; ox<x+rectWidth; ox++) {
                        grid[oy][ox] = 1;
                    }
                }
            }
        }
    }
    return rects;
}

function rndelem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


var colors = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
];


function drawBuildings(rects, scale=40, roadWidth=10) {
    var shape = new createjs.Shape();
    for(var i=0; i<rects.length; i++) {
        var rect = rects[i];
        shape.graphics.beginStroke(rndelem(colors));
        shape.graphics.drawRect(rect.x * scale + roadWidth/2, rect.y * scale + roadWidth/2, 
                                rect.width * scale - roadWidth, rect.height * scale - roadWidth);
    }
    return shape;
}

var b = drawBuildings(generateBuildings(10, 8));
stage.addChild(b);

stage.update();
