import React from 'react'

const ChatSection = () => {
    return (
        <div>
            <div className="chat-section">
                <div className="chat-header">Chat Section</div>
                <div className="chat-box">
                    <p><span className="join">wash joined the room!</span></p>
                    <p><span className="left">wash left the room!</span></p>
                    <p><strong>SliceMe:</strong> sudoku</p>
                    <p><strong>SliceMe:</strong> cobblestone</p>
                    <p><strong>HiGuys:</strong> Protect</p>
                    <p className="guessed">Zerox guessed the word!</p>
                    <p><strong>stell:</strong> aw shit</p>
                    <p className="guessed">HiGuys guessed the word!</p>
                    <p className="join">anvil joined the room!</p>
                    <p className="left">anvil left the room!</p>
                    <p><strong>SliceMe:</strong> i dunno</p>
                    <p><strong>stell:</strong> me neither ive fallen off</p>
                </div>
                <input type="text" className="chat-input" placeholder="Type your guess here..." />
            </div>
        </div>
    )
}

export default ChatSection