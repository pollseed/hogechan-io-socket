/**
 * @fileoverview クライアントサイドの動的処理.
 * @author pollseed
 */

"use strict";

const SOCKET = io();

SOCKET.on("sendMyMsg", data => {
  let session = JSON.parse(sessionStorage.getItem('data')),
      result = document.getElementById("result");

  // セッション情報が存在していれば、結果を合体させておく
  // ブラウザバックした時にその合体した全ての結果を表示させるため
  if (session !== null && session.result !== undefined) {
    data.result = session.result + data.result;
  }

  // セッション情報を格納
  sessionStorage.setItem('data', JSON.stringify(data));
  appendResult(data.result);
});

(function() {
  let session = JSON.parse(sessionStorage.getItem('data'));

  // ブラウザバック、レンダリング時等対応
  if (session !== null) {
    appendResult(session.result);
  }
}());

/**
 * DOMに結果を埋め込む.
 * @param {string} urls LINKのカンマ区切り文字列
 */
function appendResult(urls) {
  let count = document.getElementById("count"),
      result = document.getElementById("result"),
      url_split = urls.split(","),
      li, a;
  count.innerHTML = urls !== "" ? url_split.length : 0;
  url_split.forEach(v => {
    li = document.createElement("li");
    a = document.createElement("a");
    a.innerHTML = v;
    a.href = v;
    li.appendChild(a);
    result.appendChild(li);
  });
}

/**
 * サーバに指定入力した値を送る.
 *
 * @return エラーがあれば {@code false} を返す.
 */
function message_main() {
  let $msg = $("#message").val(),
      $tech = $("#select_tech").val();
  if (errorHandlingDone($msg, $tech)) return false;
  clearResult();
  $("#message").val("");
  SOCKET.emit("sendMessageToServer", { msg: $msg, tech: $tech });
}

/**
 * 結果を消し込む.(セッション情報も消す)
 */
function clearResult() {
  let result = document.getElementById("result");
  result.innerHTML = '';
  sessionStorage.removeItem('data');
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
