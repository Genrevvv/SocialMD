import { changeProfileImage } from "./auxiliary.js";
import { createMyFriendsMenu } from "./my-friends.js";

let mainMenu = null;

function createMainMenu() {
    console.log('hi');

    if (mainMenu !== null) {
        mainMenu.remove();
        mainMenu = null;
        return;
    }

    mainMenu = document.createElement('div');
    mainMenu.id = 'main-menu';
    mainMenu.innerHTML = `<div class="option main-menu-change-pfp-option">Change Profile Image</div>
                          <div class="option main-menu-my-friends">My Friends</div>`;

    document.getElementById('main').appendChild(mainMenu);

    const changeProfileImageButton = mainMenu.querySelector('.main-menu-change-pfp-option');
    changeProfileImageButton.onclick = () => {
        changeProfileImage();
        mainMenu.remove();
        mainMenu = null
    }

    const myFriendsButton = mainMenu.querySelector('.main-menu-my-friends');
    myFriendsButton.onclick = () => {
        createMyFriendsMenu();
        mainMenu.remove();
        mainMenu = null
    } 

}

export { createMainMenu };