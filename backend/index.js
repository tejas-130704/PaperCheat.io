const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const Rooms = new Map();
const userSocketMap = new Map();
let socketCounter = 0;



wss.on("connection", (ws) => {
    socketCounter++;
    const socketId = `socket-${socketCounter}`;
    ws.id = socketId;
    userSocketMap.set(ws.id, ws);

    console.log("Client connected", ws.id);

    ws.on("message", (data) => {
        try {
            const userData = JSON.parse(data);
            console.log("User Data:", userData);

            const getTheWinnerAndRank = (room, userData) => {
                //Check the rank (1,2) and allocate points 
                let isRankOneOccupied = false;
                let isRankTwoOccupied = false;
                let isRankThreeOccupied = false;
                for (let i = 0; i < room.players.length; i++) {
                    if (room.players[i].rank === 1) {
                        isRankOneOccupied = true;
                    }
                    if (room.players[i].rank === 2) {
                        isRankTwoOccupied = true;
                    }
                    if (room.players[i].rank === 3) {
                        isRankThreeOccupied = true; // demote rank 3 to rank 4
                    }
                }
                if (!isRankOneOccupied) {
                    room.players[userData.yourId - 1].rank = 1;
                    room.players[userData.yourId - 1].points += 10;
                    room.sockets.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            const p = room.players.find(p => p.socketid === client.id);
                            client.send(JSON.stringify({
                                isData: "rank-update",
                                winnerId: userData.yourId,
                                rank: 1,
                                yourId: p.id,
                                message: `${room.players[userData.yourId - 1].name} got Rank : ${1}!`,
                            }));
                        }
                    });
                }
                else if (!isRankTwoOccupied) {
                    room.players[userData.yourId - 1].rank = 2;
                    room.players[userData.yourId - 1].points += 5;
                    room.sockets.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            const p = room.players.find(p => p.socketid === client.id);
                            client.send(JSON.stringify({
                                isData: "rank-update",
                                winnerId: userData.yourId,
                                rank: 2,
                                yourId: p.id,
                                message: `${room.players[userData.yourId - 1].name} got Rank : ${2}!`,
                            }));
                        }
                    });
                }
                else if (!isRankThreeOccupied) {
                    room.players[userData.yourId - 1].rank = 3;
                    room.players[userData.yourId - 1].points += 2;
                    room.sockets.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            const p = room.players.find(p => p.socketid === client.id);
                            client.send(JSON.stringify({
                                isData: "rank-update",
                                winnerId: userData.yourId,
                                rank: 3,
                                yourId: p.id,
                                message: `${room.players[userData.yourId - 1].name} got Rank : ${3}!`,
                            }));
                        }
                    });

                    room.isGameStarted = false;
                    room.sockets.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            const p = room.players.find(p => p.socketid === client.id);

                            const payload = {
                                isData: "round-end",
                                message: "Game Over!",
                                isGameStarted: false,
                                players: room.players,
                                round: room.round,
                                gameOver: room.round === room.totalRounds ? true : false,
                                totalMembers: room.totalMembers,
                                yourId: userData.yourId,
                                roomId: userData.roomId,
                                winnersList: room.players.filter(p => (p.rank <= 3) && (p.rank >= 1)).map(p => ({
                                    id: p.id,
                                    name: p.name,
                                    points: p.points,
                                    rank: p.rank
                                }))

                            }
                            console.log(`${client.id} sends to : ${payload}`)
                            client.send(JSON.stringify(payload));
                        }
                    });
                }
                
            }

            function getRandomCheat(cheatPool) {
                const keys = Object.keys(cheatPool);
                const randKey = keys[Math.floor(Math.random() * keys.length)];
                return randKey;
            }

            if (userData.type === "room-create") {
                if (Rooms.has(userData.roomId)) {
                    const room = Rooms.get(userData.roomId);
                    ws.send(JSON.stringify({
                        hostmessage: "Room already exists", isData: "room-already-created",
                        totalMembers: room.totalMembers,
                        isGameStarted: room.isGameStarted,
                        players: room.players,
                        round: room.round,
                        roomId: userData.roomId,
                        yourId: room.players.length
                    }));
                    return;
                }

                Rooms.set(userData.roomId, {
                    players: [],
                    sockets: [],
                    round: 1,
                    isGameStarted: false,
                    AnonymousChat: userData.nxtAnonymousChat,
                    HideCheat: userData.nxtHideCheat,
                    totalMembers: userData.memeberCount,
                    totalRounds: userData.totalRounds,
                });

                
                const room = Rooms.get(userData.roomId);
                console.log("Rooom Created:",room)

                room.players.push({
                    id: room.players.length + 1,
                    name: userData.userName,
                    avatar: userData.emoji,
                    socketid: ws.id,
                    active: '',
                    points: 0,
                    rank: -1
                });
                room.sockets.push(ws);

                ws.send(JSON.stringify({
                    message: "Room created successfully",
                    isData: "room-created",
                    totalMembers: room.totalMembers,
                    isGameStarted: room.isGameStarted,
                    players: room.players,
                    round: room.round,
                    roomId: userData.roomId,
                    yourId: room.players.length
                }));

                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            isData: "send-message",
                            playerId: 1,
                            type: "room-notification",
                            message: `You have created the room`
                        }));
                    }
                });

            } else if (userData.type === "room-join") {
                if (!Rooms.has(userData.roomId)) {
                    ws.send(JSON.stringify({ error: "Room does not exist", isData: "error" }));
                    return;
                }

                const room = Rooms.get(userData.roomId);

                if (room.players.length >= room.totalMembers) {
                    ws.send(JSON.stringify({ error: "Room is full", isData: "room-full" }));
                    return;
                }

                if (room.isGameStarted) {
                    ws.send(JSON.stringify({ error: "Game has already started", isData: "error" }));
                    return;
                }

                room.players.push({
                    id: room.players.length + 1,
                    name: userData.userName,
                    avatar: userData.emoji,
                    socketid: ws.id,
                    active: '',
                    points: 0,
                    rank: -1
                });
                room.sockets.push(ws);

                ws.send(JSON.stringify({
                    message: "Joined room successfully",
                    isData: "room-join",
                    roomId: userData.roomId,
                    players: room.players,
                    totalMembers: room.totalMembers,
                    isGameStarted: room.isGameStarted,
                    round: room.round,
                    yourId: room.players.length,
                    AnonymousChat: room.AnonymousChat,
                    HideCheat: room.HideCheat,
                    totalRounds: room.totalRounds,
                }));

                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        const player = room.players.find(p => p.socketid === client.id);
                        client.send(JSON.stringify({
                            isData: "new-user-joined",
                            players: room.players,
                            roomId: userData.roomId,
                            totalMembers: room.totalMembers,
                            isGameStarted: room.isGameStarted,
                            round: room.round,
                            yourId: player?.id,
                            AnonymousChat: room.AnonymousChat,
                            HideCheat: room.HideCheat,
                            totalRounds: room.totalRounds,
                        }));
                    }
                });

                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        const player = room.players.find(p => p.socketid === client.id);

                        if (player) {
                            client.send(JSON.stringify({
                                isData: "send-message",
                                type: "room-notification",
                                playerId: room.players.length + 1, // use the correct identifier
                                message: `${userData.userName} has joined the room`
                            }));
                        }
                    }
                });

            }
            else if (userData.type === "start-game") {
                const room = Rooms.get(userData.roomId);
                if (!room) {
                    ws.send(JSON.stringify({ error: "Room does not exist", isData: "error" }));
                    return;
                }

                if (room.isGameStarted) {
                    ws.send(JSON.stringify({
                        error: "Game has already started", isData: "warning",
                        totalMembers: room.totalMembers,
                        isGameStarted: room.isGameStarted,
                        players: room.players,
                        round: room.round,
                        roomId: userData.roomId,
                        yourId: userData.yourId
                    }));
                    return;
                }

                for (i = 0; i < room.players.length; i++) {
                    room.players[i].rank = -1; //while starting new round rank will be calculated again
                    room.players[i].active = "";
                }
                room.cheats = {}

                if (room.players.length < 4) {
                    ws.send(JSON.stringify({
                        error: "Not enough players to start the game", isData: "warning",
                        totalMembers: room.totalMembers,
                        isGameStarted: room.isGameStarted,
                        players: room.players,
                        round: room.round,
                        roomId: userData.roomId,
                        yourId: userData.yourId
                    }));
                    return;
                }

                room.isGameStarted = true;
                room.round = userData.round;

                // ✅ Step 1: Generate cheatPool
                const cheatPool = {};
                room.players.forEach(player => {
                    cheatPool[player.name] = 4;
                });

                // ✅ Step 2: Allocate cheats to players (but keep it server-side)
                room.cheats = {};
                room.players.forEach(player => {
                    const playerCheats = [];
                    for (let j = 0; j < 4; j++) {
                        const cheatName = getRandomCheat(cheatPool);
                        playerCheats.push(cheatName);
                        cheatPool[cheatName]--;
                        if (cheatPool[cheatName] === 0) {
                            delete cheatPool[cheatName];
                        }
                    }
                    room.cheats[player.socketid] = playerCheats;
                });

                // ✅ Step 3: Pick a random player to start
                const randomNumber = Math.floor(Math.random() * room.players.length);
                const activePlayer = room.players[randomNumber];
                activePlayer.active = "cheat";

                // ✅ Step 4: Send data to each player individually
                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        const p = room.players.find(p => p.socketid === client.id);

                        // secure data: only own data sent to each client
                        const playerCheats = (p.id === activePlayer.id) ? room.cheats[client.id].slice(0, room.cheats[client.id].length - 1) : room.cheats[client.id];
                        const pickCheat = (p.id === activePlayer.id)
                            ? room.cheats[client.id][room.cheats[client.id].length - 1] // Only if you're the active player
                            : "No Card";

                        const payload = {
                            isData: "game-started",
                            players: room.players,
                            cheats: playerCheats,
                            pickCard: pickCheat,
                            totalMembers: room.totalMembers,
                            isGameStarted: room.isGameStarted,
                            round: room.round,
                            yourId: p?.id,
                            startingPlayerId: activePlayer.id,
                            AnonymousChat: room.AnonymousChat,
                            HideCheat: room.HideCheat,
                            totalRounds: room.totalRounds,
                        };

                        console.log("Game start payload",payload)

                        client.send(JSON.stringify(payload));
                    }
                });
                const name = room.players[activePlayer.id - 1].name
                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            isData: "send-message",
                            type: "notification",
                            message: `${name} have the cheat`
                        }));
                    }
                });
            }
            else if (userData.type === "pass-cheat") {
                const room = Rooms.get(userData.roomId);
                if (!room) {
                    ws.send(JSON.stringify({ error: "Room does not exist", isData: "error" }));
                    return;
                }

                if (!room.isGameStarted) {
                    ws.send(JSON.stringify({ error: "Game has not started yet", isData: "error" }));
                    return;
                }
                if (userData.isWinner) {
                    getTheWinnerAndRank(room, userData)
                }
                const nextPlayerIndex = (userData.yourId % room.players.length);
                let sureNextPlayerId = 0;
                for (i = 0; i < room.players.length; i++) {
                    if (room.players[(i + nextPlayerIndex) % room.players.length].rank === -1) {
                        room.players[userData.yourId - 1].active = "";
                        room.players[(i + nextPlayerIndex) % room.players.length].active = "cheat";
                        sureNextPlayerId = room.players[(i + nextPlayerIndex) % room.players.length].id;
                        break;
                    }
                }

                room.cheats[room.players[userData.yourId - 1].socketid] = userData.finalList;

                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        const p = room.players.find(p => p.socketid === client.id);
                        const playerCheats = room.cheats[p.socketid];
                        const pickCheat = (p.id === sureNextPlayerId)
                            ? userData.passCheat // Only if you're the active player
                            : "No Card";

                        const payload = {
                            isData: "pass-cheat",
                            players: room.players,
                            cheats: playerCheats,
                            pickCard: pickCheat,
                            activePlayerId: sureNextPlayerId,
                            roomId: userData.roomId,
                            totalMembers: room.totalMembers,
                            isGameStarted: room.isGameStarted,
                            round: room.round,
                            yourId: p?.id,

                        }
                        console.log(`${client.id} sends to : ${payload}`)
                        client.send(JSON.stringify(payload));
                    }
                });

                const name = room.players[sureNextPlayerId - 1].name
                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            isData: "send-message",
                            type: "notification",
                            message: `${name} have the cheat`
                        }));
                    }
                });



            }
            else if (userData.type === "active-winner") {
                const room = Rooms.get(userData.roomId);
                if (!room) {
                    ws.send(JSON.stringify({ error: "Room does not exist", isData: "error" }));
                    return;
                }

                // ✅ Ensure userId is valid
                const yourId = userData.yourId;
                if (!yourId || yourId < 1 || yourId > room.players.length) {
                    ws.send(JSON.stringify({ error: "Invalid yourId", isData: "error" }));
                    return;
                }

                getTheWinnerAndRank(room, userData)

                // ✅ Step 1: Find the next player with rank -1
                let nextIndex = yourId - 1; // Convert to 0-based index
                for (let i = 1; i <= room.players.length; i++) {
                    const index = (i + nextIndex) % room.players.length;
                    if (room.players[index].rank === -1) {
                        nextIndex = index;
                        break; // ✅ Add break to avoid overriding once found
                    }
                }


                // ✅ Step 2: Update current player's active status
                room.players[yourId - 1].active = "";

                // ✅ Step 3: Set next player's active to "cheat"
                const activePlayer = room.players[nextIndex];
                activePlayer.active = "cheat";

                // ✅ Step 4: Send updated data to each player securely
                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        const p = room.players.find(p => p.socketid === client.id);
                        if (!p) return;

                        const playerCheats = (p.id === activePlayer.id)
                            ? room.cheats[client.id].slice(0, room.cheats[client.id].length - 1)
                            : room.cheats[client.id];

                        const pickCheat = (p.id === activePlayer.id)
                            ? room.cheats[client.id][room.cheats[client.id].length - 1]
                            : "No Card";

                        const payload = {
                            isData: "active-winner",
                            players: room.players,
                            cheats: playerCheats,
                            pickCard: pickCheat,
                            totalMembers: room.totalMembers,
                            isGameStarted: room.isGameStarted,
                            round: room.round,
                            yourId: p.id,
                            startingPlayerId: activePlayer.id
                        };

                        client.send(JSON.stringify(payload));

                    }
                });

            }
            
            else if (userData.type === "send-message") {
                const room = Rooms.get(userData.roomId);
                if (!room) {
                    ws.send(JSON.stringify({ error: "Room does not exist", isData: "error" }));
                    return;
                }

                const player = room.players[userData.yourId - 1]

                room.sockets.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            isData: "send-message",
                            username: userData.isAnonymous ?  "Anonymous" : player.name ,
                            type: "chat",
                            senderId: userData.isAnonymous ? -1 :userData.yourId,
                            message: userData.message
                        }));
                    }
                });
            }


        } catch (err) {
            console.error("Failed to parse message", err);
            ws.send(JSON.stringify({ error: "Invalid message format", isData: "error" }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected", ws.id);
        userSocketMap.delete(ws.id);

        for (const [roomId, room] of Rooms.entries()) {
            // Check if this socket was in the room
            const wasInRoom = room.sockets.includes(ws);

            const player = room.players.find(p => p.socketid === ws.id);
            const playerName = player ? player.name : "Unknown Player";

            if (room.players.length === 0) {
                Rooms.delete(roomId);
                console.log(`Room ${roomId} deleted because it's empty.`);
            }

            // Remove the user from the room
            room.sockets = room.sockets.filter(s => s !== ws);
            room.players = room.players.filter(p => p.socketid !== ws.id);

            console.log("room left player details: ", playerName)



            for (let i = 0; i < room.players.length; i++) {
                room.players[i].id = i + 1;
            }

            


            // ✅ Notify other users in this room
            if (wasInRoom) {
                room.sockets.forEach(otherSocket => {
                    const p = room.players.find((p) => p.socketid === otherSocket.id)
                    console.log("Disconnect message and update ids: ", p)
                    if (otherSocket.readyState === WebSocket.OPEN) {
                        otherSocket.send(JSON.stringify({
                            isData: "player-disconnect",
                            players: room.players,
                            yourId: p.id,
                            message: `${playerName} has left the room.`,
                            totalMembers: room.totalMembers,
                            isGameStarted: room.isGameStarted,
                        }));
                    }
                });
            }
        }
    });

});

app.get("/", (req, res) => {
    res.send("WebSocket + Express server is running");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
