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

})();
