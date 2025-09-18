let stompClient = null;
let currentAccountNumber = null;

function connect() {
    const socket = new SockJS('http://192.168.4.35:8081/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Conectado: ' + frame);
    });
}

connect();

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    currentAccountNumber = document.getElementById('accountNumber').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!currentAccountNumber) return;

    stompClient.subscribe(`/topic/transaction/${currentAccountNumber}`, function(message) {
        if (message.body) {
            const account = JSON.parse(message.body);
            localStorage.setItem('currentAccount', JSON.stringify(account));
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.style.display = 'block';
            document.getElementById('accountNumber').value = '';
            setTimeout(() => { errorMessage.style.display = 'none'; }, 3000);
        }
    });

    stompClient.send(`/app/account-info/${currentAccountNumber}`, {}, null);
});
