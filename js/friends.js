window.history.pushState({}, '', '/friends');
console.log('/friends');

fetch('/find-friends')
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });