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

  if ($msgList.find('li').length > 15) {
    $msgList.find('li').first().remove();
  }

  $li = $("<li>");
  $li.text(msg);
  $msgList.append($li);


};

$(function () {
  var socket = io();
  var chat = new ChatApp.Chat({socket: socket});
  $('form input[type=text]').focus();

  socket.on('messaged', function (msg) {
    ChatUI.displayMessage(msg);
  });

  socket.on('nicknameChangeResult', function (data) {
    displayMessage(data.message);
  });

  socket.on('roomList', function (data) {
    var $ul = $('ul.tenants');
    $ul.empty();
    for (var i = 0; i < data.tenants.length; i++) {
      $ul.append($("<li></li>").text(data.tenants[i]));
    }
  });

  $('form').on("submit", function (event) {
    event.preventDefault();
    var msg = ChatUI.getMessage();

    ChatUI.sendMessage(chat, msg);
  });

});

})();
