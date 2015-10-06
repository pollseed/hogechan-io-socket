"use strict";

const SOCKET = io();

SOCKET.on("sendMyMsg", data => {
  let session = JSON.parse(sessionStorage.getItem('data')),
      result = document.getElementById("result");
  if (session !== null && session.result !== undefined) {
    data.result = session.result + data.result;
  }
  sessionStorage.setItem('data', JSON.stringify(data));
  appendResult(data.result);
});

(function() {
  let session = JSON.parse(sessionStorage.getItem('data'));
  if (session !== null) {
    appendResult(session.result);
  }
}());

function appendResult(urls) {
  let result = document.getElementById("result"),
      div = document.createElement("div"),
      li, a;
  urls.split(",").forEach(v => {
    li = document.createElement("li");
    a = document.createElement("a");
    a.innerHTML = v;
    a.href = v;
    li.appendChild(a);
    div.appendChild(li);
  });
  div.setAttribute('class', 'li_result');
  result.appendChild(div);
}

function message_main() {
  let $msg = $("#message").val(),
      $tech = $("#select_tech").val(),
      result = document.getElementById("result");
  if (errorHandlingDone($msg, $tech)) return false;
  result.innerHTML = '';
  sessionStorage.removeItem('data');
  $("#message").val("");
  SOCKET.emit("sendMessageToServer", { msg: $msg, tech: $tech });
}

function click() {
  let el = document.getElementById("send");
  el.addEventListener('click', message_main, false);
}

document.addEventListener('DOMContentLoaded', click, false);

/**
* エラー処理をする.
*/
function errorHandlingDone($msg, $tech) {
  let $alert_box = $("#alert_box"),
      $alert_msg = $("#alert_msg");
  if ($msg === "" || $tech === null) {
    $alert_box.addClass("flash flash-error");
    if ($msg === "") {
      $alert_msg.text("検索ワードを選択してください。");
    }
    if ($tech === null) {
      $alert_msg.text("検索サービスを選択してください。");
    } else {
      $tech.each((i,v) => {
        if (["1","2"].indexOf(v) < 0) {
          $alert_msg.text("検索サービスを選択してください。");
        }
      });
    }
    return true;
  } else {
    $alert_box.removeClass("flash flash-error");
    $alert_msg.text("");
    return false;
  }
}
