import { changeProfileImage } from "./auxiliary.js";

// Set username display
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.username-text').innerText = sessionStorage.getItem('username');
});

const sideBar = document.getElementById('side-bar');
const userInfo = sideBar.querySelector('.user-info');

let imageButton = null;
let lastImageButton = null;
userInfo.onclick = () => {
    if (imageButton !== null) {
        if (imageButton === lastImageButton) {
            imageButton.remove();
            imageButton = null;

            userInfo.classList.remove('highlighted');
            lastImageButton = null;
            return;
        }

        userInfo.classList.remove('highlighted');
        imageButton.remove();
        imageButton = null;
    }

    imageButton = document.createElement('i');
    imageButton.classList.add('change-profile-image', 'fa-solid', 'fa-camera');
    userInfo.classList.toggle('highlighted');

    lastImageButton  = imageButton;

    userInfo.appendChild(imageButton);

    imageButton.onclick = (e) => {
        e.stopPropagation();
        changeProfileImage();
    }
}
