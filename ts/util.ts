function assert(condition, message="Assertion failed") {
    if(!condition) {
        throw message;
    }
}

function sum(arr) {
    return arr.reduce((a, b) =>  a + b, 0);
}

function rndelem(obj) {
    var keys = [];
    for(k in obj) {
        keys.push(k);
	}
    return obj[keys[Math.floor(Math.random() * keys.length)]];
}


// returns position of Box2D element 
// http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
    var elem=element, tagname="", x=0, y=0;

    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();

        if(tagname == "BODY")
            elem=0;

        if(typeof(elem) == "object") {
            if(typeof(elem.offsetParent) == "object")
                elem = elem.offsetParent;
        }
    }

    return {x: x, y: y};
}
