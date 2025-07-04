import { createPostMenu  } from './post-menu.js';
import { createPostOptions } from './post-option.js';
import { parse } from './parse-md.js';

function displayPost(parentDOM, postData, userProfileImage) {
    const date = JSON.parse(postData['date']);
    let imagesData = postData['images'];
    imagesData = typeof imagesData === 'object' ? imagesData : JSON.parse(imagesData);
    postData['profile_image'] = userProfileImage; // Update data when user profile image didn't came from postData

    const postDOM = document.createElement('div');
    postDOM.classList.add('post');
    postDOM.innerHTML = `<div class="post-header">
                            <div class="user-info">
                                <div class="profile-image"></div>
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
                            <div class="button react">
                                <i class="react-button fa-regular fa-heart"></i>
                                <span class="quantity">${ postData['reactions'] !== 0 ? postData['reactions'] : '' }</span>
                            </div>
                            <div class="button comment">
                                <i class="comment-button fa-regular fa-comment"></i>
                                <span class="quantity">${ postData['comments'] !== 0 ? postData['comments'] : '' }</span> 
                            </div>
                         </div>`;

    parentDOM.insertBefore(postDOM, parentDOM.firstChild);

    const postProfileImage = postDOM.querySelector('.profile-image');
    postProfileImage.style.backgroundImage = `url(${postData['profile_image']})`;

    const reactButton  = postDOM.querySelector('.react-button');
    if (postData['reacted'] === 'T') {
        reactButton.className = 'react-button fa-solid fa-heart reacted';
    }
    
    console.log(postData);

    setTimeout(() => {
        const postMenuButton = postDOM.querySelector('.post-menu-button');
        const postContent = postDOM.querySelector('.post-content');

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
            postProfileImage.classList.add('user-image');
            createPostMenu(postMenuButton, postDOM, postData, true);
        }
        else {
            createPostMenu(postMenuButton, postDOM, postData, false);
        }

        createPostOptions(postDOM, postData);

    }, 0); // Delay to allow content rendering
}

export { displayPost };