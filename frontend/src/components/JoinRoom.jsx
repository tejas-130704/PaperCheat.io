import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PlayGround from "./PlayGround";
import { ToastContainer, toast } from 'react-toastify';
import AlertDialogSlide from "./AlertDialogSlide";
import WinnerCelebration from "./WinnerCelebration";

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
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [cheats, setCheats] = useState([]);
    const [nxtAnonymousChat, setNxtAnonymousChat] = useState(false)
    const [nxtHideCheat, setNxtHideCheat] = useState(false)
    const [globalTotalRound, setGlobalTotalRound] = useState(1)
    const [pickCard, setPickCard] = useState(null);
    const [winnerCelebrationWindow, setwinnerCelebrationWindow] = useState(false)
    const [activePlayerId, setActivePlayerId] = useState(null);
    const [chatSectionChat, setChatSectionChat] = useState({
        type: "",
        username: "",
        senderid: -1,
        message: ""
    })
    const [globalRound, setGlobalRound] = useState(0);

    const notify = (message) => toast(`${message}`);

    useEffect(() => {
        setNxtAnonymousChat(details.state.anonymousChat)
        setNxtHideCheat(details.state.hideCheat)
        setGlobalTotalRound(details.state.numRounds)
        console.log("Use Effect Join Room Nxt data:", details.state.anonymousChat, details.state.hideCheat, details.state.numRounds)
    }, [])

    useEffect(() => {
        socketRef.current = new WebSocket('wss://b56abca24cfa.ngrok-free.app');

        socketRef.current.addEventListener('open', () => {


            const payload = {
                roomId,
                userName: details.state.name,
                emoji: details.state.face,
                type: details.state.type === "host" ? "room-create" : "room-join",
                ...(details.state.type === "host" ? {
                    memeberCount: details.state.totalMembers,
                    totalRounds: details.state.numRounds,
                    nxtAnonymousChat: details.state.anonymousChat,
                    nxtHideCheat: details.state.hideCheat,
                } : {})
            };


            // ✅ Double check before sending
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(payload));
            } else {
                console.warn("WebSocket not open yet!");
            }
        });

        socketRef.current.addEventListener("message", (event) => {

            // console.log("Message from server:", event.data);
            const data = JSON.parse(event.data);
            console.log("Data from server:", data)

            if (data.isData === "room-created") {

                if (Array.isArray(data.players) && data.players.length > 0) {
                    data.players[0].me = 2; // host
                }
                setPlayers(data.players || []);
                setRound(data.round || 1);
                setYourId(1)
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);


            }
            else if (data.isData === "warning") {
                console.error("Warning :", data);
                toast.warning(`${data.error}`, {
                    position: "top-right",
                    autoClose: 2000,
                    style: {
                        fontSize: "14px",
                    }
                });
                setPlayers(data.players || []);
                setRound(data.round || 1);
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);
                setYourId(data.yourId || null);
            }
            else if (data.isData === "error") {
                console.error();
                toast.error(`Error from server: ${data.error}`, {
                    position: "top-right",
                    autoClose: 2000,
                    style: {
                        fontSize: "14px",
                    }
                });

                // Wait for 2.5 seconds before redirecting
                setTimeout(() => {
                    window.location.href = "/";
                }, 2500); // 2500ms = 2.5 seconds
            } else if (data.isData === "room-join") {

                const index = (data.yourId || 1) - 1;
                if (data.players[index]) {
                    data.players[index].me = 1;
                }

                setPlayers(data.players || []);
                setRound(data.round || 1);
                setIsGameStarted(data.isGameStarted || false);
                setTotalMembers(data.totalMembers);
                setYourId(data.yourId || null);
                setNxtAnonymousChat(data.AnonymousChat || false);
                setNxtHideCheat(data.HideCheat || false)
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

                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers);
                setIsGameStarted(data.isGameStarted);
                setYourId(data.yourId || null);
                setRound(data.round);
                setNxtAnonymousChat(data.AnonymousChat)
                setNxtHideCheat(data.HideCheat)
                setGlobalTotalRound(data.totalRounds)
            }
            else if (data.isData === "room-already-created") {
                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers);
                setIsGameStarted(data.isGameStarted);
                setRound(data.round);
                setYourId(data.yourId || null);
                setGlobalTotalRound(data.totalRounds || 3);
            }
            else if (data.isData === "room-full") {
                // console.error("Room is full:", data);
                toast.error("Room is full. Please try joining another room.", {
                    position: "top-center",
                    autoClose: 2000,
                    style: {
                        fontSize: "14px",
                        background: "#333",
                        color: "#fff"
                    }
                });
                setTimeout(() => {
                    window.location.href = "/";
                }, 2500);
            }
            else if (data.isData === "game-started") {

                setIsGameStarted(true);
                setYourId(data.yourId);
                setCheats(data.cheats);
                setActivePlayerId(data.startingPlayerId);
                setRound(data.round);
                setPickCard(data.pickCard);
                setPlayers(data.players);
                setTotalMembers(data.totalMembers);
                setWinnerList([])
                setNxtAnonymousChat(data.AnonymousChat)
                setNxtHideCheat(data.HideCheat)
                setGlobalTotalRound(data.totalRounds)
            }
            else if (data.isData === "round-end") {

                setIsGameStarted(data.isGameStarted || false);
                setRound(data.round || 1);
                setPlayers(data.players)
                setYourId(data.yourId || null);
                setTotalMembers(data.totalMembers || 0);
                setWinnerList(data.winnersList || []);
                alert(data.message || "Round ended. No winner this time.");

                if (data.gameOver) {
                    //205
                    setwinnerCelebrationWindow(true)
                }

            }
            else if (data.isData === "rank-update") {


                if (Number(data.winnerId) === Number(data.yourId)) {

                    notify(`🎊 Congratulations 😎!\n You got Rank : 👑${data.rank} 🎉`)

                    // alert();

                } else {
                    notify(`🎊 ${data.message} 🎉`);
                }

                return;
            }
            else if (data.isData === "pass-cheat") {

                setCheats(data.cheats || []);
                setActivePlayerId(data.activePlayerId || null);
                setYourId(data.yourId || null);
                setIsGameStarted(data.isGameStarted || false);
                setRound(data.round || 1);
                setPickCard(data.pickCard || null);
                setPlayers(data.players || []);
                setTotalMembers(data.totalMembers || 0);

            }
            else if (data.isData === "player-disconnect") {
                console.log("Disconnect details:", data);
                setPlayers(data.players); // Update local state
                setTotalMembers(data.totalMembers)
                setYourId(data.yourId)
                setIsGameStarted(data.isGameStarted)

                if (data.isGameStarted === true) {
                    console.log("Inside The game start block")
                    setDialogMessage(data.message);
                    setIsOpenDialog(true);
                    return;
                }
                else {
                    console.log("Game start:", data.isGameStarted, " isOpenDialog:", isOpenDialog)
                }

                setChatSectionChat({
                    type: "player-disconnect",
                    message: data.message,
                    color: "red",
                })
            }

            else if (data.isData === "send-message") {
                console.log(data)
                if (data.type === "room-notification") {
                    setChatSectionChat({
                        type: data.type,
                        playerId: data.playerId,
                        message: data.message,
                        color: "orange",
                    })
                } else {

                    setChatSectionChat({
                        type: data.type,
                        username: data.type === "chat" ? data.username : "",
                        senderid: data.type === "chat" ? data.senderId : -1,
                        message: data.message
                    })
                }
            }

        });

        socketRef.current.addEventListener("error", (err) => {
            console.error("WebSocket error:", err);
        });


    }, []);

    const startTheGame = () => {
        console.log("Starting the game...");
        if (players.length >= 4) {

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
        } else {
            toast.error("Not enough players to start. Minimum 4 required.", {
                position: "top-right",
                autoClose: 2000,
                style: {
                    fontSize: "14px",
                    background: "#333",
                    color: "#fff"
                }
            });
        }
    };

    const checkFourCheats = (finalList) => {
        if (finalList.length !== 4) return false;

        const firstCheat = finalList[0];
        return finalList.every(cheat => cheat === firstCheat);
    };


    const cheatPassed = (passCheat, yourId, finalList) => {


        const isWinner = checkFourCheats(finalList);


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
                window.location.href = "/"
            }


        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const sendMessage = (message, isAnonymous) => {
        console.log("Sender id:", yourId)
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "send-message",
                roomId: roomId,
                yourId: yourId,
                message: message,
                isAnonymous: isAnonymous,

            }));
        } else {
            console.warn("WebSocket not open yet!");
            toast.error("You are Disconnected ! Restart the Game");
        }
    };
    const gameRestart = () => {
        //200
        setIsGameStarted(false);
        setPickCard("No Card");
        setWinnerList([]);
        setGlobalRound(0);
        setActivePlayerId(-1);
        setCheats([]);
        setIsOpenDialog(false);
    }

    return (
        <div className="relative top-0 join-room min-h-screen w-[100vw] flex flex-col  bg-[#1e3a8a] text-white items-center justify-start gap-2 overflow-hidden">
            <ToastContainer />
            <WinnerCelebration
                winnerCelebrationWindow={winnerCelebrationWindow}
                players={players}
                yourId={yourId}
            />
            <AlertDialogSlide
                setIsOpenDialog={setIsOpenDialog}
                gameRestart={gameRestart}
                dialogMessage={dialogMessage}
                isOpenDialog={isOpenDialog}
            />
            <div className="w-[99vw] flex flex-row justify-between px-10 items-baseline mb-4">

                <div className="text-2xl font-bold mb-2 ">Room: <span className="text-yellow-300">{roomId}</span></div>

                <div className="text-xl bg-blue-900 px-4 py-2 rounded-xl shadow-md">
                    Members: <span className="font-semibold text-green-300">{players.length}</span>/<span className="text-gray-200">{totalMembers}</span>
                </div>

                <div className="text-xl mt-2">
                    {isGameStarted ? (
                        <div className="flex items-center gap-2">
                            <span className="text-green-400 animate-pulse">🟢 Online</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 animate-pulse">🔴 Offline</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto ">
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
                    sendMessage={sendMessage}
                    chatSectionChat={chatSectionChat}
                    cheatPassed={cheatPassed}
                    winnerList={winnerList}
                    activePlayerId={activePlayerId}
                    isGameStarted={isGameStarted}
                    startTheGame={startTheGame}
                    nxtAnonymousChat={nxtAnonymousChat}
                    nxtHideCheat={nxtHideCheat}
                    globalTotalRound={globalTotalRound}

                />
            </div>
        </div>

    );
}
