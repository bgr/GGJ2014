///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />
///<reference path="../lib/box2dweb.d.ts" />
///<reference path="citygrid.ts" />

var CANVAS_SIZE = 512;
var NUM_CITY_BLOCKS = 8;
var BUILDINGS_PER_BLOCK = 8;
var CITY_SIZE = NUM_CITY_BLOCKS * BUILDINGS_PER_BLOCK;
var SCALE = CANVAS_SIZE / CITY_SIZE;
var PLAYER_SIZE = ROAD_WIDTH / 4;
var ROAD_WIDTH = 4 / SCALE;

var loader = new createjs.LoadQueue();

loader.on("fileload", (e) => { console.log("file complete", e); });
loader.on("complete", (e) => { console.log("completed"); init(); });

for (var i=0; i<manifests.length; i++) {
    loader.loadManifest(manifests[i], loadNow=(i==manifests.length-1));
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


function init() {
    var world = new b2World(new b2Vec2(0, 0),  true);

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef();

    // create 4x4 city blocks (one block is 8x8 buildings)
    for (var block_y=0; block_y<CITY_SIZE; block_y+=BUILDINGS_PER_BLOCK) {
        for (var block_x=0; block_x<CITY_SIZE; block_x+=BUILDINGS_PER_BLOCK) {
            var buildingRects = generateBuildings(BUILDINGS_PER_BLOCK, BUILDINGS_PER_BLOCK, maxSize=3);

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

    // add player
    var playerX = CITY_SIZE / 2 + ROAD_WIDTH / 2;
    var playerY = playerX;

    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(PLAYER_SIZE / 2, PLAYER_SIZE / 2);
    bodyDef.position.x = playerX + PLAYER_SIZE / 2;
    bodyDef.position.y = playerY + PLAYER_SIZE / 2;
    world.CreateBody(bodyDef).CreateFixture(fixDef);


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
    
    var onTick = function() {
        world.Step(1 / 60, 10, 10);
        world.DrawDebugData();
        world.ClearForces();
        stage.update();
        //console.log(createjs.Ticker.getMeasuredFPS());
    }

    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", onTick);
}
