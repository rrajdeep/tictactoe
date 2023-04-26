
var socket = io();

var myTurn = true;
var symbol;

// match string
const matches = ['XXX', 'OOO'];

// socket.emit('start', {message: "This is a message"});

const buttons = document.getElementsByClassName("cell");

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', makeMove);
}

// socket.on("button.click", function(symbol) {
//     buttons[8].innerHTML = symbol.symbol;
// })

// show turn message
function showTurnMessage() {
    if (!myTurn) {
        document.getElementById('info').innerText = "Your opponent\'s turn";
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute("disabled", "true");
        }
    } else {
        document.getElementById('info').innerText = "Your turn";
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
    }
}

socket.on("game.begin", function (data) {
    console.log(data);
    document.getElementById('symbol').innerText = data.symbol;
    // assign symbol
    symbol = data.symbol;
    // assign turn to symbol 'X'
    myTurn = (data.symbol === 'X');
    console.log(myTurn);
    showTurnMessage();
})



// get board stats
function getBoardStat() {
    let obj = {};
    for (let i = 0; i < buttons.length; i++) {
        obj[buttons[i].id] = buttons[i].innerText || "";
    }
    return obj;
}

// Check if game is over or not?
function isGameOver() {
    var gameState = getBoardStat();
    console.log(gameState);

    const rows = [
        gameState.a0 + gameState.a1 + gameState.a2,
        gameState.b0 + gameState.b1 + gameState.b2,
        gameState.c0 + gameState.c1 + gameState.c2,
        gameState.a0 + gameState.b0 + gameState.c0,
        gameState.a1 + gameState.b1 + gameState.c1,
        gameState.a2 + gameState.b2 + gameState.c2,
        gameState.a0 + gameState.b1 + gameState.c2,
        gameState.a2 + gameState.b1 + gameState.c0
    ];

    for (let i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }
    return false;
}

function makeMove(e) {
    e.preventDefault();
    // check if turn is false
    if(!myTurn) {
        return;
    }

    // if already checked
    if (e.target.innerText.length) {
        return;
    };

    for(let i = 0; i < buttons.length; i++) {
        buttons[i].removeAttribute('disabled');
    }
    // console.log(e.target.id);
    socket.emit("make.move", {
        symbol: symbol,
        button: e.target.id
    })
}

// if either player makes a move
socket.on("move.made", function(data){
    console.log((data));
    // show symbol on button face
    document.getElementById(data.button).removeAttribute('disabled');
    document.getElementById(data.button).innerText = data.symbol;

    // toggle turn
    myTurn = (data.symbol !== symbol);

    // check if game is over
    if(!isGameOver()) {
        return showTurnMessage();
    }

    if(myTurn) {
        document.getElementById('info').innerText = 'Game Over!!! You Lost :(';
    } else {
        document.getElementById('info').innerHTML = 'Game over !!! You won :)';
    }

    // disable whole board
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("disabled", true);
    }

});