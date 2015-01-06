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
  chat.sendMessage(msg);
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

  $('form').on("submit", function (event) {
    event.preventDefault();
    var msg = ChatUI.getMessage();
    ChatUI.sendMessage(chat, msg);
  });
});

})();
