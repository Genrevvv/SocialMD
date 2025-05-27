import { createPostMenu  } from './post-menu.js';
import { parse } from './parse-md.js';

function displayPost(postData) {
    const feed = document.getElementById('feed');
    const date = JSON.parse(postData['date']);
    let imagesData = postData['images'];
    imagesData = typeof imagesData === 'object' ? imagesData : JSON.parse(imagesData);

    const postDOM = document.createElement('div');
    postDOM.classList.add('post');
    postDOM.innerHTML = `<div class="post-header">
                            <div class="user-info">
                                <div class="user-image profile-image"></div>
                                <div class="post-info">
                                    <span class="post-username">${postData['username']}</span>
                                    <div class="post-date">${date['date-ui']}
                                        <span class="hover-date">${date['date-tooltip']}</span>
                                    </div>
                                </div>
                            </div>
                            <i class="post-menu-button fa-solid fa-ellipsis"></i>
                         </div>
                         <div class="md-output post-content">
                            ${parse(postData['caption'], imagesData)}
                         </div>
                         <div class="options">
                            <div class="button">
                                <i class="react-button fa-regular fa-heart"></i>
                                <span>Like</span>
                            </div>
                            <div class="button">
                                <i class="comment-button fa-regular fa-comment"></i>
                                <span>Comment</span>
                            </div>
                         </div>`;

    feed.insertBefore(postDOM, feed.firstChild);

    const profileImage = postData['profile_image'];
    const postProfileImage = postDOM.querySelector('.profile-image');
    postProfileImage.style.backgroundImage = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';

    setTimeout(() => {
        const postMenuButton = postDOM.querySelector('.post-menu-button');
        const postContent = postDOM.querySelector('.post-content');

        createPostMenu(postMenuButton, postDOM, postData, false);

        if (postContent.scrollHeight > postContent.clientHeight) {
            const more = document.createElement('div');
            more.classList.add('more-button');
            more.textContent = '(See more)';

            postContent.appendChild(more);

            more.onclick = () => {
                postContent.style.maxHeight = 'none';
                more.remove();
            }
        }

        if (postData['username'] === sessionStorage.getItem('username')) {
            postProfileImage.addEventListener('changeProfileImage', (e) => {
                postProfileImage.style.backgroundImage = e.detail.profileImageURL;
            });

            createPostMenu(postMenuButton, postDOM, postData, true);
        }

    }, 0); // Delay to allow content rendering
}

export { displayPost };