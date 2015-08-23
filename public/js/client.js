var socket = io.connect('http://localhost:3000');
socket.on("sendMessageToClient", function(data) {
  appendMsgList(data);
});

socket.on("sendMessageToClientRoom", function(data) {
  appendMsgList(data);
  $("#room_h1").text("[" + data.room + "]");
});

$("input#send").click(function() {
  var name = $("#name").val();
  var msg = $("#message").val();
  var room = $("#rooms").val();
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
  socket.emit("sendMessageToServer", {name:name,value:msg,room:room});
});

function appendMsgList(data) {
  appendTag($("#msg_list"), "li", data.value + createHideTag(data.hash));
}

function appendTag($id, tagName, value) {
  $id.append($("<" + tagName + ">").html(value));
}

function createHideTag(value) {
  return "<span style=\"display: none;\">@" + value + "</span>";
}
