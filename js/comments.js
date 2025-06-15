import { createCommentMenu } from "./comment-menu.js";
import { displayPost } from "./display-post.js";
import { parse } from './parse-md.js';
import { recreatePostMenu } from "./edit-post.js";

let commentsUI = null;

function displayComments(postData, postDOM) { 
    if (commentsUI !== null) {
        return;
    }

    commentsUI = document.createElement('div');
    commentsUI.id = 'comments-ui';
    commentsUI.innerHTML = `<div class="header">
                                <h1>${postData['username']}'s Post</h1>
                                <i id="close-comments" class="fa-solid fa-xmark"></i>
                            </div>
                            <div class="content">
                                <div class="post-content">
                                </div>
                                <div id="comment-options"></div>
                                <div class="comments-container">
                                </div>
                            </div>
                            <div class="comment-input-bar">
                                <div class="user-image profile-image"></div>
                                <div class="comment-text-container">
                                    <textarea id="comment-text" placeholder="Drop a comment"></textarea>
                                </div>
                                <div class="submit-comment-container">
                                    <div id="submit-comment">Post</div>
                                </div>
                            </div>`;

    const uiBlock = document.createElement('div');
    uiBlock.id = 'ui-block';
    uiBlock.appendChild(commentsUI);

    document.getElementById('main').appendChild(uiBlock);
    document.body.style.overflowY = 'hidden'; // Prevent user from scrolling

    const commentText = commentsUI.querySelector('#comment-text');
    const postContent = commentsUI.querySelector('.post-content');
    const closeComments = commentsUI.querySelector('#close-comments');
    const commentProfileImage = commentsUI.querySelector('.user-image.profile-image');
    const submitComment = commentsUI.querySelector('#submit-comment');

    commentText.focus();
    
    displayPost(postContent, postData, postData['profile_image']);
    commentProfileImage.style.backgroundImage = `url(${localStorage.getItem('user_profile_image')})`;

    loadComments(commentsUI, postData);

    commentsUI.addEventListener('update-post', (e) => {
        console.log('The post is updated :)');
        console.log(e.detail);

        const postContent = postDOM.querySelector('.post-content');
        postContent.innerHTML = parse(postData['caption'], postData['images']);
        
        // e.detail is the updated postData object of the post
        recreatePostMenu(e.detail, postDOM); 
    });

    commentsUI.addEventListener('delete-post', () => {
        document.body.style.overflowY = 'auto';
        uiBlock.remove();

        commentsUI = null;  

        postDOM.remove();
    });

    commentsUI.addEventListener('hide-post', () => {
        document.body.style.overflowY = 'auto';
        uiBlock.remove();

        commentsUI = null;  

        postDOM.remove();
    });

    closeComments.onclick = () => {
        document.body.style.overflowY = 'auto';
        uiBlock.remove();

        commentsUI = null;
    }

    submitComment.onclick = () => {
        submitCommentHandler(commentsUI, postData);
    }
}

function loadComments(commentsUI, postData) {
    hiddenCommentsCount = 0; // Reset hidden comments count

    document.addEventListener('hide-comment', (e) => {
        hiddenCommentsCount++;
        createUnhideAllCommentsButton(postData);
    });

    const commentsContainer = commentsUI.querySelector('.comments-container');
    commentsContainer.innerHTML = '';

    const data = { 'post_id': postData['post_id'] }
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)

    }

    fetch('/load-comments', options)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data['comments'].length === 0) {
                console.log('This post have no comment');
                return;
            }

            if (data['hidden_comments'] !== 0) {
                hiddenCommentsCount = data['hidden_comments'];
                createUnhideAllCommentsButton(postData);
            }

            for (let commentData of data['comments']) {
                console.log(commentData);
                displayComment(commentsContainer, commentData);  
            }
        });
}

function submitCommentHandler(commentsUI, postData) {
    const commentText = commentsUI.querySelector('#comment-text');
    const commentsContainer = commentsUI.querySelector('.comments-container');

    const data = {
        'post_id': postData['post_id'],
        'comment_text': commentText.value
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    fetch('/create-comment', options)
        .then(res => res.json())
        .then(data => {
            if (!data['success']) {
                return;
            }

            const commentData = {
                'username': sessionStorage.getItem('username'),
                'date': data['data']['date'],
                'comment_text': commentText.value,
                'profile_image': localStorage.getItem('user_profile_image'),
                'comment_id': data['data']['comment_id']
            }

            console.log(commentData);
            displayComment(commentsContainer, commentData);
            commentText.value = '';
        })
}

function displayComment(commentsContainer, commentData) {
    const commentDOM = document.createElement('div');
    commentDOM.classList.add('comment');
    commentDOM.innerHTML = `<div class="user-image profile-image"></div>
                            <div class="content">
                                <div class="info-data">
                                    <span class="username">${commentData['username']}</span>
                                    <span class="date">${commentData['date']}</span>
                                </div>
                                <div class="md-output comment-content">
                                    ${parse(commentData['comment_text'])}
                                </div>
                            </div>
                            <i class="comment-menu-button fa-solid fa-ellipsis"></i>`;

    commentsContainer.insertBefore(commentDOM, commentsContainer.firstChild);
    createCommentMenu(commentDOM, commentData);

    const commentProfileImage = commentDOM.querySelector('.user-image.profile-image');
    commentProfileImage.style.backgroundImage = `url(${commentData['profile_image']})`;
}

let unhideAllCommentsButton = null;
let hiddenCommentsCount = 0;
function createUnhideAllCommentsButton(postData) {
    let unhideAllCommentsButton = document.getElementById('unhide-all-comments-button');
    if (unhideAllCommentsButton !== null) {
        unhideAllCommentsButton.remove();
    }

    const text = hiddenCommentsCount === 1
                ? 'Unhide hidden comment'
                : 'Unhide hidden comments';
    
    unhideAllCommentsButton = document.createElement('div');
    unhideAllCommentsButton.id = 'unhide-all-comments-button';
    unhideAllCommentsButton.innerHTML = text;

    const commentOptions = document.getElementById('comment-options');
    commentOptions.appendChild(unhideAllCommentsButton);

    unhideAllCommentsButton.onclick = (e) => {
        unhideAllCommentsHandler(e, postData);
    }
}

function unhideAllCommentsHandler(e, postData) {
    const data = { post_id: postData['post_id'] };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }
    
    fetch('/unhide-hidden-comments', options)
        .then(res => res.json())
        .then(data => {
            if (!data['success']) {
                return;
            }

            loadComments(commentsUI, postData);

            e.target.remove();

            hiddenCommentsCount = 0;
        });
}

export { displayComments };