from os import name
from flask import Flask, send_from_directory, redirect, url_for, request
from flask_socketio import SocketIO, rooms
import os
from flask_caching import Cache
import time


app = Flask(__name__)

app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
app.config['CACHE_TYPE'] = 'simple'  # You can use other cache types
cache = Cache(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Keep track of online clients
online_clients = 0

# Load chat history from local storage
chat_history = []

# Dictionary to store the count of incorrect attempts for each user
incorrect_attempts = {}

# Block duration in seconds (30 minutes)
block_duration = 30 * 60

""" @app.route('/clear_chat', methods=['GET'])
def clear_chat():
    global chat_history
    chat_history = []
    return redirect(url_for('index')) """

# Serve React App


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@socketio.on('clear_chat')
def handle_clear_chat(data):
    # Replace 'your_password' with the actual password
    if data.get('password') == 'your_password':
        global chat_history
        chat_history = []
        send_messages_count()  # Notify clients about the cleared chat history


@socketio.on('clear_chat')
def handle_clear_chat(data):
    user_ip = request.environ.get('REMOTE_ADDR')
    user_attempts_key = f'attempts_{user_ip}'

    # Check if the user is blocked
    if cache.get(user_attempts_key) == 'blocked':
        socketio.emit('clear_chat_response', {
                      'success': False, 'message': 'Blocked for 30 minutes'}, namespace='/')
        return

    # Check if the password is correct
    if data.get('password') == 'your_password':
        global chat_history
        chat_history = []
        send_messages_count()  # Notify clients about the cleared chat history
        # Reset incorrect attempts for the user
        cache.set(user_attempts_key, 0, timeout=block_duration)
        socketio.emit('clear_chat_response', {
                      'success': True, 'message': 'Chat is Cleared now'}, namespace='/')
    else:
        # Increment the incorrect attempts for the user
        attempts = cache.get(user_attempts_key) or 0
        attempts += 1
        cache.set(user_attempts_key, attempts, timeout=block_duration)

        # If the user reaches 5 incorrect attempts, block for 30 minutes
        if attempts == 5:
            cache.set(user_attempts_key, 'blocked', timeout=block_duration)
            socketio.emit('clear_chat_response', {
                          'success': False, 'message': 'Blocked for 30 minutes'}, namespace='/')
        else:
            socketio.emit('clear_chat_response', {
                          'success': False, 'message': 'Incorrect password'}, namespace='/')


def send_online_clients_count():
    socketio.emit('online_clients_count', {
                  'count': online_clients}, namespace='/')


def send_messages_count():
    socketio.emit('messages_count', {'count': len(
        chat_history)}, namespace='/')


@socketio.on('connect')
def handle_connect():
    global online_clients
    online_clients += 1
    send_online_clients_count()
    send_messages_count()

    # Send chat history to the newly connected client
    socketio.emit('chat_history', {
                  'history': chat_history}, namespace='/', room=request.sid)


@socketio.on('disconnect')
def handle_disconnect():
    global online_clients
    online_clients -= 1
    send_online_clients_count()


@socketio.on('my event')
def handle_my_custom_event(json):
    global chat_history
    print('received my event: ' + str(json))

    # Access the client's IP address from the request object
    client_ip = request.environ.get('REMOTE_ADDR')
    print('Client IP:', client_ip)

    if 'data' in json and json['data'] == 'User Connected':
        print('User Connected event detected')
    else:
        if json.get('message', '').strip():
            json['user_name'] = json.get('user_name', '') + ':'
            chat_history.append(json)
            send_messages_count()

    send_online_clients_count()
    socketio.emit('my response', json, namespace='/')


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=8080)
