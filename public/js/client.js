var socket = io.connect('http://localhost:3000');
socket.on("sendMessageToClient", function(data) {
  writeInRoomMsgClient(data);
  appendMsgList(data);
});

socket.on("sendMessageToClientRoom", function(data) {
  writeInRoomMsgClientRoom(data);
  appendMsgList(data);
  $("#room_h1").text(data.room);
});

$("input#send").click(function() {
  var name = $("#name").val();
  var msg = $("#message").val();
  var room = $("#rooms").val();
  var b_room = document.getElementById("room_h1").innerHTML;
  if (errorHandlingDone(name, msg, room)) {
    return false;
  }
  $("#message").val("");
  socket.emit("sendMessageToServer", {name:name,value:msg,room:room,b_room:b_room});
});

/**
* エラー処理をする.
*/
function errorHandlingDone(name, msg, room) {
  if (name == "" || msg == "" || room == null) {
    $("#alert_box").addClass("alert");
    $("#alert_box").addClass("alert-danger");
    $("#alert_box").addClass("glyphicon");
    $("#alert_box").addClass("glyphicon-exclamation-sign");
    $("#alert_msg").text(getErrorMsg(room));
    return true;
  } else {
    $("#alert_box").removeClass("alert");
    $("#alert_box").removeClass("alert-danger");
    $("#alert_box").removeClass("glyphicon");
    $("#alert_box").removeClass("glyphicon-exclamation-sign");
    $("#alert_msg").text("");
    return false;
  }
}

/**
* room情報によってエラーメッセージを判定して取得する.
*/
function getErrorMsg(room) {
    var error_message = null;
    if (room == null) {
      return "部屋を選択してください。";
    } else {
      return "メッセージを入力してください。";
    }
}

/**
* room情報を取得して変更があればタグを設定します(client用).
*/
function writeInRoomMsgClient(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" && room != data.room[0] && data.name != undefined && data.room[0] != undefined) {
    appendMsgListRoom(data);
  }
}

/**
* room情報を取得して変更があればタグを設定します(clientRoom用).
*/
function writeInRoomMsgClientRoom(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" || room != data.room[0]) {
    appendMsgListRoom(data);
  }
}

/**
* #msg_listに指定したデータを設定する.
*/
function appendMsgListRoom(data) {
  appendTag($("#msg_list"), "li", data.name + "が" + data.room + "に入室しました");
}

/**
* #msg_listに指定したデータを設定する.
*/
function appendMsgList(data) {
  appendTag($("#msg_list"), "li", data.value + createHideTag(data.hash));
}


/**
* jQuery要素に指定したタグで指定した値を設定する.
*/
function appendTag($id, tagName, value) {
  $id.append($("<" + tagName + ">").html(value));
}

/**
* 隠しデータ用のタグを生成する.
*/
function createHideTag(value) {
  return "<span style=\"display: none;\">@" + value + "</span>";
}
