const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
const io = require('socket.io')(server);

app.get("/", function(req,res) {
    res.sendFile(__dirname + '/index.html');
})

server.listen(3000, function() {
    console.log("Server is running on port 3000");
});

// Player object
var players = {}, unmatched;
function joinGame(socket) {
    players[socket.id] = {
        // initially symbol X
        playerSymbol: 'X',
        // initially opponent is unmatched
        opponent: unmatched,
        socket: socket
    }

    // if unmatched has previous socket.id
    if(unmatched) {
        players[socket.id].playerSymbol = "O";
        // since unmatched holds the previous id so we can set the opponent of previous player
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else {
        unmatched = socket.id;
    }
}

function getOpponent(socket) {
    if(!players[socket.id].opponent) {
        // console.log("Inside if of getopponent")
        return;
    } else {
        // console.log("Inside else of getOpponent")
        console.log(players[players[socket.id].opponent].socket.id);
        return players[players[socket.id].opponent].socket;
    }
}

io.on("connection", function(socket) {
    // console.log('User connected ', socket.id);
    joinGame(socket);
    // console.log(players);

    // if socket has an opponent
    if(getOpponent(socket)) {
        socket.emit("game.begin", {symbol: players[socket.id].playerSymbol});
        getOpponent(socket).emit("game.begin", {symbol: players[getOpponent(socket).id].playerSymbol});
    }

    // socket.emit('button.click', {symbol: 'O'});

    socket.on("make.move", function(data) {
        console.log(data);
        socket.emit('move.made', data);
        getOpponent(socket).emit('move.made', data);
    })

    socket.on("disconnect", function() {
        console.log("User disconnected");
    })
})
