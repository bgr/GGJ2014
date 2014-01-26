var Rect = createjs.Rectangle;


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

function generateBuildings(width, height, maxSize=3) {
    var grid = emptyGrid(width, height);
    var rects = [];
    for(var y=0; y<grid.length; y++) {
        var row = grid[y];
        for(var x=0; x<row.length; x++) {
            if(row[x] == 0) {
                // find maxWidth so we don't overlap existing tall building
                for(var curMaxWidth=1
                    ; 
                    row[x+curMaxWidth] == 0 && 
                    x+curMaxWidth < row.length-2 && 
                    curMaxWidth < maxSize
                    ;
                    curMaxWidth++);
                var rectWidth = 1 + Math.floor(Math.random() * curMaxWidth);
                var rectHeight = 1 + Math.floor(Math.random() * Math.min(maxSize, grid.length-y-1));
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

function findPoints(rects) {
    var tops = [];
    var lefts = [];
    var bottoms = [];
    var rights = [];
    for(var i=0; i<rects.length; i++) {
        var r = rects[i];
        if(r.y == 0)
            tops.push(new createjs.Point(r.x == 0 ? r.width : r.x, 0));
        if(r.y + r.height == 8)
            bottoms.push(new createjs.Point(r.x == 0 ? r.width : r.x, 8));
        if(r.x == 0)
            lefts.push(new createjs.Point(0, r.y == 0 ? r.height : r.y));
        if(r.x + r.width == 8)
            rights.push(new createjs.Point(8, r.y == 0 ? r.height : r.y));
    }
    return { top: rndelem(tops), left: rndelem(lefts), 
             bottom: rndelem(bottoms), right: rndelem(rights) };
}
