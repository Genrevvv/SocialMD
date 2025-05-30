import { displayPost } from "./display-post.js";

let commentsUI = null;

function displayComments(postData) {
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

    displayPost(postContent, postData);

    const profileImage = postData['profile_image'];
    commentProfileImage.style.backgroundImage = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';

    closeComments.onclick = () => {
        commentsUI.remove();
    }
}

export { displayComments };