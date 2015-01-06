var io, rooms, createChat, joinRoom,
    leaveRoom, getTenants, handleRoomChangeRequest;

rooms = { lobby: [] };

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

getTenants = function (room, nicknames) {
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

  var NickMan = require('./nickname_manager');
  var nickMan = new NickMan();

  io = require('socket.io')(server);
  io.on('connection', function (socket) {
    var nick;

    console.log(socket.request.connection.remoteAddress);

    // Set guest nick
    nick = nickMan.nextGuestNick();
    nickMan.nicknames[socket.id] = nick;
    socket.emit('nickNameChangeResult', {
      success: true,
      message: nick
    });

    socket.emit("messaged", "Connected as " + nick);
    joinRoom(socket, 'lobby');

    io.to('lobby').emit("messaged", nick + " has entered the chat.");
    io.to('lobby').emit("roomList", {
      tenants: getTenants('lobby', nickMan.nicknames)
    });

    socket.on('message', function (data) {
      var msg = nick + ": "  + data.text;
      io.to(data.room).emit('messaged', msg);
    });

    socket.on("disconnect", function (socket) {
      var sockId = nickMan.getSockId(nick);
      leaveRooms(sockId);
      delete nickMan.nicknames[sockId];
    });

    socket.on('nicknameChangeRequest', function (newNick) {
      if (nickMan.nickTaken(newNick)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: "Nickname is already taken"
        });
      } else if (nickMan.isGuestNick(newNick)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: "Names cannot be of the form guest_n_"
        });
      } else {
        nick = newNick;
        nickMan.nicknames[socket.id] = nick;
        socket.emit('nicknameChangeResult', {
          success: true,
          message: "You are known known as " + newNick
        });
      }
    });

    socket.on('roomChangeRequest', function(data) {
      handleRoomChangeRequest(socket, data.room);
      io.to(data.room).emit("roomList", {
        tenants: getTenants(data.room, nickMan.nicknames)
      });

    });

  });
};

module.exports.createChat = createChat;
