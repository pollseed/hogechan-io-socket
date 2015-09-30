"use strict";

const SOCKET = io();

SOCKET.on("sendMyMsg", data => {

});

function message_main() {
  let msg = $("#message").val(),
      tech = $("#select_tech").val();
  if (errorHandlingDone(msg,tech)) return false;
  $("#message").val("");
  SOCKET.emit("sendMessageToServer", {msg:msg, tech:tech});
}

function click() {
  let el = document.getElementById("send");
  el.addEventListener('click', message_main, false);
}

document.addEventListener('DOMContentLoaded', click, false);

/**
* エラー処理をする.
*/
function errorHandlingDone(msg,tech) {
  let alert_box = $("#alert_box"),
      alert_msg = $("#alert_msg");
  if (msg === "" || tech === null) {
    alert_box.addClass("flash flash-error");
    if (msg === "") {
      alert_msg.text("検索ワードを選択してください。");
    }
    if (tech === null) {
      alert_msg.text("検索サービスを選択してください。");
    } else {
      tech.each((i,v) => {
        if (["1","2"].indexOf(v) < 0) {
          alert_msg.text("検索サービスを選択してください。");
        }
      });
    }
    return true;
  } else {
    alert_box.removeClass("flash flash-error");
    alert_msg.text("");
    return false;
  }
}
