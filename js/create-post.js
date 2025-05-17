import { parse } from './parse-md.js';

const createPost = document.getElementById('create-post');
let writePostUI = null;
let postMenu = null;

createPost.onclick = () => {    
    if (writePostUI !== null) {
        return;
    }

    writePostUI = document.createElement('div');
    writePostUI.id = 'write-post';
    writePostUI.innerHTML = `<div class="header">
                                <h2>Create post</h2>
                                <i id="cancel-create" class="fa-solid fa-xmark"></i>
                             </div>
                             <div class="post-container">
                                <div id="post-text" contenteditable="true" autofocus></div>
                                <div id="placeholder">Drop some random thoughts...</div>
                             </div>
                             <div id="submit-post">Post</div>`;
        
    document.getElementById('main').appendChild(writePostUI);

    const postText = document.getElementById('post-text'); 
    postText.innerText = '';

    postText.oninput = () => {
        const placeholder = document.getElementById('placeholder');

        if (postText.innerText.trim() === '') {
            placeholder.innerText = 'Drop some random thoughts...';
        }
        else {
            placeholder.innerText = '';
        }
    }
    
    const cancelCreate = document.getElementById('cancel-create');
    cancelCreate.onclick = () => {
        writePostUI.remove()
        writePostUI = null;
    }

    const submitPost = document.getElementById('submit-post');
    submitPost.onclick = () => {
        const postData = {
            caption: document.getElementById('post-text').innerText
        };

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        };

        fetch('/create-post', options)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const postData = data['post_data'];
                console.log(postData);
                console.log(postData['date']);
                console.log(JSON.parse(postData['date']));
                displayPost(postData, JSON.parse(postData['date']));
                
                writePostUI.remove();
                writePostUI = null;
            });
    }
}

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