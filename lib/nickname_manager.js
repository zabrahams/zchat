var NicknameManager = function () {
  this.guestNumber = 0;
  this.nicknames = {};
}

NicknameManager.prototype.nextGuestNick = function () {
  var nick = "guest" + (this.guestNumber + 1);
  this.guestNumber ++;
  return nick;
};

NicknameManager.prototype.nickTaken = function (nick) {
  var users = Object.keys(this.nicknames);

  return users.some( function (user) {
    return this.nicknames[user] === nick;
  }.bind(this));
};

NicknameManager.prototype.isGuestNick = function (nick) {
  return /^guest\d+$/.test(nick);
};

NicknameManager.prototype.getSockId = function(nick) {
  var nickKeys = Object.keys(this.nicknames);
  for (var i=0; i < nickKeys.length; i++) {
    if (this.nicknames[nickKeys[i]] === nick) {
      return nickKeys[i];
    }
  }
  return -1;
};

module.exports = NicknameManager;
