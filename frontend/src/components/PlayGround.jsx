import React, { useState, useEffect } from 'react';
import './css/PlayGround.css';
import ChatSection from './ChatSection';


function PlayGround({ setallplayers, round, isGameStarted, urId, totalMembers, startTheGame, setallCheats, cheatPassed, activePlayerId, pickCard, winnerList, checkFourCheats, activeUserIsWinner, sendMessage, chatSectionChat,
    nxtAnonymousChat,
    nxtHideCheat,
    globalTotalRound
}) {
    const [players, setPlayers] = useState([]);
    const [winners, setWinners] = useState([]);
    const [yourId, setYourId] = useState(null);
    const [roundNumber, setRoundNumber] = useState(round);
    const [isGameStartedState, setIsGameStartedState] = useState(isGameStarted);
    const [pickedCheat, setPickedCheat] = useState('No Card');
    const [cheats, setCheats] = useState();
    const [nextPlayer, setNextPlayer] = useState("");
    const [timeLeft, setTimeLeft] = useState(98);
    const [isCheatHide, setisCheatHide] = useState(true)

   

    useEffect(() => {
        setPlayers(setallplayers);
        setYourId(urId);
        setWinners(winnerList);

        if (Array.isArray(setallCheats)) {
            setCheats(setallCheats);
        }

        setPickedCheat(pickCard);
        setRoundNumber(round);
        setIsGameStartedState(isGameStarted);


    }, [setallplayers, urId, setallCheats, pickCard, isGameStarted]);


    useEffect(() => {
        if (isGameStarted && players.length > 0 && yourId != null) {
            const nextIndex = yourId - 1;
            for (let i = 1; i <= players.length; i++) {
                const index = (i + nextIndex) % players.length;
                if (players[index].rank === -1) {
                    setNextPlayer(players[index].name);
                    break;
                }
            }
        }
    }, [isGameStarted, players.length, yourId, players.map(p => p.rank).join(',')]);

    useEffect(() => {
        if (
            isGameStarted &&
            pickedCheat !== 'No Card' &&
            players[yourId - 1].rank === -1 &&
            activePlayerId === yourId &&
            winnerList.length === 0
        ) {

            const tempFinal = [...cheats, pickedCheat];
            const isWinner = checkFourCheats(tempFinal);
            if (isWinner) {
                activeUserIsWinner(yourId);
            }
            // reset for next round
        }
    }, [
        pickedCheat,
        JSON.stringify(cheats),
        players.map(p => p.rank).join(','),
    ]);


    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const onDragStart = (e, type, index = null) => {
        const payload = JSON.stringify({ type, index });
        e.dataTransfer.setData('application/json', payload);
    };

    const onDrop = (e, targetIndex = null) => {
        const { type, index } = JSON.parse(e.dataTransfer.getData('application/json'));

        if (type === 'picked' && targetIndex !== null) {
            // Dropping pickedCheat into a cheat-card
            const newCheats = [...cheats];
            const temp = newCheats[targetIndex];
            newCheats[targetIndex] = pickedCheat;
            setPickedCheat(temp);
            setCheats(newCheats);
        } else if (type === 'cheat' && targetIndex !== null && index !== null) {
            // Swapping cheat-card with another cheat-card
            const newCheats = [...cheats];
            [newCheats[index], newCheats[targetIndex]] = [newCheats[targetIndex], newCheats[index]];
            setCheats(newCheats);
        } else if (type === 'cheat' && index !== null && targetIndex === null) {
            // Dropping cheat-card onto pickedCheat
            const newCheats = [...cheats];
            const temp = pickedCheat;
            setPickedCheat(newCheats[index]);
            newCheats[index] = temp;
            setCheats(newCheats);
        }
    };

    const passCardtoNext = () => {
        if (pickedCheat === "No Card") return;

        setTimeLeft(0);
        document.getElementsByClassName('picked-box')[0].style.display = 'none'; // Hide pick UI

        if (activePlayerId === yourId) {
            if (cheats.length >= 3) {
                cheatPassed(pickedCheat, yourId, cheats);
            } else {
                setCheats([...cheats, pickedCheat]); // ✅ Correct way to add to array    
                alert("Less cards to Forward");
            }
            setPickedCheat('No Card'); // Reset pickedCheat after passing
        }
    };


    const onDragOver = (e) => {
        e.preventDefault(); // Required to allow drop
    };

    return (
        <div className="playground w-[70vw] h-[60vh] flex mx-auto">
            {/* Game Area */}
            <div className="app flex flex-col w-[calc(100vw-300px)] h-full bg-[#1e3a8a] text-white relative">

                {/* Header */}
                <div className="header flex justify-between items-center bg-[rgba(255,0,0,0.5)] text-white px-6 py-3 text-xl font-bold">

                    <div >
                        <span className="text-red-400">P</span>
                        <span className="text-orange-400">a</span>
                        <span className="text-yellow-300">p</span>
                        <span className="text-green-400">e</span>
                        <span className="text-blue-400">r</span>
                        <span className="text-purple-400">C</span>
                        <span className="text-pink-400">h</span>
                        <span className="text-pink-300">e</span>
                        <span className="text-purple-300">a</span>
                        <span className="text-blue-300">t</span>
                        <span className="text-orange-300">.</span>
                        <span className="text-yellow-200">io</span>
                    </div>
                    <div className="round-number text-[15px] text-gray-300">Round: {roundNumber} of {globalTotalRound}</div>
                    <div
                        className="exit-room text-white bg-red-600 hover:bg-red-700 rounded-full px-3 py-1 cursor-pointer text-xl"
                        onClick={() => window.location.href = '/PaperCheatIO/'}
                    >
                        ❌
                    </div>
                </div>

                {/* Game Container */}
                <div className="container playground-main flex flex-1">

                    {/* Sidebar */}
                    <div className="sidebar bg-gray-200 text-black w-[180px] overflow-y-auto p-2">
                        {players.map((p, i) => (
                            <div
                                className={`player mb-2 p-2 rounded shadow text-xs ${p.id === yourId ? 'border-[1px]' : ""}`}
                                key={i}
                                style={{ backgroundColor: p.active === 'cheat' ? '#f1f6bd' : '#ffffff' }}
                            >
                                <span className="player_info flex flex-col gap-1">
                                    <span className="player_name font-bold flex gap-1">
                                        <span>{`#${i + 1}`}</span>
                                        <span>{p.avatar}</span>
                                        <span>{p.name}</span>
                                    </span>
                                    <span>{p.points} points</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Main Game Area */}
                    {isGameStartedState ? (
                        <div className="round-info flex-1">
                            <div className="game-area flex flex-col items-center justify-evenly bg-[#f1f6bd] h-full p-6 text-black">
                                {nxtHideCheat && (
                                    <button className='relative top-1 w-[20px] h-[20px] bg-black flex items-center justify-center -left-[200px] rounded-full p-4 cursor-pointer'
                                        onClick={() => { setisCheatHide((p) => !p) }}
                                    >
                                        {isCheatHide ? "👁️" : "🫣"}

                                    </button>
                                )}
                                {players[yourId - 1].rank !== -1 ? (
                                    <div className="text-center text-xl font-semibold">
                                        Tu jit gaya hai Shant bat<br />
                                        Teri Rank hai: {players[yourId - 1].rank}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Picked Card */}
                                        <div className="picked-boxoutline min-w-[85px] min-h-[110px] bg-[#f1f6bd] border-2 border-dotted border-black rounded-md p-2 flex items-center justify-center">

                                            {pickedCheat !== 'No Card' && (
                                                <div
                                                    className={`flip-card picked-box ${isCheatHide ? 'show-back' : ''}`}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, 'picked')}
                                                    onDrop={(e) => onDrop(e, null)}
                                                    onDragOver={onDragOver}
                                                >
                                                    <div className="flip-card-inner">
                                                        <div className="flip-card-front">🂠</div>
                                                        <div className="flip-card-back">
                                                            <p className="title">{pickedCheat}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        <button
                                            className="pass-button bg-black text-white px-4 py-2 rounded-full font-bold cursor-pointer"
                                            onClick={passCardtoNext}
                                        >
                                            Pass to ({nextPlayer})
                                        </button>

                                        {/* <div className="timer text-red-600 text-sm">
                                            {`0${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)} minute remaining`}
                                        </div> */}
                                    </div>
                                )}

                                <hr className="divider border-t border-black w-full my-2" />

                                <div className="cheat-row flex flex-wrap gap-3 justify-center w-full min-h-[60px] text-center ">
                                    {cheats.map((c, i) => (
                                        <div>
                                            {/* <div
                                                className="cheat-card bg-yellow-200 px-3 py-2 rounded shadow cursor-grab text-center text-sm min-w-[60px]"
                                                key={i}
                                                onDrop={(e) => onDrop(e, i)}
                                                onDragOver={onDragOver}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, 'cheat', i)}
                                            >
                                                {c}
                                            </div> */}
                                            <div
                                                className={`flip-card ${isCheatHide ? 'show-back' : ''}`}
                                                key={i}
                                                onDrop={(e) => onDrop(e, i)}
                                                onDragOver={onDragOver}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, 'cheat', i)}
                                            >
                                                <div className="flip-card-inner">
                                                    <div className="flip-card-front">🂠</div>
                                                    <div className="flip-card-back">
                                                        <p className="title">{c}</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Waiting Room
                        yourId === 1 ? (
                            <div className="waiting-room flex flex-col justify-center items-center min-w-[40vw] min-h-[60vh] bg-[#f1f6bd] text-gray-800">
                                <button
                                    className="start-game-button bg-black text-white px-6 py-2 rounded-full mb-4"
                                    onClick={startTheGame}
                                >
                                    Start Game
                                </button>
                                {winners.length > 0 && winners.map((winner, index) => (
                                    <p key={index} className="winner-message font-medium text-center">
                                        <strong>Rank {winner.rank}</strong> : #{winner.id} {winner.name}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <div className="waiting-room flex flex-col justify-center items-center min-w-[40vw] min-h-[60vh] bg-[#f1f6bd] text-gray-800">
                                <h2 className="text-center text-xl font-semibold mb-2">Waiting for host to<br />start the game...</h2>
                                {winners.length > 0 ? (
                                    winners.map((winner, index) => (
                                        <p key={index} className="winner-message font-medium text-center">
                                            <strong>Rank {winner.rank}</strong> : #{winner.id} {winner.name}
                                        </p>
                                    ))
                                ) : (
                                    <div className="text-center font-bold text-sm mt-2">
                                        <p>Round: {roundNumber}</p>
                                        <p>Members: {players.length}/{totalMembers}</p>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Chat Section */}
            <div className="cheat-section-out w-[300px] h-full bg-white border-l border-gray-400 shadow-lg">
                <ChatSection sendMessage={sendMessage} yourId={yourId} chatSectionChat={chatSectionChat} nxtAnonymousChat={nxtAnonymousChat} />
            </div>
        </div>


    );
}

export default PlayGround;
