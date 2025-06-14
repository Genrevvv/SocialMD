import { displayFriend } from "./auxiliary.js";

let myFriendsMenu = null;

function createMyFriendsMenu() {
    console.log('my-friends');

    if (myFriendsMenu !== null) {
        myFriendsMenu.remove();
        myFriendsMenu = null;
        return;
    }

    myFriendsMenu = document.createElement('div');
    myFriendsMenu.id = 'my-friends-menu';
    myFriendsMenu.innerHTML = `<div class="header">
                                <h2>My Friends</h2>
                                <i id="close-ui" class="fa-solid fa-xmark"></i>
                               </div>
                               <div class="friend-list">
                                    <span class="placeholder">Your friends will display here</span>
                               </div>`;

    const uiBlock = document.createElement('div');
    uiBlock.id = 'ui-block';
    uiBlock.appendChild(myFriendsMenu);

    document.getElementById('main').appendChild(uiBlock);
    document.body.style.overflowY = 'hidden'; // Prevent user from scrolling

    const closeUI = document.getElementById('close-ui');
    closeUI.onclick = () => {
        document.body.style.overflowY = 'auto';
        uiBlock.remove();

        myFriendsMenu = null;
    }

    fetch('/get-friends')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data['users'].length === 0) {
                return;
            }

            const friendListContainer = myFriendsMenu.querySelector('.friend-list');
            friendListContainer.querySelector('.placeholder').remove();

            for (let userData of data['users']) {
                console.log(userData);
                displayFriend(userData, friendListContainer);
            }
        });
}

export { createMyFriendsMenu };