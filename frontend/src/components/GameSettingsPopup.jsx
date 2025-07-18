import React from 'react';
// import { ToastContainer, toast } from 'react-toastify';
import toast, { Toaster } from 'react-hot-toast';

export default function GameSettingsPopup({
  roomId, showPopup, anonymousChat, hideCheat, numRounds, numPlayers,
  setShowPopup, setAnonymousChat, setHideCheat, setNumRounds, setNumPlayers, generateRoomName,
  createPrivateRoom
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId);
    notify("Room ID copied!");
  };

  const notify = (message) => toast(`✅${message}`);

  const numberChanger = (value, setter, min, max) => {
    const newVal = value + 1 > max ? min : value + 1;
    setter(newVal);
  };

  const numberDecreaser = (value, setter, min, max) => {
    const newVal = value - 1 < min ? max : value - 1;
    setter(newVal);
  };

  return (
    <>
    <Toaster />
      {showPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-xl py-4 px-6 w-full max-w-md shadow-lg">
            <div className='flex justify-between border-b-[1px] border-black mb-4 px-2 pb-2'>
              <h2 className="text-2xl font-bold text-center">Game Settings</h2>
              <button onClick={() => setShowPopup(false)}>❌</button>
            </div>

            {/* Room ID */}
            <div className="mb-4">
              <label className="block font-medium">Room ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomId}
                  readOnly
                  className="border font-bold border-gray-300 rounded px-2 py-1 flex-1"
                />
                <button onClick={generateRoomName}>♻️</button>
                <button onClick={handleCopy} className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700">
                  Copy
                </button>
              </div>
            </div>

            {/* Anonymous Chat */}
            <div className="mb-4 flex justify-between items-center">
              <label className="font-medium">Anonymous Chat</label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={anonymousChat}
                  onChange={(e) => setAnonymousChat(e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border 
                after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Hide Cheat */}
            <div className="mb-4 flex justify-between items-center">
              <label className="font-medium">Hide Cheat Button</label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={hideCheat}
                  onChange={(e) => setHideCheat(e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border 
                after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Number of Rounds */}
            <div className="mb-4 flex items-center justify-between">
              <label className="font-medium text-black">Number of Rounds</label>
              <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                <button
                  onClick={() => numberDecreaser(numRounds, setNumRounds, 1, 20)}
                  className="text-xl font-bold"
                >
                  ◀
                </button>
                <span className="font-bold text-lg">{numRounds}</span>
                <button
                  onClick={() => numberChanger(numRounds, setNumRounds, 1, 20)}
                  className="text-xl font-bold"
                >
                  ▶
                </button>
              </div>
            </div>


            {/* Number of Players */}
            <div className="mb-4 flex items-center justify-between ">
              <label className="font-medium text-black">Number of Players (4 – 15)</label>
              <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full shadow-inner ">
                <button
                  onClick={() => numberDecreaser(numPlayers, setNumPlayers, 4, 15)}
                  className="text-xl font-bold"
                >
                  ◀
                </button>
                <span className="font-bold text-lg ">{numPlayers}</span>
                <button
                  onClick={() => numberChanger(numPlayers, setNumPlayers, 4, 15)}
                  className="text-xl font-bold"
                >
                  ▶
                </button>
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={createPrivateRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
