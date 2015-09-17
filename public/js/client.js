"use strict";

const socket = io();

socket.on("sendRoomMsg", function(data) {
  if (data.isNewJoin) {
    setMember(data);
    writeInRoom(data);
  }
  appendMsgList(data);
  endScroll();
});

socket.on("sendMyMsg", function(data) {
  writeInMyMsg(data);
  appendMyMsgList(data);
  $("#room_h1").text(data.room);
  endScroll();
});

function message_main() {
  var name = $("#name").val(),
      msg = $("#message").val(),
      room = $("#rooms").val(),
      b_room = document.getElementById("room_h1").innerHTML;
  if (errorHandlingDone(name, msg, room)) {
    return false;
  }
  $("#message").val("");
  socket.emit("sendMessageToServer", {name:name,value:msg,room:room,b_room:b_room});
}

function click() {
  var el = document.getElementById("send");
  el.addEventListener('click', message_main, false);
}

document.addEventListener('DOMContentLoaded', click, false);

/**
* エラー処理をする.
*/
function errorHandlingDone(name, msg, room) {
  if (name == "" || msg == "" || room == null) {
    $("#alert_box").addClass("flash");
    $("#alert_box").addClass("flash-error");
    $("#alert_msg").text(getErrorMsg(room));
    return true;
  } else {
    $("#alert_box").removeClass("flash");
    $("#alert_box").removeClass("flash-error");
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
* メンバーのハッシュ値を追加します.
*/
function setMember(data) {
  var member_list = $("#member_list > *"),
      i;
  for (i = 0; i < member_list.size(); i++) {
    if (member_list[i].innerHTML == data.hash) {
      return;
    }
  }
  appendMsgListRoom(data);
  appendTag($("#member_list"), "p", data.hash);
}

/**
* room情報を取得して変更があればタグを設定します(client用).
*/
function writeInRoom(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" && room != data.room[0] && data.name != undefined && data.room[0] != undefined) {
    appendMsgListRoom(data);
  }
}

/**
* room情報を取得して変更があればタグを設定します(clientRoom用).
*/
function writeInMyMsg(data) {
  var room = document.getElementById("room_h1").innerHTML;
  if (room == "" || room != data.room[0]) {
    appendMsgListRoom(data);
  }
}

/**
* #msg_listに指定したデータを設定する.
*/
function appendMsgListRoom(data) {
  var html = "<div class=\"flash\" role=\"alert\" style=\"width: 300px;\">" + data.name + "が" + data.room + "に入室しました</div>";
  appendTag($("#msg_list"), "li", html);
}

/**
* #msg_listに指定したデータを設定する.
*/
function appendMyMsgList(data) {
  var html = "<div class=\"myfbox\">"
              + "<b>" + data.name + "</b><br>"
              + createHideTag(data.hash) + data.value
           + "</div>";
  appendTag($("#msg_list"), "li", html);
}

/**
* #msg_listに指定したデータを設定する.
*/
function appendMsgList(data) {
  var html = "<div class=\"fbox\">"
              + "<b>" + data.name + "</b><br>"
              + createHideTag(data.hash) + data.value
           + "</div>";
  appendTag($("#msg_list"), "li", html);
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

function endScroll() {
  location.href = "#end";
}
