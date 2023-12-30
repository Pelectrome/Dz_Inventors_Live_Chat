from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)

# Keep track of online clients
online_clients = 0

# Load chat history from local storage
chat_history = []


@app.route('/clear_chat', methods=['GET'])
def clear_chat():
    global chat_history
    chat_history = []
    return redirect(url_for('sessions'))


@app.route('/', methods=['GET', 'POST'])
def sessions():
    return render_template('session.html', chat_history=chat_history, online_clients=online_clients)

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('connect')
def handle_connect():
    global online_clients
    online_clients += 1
    send_online_clients_count()

@socketio.on('disconnect')
def handle_disconnect():
    global online_clients
    online_clients -= 1
    send_online_clients_count()

def send_online_clients_count():
    socketio.emit('online_clients_count', {'count': online_clients}, room='')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))

    # Access the client's IP address from the request object
    client_ip = request.environ.get('REMOTE_ADDR')
    print('Client IP:', client_ip)

    # Check if the 'data' key is present in the JSON and its value is 'User Connected'
    if 'data' in json and json['data'] == 'User Connected':
        print('User Connected event detected')
    else:
        if json.get('message', '').strip():
            json['user_name'] = json.get('user_name', '') + ':'
            chat_history.append(json)  # Add new message to chat history
        socketio.emit('my response', json, callback=messageReceived, room='')
    send_online_clients_count()
    socketio.emit('messages_count', {'count': len(chat_history)}, room='')
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=8080)
