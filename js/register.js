const form = document.getElementById('form');
const input = {
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    confirm: document.getElementById('confirm')
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = input.username.value;
    const password = input.password.value;
    const confirm = input.confirm.value;

    if (username.length > 0 && password.length > 0 && confirm.length > 0) {
        const data = { username, password, confirm }
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        fetch('/register', options)
            .then(res => res.json())
            .then(data => {
                console.log(data);

                if (!data['success']) {
                    document.getElementById('message').innerHTML = data['error'];
                    return;
                }

                window.location.href = '/html/login.html'
            });
    }
});