(function () {
  if (typeof ChatUI === "undefined" ) {
    window.ChatUI = ChatUI =  {};
  }

// var ChatUI.chat = chat = new ChatApp.Chat({socket: this.socket});

ChatUI.getMessage = getMessage = function () {
  var $input = $("form input#new_message");
  var msg = $input.val();
  $input.val("");
  return msg;
};

ChatUI.sendMessage = sendMessage = function (chat, msg) {
  if (msg[0] === "/") {
    chat.processCommand(msg);
  } else {
    chat.sendMessage(msg);
  }
};

ChatUI.displayMessage = displayMessage = function (msg) {
  var $msgList, $li;

  $msgList = $("ul.message-list");
  $li = $("<li>");
  $li.text(msg);
  $msgList.prepend($li);
};

$(function () {
  var socket = io();
  var chat = new ChatApp.Chat({socket: socket});

  socket.on('messaged', function (msg) {
    ChatUI.displayMessage(msg);
  });

  socket.on('nicknameChangeResult', function (data) {
    console.log("in nickchangeresult");
    displayMessage(data.message);
  });

  $('form').on("submit", function (event) {
    event.preventDefault();
    var msg = ChatUI.getMessage();

    ChatUI.sendMessage(chat, msg);
  });
});

})();
