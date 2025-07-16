import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PlayGround from "./PlayGround";

export default function JoinRoom() {
    const { roomId } = useParams();
    const details = useLocation();

    if (!details.state) {
        window.location.href = "/";
        return null;
    }

    const socketRef = useRef(null);
    const [players, setPlayers] = useState([]);
    const [round, setRound] = useState(0);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [totalMembers, setTotalMembers] = useState(0);
    const [winnerList, setWinnerList] = useState([]);
    const [yourId, setYourId] = useState(null);
    const [cheats, setCheats] = useState([]);
    const [pickCard, setPickCard] = useState(null);
    const [activePlayerId, setActivePlayerId] = useState(null);

    const [globalRound, setGlobalRound] = useState(0);

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:3000');

        socketRef.current.addEventListener('open', () => {
            console.log("Connected to server");

            const payload = {
                roomId,
                userName: details.state.name,
                emoji: details.state.face,
                type: details.state.type === "host" ? "room-create" : "room-join",
                ...(details.state.type === "host" ? { memeberCount: details.state.totalMembers } : {})
            };
            console.log("Sending payload:", payload);

            // ✅ Double check before sending
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(payload));
            } else {
                console.warn("WebSocket not open yet!");
            }
        });

        socketRef.current.addEventListener("message", (event) => {

            console.log("Message from server:", event.data);
            const data = JSON.parse(event.data);

            if (data.isData === "room-created") {
                console.log("Room created successfully:", data);
                if (Array.isArray(data.players) && data.players.length > 0) {
                    data.players[0].me = 2; // host
                }
                setPlayers(data.players || []);
                setRound(data.round || 1);
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);


            }
            else if (data.isData === "warning") {
                console.error("Warning :", data);
                alert(data.error);
                setPlayers(data.players || []);
                setRound(data.round || 1);
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);
                setYourId(data.yourId || null);
            }
            else if (data.isData === "error") {
                console.error("Error from server:", data.error);
                alert(data.error);
                window.location.href = "/";

            } else if (data.isData === "room-join") {
                console.log("Joined room:", data);
                const index = (data.yourId || 1) - 1;
                if (data.players[index]) {
                    data.players[index].me = 1;
                }

                setPlayers(data.players || []);
                setRound(data.round || 1);
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);
                setYourId(data.yourId || null);
            }
            else if (data.isData == "active-winner") {
                setIsGameStarted(true);
                setYourId(data.yourId);
                setCheats(data.cheats);
                setActivePlayerId(data.startingPlayerId);
                setRound(data.round);
                setPickCard(data.pickCard);
                setPlayers(data.players);
                setTotalMembers(data.totalMembers);
            }
            else if (data.isData === "new-user-joined") {
                console.log("New user joined:", data);
                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers);
                setIsGameStarted(data.isGameStarted);
                setYourId(data.yourId || null);
                setRound(data.round);
            }
            else if (data.isData === "room-already-created") {
                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers);
                setIsGameStarted(data.isGameStarted);
                setRound(data.round);
                setYourId(data.yourId || null);
            }
            else if (data.isData === "room-full") {
                console.error("Room is full:", data);
                alert("Room is full. Please try joining another room.");
                window.location.href = "/";
            }
            else if (data.isData === "game-started") {
                console.log("Game started:", data);
                setIsGameStarted(true);
                setYourId(data.yourId);
                setCheats(data.cheats);
                setActivePlayerId(data.startingPlayerId);
                setRound(data.round);
                setPickCard(data.pickCard);
                setPlayers(data.players);
                setTotalMembers(data.totalMembers);
                setWinnerList([])
            }
            else if (data.isData === "round-end") {
                console.log("Round ended:", data);
                setIsGameStarted(data.isGameStarted || false);
                setRound(data.round || 1);
                setYourId(data.yourId || null);
                setTotalMembers(data.totalMembers || 0);
                setWinnerList(data.winnersList || []);
                alert(data.message || "Round ended. No winner this time.");

            }
            else if (data.isData === "rank-update") {
                console.log("Winner's iddd:", data.winnerId, typeof data.winnerId);
                console.log("Your iddd:", data.yourId, typeof data.yourId);


                if (Number(data.winnerId) === Number(data.yourId)) {
                    console.log
                    alert(`Congratulations! You got Rank: ${data.rank}`);
                   
                } else {
                    alert(data.message);
                }

                return;
            }
            else if (data.isData === "pass-cheat") {
                console.log("Cheat passed:", data);
                setCheats(data.cheats || []);
                setActivePlayerId(data.activePlayerId || null);
                setYourId(data.yourId || null);
                setIsGameStarted(data.isGameStarted || false);
                setRound(data.round || 1);
                setPickCard(data.pickCard || null);
                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers || 0);
                console.log("After cheat passed:", data)
            }

        });

        socketRef.current.addEventListener("error", (err) => {
            console.error("WebSocket error:", err);
        });


    }, []);

    const startTheGame = () => {
        console.log("Starting the game...");
        const newRound = globalRound + 1;
        setGlobalRound(newRound); // set state
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "start-game",
                roomId: roomId,
                round: newRound, // send the correct new value
            }));
        } else {
            console.warn("WebSocket not open yet!");
        }
    };

    const checkFourCheats = (finalList) => {
        if (finalList.length !== 4) return false;

        const firstCheat = finalList[0];
        return finalList.every(cheat => cheat === firstCheat);
    };


    const cheatPassed = (passCheat, yourId, finalList) => {
        console.log("Cheat passed:", passCheat);

        const isWinner = checkFourCheats(finalList);
        console.log("Is winner:", isWinner);

        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "pass-cheat",
                roomId: roomId,
                passCheat: passCheat,
                yourId: yourId,
                finalList: finalList,
                isWinner: isWinner
            }));
        } else {
            console.warn("WebSocket not open yet!");
        }
    };

    const activeUserIsWinner = (tempyourId) => {
        console.log("Active User Id is:", yourId);

        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "active-winner",
                roomId: roomId,
                yourId: tempyourId,

            }));
        } else {
            console.warn("WebSocket not open yet!");
        }
    }



    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
            if (window.confirm("Are you sure you want to leave? Your game progress will be lost.")) {
                alert("You have left the game. Please refresh the page to join again.");
            }

        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="join-room">
            <div className="room-id">Room: {roomId}</div>
            <div className="members-status">Members: {players.length}/{totalMembers}</div>
            <div className="game-start">
                {isGameStarted ? (
                    <div>🟢online</div>
                ) : (
                    <div>🔴offline</div>
                )}
            </div>
            <PlayGround
                userData={details.state}
                setallplayers={players}
                totalMembers={totalMembers}
                socket={socketRef.current}
                round={round}
                setallCheats={cheats}
                urId={yourId}
                activeUserIsWinner={activeUserIsWinner}
                checkFourCheats={checkFourCheats}
                pickCard={pickCard}
          
                cheatPassed={cheatPassed}
                winnerList={winnerList}
                activePlayerId={activePlayerId}
                isGameStarted={isGameStarted}
                startTheGame={startTheGame}
            />
        </div>
    );
}
