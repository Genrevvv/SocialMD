import { displayPost } from "./display-post.js";
import { parse } from './parse-md.js';

let commentsUI = null;

function displayComments(postData) {
    if (commentsUI !== null) {
        return;
    }

    console.log('dwdwd');
    commentsUI = document.createElement('div');
    commentsUI.id = 'comments-ui';
    commentsUI.innerHTML = `<div class="header">
                                <h1>${postData['username']}'s Post</h1>
                                <i id="close-comments" class="fa-solid fa-xmark"></i>
                            </div>
                            <div class="content">
                                <div class="post-content">
                                </div>
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

    document.getElementById('main').appendChild(commentsUI);

    const postContent = commentsUI.querySelector('.post-content');
    const closeComments = commentsUI.querySelector('#close-comments');
    const commentProfileImage = commentsUI.querySelector('.user-image.profile-image');
    const submitComment = commentsUI.querySelector('#submit-comment');

    displayPost(postContent, postData);
    commentProfileImage.style.backgroundImage = localStorage.getItem('user_profile_image');

    loadComments(commentsUI, postData);

    closeComments.onclick = () => {
        commentsUI.remove();
        commentsUI = null;
    }

    submitComment.onclick = () => {
        submitCommentHandler(commentsUI, postData);
    }
}

function loadComments(commentsUI, postData) {
    const commentsContainer = commentsUI.querySelector('.comments-container');

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

            for (let commentData of data['result']) {
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
                'comment_text': commentText.value
            }

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
                            </div>`;

    commentsContainer.insertBefore(commentDOM, commentsContainer.firstChild);

    const commentProfileImage = commentDOM.querySelector('.user-image.profile-image');
    commentProfileImage.style.backgroundImage = localStorage.getItem('user_profile_image');
}

export { displayComments };