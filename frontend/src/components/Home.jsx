import React from "react";
import "./css/Home.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
    const avatars = [
        "👨‍💻", "👩‍💻", "👨‍🎤",
        "👩‍🎨", "👨‍🚀",
    ];

    const navigate = useNavigate();

    const characterFaces = ["😡", "😐", "😄", "🤔", "😎"];
    const [username, setUsername] = React.useState("");
    const [userSetEmoji, setUserSetEmoji] = React.useState("😈");
    const [currentFaceIndex, setCurrentFaceIndex] = React.useState(0);
    // const [createRoomName, setCreateRoomName] = React.useState(null);


    useEffect(()=>{
        const tempname = localStorage.getItem("username")
        if(tempname){
           setUsername(tempname) 
        }
    },[])

    const generateRoomName = () => {
        const randomString = Math.random().toString(36).substring(2, 8);
        console.log(randomString);
        return `room-${randomString}`;
    }

    const createPrivateRoom = () => {
        const userData = {
            name: username,
            face: userSetEmoji,
            totalMembers: 10,
            type:"host",
        };
        localStorage.setItem("username",username)
        if (username === "") {
            alert("Please enter a valid username.");
            return;
        }

        
        const roomName = generateRoomName();
        const tempMemberCount = window.prompt(`Room Name is :${roomName}\n Enter the member count (2-10):`);   
        
        if (tempMemberCount < 4 || tempMemberCount > 10) {
            alert("Please enter a valid number of members (between 4 and 10).");
            return;
        }
        else{
            
            userData.totalMembers = tempMemberCount;
            alert("Room created successfully! \n Room Name: " + roomName + "\n Member Count: " + tempMemberCount);
            navigate(`${roomName}`, { state: userData });
        }
    }

    const joinPrivateRoom = () => {
        const userData = {
            name: username,
            face: userSetEmoji,
            type:"member",
        };
        localStorage.setItem("username",username)
         if (username === "") {
            alert("Please enter a valid username.");
            return;
        }
        const joinRoomName = window.prompt("Enter the room name you want to join:");



        if ((!(joinRoomName===null))) {
        navigate(`${joinRoomName}`, { state: userData });
        }
          
        else {
            alert("Please enter a valid room name and username.");
        }

    }

    return (
        <div className="home-container">
            {/* <div className="home-background"></div> */}

            {/* Header */}
            <div className="home-header">
                <h1 className="home-logo">
                    <span className="text-red-500">P</span>
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
                </h1>

                <div className="avatar-row">
                    {avatars.map((cls, i) => (
                        <div key={i} className="avatar-dot">{cls}</div>
                    ))}
                </div>
            </div>

            {/* Form & Avatar */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="input-name"
                />

                <div className="character-wrapper">
                    <div
                        className="character-button"
                        onClick={() => {
                            let newIndex = (currentFaceIndex - 1 + characterFaces.length) % characterFaces.length;
                            setCurrentFaceIndex(newIndex);
                            setUserSetEmoji(characterFaces[newIndex]);
                        }}
                    >
                        ⬅️
                    </div>
                    <div className="character-face">{userSetEmoji}</div>
                    <div
                        className="character-button"
                        onClick={() => {
                            let newIndex = (currentFaceIndex + 1) % characterFaces.length;
                            setCurrentFaceIndex(newIndex);
                            setUserSetEmoji(characterFaces[newIndex]);
                        }
                        }
                    >
                        ➡️
                    </div>
                </div>

                <div className="buttons-wrapper">
                    {/* <div className="custom-button play-button">Play!</div> */}
                    <div className="custom-button create-button" onClick={createPrivateRoom}>Create Private Room</div>
                    <div className="custom-button join-button" onClick={joinPrivateRoom}>Join Private Room</div>
                </div>
            </div>
        </div>
    );
}
