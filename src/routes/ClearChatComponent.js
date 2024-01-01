import React, { useState } from 'react';
import io from 'socket.io-client';

const ClearChatComponent = () => {
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleClearChat = (e) => {
        e.preventDefault();

        const socket = io.connect('http://52.151.248.228:8080/');

        // Emit an event to the server with the entered password
        socket.emit('clear_chat', { password });

        // Assume the server will respond with a success or error message
        socket.on('clear_chat_response', ({ success, message }) => {
            if (success) {
                setSuccessMessage(message);
            } else {
                setErrorMessage(message);
            }
        });
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3>Clear Chat History</h3>
            <form onSubmit={handleClearChat}>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default ClearChatComponent;
