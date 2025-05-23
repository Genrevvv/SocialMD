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
    const userCard= document.createElement('div');
    userCard.classList.add('user-card');
    userCard.innerHTML = `<div class="user-profile">
                          </div>
                          <div class="user-info">
                            <span class="username">${userData['username']}</span>
                          </div>
                          <div class="options">
                            <div id="confirm-friend-req" class="button">Confirm</div>
                            <div id="delete-friend-req" class="button">Delete</div>
                          </div>`; 

    findFriends.querySelector('.people').appendChild(userCard);
}