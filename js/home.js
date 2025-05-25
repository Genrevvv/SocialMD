import { displayPost } from "./display-post.js";

window.history.pushState({}, '', '/');
loadUser();
loadFeed();

function loadUser() {
    fetch('/load-user-data')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            const profileImagesDOM = document.querySelectorAll('.profile-image');
            
            const profileImage = data?.user_data?.profile_image;
            const imageURL = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';
            localStorage.setItem('user_profile_image', imageURL);

            for (let profileDOM of profileImagesDOM) {
                profileDOM.style.backgroundImage = imageURL;
            }
        });
}

function loadFeed() {
    fetch('/load-feed')
        .then(res => res.json())
        .then(data => {
            if (data['result'].length === 0) {
                return;
            }
            
            for (let postData of data['result']) {
                displayPost(postData);
            }
        });
}


