///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />
///<reference path="../lib/box2dweb.d.ts" />
///<reference path="citygrid.ts" />
///<reference path="riddles.ts" />

var CANVAS_SIZE_PX = 512;
var NUM_CITY_BLOCKS = 8;
var BUILDINGS_PER_BLOCK = 8;
var CITY_SIZE = NUM_CITY_BLOCKS * BUILDINGS_PER_BLOCK;
var SCALE = CANVAS_SIZE_PX / CITY_SIZE;
var PLAYER_SIZE = ROAD_WIDTH / 4;
var ROAD_WIDTH = 3 / SCALE;
var CITY_BLOCK_SIZE_PX = CANVAS_SIZE_PX / NUM_CITY_BLOCKS;
var BUILDING_UNIT_PX = 16;
var ZOOM_DURATION = 450;
var ZOOM_WAIT = 200;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var world;
var fixDef;
var bodyDef;
var stage;
var container;
var playerPosition;


var loader = new createjs.LoadQueue();

loader.on("fileload", (e) => { console.log("file complete", e); });
loader.on("complete", (e) => { console.log("completed"); init(); });

for (k in manifests) {
    loader.loadManifest(manifests[k]);
}

import b2Common = Box2D.Common;
import b2Math = Box2D.Common.Math;
import b2Collision = Box2D.Collision;
import b2Shapes = Box2D.Collision.Shapes;
import b2Dynamics = Box2D.Dynamics;
import b2Contacts = Box2D.Dynamics.Contacts;
import b2Controllers = Box2D.Dynamics.Controllers;
import b2Joints = Box2D.Dynamics.Joints;
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2AABB = Box2D.Collision.b2AABB;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;


class CityBlock {
    small: createjs.Shape;
    big: createjs.Shape;
    rects: Array;
    constructor(public x: number, public y: number, public colorFilter: createjs.ColorFilter) {
        this.rects = generateBuildings(BUILDINGS_PER_BLOCK, BUILDINGS_PER_BLOCK, maxSize=3);

        // render small
        this.small = new createjs.Shape();
        this.small.snapToPixel = true;
        this.small.graphics.beginFill("#3e3e3e").setStrokeStyle(0);
        this.small.graphics.drawRect(0, 0, CITY_BLOCK_SIZE_PX, CITY_BLOCK_SIZE_PX);
        this.small.graphics.beginFill("#6e6763");
        for(var i=0; i < this.rects.length; i++) {
            var rect = this.rects[i];
            var rx = rect.x + ROAD_WIDTH / 2;
            var ry = rect.y + ROAD_WIDTH / 2;
            var rw = rect.width - ROAD_WIDTH;
            var rh = rect.height - ROAD_WIDTH;
            this.small.graphics.drawRect(rx * SCALE, ry * SCALE, rw * SCALE + 1, rh * SCALE + 1);
        }
        this.small.filters = [colorFilter];
        this.small.cache(0, 0, CITY_BLOCK_SIZE_PX, CITY_BLOCK_SIZE_PX);

        // render big
        this.big = new createjs.Shape();
        this.big.graphics.beginFill("#3e3e3e").setStrokeStyle(0);
        var mx = new createjs.Matrix2D();
        this.big.graphics.drawRect(0, 0, 
                BUILDINGS_PER_BLOCK * BUILDING_UNIT_PX, BUILDINGS_PER_BLOCK * BUILDING_UNIT_PX);
        for(var i=0; i < this.rects.length; i++) {
            var rect = this.rects[i];
            var rx = rect.x * BUILDING_UNIT_PX;
            var ry = rect.y * BUILDING_UNIT_PX;
            var key = "b" + rect.width + "" + rect.height;
            var img = loader.getResult(rndelem(manifests[key]).src);
            mx.translate(rx, ry);
            this.big.graphics.beginBitmapFill(img, "no-repeat", mx);
            this.big.graphics.drawRect(rx, ry, 
                                       rect.width * BUILDING_UNIT_PX, 
                                       rect.height * BUILDING_UNIT_PX);
            mx.translate(-rx, -ry);
        }
        this.big.filters = [colorFilter];
        this.big.cache(0, 0, 
                BUILDINGS_PER_BLOCK * BUILDING_UNIT_PX, BUILDINGS_PER_BLOCK * BUILDING_UNIT_PX);
    }

    enableBig(world: b2World) {
        // destroy all existing bodies
        var b = world.GetBodyList();
        while (b) {
            var tb = b;
            b = b.GetNext();
            world.DestroyBody(tb);
        }
        // create bodies for buildings
        bodyDef.type = b2Body.b2_staticBody;
        for(var i=0; i < this.rects.length; i++) {
            var rect = this.rects[i];
            fixDef.shape = new b2PolygonShape();
            var boxHalfWidth = (rect.width - ROAD_WIDTH) / 2;
            var boxHalfHeight = (rect.height - ROAD_WIDTH) / 2;
            fixDef.shape.SetAsBox(boxHalfWidth, boxHalfHeight);
            var boxX = block_x + rect.x + ROAD_WIDTH / 2 + boxHalfWidth;
            var boxY = block_y + rect.y + ROAD_WIDTH / 2 + boxHalfHeight;
            bodyDef.position.Set(boxX, boxY);
            world.CreateBody(bodyDef).CreateFixture(fixDef);
        }
    }

    disableBig(world: b2World) {

    }
}

var STATE_SMALL = 1, STATE_IN_TRANSITION = 2, STATE_BIG = 3, STATE_RIDDLE = 4;
var zoomState = STATE_SMALL;
function showBig(block) {
    if (zoomState != STATE_SMALL) return;
    zoomState = STATE_IN_TRANSITION;
    container.addChild(block.big);
    block.big.alpha = 1;
    block.big.x = block.x;
    block.big.y = block.y;
    block.big.scaleX = block.big.scaleY = 0.5;
    //createjs.Tween.get(block.big).to({ alpha:1 }, ZOOM_DURATION);
    var onCompleted = function() {
        zoomState = STATE_BIG;
    }
    var targetX = -CANVAS_SIZE_PX * 8 * block.x / CANVAS_SIZE_PX;
    var targetY = -CANVAS_SIZE_PX * 8 * block.y / CANVAS_SIZE_PX;
    createjs.Tween.get(container).wait(ZOOM_WAIT).to(
        { scaleX: 8, scaleY: 8, x: targetX, y: targetY }, 
        ZOOM_DURATION, createjs.Ease.bounceOut).call(onCompleted);
}

function hideBig(block) {
    if (zoomState != STATE_BIG) return;
    zoomState = STATE_IN_TRANSITION;
    var onCompleted = function() {
        zoomState = STATE_SMALL;
        block.big.alpha = 1;
        container.removeChild(block.big);
    }
    createjs.Tween.get(container).to(
        { scaleX: 1, scaleY: 1, x: 0, y: 0 }, 
        ZOOM_DURATION, createjs.Ease.bounceOut);
    createjs.Tween.get(block.big).to( { alpha:0 }, ZOOM_DURATION).call(onCompleted);
}


var tint = new createjs.ColorFilter(1.4, 1.5, 1.3, 1);
function highlightOn(block) {
    if(block.small.filters.length == 1)
        block.small.filters.push(tint);
    block.small.updateCache();
}

function highlightOff(block) {
    if(block.small.filters.length == 2)
        block.small.filters.pop();
    block.small.updateCache();
}


var blocks = [];
var colorFilters = [
    new createjs.ColorFilter(1, 1, .5),
    new createjs.ColorFilter(1, .5, 1),
    new createjs.ColorFilter(.5, 1, 1),
];

function init() {
    world = new b2World(new b2Vec2(0, 0),  true);
    fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    bodyDef = new b2BodyDef();
    stage = new createjs.Stage("game");
    stage.snapToPixel = true;
    stage.snapToPixelEnabled = true;
    stage.enableMouseOver(30);
    var context = stage.canvas.getContext("2d");
    if(context.imageSmoothingEnabled) {context.imageSmoothingEnabled = false;}
    if(context.webkitImageSmoothingEnabled) {context.webkitImageSmoothingEnabled = false;}
    if(context.mozImageSmoothingEnabled) {context.mozImageSmoothingEnabled = false;}

    container = new createjs.Container();
    for (var block_y=0; block_y<NUM_CITY_BLOCKS; block_y++) {
        var blockRow = [];
        for (var block_x=0; block_x<NUM_CITY_BLOCKS; block_x++) {
            var block = new CityBlock(block_x * CITY_BLOCK_SIZE_PX, 
                                      block_y * CITY_BLOCK_SIZE_PX, 
                                      rndelem(colorFilters));
            blockRow.push(block);
            container.addChild(block.small);
            block.small.x = block.x;
            block.small.y = block.y;
        }
        blocks.push(blockRow);
    }
    stage.addChild(container);

    playerPosition = new createjs.Point(Math.floor(Math.random() * NUM_CITY_BLOCKS),
                                        Math.floor(Math.random() * NUM_CITY_BLOCKS));
    highlightOn(blocks[playerPosition.y][playerPosition.x]);

    var movePlayer = function(down, right) {
        var nx = playerPosition.x + right;
        var ny = playerPosition.y + down;
        if(zoomState != STATE_SMALL || nx < 0 || nx > 7 ||  ny < 0 || ny > 7) return;
        var curBlock = blocks[playerPosition.y][playerPosition.x];
        var newBlock = blocks[ny][nx];
        playerPosition.x = nx;
        playerPosition.y = ny;
        highlightOff(curBlock);
        highlightOn(newBlock);

        var riddleRight = function() {
            console.log("YOU WERE RIGHT");
            zoomState = STATE_SMALL;
        }
        var riddleWrong = function() {
            console.log("YOU WERE WRONG");
            zoomState = STATE_SMALL;
            showBig(newBlock);
        }

        if(curBlock.colorFilter == newBlock.colorFilter) {
            console.log("FRIENDLY");
            askRiddle(riddleRight, riddleWrong);
            zoomState = STATE_RIDDLE;
        }
        else {
            console.log("ENEMY");
            showBig(newBlock);
        }
    };

    $(window).keydown(function(e) {
        switch(e.keyCode) {
            case KEY_UP:
                console.log('up', e.keyCode);
                movePlayer(-1, 0);
                break;
            case KEY_DOWN:
                console.log('down', e.keyCode);
                movePlayer(1, 0);
                break;
            case KEY_LEFT:
                console.log('left', e.keyCode);
                movePlayer(0, -1);
                break;
            case KEY_RIGHT:
                console.log('right', e.keyCode);
                movePlayer(0, 1);
                break;
        }
    });
    //block.small.on("mouseover", closure(highlightOn, block));
    //block.small.on("mouseout", closure(highlightOff, block));


    var onTick = function() {
        stage.update();
        //console.log(createjs.Ticker.getMeasuredFPS());
    }

    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", onTick);
}
