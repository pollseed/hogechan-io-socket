var http = require('http'),
    express = require('express'),
    socketIo = require('socket.io'),
    session = require('express-session'),
    app = express(),
    crypto = require('crypto'),
    fs = require('fs'),
    log4js = require('log4js'),
    logger = log4js.getLogger('request'),
    crypto_key = 'sha1',
    digest_key = 'base64';
app.use(function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
var server = http.Server(app),
    io = socketIo(server);

logger.setLevel('INFO');

server.listen(3000);

app.get('/', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

logger.info('welcome to room.');

io.on('connection', function(socket) {
  socket.on("sendMessageToServer", function(data) {
    var rooms_session = socket.adapter.rooms,
        arr = new Array(),
        id,
        json;

    // 部屋が変わったら退出処理
    if (data.b_room != data.room) {
      socket.leave(data.b_room);
    }

    data.hash = crypto.createHash(crypto_key).update(socket.id).digest(digest_key);

    // 部屋にあるセッションIDを格納
    for (id in rooms_session[data.room]) {
      arr.push(id);
    }
    json = createClientMessage(data, arr.indexOf(socket.id) < 0);
    logger.info(json);

    socket.join(data.room);
    socket.emit("sendMyMsg", json);
    socket.to(data.room).emit("sendRoomMsg", json);
  });
  socket.on("disconnect", function() {
  });
});

/**
 * クライアント用のデータを格納する.
 */
function createClientMessage(data, isNew) {
  return {
      hash:data.hash,
      value:data.value,
      name:data.name,
      room:data.room,
      isNewJoin:isNew  // 部屋に新規で来たかどうか
  };
}
