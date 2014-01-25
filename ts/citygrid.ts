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

function generateBuildings(width, height) {
    var grid = emptyGrid(width, height);
    var rects = [];
    for(var y=0; y<grid.length-1; y++) {
        var row = grid[y];
        for(var x=0; x<row.length-1; x++) {
            if(row[x] == 0) {
                // find maxWidth so we don't overlap existing tall building
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

function drawBuildings(rects, scale=40, roadWidth=10) {
    var shape = new createjs.Shape();
    shape.graphics.beginStroke("#0000ff");
    for(var i=0; i<rects.length; i++) {
        var rect = rects[i];
        shape.graphics.drawRect(rect.x * scale + roadWidth/2, rect.y * scale + roadWidth/2, 
                                rect.width * scale - roadWidth, rect.height * scale - roadWidth);
    }
    return shape;
}
