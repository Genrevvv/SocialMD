import { displayFriend } from "./auxiliary.js";

const friendsSection = document.getElementById('friends-section');
fetch('/get-friends')
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if (data['users'].length === 0) {
            return;
        }
        
        const friendListContainer = friendsSection.querySelector('.friend-list');
        friendListContainer.querySelector('.placeholder').remove();
        
        for (let userData of data['users']) {
            console.log(userData);
            displayFriend(userData, friendListContainer);
        }
    });
