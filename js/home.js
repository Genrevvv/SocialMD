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
    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    fetch('/load-feed')
        .then(res => res.json())
        .then(data => {
            if (data['posts'].length === 0) {
                console.log('There are currently no posts.');
                return;
            }

            if (data['hidden_posts'] !== 0) {
                createUnhideAllpostsButton();
            }

            for (let postData of data['posts']) {
                displayPost(feed, postData, postData['profile_image']);
            }
        });
}


let unhideAllPostsButton = null;
let hiddenPostsCount = 0;
function createUnhideAllpostsButton() {
    let unhideAllPostsButton = document.getElementById('unhide-all-posts-button');
    if (unhideAllPostsButton !== null) {
        unhideAllPostsButton.remove();
    }

    const text = hiddenPostsCount === 1
                ? 'Unhide hidden post'
                : 'Unhide hidden posts';
    
    unhideAllPostsButton = document.createElement('div');
    unhideAllPostsButton.id = 'unhide-all-posts-button';
    unhideAllPostsButton.innerHTML = text;

    const feedOptions = document.getElementById('feed-options');
    feedOptions.appendChild(unhideAllPostsButton);

    unhideAllPostsButton.onclick = (e) => {
        unhideAllPostsHandler(e);
        console.log('hiiiii');
    }
}

function unhideAllPostsHandler(e) {
    fetch('/unhide-hidden-posts')
        .then(res => res.json())
        .then(data => {
            if (!data['success']) {
                return;
            }

            // window.location.href = '/friends';
            loadFeed();
            e.target.remove();

            hiddenPostsCount = 0;
        });
}

document.addEventListener('hide-post', (e) => {
    hiddenPostsCount++;
    createUnhideAllpostsButton();
});

export { loadUser };