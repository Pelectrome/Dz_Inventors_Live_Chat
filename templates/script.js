var notificationSound = document.getElementById('notificationSound');
var socket = io.connect('http://' + document.domain + ':' + location.port);

// Variable to store auto scroll status
var autoScrollEnabled = true;

// Function to scroll to the bottom of messages
function autoScrollToBottom() {
    var messageHolder = $('div.message_holder');
    messageHolder.scrollTop(messageHolder[0].scrollHeight);

    // Scroll to the bottom of the page (optional)
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
}

socket.on('connect', function () {
    socket.emit('my event', {
        data: 'User Connected'
    });

    // Trigger auto scroll when a new user connects
    autoScrollToBottom();

    var form = $('form').on('submit', function (e) {
        e.preventDefault();
        
        // Get user input values
        let user_name = $('input.username').val();
        let user_input = $('input.message').val();

        // Check if the message is not empty before emitting
        if (user_input.trim() !== '') {
            socket.emit('my event', {
                user_name: user_name,
                message: user_input
            });

            // Clear the message input field and set focus
            $('input.message').val('').focus();
        } else {
            // Display an alert or take other actions for empty messages
            alert('Please enter a non-empty message.');
        }
    });
});

socket.on('my response', function (msg) {
    console.log(msg);
    // Check if the received message is from a different user
    if (msg.user_name != $('input.username').val() + ':') {
        console.log('playing sound');
        notificationSound.play();
    }

    if (typeof msg.user_name !== 'undefined') {
        var messageHolder = $('div.message_holder');
        messageHolder.append('<div><b style="color: #000">' + msg.user_name + '</b> ' + msg.message + '</div>');

        // Scroll only if auto scroll is enabled
        if (autoScrollEnabled) {
            autoScrollToBottom();
        }
    }
});

socket.on('online_clients_count', function (data) {
    $('#online-clients').text('Online Clients: ' + data.count);
});

socket.on('messages_count', function (data) {
    $('#messages_count').text('Messages : ' + data.count);
});

// Handle the change event of the auto scroll checkbox
$('#autoscroll').change(function () {
    autoScrollEnabled = this.checked;
});