///<reference path="../lib/jquery.d.ts" />

function getAdd() {
    var op1 = Math.round(Math.random() * 200);
    var op2 = Math.round(Math.random() * 200);
    return { op1: op1, op2: op2, answer: op1 + op2, sign: '+' };
}

function getSubtract() {
    var op1 = Math.round(Math.random() * 200);
    var op2 = Math.round(Math.random() * 200);
    if(op1 < op2) {
        var tmp = op1;
        op1 = op2;
        op2 = tmp;
    }
    return { op1: op1, op2: op2, answer: op1 - op2, sign: '-' };
}

function getMultiply() {
    var op1 = Math.round(Math.random() * 20 + 1);
    var op2 = Math.round(Math.random() * 20 + 1);
    return { op1: op1, op2: op2, answer: op1 * op2, sign: '*' };
}

function getDivide() {
    var answer = Math.round(Math.random() * 20 + 1);
    var op2 = Math.round(Math.random() * 20 + 1);
    return { op1: answer * op2, op2: op2, answer: answer, sign: '/' };
}

var riddles = [getAdd, getSubtract, getMultiply, getDivide];

var curRiddle, curOnRight, curOnWrong;
var input = $('#riddleInput')
var riddleDiv = $('#riddle');
input.keyup(function(e) {
    if (e.keyCode == 13 && input.val() != "") {
        if(input.val() == curRiddle.answer) {
            curOnRight();
        }
        else {
            console.log("wrong, " + curRiddle.op1 + " " + curRiddle.sign + " " 
                + curRiddle.op2 + " = " + curRiddle.answer);
            curOnWrong();
        }
        input.val("");
        riddleDiv.hide();
    }
});

function askRiddle(onRight, onWrong) {
    riddleDiv.show();
    var riddle = rndelem(riddles)();
    var span = $('#riddleQuestion').html(
            "Prove that you're one of them, answer the secret question:<br/>" +
            riddle.op1 + " " + riddle.sign + " " + riddle.op2 + " = ");
    curRiddle = riddle;
    curOnRight = onRight;
    curOnWrong = onWrong;
    input.focus();
}
