import React, { useState, useEffect } from 'react';
import './css/PlayGround.css';


function PlayGround({ userData, setallplayers, round, isGameStarted, urId, totalMembers, startTheGame, setallCheats, cheatPassed, activePlayerId, pickCard, winnerList, checkFourCheats, activeUserIsWinner }) {
    const [players, setPlayers] = useState([]);
    const [winners, setWinners] = useState([]);
    const [yourId, setYourId] = useState(null);
    const [roundNumber, setRoundNumber] = useState(round);
    const [isGameStartedState, setIsGameStartedState] = useState(isGameStarted);
    const [pickedCheat, setPickedCheat] = useState('No Card');
    const [cheats, setCheats] = useState();
    const [nextPlayer, setNextPlayer] = useState("");
    const [timeLeft, setTimeLeft] = useState(98);




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
            console.log("🏆 Checking if you're the winner...", {
                round,
                pickedCheat,
                cheats
            });

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

        console.log("Current Player:", yourId);

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
        <div className="playground">
            <div className="app">
                <div className="header">
                    PaperCheats.io
                    <div className='exit-room' onClick={() => {
                        window.location.href = '/'; // Redirect to home
                    }}>❌</div>
                    <div className='round-number'>Round: {roundNumber}</div>
                </div>
                <div className="container">
                    <div className="sidebar">
                        {players.map((p, i) => (
                            <div className="player" key={i} style={{ backgroundColor: p.active === 'cheat' ? '#f1f6bd' : '#ffffff' }}>
                                <span className="player_info">
                                    <span className='player_name'>
                                        <span>{`#${i + 1}`}</span>
                                        <span>{p.avatar}</span>
                                        <span>{p.name}</span>
                                    </span>
                                    <span>{p.points} points</span>
                                </span>
                            </div>
                        ))}
                    </div>
                    {isGameStartedState ? (
                        <div className="round-info">

                            <div className="game-area">

                                {players[yourId - 1].rank !== -1 ? (
                                    <div>Tu jit gaya hai Shant bat<br />Teri Rank hai: {players[yourId - 1].rank}</div>
                                ) : (
                                    <div>here Ranker:{players[yourId - 1].rank}
                                        <div className='picked-boxoutline'>
                                            {pickedCheat === 'No Card' ? (
                                                null
                                            ) : (

                                                <div
                                                    className="picked-box"
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, 'picked')}
                                                    onDrop={(e) => onDrop(e, null)}  // Accepts drop from cheat-card
                                                    onDragOver={onDragOver}
                                                >
                                                    {pickedCheat}
                                                </div>
                                            )}

                                        </div>

                                        <button className="pass-button" onClick={passCardtoNext}>
                                            Pass to ({nextPlayer})
                                        </button>
                                        <div className="timer">{`0${Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)} minute remaining`}</div>
                                    </div>
                                )}
                                <hr className="divider" />
                                <div className="cheat-row">
                                    {cheats.map((c, i) => {
                                        // Other players or the first card: render normally
                                        return (
                                            <div
                                                className="cheat-card"
                                                key={i}
                                                onDrop={(e) => onDrop(e, i)}
                                                onDragOver={onDragOver}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, 'cheat', i)}
                                            >
                                                {c}
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    )
                        : (
                            yourId === 1 ? (
                                <div className="waiting-room">
                                    <button className="start-game-button" onClick={startTheGame}>Start Game</button>
                                    {winners.length > 0 ? (
                                        winners.map((winner, index) => (
                                            <p key={index} className="winner-message">
                                                Rank {winner.rank} : {winner.name} - {winner.id}<br />
                                                Points : {winner.points}
                                            </p>
                                        ))
                                    ) : (null)}
                                </div>
                            ) : (
                                <div className="waiting-room">
                                    <h2>Waiting for host to<br />start the game...</h2>

                                    {winners.length > 0 ? (
                                        winners.map((winner, index) => (
                                            <p key={index} className="winner-message">
                                                Rank {winner.rank} : {winner.name} - {winner.id}
                                                Points : {winner.points}
                                            </p>
                                        ))
                                    ) : (
                                        <div>
                                            <p>Round: {roundNumber}</p>
                                            <p>Members: {players.length}/{totalMembers}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                </div>
            </div>
        </div >

    );
}

export default PlayGround;
