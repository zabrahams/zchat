(function () {
  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  ChatApp.Chat = Chat = function (options) {
    this.socket = options.socket;
  };

  Chat.prototype.sendMessage = function (msg) {
    this.socket.emit("message", msg);
  };

  Chat.prototype.processCommand = function (input) {
    var comand, arg, matchData;

    matchData = input.match(/^\/(\w+)\s(\w+)/);
    command = matchData[1];
    arg = matchData[2];

    if (command === "nick") {
      this.socket.emit("nicknameChangeRequest", arg);
    }
  }

})();
