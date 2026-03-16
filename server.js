const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app); 
const io = socketIO(server); 
const port = 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {

    console.log('New client connected');

    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`Cliente se unió a la sala: ${roomName}`);
    });
 
    socket.on('message_joystick', (message_joystick) => {
        console.log(`Received message joystick => ${message_joystick}`);
        io.to("Visuales room").emit("message_joystick",message_joystick); 
    });

});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
