import { changeProfileImage } from "./side-bar.js";

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
                          <div class="option">Friends</div>`;

    document.getElementById('main').appendChild(mainMenu);

    const changeProfileImageButton = mainMenu.querySelector('.main-menu-change-pfp-option');
    changeProfileImageButton.onclick = () => {
        changeProfileImage();
        maineMenu.remove();
        mainMenu = null
    }
}

export { createMainMenu };