// var http = require('http'),
//     socketIo = require('socket.io'),
//     express = require('express'),
//     app = express(),
//     server = http.createServer(app);
//
// app.get('/', function(req, res) {
//   res.send('Hello, world');
// });
//
// app.listen(3000);
// console.log(server);

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
  socket.broadcast.emit("sendMessageToClient", {value: "1人入室しました。"});
  socket.on("sendMessageToServer", function(data) {
    // 自分に表示する
    socket.emit("sendMessageToClient", {value:data.value});
    // 部屋の人全員に表示する
    socket.broadcast.emit("sendMessageToClient", {value:data.value});
  });
  socket.on("disconnect", function() {
    socket.broadcast.emit("sendMessageToClient", {value: "1人退室しました。"});
  });
});
