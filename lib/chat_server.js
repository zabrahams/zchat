var io, createChat, nextGuestNick, nickTaken, isGustNick, guestNumber, nicknames;

guestNumber = 0;
nicknames = {};

nextGuestNick = function () {
  var nick = "guest" + (guestNumber + 1);
  guestNumber ++;
  return nick;
};

nickTaken = function(nick) {
  var users = Object.keys(nicknames);

  return users.some( function (user) {
    return nicknames[user] === nick;
  });
};

isGuestNick = function (nick) {
  return /^guest\d+$/.test(nick);
}

createChat = function (server) {

  io = require('socket.io')(server);
  io.on('connection', function (socket) {
    var nick;

    // Set guest nick
    nick = nextGuestNick();
    nicknames[socket.id] = nick;
    socket.emit('nickNameChangeResult', {
      success: false,
      message: nick
    });

    socket.emit("messaged", "Connected as " + nick);
    io.emit("messaged", nick + " has entered the chat.");

    socket.on('message', function (data) {
      io.emit('messaged', nick + ": " + data);
    });

    socket.on("disconnect", function (socket) {
      console.log(nick);
      io.emit("messaged", nick + " has left the building.");
      delete nicknames[socket.id];
    });

    socket.on('nicknameChangeRequest', function (newNick) {
      console.log(newNick);
      if (nickTaken(newNick)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: "Nickname is already taken"
        });
      } else if (isGuestNick(newNick)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: "Names cannot be of the form guest_n_"
        });
      } else {
        io.emit("messaged", nick + " is now known as " + newNick);
        nick = newNick;
        nicknames[socket.id] = nick;
        socket.emit('nicknameChangeResult', {
          success: true,
          message: "You are known known as " + newNick
        });
      }
    });

  });
};

module.exports.createChat = createChat;
