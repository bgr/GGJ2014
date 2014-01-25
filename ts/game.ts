///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />

console.log(sum([2, 3, 94]));

var stage = new createjs.Stage("game");

//var assetManifest = [
  //{ src:'assets/boid.png', id:'boid' },
//];

var TileSize = 128;
for(var y=0; y<8; y++) {
    for(var x=0; x<8; x++) {
        var tile = drawBuildings(generateBuildings(8, 8, 3),
                                 scale=16, roadWidth=4);
        stage.addChild(tile);
        tile.x = x * TileSize;
        tile.y = y * TileSize;
    }
}

//var loader = new createjs.LoadQueue();

//loader.on("fileload", (e) => { console.log("file complete", e); });
//loader.on("complete", (e) => { console.log("completed"); run(); });

//loader.loadManifest(assetManifest);


//function run() {
    //var img = loader.getResult("boid");
    ////createjs.Ticker.setFPS(60);
    ////createjs.Ticker.on("tick", onTick);
//}

stage.update();
