const form = document.getElementById('form');
const input = {
    username: document.getElementById('username'),
    password: document.getElementById('password')
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = input.username.value;
    const password = input.password.value;

    if (username.length > 0 && password.length > 0) {
        const data = { username, password };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        fetch('/login', options)
            .then(res => res.json())
            .then(data => { 
                console.log(data);
                
                if (data['success']) {
                    window.location.href = '/';                    
                }
            });
    }

});