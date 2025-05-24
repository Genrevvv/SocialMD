const friendsSection = document.getElementById('friends-section');

fetch('/get-friends')
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if (data['users'].length === 0) {
            return;
        }

        friendsSection.querySelector('.friend-list').querySelector('.placeholder').remove();
        for (let userData of data['users']) {
            console.log(userData);
            displayFriend(userData);
        }
    });

function displayFriend(userData) {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-element');
    friendElement.innerHTML = `<div class="profile"></div>
                               <span class="username">${userData['username']}</span>`;
    
    friendsSection.querySelector('.friend-list').appendChild(friendElement);
}