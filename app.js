const CRYPTO_KEY = 'sha1',
      DIGEST_KEY = 'base64',
      HTTP = require('http'),
      SOCKET_IO = require('socket.io'),
      CRYPTO = require('crypto'),
      LOGGER = require('log4js').getLogger('request'),
      SETTINGS = require('./settings'),
      PORT = process.env.PORT || SETTINGS.port;

var express = require('express'),
    session = require('express-session'),
    app = express(),
    basicAuth = require('basic-auth-connect');

app.use((req,res,next) => {
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
app.use(basicAuth(SETTINGS.id, SETTINGS.pass));
var server = HTTP.Server(app),
    io = SOCKET_IO.listen(server);

LOGGER.setLevel('INFO');

server.listen(PORT, function() {
  LOGGER.info(`server listening on port ${this.address().port} in ${app.settings.env} mode`);
});

app.get('/', (req,res) => res.sendFile(__dirname + '/index.html'));
app.use(express.static('public'));

LOGGER.info(
  '\n\n               [ WelCome ]' +
  '\n ------------------------------------------\n' +
  '   =====\\\\ \n' +
  ' //                                 |   ||\n' +
  '||        ===   ===  === |===  === ===  ||\n' +
  ' \\\\      |   | |   ||   ||=== |     |   ||\n' +
  '   ====== ===  |   ||   ||===  ===  |   ..\n\n' +
  '                                by POLLSEED' +
  '\n -------------------------------------------\n'
);

io.on('connection', socket => {
  LOGGER.info(socket.handshake.headers);
  socket.on("sendMessageToServer", data => {
    var rooms_session = socket.adapter.rooms,
        arr = new Array(),
        id,
        json;

    // 部屋が変わったら退出処理
    if (data.b_room != data.room) socket.leave(data.b_room);

    data.hash = CRYPTO.createHash(CRYPTO_KEY).update(socket.id).digest(DIGEST_KEY);

    // 部屋にあるセッションIDを格納
    for (id in rooms_session[data.room]) arr.push(id);
    json = createClientMessage(data, arr.indexOf(socket.id) < 0);
    LOGGER.info(json);

    socket.join(data.room);
    socket.emit("sendMyMsg", json);
    socket.to(data.room).emit("sendRoomMsg", json);
  });
  socket.on("disconnect", () => {});
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
