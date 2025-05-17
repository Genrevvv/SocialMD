import { parse } from './parse-md.js';

let postMenu = null;

const feed = document.getElementById('feed');
fetch('/load-feed')
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) {
            return;
        }
        
        for (let postData of data) {
            displayPost(postData, JSON.parse(postData['date']));
        }
    });


function displayPost(postData, date) {
    const newPost = document.createElement('div');
    newPost.classList.add('post');
    newPost.innerHTML = `<div class="post-header">
                            <div class="user-info">
                                <div class="profile-img"></div>
                                <div class="post-info">
                                    <span class="post-username">${postData['username']}</span>
                                    <div class="post-date">${date['date-ui']}
                                        <span class="hover-date">${date['date-tooltip']}</span>
                                    </div>
                                </div>
                            </div>
                            <i class="post-menu-button fa-solid fa-ellipsis"></i>
                         </div>
                         <div id="md-output" class="post-content">
                            ${parse(postData['caption'])}
                         </div>`;

    feed.insertBefore(newPost, feed.firstChild);

    const postMenuButton = newPost.querySelector('.post-menu-button');    
    postMenuButton.onclick = () => {
        if (postMenu !== null) {
            postMenu.remove();
            postMenu = null;
        }

        postMenu = document.createElement('div');
        postMenu.id = 'post-menu';
        postMenu.innerHTML = `<div id="delete-post" class="option">
                                <i class="fa-solid fa-trash"></i>
                                <span>Delete Post</span>
                              </div>`;

        const postHeader = newPost.querySelector('.post-header');
        postHeader.appendChild(postMenu);

        const deletePost = document.getElementById('delete-post');
        deletePost.onclick = () => {
            const postID = {
                post_id: postData['post_id']
            };

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postID)
            };

            fetch('/delete-post', options)
                .then(res => res.json())
                .then(data => {
                    if (data['success']) {
                        newPost.remove();
                    }
                });
        }
    }
    
    const postContent = newPost.querySelector('.post-content');

    if (postContent.scrollHeight > postContent.clientHeight) {
        postContent.classList.add('truncate'); 

        const more = document.createElement('div');
        more.classList.add('more-button');
        more.textContent = '(See more)';

        postContent.appendChild(more);

        more.onclick = () => {
            postContent.style.maxHeight = 'none';
            more.remove();
        }
    }

}