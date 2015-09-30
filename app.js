const CRYPTO_KEY = 'sha1',
      DIGEST_KEY = 'base64',
      HTTP = require('http'),
      SOCKET_IO = require('socket.io'),
      CRYPTO = require('crypto'),
      LOGGER = require('log4js').getLogger('request'),
      SETTINGS = require('./settings'),
      PORT = process.env.PORT || SETTINGS.port,
      REQUEST = require('request'),
      UTIL = require('util'),
      FS = require('fs'),
      // OUTFILE = FS.createWriteStream('test.html'),
      OUTFILE = 'test.html',
      TECH_VALUES = ["1","2"],
      REQUEST_URLS = [
        "",
        "https://github.com/search?utf8=%E2%9C%93&q=%s&type=Issues&ref=searchresults",
        "http://stackoverflow.com/search?q=%s",
        // google: "https://www.google.co.jp/#q=%s" // -> cURLで使えないため
      ];

var options = {
        uri: 'http://sakazaki-locust.tumblr.com/',
        form: {},
        json: true
      };

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
var server = HTTP.Server(app),
    io = SOCKET_IO.listen(server);

LOGGER.setLevel('INFO');

server.listen(PORT, () => {
  LOGGER.info(`server listening on port ${server.address().port} in ${app.settings.env} mode`);
});

app.get('/', (req,res) => res.sendFile(__dirname + '/index.html'));
app.use(express.static('public'));

LOGGER.info(
  `\n\n               [ WelCome ]
 ------------------------------------------
     =====\\\\
   //                                 |   ||
  ||        ===   ===  === |===  === ===  ||
   \\\\      |   | |   ||   ||=== |     |   ||
     ====== ===  |   ||   ||===  ===  |   ..
                                  by POLLSEED
 -------------------------------------------\n`
);

io.on('connection', socket => {
  LOGGER.info(socket.handshake.headers);
  socket.on("sendMessageToServer", data => {
    var message = data.msg,
        tech = data.tech,
        invalidTech = false,
        json = createClientMessage(data, socket.id);
    LOGGER.info(`次の用語が楽観的検索ワードに指定されました。 => ${message} by ${socket.id}`);
    LOGGER.info(tech);
    for (var i = 0; i < tech.length; i++) {
      if (invalidTech) break;
      invalidTech = TECH_VALUES.indexOf(tech[i]) === -1;
    }

    var url = UTIL.format(REQUEST_URLS[tech], message);
    if (invalidTech) {
      // tech情報が不正
      LOGGER.error(`tech is invalid [${tech}]`);
      return;
    }
    if (tech.length > 1) {
      // techが複数選択された
      LOGGER.info("全実行します。");
      // 全実行する
    } else {
      LOGGER.info(url);
      REQUEST(url, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          LOGGER.info(`start to download`);
          FS.writeFile(OUTFILE, body, 'utf-8', e => {
            if (e !== null) {
              LOGGER.error(e);
            }
          });
          LOGGER.info(`download to ${OUTFILE}`)
        } else {
          LOGGER.info(`error : ${res.statusCode}`);
        }
      });
    }
    // REQUEST(UTIL.format(REQUEST_URLS.google, message), (err, res, body) => {
    //   if (!err && res.statusCode === 200) {
    //     LOGGER.info(body);
    //   } else {
    //     LOGGER.info(`error : ${res.statusCode}`);
    //   }
    // });

    socket.emit("sendMyMsg", json);
  });
  socket.on("disconnect", () => {});
});

function createClientMessage(data, id) {
  return {
    hash: CRYPTO.createHash(CRYPTO_KEY).update(id).digest(DIGEST_KEY),
    msg: data.msg
  };
}



// io.on('connection', socket => {
//   LOGGER.info(socket.handshake.headers);
//   socket.on("sendMessageToServer", data => {
//     var rooms_session = socket.adapter.rooms,
//         arr = new Array(),
//         id,
//         json;
//
//     // 部屋が変わったら退出処理
//     if (data.b_room != data.room) socket.leave(data.b_room);
//
//     data.hash = CRYPTO.createHash(CRYPTO_KEY).update(socket.id).digest(DIGEST_KEY);
//
//     // 部屋にあるセッションIDを格納
//     for (id in rooms_session[data.room]) arr.push(id);
//     json = createClientMessage(data, arr.indexOf(socket.id) < 0);
//     LOGGER.info(json);
//
//     socket.join(data.room);
//     socket.emit("sendMyMsg", json);
//     socket.to(data.room).emit("sendRoomMsg", json);
//   });
//   socket.on("disconnect", () => {});
// });
//
// /**
//  * クライアント用のデータを格納する.
//  */
// function createClientMessage(data, isNew) {
//   return {
//       hash:data.hash,
//       value:data.value,
//       name:data.name,
//       room:data.room,
//       isNewJoin:isNew  // 部屋に新規で来たかどうか
//   };
// }
