import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function WinnerCelebration({ winnerCelebrationWindow, players, yourId }) {
    const [isWinner, setIsWinner] = useState(false);
    const [winnerList, setWinnerList] = useState({ first: [], second: [], third: [] });

    useEffect(() => {
        if (!winnerCelebrationWindow || !players?.length) return;

        const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
        const winnerMap = { first: [], second: [], third: [] };

        let firstScore = sortedPlayers[0]?.points ?? -1;
        let secondScore = -1;
        let thirdScore = -1;

        for (let player of sortedPlayers) {
            if (player.points === firstScore) {
                winnerMap.first.push(player);
            } else if (secondScore === -1 || player.points === secondScore) {
                secondScore = player.points;
                winnerMap.second.push(player);
            } else if (thirdScore === -1 || player.points === thirdScore) {
                thirdScore = player.points;
                winnerMap.third.push(player);
            }

            if (winnerMap.third.length > 0) break;
        }

        setWinnerList(winnerMap);
        setIsWinner(true);
    }, [winnerCelebrationWindow]);

    return (
        <div>
            {isWinner && (
                <div className="w-screen h-screen absolute top-0 left-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
                    <Confetti width={window.innerWidth} height={window.innerHeight} />

                    <div className="relative bg-black bg-opacity-60 rounded-2xl p-10 max-w-[80vw] w-[600px] text-center text-white shadow-2xl animate-scale-up overflow-hidden">
                        {/* Glow Border */}
                        <div className="absolute inset-0 rounded-2xl border-4 border-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-40 blur-2xl z-[-1]"></div>
                        <div>

                            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-6 animate-pulse">
                                🎉 Winners Circle 🎉
                            </h2>
                            <button className='absolute top-1 right-1 z-10 w-[40px] h-[40px] rounded-full  cursor-pointer  shadow' onClick={()=>{
                                window.location.href="/";
                            }}>❌</button>
                        </div>

                        {winnerList.first.length > 0 && (
                            <div className="mb-8">
                                <div className="text-2xl font-bold text-yellow-400 drop-shadow-md mb-1 animate-bounce">🥇 1st Place</div>
                                {winnerList.first.map((p, i) => (
                                    <div className="font-semibold text-white/90" key={`f-${i}`}>
                                        {p.id === yourId ? "You" : p.name} ({p.points} pts)
                                    </div>
                                ))}
                            </div>
                        )}

                        {winnerList.second.length > 0 && (
                            <div className="mt-4 mb-8">
                                <div className="text-xl font-semibold text-slate-300 drop-shadow-sm">🥈 2nd Place</div>
                                {winnerList.second.map((p, i) => (

                                    <div className="font-semibold text-white/80" key={`f-${i}`}>
                                        {p.id === yourId ? "You" : p.name} ({p.points} pts)
                                    </div>

                                ))}
                            </div>
                        )}

                        {winnerList.third.length > 0 && (
                            <div className="mt-4">
                                <div className="text-lg font-medium text-orange-400 ">🥉 3rd Place</div>
                                {winnerList.third.map((p, i) => (
                                    <div className="font-semibold text-white/70" key={`f-${i}`}>
                                        {p.id === yourId ? "You" : p.name} ({p.points} pts)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
