import React, { useEffect, useState, useRef } from 'react';
import './css/ChatSection.css';
const ChatSection = ({ chatSectionChat, sendMessage, yourId, nxtAnonymousChat }) => {
    const [chats, setChats] = useState([]);
    const bottomRef = useRef(null);
    const [hiddenBar, setHiddenBar] = useState(false)

    useEffect(() => {
        if (!chatSectionChat || !chatSectionChat.message) return;

        setChats(prev => [
            ...prev,
            {
                type: chatSectionChat.type,
                username: chatSectionChat.username,
                senderid: chatSectionChat.senderid,
                message: chatSectionChat.message
            }
        ]);
    }, [chatSectionChat]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chats]);


    const [message, setMessage] = useState("");
    const [anonymousChat, setAnonymousChat] = useState(false)

    const sendBroadcastMessage = () => {
        if (message.trim() !== "") {
            sendMessage(message, anonymousChat);
            setMessage(""); // Clear input after sending
        }
    };

    return (
        <div className="chat-section">
            <div className="chat-header">Chat Section</div>

            <div className="chat-box">
                {chats.length > 0 ? (
                    chats.map((chat, index) => (
                        <p key={index} className="message-list">
                            {chat.type === "notification" ? (
                                <span className="join chat-notification text-blue-600">{chat.message}</span>
                            ) : chat.type === "room-notification" ? (
                                <span className="chat-notification text-green-500">{chat.message}</span>
                            ) : chat.type === "player-disconnect" ? (
                                <span className="chat-notification text-red-600">{chat.message}</span>
                            ) : (
                                <span className="chat-player">
                                    <strong>{chat.senderid === yourId ? "You" : chat.username}:</strong> {chat.message}
                                </span>
                            )}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic text-center mt-4">No messages yet</p>
                )}

                <div ref={bottomRef} />
            </div>


            <div className="relative input-section">
                {nxtAnonymousChat && (
                    <div className='h-full flex items-center ml-2'>
                        <button
                            className="h-[30px] w-[30px] bg-gray-800 text-white  rounded-full  shadow-md hover:bg-gray-700 transition duration-300 items-center"
                            onClick={() => setHiddenBar((p) => !p)}
                            title="Toggle Anonymous Options"
                        >
                            🗿
                        </button>

                        {hiddenBar && (
                            <div className="absolute bottom-full mb-2 left-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-72">
                                <div className="flex justify-between items-center">
                                    <label className="text-gray-700 font-semibold">Anonymous Chat</label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={anonymousChat}
                                            onChange={(e) => setAnonymousChat(e.target.checked)}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 
              peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border 
              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendBroadcastMessage();
                    }}
                    className="chat-input pl-12"
                    placeholder="Type your message..."
                />
                <button
                    className="send-button bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition duration-300"
                    onClick={sendBroadcastMessage}
                >
                    ▶️
                </button>
            </div>
        </div>

    );
};

export default ChatSection;
