import { displayPost } from "./display-post.js";

window.history.pushState({}, '', '/');
loadFeed();

// Set username display
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.username-text').innerText = sessionStorage.getItem('username');
});

function loadFeed() {
    fetch('/load-feed')
        .then(res => res.json())
        .then(data => {
            if (data['result'].length === 0) {
                return;
            }
            
            for (let postData of data['result']) {
                displayPost(postData);
            }
        });
}


