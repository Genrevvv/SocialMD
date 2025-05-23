window.history.pushState({}, '', '/friends');
console.log('/friends');

const findFriends = document.getElementById('find-friends');

fetch('/find-friends')
    .then(res => res.json())
    .then(data => {
        if (data['users'].length <= 0) {
            return;
        }
    
        findFriends.querySelector('.people').querySelector('.placeholder').remove();
        console.log(data['users']);

        for (userData of data['users']) {
            console.log(userData);
            createUserCard(userData);
        }
    });


function createUserCard(userData) {
    const userCard = document.createElement('div');
    userCard.classList.add('user-card');
    userCard.innerHTML = `<div class="user-profile">
                          </div>
                          <div class="user-info">
                            <span class="username">${userData['username']}</span>
                          </div>
                          <div class="options">
                            <div class="add-friend button">Add friend</div>
                            <div class="remove-user button">Remove</div>
                          </div>`; 

    findFriends.querySelector('.people').appendChild(userCard);

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
            console.log(data);

            userCardOptions.innerHTML = `<div class="request-status">Request Sent</div>
                                         <div class="cancel-request button">Cancel</div>`;
            
            const cancelRequest = userCardOptions.querySelector('.cancel-request');
            cancelRequest.onclick = () => {
                cancelRequestHandler(userData, userCard, userCardOptions, options);
            }
        });
}

function cancelRequestHandler(userData, userCard, userCardOptions, options) {
    fetch('/cancel-friend-request', options)
    .then(res => res.json())
    .then(data => {
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