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

let unfriendButton = null;
let lastFriendElement = null;
function displayFriend(userData) {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-element');
    friendElement.innerHTML = `<div class="friend-info">
                                <div class="profile"></div>
                                <span class="username">${userData['username']}</span>
                               </div>`;
    
    friendsSection.querySelector('.friend-list').appendChild(friendElement);

    friendElement.onclick = () => {
        if (unfriendButton !== null) {
            if (friendElement === lastFriendElement) {
                unfriendButton.remove();
                unfriendButton = null;
                
                lastFriendElement.classList.remove('highlighted');
                lastFriendElement = null;
                return;
            }

            lastFriendElement.classList.remove('highlighted');
            unfriendButton.remove();
            unfriendButton = null;
        }

        lastFriendElement = friendElement;

        console.log(userData['username']);

        unfriendButton = document.createElement('div');
        unfriendButton.innerHTML = `<div class="unfriend-button">Unfriend</div>`;
        friendElement.classList.toggle('highlighted');

        friendElement.appendChild(unfriendButton);

        unfriendButton.onclick = (e) => {
            e.stopPropagation();

            const options  = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            }

            fetch('/delete-friend-status', options)
                .then(res => res.json())
                .then(data => {
                    if (!data['success']) {
                        return;
                    }
                    
                    console.log(`You've unfriended ${userData['username']}`);
                    friendElement.remove();
                });
        }
    }
}