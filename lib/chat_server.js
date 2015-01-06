var io, createChat;


createChat = function (server) {
  io = require('socket.io')(server);
  io.on('connection', function (socket) {

    socket.emit("messaged", "Connected!");

    socket.on('message', function (data) {
      io.emit('messaged', data);
    });
  });
};


module.exports.createChat = createChat;
