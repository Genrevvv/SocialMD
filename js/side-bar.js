// Set username display
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.username-text').innerText = sessionStorage.getItem('username');
});