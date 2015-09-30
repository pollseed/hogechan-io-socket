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
      TECH_MAP = new Map().set("1", "https://api.github.com/search/repositories?q=%s").set("2", "http://stackoverflow.com/search?q=%s");

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
        json = createClientMessage(data, socket.id),
        tech_info = createTechInfo(tech, message);

    LOGGER.info(`次の検索サービスが指定されました。 => ${tech}`);
    LOGGER.info(`次の用語が楽観的検索ワードに指定されました。 => ${message} by ${socket.id}`);

    if (tech_info.invalidTech) {
      // tech情報が不正
      LOGGER.error(`tech is invalid [${tech}]`);
      return;
    }
    if (tech.length > 1) {
      // techが複数選択された
      LOGGER.info("全実行します。");
      // TODO 全実行する

    } else {
      tech_info.options_array.forEach(v => {
        REQUEST(v, (err, res, body) => {
          if (!err && res.statusCode === 200) {
            LOGGER.info(`start to download`);
            var html_urls = [],
                file_name = 'tech_info_' + new Date().getTime() + '.txt';
            JSON.parse(body).items.forEach(v => { html_urls.push(v.html_url) });
            FS.writeFile(file_name, html_urls.toString(), 'utf-8', e => {
              if (e !== null) LOGGER.error(e);
            });
            LOGGER.info(`download to ${file_name}`)
          } else {
            LOGGER.error(`error : ${res.statusCode}`);
            LOGGER.error(`body : ${body}`);
          }
        });
      });
    }
    socket.emit("sendMyMsg", json);
  });
  socket.on("disconnect", () => {});
});

/**
 * 技術情報を生成.
 */
function createTechInfo(tech, message) {
  var options_array = [],
      options = {
        url: '',
        headers: {
          'User-Agent': 'request'
        }
      };

  tech.forEach(v => {
    if (TECH_MAP.get(v) === undefined) return { invalid_tech: true, options_array: [] };
    options.url = UTIL.format(TECH_MAP.get(v), message);
    options_array.push(options);
  });
  return { invalid_tech: false, options_array: options_array };
}

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
