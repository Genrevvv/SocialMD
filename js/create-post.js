import { parse } from '/utils/parse-md/parse-md.js';

const createPost = document.getElementById('create-post');
let writePostUI = null;

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
                displayPost(postData, JSON.parse(data['date-data']));
                
                writePostUI.remove();
                writePostUI = null;
            });
    }
}

function displayPost(postData, date) {
    const newPost = document.createElement('div');
    newPost.classList.add('post');
    newPost.innerHTML = `<div class="post-header">
                            <div class="profile-img"></div>
                            <div class="user-info">
                                <span class="post-username">${sessionStorage.getItem('username')}</span>
                                <div class="post-date">${date['date-ui']}
                                    <span class="hover-date">${date['date-tooltip']}</span>
                                </div>
                            </div>
                         </div>
                         <div id="md-output" class="post-content">
                            ${parse(postData.caption)}
                         </div>`;

    const feed = document.getElementById('feed');
    feed.insertBefore(newPost, feed.firstChild);
}