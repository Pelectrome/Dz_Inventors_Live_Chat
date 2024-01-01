from os import name
from flask import Flask, send_from_directory, redirect, url_for, request
from flask_socketio import SocketIO, rooms
import os

app = Flask(__name__, static_folder='.', static_url_path='')

app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app, cors_allowed_origins="*")

# Keep track of online clients
online_clients = 0

# Load chat history from local storage
chat_history = []


""" @app.route('/clear_chat', methods=['GET'])
def clear_chat():
    global chat_history
    chat_history = []
    return redirect(url_for('index')) """

""" # Serve the main index.html for any route that doesn't match a Flask route
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory(app.static_folder, 'index.html') """


@socketio.on('clear_chat')
def handle_clear_chat(data):
    # Replace 'your_password' with the actual password
    if data.get('password') == 'your_password':
        global chat_history
        chat_history = []
        send_messages_count()  # Notify clients about the cleared chat history


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
