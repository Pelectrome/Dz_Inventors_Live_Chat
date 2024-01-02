// ChatComponent.jsx

import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import './ChatComponent.css';

const ChatComponent = () => {
    const [socket, setSocket] = useState(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const [onlineClientsCount, setOnlineClientsCount] = useState(0);
    const [messagesCount, setMessagesCount] = useState(0);
    const [userName, setUserName] = useState('');
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const notificationSoundRef = useRef(null);
    const domain = window.location.hostname;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const newSocket = io.connect(`http://${domain}:8080/`);

        console.log('Attempting to connect to server');

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.connected);
            newSocket.emit('my event', { data: 'User Connected' });
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            socket.emit('my event', {
                data: 'User Connected',
            });
        };

        const handleMyResponse = (msg) => {
            if (msg.user_name !== userName + ':') {
                console.log('playing sound');
                notificationSoundRef.current.play();
            }

            if (typeof msg.user_name !== 'undefined') {
                setChatHistory((prevChatHistory) => [...prevChatHistory, msg]);

                if (autoScrollEnabled) {
                    autoScrollToBottom();
                }
            }
        };

        const handleOnlineClientsCount = (data) => {
            setOnlineClientsCount(data.count);
        };

        const handleMessagesCount = (data) => {
            setMessagesCount(data.count);
        };

        const handleRateLimitError = (data) => {
            alert(data.message);
        };

        const handleChatHistory = (data) => {
            setChatHistory(data.history);

            if (autoScrollEnabled) {
                autoScrollToBottom();
            }
        };

        const handleConnectedUsers = (data) => {
            setConnectedUsers(data.users);
        };

        socket.on('connect', handleConnect);
        socket.on('my response', handleMyResponse);
        socket.on('online_clients_count', handleOnlineClientsCount);
        socket.on('messages_count', handleMessagesCount);
        socket.on('chat_history', handleChatHistory);
        socket.on('rate_limit_error', handleRateLimitError);
        socket.on('connected_users', handleConnectedUsers);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('my response', handleMyResponse);
            socket.off('online_clients_count', handleOnlineClientsCount);
            socket.off('messages_count', handleMessagesCount);
            socket.off('chat_history', handleChatHistory);
            socket.off('rate_limit_error', handleRateLimitError);
            socket.off('connected_users', handleConnectedUsers);
        };
    }, [socket, userName, autoScrollEnabled]);

    const autoScrollToBottom = () => {
        const messageHolder = document.querySelector('.message_holder');
        messageHolder.scrollTop = messageHolder.scrollHeight;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (userInput.trim() !== '') {
            socket.emit('my event', {
                user_name: userName,
                message: userInput,
            });

            setUserInput('');
        } else {
            alert('Please enter a non-empty message.');
        }
    };

    return (
        <div className="chat-container">
            <button
                className="sidebar-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                ☰
            </button>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <p>Connected Users: {onlineClientsCount}</p>
                </div>
                <div className="sidebar-list">
                    <ul>
                        {connectedUsers.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="chat-content">
                <h3>DZ Inventors (Live Chat)</h3>
                <h1>Made by DZ Inventors team</h1>
                <div className="message_holder">
                    {chatHistory.map((msg, index) => (
                        <div key={index}>
                            <b style={{ color: '#000' }}>{msg.user_name}</b> {msg.message}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        className="username"
                        placeholder="User Name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="message"
                        placeholder="Messages"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <input type="submit" value="Send" />

                    <div className="container">
                        <div>
                            <label htmlFor="autoscroll">Auto Scroll</label>
                            <input
                                type="checkbox"
                                id="autoscroll"
                                checked={autoScrollEnabled}
                                onChange={() => setAutoScrollEnabled(!autoScrollEnabled)}
                            />
                        </div>
                        <div id="online-clients">
                            <p>Online Clients: {onlineClientsCount}</p>
                        </div>
                        <div id="messages_count">
                            <p>Messages: {messagesCount}</p>
                        </div>
                    </div>
                </form>
                <audio
                    ref={notificationSoundRef}
                    src="http://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3"
                    preload="auto"
                ></audio>
            </div>
        </div>
    );
};

export default ChatComponent;
