var socket = io.connect('http://localhost:3000');
socket.on("sendMessageToClient", function(data) {
  writeInRoomMsg1(data);
  appendMsgList(data);
});

socket.on("sendMessageToClientRoom", function(data) {
  writeInRoomMsg2(data);
  appendMsgList(data);
  $("#room_h1").text(data.room);
});

$("input#send").click(function() {
  var name = $("#name").val();
  var msg = $("#message").val();
  var room = $("#rooms").val();
  var b_room = document.getElementById("room_h1").innerHTML;
  if (name == "" || msg == "" || room == null) {
    $("#alert_box").addClass("alert");
    $("#alert_box").addClass("alert-danger");
    $("#alert_box").addClass("glyphicon");
    $("#alert_box").addClass("glyphicon-exclamation-sign");
    $("#alert_msg").text("メッセージを入力してください。");
    return false;
  } else {
    $("#alert_box").removeClass("alert");
    $("#alert_box").removeClass("alert-danger");
    $("#alert_box").removeClass("glyphicon");
    $("#alert_box").removeClass("glyphicon-exclamation-sign");
    $("#alert_msg").text("");
  }
  $("#message").val("");
  socket.emit("sendMessageToServer", {name:name,value:msg,room:room,b_room:b_room});
});

function writeInRoomMsg1(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" && room != data.room[0] && data.name != undefined && data.room[0] != undefined) {
    appendTag($("#msg_list"), "li", data.name + "が" + data.room + "に入室しました");
  }
}

function writeInRoomMsg2(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" || room != data.room[0]) {
    appendTag($("#msg_list"), "li", data.name + "が" + data.room + "に入室しました");
  }
}

function appendMsgList(data) {
  appendTag($("#msg_list"), "li", data.value + createHideTag(data.hash));
}

function appendTag($id, tagName, value) {
  $id.append($("<" + tagName + ">").html(value));
}

function createHideTag(value) {
  return "<span style=\"display: none;\">@" + value + "</span>";
}
