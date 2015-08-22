var http = require('http'),
    express = require('express'),
    socketIo = require('socket.io'),
    app = express(),
    crypto = require('crypto'),
    fs = require('fs'),
    crypto_key = 'sha1',
    digest_key = 'base64';
app.use(function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
var server = http.Server(app),
    io = socketIo(server);

server.listen(3000);

app.get('/', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

io.on('connection', function(socket) {
  socket.broadcast.emit("sendMessageToClient", {value:"1人入室しました。"});
  socket.on("sendMessageToServer", function(data) {
    data.hash = crypto.createHash(crypto_key).update(socket.id).digest(digest_key);
    socket.join(data.room);
    socket.emit("sendMessageToClientRoom", createClientMessage(data));
    socket.broadcast.to(data.room).emit("sendMessageToClient", createClientMessage(data));
  });
  socket.on("disconnect", function() {
    socket.broadcast.emit("sendMessageToClient", {value:"1人退室しました。"});
  });
});

function createClientMessage(data) {
  return {
      value:"[" + data.name + "]" + data.value,
      hash:data.hash,
      name:data.name,
      room:data.room
  };
}
