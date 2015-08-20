var http = require('http'),
    express = require('express'),
    socketIo = require('socket.io'),
    app = express();
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
    socket.join(data.room);
    socket.emit("sendMessageToClientRoom", {value:data.room + "に入室中"});
    // socket.emit("sendMessageToClient", {name:data.name, value:data.value});
    socket.broadcast.to(data.room).emit("sendMessageToClient", {
      value:"[" + data.name + "]" + data.value,room:data.room
    });
  });
  socket.on("disconnect", function() {
    socket.broadcast.emit("sendMessageToClient", {value:"1人退室しました。"});
  });
});
