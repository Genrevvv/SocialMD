window.history.pushState({}, '', '/friends');
console.log('/friends');

const friendsIcon = document.getElementById('friends-icon');
friendsIcon.classList.add('selected-page');

const friendRequests = document.getElementById('friend-requests');
fetch('/friend-requests')
    .then(res => res.json())
    .then(data => {
        if (data['users'].length === 0) {
            return;
        }

        friendRequests.querySelector('.people').querySelector('.placeholder').remove();
        for (let userData of data['users']) {
            console.log(userData);
            createFriendRequestUserCard(userData);
        }

    });

const findFriends = document.getElementById('find-friends');
fetch('/find-friends')
    .then(res => res.json())
    .then(data => {
        if (data['users'].length === 0) {
            return;
        }
    
        findFriends.querySelector('.people').querySelector('.placeholder').remove();
        for (userData of data['users']) {
            console.log(userData);
            createUserCard(userData);
        }
    });


function createFriendRequestUserCard(userData) {
    const userCard = document.createElement('div');
    userCard.classList.add('user-card');
    userCard.innerHTML = `<div class="user-profile"></div>
                          <div class="user-info">
                            <span class="username">${userData['username']}</span>
                          </div>
                          <div class="options">
                            <div class="confirm-friend-request button">Confirm</div>
                            <div class="delete-friend-request button">Delete</div>
                          </div>`; 

    friendRequests.querySelector('.people').appendChild(userCard);

    const profileImage = userData['profile_image'];
    const userProfileImage = userCard.querySelector('.user-profile');
    userProfileImage.style.backgroundImage = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';

    const userCardOptions = userCard.querySelector('.options');
    const confirmFriendRequest = userCardOptions.querySelector('.confirm-friend-request');
    const deleteFriendRequest = userCardOptions.querySelector('.delete-friend-request');

    confirmFriendRequest.onclick = () => {
        confirmFriendRequestHandler(userData, userCardOptions);
    }

    deleteFriendRequest.onclick = () => {
        deleteFriendRequestHandler(userData, userCard);
    }
}

function createUserCard(userData) {
    const userCard = document.createElement('div');
    userCard.classList.add('user-card');
    userCard.innerHTML = `<div class="user-profile"></div>
                          <div class="user-info">
                            <span class="username">${userData['username']}</span>
                          </div>
                          <div class="options">
                            <div class="add-friend button">Add friend</div>
                            <div class="remove-user button">Remove</div>
                          </div>`; 

    findFriends.querySelector('.people').appendChild(userCard);
    const profileImage = userData['profile_image'];
    const userProfileImage = userCard.querySelector('.user-profile');
    userProfileImage.style.backgroundImage = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';
    
    const userCardOptions = userCard.querySelector('.options');
    const addFriend = userCardOptions.querySelector('.add-friend');
    const removeUser = userCardOptions.querySelector('.remove-user');

    addFriend.onclick = () => {
        addFriendHandler(userData, userCard, userCardOptions);
    }

    removeUser.onclick = () => {
        userCard.remove();
    }
}

function deleteFriendRequestHandler(userData, userCard) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }    
    
    fetch('/delete-friend-status', options)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            if (!data['success']) {
                return;
            }
            
            userCard.remove();
        });
}

function confirmFriendRequestHandler(userData, userCardOptions) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }

    fetch('/accept-friend-request', options)
        .then(res => res.json())
        .then(data => {
            if (!data['success']) {
                return;
            }

            userCardOptions.innerHTML = `<div class="message">You are now friends with ${userData['username']}</div>
                                         <div class="request-accepted button">Request Accepted</div>`;
        });
}

function addFriendHandler(userData, userCard, userCardOptions) {
    console.log('You\'ve added ' + userData['username']);
        
    const options  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }

    fetch('/add-friend', options)
        .then(res => res.json())
        .then(data => {
            if (!data['success']) {
                return;
            }

            userCardOptions.innerHTML = `<div class="request-status">Request Sent</div>
                                         <div class="cancel-request button">Cancel</div>`;
            
            const cancelRequest = userCardOptions.querySelector('.cancel-request');
            cancelRequest.onclick = () => {
                cancelRequestHandler(userData, userCard, userCardOptions, options);
            }
        });
}

function cancelRequestHandler(userData, userCard, userCardOptions, options) {
fetch('/delete-friend-status', options)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if (!data['success']) {
            return;
        }

        userCardOptions.innerHTML = `<div class="add-friend button">Add friend</div>
                                        <div class="remove-user button">Remove</div>`;

        const addFriend = userCardOptions.querySelector('.add-friend');
        addFriend.onclick = () => {
        addFriendHandler(userData, userCard, userCardOptions);
        }

        const removeUser = userCardOptions.querySelector('.remove-user');
        removeUser.onclick = () => {
            userCard.remove();
        }
    });
}