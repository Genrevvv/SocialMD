import { displayPost } from "./display-post.js";

window.history.pushState({}, '', '/');
loadUser();
loadFeed();

const homeIcon = document.getElementById('home-icon');
homeIcon.classList.add('selected-page');

function loadUser() {
    fetch('/load-user-data')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            const profileImagesDOM = document.querySelectorAll('.user-image.profile-image');
            
            const profileImage = data['user_data']['profile_image'];
            const imageURL =  `url(${profileImage})`;
            localStorage.setItem('user_profile_image', profileImage);

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
                console.log('There are currently no posts.');
                return;
            }
            
            const feed = document.getElementById('feed');

            for (let postData of data['result']) {
                displayPost(feed, postData, postData['profile_image']);
            }
        });
}


export { loadUser };