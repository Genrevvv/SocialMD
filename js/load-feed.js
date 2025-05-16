const feed = document.getElementById('feed');

fetch('/load-feed')
    .then(res => res.json())
    .then(data => {
        console.table(data);
    });