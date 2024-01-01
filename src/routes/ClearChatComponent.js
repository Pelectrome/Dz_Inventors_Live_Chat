import React, { useState } from 'react';
import io from 'socket.io-client';

const ClearChatComponent = () => {
    const [password, setPassword] = useState('');

    const handleClearChat = () => {
        const socket = io.connect('http://127.0.0.1:8080');
        // Emit an event to the server with the entered password
        socket.emit('clear_chat', { password });
    };

    return (
        <div>
            <h3>Clear Chat History</h3>
            <label>Password:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleClearChat}>Submit</button>
        </div>
    );
};

export default ClearChatComponent;
