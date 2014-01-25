///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />
///<reference path="../lib/box2dweb.d.ts" />

var TILE_SIZE = 128;
var SCALE = 16;
var ROAD_WIDTH = 4 / SCALE;

//var assetManifest = [
  //{ src:'assets/boid.png', id:'boid' },
//];


//var loader = new createjs.LoadQueue();

//loader.on("fileload", (e) => { console.log("file complete", e); });
//loader.on("complete", (e) => { console.log("completed"); run(); });

//loader.loadManifest(assetManifest);

//function run() {
    //var img = loader.getResult("boid");
    //createjs.Ticker.setFPS(60);
    //createjs.Ticker.on("tick", onTick);
//}


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


var world = new b2World(new b2Vec2(0, 0),  true);

var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;

var bodyDef = new b2BodyDef;

// create 4x4 city blocks (one block is 8x8 buildings)
for (var block_y=0; block_y<4*8; block_y+=8) {
    for (var block_x=0; block_x<4*8; block_x+=8) {
        var buildingRects = generateBuildings(8, 8, 3);

        // render all buildings within city block
        for(var i=0; i<buildingRects.length; i++) {
            var rect = buildingRects[i];
            bodyDef.type = b2Body.b2_staticBody;
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
}


//create some objects

//bodyDef.type = b2Body.b2_dynamicBody;
//for(var i = 0; i < 10; ++i) {
    //if(Math.random() > 0.5) {
        //fixDef.shape = new b2PolygonShape;
        //fixDef.shape.SetAsBox(Math.random() + 0.1,  Math.random() + 0.1);
    //} else {
        //fixDef.shape = new b2CircleShape(Math.random() + 0.1);
    //}
    //bodyDef.position.x = Math.random() * 10;
    //bodyDef.position.y = Math.random() * 10;
    //world.CreateBody(bodyDef).CreateFixture(fixDef);
//}

var stage = new createjs.Stage("game");
var debugDrawSprite = new createjs.Container();
stage.addChild(debugDrawSprite);

//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetRGBByHexStrokeColor("#FF0000");
debugDraw.SetSprite(debugDrawSprite);
debugDraw.SetDrawScale(SCALE);
debugDraw.SetFillAlpha(0.5);
debugDraw.SetStrokeThickness(0.5);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

function onTick() {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
    stage.update();
}
//onTick();
createjs.Ticker.setFPS(60);
createjs.Ticker.on("tick", onTick);
