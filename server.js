const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: 'https://testvideochat-git-main-soufyanebelmanaa-gmailcoms-projects.vercel.app/', // Replace with your Vercel URL
        methods: ['GET', 'POST']
    }
});

const rooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(socket.id);
        socket.join(roomId);

        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            socket.to(roomId).emit('user-disconnected', socket.id);
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        });
    });

    socket.on('offer', ({ offer, to }) => {
        socket.to(to).emit('offer', { offer, from: socket.id });
    });

    socket.on('answer', ({ answer, to }) => {
        socket.to(to).emit('answer', { answer, from: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
        socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Bind to all interfaces
server.listen(port, host, () => {
    console.log(`Socket.io server running on ${host}:${port}`);
});