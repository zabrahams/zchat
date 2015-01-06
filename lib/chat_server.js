var NicknameManager = function () {
  this.guestNumber = 0;
  this.nicknames = {};
}




var io, createChat, nextGuestNick, nickTaken, isGuestNick,
    guestNumber, nicknames, rooms;

guestNumber = 0;
nicknames = {};
rooms = { lobby: [] };

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
};

getSockId = function(nick) {
  var nickKeys = Object.keys(nicknames);
  for (var i=0; i < nickKeys.length; i++) {
    if (nicknames[nickKeys[i]] === nick) {
      return nickKeys[i];
    }
  }
  return -1;
}

joinRoom = function (socket, room) {
  if (typeof rooms[room] === "undefined") {
    rooms[room] = [];
  }
  rooms[room].push(socket.id);
  socket.join(room);
};

leaveRooms = function (sockId, socket) {
  roomNames = Object.keys(rooms);
  for (var i = 0; i < roomNames.length; i++) {
    var tenants = rooms[roomNames[i]];
    var tenantIndex = tenants.indexOf(sockId);
    if (tenantIndex >= 0) {
      socket && socket.leave(roomNames[i]);
      tenants.splice(tenantIndex, 1);
    }
  }
};

getTenants = function (room) {
  var tenantIds = rooms[room];
  return tenantIds.map(function (tenantId) {
    return nicknames[tenantId];
  });
};

handleRoomChangeRequest = function (socket, room) {
  leaveRooms(socket.id, socket);
  joinRoom(socket, room);
};

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
    joinRoom(socket, 'lobby');

    io.to('lobby').emit("messaged", nick + " has entered the chat.");
    io.to('lobby').emit("roomList", { tenants: getTenants('lobby') } );

    socket.on('message', function (data) {
      var msg = nick + ": "  + data.text;
      io.to(data.room).emit('messaged', msg);
    });

    socket.on("disconnect", function (socket) {
      var sockId = getSockId(nick);
      console.log(nick);
      console.log(sockId);
      leaveRooms(sockId);
      delete nicknames[sockId];
    });

    socket.on('nicknameChangeRequest', function (newNick) {
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
        nick = newNick;
        nicknames[socket.id] = nick;
        socket.emit('nicknameChangeResult', {
          success: true,
          message: "You are known known as " + newNick
        });
      }
    });

    socket.on('roomChangeRequest', function(data) {
      handleRoomChangeRequest(socket, data.room);
      io.to(data.room).emit("roomList", { tenants: getTenants(data.room) } );

    });

  });
};

module.exports.createChat = createChat;
