import { editPostMenu } from './edit-post.js';

let postMenu = null;
let tempButton = null;

function createPostMenu(postMenuButton, postDOM, postData, owner) {
    postMenuButton.onclick = () => {
        if (postMenu !== null) {
            if (postMenuButton === tempButton) {
                postMenu.remove();
                postMenu = null;

                tempButton = null;
                return;
            }

            postMenu.remove();
            postMenu = null;
        }

        tempButton = postMenuButton;

        if (!owner) {
            postMenu = createNonOwnerPostMenu(postDOM)
            return;
        }

        postMenu = createOwnerPostMenu(postDOM, postData);
    }
}

function createOwnerPostMenu(postDOM, postData) {
        postMenu = document.createElement('div');
        postMenu.id = 'post-menu';
        postMenu.innerHTML = `<div class="edit-post option">
                                <i class="fa-solid fa-pen"></i>
                                <span>Edit Post</span>
                             </div>
                             <div class="delete-post option">
                                <i class="fa-solid fa-trash"></i>
                                <span>Delete Post</span>
                             </div>`;

        const postHeader = postDOM.querySelector('.post-header');
        postHeader.appendChild(postMenu);

        // Edit Post
        const editPost = postMenu.querySelector('.edit-post');
        editPost.onclick = () => {
            editPostMenu(postMenu, postDOM, postData);
            tempButton = null;
        }

        // Delete Post
        const deletePost = postMenu.querySelector('.delete-post');
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

        return postMenu;
}

function createNonOwnerPostMenu(postDOM) {
    postMenu = document.createElement('div');
    postMenu.id = 'post-menu';
    postMenu.innerHTML = `<div class="hide-post option">
                            <i class="fa-solid fa-eye-slash"></i>
                            <span>Hide Post</span>
                        </div>`;

    const postHeader = postDOM.querySelector('.post-header');
    postHeader.appendChild(postMenu);

    const hidePost = postMenu.querySelector('.hide-post');
    hidePost.onclick = () => {
        postDOM.remove();
    }

    return postMenu;
}

export { createPostMenu };