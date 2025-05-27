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

function changeProfileImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];

        const fileReader = new FileReader();
        fileReader.onload = () => {
            const imageData = fileReader.result;

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'profile_image': imageData})
            }

            fetch('/update-profile-image', options)
                .then(res => res.json())
                .then(data => {
                    if (!data['success']) {
                        return;
                    }

                    const profileImagesDOM = document.querySelectorAll('.user-image.profile-image');
                    const imageURL = `url(${imageData})`;
                    localStorage.setItem('user_profile_image', imageURL);

                    for (let profileDOM of profileImagesDOM) {
                        profileDOM.style.backgroundImage = imageURL;
                    }

                    const postProfileImages = document.querySelectorAll('#feed .profile-image');
                    const changeProfileImage = new CustomEvent('changeProfileImage', { detail: { profileImageURL: imageURL } });
                    
                    for (let postProfileImage of postProfileImages) {
                        console.log(postProfileImage)
                        postProfileImage.dispatchEvent(changeProfileImage);
                    }
                })
        }

        fileReader.readAsDataURL(file);
    }
    input.click();
}