var http = require('http'),
    express = require('express'),
    socketIo = require('socket.io'),
    app = express(),
    crypto = require('crypto'),
    fs = require('fs');
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

io.on('connection', function(socket) {
  socket.broadcast.emit("sendMessageToClient", {value:"1人入室しました。"});
  socket.on("sendMessageToServer", function(data) {
    var hash = crypto.createHash('sha1').update(socket.id).digest('base64');
    socket.join(data.room);
    socket.emit("sendMessageToClientRoom", {
      value:"[" + data.name + "]" + data.value,
      hash:hash,
      name:data.name,
      room:data.room
      });
    socket.broadcast.to(data.room).emit("sendMessageToClient", {
      value:"[" + data.name + "]" + data.value,
      hash:hash,
      name:data.name,
      room:data.room
    });
  });
  socket.on("disconnect", function() {
    socket.broadcast.emit("sendMessageToClient", {value:"1人退室しました。"});
  });
});
